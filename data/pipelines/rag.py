"""TrackFlow RAG retrieval and answer-generation pipeline."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from openai import OpenAI
from qdrant_client import QdrantClient

from data.process.rag import embed


PROJECT_ROOT = Path(__file__).resolve().parents[2]
ENV_PATH = PROJECT_ROOT / ".env"

load_dotenv(ENV_PATH)

DEFAULT_TOP_K = 3
DEFAULT_SCORE_THRESHOLD = 0.30


def _required_env(name: str) -> str:
    value = os.getenv(name, "").strip()

    if not value:
        raise RuntimeError(
            f"Missing required environment variable: {name}. "
            f"Add it to {ENV_PATH}."
        )

    return value


def _openai_client() -> OpenAI:
    base_url = _required_env("OPENAI_BASE_URL").rstrip("/")

    if not base_url.endswith("/v1"):
        base_url = f"{base_url}/v1"

    return OpenAI(
        api_key=_required_env("OPENAI_API_KEY"),
        base_url=base_url,
    )


def _qdrant_client() -> QdrantClient:
    api_key = os.getenv("QDRANT_API_KEY", "").strip() or None

    return QdrantClient(
        url=_required_env("QDRANT_URL"),
        api_key=api_key,
    )


def retrieve(
    question: str,
    *,
    top_k: int = DEFAULT_TOP_K,
    score_threshold: float = DEFAULT_SCORE_THRESHOLD,
) -> list[dict[str, Any]]:
    """Retrieve the most relevant TrackFlow knowledge-base chunks."""
    cleaned_question = question.strip()

    if not cleaned_question:
        raise ValueError("Question cannot be empty.")

    if top_k < 1:
        raise ValueError("top_k must be at least 1.")

    query_vector = embed(cleaned_question)

    response = _qdrant_client().query_points(
        collection_name=_required_env("QDRANT_COLLECTION"),
        query=query_vector,
        limit=top_k,
        score_threshold=score_threshold,
        with_payload=True,
        with_vectors=False,
    )

    results: list[dict[str, Any]] = []

    for point in response.points:
        payload = point.payload or {}

        results.append(
            {
                "id": str(point.id),
                "score": float(point.score),
                "company": payload.get("company"),
                "source_document": payload.get("source_document"),
                "section": payload.get("section"),
                "language": payload.get("language"),
                "chunk_index": payload.get("chunk_index"),
                "text": payload.get("text", ""),
            }
        )

    return results


def _build_context(chunks: list[dict[str, Any]]) -> str:
    """Format retrieved chunks for the generation prompt."""
    context_parts: list[str] = []

    for index, chunk in enumerate(chunks, start=1):
        context_parts.append(
            "\n".join(
                [
                    f"[Source {index}]",
                    f"Document: {chunk['source_document']}",
                    f"Section: {chunk['section']}",
                    f"Chunk index: {chunk['chunk_index']}",
                    f"Content: {chunk['text']}",
                ]
            )
        )

    return "\n\n".join(context_parts)


def query(
    question: str,
    *,
    top_k: int = DEFAULT_TOP_K,
    score_threshold: float = DEFAULT_SCORE_THRESHOLD,
) -> dict[str, Any]:
    """
    Retrieve relevant context and generate a salesperson-ready answer.

    The raw vector-search result is never returned as the final answer.
    """
    chunks = retrieve(
        question,
        top_k=top_k,
        score_threshold=score_threshold,
    )

    if not chunks:
        return {
            "answer": (
                "I couldn't find enough approved TrackFlow information to answer "
                "that confidently. Please confirm the request with the appropriate "
                "operations owner before making a commitment to the client."
            ),
            "sources": [],
        }

    context = _build_context(chunks)

    system_prompt = """
You are TrackFlow's internal commercial knowledge assistant.

Answer from the perspective of a careful TrackFlow salesperson speaking with
a prospect or client. Use only the retrieved context. Never invent conditions,
discounts, carrier exceptions, percentages, rates, compensation, delivery
times, or approval rules.

Mandatory business constraints:
- Never promise a delivery SLA during declared high-demand dates such as
  Black Friday, Christmas, or January Sales in Spain.
- International returns are not automatic and must always be described as
  requiring manual handling by Sofía Ramos's team.
- Storage discounts or preferential rates must always mention that negotiation
  requires Miguel Torres's approval.
- Manual carrier selection is only an exception approved by Carlos Vega.
- If the retrieved context does not support the requested condition, say that
  approval or confirmation is required rather than guessing.

Keep the answer concise, client-ready, accurate, and commercially helpful.
Do not mention vector databases, embeddings, retrieval scores, or internal
implementation details.
""".strip()

    user_prompt = f"""
Question:
{question.strip()}

Retrieved TrackFlow context:
{context}

Generate the final answer using only that context.
""".strip()

    response = _openai_client().chat.completions.create(
        model=_required_env("GENERATION_MODEL"),
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0,
    )

    answer = response.choices[0].message.content

    if not answer:
        raise RuntimeError("The generation model returned an empty answer.")

    return {
        "answer": answer.strip(),
        "sources": [
            {
                "source_document": chunk["source_document"],
                "section": chunk["section"],
                "chunk_index": chunk["chunk_index"],
                "score": chunk["score"],
            }
            for chunk in chunks
        ],
    }


if __name__ == "__main__":
    test_question = "What is the standard return window?"
    result = query(test_question)

    print(f"Question: {test_question}")
    print(f"Answer: {result['answer']}")
    print(f"Sources: {result['sources']}")
