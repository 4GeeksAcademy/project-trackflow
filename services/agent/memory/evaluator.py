"""LLM-backed self-evaluation for TrackFlow agent memory."""

from __future__ import annotations

import json

from pydantic import BaseModel

from data.pipelines.rag import _openai_client, _required_env
from services.agent.memory.models import MemoryProposal, MemoryType


class MemoryEvaluation(BaseModel):
    """Structured result of the agent's memory self-evaluation."""

    should_propose: bool
    memory_type: MemoryType | None = None
    content: str | None = None
    country: str | None = None
    carrier: str | None = None
    b2b_client: str | None = None
    reason: str


def evaluate_for_memory(
    *,
    question: str,
    answer: str,
    conversation_id: str,
) -> MemoryProposal | None:
    """Evaluate whether the current interaction is worth remembering."""

    system_prompt = """
You are the memory self-evaluation step for TrackFlow's existing support agent.

Decide whether the current interaction contains durable information that would
help future support conversations.

TrackFlow permits proposals ONLY for:
1. corrected carrier assignment or coverage rules;
2. context explaining a known recurring incident or repeated incident pattern;
3. recurring B2B client preferences for monthly reports.

Never propose memory for:
- exact B2C end-customer addresses;
- exact B2B sensitive location information;
- internal warehouse routes or physical-security information;
- a single non-repeating package incident;
- active commercial contract negotiations;
- conversation closings;
- translation or other single-use tasks.

A proposal is only a candidate. It is NOT authorization to persist anything.

Return JSON only with this exact structure:
{
  "should_propose": true or false,
  "memory_type": "carrier_rule" | "recurring_incident" |
                 "b2b_report_preference" | null,
  "content": "concise durable fact" | null,
  "country": "US" | "ES" | null,
  "carrier": "carrier name" | null,
  "b2b_client": "client identifier/name" | null,
  "reason": "brief explanation"
}

If the information is not clearly memorable, set should_propose to false.
Do not assume repetition unless the interaction actually indicates it.
""".strip()

    user_prompt = f"""
User message:
{question}

Agent response:
{answer}

Evaluate this interaction for persistent TrackFlow memory.
""".strip()

    response = _openai_client().chat.completions.create(
        model=_required_env("GENERATION_MODEL"),
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0,
        response_format={"type": "json_object"},
    )

    raw = response.choices[0].message.content

    if not raw:
        return None

    try:
        evaluation = MemoryEvaluation.model_validate(json.loads(raw))
    except (json.JSONDecodeError, ValueError):
        # Memory is fail-closed: malformed evaluation never creates memory.
        return None

    if (
        not evaluation.should_propose
        or evaluation.memory_type is None
        or not evaluation.content
    ):
        return None

    country = evaluation.country
    if country not in {"US", "ES"}:
        country = None

    return MemoryProposal(
        conversation_id=conversation_id,
        memory_type=evaluation.memory_type,
        content=evaluation.content.strip(),
        country=country,
        carrier=evaluation.carrier,
        b2b_client=evaluation.b2b_client,
        originating_message=question,
        reason=evaluation.reason,
    )
