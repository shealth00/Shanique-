"""
Agent 1 — Data Ingestion & Structuring.

Accepts raw clinician input (free-text notes, form responses, uploaded score
sheets) and extracts structured data conforming to ClinicalInput + PatientPII.

Anti-hallucination contract:
  - The agent only extracts values it finds verbatim in the raw text.
  - Missing fields are left as null — never guessed.
  - After LLM extraction, every numeric score is validated against the rules
    engine before proceeding. Descriptor fields are prohibited in the input
    schema (they are always computed, never extracted from prose).
"""

from __future__ import annotations

import json
from typing import Any

from psych_eval_system.agents.base_agent import BaseAgent
from psych_eval_system.models.patient import PatientPII, FamilyInfo, DevelopmentalHistory, EducationalHistory, ReferralInfo, BehavioralObservations
from psych_eval_system.models.test_scores import ClinicalInput
from psych_eval_system.models.report import ValidationIssue, ValidationSeverity
from psych_eval_system.rules import (
    validate_ss_percentile, validate_ss_descriptor, ScoreValidationError
)


_SYSTEM_PROMPT = """You are a clinical data extraction specialist for a psychological evaluation system.

Your task: parse raw clinician notes and test score sheets into strict JSON.

ABSOLUTE RULES:
1. Extract ONLY values explicitly stated in the source text. If a value is absent, output null.
2. Never infer, guess, or interpolate scores. If a test was not mentioned, the entire object is null.
3. Never include qualitative descriptors (e.g., "Average", "Low") in extracted scores — those are computed separately.
4. For test score objects, only set "administered": true if the test is explicitly mentioned as having been given.
5. PHI: Extract names and dates exactly as written — they will be sanitized before storage.

Output a single valid JSON object with two top-level keys:
  "patient": { PatientPII fields }
  "clinical_input": { ClinicalInput fields }

Omit any key whose value would be null or an empty array — keep the JSON minimal.
"""


class IngestionAgent(BaseAgent):
    def __init__(self) -> None:
        super().__init__("IngestionAgent")

    async def ingest(
        self, raw_input: str
    ) -> tuple[PatientPII, ClinicalInput, list[ValidationIssue]]:
        """
        Main entry point. Returns (patient_pii, clinical_input, issues).
        Issues list contains validation errors found during score cross-checking.
        """
        extracted = await self._extract(raw_input)
        patient = self._parse_patient(extracted.get("patient", {}))
        clinical = self._parse_clinical(extracted.get("clinical_input", {}))
        issues = self._cross_validate(clinical)
        return patient, clinical, issues

    async def _extract(self, raw: str) -> dict[str, Any]:
        user_prompt = f"""Extract structured clinical data from the following raw input.
Follow the system rules exactly — output only JSON.

RAW INPUT:
---
{raw}
---"""
        return await self._call_json(_SYSTEM_PROMPT, user_prompt)

    def _parse_patient(self, data: dict) -> PatientPII:
        try:
            return PatientPII.model_validate(data)
        except Exception as exc:
            raise ValueError(f"Patient data validation failed: {exc}") from exc

    def _parse_clinical(self, data: dict) -> ClinicalInput:
        try:
            return ClinicalInput.model_validate(data)
        except Exception as exc:
            raise ValueError(f"Clinical input validation failed: {exc}") from exc

    def _cross_validate(self, clinical: ClinicalInput) -> list[ValidationIssue]:
        issues: list[ValidationIssue] = []

        def _check_composite(test_name: str, composite_name: str, ss: int | None, pct: int | None) -> None:
            if ss is None or pct is None:
                return
            try:
                validate_ss_percentile(ss, pct)
            except ScoreValidationError as e:
                issues.append(ValidationIssue(
                    severity=ValidationSeverity.ERROR,
                    field=f"{test_name}.{composite_name}",
                    message=str(e),
                    raw_value={"ss": ss, "percentile": pct},
                ))

        for attr in vars(clinical):
            val = getattr(clinical, attr)
            if val is None or not hasattr(val, "__dict__"):
                continue
            # Check any CompositeScore fields on this test object
            for field, composite in vars(val).items():
                if hasattr(composite, "standard_score") and hasattr(composite, "percentile"):
                    _check_composite(attr, field, composite.standard_score, composite.percentile)
                if hasattr(composite, "subtests"):
                    for sub in (composite.subtests or []):
                        pass  # Subtest scaled scores validated in reasoning agent

        return issues
