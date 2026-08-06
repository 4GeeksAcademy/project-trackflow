"""Single-responsibility nodes for the TrackFlow LangGraph agent."""

from __future__ import annotations

from data.pipelines.rag import (
    DEFAULT_SCORE_THRESHOLD,
    DEFAULT_TOP_K,
    generate_answer,
    retrieve,
)
from services.agent.state import AgentState


NO_CONTEXT_ANSWER = (
    "I couldn't find enough approved TrackFlow information to answer "
    "that confidently. Please confirm the request with the appropriate "
    "operations owner before making a commitment to the client."
)


def validate_question_node(state: AgentState) -> AgentState:
    """Validate and normalize the incoming question."""
    question = state.get("question", "").strip()

    if not question:
        return {
            "question": "",
            "error": "Question cannot be empty.",
            "answer": "",
        }

    return {
        "question": question,
        "error": None,
    }


def retrieve_context_node(state: AgentState) -> AgentState:
    """Retrieve approved TrackFlow knowledge-base chunks."""
    question = state["question"]

    chunks = retrieve(
        question,
        k=DEFAULT_TOP_K,
        min_score=DEFAULT_SCORE_THRESHOLD,
    )

    return {
        "chunks": chunks,
    }


def no_context_node(state: AgentState) -> AgentState:
    """Return the existing safe fallback when retrieval finds no context."""
    return {
        "answer": NO_CONTEXT_ANSWER,
    }


def generate_answer_node(state: AgentState) -> AgentState:
    """Generate an answer using context retrieved by the previous node."""
    question = state["question"]
    chunks = state.get("chunks", [])

    answer = generate_answer(question, chunks)

    return {
        "answer": answer,
    }


def route_after_validation(state: AgentState) -> str:
    """Route invalid questions directly to the end."""
    if state.get("error"):
        return "invalid"

    return "valid"


def route_after_retrieval(state: AgentState) -> str:
    """Route based on whether relevant context was retrieved."""
    if state.get("chunks"):
        return "context_found"

    return "no_context"