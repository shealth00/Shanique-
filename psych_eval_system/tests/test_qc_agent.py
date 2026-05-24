"""
Tests for the QC Agent guardrails — rule-based checks only (no LLM).

These tests prove that:
  1. Score↔descriptor mismatches are always caught.
  2. Fabricated test names in report prose are flagged.
  3. A clean report passes rule-based checks.
"""

import json
from pathlib import Path

import pytest

from psych_eval_system.models.patient import PatientAnonymized, FamilyInfo, DevelopmentalHistory, EducationalHistory, ReferralInfo, BehavioralObservations
from psych_eval_system.models.test_scores import ClinicalInput, WPPSIIVScores, CompositeScore
from psych_eval_system.models.report import (
    FullReport, ReportSection, ScoreInterpretation, ValidationSeverity
)
from psych_eval_system.agents.qc_agent import QCAgent


MOCK_DATA_PATH = Path(__file__).parent / "mock_data" / "emma_richardson.json"


def _make_anon_patient() -> PatientAnonymized:
    return PatientAnonymized(
        token="PT_RIC_2019",
        age_years=5,
        age_months=3,
        gender="Female",
        pronouns="she/her/her",
        family_info=FamilyInfo(),
        developmental_history=DevelopmentalHistory(),
        educational_history=EducationalHistory(),
        referral_info=ReferralInfo(primary_concerns=["Social communication delays"]),
        behavioral_observations=BehavioralObservations(),
    )


def _make_clinical() -> ClinicalInput:
    with open(MOCK_DATA_PATH) as f:
        data = json.load(f)
    return ClinicalInput.model_validate(data["clinical_input"])


class TestQCRuleBasedChecks:
    def test_clean_interpretations_pass(self):
        # SS=68 falls in 60-69 range → "Very Low" per Kranzler & Floyd table
        qc = QCAgent()
        clinical = _make_clinical()
        report = FullReport(
            patient_token="PT_RIC_2019",
            score_interpretations=[
                ScoreInterpretation(
                    test_name="WPPSI-IV",
                    composite_name="Full Scale IQ",
                    standard_score=68,
                    percentile=2,
                    descriptor="Very Low",
                )
            ],
        )
        issues = qc._rule_based_checks(clinical, report)
        errors = [i for i in issues if i.severity == ValidationSeverity.ERROR]
        assert len(errors) == 0, f"Unexpected errors: {errors}"

    def test_descriptor_mismatch_caught(self):
        """SS=68 should be Very Low (60-69 range), not Average."""
        qc = QCAgent()
        clinical = _make_clinical()
        report = FullReport(
            patient_token="PT_RIC_2019",
            score_interpretations=[
                ScoreInterpretation(
                    test_name="WPPSI-IV",
                    composite_name="Full Scale IQ",
                    standard_score=68,
                    percentile=2,
                    descriptor="Average",  # WRONG — should be Very Low
                )
            ],
        )
        issues = qc._rule_based_checks(clinical, report)
        errors = [i for i in issues if i.severity == ValidationSeverity.ERROR]
        assert len(errors) >= 1
        assert any("mismatch" in i.message.lower() or "Very Low" in i.message for i in errors)

    def test_percentile_mismatch_caught(self):
        """SS=68 → ~2nd percentile, not 50th."""
        qc = QCAgent()
        clinical = _make_clinical()
        report = FullReport(
            patient_token="PT_RIC_2019",
            score_interpretations=[
                ScoreInterpretation(
                    test_name="WPPSI-IV",
                    composite_name="Full Scale IQ",
                    standard_score=68,
                    percentile=50,  # WRONG
                    descriptor="Extremely Low",
                )
            ],
        )
        issues = qc._rule_based_checks(clinical, report)
        errors = [i for i in issues if i.severity == ValidationSeverity.ERROR]
        assert len(errors) >= 1
        assert any("percentile" in i.message.lower() for i in errors)

    def test_fabricated_test_name_caught(self):
        """Report mentions WISC-V but it was not administered."""
        qc = QCAgent()
        clinical = _make_clinical()
        assert clinical.wisc_v is None  # confirm WISC-V not in mock data

        section = ReportSection(
            section_id="test_wisc_v",
            title="WISC-V",
            content=(
                "The WISC-V was administered and PATIENT obtained a Full Scale IQ of 95, "
                "which is in the Average range."
            ),
        )
        issues = qc._check_for_invented_test_names(section.content, clinical)
        errors = [i for i in issues if i.severity == ValidationSeverity.ERROR]
        assert len(errors) >= 1
        assert any("WISC-V" in i.message for i in errors)

    def test_administered_test_not_flagged(self):
        """WPPSI-IV IS in mock data — should not be flagged as fabricated."""
        qc = QCAgent()
        clinical = _make_clinical()
        section = ReportSection(
            section_id="test_wppsi_iv",
            title="WPPSI-IV",
            content=(
                "The WPPSI-IV was administered. PATIENT's Full Scale IQ was 68 "
                "(Extremely Low range, 2nd percentile)."
            ),
        )
        issues = qc._check_for_invented_test_names(section.content, clinical)
        assert len(issues) == 0

    def test_all_emma_scores_valid(self):
        """Full mock profile should pass all rule-based checks with zero errors."""
        qc = QCAgent()
        clinical = _make_clinical()

        # Build interpretations from the actual rules engine
        from psych_eval_system.rules import ss_to_descriptor, ss_to_percentile
        interpretations = []
        for composite_name, ss, pct in [
            ("Full Scale IQ", 68, 2),
            ("Verbal Comprehension Index", 64, 1),
            ("Visual Spatial Index", 74, 4),
            ("Fluid Reasoning Index", 71, 3),
            ("Working Memory Index", 69, 2),
            ("Processing Speed Index", 72, 3),
        ]:
            desc = ss_to_descriptor(ss)
            interpretations.append(ScoreInterpretation(
                test_name="WPPSI-IV",
                composite_name=composite_name,
                standard_score=ss,
                percentile=pct,
                descriptor=desc.value,
            ))

        report = FullReport(patient_token="PT_RIC_2019", score_interpretations=interpretations)
        issues = qc._rule_based_checks(clinical, report)
        errors = [i for i in issues if i.severity == ValidationSeverity.ERROR]
        assert len(errors) == 0, f"Unexpected errors on valid data: {errors}"
