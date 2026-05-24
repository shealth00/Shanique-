"""
Tests for the Clinical Reasoning Agent.

Validates diagnostic flag logic and score interpretation
without calling any LLM.
"""

import json
from pathlib import Path

import pytest

from psych_eval_system.models.patient import PatientAnonymized, FamilyInfo, DevelopmentalHistory, EducationalHistory, ReferralInfo, BehavioralObservations
from psych_eval_system.models.test_scores import ClinicalInput, ADOS2Scores, BASC3Scores
from psych_eval_system.agents.reasoning_agent import ReasoningAgent


MOCK_DATA_PATH = Path(__file__).parent / "mock_data" / "emma_richardson.json"


def _make_patient() -> PatientAnonymized:
    return PatientAnonymized(
        token="PT_RIC_2019",
        age_years=5, age_months=3, gender="Female", pronouns="she/her/her",
        family_info=FamilyInfo(),
        developmental_history=DevelopmentalHistory(),
        educational_history=EducationalHistory(),
        referral_info=ReferralInfo(),
        behavioral_observations=BehavioralObservations(),
    )


def _load_clinical() -> ClinicalInput:
    with open(MOCK_DATA_PATH) as f:
        data = json.load(f)
    return ClinicalInput.model_validate(data["clinical_input"])


class TestDiagnosticFlags:
    def test_ados2_asd_flag_met(self):
        agent = ReasoningAgent()
        clinical = _load_clinical()
        flags = agent._flag_autism(clinical)
        ados_flag = next((f for f in flags if f.instrument == "ADOS-2"), None)
        assert ados_flag is not None
        assert ados_flag.met is True

    def test_ados2_below_cutoff_not_met(self):
        agent = ReasoningAgent()
        clinical = ClinicalInput(
            ados_2=ADOS2Scores(
                administered=True, module=2,
                total_score=5, comparison_score=5
            )
        )
        flags = agent._flag_autism(clinical)
        ados_flag = next((f for f in flags if f.instrument == "ADOS-2"), None)
        assert ados_flag is not None
        assert ados_flag.met is False

    def test_id_flag_fsiq_below_70(self):
        agent = ReasoningAgent()
        from psych_eval_system.models.report import ScoreInterpretation
        interps = [
            ScoreInterpretation(
                test_name="WPPSI-IV",
                composite_name="Full Scale IQ",
                standard_score=68,
                percentile=2,
                descriptor="Extremely Low",
            )
        ]
        clinical = _load_clinical()
        flags = agent._flag_intellectual_disability(clinical, interps)
        assert len(flags) >= 1
        assert flags[0].met is True

    def test_id_flag_fsiq_above_70(self):
        agent = ReasoningAgent()
        from psych_eval_system.models.report import ScoreInterpretation
        interps = [
            ScoreInterpretation(
                test_name="WPPSI-IV",
                composite_name="Full Scale IQ",
                standard_score=85,
                percentile=16,
                descriptor="Low Average",
            )
        ]
        clinical = _load_clinical()
        flags = agent._flag_intellectual_disability(clinical, interps)
        assert all(not f.met for f in flags)

    def test_adhd_flag_clinically_significant(self):
        agent = ReasoningAgent()
        clinical = ClinicalInput(
            basc3_parent=BASC3Scores(
                administered=True, form="Parent",
                attention_problems=72  # >= 70 = Clinically Significant
            )
        )
        flags = agent._flag_adhd(clinical)
        assert len(flags) >= 1
        assert flags[0].met is True
        assert "Clinically Significant" in flags[0].notes

    def test_adhd_flag_average(self):
        agent = ReasoningAgent()
        clinical = ClinicalInput(
            basc3_parent=BASC3Scores(
                administered=True, form="Parent",
                attention_problems=55  # < 70
            )
        )
        flags = agent._flag_adhd(clinical)
        assert len(flags) >= 1
        assert flags[0].met is False

    def test_no_flags_for_empty_clinical(self):
        agent = ReasoningAgent()
        clinical = ClinicalInput()
        assert agent._flag_autism(clinical) == []
        assert agent._flag_adhd(clinical) == []
