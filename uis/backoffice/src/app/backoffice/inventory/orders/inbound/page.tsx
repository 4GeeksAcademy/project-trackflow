"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  createInboundOrder,
  getInventoryProducts,
  type InventoryProduct,
  type Warehouse,
} from "@/lib/inventory";
import { track } from "@/lib/telemetry";

function normalizeWarehouse(
  warehouse: Warehouse
): "los_angeles" | "zaragoza" {
  return warehouse === "LA" ? "los_angeles" : "zaragoza";
}

function createClientId(clientName: string): string {
  return clientName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function getCreatedBy(): string {
  if (typeof window === "undefined") {
    return "unknown";
  }

  return localStorage.getItem("user_uuid") ?? "unknown";
}

function getOrderId(response: unknown): string {
  if (
    typeof response === "object" &&
    response !== null &&
    "id" in response
  ) {
    const id = (response as { id?: unknown }).id;

    if (typeof id === "string" || typeof id === "number") {
      return String(id);
    }
  }

  return crypto.randomUUID();
}

export default function InboundOrderPage() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [skuId, setSkuId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reference, setReference] = useState("");
  const [warehouse, setWarehouse] = useState<Warehouse>("LA");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === Number(skuId)),
    [products, skuId]
  );

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const data = await getInventoryProducts();
        setProducts(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load products."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadProducts();
  }, []);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!selectedProduct) {
      setError("Choose a valid SKU before registering the inbound delivery.");
      return;
    }

    const numericQuantity = Number(quantity);

    if (!Number.isInteger(numericQuantity) || numericQuantity <= 0) {
      setError("Quantity must be a positive whole number.");
      return;
    }

    if (!reference.trim()) {
      setError("Reference is required.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await createInboundOrder({
        sku_id: selectedProduct.id,
        quantity: numericQuantity,
        reference: reference.trim(),
        warehouse,
      });

      track("receiving_order_created", {
        receiving_order_id: getOrderId(response),
        sku_id: String(selectedProduct.id),
        sku_code: selectedProduct.sku,
        warehouse: normalizeWarehouse(warehouse),
        client_id: createClientId(selectedProduct.client_name),
        quantity: numericQuantity,
        carrier: "not_provided",
        created_by: getCreatedBy(),
      });

      setSkuId("");
      setQuantity("");
      setReference("");
      setWarehouse("LA");
      setSuccess("Inbound delivery registered successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to register inbound delivery."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      style={{
        padding: "32px",
        maxWidth: "760px",
        margin: "0 auto",
      }}
    >
      <header style={{ marginBottom: "24px" }}>
        <p
          style={{
            color: "#6b7280",
            marginBottom: "8px",
          }}
        >
          TrackFlow Warehouse Operations
        </p>

        <h1
          style={{
            fontSize: "32px",
            marginBottom: "8px",
          }}
        >
          Register Inbound Delivery
        </h1>

        <p style={{ color: "#6b7280" }}>
          Log stock received into the Los Angeles or Zaragoza warehouse.
        </p>
      </header>

      <nav
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        <Link href="/backoffice/inventory/products">
          Products
        </Link>

        <Link href="/backoffice/inventory/orders/outbound">
          Outbound Exit
        </Link>

        <Link href="/backoffice/inventory/orders">
          Order History
        </Link>
      </nav>

      {loading && <p>Loading SKUs...</p>}

      {error && (
        <div
          style={{
            padding: "16px",
            background: "#fee2e2",
            color: "#991b1b",
            borderRadius: "8px",
            marginBottom: "16px",
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            padding: "16px",
            background: "#dcfce7",
            color: "#166534",
            borderRadius: "8px",
            marginBottom: "16px",
          }}
        >
          {success}
        </div>
      )}

      {!loading && (
        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gap: "16px",
          }}
        >
          <label
            style={{
              display: "grid",
              gap: "6px",
            }}
          >
            <span>SKU</span>

            <select
              required
              value={skuId}
              onChange={(event) => {
                const nextSkuId = event.target.value;
                const product = products.find(
                  (item) => item.id === Number(nextSkuId)
                );

                setSkuId(nextSkuId);

                if (product) {
                  setWarehouse(product.warehouse);
                }
              }}
              style={{ padding: "12px" }}
            >
              <option value="">Choose a SKU</option>

              {products.map((product) => (
                <option
                  key={product.id}
                  value={product.id}
                >
                  {product.sku} — {product.name} — {product.client_name}
                </option>
              ))}
            </select>
          </label>

          <label
            style={{
              display: "grid",
              gap: "6px",
            }}
          >
            <span>Quantity</span>

            <input
              type="number"
              min="1"
              step="1"
              required
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              style={{ padding: "12px" }}
            />
          </label>

          <label
            style={{
              display: "grid",
              gap: "6px",
            }}
          >
            <span>Reference</span>

            <input
              type="text"
              required
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              placeholder="Supplier delivery reference"
              style={{ padding: "12px" }}
            />
          </label>

          <label
            style={{
              display: "grid",
              gap: "6px",
            }}
          >
            <span>Warehouse</span>

            <select
              value={warehouse}
              onChange={(event) =>
                setWarehouse(event.target.value as Warehouse)
              }
              style={{ padding: "12px" }}
            >
              <option value="LA">Los Angeles</option>
              <option value="ZGZ">Zaragoza</option>
            </select>
          </label>

          <button
            type="submit"
            disabled={submitting || products.length === 0}
            style={{
              padding: "12px",
              fontWeight: 700,
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting
              ? "Registering..."
              : "Register Inbound Delivery"}
          </button>
        </form>
      )}
    </main>
  );
}