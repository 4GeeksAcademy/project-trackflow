"""HTTP routes for the TrackFlow commercial knowledge assistant."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from data.pipelines.rag import query


router = APIRouter(prefix="/knowledge", tags=["knowledge"])


class KnowledgeQueryRequest(BaseModel):
    """Request body for a TrackFlow knowledge-base question."""

    question: str = Field(
        ...,
        min_length=2,
        max_length=1000,
        examples=["What is the standard return window?"],
    )
    top_k: int = Field(default=3, ge=1, le=10)
    score_threshold: float = Field(default=0.30, ge=0.0, le=1.0)


class KnowledgeSource(BaseModel):
    """Traceable source metadata returned with the generated answer."""

    source_document: str
    section: str
    chunk_index: int
    score: float


class KnowledgeQueryResponse(BaseModel):
    """Generated answer and the chunks used as supporting sources."""

    answer: str
    sources: list[KnowledgeSource]


@router.post("/query", response_model=KnowledgeQueryResponse)
def ask_knowledge_base(
    request: KnowledgeQueryRequest,
) -> dict[str, Any]:
    """
    Generate an answer from retrieved TrackFlow knowledge-base context.

    The endpoint never returns a raw vector-search result as the final answer.
    """
    try:
        return query(
            request.question,
            top_k=request.top_k,
            score_threshold=request.score_threshold,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="The TrackFlow knowledge assistant could not answer the question.",
        ) from exc
