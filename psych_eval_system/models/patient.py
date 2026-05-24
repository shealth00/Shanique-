"""
Patient data models.

PII is isolated in PatientPII. All downstream agent processing uses
PatientAnonymized, which replaces identifying data with tokens.
PHI is re-injected only at final document export.
"""

from __future__ import annotations

from datetime import date
from typing import Optional
from pydantic import BaseModel, Field, model_validator


class Parent(BaseModel):
    name: str
    relationship: str  # "Mother", "Father", "Guardian"


class Sibling(BaseModel):
    name: str
    age: int
    gender: str


class FamilyInfo(BaseModel):
    parents: list[Parent] = Field(default_factory=list)
    siblings: list[Sibling] = Field(default_factory=list)
    household_members: int = 0
    family_history: list[str] = Field(default_factory=list)
    recent_stressors: list[str] = Field(default_factory=list)
    social_supports: list[str] = Field(default_factory=list)


class DevelopmentalHistory(BaseModel):
    birth_type: str = ""           # "full-term", "premature", etc.
    weeks_gestation: Optional[int] = None
    birth_method: str = ""
    pregnancy_complications: list[str] = Field(default_factory=list)
    crawling_months: Optional[int] = None
    walking_months: Optional[int] = None
    first_word_months: Optional[int] = None
    first_sentences_years: Optional[float] = None
    current_language_level: str = ""
    medical_history: list[str] = Field(default_factory=list)
    current_medications: list[str] = Field(default_factory=list)
    vision_hearing_notes: str = ""
    toilet_training_notes: str = ""


class EducationalHistory(BaseModel):
    early_intervention: list[str] = Field(default_factory=list)
    current_school: str = ""
    current_grade: str = ""
    iep_status: bool = False
    iep_category: str = ""
    classroom_type: str = ""
    school_services: list[str] = Field(default_factory=list)
    outside_services: list[str] = Field(default_factory=list)
    academic_performance: str = ""


class ReferralInfo(BaseModel):
    referral_source: str = ""
    reason_for_evaluation: str = ""
    primary_concerns: list[str] = Field(default_factory=list)
    evaluation_date: Optional[date] = None
    report_date: Optional[date] = None
    intake_date: Optional[date] = None
    examiner: str = ""
    clinic_name: str = "Irby Psychological Services (IPS)"


class BehavioralObservations(BaseModel):
    accompanied_by: list[str] = Field(default_factory=list)
    appearance: str = ""
    sensory_adequacy: str = ""
    eye_contact: str = ""
    communication_level: str = ""
    affect: str = ""
    activity_level: str = ""
    attention_concentration: str = ""
    response_to_examiners: str = ""
    repetitive_behaviors_observed: list[str] = Field(default_factory=list)
    testing_modifications: list[str] = Field(default_factory=list)
    results_validity: str = ""


# ---------------------------------------------------------------------------
# PII container — never sent to LLM APIs
# ---------------------------------------------------------------------------

class PatientPII(BaseModel):
    first_name: str
    last_name: str
    birth_date: date
    age_years: int
    age_months: int
    gender: str               # "Male" / "Female" / "Nonbinary"
    pronouns: str = ""        # auto-derived if blank
    city: str = ""
    state: str = ""
    address: str = ""
    family_info: FamilyInfo = Field(default_factory=FamilyInfo)
    developmental_history: DevelopmentalHistory = Field(default_factory=DevelopmentalHistory)
    educational_history: EducationalHistory = Field(default_factory=EducationalHistory)
    referral_info: ReferralInfo = Field(default_factory=ReferralInfo)
    behavioral_observations: BehavioralObservations = Field(default_factory=BehavioralObservations)

    @model_validator(mode="after")
    def derive_pronouns(self) -> "PatientPII":
        if not self.pronouns:
            if self.gender.lower() == "male":
                self.pronouns = "he/him/his"
            elif self.gender.lower() == "female":
                self.pronouns = "she/her/her"
            else:
                self.pronouns = "they/them/their"
        return self

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"

    @property
    def age_str(self) -> str:
        return f"{self.age_years}-year, {self.age_months}-month-old"

    @property
    def subject(self) -> str:
        return self.pronouns.split("/")[0].capitalize()

    @property
    def object_pronoun(self) -> str:
        parts = self.pronouns.split("/")
        return parts[1] if len(parts) > 1 else parts[0]

    @property
    def possessive(self) -> str:
        parts = self.pronouns.split("/")
        return parts[2] if len(parts) > 2 else parts[0] + "'s"


# ---------------------------------------------------------------------------
# Anonymized version — safe for LLM transmission
# ---------------------------------------------------------------------------

class PatientAnonymized(BaseModel):
    token: str = "PATIENT_TOKEN"   # e.g. "PT_A1"
    age_years: int
    age_months: int
    gender: str
    pronouns: str
    city_token: str = "CITY_TOKEN"
    state_token: str = "STATE_TOKEN"
    family_info: FamilyInfo
    developmental_history: DevelopmentalHistory
    educational_history: EducationalHistory
    referral_info: ReferralInfo         # referral_source may contain provider name — strip if needed
    behavioral_observations: BehavioralObservations

    @classmethod
    def from_pii(cls, pii: PatientPII, token: str = "PT_A1") -> "PatientAnonymized":
        # Deep-copy referral info with provider name scrubbed
        ref = pii.referral_info.model_copy(
            update={"referral_source": "[REFERRAL_SOURCE]", "examiner": "[EXAMINER]"}
        )
        return cls(
            token=token,
            age_years=pii.age_years,
            age_months=pii.age_months,
            gender=pii.gender,
            pronouns=pii.pronouns,
            city_token="[CITY]",
            state_token="[STATE]",
            family_info=pii.family_info.model_copy(),
            developmental_history=pii.developmental_history.model_copy(),
            educational_history=pii.educational_history.model_copy(),
            referral_info=ref,
            behavioral_observations=pii.behavioral_observations.model_copy(),
        )
