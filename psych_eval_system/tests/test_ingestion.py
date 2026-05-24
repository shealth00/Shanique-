"""
Tests for the Data Ingestion Agent.

These tests use mock data to validate schema enforcement,
null-field handling, and cross-validation without calling the real LLM.
"""

import json
from datetime import date
from pathlib import Path

import pytest

from psych_eval_system.models.patient import PatientPII, FamilyInfo, Parent, ReferralInfo
from psych_eval_system.models.test_scores import ClinicalInput, WPPSIIVScores, CompositeScore, ADOS2Scores
from psych_eval_system.agents.ingestion_agent import IngestionAgent
from psych_eval_system.models.report import ValidationSeverity


MOCK_DATA_PATH = Path(__file__).parent / "mock_data" / "emma_richardson.json"


def load_mock() -> dict:
    with open(MOCK_DATA_PATH) as f:
        return json.load(f)


class TestIngestionSchemaValidation:
    def test_patient_pii_parses_from_mock(self):
        data = load_mock()
        patient = PatientPII.model_validate(data["patient"])
        assert patient.first_name == "Emma"
        assert patient.last_name == "Richardson"
        assert patient.age_years == 5
        assert patient.gender == "Female"

    def test_pronouns_derived(self):
        data = load_mock()
        patient = PatientPII.model_validate(data["patient"])
        assert patient.pronouns == "she/her/her"
        assert patient.subject == "She"
        assert patient.object_pronoun == "her"
        assert patient.possessive == "her"

    def test_clinical_input_parses_from_mock(self):
        data = load_mock()
        clinical = ClinicalInput.model_validate(data["clinical_input"])
        assert clinical.wppsi_iv is not None
        assert clinical.wppsi_iv.administered is True
        assert clinical.wppsi_iv.fsiq.standard_score == 68

    def test_administered_tests_list(self):
        data = load_mock()
        clinical = ClinicalInput.model_validate(data["clinical_input"])
        administered = clinical.administered_tests()
        assert "wppsi_iv" in administered
        assert "ados_2" in administered
        assert "vineland" in administered

    def test_absent_test_is_none(self):
        data = load_mock()
        clinical = ClinicalInput.model_validate(data["clinical_input"])
        assert clinical.wisc_v is None   # Not in mock data
        assert clinical.ktea_3 is None

    def test_ados2_cutoff_computed(self):
        data = load_mock()
        clinical = ClinicalInput.model_validate(data["clinical_input"])
        assert clinical.ados_2.meets_asd_cutoff is True  # total=17, module=2, cutoff=9

    def test_ados2_below_cutoff(self):
        ados = ADOS2Scores(administered=True, module=2, total_score=5, comparison_score=5)
        assert ados.meets_asd_cutoff is False


class TestIngestionCrossValidation:
    def test_valid_ss_percentile_passes(self):
        agent = IngestionAgent()
        data = load_mock()
        clinical = ClinicalInput.model_validate(data["clinical_input"])
        issues = agent._cross_validate(clinical)
        errors = [i for i in issues if i.severity == ValidationSeverity.ERROR]
        assert len(errors) == 0, f"Unexpected validation errors: {errors}"

    def test_invalid_percentile_caught(self):
        """If we inject a wrong percentile for FSIQ, the validator should flag it."""
        agent = IngestionAgent()
        clinical = ClinicalInput(
            wppsi_iv=WPPSIIVScores(
                administered=True,
                fsiq=CompositeScore(
                    name="Full Scale IQ",
                    standard_score=100,
                    percentile=84,  # Wrong: SS=100 → 50th, not 84th
                ),
            )
        )
        issues = agent._cross_validate(clinical)
        errors = [i for i in issues if i.severity == ValidationSeverity.ERROR]
        assert len(errors) >= 1
        assert any("percentile" in i.message.lower() for i in errors)

    def test_null_fields_not_fabricated(self):
        """An empty ClinicalInput produces no issues and no administered tests."""
        agent = IngestionAgent()
        clinical = ClinicalInput()
        assert clinical.administered_tests() == []
        issues = agent._cross_validate(clinical)
        assert len(issues) == 0
