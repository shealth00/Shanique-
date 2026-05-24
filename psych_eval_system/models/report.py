"""
Report output models — structured results at each pipeline stage.
"""

from __future__ import annotations

from enum import Enum
from typing import Any, Optional
from pydantic import BaseModel, Field


class ValidationSeverity(str, Enum):
    ERROR = "error"       # Score/descriptor mismatch — must block report
    WARNING = "warning"   # Suspicious value — flag for clinician review
    INFO = "info"         # FYI annotation


class ValidationIssue(BaseModel):
    severity: ValidationSeverity
    field: str
    message: str
    raw_value: Any = None
    expected_value: Any = None


class ScoreInterpretation(BaseModel):
    test_name: str
    composite_name: str
    standard_score: Optional[int] = None
    scaled_score: Optional[int] = None
    t_score: Optional[int] = None
    percentile: Optional[int] = None
    descriptor: str = ""
    confidence_interval: str = ""
    notes: str = ""
    validation_issues: list[ValidationIssue] = Field(default_factory=list)

    @property
    def is_valid(self) -> bool:
        return not any(
            i.severity == ValidationSeverity.ERROR for i in self.validation_issues
        )


class DiagnosticFlag(BaseModel):
    domain: str           # e.g. "Autism Spectrum", "ADHD", "Intellectual Disability"
    instrument: str
    criterion: str
    met: bool
    score: Any = None
    cutoff: Any = None
    notes: str = ""


class ReportSection(BaseModel):
    section_id: str
    title: str
    content: str          # Jinja-rendered markdown prose
    grounded_claims: list[str] = Field(default_factory=list)   # Each claim traceable to input
    hallucination_flags: list[str] = Field(default_factory=list)
    approved: bool = False


class QCResult(BaseModel):
    passed: bool
    total_claims_checked: int = 0
    verified_claims: int = 0
    unverified_claims: list[str] = Field(default_factory=list)
    fabricated_scores: list[str] = Field(default_factory=list)
    descriptor_mismatches: list[str] = Field(default_factory=list)
    missing_data_flags: list[str] = Field(default_factory=list)
    overall_notes: str = ""

    @property
    def verification_rate(self) -> float:
        if self.total_claims_checked == 0:
            return 1.0
        return self.verified_claims / self.total_claims_checked


class FullReport(BaseModel):
    patient_token: str
    sections: list[ReportSection] = Field(default_factory=list)
    score_interpretations: list[ScoreInterpretation] = Field(default_factory=list)
    diagnostic_flags: list[DiagnosticFlag] = Field(default_factory=list)
    validation_issues: list[ValidationIssue] = Field(default_factory=list)
    qc_result: Optional[QCResult] = None
    draft_markdown: str = ""
    final_markdown: str = ""
    ready_for_clinician_review: bool = False

    @property
    def has_blocking_errors(self) -> bool:
        return any(i.severity == ValidationSeverity.ERROR for i in self.validation_issues)
