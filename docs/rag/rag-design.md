# TrackFlow RAG Knowledge Base Design

## Overview

The TrackFlow commercial knowledge assistant answers natural-language questions using approved company documents about delivery SLAs, returns, carrier coverage, and storage pricing.

The pipeline consists of four modular responsibilities:

1. setup() loads, chunks, embeds and indexes the source documents.
2. embed() converts text into vectors.
3. retrieve() searches Qdrant.
4. query() generates the final answer from retrieved context.

The raw vector-search result is never returned directly.

## Source Corpus

Location:

docs/company-knowledge-base/

Documents:

- trackflow-sla-delivery.en.md
- trackflow-returns-policy.en.md
- trackflow-carrier-coverage.en.md
- trackflow-storage-pricing.en.md

## Chunking Strategy

Semantic paragraph chunking.

Current chunk counts:

- Delivery SLA: 4
- Returns Policy: 6
- Carrier Coverage: 4
- Storage Pricing: 4

Total chunks: 18

## Embedding Model

downtown-miami/openrouter/perplexity/pplx-embed-v1-0.6b

## Generation Model

downtown-miami/openrouter/deepseek/deepseek-v4-flash

## Vector Database

Qdrant

Collection:

trackflow-knowledge-base

Distance:

Cosine

## Retrieval

Top K: 3

Similarity threshold: 0.30

Measured Recall@3:

8/8 = 100%

## Business Rules

- Never guarantee delivery during Black Friday, Christmas or January Sales.
- International returns always require manual handling.
- Storage discounts require Miguel Torres approval.
- Manual carrier selection requires Carlos Vega approval.

## API

POST /knowledge/query

## UI

/knowledge

## Testing

tests/pipelines/test_rag.py

Current result:

7 passed
