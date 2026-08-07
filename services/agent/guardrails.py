"""Deterministic guardrails for the TrackFlow CX support agent."""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Literal


GuardrailCategory = Literal[
    "allowed",
    "casual",
    "personal_task",
    "security",
    "sensitive_data",
]


@dataclass(frozen=True)
class GuardrailDecision:
    """Result of evaluating a user request before agent execution."""

    allowed: bool
    category: GuardrailCategory
    reason: str | None = None
    response: str | None = None


JAILBREAK_PATTERNS = (
    re.compile(r"\bignore\b.{0,40}\b(previous|prior|system|developer)\b.{0,40}\binstructions?\b", re.I),
    re.compile(r"\bforget\b.{0,40}\b(trackflow|instructions?|rules?)\b", re.I),
    re.compile(r"\bact as if\b.{0,40}\b(no|without)\b.{0,20}\brules?\b", re.I),
    re.compile(r"\bact as\b.{0,40}\b(no rules|unrestricted|unfiltered)\b", re.I),
    re.compile(r"\boverride\b.{0,40}\b(system|instructions?|rules?)\b", re.I),
    re.compile(r"\breveal\b.{0,40}\b(system prompt|hidden prompt|instructions?)\b", re.I),
    re.compile(r"\bshow\b.{0,40}\b(system prompt|hidden prompt|developer message)\b", re.I),
)


PERSONAL_TASK_TERMS = (
    "write me an essay",
    "write my essay",
    "do my homework",
    "help me with my homework",
    "write code for",
    "build me a website",
    "make me a website",
    "be my therapist",
    "relationship advice",
    "dating advice",
    "personal advice",
    "write my resume",
    "write me a resume",
)


SENSITIVE_DATA_PATTERNS = (
    re.compile(r"\b(carrier|ups|fedex|dhl|mrw|seur)\b.{0,30}\b(rate|rates|pricing|price|contract|terms)\b", re.I),
    re.compile(r"\b(negotiated|commercial)\b.{0,30}\b(rate|rates|terms|pricing)\b", re.I),
    re.compile(r"\b(exact|precise)\b.{0,20}\bwarehouse\b.{0,20}\b(location|address)\b", re.I),
    re.compile(r"\binternal\b.{0,20}\b(route|routes|warehouse location|warehouse address)\b", re.I),
)


CASUAL_PATTERNS = (
    re.compile(r"^\s*(hi|hello|hey|good morning|good afternoon|good evening)[!.?\s]*$", re.I),
    re.compile(r"^\s*(thanks|thank you|thx)[!.?\s]*$", re.I),
    re.compile(r"^\s*how are you[?.!\s]*$", re.I),
)


GENERAL_LOGISTICS_TERMS = (
    "reverse logistics",
    "last mile delivery",
    "last-mile delivery",
    "what is logistics",
    "what is a return",
    "what is an sla",
)


def evaluate_input(question: str) -> GuardrailDecision:
    """Apply deterministic scope, content, and anti-injection checks."""
    normalized = " ".join(question.strip().split())
    lowered = normalized.lower()

    for pattern in JAILBREAK_PATTERNS:
        if pattern.search(normalized):
            return GuardrailDecision(
                allowed=False,
                category="security",
                reason="prompt_injection",
                response=(
                    "I can't ignore, replace, reveal, or disable my TrackFlow "
                    "instructions. I can help with TrackFlow shipment tracking, "
                    "returns, SLAs, and delivery incidents."
                ),
            )

    for pattern in SENSITIVE_DATA_PATTERNS:
        if pattern.search(normalized):
            return GuardrailDecision(
                allowed=False,
                category="sensitive_data",
                reason="restricted_company_information",
                response=(
                    "I can't provide TrackFlow's confidential carrier rates, "
                    "commercial terms, exact warehouse locations, or internal "
                    "routing details. I can help with shipment tracking, returns, "
                    "SLAs, and delivery incidents."
                ),
            )

    if any(term in lowered for term in PERSONAL_TASK_TERMS):
        return GuardrailDecision(
            allowed=False,
            category="personal_task",
            reason="unrelated_personal_assistant_request",
            response=(
                "I can't act as a general-purpose personal assistant for that "
                "request. I'm TrackFlow's logistics support agent and can help "
                "with shipment tracking, returns, SLAs, and delivery incidents."
            ),
        )

    if any(pattern.search(normalized) for pattern in CASUAL_PATTERNS):
        return GuardrailDecision(
            allowed=False,
            category="casual",
            reason="casual_conversation",
            response=(
                "Hello! I'm here to help. My role is TrackFlow logistics support, "
                "so I can assist with shipment tracking, returns, SLAs, and "
                "delivery incidents."
            ),
        )

    if any(term in lowered for term in GENERAL_LOGISTICS_TERMS):
        return GuardrailDecision(
            allowed=False,
            category="casual",
            reason="general_logistics_question",
            response=(
                "I can give brief general logistics guidance, but my main role is "
                "TrackFlow support. Ask me how the topic applies to a TrackFlow "
                "shipment, return, SLA, or delivery incident."
            ),
        )

    return GuardrailDecision(
        allowed=True,
        category="allowed",
    )