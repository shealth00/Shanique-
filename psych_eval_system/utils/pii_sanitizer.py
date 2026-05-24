"""
PII/PHI firewall.

Replaces patient identifiers with tokens before any data is sent to an
external LLM API. Tokens are re-substituted into the final document only
by the exporter, which never calls an LLM.

Token map is kept in-memory for the duration of a single pipeline run and
discarded after export — nothing persists to disk with PII attached.
"""

from __future__ import annotations

import re
from typing import Any

from psych_eval_system.models.patient import PatientPII


class PIISanitizer:
    def __init__(self, patient: PatientPII, run_id: str = "PT_A1") -> None:
        self._run_id = run_id
        self._forward: dict[str, str] = {}   # PII → token
        self._reverse: dict[str, str] = {}   # token → PII

        self._register(patient.first_name, f"[{run_id}_FIRST]")
        self._register(patient.last_name,  f"[{run_id}_LAST]")
        self._register(patient.full_name,  f"[{run_id}_FULLNAME]")
        self._register(str(patient.birth_date), f"[{run_id}_DOB]")
        self._register(patient.city,       f"[{run_id}_CITY]")
        self._register(patient.state,      f"[{run_id}_STATE]")
        self._register(patient.address,    f"[{run_id}_ADDR]")

        for i, parent in enumerate(patient.family_info.parents):
            self._register(parent.name, f"[{run_id}_PARENT{i+1}]")

        for provider_field in [patient.referral_info.referral_source,
                                patient.referral_info.examiner]:
            # Only strip if it looks like a proper name (contains a space)
            if " " in provider_field:
                self._register(provider_field, f"[{run_id}_PROVIDER]")

    def _register(self, value: str, token: str) -> None:
        if value and value.strip():
            self._forward[value.strip()] = token
            self._reverse[token] = value.strip()

    def sanitize(self, text: str) -> str:
        """Replace all PII with tokens. Longest matches first to avoid partial replacement."""
        for pii in sorted(self._forward.keys(), key=len, reverse=True):
            if pii:
                text = text.replace(pii, self._forward[pii])
        return text

    def restore(self, text: str) -> str:
        """Re-inject real values from tokens."""
        for token, pii in self._reverse.items():
            text = text.replace(token, pii)
        return text

    def sanitize_dict(self, obj: Any) -> Any:
        """Recursively sanitize all string values in a dict/list structure."""
        if isinstance(obj, str):
            return self.sanitize(obj)
        if isinstance(obj, dict):
            return {k: self.sanitize_dict(v) for k, v in obj.items()}
        if isinstance(obj, list):
            return [self.sanitize_dict(v) for v in obj]
        return obj
