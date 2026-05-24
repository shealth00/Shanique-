"""
Agent 2 — Clinical Reasoning.

Applies the deterministic rules engine to every score in ClinicalInput,
producing ScoreInterpretation objects and DiagnosticFlag objects.

No LLM is used for numeric interpretation — only for generating the
qualitative narrative that contextualises each score. The LLM narrative
is strictly constrained: it receives the computed descriptor and score
and must only elaborate, never contradict the numbers.
"""

from __future__ import annotations

import json
from typing import Optional

from psych_eval_system.agents.base_agent import BaseAgent
from psych_eval_system.models.patient import PatientAnonymized
from psych_eval_system.models.test_scores import ClinicalInput, CompositeScore, SubtestScore
from psych_eval_system.models.report import (
    ScoreInterpretation, DiagnosticFlag, ValidationIssue, ValidationSeverity
)
from psych_eval_system.rules import (
    ss_to_descriptor, scaled_to_descriptor, tscore_to_descriptor,
    behavior_tscore_to_descriptor, ss_to_percentile,
    ados2_css_to_severity, ados2_meets_cutoff, ScoreValidationError,
)


_SYSTEM_PROMPT = """You are a licensed clinical psychologist assistant generating interpretive
narratives for a formal psychological evaluation report.

Rules:
1. You are given a test name, composite name, numeric scores, and the COMPUTED descriptor.
2. Your narrative MUST be consistent with the provided descriptor. Never say "average" for a score
   that maps to "Low" or "Extremely Low."
3. Keep narratives to 1-2 sentences. Use professional clinical language.
4. Do not invent information about the patient's behavior, history, or context.
5. Use the pronoun tokens exactly as provided: SUBJECT, OBJECT, POSSESSIVE.
6. Output only a JSON object: {"narrative": "..."}
"""


class ReasoningAgent(BaseAgent):
    def __init__(self) -> None:
        super().__init__("ReasoningAgent")

    async def reason(
        self,
        patient: PatientAnonymized,
        clinical: ClinicalInput,
    ) -> tuple[list[ScoreInterpretation], list[DiagnosticFlag], list[ValidationIssue]]:
        interpretations: list[ScoreInterpretation] = []
        flags: list[DiagnosticFlag] = []
        issues: list[ValidationIssue] = []

        interpretations.extend(self._interpret_wisc_v(clinical, issues))
        interpretations.extend(self._interpret_wppsi_iv(clinical, issues))
        interpretations.extend(self._interpret_wais_v(clinical, issues))
        interpretations.extend(self._interpret_rias2(clinical, issues))
        interpretations.extend(self._interpret_sb5(clinical, issues))
        interpretations.extend(self._interpret_kabc_ii(clinical, issues))
        interpretations.extend(self._interpret_achievement(clinical, issues))
        interpretations.extend(self._interpret_adaptive(clinical, issues))
        flags.extend(self._flag_autism(clinical))
        flags.extend(self._flag_intellectual_disability(clinical, interpretations))
        flags.extend(self._flag_adhd(clinical))

        return interpretations, flags, issues

    # ------------------------------------------------------------------
    # Cognitive batteries
    # ------------------------------------------------------------------

    def _interpret_wisc_v(self, clinical: ClinicalInput, issues: list) -> list[ScoreInterpretation]:
        if clinical.wisc_v is None or not clinical.wisc_v.administered:
            return []
        return self._interpret_composite_battery("WISC-V", clinical.wisc_v, issues)

    def _interpret_wppsi_iv(self, clinical: ClinicalInput, issues: list) -> list[ScoreInterpretation]:
        if clinical.wppsi_iv is None or not clinical.wppsi_iv.administered:
            return []
        return self._interpret_composite_battery("WPPSI-IV", clinical.wppsi_iv, issues)

    def _interpret_wais_v(self, clinical: ClinicalInput, issues: list) -> list[ScoreInterpretation]:
        if clinical.wais_v is None or not clinical.wais_v.administered:
            return []
        return self._interpret_composite_battery("WAIS-5", clinical.wais_v, issues)

    def _interpret_rias2(self, clinical: ClinicalInput, issues: list) -> list[ScoreInterpretation]:
        if clinical.rias_2 is None or not clinical.rias_2.administered:
            return []
        return self._interpret_composite_battery("RIAS-2", clinical.rias_2, issues)

    def _interpret_sb5(self, clinical: ClinicalInput, issues: list) -> list[ScoreInterpretation]:
        if clinical.sb5 is None or not clinical.sb5.administered:
            return []
        return self._interpret_composite_battery("SB-5", clinical.sb5, issues)

    def _interpret_kabc_ii(self, clinical: ClinicalInput, issues: list) -> list[ScoreInterpretation]:
        if clinical.kabc_ii is None or not clinical.kabc_ii.administered:
            return []
        return self._interpret_composite_battery("KABC-II", clinical.kabc_ii, issues)

    def _interpret_achievement(self, clinical: ClinicalInput, issues: list) -> list[ScoreInterpretation]:
        results = []
        for attr, label in [("ktea_3", "KTEA-3"), ("wiat_4", "WIAT-4"), ("wj_iv_ach", "WJ IV ACH")]:
            test = getattr(clinical, attr)
            if test and test.administered:
                results.extend(self._interpret_composite_battery(label, test, issues))
        return results

    def _interpret_adaptive(self, clinical: ClinicalInput, issues: list) -> list[ScoreInterpretation]:
        results = []
        for attr, label in [
            ("vineland", "Vineland-3"),
            ("abas_3_parent", "ABAS-3 Parent"),
            ("abas_3_teacher", "ABAS-3 Teacher"),
            ("bdi_2", "BDI-2"),
            ("dp_4", "DP-4"),
        ]:
            test = getattr(clinical, attr)
            if test and test.administered:
                results.extend(self._interpret_composite_battery(label, test, issues))
        return results

    def _interpret_composite_battery(
        self, test_name: str, test_obj, issues: list
    ) -> list[ScoreInterpretation]:
        results = []
        for field in vars(test_obj):
            composite = getattr(test_obj, field)
            if not isinstance(composite, CompositeScore):
                continue
            if composite.standard_score is None:
                continue
            ss = composite.standard_score
            try:
                descriptor = ss_to_descriptor(ss)
                computed_pct = ss_to_percentile(ss)
                ci = ""
                if composite.confidence_interval_low and composite.confidence_interval_high:
                    ci = f"{composite.confidence_interval_low}-{composite.confidence_interval_high}"
                # Validate reported percentile if present
                if composite.percentile is not None:
                    from psych_eval_system.rules import validate_ss_percentile
                    try:
                        validate_ss_percentile(ss, composite.percentile)
                    except ScoreValidationError as e:
                        issues.append(ValidationIssue(
                            severity=ValidationSeverity.ERROR,
                            field=f"{test_name}.{field}",
                            message=str(e),
                        ))

                results.append(ScoreInterpretation(
                    test_name=test_name,
                    composite_name=composite.name or field,
                    standard_score=ss,
                    percentile=composite.percentile or computed_pct,
                    descriptor=descriptor.value,
                    confidence_interval=ci,
                    validation_issues=[i for i in issues if test_name in i.field],
                ))
            except (ValueError, ScoreValidationError) as e:
                issues.append(ValidationIssue(
                    severity=ValidationSeverity.ERROR,
                    field=f"{test_name}.{field}",
                    message=str(e),
                    raw_value=ss,
                ))
        return results

    # ------------------------------------------------------------------
    # Diagnostic flags — pure rule-based, no LLM
    # ------------------------------------------------------------------

    def _flag_autism(self, clinical: ClinicalInput) -> list[DiagnosticFlag]:
        flags = []
        if clinical.ados_2 and clinical.ados_2.administered:
            a = clinical.ados_2
            if a.total_score is not None and a.module is not None:
                met = ados2_meets_cutoff(a.total_score, a.module, a.comparison_score or 0)
                flags.append(DiagnosticFlag(
                    domain="Autism Spectrum Disorder",
                    instrument="ADOS-2",
                    criterion=f"Module {a.module} ASD classification cutoff",
                    met=met,
                    score=a.total_score,
                    notes=f"CSS={a.calibrated_severity_score}" if a.calibrated_severity_score else "",
                ))
            if a.calibrated_severity_score is not None:
                severity = ados2_css_to_severity(a.calibrated_severity_score)
                flags.append(DiagnosticFlag(
                    domain="Autism Spectrum Disorder",
                    instrument="ADOS-2 CSS",
                    criterion="Calibrated Severity Score interpretation",
                    met=a.calibrated_severity_score >= 5,
                    score=a.calibrated_severity_score,
                    notes=severity.value,
                ))
        if clinical.scq and clinical.scq.administered and clinical.scq.total_score is not None:
            flags.append(DiagnosticFlag(
                domain="Autism Spectrum Disorder",
                instrument="SCQ",
                criterion="SCQ cutoff ≥15",
                met=clinical.scq.total_score >= 15,
                score=clinical.scq.total_score,
                cutoff=15,
            ))
        return flags

    def _flag_intellectual_disability(
        self, clinical: ClinicalInput, interpretations: list[ScoreInterpretation]
    ) -> list[DiagnosticFlag]:
        flags = []
        fsiq_tests = [i for i in interpretations if "FSIQ" in i.composite_name or "Full Scale" in i.composite_name]
        for interp in fsiq_tests:
            if interp.standard_score is not None:
                flags.append(DiagnosticFlag(
                    domain="Intellectual Disability",
                    instrument=interp.test_name,
                    criterion="FSIQ ≤ 70 (approx. -2 SD)",
                    met=interp.standard_score <= 70,
                    score=interp.standard_score,
                    cutoff=70,
                ))
        return flags

    def _flag_adhd(self, clinical: ClinicalInput) -> list[DiagnosticFlag]:
        flags = []
        for attr, label in [("basc3_parent", "BASC-3 Parent"), ("basc3_teacher", "BASC-3 Teacher")]:
            test = getattr(clinical, attr)
            if test and test.administered and test.attention_problems is not None:
                flags.append(DiagnosticFlag(
                    domain="ADHD / Attention",
                    instrument=label,
                    criterion="Attention Problems T ≥ 70 (Clinically Significant)",
                    met=test.attention_problems >= 70,
                    score=test.attention_problems,
                    cutoff=70,
                    notes=behavior_tscore_to_descriptor(test.attention_problems).value,
                ))
        return flags
