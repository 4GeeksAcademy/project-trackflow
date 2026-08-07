"""External tools used by the TrackFlow support agent."""

from __future__ import annotations

import os
from datetime import datetime
from typing import Literal

import httpx
from pydantic import BaseModel, ValidationError


INCIDENT_API_BASE_URL = os.getenv(
    "INCIDENT_API_BASE_URL",
    "http://localhost:8000",
).rstrip("/")

INCIDENT_API_TIMEOUT_SECONDS = 5.0


class TicketLookupInput(BaseModel):
    """Typed input contract for an incident lookup."""

    incident_id: int


class IncidentRecord(BaseModel):
    """Incident fields returned by the existing TrackFlow incident service."""

    id: int
    title: str
    description: str
    category: str
    status: Literal["open", "in_progress", "resolved", "discarded"]
    origin: Literal["customer", "branch", "internal"]
    branch: Literal[
        "central",
        "la_warehouse",
        "la_office",
        "zaragoza_warehouse",
        "zaragoza_office",
    ]
    created_at: datetime
    updated_at: datetime


class TicketLookupResult(BaseModel):
    """Typed result returned to the LangGraph workflow."""

    success: bool
    incident: IncidentRecord | None = None
    error: str | None = None


def lookup_ticket(payload: TicketLookupInput) -> TicketLookupResult:
    """Read the current incident directly from the existing incident manager."""
    url = f"{INCIDENT_API_BASE_URL}/api/incidents/{payload.incident_id}"

    try:
        response = httpx.get(
            url,
            timeout=INCIDENT_API_TIMEOUT_SECONDS,
        )

        if response.status_code == 404:
            return TicketLookupResult(
                success=False,
                error=f"Incident {payload.incident_id} was not found.",
            )

        response.raise_for_status()

        incident = IncidentRecord.model_validate(response.json())

        return TicketLookupResult(
            success=True,
            incident=incident,
        )

    except httpx.TimeoutException:
        return TicketLookupResult(
            success=False,
            error="The incident service timed out.",
        )

    except httpx.RequestError:
        return TicketLookupResult(
            success=False,
            error="The incident service is currently unavailable.",
        )

    except httpx.HTTPStatusError as error:
        return TicketLookupResult(
            success=False,
            error=(
                "The incident service returned an unexpected "
                f"HTTP {error.response.status_code} response."
            ),
        )

    except (ValidationError, ValueError):
        return TicketLookupResult(
            success=False,
            error="The incident service returned an invalid response.",
        )
