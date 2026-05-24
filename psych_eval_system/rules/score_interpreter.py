"""
Deterministic score interpretation engine.

All descriptor mappings are hard-coded from:
  Kranzler, J. H., & Floyd, R. G. (2020). Assessing intelligence in children
  and adolescents: A practical guide for evidence-based assessment.
  Lanham, MD: Rowman & Littlefield.

No LLM is used here. Every interpretation is a pure function so it can be
tested exhaustively and trusted as a hallucination-free source of truth.
"""

from __future__ import annotations

from enum import Enum
from typing import Optional
import math


class Descriptor(str, Enum):
    EXTREMELY_HIGH = "Extremely High"
    VERY_HIGH = "Very High"
    HIGH = "High"
    HIGH_AVERAGE = "High Average"
    AVERAGE = "Average"
    LOW_AVERAGE = "Low Average"
    LOW = "Low"
    VERY_LOW = "Very Low"
    EXTREMELY_LOW = "Extremely Low"


class BehaviorDescriptor(str, Enum):
    """Used for behavior rating scales (BASC-3, BRIEF, etc.) where high T = clinical concern."""
    CLINICALLY_SIGNIFICANT = "Clinically Significant"
    AT_RISK = "At-Risk"
    AVERAGE = "Average"


class ADOS2Severity(str, Enum):
    MINIMAL = "Minimal-to-No Evidence of ASD"
    LIMITED = "Some Limited Evidence of ASD"
    MODERATE = "Moderate Evidence of ASD"
    HIGH = "High Evidence of ASD"


# ---------------------------------------------------------------------------
# Standard Score (M=100, SD=15) — cognitive, achievement, adaptive
# ---------------------------------------------------------------------------

_SS_RANGES: list[tuple[int, int, Descriptor]] = [
    (140, 9999, Descriptor.EXTREMELY_HIGH),
    (130, 139,  Descriptor.VERY_HIGH),
    (120, 129,  Descriptor.HIGH),
    (110, 119,  Descriptor.HIGH_AVERAGE),
    (90,  109,  Descriptor.AVERAGE),
    (80,   89,  Descriptor.LOW_AVERAGE),
    (70,   79,  Descriptor.LOW),
    (60,   69,  Descriptor.VERY_LOW),
    (0,    59,  Descriptor.EXTREMELY_LOW),
]


def ss_to_descriptor(ss: int) -> Descriptor:
    for low, high, desc in _SS_RANGES:
        if low <= ss <= high:
            return desc
    raise ValueError(f"Standard score {ss} out of expected range (0-200)")


# ---------------------------------------------------------------------------
# Scaled Score (M=10, SD=3) — subtest level
# ---------------------------------------------------------------------------

_SCALED_RANGES: list[tuple[int, int, Descriptor]] = [
    (18, 99, Descriptor.EXTREMELY_HIGH),
    (16, 17, Descriptor.VERY_HIGH),
    (14, 15, Descriptor.HIGH),
    (12, 13, Descriptor.HIGH_AVERAGE),
    (9,  11, Descriptor.AVERAGE),
    (7,   8, Descriptor.LOW_AVERAGE),
    (5,   6, Descriptor.LOW),
    (3,   4, Descriptor.VERY_LOW),
    (1,   2, Descriptor.EXTREMELY_LOW),
]


def scaled_to_descriptor(scaled: int) -> Descriptor:
    for low, high, desc in _SCALED_RANGES:
        if low <= scaled <= high:
            return desc
    raise ValueError(f"Scaled score {scaled} out of expected range (1-19)")


# ---------------------------------------------------------------------------
# T-Score (M=50, SD=10) — cognitive
# ---------------------------------------------------------------------------

_TSCORE_RANGES: list[tuple[int, int, Descriptor]] = [
    (77, 99, Descriptor.EXTREMELY_HIGH),
    (70, 76, Descriptor.VERY_HIGH),
    (64, 69, Descriptor.HIGH),
    (57, 63, Descriptor.HIGH_AVERAGE),
    (44, 56, Descriptor.AVERAGE),
    (37, 43, Descriptor.LOW_AVERAGE),
    (31, 36, Descriptor.LOW),
    (24, 30, Descriptor.VERY_LOW),
    (0,  23, Descriptor.EXTREMELY_LOW),
]


def tscore_to_descriptor(t: int) -> Descriptor:
    for low, high, desc in _TSCORE_RANGES:
        if low <= t <= high:
            return desc
    raise ValueError(f"T-score {t} out of expected range (0-99)")


# ---------------------------------------------------------------------------
# Behavior rating T-score (BASC-3, BRIEF, etc.) — clinical-scale direction
# ---------------------------------------------------------------------------

def behavior_tscore_to_descriptor(t: int) -> BehaviorDescriptor:
    if t >= 70:
        return BehaviorDescriptor.CLINICALLY_SIGNIFICANT
    if t >= 61:
        return BehaviorDescriptor.AT_RISK
    return BehaviorDescriptor.AVERAGE


# ---------------------------------------------------------------------------
# Percentile ↔ Standard Score conversion (normal distribution)
# ---------------------------------------------------------------------------

def ss_to_percentile(ss: int, mean: float = 100.0, sd: float = 15.0) -> int:
    """Returns integer percentile rank (1-99) for a given standard score."""
    z = (ss - mean) / sd
    # Clamp to avoid edge artifacts at extremes
    p = _norm_cdf(z) * 100
    return max(1, min(99, round(p)))


def percentile_to_ss(pct: int, mean: float = 100.0, sd: float = 15.0) -> int:
    z = _norm_ppf(pct / 100.0)
    return round(mean + z * sd)


def _norm_cdf(z: float) -> float:
    return 0.5 * (1.0 + math.erf(z / math.sqrt(2)))


def _norm_ppf(p: float) -> float:
    """Rational approximation (Abramowitz & Stegun 26.2.16, max error < 4.5e-4)."""
    if p <= 0 or p >= 1:
        raise ValueError(f"Probability {p} must be in (0, 1)")
    if p < 0.5:
        t = math.sqrt(-2.0 * math.log(p))
        sign = -1
    else:
        t = math.sqrt(-2.0 * math.log(1 - p))
        sign = 1
    c = (2.515517, 0.802853, 0.010328)
    d = (1.432788, 0.189269, 0.001308)
    numerator = c[0] + c[1] * t + c[2] * t * t
    denominator = 1 + d[0] * t + d[1] * t * t + d[2] * t * t * t
    return sign * (t - numerator / denominator)


# ---------------------------------------------------------------------------
# Validation: check that a reported descriptor matches the numeric score
# ---------------------------------------------------------------------------

class ScoreValidationError(ValueError):
    pass


def validate_ss_descriptor(ss: int, reported_descriptor: str) -> None:
    expected = ss_to_descriptor(ss)
    if expected.value.lower() != reported_descriptor.strip().lower():
        raise ScoreValidationError(
            f"SS={ss} maps to '{expected.value}' but report states '{reported_descriptor}'"
        )


def validate_ss_percentile(ss: int, reported_percentile: int, tolerance: int = 2) -> None:
    expected = ss_to_percentile(ss)
    if abs(expected - reported_percentile) > tolerance:
        raise ScoreValidationError(
            f"SS={ss} maps to ~{expected}th percentile but report states {reported_percentile}th "
            f"(tolerance ±{tolerance})"
        )


def validate_scaled_descriptor(scaled: int, reported_descriptor: str) -> None:
    expected = scaled_to_descriptor(scaled)
    if expected.value.lower() != reported_descriptor.strip().lower():
        raise ScoreValidationError(
            f"Scaled={scaled} maps to '{expected.value}' but report states '{reported_descriptor}'"
        )


def validate_tscore_descriptor(t: int, reported_descriptor: str) -> None:
    expected = tscore_to_descriptor(t)
    if expected.value.lower() != reported_descriptor.strip().lower():
        raise ScoreValidationError(
            f"T={t} maps to '{expected.value}' but report states '{reported_descriptor}'"
        )


# ---------------------------------------------------------------------------
# ADOS-2 Calibrated Severity Score interpretation
# ---------------------------------------------------------------------------

def ados2_css_to_severity(css: int) -> ADOS2Severity:
    if css <= 2:
        return ADOS2Severity.MINIMAL
    if css <= 4:
        return ADOS2Severity.LIMITED
    if css <= 7:
        return ADOS2Severity.MODERATE
    if css <= 10:
        return ADOS2Severity.HIGH
    raise ValueError(f"ADOS-2 CSS {css} out of valid range (1-10)")


def ados2_meets_cutoff(total_score: int, module: int, comparison_score: int) -> bool:
    """
    Returns True if ADOS-2 total score meets or exceeds ASD classification cutoff.
    Cutoffs per ADOS-2 manual (Lord et al., 2012) — Module 1-4.
    These are approximate; full algorithm requires algorithm type (standard vs. revised).
    """
    cutoffs = {
        1: 16,  # Module 1 ASD cutoff (standard algorithm)
        2: 9,
        3: 7,
        4: 7,
    }
    if module not in cutoffs:
        raise ValueError(f"Module {module} not recognized (valid: 1-4)")
    return total_score >= cutoffs[module]
