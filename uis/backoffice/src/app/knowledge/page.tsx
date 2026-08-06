"use client";

import { FormEvent, useState } from "react";

type KnowledgeSource = {
  source_document: string;
  section: string;
  chunk_index: number;
  score: number;
};

type KnowledgeResponse = {
  answer: string;
  sources: KnowledgeSource[];
};

const API_URL =
  process.env.NEXT_PUBLIC_TRACKFLOW_API_URL ?? "http://localhost:8000";

export default function KnowledgePage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanedQuestion = question.trim();

    if (!cleanedQuestion) {
      setError("Enter a question before submitting.");
      return;
    }

    setIsLoading(true);
    setError("");
    setAnswer("");
    setSources([]);

    try {
      const response = await fetch(`${API_URL}/knowledge/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: cleanedQuestion,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}.`);
      }

      const data = (await response.json()) as KnowledgeResponse;

      setAnswer(data.answer);
      setSources(data.sources);
    } catch (requestError) {
      console.error(requestError);
      setError(
        "The TrackFlow knowledge assistant is unavailable. Confirm that the API and Qdrant are running."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        padding: "3rem 1.25rem",
        color: "#172033",
      }}
    >
      <section
        style={{
          maxWidth: 920,
          margin: "0 auto",
        }}
      >
        <div style={{ marginBottom: "2rem" }}>
          <p
            style={{
              color: "#315efb",
              fontWeight: 700,
              marginBottom: "0.5rem",
            }}
          >
            TrackFlow Commercial Assistant
          </p>

          <h1
            style={{
              fontSize: "2.4rem",
              lineHeight: 1.15,
              marginBottom: "0.75rem",
            }}
          >
            Ask the TrackFlow knowledge base
          </h1>

          <p
            style={{
              color: "#596579",
              maxWidth: 700,
              lineHeight: 1.6,
            }}
          >
            Ask about delivery SLAs, returns, carrier coverage, or storage
            pricing. Answers are generated from approved TrackFlow source
            documents.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            background: "#ffffff",
            border: "1px solid #dde4ef",
            borderRadius: 16,
            padding: "1.5rem",
            boxShadow: "0 10px 30px rgba(31, 45, 61, 0.08)",
          }}
        >
          <label
            htmlFor="question"
            style={{
              display: "block",
              fontWeight: 700,
              marginBottom: "0.75rem",
            }}
          >
            Sales question
          </label>

          <textarea
            id="question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Example: Can we guarantee delivery times during Black Friday?"
            rows={5}
            maxLength={1000}
            style={{
              width: "100%",
              resize: "vertical",
              border: "1px solid #cfd8e6",
              borderRadius: 12,
              padding: "1rem",
              font: "inherit",
              lineHeight: 1.5,
              color: "#172033",
              background: "#ffffff",
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
              marginTop: "1rem",
              flexWrap: "wrap",
            }}
          >
            <span style={{ color: "#7a8699", fontSize: "0.9rem" }}>
              {question.length}/1000
            </span>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                border: 0,
                borderRadius: 10,
                padding: "0.85rem 1.25rem",
                background: isLoading ? "#9aa7c0" : "#315efb",
                color: "#ffffff",
                fontWeight: 700,
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              {isLoading ? "Generating answer..." : "Ask TrackFlow"}
            </button>
          </div>
        </form>

        {error && (
          <section
            role="alert"
            style={{
              marginTop: "1.5rem",
              padding: "1rem",
              borderRadius: 12,
              border: "1px solid #efb5b5",
              background: "#fff3f3",
              color: "#9f1c1c",
            }}
          >
            {error}
          </section>
        )}

        {answer && (
          <section
            style={{
              marginTop: "1.5rem",
              background: "#ffffff",
              border: "1px solid #dde4ef",
              borderRadius: 16,
              padding: "1.5rem",
              boxShadow: "0 10px 30px rgba(31, 45, 61, 0.06)",
            }}
          >
            <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>
              Generated answer
            </h2>

            <p
              style={{
                whiteSpace: "pre-wrap",
                lineHeight: 1.7,
                color: "#2c384d",
              }}
            >
              {answer}
            </p>

            <div style={{ marginTop: "1.5rem" }}>
              <h3 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>
                Sources used
              </h3>

              {sources.length === 0 ? (
                <p style={{ color: "#6c788b" }}>No approved source matched.</p>
              ) : (
                <ul
                  style={{
                    display: "grid",
                    gap: "0.75rem",
                    listStyle: "none",
                  }}
                >
                  {sources.map((source) => (
                    <li
                      key={`${source.source_document}-${source.chunk_index}`}
                      style={{
                        border: "1px solid #e1e7f0",
                        borderRadius: 10,
                        padding: "0.85rem",
                        background: "#f8faff",
                      }}
                    >
                      <strong>{source.section}</strong>
                      <div
                        style={{
                          color: "#6c788b",
                          fontSize: "0.9rem",
                          marginTop: "0.25rem",
                        }}
                      >
                        {source.source_document} · chunk {source.chunk_index} ·
                        similarity {source.score.toFixed(3)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
