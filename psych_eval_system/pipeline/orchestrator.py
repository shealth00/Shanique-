"""
Async pipeline orchestrator.

Execution DAG:
  [raw input]
      │
      ▼
  IngestionAgent ──► (PatientPII, ClinicalInput, ingestion_issues)
      │
      ▼ (PII sanitized → PatientAnonymized)
      │
      ├──► ReasoningAgent ──► (interpretations, diagnostic_flags, reasoning_issues)
      │
      ▼
  DraftingAgent ──► FullReport (draft)
      │
      ▼
  QCAgent ──► QCResult
      │
      ├── PASS ──► DocxExporter ──► .docx (PII restored)
      └── FAIL ──► PipelineResult with issues list
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

from psych_eval_system.agents import IngestionAgent, ReasoningAgent, DraftingAgent, QCAgent
from psych_eval_system.models.patient import PatientPII, PatientAnonymized
from psych_eval_system.models.test_scores import ClinicalInput
from psych_eval_system.models.report import FullReport, QCResult, ValidationIssue
from psych_eval_system.utils.pii_sanitizer import PIISanitizer
from psych_eval_system.utils.docx_exporter import DocxExporter


@dataclass
class PipelineResult:
    success: bool
    report: Optional[FullReport] = None
    docx_path: Optional[Path] = None
    validation_issues: list[ValidationIssue] = field(default_factory=list)
    error: Optional[str] = None

    @property
    def qc_passed(self) -> bool:
        return self.report is not None and self.report.qc_result is not None and self.report.qc_result.passed


class PipelineOrchestrator:
    def __init__(self) -> None:
        self._ingestion = IngestionAgent()
        self._reasoning = ReasoningAgent()
        self._drafting = DraftingAgent()
        self._qc = QCAgent()

    async def run_from_raw(self, raw_input: str, output_dir: Path) -> PipelineResult:
        """Full pipeline: raw text → .docx report."""
        try:
            # Stage 1: Ingest
            patient_pii, clinical, ingest_issues = await self._ingestion.ingest(raw_input)
            if any(i.severity == "error" for i in ingest_issues):
                return PipelineResult(
                    success=False,
                    validation_issues=ingest_issues,
                    error="Ingestion validation errors — see validation_issues.",
                )

            return await self._run_from_structured(patient_pii, clinical, output_dir)

        except Exception as exc:
            return PipelineResult(success=False, error=str(exc))

    async def run_from_structured(
        self,
        patient_pii: PatientPII,
        clinical: ClinicalInput,
        output_dir: Path,
    ) -> PipelineResult:
        """Pipeline starting from already-structured data (skips LLM ingestion)."""
        return await self._run_from_structured(patient_pii, clinical, output_dir)

    async def _run_from_structured(
        self,
        patient_pii: PatientPII,
        clinical: ClinicalInput,
        output_dir: Path,
    ) -> PipelineResult:
        run_id = f"PT_{patient_pii.last_name[:3].upper()}_{patient_pii.birth_date.strftime('%Y')}"

        # PII firewall
        sanitizer = PIISanitizer(patient_pii, run_id=run_id)
        patient_anon = PatientAnonymized.from_pii(patient_pii, token=run_id)

        # Stage 2: Reason (CPU-bound rules engine, no I/O — runs synchronously inside async)
        interpretations, flags, reason_issues = await self._reasoning.reason(
            patient_anon, clinical
        )

        if any(i.severity == "error" for i in reason_issues):
            return PipelineResult(
                success=False,
                validation_issues=reason_issues,
                error="Score validation errors — see validation_issues.",
            )

        # Stage 3: Draft
        report = await self._drafting.draft(patient_anon, clinical, interpretations, flags)
        report.validation_issues.extend(reason_issues)

        # Stage 4: QC
        qc_result = await self._qc.review(patient_anon, clinical, report)

        all_issues = report.validation_issues + (
            [ValidationIssue(severity="error", field="qc", message=m)
             for m in qc_result.fabricated_scores + qc_result.descriptor_mismatches]
        )

        if not qc_result.passed:
            return PipelineResult(
                success=False,
                report=report,
                validation_issues=all_issues,
                error=(
                    f"QC failed: {len(qc_result.fabricated_scores)} fabricated claim(s), "
                    f"{len(qc_result.descriptor_mismatches)} descriptor mismatch(es). "
                    "See report.qc_result for details."
                ),
            )

        # Stage 5: Export
        output_dir.mkdir(parents=True, exist_ok=True)
        filename = f"{patient_pii.last_name}_{patient_pii.first_name}_PsychEval.docx"
        docx_path = output_dir / filename

        exporter = DocxExporter(patient_pii, sanitizer)
        exporter.export(report, docx_path)

        return PipelineResult(
            success=True,
            report=report,
            docx_path=docx_path,
            validation_issues=all_issues,
        )
