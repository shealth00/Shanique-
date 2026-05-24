"""
Shared async LLM client with prompt caching.

All agents inherit from BaseAgent. The client is shared across agents
within a pipeline run to maximise cache hit rates.
"""

from __future__ import annotations

import json
import os
from typing import Any, Optional

import anthropic


MODEL = os.getenv("CLAUDE_MODEL", "claude-sonnet-4-6")
MAX_TOKENS = 8192


class BaseAgent:
    _client: Optional[anthropic.AsyncAnthropic] = None

    def __init__(self, name: str) -> None:
        self.name = name

    @classmethod
    def _get_client(cls) -> anthropic.AsyncAnthropic:
        if cls._client is None:
            cls._client = anthropic.AsyncAnthropic(
                api_key=os.environ["ANTHROPIC_API_KEY"]
            )
        return cls._client

    async def _call(
        self,
        system: str,
        user: str,
        *,
        max_tokens: int = MAX_TOKENS,
        cache_system: bool = True,
    ) -> str:
        client = self._get_client()

        system_blocks: list[dict] = [
            {
                "type": "text",
                "text": system,
                **({"cache_control": {"type": "ephemeral"}} if cache_system else {}),
            }
        ]

        msg = await client.messages.create(
            model=MODEL,
            max_tokens=max_tokens,
            system=system_blocks,
            messages=[{"role": "user", "content": user}],
        )
        return msg.content[0].text

    async def _call_json(
        self,
        system: str,
        user: str,
        *,
        max_tokens: int = MAX_TOKENS,
    ) -> Any:
        """Call LLM and parse JSON response. Raises ValueError if not valid JSON."""
        raw = await self._call(system, user, max_tokens=max_tokens)
        # Strip markdown code fences if present
        text = raw.strip()
        if text.startswith("```"):
            text = text.split("```", 2)[1]
            if text.startswith("json"):
                text = text[4:]
            text = text.rsplit("```", 1)[0]
        try:
            return json.loads(text.strip())
        except json.JSONDecodeError as exc:
            raise ValueError(
                f"[{self.name}] LLM returned non-JSON output: {raw[:500]}"
            ) from exc
