from __future__ import annotations

from sqlmodel import Session, select

from data.pipelines.rfp_intake.persistence import (
    persist_generated_section,
    update_ticket_status,
)
from data.pipelines.rfp_intake.response_generation import (
    generate_and_evaluate_section,
)
from services.api.database import engine
from services.api.models import (
    DepartmentSection,
    RFP,
    Ticket,
)


def generate_ticket_response(
    ticket_id: str,
) -> dict:
    update_ticket_status(
        ticket_id,
        "drafting",
    )

    with Session(engine) as session:
        ticket = session.get(
            Ticket,
            ticket_id,
        )

        if ticket is None:
            raise ValueError(
                f"RFP ticket not found: {ticket_id}"
            )

        if not ticket.rfp_id:
            raise ValueError(
                "Ticket has no accepted RFP."
            )

        rfp = session.get(
            RFP,
            ticket.rfp_id,
        )

        if rfp is None:
            raise ValueError(
                f"RFP not found: {ticket.rfp_id}"
            )

        sections = list(
            session.exec(
                select(DepartmentSection).where(
                    DepartmentSection.rfp_id
                    == rfp.rfp_id
                )
            ).all()
        )

        metadata = {
            "client_name": rfp.client_name,
            "client_country": rfp.client_country,
            "services_requested": rfp.services_requested,
            "monthly_volume": rfp.monthly_volume,
            "deadline": (
                rfp.deadline.isoformat()
                if rfp.deadline
                else None
            ),
            "budget_range": rfp.budget_range,
            "departments_needed": rfp.departments_needed,
        }

        section_inputs = [
            {
                "section_id": section.id,
                "department_id": section.department_id,
                "key_aspects": section.key_aspects,
            }
            for section in sections
        ]

    update_ticket_status(
        ticket_id,
        "under_evaluation",
    )

    results: list[dict] = []

    for section_input in section_inputs:
        result = generate_and_evaluate_section(
            section_id=section_input["section_id"],
            department_id=section_input["department_id"],
            metadata=metadata,
            key_aspects=section_input["key_aspects"],
        )

        persist_generated_section(
            section_id=result["section_id"],
            draft_content=result["draft_content"],
            evaluation_result=result["evaluation_result"],
            iterations=result["iterations"],
            needs_human_review=result["needs_human_review"],
        )

        results.append(result)

    return {
        "ticket_id": ticket_id,
        "status": "under_evaluation",
        "sections": results,
    }