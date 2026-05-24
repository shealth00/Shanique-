"""
Agent 4 — Quality Control & Anti-Hallucination.

Independent LLM pass that:
  1. Receives the raw (anonymized) input AND the drafted report.
  2. Extracts every factual claim in the draft.
  3. For each claim, determines whether it is grounded in the input data.
  4. Validates score↔descriptor alignment using the rules engine.
  5. Returns a structured QCResult with pass/fail and specific issues.

This agent is run AFTER drafting. If QCResult.passed is False, the pipeline
does NOT produce a final report — it returns the issues to the caller.
"""

from __future__ import annotations

import json
from typing import Any

from psych_eval_system.agents.base_agent import BaseAgent
from psych_eval_system.models.patient import PatientAnonymized
from psych_eval_system.models.test_scores import ClinicalInput
from psych_eval_system.models.report import (
    FullReport, QCResult, ValidationIssue, ValidationSeverity
)
from psych_eval_system.rules import (
    ss_to_descriptor, scaled_to_descriptor, tscore_to_descriptor,
    ss_to_percentile, ScoreValidationError,
)


_QC_SYSTEM = """You are an independent quality control reviewer for a psychological evaluation report system.

Your job is to detect hallucinations — claims in the report that cannot be traced to the source data.

You will receive:
  SOURCE: The anonymized structured input data (ground truth).
  REPORT: The drafted report text.

For each factual claim in the REPORT, determine:
  1. Is this claim present in SOURCE? (verified / unverified / fabricated)
  2. If the claim references a score and descriptor, do they match?

Output a JSON object with this schema:
{
  "total_claims_checked": <int>,
  "verified_claims": <int>,
  "unverified_claims": ["..."],
  "fabricated_scores": ["..."],
  "descriptor_mismatches": ["..."],
  "missing_data_flags": ["..."],
  "overall_notes": "..."
}

Be strict. If a descriptor (e.g., "Average") appears next to a score but the score maps to a
different descriptor, list it in descriptor_mismatches.
If the report mentions a test that is not in SOURCE as administered, list that in fabricated_scores.
"""


class QCAgent(BaseAgent):
    def __init__(self) -> None:
        super().__init__("QCAgent")

    async def review(
        self,
        patient: PatientAnonymized,
        clinical: ClinicalInput,
        report: FullReport,
    ) -> QCResult:
        # Rule-based checks first (no LLM needed — fast, deterministic)
        rule_issues = self._rule_based_checks(clinical, report)

        # LLM cross-reference check
        source_summary = self._build_source_summary(patient, clinical)
        llm_result = await self._llm_cross_reference(source_summary, report.draft_markdown)

        # Merge
        passed = (
            len(rule_issues) == 0
            and len(llm_result.get("fabricated_scores", [])) == 0
            and len(llm_result.get("descriptor_mismatches", [])) == 0
        )

        qc = QCResult(
            passed=passed,
            total_claims_checked=llm_result.get("total_claims_checked", 0),
            verified_claims=llm_result.get("verified_claims", 0),
            unverified_claims=llm_result.get("unverified_claims", []),
            fabricated_scores=llm_result.get("fabricated_scores", []) + [i.message for i in rule_issues if i.severity == ValidationSeverity.ERROR],
            descriptor_mismatches=llm_result.get("descriptor_mismatches", []),
            missing_data_flags=llm_result.get("missing_data_flags", []),
            overall_notes=llm_result.get("overall_notes", ""),
        )

        report.qc_result = qc
        if passed:
            report.final_markdown = report.draft_markdown
            report.ready_for_clinician_review = True

        return qc

    # ------------------------------------------------------------------
    # Rule-based checks — deterministic, no LLM
    # ------------------------------------------------------------------

    def _rule_based_checks(
        self, clinical: ClinicalInput, report: FullReport
    ) -> list[ValidationIssue]:
        issues: list[ValidationIssue] = []

        for section in report.sections:
            # Detect common hallucination patterns
            issues.extend(self._check_for_invented_test_names(section.content, clinical))

        # Cross-check each ScoreInterpretation against the rules engine
        for interp in report.score_interpretations:
            if interp.standard_score is not None:
                try:
                    expected = ss_to_descriptor(interp.standard_score)
                    if expected.value.lower() != interp.descriptor.lower():
                        issues.append(ValidationIssue(
                            severity=ValidationSeverity.ERROR,
                            field=f"{interp.test_name}.{interp.composite_name}",
                            message=(
                                f"Descriptor mismatch: SS={interp.standard_score} should be "
                                f"'{expected.value}' but interpretation says '{interp.descriptor}'"
                            ),
                        ))
                except (ValueError, ScoreValidationError) as e:
                    issues.append(ValidationIssue(
                        severity=ValidationSeverity.ERROR,
                        field=f"{interp.test_name}.{interp.composite_name}",
                        message=str(e),
                    ))

            if interp.standard_score is not None and interp.percentile is not None:
                try:
                    from psych_eval_system.rules import validate_ss_percentile
                    validate_ss_percentile(interp.standard_score, interp.percentile)
                except ScoreValidationError as e:
                    issues.append(ValidationIssue(
                        severity=ValidationSeverity.ERROR,
                        field=f"{interp.test_name}.{interp.composite_name}",
                        message=str(e),
                    ))

        report.validation_issues.extend(issues)
        return issues

    _KNOWN_TESTS = {
        "WISC-V", "WPPSI-IV", "WAIS-5", "RIAS-2", "SB-5", "KABC-II",
        "WJ IV COG", "WJ IV ECAD", "WNV", "PTONI", "CTONI-2", "BRACKEN",
        "KTEA-3", "WIAT-4", "WJ IV ACH", "BDI-2", "DP-4", "VINELAND",
        "ABAS-3", "ADOS-2", "CARS-2", "SRS-2", "GARS-3", "SCQ",
        "BASC-3", "BRIEF", "MCHAT-R", "ADHD-V",
    }

    def _check_for_invented_test_names(
        self, content: str, clinical: ClinicalInput
    ) -> list[ValidationIssue]:
        issues = []
        administered = set(clinical.administered_tests())
        content_upper = content.upper()
        for test in self._KNOWN_TESTS:
            if test in content_upper:
                # Map test name to clinical input field
                field_map = {
                    "WISC-V": "wisc_v", "WPPSI-IV": "wppsi_iv", "WAIS-5": "wais_v",
                    "RIAS-2": "rias_2", "SB-5": "sb5", "KABC-II": "kabc_ii",
                    "WJ IV COG": "wj_iv_cog", "WJ IV ECAD": "wj_iv_ecad",
                    "WNV": "wnv", "PTONI": "ptoni", "CTONI-2": "ctoni_2",
                    "KTEA-3": "ktea_3", "WIAT-4": "wiat_4", "WJ IV ACH": "wj_iv_ach",
                    "BDI-2": "bdi_2", "DP-4": "dp_4", "VINELAND": "vineland",
                    "ABAS-3": "abas_3_parent", "ADOS-2": "ados_2", "CARS-2": "cars_2",
                    "SRS-2": "srs_2_parent", "GARS-3": "gars_3_parent",
                    "BASC-3": "basc3_parent", "BRIEF": "brief",
                }
                field = field_map.get(test)
                if field and field not in administered:
                    test_obj = getattr(clinical, field, None)
                    if test_obj is None or not test_obj.administered:
                        issues.append(ValidationIssue(
                            severity=ValidationSeverity.ERROR,
                            field=f"section.content",
                            message=f"Report mentions {test} but it was not marked as administered in input data.",
                        ))
        return issues

    # ------------------------------------------------------------------
    # LLM cross-reference
    # ------------------------------------------------------------------

    def _build_source_summary(
        self, patient: PatientAnonymized, clinical: ClinicalInput
    ) -> str:
        administered = clinical.administered_tests()
        summary = {
            "patient_age": f"{patient.age_years}y {patient.age_months}m",
            "gender": patient.gender,
            "referral_concerns": patient.referral_info.primary_concerns,
            "administered_tests": administered,
            "developmental_history_summary": {
                "first_word_months": patient.developmental_history.first_word_months,
                "walking_months": patient.developmental_history.walking_months,
                "current_language": patient.developmental_history.current_language_level,
            },
        }
        # Include scores for each administered test
        for attr in administered:
            test_obj = getattr(clinical, attr, None)
            if test_obj:
                summary[attr] = json.loads(test_obj.model_dump_json())
        return json.dumps(summary, default=str, indent=2)

    async def _llm_cross_reference(
        self, source_summary: str, draft: str
    ) -> dict:
        user = f"""SOURCE DATA (ground truth):
```json
{source_summary}
```

REPORT DRAFT:
---
{draft[:6000]}
---

Review every factual claim in the REPORT DRAFT against the SOURCE DATA.
Output the JSON review object exactly as specified."""
        return await self._call_json(_QC_SYSTEM, user, max_tokens=2048)
