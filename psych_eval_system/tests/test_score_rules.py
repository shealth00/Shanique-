"""
Tests for the deterministic score rules engine.

Every Kranzler & Floyd boundary case is tested.
Percentile-to-SS arithmetic is verified bidirectionally.
Validation functions are tested for both correct and incorrect inputs.
"""

import pytest
from psych_eval_system.rules.score_interpreter import (
    Descriptor,
    BehaviorDescriptor,
    ADOS2Severity,
    ss_to_descriptor,
    scaled_to_descriptor,
    tscore_to_descriptor,
    behavior_tscore_to_descriptor,
    ss_to_percentile,
    validate_ss_descriptor,
    validate_ss_percentile,
    validate_scaled_descriptor,
    validate_tscore_descriptor,
    ados2_css_to_severity,
    ados2_meets_cutoff,
    ScoreValidationError,
)


class TestSSToDescriptor:
    @pytest.mark.parametrize("ss,expected", [
        (140, Descriptor.EXTREMELY_HIGH),
        (145, Descriptor.EXTREMELY_HIGH),
        (200, Descriptor.EXTREMELY_HIGH),
        (139, Descriptor.VERY_HIGH),
        (130, Descriptor.VERY_HIGH),
        (129, Descriptor.HIGH),
        (120, Descriptor.HIGH),
        (119, Descriptor.HIGH_AVERAGE),
        (110, Descriptor.HIGH_AVERAGE),
        (109, Descriptor.AVERAGE),
        (100, Descriptor.AVERAGE),
        (90,  Descriptor.AVERAGE),
        (89,  Descriptor.LOW_AVERAGE),
        (80,  Descriptor.LOW_AVERAGE),
        (79,  Descriptor.LOW),
        (70,  Descriptor.LOW),
        (69,  Descriptor.VERY_LOW),
        (60,  Descriptor.VERY_LOW),
        (59,  Descriptor.EXTREMELY_LOW),
        (50,  Descriptor.EXTREMELY_LOW),
        (1,   Descriptor.EXTREMELY_LOW),
    ])
    def test_boundaries(self, ss, expected):
        assert ss_to_descriptor(ss) == expected

    def test_invalid_raises(self):
        with pytest.raises(ValueError):
            ss_to_descriptor(-1)


class TestScaledToDescriptor:
    @pytest.mark.parametrize("scaled,expected", [
        (19, Descriptor.EXTREMELY_HIGH),
        (18, Descriptor.EXTREMELY_HIGH),
        (17, Descriptor.VERY_HIGH),
        (16, Descriptor.VERY_HIGH),
        (15, Descriptor.HIGH),
        (14, Descriptor.HIGH),
        (13, Descriptor.HIGH_AVERAGE),
        (12, Descriptor.HIGH_AVERAGE),
        (11, Descriptor.AVERAGE),
        (10, Descriptor.AVERAGE),
        (9,  Descriptor.AVERAGE),
        (8,  Descriptor.LOW_AVERAGE),
        (7,  Descriptor.LOW_AVERAGE),
        (6,  Descriptor.LOW),
        (5,  Descriptor.LOW),
        (4,  Descriptor.VERY_LOW),
        (3,  Descriptor.VERY_LOW),
        (2,  Descriptor.EXTREMELY_LOW),
        (1,  Descriptor.EXTREMELY_LOW),
    ])
    def test_boundaries(self, scaled, expected):
        assert scaled_to_descriptor(scaled) == expected

    def test_zero_raises(self):
        with pytest.raises(ValueError):
            scaled_to_descriptor(0)


class TestTScoreToDescriptor:
    @pytest.mark.parametrize("t,expected", [
        (77, Descriptor.EXTREMELY_HIGH),
        (80, Descriptor.EXTREMELY_HIGH),
        (76, Descriptor.VERY_HIGH),
        (70, Descriptor.VERY_HIGH),
        (69, Descriptor.HIGH),
        (64, Descriptor.HIGH),
        (63, Descriptor.HIGH_AVERAGE),
        (57, Descriptor.HIGH_AVERAGE),
        (56, Descriptor.AVERAGE),
        (50, Descriptor.AVERAGE),
        (44, Descriptor.AVERAGE),
        (43, Descriptor.LOW_AVERAGE),
        (37, Descriptor.LOW_AVERAGE),
        (36, Descriptor.LOW),
        (31, Descriptor.LOW),
        (30, Descriptor.VERY_LOW),
        (24, Descriptor.VERY_LOW),
        (23, Descriptor.EXTREMELY_LOW),
        (10, Descriptor.EXTREMELY_LOW),
    ])
    def test_boundaries(self, t, expected):
        assert tscore_to_descriptor(t) == expected


class TestBehaviorTScore:
    @pytest.mark.parametrize("t,expected", [
        (70, BehaviorDescriptor.CLINICALLY_SIGNIFICANT),
        (75, BehaviorDescriptor.CLINICALLY_SIGNIFICANT),
        (69, BehaviorDescriptor.AT_RISK),
        (61, BehaviorDescriptor.AT_RISK),
        (60, BehaviorDescriptor.AVERAGE),
        (50, BehaviorDescriptor.AVERAGE),
    ])
    def test_boundaries(self, t, expected):
        assert behavior_tscore_to_descriptor(t) == expected


class TestSSPercentile:
    @pytest.mark.parametrize("ss,expected_pct", [
        (100, 50),   # mean → 50th
        (115, 84),   # +1 SD
        (85,  16),   # -1 SD
        (130, 98),   # +2 SD
        (70,  2),    # -2 SD
        (68,  2),    # Emma Richardson FSIQ
    ])
    def test_expected_percentiles(self, ss, expected_pct):
        computed = ss_to_percentile(ss)
        assert abs(computed - expected_pct) <= 2, f"SS={ss}: expected ~{expected_pct}, got {computed}"

    def test_clamp_at_99(self):
        assert ss_to_percentile(160) == 99

    def test_clamp_at_1(self):
        assert ss_to_percentile(40) == 1


class TestValidateFunctions:
    def test_validate_ss_descriptor_pass(self):
        validate_ss_descriptor(95, "Average")  # should not raise

    def test_validate_ss_descriptor_fail(self):
        with pytest.raises(ScoreValidationError, match="maps to"):
            validate_ss_descriptor(95, "High Average")

    def test_validate_ss_percentile_pass(self):
        validate_ss_percentile(100, 50)

    def test_validate_ss_percentile_fail(self):
        with pytest.raises(ScoreValidationError, match="percentile"):
            validate_ss_percentile(100, 84)  # 84th percentile → SS ~115, not 100

    def test_validate_scaled_descriptor_pass(self):
        validate_scaled_descriptor(10, "Average")

    def test_validate_scaled_descriptor_fail(self):
        with pytest.raises(ScoreValidationError):
            validate_scaled_descriptor(10, "High")

    def test_validate_tscore_descriptor_pass(self):
        validate_tscore_descriptor(50, "Average")

    def test_validate_tscore_descriptor_fail(self):
        with pytest.raises(ScoreValidationError):
            validate_tscore_descriptor(50, "High Average")


class TestADOS2:
    @pytest.mark.parametrize("css,expected", [
        (1,  ADOS2Severity.MINIMAL),
        (2,  ADOS2Severity.MINIMAL),
        (3,  ADOS2Severity.LIMITED),
        (4,  ADOS2Severity.LIMITED),
        (5,  ADOS2Severity.MODERATE),
        (7,  ADOS2Severity.MODERATE),
        (8,  ADOS2Severity.HIGH),
        (10, ADOS2Severity.HIGH),
    ])
    def test_css_severity(self, css, expected):
        assert ados2_css_to_severity(css) == expected

    def test_css_invalid(self):
        with pytest.raises(ValueError):
            ados2_css_to_severity(11)

    @pytest.mark.parametrize("total,module,expected_met", [
        (17, 2, True),   # Emma Richardson — above cutoff 9
        (5,  2, False),  # Below cutoff
        (16, 1, True),   # At cutoff
        (15, 1, False),  # Below Module 1 cutoff
        (7,  3, True),   # At Module 3 cutoff
    ])
    def test_cutoff(self, total, module, expected_met):
        assert ados2_meets_cutoff(total, module, 0) == expected_met
