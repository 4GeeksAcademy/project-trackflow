import logging
import os
from datetime import datetime
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

TELEMETRY_ENDPOINT = os.getenv(
    "TELEMETRY_ENDPOINT",
    "/telemetry/events",
)

router = APIRouter(prefix="/telemetry", tags=["telemetry"])


class TelemetryEvent(BaseModel):
    eventId: str
    timestamp: datetime
    sessionId: str
    userId: str
    event_type: str
    schemaVersion: str
    requestId: str
    properties: dict[str, Any] = Field(default_factory=dict)


class TelemetryBatch(BaseModel):
    events: list[TelemetryEvent]


@router.post("/events")
async def receive_telemetry(batch: TelemetryBatch):
    logger.info(
        "Configured telemetry endpoint: %s",
        TELEMETRY_ENDPOINT,
    )

    logger.info(
        "Received telemetry batch with %s events",
        len(batch.events),
    )

    for event in batch.events:
        logger.info(
            "Telemetry event received: event_type=%s eventId=%s requestId=%s",
            event.event_type,
            event.eventId,
            event.requestId,
        )

    return {"received": len(batch.events)}