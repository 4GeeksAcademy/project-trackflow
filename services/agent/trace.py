"""Structured trace and guardrail observability for TrackFlow agent runs."""

from __future__ import annotations

import json
from collections import Counter
from datetime import UTC, datetime
from pathlib import Path
from threading import Lock
from typing import Any


TRACE_DIR = Path(__file__).resolve().parents[2] / "data" / "eval"
TRACE_FILE = TRACE_DIR / "agent_traces.jsonl"
GUARDRAIL_FILE = TRACE_DIR / "guardrail_events.jsonl"

_trace_lock = Lock()
_guardrail_lock = Lock()


def record_trace(
    *,
    run_id: str,
    question: str,
    result: dict[str, Any],
    events: list[dict[str, Any]],
) -> dict[str, Any]:
    """Persist a structured, queryable trace for one complete agent run."""
    TRACE_DIR.mkdir(parents=True, exist_ok=True)

    trace = {
        "run_id": run_id,
        "timestamp": datetime.now(UTC).isoformat(),
        "question": question,
        "events": events,
        "final_state": result,
    }

    with _trace_lock:
        with TRACE_FILE.open("a", encoding="utf-8") as file:
            file.write(
                json.dumps(
                    trace,
                    ensure_ascii=False,
                    default=str,
                )
                + "\n"
            )

    return trace


def get_trace(run_id: str) -> dict[str, Any] | None:
    """Return a previously recorded trace by run ID."""
    if not TRACE_FILE.exists():
        return None

    with TRACE_FILE.open("r", encoding="utf-8") as file:
        for line in file:
            if not line.strip():
                continue

            trace = json.loads(line)

            if trace.get("run_id") == run_id:
                return trace

    return None


def record_guardrail_event(
    *,
    run_id: str,
    question: str,
    guardrail_type: str,
    reason: str,
    action: str,
) -> dict[str, Any]:
    """Persist one guardrail trigger for security observability."""
    TRACE_DIR.mkdir(parents=True, exist_ok=True)

    event = {
        "run_id": run_id,
        "timestamp": datetime.now(UTC).isoformat(),
        "question": question,
        "guardrail_type": guardrail_type,
        "reason": reason,
        "action": action,
    }

    with _guardrail_lock:
        with GUARDRAIL_FILE.open("a", encoding="utf-8") as file:
            file.write(
                json.dumps(
                    event,
                    ensure_ascii=False,
                    default=str,
                )
                + "\n"
            )

    return event


def get_guardrail_counts() -> dict[str, int]:
    """Return trigger counts grouped by guardrail type."""
    if not GUARDRAIL_FILE.exists():
        return {}

    counter: Counter[str] = Counter()

    with GUARDRAIL_FILE.open("r", encoding="utf-8") as file:
        for line in file:
            if not line.strip():
                continue

            event = json.loads(line)
            guardrail_type = event.get("guardrail_type")

            if guardrail_type:
                counter[str(guardrail_type)] += 1

    return dict(counter)