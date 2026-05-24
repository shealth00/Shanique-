"""
Agent 3 — Drafting.

Takes structured & interpreted data and renders the full report using
the Jinja2 template. For sections with LLM-generated prose, the LLM
receives only grounded facts from the structured data — never raw
unverified text.

Section omission contract:
  - Any test section where the corresponding ClinicalInput field is None
    or administered=False is COMPLETELY OMITTED from the output.
  - The drafting agent does not produce placeholder, example, or TBD text.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Optional

from jinja2 import Environment, FileSystemLoader, StrictUndefined

from psych_eval_system.agents.base_agent import BaseAgent
from psych_eval_system.models.patient import PatientAnonymized
from psych_eval_system.models.test_scores import ClinicalInput
from psych_eval_system.models.report import (
    FullReport, ReportSection, ScoreInterpretation, DiagnosticFlag
)


_TEMPLATES_DIR = Path(__file__).parent.parent / "templates"

_SECTION_SYSTEM = """You are a clinical psychologist writing a formal psychological evaluation report.

Rules:
1. Base every statement exclusively on the structured data provided. No additions.
2. Use the patient token exactly as given — never substitute a real name.
3. Use pronoun tokens: SUBJECT (he/she/they), OBJECT (him/her/them), POSSESSIVE (his/her/their).
4. If a data field is null or empty, omit that sentence entirely.
5. Write in formal third-person clinical prose, past tense for observed behaviors.
6. For test result narratives: reference the computed descriptor, the standard score, and percentile.
   Example: "PATIENT's Full Scale IQ of 68 (1st percentile) fell in the Extremely Low range."
7. Output only the section prose — no markdown headers, no JSON wrapper.
"""


class DraftingAgent(BaseAgent):
    def __init__(self) -> None:
        super().__init__("DraftingAgent")
        self._jinja = Environment(
            loader=FileSystemLoader(_TEMPLATES_DIR),
            undefined=StrictUndefined,
            trim_blocks=True,
            lstrip_blocks=True,
        )

    async def draft(
        self,
        patient: PatientAnonymized,
        clinical: ClinicalInput,
        interpretations: list[ScoreInterpretation],
        flags: list[DiagnosticFlag],
    ) -> FullReport:
        report = FullReport(patient_token=patient.token)

        sections = []
        sections.append(await self._draft_reason_for_evaluation(patient))
        sections.append(await self._draft_procedures(patient, clinical))
        sections.append(await self._draft_caregiver_interview(patient))
        sections.append(await self._draft_behavioral_observations(patient))
        sections.extend(await self._draft_test_results(patient, clinical, interpretations))
        sections.append(await self._draft_summary(patient, clinical, interpretations, flags))
        sections.append(await self._draft_recommendations(patient, clinical, flags))

        report.sections = [s for s in sections if s is not None]
        report.score_interpretations = interpretations
        report.diagnostic_flags = flags
        report.draft_markdown = self._assemble_markdown(report.sections)
        return report

    # ------------------------------------------------------------------
    # Individual section drafters
    # ------------------------------------------------------------------

    async def _draft_reason_for_evaluation(self, patient: PatientAnonymized) -> ReportSection:
        ref = patient.referral_info
        data = {
            "token": patient.token,
            "age_years": patient.age_years,
            "age_months": patient.age_months,
            "gender": patient.gender,
            "referral_source": ref.referral_source,
            "primary_concerns": ref.primary_concerns,
            "clinic_name": ref.clinic_name,
        }
        prose = await self._call(
            _SECTION_SYSTEM,
            f"Write the REASON FOR EVALUATION section.\nData: {json.dumps(data, default=str)}",
        )
        return ReportSection(
            section_id="reason_for_evaluation",
            title="REASON FOR EVALUATION",
            content=prose,
            grounded_claims=[str(c) for c in ref.primary_concerns],
        )

    async def _draft_procedures(
        self, patient: PatientAnonymized, clinical: ClinicalInput
    ) -> ReportSection:
        administered = clinical.administered_tests()
        if not administered:
            administered = ["Behavioral Observations", "Clinical Interview"]
        prose = await self._call(
            _SECTION_SYSTEM,
            f"Write the PSYCHODIAGNOSTIC PROCEDURES section listing only these tests: {administered}",
        )
        return ReportSection(
            section_id="procedures",
            title="PSYCHODIAGNOSTIC PROCEDURES",
            content=prose,
            grounded_claims=administered,
        )

    async def _draft_caregiver_interview(self, patient: PatientAnonymized) -> ReportSection:
        data = {
            "token": patient.token,
            "age_years": patient.age_years,
            "age_months": patient.age_months,
            "gender": patient.gender,
            "family_info": patient.family_info.model_dump(),
            "developmental_history": patient.developmental_history.model_dump(),
            "educational_history": patient.educational_history.model_dump(),
        }
        prose = await self._call(
            _SECTION_SYSTEM,
            f"Write the CAREGIVER INTERVIEW section.\nData: {json.dumps(data, default=str)}",
            max_tokens=2048,
        )
        return ReportSection(
            section_id="caregiver_interview",
            title="CAREGIVER INTERVIEW",
            content=prose,
        )

    async def _draft_behavioral_observations(self, patient: PatientAnonymized) -> ReportSection:
        obs = patient.behavioral_observations
        data = {
            "token": patient.token,
            "gender": patient.gender,
            "observations": obs.model_dump(),
        }
        prose = await self._call(
            _SECTION_SYSTEM,
            f"Write the BEHAVIORAL OBSERVATIONS section.\nData: {json.dumps(data, default=str)}",
            max_tokens=1024,
        )
        return ReportSection(
            section_id="behavioral_observations",
            title="BEHAVIORAL OBSERVATIONS",
            content=prose,
        )

    async def _draft_test_results(
        self,
        patient: PatientAnonymized,
        clinical: ClinicalInput,
        interpretations: list[ScoreInterpretation],
    ) -> list[ReportSection]:
        sections = []

        test_map = [
            ("wisc_v", "WISC-V", "Wechsler Intelligence Scale for Children, Fifth Edition"),
            ("wppsi_iv", "WPPSI-IV", "Wechsler Preschool and Primary Scale of Intelligence, Fourth Edition"),
            ("wais_v", "WAIS-5", "Wechsler Adult Intelligence Scale, Fifth Edition"),
            ("rias_2", "RIAS-2", "Reynolds Intellectual Assessment Scales, Second Edition"),
            ("sb5", "SB-5", "Stanford-Binet, Fifth Edition"),
            ("kabc_ii", "KABC-II", "Kaufman Assessment Battery for Children, Second Edition"),
            ("wj_iv_cog", "WJ IV COG", "Woodcock-Johnson IV Tests of Cognitive Abilities"),
            ("wj_iv_ecad", "WJ IV ECAD", "Woodcock-Johnson IV Tests of Early Cognitive and Academic Development"),
            ("wnv", "WNV", "Wechsler Nonverbal Scale of Ability"),
            ("ptoni", "PTONI", "Primary Test of Nonverbal Intelligence"),
            ("ctoni_2", "CTONI-2", "Comprehensive Test of Nonverbal Intelligence, Second Edition"),
            ("ktea_3", "KTEA-3", "Kaufman Tests of Educational Achievement, Third Edition"),
            ("wiat_4", "WIAT-4", "Wechsler Individual Achievement Test, Fourth Edition"),
            ("wj_iv_ach", "WJ IV ACH", "Woodcock-Johnson IV Tests of Achievement"),
            ("bdi_2", "BDI-2", "Battelle Developmental Inventory, Second Edition"),
            ("dp_4", "DP-4", "Developmental Profile, Fourth Edition"),
            ("vineland", "Vineland-3", "Vineland Adaptive Behavior Scales, Third Edition"),
            ("abas_3_parent", "ABAS-3 Parent", "Adaptive Behavior Assessment System, Third Edition – Parent Form"),
            ("abas_3_teacher", "ABAS-3 Teacher", "Adaptive Behavior Assessment System, Third Edition – Teacher Form"),
            ("ados_2", "ADOS-2", "Autism Diagnostic Observation Schedule, Second Edition"),
            ("cars_2", "CARS-2", "Childhood Autism Rating Scale, Second Edition"),
            ("srs_2_parent", "SRS-2 Parent", "Social Responsiveness Scale, Second Edition – Parent"),
            ("srs_2_teacher", "SRS-2 Teacher", "Social Responsiveness Scale, Second Edition – Teacher"),
            ("gars_3_parent", "GARS-3 Parent", "Gilliam Autism Rating Scale, Third Edition – Parent"),
            ("basc3_parent", "BASC-3 Parent", "Behavior Assessment System for Children, Third Edition – Parent"),
            ("basc3_teacher", "BASC-3 Teacher", "Behavior Assessment System for Children, Third Edition – Teacher"),
            ("brief", "BRIEF", "Behavior Rating Inventory of Executive Function"),
        ]

        for attr, short_name, full_name in test_map:
            test_obj = getattr(clinical, attr, None)
            if test_obj is None or not test_obj.administered:
                continue  # OMIT — never fabricate

            test_interps = [i for i in interpretations if i.test_name == short_name]
            table_md = self._build_score_table(test_interps, test_obj)

            narrative_data = {
                "test_full_name": full_name,
                "test_short_name": short_name,
                "patient_token": patient.token,
                "gender": patient.gender,
                "age_years": patient.age_years,
                "scores": [i.model_dump() for i in test_interps],
            }
            narrative = await self._call(
                _SECTION_SYSTEM,
                f"Write a 2-4 sentence interpretive narrative for the {full_name} section.\n"
                f"Data: {json.dumps(narrative_data, default=str)}\n"
                "Reference the specific composite score, descriptor, and percentile. "
                "Do not mention tests that were not administered. "
                "Do not invent behavioral observations not listed in the data.",
                max_tokens=512,
            )

            content = f"***{full_name} ({short_name})***\n\n{table_md}\n\n{narrative}"
            sections.append(ReportSection(
                section_id=f"test_{attr}",
                title=full_name,
                content=content,
                grounded_claims=[f"{i.composite_name}: SS={i.standard_score}, {i.descriptor}" for i in test_interps],
            ))

        return sections

    def _build_score_table(self, interpretations: list[ScoreInterpretation], test_obj) -> str:
        if not interpretations:
            return ""
        rows = ["| Scale/Composite | Standard Score | Percentile | Descriptor |",
                "|:--|:--:|:--:|:--|"]
        for i in interpretations:
            ss = str(i.standard_score) if i.standard_score else "–"
            pct = str(i.percentile) if i.percentile else "–"
            ci = f" ({i.confidence_interval})" if i.confidence_interval else ""
            rows.append(f"| {i.composite_name} | {ss}{ci} | {pct} | {i.descriptor} |")
        return "\n".join(rows)

    async def _draft_summary(
        self,
        patient: PatientAnonymized,
        clinical: ClinicalInput,
        interpretations: list[ScoreInterpretation],
        flags: list[DiagnosticFlag],
    ) -> ReportSection:
        data = {
            "patient_token": patient.token,
            "age_years": patient.age_years,
            "gender": patient.gender,
            "score_interpretations": [i.model_dump() for i in interpretations[:10]],
            "diagnostic_flags": [f.model_dump() for f in flags],
            "referral_concerns": patient.referral_info.primary_concerns,
        }
        prose = await self._call(
            _SECTION_SYSTEM,
            f"Write the SUMMARY AND CLINICAL IMPRESSIONS section.\n"
            f"Data: {json.dumps(data, default=str)}\n"
            "Synthesise findings across all administered tests. "
            "Reference only tests and scores provided. "
            "State diagnostic impressions as hypotheses consistent with the data, not as certainties. "
            "Use DSM-5-TR language where appropriate.",
            max_tokens=2048,
        )
        return ReportSection(
            section_id="summary",
            title="SUMMARY AND CLINICAL IMPRESSIONS",
            content=prose,
            grounded_claims=[f.criterion for f in flags if f.met],
        )

    async def _draft_recommendations(
        self,
        patient: PatientAnonymized,
        clinical: ClinicalInput,
        flags: list[DiagnosticFlag],
    ) -> ReportSection:
        met_flags = [f for f in flags if f.met]
        data = {
            "patient_token": patient.token,
            "age_years": patient.age_years,
            "gender": patient.gender,
            "educational_history": patient.educational_history.model_dump(),
            "diagnostic_flags": [f.model_dump() for f in met_flags],
            "referral_concerns": patient.referral_info.primary_concerns,
        }
        prose = await self._call(
            _SECTION_SYSTEM,
            f"Write the RECOMMENDATIONS section.\n"
            f"Data: {json.dumps(data, default=str)}\n"
            "Provide numbered, evidence-based recommendations tailored to the data. "
            "Include academic, therapeutic, and community support recommendations as appropriate. "
            "Do not recommend services not warranted by the data.",
            max_tokens=1024,
        )
        return ReportSection(
            section_id="recommendations",
            title="RECOMMENDATIONS",
            content=prose,
        )

    # ------------------------------------------------------------------
    # Assembly
    # ------------------------------------------------------------------

    def _assemble_markdown(self, sections: list[ReportSection]) -> str:
        parts = []
        for section in sections:
            parts.append(f"## {section.title}\n\n{section.content}\n")
        return "\n---\n\n".join(parts)
