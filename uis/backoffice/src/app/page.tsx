import styles from "./page.module.css";

const milestone2Services = [
  {
    function: "getCandidates",
    source: "uis/talent-pipeline-tracker/src/services/candidates.ts",
    output: "{ total, page, limit, data: Candidate[] }",
    note: "Fetches candidate list.",
  },
  {
    function: "getCandidate",
    source: "uis/talent-pipeline-tracker/src/services/candidates.ts",
    output: "Candidate",
    note: "Fetches one candidate.",
  },
  {
    function: "createCandidate",
    source: "uis/talent-pipeline-tracker/src/services/candidates.ts",
    output: "Candidate",
    note: "Creates a candidate.",
  },
  {
    function: "updateCandidate",
    source: "uis/talent-pipeline-tracker/src/services/candidates.ts",
    output: "Candidate",
    note: "Updates a candidate.",
  },
  {
    function: "getNotes",
    source: "uis/talent-pipeline-tracker/src/services/notes.ts",
    output: "Note[]",
    note: "Fetches notes.",
  },
  {
    function: "addNote",
    source: "uis/talent-pipeline-tracker/src/services/notes.ts",
    output: "Note",
    note: "Adds a note.",
  },
  {
    function: "deleteNote",
    source: "uis/talent-pipeline-tracker/src/services/notes.ts",
    output: "void",
    note: "Deletes a note.",
  },
];

export default function Home() {
  return (
    <main className={styles.page}>
      <section style={{ padding: "2rem 0", maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontSize: "2.2rem", fontWeight: 800, marginBottom: "1.5rem" }}>
          TrackFlow Internal Dashboard
        </h1>

        <section style={{ marginBottom: "2.5rem" }}>
          <h2>Business Summary</h2>
          <ul>
            <li>Warehouses: Los Angeles, USA and Zaragoza, Spain</li>
            <li>Employees: approximately 130</li>
            <li>Annual Revenue: approximately €9M</li>
            <li>Clients: mid-sized ecommerce brands</li>
          </ul>
        </section>

        <section style={{ marginBottom: "2.5rem" }}>
          <h2>Service Operations</h2>
          <ul>
            <li>Warehouse management</li>
            <li>Last-mile delivery</li>
            <li>Reverse logistics</li>
          </ul>
        </section>

        <section>
          <h2>Milestone 2 Business Logic</h2>
          <p>
            These services are referenced from their original location in the monorepo.
            Implementations are not copied into this app.
          </p>

          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", border: "1px solid #ddd", padding: "0.5rem" }}>Function</th>
                <th style={{ textAlign: "left", border: "1px solid #ddd", padding: "0.5rem" }}>Source</th>
                <th style={{ textAlign: "left", border: "1px solid #ddd", padding: "0.5rem" }}>Output</th>
                <th style={{ textAlign: "left", border: "1px solid #ddd", padding: "0.5rem" }}>Usage</th>
              </tr>
            </thead>
            <tbody>
              {milestone2Services.map((service) => (
                <tr key={service.function}>
                  <td style={{ border: "1px solid #ddd", padding: "0.5rem" }}>
                    <code>{service.function}</code>
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "0.5rem" }}>
                    <code>{service.source}</code>
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "0.5rem" }}>
                    <code>{service.output}</code>
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "0.5rem" }}>{service.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </section>
    </main>
  );
}