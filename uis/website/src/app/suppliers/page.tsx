"use client";

import { useEffect, useState } from "react";

type Supplier = {
  id: number;
  name: string;
  country: string;
  categories: string[];
  rate_per_shipment: number;
  currency: string;
  status: "active" | "suspended";
  service_zone?: string | null;
  contact_email?: string | null;
  notes?: string | null;
  rate_updated_at: string;
};

const API_URL = "/api";

const categories = [
  "carrier_last_mile",
  "carrier_international",
  "warehouse_supplies",
  "packaging_materials",
  "reverse_logistics",
  "fleet_maintenance",
  "it_and_wms_software",
  "cleaning_and_facilities",
];

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [country, setCountry] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadSuppliers() {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (country) params.append("country", country);
      if (category) params.append("category", category);

      const query = params.toString();
      const url = query
        ? `${API_URL}/suppliers?${query}`
        : `${API_URL}/suppliers`;

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error("Could not load suppliers");
      }

      setSuppliers(data);
    } catch {
      setError("Could not connect to the supplier API.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSuppliers();
  }, [country, category]);

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <p style={styles.eyebrow}>TrackFlow Operations</p>
        <h1 style={styles.title}>Supplier Directory</h1>
        <p style={styles.subtitle}>
          Centralized supplier management for USA and Spain operations.
        </p>
      </section>

      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>Filters</h2>

        <div style={styles.filterRow}>
          <select
            style={styles.input}
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            <option value="">All countries</option>
            <option value="USA">USA</option>
            <option value="Spain">Spain</option>
          </select>

          <select
            style={styles.input}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section style={styles.card}>
        <div style={styles.tableHeader}>
          <h2 style={styles.sectionTitle}>Suppliers</h2>
          <p style={styles.count}>
            {loading ? "Loading..." : `${suppliers.length} records`}
          </p>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Country</th>
                <th style={styles.th}>Categories</th>
                <th style={styles.th}>Rate</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Updated</th>
              </tr>
            </thead>

            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td style={styles.td}>{supplier.name}</td>
                  <td style={styles.td}>{supplier.country}</td>
                  <td style={styles.td}>{supplier.categories.join(", ")}</td>
                  <td style={styles.td}>
                    {supplier.rate_per_shipment} {supplier.currency}
                  </td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        background:
                          supplier.status === "active" ? "#dcfce7" : "#fee2e2",
                        color:
                          supplier.status === "active" ? "#166534" : "#991b1b",
                      }}
                    >
                      {supplier.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {new Date(supplier.rate_updated_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "40px",
    background: "#f3f6fb",
    color: "#111827",
    fontFamily: "Arial, sans-serif",
  },
  hero: {
    padding: "32px",
    borderRadius: "20px",
    background: "linear-gradient(135deg, #0f766e, #0f172a)",
    color: "white",
    marginBottom: "24px",
  },
  eyebrow: {
    margin: 0,
    fontSize: "14px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    opacity: 0.8,
  },
  title: {
    margin: "8px 0",
    fontSize: "42px",
  },
  subtitle: {
    margin: 0,
    fontSize: "18px",
    opacity: 0.9,
  },
  card: {
    background: "white",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "24px",
    boxShadow: "0 10px 25px rgba(15, 23, 42, 0.08)",
  },
  sectionTitle: {
    margin: "0 0 16px",
    fontSize: "24px",
  },
  filterRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  input: {
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    fontSize: "14px",
    background: "white",
  },
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  count: {
    color: "#64748b",
    fontWeight: 700,
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "12px",
    borderBottom: "2px solid #e5e7eb",
    background: "#f8fafc",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #e5e7eb",
    verticalAlign: "top",
  },
  badge: {
    padding: "5px 10px",
    borderRadius: "999px",
    fontWeight: 700,
    fontSize: "12px",
  },
  error: {
    color: "#b91c1c",
    fontWeight: 700,
    marginBottom: "16px",
  },
};