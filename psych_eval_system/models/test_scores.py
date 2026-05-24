"""
Pydantic models for all psychometric instruments referenced in the 2025 template.

Design rules:
  - Every score field is Optional — absent = section omitted, never fabricated.
  - Each model carries a `provided` property so the drafting agent can gate
    on whether sufficient data exists to render that section.
  - Raw scores only; descriptors are computed by the rules engine, never stored
    as free text in the input (prevents pre-labelled hallucination).
"""

from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, Field, model_validator


# ---------------------------------------------------------------------------
# Primitive score containers
# ---------------------------------------------------------------------------

class SubtestScore(BaseModel):
    name: str
    scaled_score: Optional[int] = None
    raw_score: Optional[int] = None
    age_equivalent: Optional[str] = None
    grade_equivalent: Optional[str] = None
    notes: str = ""


class CompositeScore(BaseModel):
    name: str
    standard_score: Optional[int] = None
    confidence_interval_low: Optional[int] = None
    confidence_interval_high: Optional[int] = None
    percentile: Optional[int] = None
    age_equivalent: Optional[str] = None
    grade_equivalent: Optional[str] = None
    subtests: list[SubtestScore] = Field(default_factory=list)


class TestScoreBase(BaseModel):
    administered: bool = False

    @property
    def provided(self) -> bool:
        return self.administered


# ---------------------------------------------------------------------------
# Cognitive / Intelligence Batteries
# ---------------------------------------------------------------------------

class WISCVScores(TestScoreBase):
    fsiq: Optional[CompositeScore] = None
    verbal_comprehension: Optional[CompositeScore] = None
    visual_spatial: Optional[CompositeScore] = None
    fluid_reasoning: Optional[CompositeScore] = None
    working_memory: Optional[CompositeScore] = None
    processing_speed: Optional[CompositeScore] = None
    subtests: list[SubtestScore] = Field(default_factory=list)


class WPPSIIVScores(TestScoreBase):
    fsiq: Optional[CompositeScore] = None
    verbal_comprehension: Optional[CompositeScore] = None
    visual_spatial: Optional[CompositeScore] = None
    fluid_reasoning: Optional[CompositeScore] = None
    working_memory: Optional[CompositeScore] = None
    processing_speed: Optional[CompositeScore] = None
    subtests: list[SubtestScore] = Field(default_factory=list)


class WAISVScores(TestScoreBase):
    fsiq: Optional[CompositeScore] = None
    verbal_comprehension: Optional[CompositeScore] = None
    visual_spatial: Optional[CompositeScore] = None
    fluid_reasoning: Optional[CompositeScore] = None
    working_memory: Optional[CompositeScore] = None
    processing_speed: Optional[CompositeScore] = None
    subtests: list[SubtestScore] = Field(default_factory=list)


class RIAS2Scores(TestScoreBase):
    composite_intelligence_index: Optional[CompositeScore] = None
    verbal_intelligence_index: Optional[CompositeScore] = None
    nonverbal_intelligence_index: Optional[CompositeScore] = None
    composite_memory_index: Optional[CompositeScore] = None
    subtests: list[SubtestScore] = Field(default_factory=list)


class SB5Scores(TestScoreBase):
    fsiq: Optional[CompositeScore] = None
    nonverbal_iq: Optional[CompositeScore] = None
    verbal_iq: Optional[CompositeScore] = None
    abbreviated_iq: Optional[CompositeScore] = None
    fluid_reasoning: Optional[CompositeScore] = None
    knowledge: Optional[CompositeScore] = None
    quantitative_reasoning: Optional[CompositeScore] = None
    visual_spatial_processing: Optional[CompositeScore] = None
    working_memory: Optional[CompositeScore] = None
    subtests: list[SubtestScore] = Field(default_factory=list)


class KABCIIScores(TestScoreBase):
    fci: Optional[CompositeScore] = None
    sequential: Optional[CompositeScore] = None
    simultaneous: Optional[CompositeScore] = None
    learning: Optional[CompositeScore] = None
    knowledge: Optional[CompositeScore] = None
    planning: Optional[CompositeScore] = None
    subtests: list[SubtestScore] = Field(default_factory=list)


class WJIVCOGScores(TestScoreBase):
    general_intellectual_ability: Optional[CompositeScore] = None
    subtests: list[SubtestScore] = Field(default_factory=list)


class WJIVECADScores(TestScoreBase):
    general_intellectual_ability: Optional[CompositeScore] = None
    expressive_language: Optional[CompositeScore] = None
    subtests: list[SubtestScore] = Field(default_factory=list)


class WNVScores(TestScoreBase):
    composite_index: Optional[CompositeScore] = None
    subtests: list[SubtestScore] = Field(default_factory=list)


class PTONIScores(TestScoreBase):
    nonverbal_index: Optional[CompositeScore] = None


class CTONIScores(TestScoreBase):
    full_scale: Optional[CompositeScore] = None
    pictorial_scale: Optional[CompositeScore] = None
    geometric_scale: Optional[CompositeScore] = None
    subtests: list[SubtestScore] = Field(default_factory=list)


class BrackenScores(TestScoreBase):
    school_readiness_composite: Optional[SubtestScore] = None
    self_social_awareness: Optional[SubtestScore] = None


# ---------------------------------------------------------------------------
# Achievement Batteries
# ---------------------------------------------------------------------------

class KTEA3Scores(TestScoreBase):
    composites_administered: list[str] = Field(default_factory=list)
    reading: Optional[CompositeScore] = None
    math: Optional[CompositeScore] = None
    written_language: Optional[CompositeScore] = None
    oral_language: Optional[CompositeScore] = None
    subtests: list[SubtestScore] = Field(default_factory=list)


class WIAT4Scores(TestScoreBase):
    composites_administered: list[str] = Field(default_factory=list)
    basic_reading: Optional[CompositeScore] = None
    reading: Optional[CompositeScore] = None
    decoding: Optional[CompositeScore] = None
    phonological_processing: Optional[CompositeScore] = None
    oral_language: Optional[CompositeScore] = None
    dyslexia_index: Optional[CompositeScore] = None
    math: Optional[CompositeScore] = None
    written_expression: Optional[CompositeScore] = None
    subtests: list[SubtestScore] = Field(default_factory=list)


class WJIVACHScores(TestScoreBase):
    basic_reading_skills: Optional[CompositeScore] = None
    reading: Optional[CompositeScore] = None
    mathematics: Optional[CompositeScore] = None
    written_language: Optional[CompositeScore] = None
    academic_skills: Optional[CompositeScore] = None
    brief_achievement: Optional[CompositeScore] = None
    subtests: list[SubtestScore] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Developmental / Adaptive
# ---------------------------------------------------------------------------

class BDI2Scores(TestScoreBase):
    total: Optional[CompositeScore] = None
    adaptive: Optional[CompositeScore] = None
    personal_social: Optional[CompositeScore] = None
    communication: Optional[CompositeScore] = None
    motor: Optional[CompositeScore] = None
    cognitive: Optional[CompositeScore] = None
    subtests: list[SubtestScore] = Field(default_factory=list)


class DP4Scores(TestScoreBase):
    total: Optional[CompositeScore] = None
    physical: Optional[CompositeScore] = None
    adaptive_behavior: Optional[CompositeScore] = None
    social_emotional: Optional[CompositeScore] = None
    cognitive: Optional[CompositeScore] = None
    communication: Optional[CompositeScore] = None


class VinelandScores(TestScoreBase):
    adaptive_behavior_composite: Optional[CompositeScore] = None
    communication: Optional[CompositeScore] = None
    daily_living_skills: Optional[CompositeScore] = None
    socialization: Optional[CompositeScore] = None
    motor_skills: Optional[CompositeScore] = None
    maladaptive_behavior_index: Optional[CompositeScore] = None
    subtests: list[SubtestScore] = Field(default_factory=list)


class ABAS3Scores(TestScoreBase):
    general_adaptive_composite: Optional[CompositeScore] = None
    conceptual: Optional[CompositeScore] = None
    social: Optional[CompositeScore] = None
    practical: Optional[CompositeScore] = None
    form: str = ""  # "Parent", "Teacher", "Adult"
    subtests: list[SubtestScore] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Autism-Specific
# ---------------------------------------------------------------------------

class ADOS2Scores(TestScoreBase):
    module: Optional[int] = None            # 1-4
    social_affect_score: Optional[int] = None
    restricted_repetitive_behavior_score: Optional[int] = None
    total_score: Optional[int] = None
    calibrated_severity_score: Optional[int] = None  # 1-10
    comparison_score: Optional[int] = None
    meets_asd_cutoff: Optional[bool] = None

    @model_validator(mode="after")
    def compute_cutoff(self) -> "ADOS2Scores":
        if (self.total_score is not None and self.module is not None
                and self.meets_asd_cutoff is None):
            from psych_eval_system.rules import ados2_meets_cutoff
            try:
                self.meets_asd_cutoff = ados2_meets_cutoff(
                    self.total_score, self.module,
                    self.comparison_score or 0
                )
            except ValueError:
                pass
        return self


class CARS2Scores(TestScoreBase):
    version: str = ""  # "Standard" or "High-Functioning"
    total_raw_score: Optional[float] = None
    t_score: Optional[int] = None
    percentile: Optional[int] = None
    classification: str = ""  # "Minimal-to-No ASD", "Mild-Moderate ASD", "Severe ASD"


class GARS3Scores(TestScoreBase):
    autism_index: Optional[int] = None
    probability: str = ""
    form: str = ""  # "Parent", "Teacher"
    subtests: list[SubtestScore] = Field(default_factory=list)


class SRS2Scores(TestScoreBase):
    total_t_score: Optional[int] = None
    social_awareness: Optional[int] = None
    social_cognition: Optional[int] = None
    social_communication: Optional[int] = None
    social_motivation: Optional[int] = None
    restricted_repetitive_behavior: Optional[int] = None
    form: str = ""  # "Parent", "Teacher", "Self-Report"


class SCQScores(TestScoreBase):
    total_score: Optional[int] = None
    meets_cutoff: Optional[bool] = None

    @model_validator(mode="after")
    def compute_cutoff(self) -> "SCQScores":
        if self.total_score is not None and self.meets_cutoff is None:
            self.meets_cutoff = self.total_score >= 15
        return self


# ---------------------------------------------------------------------------
# Behavioral / Rating Scales
# ---------------------------------------------------------------------------

class BASC3Scores(TestScoreBase):
    form: str = ""  # "Parent", "Teacher", "Self-Report"
    externalizing_problems: Optional[int] = None
    internalizing_problems: Optional[int] = None
    behavioral_symptoms_index: Optional[int] = None
    adaptive_skills: Optional[int] = None
    attention_problems: Optional[int] = None
    hyperactivity: Optional[int] = None
    aggression: Optional[int] = None
    conduct_problems: Optional[int] = None
    anxiety: Optional[int] = None
    depression: Optional[int] = None
    somatization: Optional[int] = None
    atypicality: Optional[int] = None
    withdrawal: Optional[int] = None
    attention_deficit_hyperactivity: Optional[int] = None
    subtests: list[SubtestScore] = Field(default_factory=list)


class BRIEFScores(TestScoreBase):
    version: str = ""  # "BRIEF-P", "BRIEF-2"
    form: str = ""
    global_executive_composite: Optional[int] = None
    behavioral_regulation_index: Optional[int] = None
    emotion_regulation_index: Optional[int] = None
    cognitive_regulation_index: Optional[int] = None
    subtests: list[SubtestScore] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Aggregate input container — the single object passed into the pipeline
# ---------------------------------------------------------------------------

class ClinicalInput(BaseModel):
    wisc_v: Optional[WISCVScores] = None
    wppsi_iv: Optional[WPPSIIVScores] = None
    wais_v: Optional[WAISVScores] = None
    rias_2: Optional[RIAS2Scores] = None
    sb5: Optional[SB5Scores] = None
    kabc_ii: Optional[KABCIIScores] = None
    wj_iv_cog: Optional[WJIVCOGScores] = None
    wj_iv_ecad: Optional[WJIVECADScores] = None
    wnv: Optional[WNVScores] = None
    ptoni: Optional[PTONIScores] = None
    ctoni_2: Optional[CTONIScores] = None
    bracken: Optional[BrackenScores] = None
    ktea_3: Optional[KTEA3Scores] = None
    wiat_4: Optional[WIAT4Scores] = None
    wj_iv_ach: Optional[WJIVACHScores] = None
    bdi_2: Optional[BDI2Scores] = None
    dp_4: Optional[DP4Scores] = None
    vineland: Optional[VinelandScores] = None
    abas_3_parent: Optional[ABAS3Scores] = None
    abas_3_teacher: Optional[ABAS3Scores] = None
    ados_2: Optional[ADOS2Scores] = None
    cars_2: Optional[CARS2Scores] = None
    gars_3_parent: Optional[GARS3Scores] = None
    gars_3_teacher: Optional[GARS3Scores] = None
    srs_2_parent: Optional[SRS2Scores] = None
    srs_2_teacher: Optional[SRS2Scores] = None
    scq: Optional[SCQScores] = None
    basc3_parent: Optional[BASC3Scores] = None
    basc3_teacher: Optional[BASC3Scores] = None
    basc3_self: Optional[BASC3Scores] = None
    brief: Optional[BRIEFScores] = None
    additional_notes: str = ""

    def administered_tests(self) -> list[str]:
        """Returns names of tests that have data (administered=True or scores present)."""
        result = []
        for field_name, value in self:
            if value is not None and isinstance(value, TestScoreBase) and value.administered:
                result.append(field_name)
        return result
