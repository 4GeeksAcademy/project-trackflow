"""OAuth-protected MCP server exposing TrackFlow company tools."""

from __future__ import annotations

import logging
from typing import Any, Literal

from fastmcp import FastMCP
from mcpauth import MCPAuth
from mcpauth.config import AuthServerType
from mcpauth.exceptions import (
    BearerAuthExceptionCode,
    MCPAuthBearerAuthException,
)
from mcpauth.utils import fetch_server_config
from starlette.applications import Starlette
from starlette.middleware import Middleware
from starlette.routing import Mount

from mcps.trackflow.client import request_trackflow
from mcps.trackflow.config import (
    INCIDENT_READ_SCOPE,
    INCIDENT_WRITE_SCOPE,
    INVENTORY_READ_SCOPE,
    MCP_AUTH_ISSUER,
    MCP_RESOURCE_URL,
)


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger("trackflow.mcp")


# MCP Auth obtains the OAuth/OIDC provider metadata and validates bearer JWTs.
auth_server_config = fetch_server_config(
    MCP_AUTH_ISSUER,
    type=AuthServerType.OIDC,
)
mcp_auth = MCPAuth(server=auth_server_config)


mcp = FastMCP(
    name="TrackFlow Company Tools",
    instructions=(
        "Authenticated tools for TrackFlow operational systems. "
        "Incident tools can read or modify incidents according to OAuth scopes. "
        "Inventory tools are strictly read-only and never modify stock, products, "
        "inbound orders, or outbound orders."
    ),
)


def require_scope(scope: str) -> None:
    """Reject authenticated users that do not hold the required OAuth scope."""

    auth_info = mcp_auth.auth_info

    if auth_info is None:
        raise MCPAuthBearerAuthException(
            BearerAuthExceptionCode.INVALID_TOKEN
        )

    if scope not in auth_info.scopes:
        raise MCPAuthBearerAuthException(
            BearerAuthExceptionCode.MISSING_REQUIRED_SCOPES
        )


def audit(tool: str, **arguments: Any) -> None:
    """Record every MCP tool invocation without logging bearer tokens."""

    auth_info = mcp_auth.auth_info

    logger.info(
        "tool=%s subject=%s client_id=%s scopes=%s arguments=%s",
        tool,
        auth_info.subject if auth_info else None,
        auth_info.client_id if auth_info else None,
        auth_info.scopes if auth_info else [],
        arguments,
    )


@mcp.tool(
    name="get_incident",
    description=(
        "Get the current live TrackFlow incident by numeric incident ID. "
        "This is a read-only incident operation and requires incidents:read."
    ),
)
async def get_incident(incident_id: int) -> dict[str, Any]:
    require_scope(INCIDENT_READ_SCOPE)
    audit("get_incident", incident_id=incident_id)

    return await request_trackflow(
        "GET",
        f"/api/incidents/{incident_id}",
    )


@mcp.tool(
    name="list_incidents",
    description=(
        "List TrackFlow incidents. Optional filters are status, origin, branch, "
        "and category. This operation does not modify incidents and requires "
        "incidents:read."
    ),
)
async def list_incidents(
    status: str | None = None,
    origin: str | None = None,
    branch: str | None = None,
    category: str | None = None,
) -> list[dict[str, Any]]:
    require_scope(INCIDENT_READ_SCOPE)
    audit(
        "list_incidents",
        status=status,
        origin=origin,
        branch=branch,
        category=category,
    )

    params = {
        key: value
        for key, value in {
            "status": status,
            "origin": origin,
            "branch": branch,
            "category": category,
        }.items()
        if value is not None
    }

    return await request_trackflow(
        "GET",
        "/api/incidents",
        params=params,
    )


@mcp.tool(
    name="get_incident_summary",
    description=(
        "Return aggregate TrackFlow incident counts by status, category, origin, "
        "and branch. This is read-only and requires incidents:read."
    ),
)
async def get_incident_summary() -> dict[str, Any]:
    require_scope(INCIDENT_READ_SCOPE)
    audit("get_incident_summary")

    return await request_trackflow(
        "GET",
        "/api/incidents/summary",
    )


@mcp.tool(
    name="create_incident",
    description=(
        "Create a TrackFlow incident using the existing Incidents Manager. "
        "Required fields are title, description, category, status, origin, and "
        "branch. This modifies incident data and requires incidents:write."
    ),
)
async def create_incident(
    title: str,
    description: str,
    category: Literal[
        "lost_parcel",
        "delivery_failure",
        "inventory_discrepancy",
        "carrier_issue",
        "returns_issue",
        "warehouse_incident",
        "system_failure",
        "client_complaint",
        "other",
    ],
    status: Literal["open", "in_progress", "resolved", "discarded"],
    origin: Literal["customer", "branch", "internal"],
    branch: Literal[
        "central",
        "la_warehouse",
        "la_office",
        "zaragoza_warehouse",
        "zaragoza_office",
    ],
) -> dict[str, Any]:
    require_scope(INCIDENT_WRITE_SCOPE)
    audit(
        "create_incident",
        title=title,
        category=category,
        status=status,
        origin=origin,
        branch=branch,
    )

    return await request_trackflow(
        "POST",
        "/api/incidents",
        json={
            "title": title,
            "description": description,
            "category": category,
            "status": status,
            "origin": origin,
            "branch": branch,
        },
    )


@mcp.tool(
    name="update_incident_status",
    description=(
        "Change the status of an existing TrackFlow incident. Status changes are "
        "sent only through PATCH /api/incidents/{id}/status so the existing "
        "Incidents Manager lifecycle validation is always enforced. Requires "
        "incidents:write."
    ),
)
async def update_incident_status(
    incident_id: int,
    status: Literal["open", "in_progress", "resolved", "discarded"],
) -> dict[str, Any]:
    require_scope(INCIDENT_WRITE_SCOPE)
    audit(
        "update_incident_status",
        incident_id=incident_id,
        status=status,
    )

    return await request_trackflow(
        "PATCH",
        f"/api/incidents/{incident_id}/status",
        json={"status": status},
    )


@mcp.tool(
    name="list_inventory_products",
    description=(
        "List TrackFlow inventory products/SKUs and their computed current stock. "
        "Inventory access through MCP is strictly read-only. Requires "
        "inventory:read."
    ),
)
async def list_inventory_products() -> list[dict[str, Any]]:
    require_scope(INVENTORY_READ_SCOPE)
    audit("list_inventory_products")

    return await request_trackflow(
        "GET",
        "/inventory/products",
    )


@mcp.tool(
    name="get_inventory_product",
    description=(
        "Get one TrackFlow inventory product/SKU by numeric product ID, including "
        "its current stock. Inventory access through MCP is strictly read-only. "
        "Requires inventory:read."
    ),
)
async def get_inventory_product(product_id: int) -> dict[str, Any]:
    require_scope(INVENTORY_READ_SCOPE)
    audit("get_inventory_product", product_id=product_id)

    return await request_trackflow(
        "GET",
        f"/inventory/products/{product_id}",
    )


@mcp.tool(
    name="list_inventory_movements",
    description=(
        "List TrackFlow inbound and outbound stock movements. This operation "
        "only reads inventory history and requires inventory:read."
    ),
)
async def list_inventory_movements() -> list[dict[str, Any]]:
    require_scope(INVENTORY_READ_SCOPE)
    audit("list_inventory_movements")

    return await request_trackflow(
        "GET",
        "/inventory/orders",
    )


@mcp.tool(
    name="inventory_write_attempt",
    description=(
        "Explicit permission boundary for inventory mutations. TrackFlow MCP "
        "inventory access is read-only; requests to create products, receive "
        "stock, ship stock, or otherwise modify inventory are always rejected."
    ),
)
async def inventory_write_attempt(
    action: Literal[
        "create_product",
        "create_inbound_order",
        "create_outbound_order",
        "update_inventory",
        "delete_inventory",
    ],
) -> dict[str, Any]:
    audit("inventory_write_attempt", action=action)

    raise PermissionError(
        "Inventory mutations are forbidden through the MCP server. "
        "Inventory tools are read-only by design."
    )


# FastMCP 3.x Streamable HTTP application.
mcp_http_app = mcp.http_app(
    path="/mcp",
    transport="streamable-http",
    stateless_http=True,
)


# Bearer authentication protects every MCP protocol request.
bearer_auth = Middleware(
    mcp_auth.bearer_auth_middleware(
        "jwt",
        audience=MCP_RESOURCE_URL,
        show_error_details=True,
    )
)


# MCP Auth metadata remains publicly discoverable while the MCP endpoint itself
# requires a valid OAuth bearer token.
app = Starlette(
    routes=[
        mcp_auth.metadata_route(),
        Mount("/", app=mcp_http_app, middleware=[bearer_auth]),
    ],
    lifespan=mcp_http_app.lifespan,
)


if __name__ == "__main__":
    import uvicorn

    from mcps.trackflow.config import MCP_HOST, MCP_PORT

    uvicorn.run(
        "mcps.trackflow.server:app",
        host=MCP_HOST,
        port=MCP_PORT,
        reload=False,
    )
