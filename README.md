# EnterpriseMind — Agentic RAG & GraphRAG Enterprise Intelligence System

EnterpriseMind is a full-stack Agentic Retrieval-Augmented Generation (RAG) workspace built with React, TypeScript, Express, and the Google GenAI SDK (`@google/genai`). It combines hybrid retrieval, cross-signal reranking, self-corrective query reformulation, GraphRAG entity-relationship traversal, role-based access control (RBAC), verifiable page-level citations, and an empirical ablation evaluation lab.

---

## Key Capabilities

1. **Agentic RAG Orchestration**
   - Deterministic multi-query decomposition (`decomposeEnterpriseQuery`) splits policy comparisons, multi-year financial queries, and multi-hop prompts into targeted sub-queries.
   - Multi-step execution trace inspected directly in the UI (**RBAC Gate → Query Planner → Hybrid Retrieval → Reranker → Self-Correction → GraphRAG Context → Grounded Synthesis → Citation Verifier**).

2. **Hybrid Retrieval & Cross-Signal Reranking**
   - Parallel **Okapi BM25** lexical search + **Dense Vector Similarity** (`gemini-embedding-2` + deterministic dense fallback) merged with **Reciprocal Rank Fusion (`k = 60`)**.
   - Cross-signal reranker weighting lexical coverage, section/title alignment, bigram proximity, and RRF rank.

3. **Self-Corrective Retrieval Loop**
   - Evaluates top passage confidence and document diversity; when confidence drops below threshold (`< 0.72` or insufficient multi-doc coverage on comparisons), Gemini reformulates the query and executes a corrective retrieval hop before synthesis.

4. **GraphRAG Entity-Relationship Explorer**
   - Connects **People, Projects, Departments, Documents, Technologies, and Policies** with evidence-backed edges (`[docId:pageNumber]`).
   - Interactive force-relaxed SVG knowledge graph filtered dynamically by the active employee's RBAC clearance.

5. **Enterprise Security (RBAC Standard SEC-009)**
   - Pre-retrieval policy enforcement across **Level 1 (General)**, **Level 2 (Departmental: Finance / HR)**, and **Level 3 (Executive)** personas (`Elena Rostova`, `Marcus Vance`, `Priya Nair`, `David Kim`).
   - Restricted documents are filtered out *before* retrieval and vector scoring; unauthorized document lookups via `/api/documents/:docId` return `HTTP 403`.

6. **Citation Verification & Source Page Inspector**
   - Inline clickable citations (`[docId:pageNumber]`) audited programmatically against authorized source pages to compute citation accuracy and faithfulness scores.
   - Clicking any citation opens the exact document page in the **Source Page Inspector** with verbatim passage highlighting.

7. **Multimodal Document Ingestion**
   - Upload and semantically chunk **PDF, PNG/JPEG (OCR), Markdown, CSV, or Plain Text** files with automatic Gemini summary and GraphRAG entity/edge extraction.

8. **Empirical Evaluation Lab**
   - Reproducible benchmark suite across 8 multi-category enterprise test cases comparing:
     - **Retrieval:** Vector Only vs. Hybrid (`BM25 + Vector RRF`)
     - **Ranking:** Without vs. With Cross-Signal Reranking
     - **Generation:** Basic Single-Pass RAG vs. Agentic RAG + GraphRAG + Self-Correction
     - **Accuracy:** Unverified vs. Citation-Verified Pipeline
   - Reports **Recall@5**, **MRR**, Answer Correctness, Faithfulness, Citation Accuracy, Latency, and Token Cost.

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion
- **Backend:** Node.js, Express, `tsx`, Vite (dev middleware + static `dist/` serving in production)
- **AI / Embeddings:** `@google/genai` (`gemini-4-hydrogen` with automatic `gemini-3.1-flash-lite` failover + `gemini-embedding-2`)
- **Testing:** Built-in Node test runner (`node:test`)

---

## Project Structure

```text
├── server.ts                  # Express server & API routes + Vite SSR/dev middleware
├── server/
│   └── ragPipeline.ts         # Agentic RAG orchestration, Gemini synthesis, OCR ingestion
├── src/
│   ├── engine/
│   │   ├── types.ts           # Core domain & API TypeScript interfaces
│   │   ├── chunker.ts         # Structure-aware semantic chunker & dense vector helper
│   │   ├── retrieval.ts       # RBAC filters, BM25, RRF, reranker, Recall@5/MRR suite
│   │   ├── graph.ts           # RBAC-filtered GraphRAG traversal & deterministic layout
│   │   ├── corpus.ts          # Enterprise seed corpus, personas, graph & benchmark cases
│   │   └── engine.test.ts     # Unit tests (node:test)
│   ├── components/            # Assistant, Document Vault, GraphRAG, Evaluation, Inspector UI
│   ├── utils/                 # Typed API client & persona avatar mappings
│   ├── App.tsx                # Application shell & view routing
│   └── main.tsx
├── .env.example               # Environment variable template
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Getting Started Locally

### 1. Prerequisites
- **Node.js** `>= 20`
- **npm** `>= 10`
- A **Google Gemini API Key** (`GEMINI_API_KEY`)

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` and add your Gemini API key:
```bash
cp .env.example .env
```
Edit `.env`:
```env
GEMINI_API_KEY="your-gemini-api-key"
APP_URL="http://localhost:3000"
```

### 4. Run in Development
```bash
npm run dev
```
The app and API run together on `http://localhost:3000`.

### 5. Build & Run in Production
```bash
npm run build
npm start
```

### 6. Type Check & Unit Tests
```bash
npm run lint
npm test
```

---

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Server health, document/chunk counts, Gemini key status |
| `GET` | `/api/users` | Available RBAC enterprise personas |
| `GET` | `/api/documents` | Clearance-filtered document catalog (`x-enterprise-user-id`) |
| `GET` | `/api/documents/:docId` | Full page-by-page document payload (enforces `403` on unauthorized access) |
| `POST` | `/api/documents/upload` | Multimodal/text ingestion, semantic chunking & GraphRAG indexing |
| `POST` | `/api/chat` | Full Agentic RAG query pipeline with citations, trace & metrics |
| `GET` | `/api/graph` | Clearance-filtered GraphRAG nodes and relationships |
| `GET` / `POST` | `/api/evaluation` & `/api/evaluation/run` | Runs empirical ablation benchmark suite |
