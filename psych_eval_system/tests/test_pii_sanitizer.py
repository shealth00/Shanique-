"""
Tests for the PII sanitization firewall.
"""

import json
from datetime import date

import pytest

from psych_eval_system.models.patient import PatientPII, FamilyInfo, Parent, ReferralInfo
from psych_eval_system.utils.pii_sanitizer import PIISanitizer


def _make_patient() -> PatientPII:
    return PatientPII(
        first_name="Emma",
        last_name="Richardson",
        birth_date=date(2019, 3, 15),
        age_years=5,
        age_months=3,
        gender="Female",
        city="Memphis",
        state="Tennessee",
        family_info=FamilyInfo(
            parents=[
                Parent(name="Margaret Richardson", relationship="Mother"),
            ]
        ),
        referral_info=ReferralInfo(
            referral_source="Dr. James Mitchell, MD",
            examiner="Dr. S. Irby, Psy.D.",
            clinic_name="Irby Psychological Services (IPS)",
        ),
    )


class TestPIISanitizer:
    def test_first_name_sanitized(self):
        patient = _make_patient()
        s = PIISanitizer(patient, run_id="TEST")
        result = s.sanitize("Emma was referred for evaluation.")
        assert "Emma" not in result
        assert "[TEST_FIRST]" in result

    def test_last_name_sanitized(self):
        patient = _make_patient()
        s = PIISanitizer(patient, run_id="TEST")
        result = s.sanitize("The Richardson family reported...")
        assert "Richardson" not in result

    def test_full_name_sanitized(self):
        patient = _make_patient()
        s = PIISanitizer(patient, run_id="TEST")
        result = s.sanitize("Emma Richardson was evaluated on 10/15/2024.")
        assert "Emma Richardson" not in result

    def test_city_sanitized(self):
        patient = _make_patient()
        s = PIISanitizer(patient, run_id="TEST")
        result = s.sanitize("Patient lives in Memphis, Tennessee.")
        assert "Memphis" not in result

    def test_restore_roundtrip(self):
        patient = _make_patient()
        s = PIISanitizer(patient, run_id="TEST")
        original = "Emma Richardson lives in Memphis, Tennessee."
        sanitized = s.sanitize(original)
        restored = s.restore(sanitized)
        assert restored == original

    def test_no_pii_in_sanitized(self):
        patient = _make_patient()
        s = PIISanitizer(patient, run_id="TEST")
        text = (
            "Emma Richardson (DOB: 2019-03-15) lives in Memphis, Tennessee. "
            "Her mother is Margaret Richardson."
        )
        sanitized = s.sanitize(text)
        pii_strings = ["Emma", "Richardson", "2019-03-15", "Memphis", "Margaret"]
        for pii in pii_strings:
            assert pii not in sanitized, f"PII '{pii}' still present in sanitized output"

    def test_empty_string_safe(self):
        patient = _make_patient()
        s = PIISanitizer(patient, run_id="TEST")
        assert s.sanitize("") == ""
        assert s.restore("") == ""

    def test_dict_sanitization(self):
        patient = _make_patient()
        s = PIISanitizer(patient, run_id="TEST")
        data = {"name": "Emma Richardson", "city": "Memphis", "age": 5}
        sanitized = s.sanitize_dict(data)
        assert "Emma" not in sanitized["name"]
        assert "Memphis" not in sanitized["city"]
        assert sanitized["age"] == 5  # non-string unchanged
