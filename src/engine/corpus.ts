import type {
  DocumentRecord,
  EnterpriseUser,
  EvaluationCase,
  GraphEdge,
  GraphNode,
} from './types';

export const ENTERPRISE_USERS: EnterpriseUser[] = [
  {
    id: 'user-elena',
    name: 'Elena Rostova',
    title: 'VP of Engineering',
    department: 'Executive',
    clearance: 3,
    clearanceLabel: 'Level 3 · Executive Full Access',
    email: 'elena.rostova@enterprisemind.io',
  },
  {
    id: 'user-marcus',
    name: 'Marcus Vance',
    title: 'Finance Director',
    department: 'Finance',
    clearance: 2,
    clearanceLabel: 'Level 2 · Finance & Company-Wide',
    email: 'marcus.vance@enterprisemind.io',
  },
  {
    id: 'user-priya',
    name: 'Priya Nair',
    title: 'HR Operations Lead',
    department: 'Human Resources',
    clearance: 2,
    clearanceLabel: 'Level 2 · HR & Company-Wide',
    email: 'priya.nair@enterprisemind.io',
  },
  {
    id: 'user-david',
    name: 'David Kim',
    title: 'Support Specialist',
    department: 'Customer Support',
    clearance: 1,
    clearanceLabel: 'Level 1 · General & Support',
    email: 'david.kim@enterprisemind.io',
  },
];

export const SEED_DOCUMENTS: DocumentRecord[] = [
  {
    id: 'doc-fin-2023-2025',
    title: 'Consolidated Financial Performance Report (FY2023–FY2025)',
    category: 'Financial Report',
    department: 'Finance',
    requiredClearance: 2,
    allowedDepartments: ['Finance', 'Executive'],
    author: 'Marcus Vance',
    updatedAt: '2026-02-14',
    format: 'PDF',
    summary:
      'Three-year audited revenue, operating margin, R&D expenditure, and cloud infrastructure spend across FY2023, FY2024, and FY2025.',
    entities: ['Marcus Vance', 'Project Helios', 'Cloud FinOps', 'Finance'],
    embeddingStatus: 'indexed',
    pages: [
      {
        pageNumber: 1,
        sectionTitle: 'Executive Revenue & Margin Summary',
        content:
          'EnterpriseMind Holdings delivered sustained top-line acceleration across FY2023 through FY2025. Annual Recurring Revenue (ARR) expanded from $118.4M in FY2023 to $149.2M in FY2024 (+26.0% YoY) and reached $194.8M in FY2025 (+30.6% YoY). GAAP gross margin improved by 420 basis points over the three-year window, rising from 71.8% in FY2023 to 74.1% in FY2024 and 76.0% in FY2025 due to Kubernetes workload consolidation and tiered GPU inference routing.',
      },
      {
        pageNumber: 2,
        sectionTitle: 'Operating Expenses, R&D & Travel Cost Discipline',
        content:
          'Research and Development investment totaled $28.1M in FY2023, $34.6M in FY2024, and $41.9M in FY2025, driven primarily by Project Helios vector indexing infrastructure and enterprise security engineering. Non-payroll travel and expense (T&E) spending fell 18.4% in FY2025 to $3.12M after finance introduced pre-trip approval gates and tightened hotel caps. Operating income turned positive at $6.4M in FY2024 (4.3% margin) and expanded to $19.7M in FY2025 (10.1% operating margin).',
      },
      {
        pageNumber: 3,
        sectionTitle: 'FY2026 Capital Allocation & Cloud Budget',
        content:
          'For FY2026, the Finance Committee approved $11.8M in dedicated cloud compute budget for Project Helios production clusters and Qdrant vector shards, alongside $3.6M for employee travel and client onsite deployments under the revised 2026 Employee Reimbursement Policy. Net cash and marketable securities stood at $84.5M as of December 31, 2025, with zero long-term debt.',
      },
    ],
  },
  {
    id: 'doc-policy-reimb-2024',
    title: 'Employee Travel & Expense Reimbursement Policy (2024 Edition — Superseded)',
    category: 'Policy',
    department: 'Human Resources',
    requiredClearance: 1,
    allowedDepartments: ['*'],
    author: 'Priya Nair',
    updatedAt: '2024-03-01',
    format: 'PDF',
    summary:
      'Legacy 2024 reimbursement rules covering domestic/international lodging caps, meal per diems, mileage rates, and 45-day submission windows.',
    entities: ['Priya Nair', 'Human Resources', '2024 Reimbursement Policy'],
    embeddingStatus: 'indexed',
    pages: [
      {
        pageNumber: 1,
        sectionTitle: 'Scope, Submission Window & Approval Thresholds',
        content:
          'Policy ID: HR-FIN-2024-02 (Effective March 1, 2024). All full-time employees may claim business travel and remote-work equipment expenses within 45 calendar days of transaction settlement. Single expenses under $250 did not require pre-approval; manager sign-off was only mandatory for cumulative trip totals exceeding $1,500.',
      },
      {
        pageNumber: 2,
        sectionTitle: '2024 Lodging, Meals & Home Office Stipend Caps',
        content:
          'Under the 2024 policy: (1) Domestic hotel lodging was capped at $240 per night excluding taxes ($310 in Tier-1 metro hubs such as New York, San Francisco, and London). (2) Daily meal reimbursement operated on an actual-receipts model up to $75/day. (3) Airfare allowed Premium Economy for flights exceeding 5 hours. (4) Home office ergonomics stipend was $500 every 24 months, and mileage was reimbursed at $0.655 per mile.',
      },
    ],
  },
  {
    id: 'doc-policy-reimb-2026',
    title: 'Global Employee Reimbursement & Travel Policy (2026 Updated Edition)',
    category: 'Policy',
    department: 'Human Resources',
    requiredClearance: 1,
    allowedDepartments: ['*'],
    author: 'Priya Nair',
    updatedAt: '2026-01-15',
    format: 'PDF',
    summary:
      'Active 2026 reimbursement policy introducing automated receipt OCR, tightened 30-day submission window, flat per-diem meals, and $1,000 wellness/ergonomics allowance.',
    entities: ['Priya Nair', 'Marcus Vance', 'Human Resources', '2026 Reimbursement Policy'],
    embeddingStatus: 'indexed',
    pages: [
      {
        pageNumber: 1,
        sectionTitle: 'Effective Date, Pre-Approval & 30-Day Cutoff',
        content:
          'Policy ID: HR-FIN-2026-01 (Effective January 15, 2026; supersedes HR-FIN-2024-02). All expense claims must be submitted through the automated OCR Expense Portal within 30 calendar days of purchase. Pre-travel director approval is now required for every trip projected above $900 (down from $1,500 in 2024) and for any international flight regardless of fare class.',
      },
      {
        pageNumber: 2,
        sectionTitle: '2026 Lodging, Per-Diem Meals & Hybrid Stipends',
        content:
          'Updated 2026 limits: (1) Domestic hotel lodging cap increased to $275 per night ($360 in Tier-1 metro hubs) to reflect 2026 corporate rate indices. (2) Meal reimbursement transitioned from itemized receipts to a flat $85/day per diem without paper receipt upload for meals under $40. (3) Economy Plus / Premium Economy flight threshold tightened from 5 hours to 7+ hours continuous flight time. (4) Annual home-office and wellness stipend expanded to $800 every 12 months (replacing the $500 per 24-month cap), and IRS-aligned mileage rate increased to $0.70 per mile.',
      },
    ],
  },
  {
    id: 'doc-tech-helios',
    title: 'Project Helios — Distributed Hybrid Retrieval & Reranking Architecture',
    category: 'Technical Spec',
    department: 'Engineering',
    requiredClearance: 2,
    allowedDepartments: ['Engineering', 'Executive'],
    author: 'Elena Rostova',
    updatedAt: '2026-03-10',
    format: 'MD',
    summary:
      'Technical architecture specification for Project Helios covering semantic chunking, Qdrant HNSW + BM25 RRF hybrid search, BGE cross-encoder reranking, and p95 latency targets.',
    entities: ['Elena Rostova', 'Project Helios', 'Qdrant', 'Kubernetes', 'BGE Reranker', 'PyMuPDF'],
    embeddingStatus: 'indexed',
    pages: [
      {
        pageNumber: 1,
        sectionTitle: 'Ingestion Pipeline & Semantic Chunking Rules',
        content:
          'Project Helios ingests PDF, DOCX, Markdown, and scanned documents via PyMuPDF and PaddleOCR fallback. Documents are segmented by heading hierarchy and sentence coherence into chunks of 450–650 tokens with a 1-sentence sliding overlap, strictly preserving page_number, section_title, and rbac_clearance metadata payloads inside Qdrant.',
      },
      {
        pageNumber: 2,
        sectionTitle: 'Hybrid Retrieval (BM25 + Dense Vector) & Reranking',
        content:
          'To handle both exact identifiers (policy codes like HR-FIN-2026-01, error codes) and semantic paraphrases, Project Helios executes parallel Okapi BM25 sparse search and 1024-d dense HNSW vector search in Qdrant (ef_search=128, cosine metric). Candidate pools (top-25 each) are merged via Reciprocal Rank Fusion (k=60) and rescored by BGE-Reranker-v2-M3 on NVIDIA L4 workers. End-to-end retrieval + rerank p95 latency must remain under 185 ms at 50,000 documents.',
      },
      {
        pageNumber: 3,
        sectionTitle: 'Agentic Self-Correction & Verification Gates',
        content:
          'Every user query enters a LangGraph state machine with 5 mandatory nodes: RBAC Policy Filter -> Query Decomposition -> Hybrid + GraphRAG Retrieval -> Relevance Grader -> Citation Verifier. If the top reranker relevance score falls below 0.62, the Self-Correction node rewrites the query using domain synonyms and executes a second retrieval hop before synthesis.',
      },
    ],
  },
  {
    id: 'doc-proj-aether',
    title: 'Project Aether — Customer Support Knowledge Migration & SLA Report',
    category: 'Project Report',
    department: 'Customer Support',
    requiredClearance: 1,
    allowedDepartments: ['*'],
    author: 'David Kim',
    updatedAt: '2026-04-02',
    format: 'MD',
    summary:
      'Post-rollout report detailing how Project Aether integrated 14,200 support runbooks into Project Helios search, reducing ticket resolution time by 38%.',
    entities: ['David Kim', 'Elena Rostova', 'Project Aether', 'Project Helios', 'Customer Support'],
    embeddingStatus: 'indexed',
    pages: [
      {
        pageNumber: 1,
        sectionTitle: 'Project Aether Scope & Dependencies',
        content:
          'Project Aether migrated 14,200 legacy Zendesk macros and tier-2 escalation playbooks into the central EnterpriseMind corpus during Q1 2026. Project Aether depends directly on Project Helios retrieval APIs and enforces Clearance Level 1 tagging on public-facing troubleshooting guides while keeping customer PII logs restricted to Level 2+.',
      },
      {
        pageNumber: 2,
        sectionTitle: 'Measured Support KPI Improvements',
        content:
          'Within 60 days of deployment across 95 Customer Support specialists, median First Response Time dropped from 42 minutes to 19 minutes (-54.8%), and Mean Time to Resolution (MTTR) improved by 38.2% (from 6.8 hours to 4.2 hours). Support escalations to Engineering dropped by 29% after agents gained direct page-level citations to technical specs.',
      },
    ],
  },
  {
    id: 'doc-sec-rbac',
    title: 'Enterprise Security, JWT Authentication & RBAC Standard (SEC-009)',
    category: 'Policy',
    department: 'Engineering',
    requiredClearance: 1,
    allowedDepartments: ['*'],
    author: 'Elena Rostova',
    updatedAt: '2026-01-28',
    format: 'PDF',
    summary:
      'Mandatory security controls defining 3-tier clearance levels (L1 General, L2 Departmental, L3 Executive), pre-retrieval vector filtering, and zero-leakage guarantees.',
    entities: ['Elena Rostova', 'RBAC Standard SEC-009', 'Qdrant', 'PostgreSQL'],
    embeddingStatus: 'indexed',
    pages: [
      {
        pageNumber: 1,
        sectionTitle: 'Three-Tier Clearance Matrix',
        content:
          'Standard SEC-009 establishes three strict clearance tiers across all EnterpriseMind indices: Level 1 (General & Support) covers company-wide handbooks, active policies, and support runbooks. Level 2 (Departmental Restricted) covers Finance reports, Engineering technical specs, and HR compensation guidelines scoped to the user department. Level 3 (Executive Confidential) covers M&A memos, board strategy, and cross-departmental audit records.',
      },
      {
        pageNumber: 2,
        sectionTitle: 'Pre-Retrieval Payload Filtering & Audit Logging',
        content:
          'Authorization checks MUST execute prior to vector similarity scoring and GraphRAG traversal—never as a post-generation prompt filter. Every chunk payload carries required_clearance and allowed_departments verified against the signed JWT identity claim. Unauthorized queries must return zero restricted excerpts and log an access-boundary notice without revealing protected content.',
      },
    ],
  },
  {
    id: 'doc-handbook-2026',
    title: 'Employee Onboarding & Benefits Handbook (2026)',
    category: 'Employee Handbook',
    department: 'Human Resources',
    requiredClearance: 1,
    allowedDepartments: ['*'],
    author: 'Priya Nair',
    updatedAt: '2026-01-10',
    format: 'DOCX',
    summary:
      'Company-wide handbook covering hybrid work expectations, PTO accrual, parental leave, learning budgets, and security training.',
    entities: ['Priya Nair', 'Human Resources', 'RBAC Standard SEC-009'],
    embeddingStatus: 'indexed',
    pages: [
      {
        pageNumber: 1,
        sectionTitle: 'Hybrid Work Cadence & Core Collaboration Hours',
        content:
          'EnterpriseMind operates on a 3-day anchor hybrid model (Tuesday, Wednesday, Thursday onsite for hub employees; remote-first roles remain exempt). Core synchronous collaboration hours run 10:00–15:00 local hub time. New hires receive 22 days of Paid Time Off per year plus 12 company holidays and 16 weeks of fully paid parental leave.',
      },
      {
        pageNumber: 2,
        sectionTitle: 'Learning & Development Stipend and Security Compliance',
        content:
          'Every full-time employee receives a $2,000 annual Learning & Certification budget for conferences, cloud certifications, or graduate coursework. All employees must complete Security & RBAC Standard SEC-009 training within 14 days of start date before receiving Level 1 or Level 2 repository tokens.',
      },
    ],
  },
  {
    id: 'doc-support-postmortem',
    title: 'Incident Postmortem INC-2026-041: Vector Index Latency Spike',
    category: 'Support Record',
    department: 'Customer Support',
    requiredClearance: 1,
    allowedDepartments: ['*'],
    author: 'David Kim',
    updatedAt: '2026-02-22',
    format: 'TXT',
    summary:
      'Root-cause analysis of a 22-minute p95 search latency spike on Project Helios caused by unthrottled bulk OCR re-indexing during peak support hours.',
    entities: ['David Kim', 'Elena Rostova', 'Project Helios', 'Project Aether', 'Qdrant', 'Kubernetes'],
    embeddingStatus: 'indexed',
    pages: [
      {
        pageNumber: 1,
        sectionTitle: 'Incident Timeline & Root Cause',
        content:
          'On February 20, 2026 at 14:12 UTC, Project Aether support search p95 latency degraded from 165 ms to 2,410 ms for 22 minutes. Root cause: a batch PyMuPDF + OCR backfill job saturated CPU and Qdrant HNSW segment compaction on the shared Kubernetes node pool during peak European-US support overlap.',
      },
      {
        pageNumber: 2,
        sectionTitle: 'Corrective Actions & Infrastructure Guardrails',
        content:
          'Engineering (led by Elena Rostova) isolated ingestion workers into a dedicated Kubernetes taint pool, capped concurrent embedding threads at 8 per pod, and enabled Qdrant mmap segment caching. Post-remediation load tests at 50,000 documents confirmed p95 retrieval latency stabilized at 142 ms.',
      },
    ],
  },
  {
    id: 'doc-exec-ma',
    title: 'Project Meridian — Confidential Q2 Strategic Acquisition Brief',
    category: 'Project Report',
    department: 'Executive',
    requiredClearance: 3,
    allowedDepartments: ['Executive'],
    author: 'Elena Rostova',
    updatedAt: '2026-04-12',
    format: 'PDF',
    summary:
      'Strictly confidential Level-3 board brief evaluating the proposed $42M acquisition of VectraGraph Labs to accelerate multi-hop GraphRAG.',
    entities: ['Elena Rostova', 'Marcus Vance', 'Project Meridian', 'Project Helios'],
    embeddingStatus: 'indexed',
    pages: [
      {
        pageNumber: 1,
        sectionTitle: 'Confidential Acquisition Thesis & Valuation',
        content:
          'STRICTLY CONFIDENTIAL — CLEARANCE LEVEL 3 ONLY. Project Meridian evaluates the proposed $42.0M cash-and-equity acquisition of VectraGraph Labs ($28M cash from FY2025 reserves + $14M performance earn-out). Integrating VectraGraph’s incremental entity-resolution engine into Project Helios is projected to cut GraphRAG multi-hop query latency by 47% and unlock $18M in regulated healthcare pipeline.',
      },
      {
        pageNumber: 2,
        sectionTitle: 'Integration Milestones & Confidentiality Protocol',
        content:
          'Due diligence closes May 18, 2026, co-chaired by Elena Rostova (Technical Architecture) and Marcus Vance (Financial Valuation). All deal room artifacts must remain strictly isolated at Clearance Level 3 and excluded from Level 1 and Level 2 employee retrieval sessions.',
      },
    ],
  },
  {
    id: 'doc-fin-q1-2026',
    title: 'Q1 2026 Cloud FinOps & Department Budget Variance Ledger',
    category: 'Financial Report',
    department: 'Finance',
    requiredClearance: 2,
    allowedDepartments: ['Finance', 'Executive'],
    author: 'Marcus Vance',
    updatedAt: '2026-04-08',
    format: 'CSV',
    summary:
      'Departmental Q1 2026 actual vs budget breakdown across Engineering GPU clusters, Support operations, and HR reimbursement utilization.',
    entities: ['Marcus Vance', 'Project Helios', 'Project Aether', 'Finance', 'Kubernetes'],
    embeddingStatus: 'indexed',
    pages: [
      {
        pageNumber: 1,
        sectionTitle: 'Q1 2026 Infrastructure & T&E Budget Actuals',
        content:
          'Q1 2026 Budget Variance Summary: Project Helios Cloud & GPU Inference spent $2.74M vs $2.95M budget (-7.1% favorable variance due to INT8 BGE reranker quantization). Customer Support Project Aether operations spent $610K vs $640K budget (-4.7% favorable). Company-wide T&E claims under the 2026 Reimbursement Policy totaled $742K vs $900K quarterly allocation, with 96.4% of claims processed within 48 hours via OCR validation.',
      },
    ],
  },
];

export const SEED_GRAPH_NODES: GraphNode[] = [
  {
    id: 'node-elena',
    label: 'Elena Rostova',
    type: 'Person',
    department: 'Executive',
    requiredClearance: 1,
    summary: 'VP of Engineering; leads Project Helios architecture, SEC-009 security standard, and Project Meridian technical diligence.',
  },
  {
    id: 'node-marcus',
    label: 'Marcus Vance',
    type: 'Person',
    department: 'Finance',
    requiredClearance: 1,
    summary: 'Finance Director; authors FY2023-FY2025 Financial Report, Q1 2026 FinOps Ledger, and co-chairs Project Meridian valuation.',
  },
  {
    id: 'node-priya',
    label: 'Priya Nair',
    type: 'Person',
    department: 'Human Resources',
    requiredClearance: 1,
    summary: 'HR Operations Lead; owns 2024 & 2026 Employee Reimbursement Policies and Onboarding Handbook.',
  },
  {
    id: 'node-david',
    label: 'David Kim',
    type: 'Person',
    department: 'Customer Support',
    requiredClearance: 1,
    summary: 'Support Specialist; led Project Aether runbook migration and authored INC-2026-041 postmortem.',
  },
  {
    id: 'node-helios',
    label: 'Project Helios',
    type: 'Project',
    department: 'Engineering',
    requiredClearance: 1,
    summary: 'Core Agentic & Hybrid RAG retrieval platform combining Qdrant vector search, BM25, BGE reranking, and LangGraph orchestration.',
  },
  {
    id: 'node-aether',
    label: 'Project Aether',
    type: 'Project',
    department: 'Customer Support',
    requiredClearance: 1,
    summary: 'Customer Support knowledge migration of 14,200 runbooks onto Project Helios, reducing MTTR by 38.2%.',
  },
  {
    id: 'node-meridian',
    label: 'Project Meridian',
    type: 'Project',
    department: 'Executive',
    requiredClearance: 3,
    docId: 'doc-exec-ma',
    summary: 'Confidential L3 $42M acquisition evaluation of VectraGraph Labs to accelerate multi-hop GraphRAG.',
  },
  {
    id: 'node-qdrant',
    label: 'Qdrant Vector DB',
    type: 'Technology',
    requiredClearance: 1,
    summary: 'Primary HNSW vector store and RBAC payload filter engine for Project Helios.',
  },
  {
    id: 'node-k8s',
    label: 'Kubernetes Clusters',
    type: 'Technology',
    requiredClearance: 1,
    summary: 'Container orchestration platform hosting isolated ingestion workers and BGE reranker pods.',
  },
  {
    id: 'node-pymupdf',
    label: 'PyMuPDF + OCR',
    type: 'Technology',
    requiredClearance: 1,
    summary: 'Multi-format document ingestion pipeline extracting page text and tables.',
  },
  {
    id: 'node-pol-2024',
    label: '2024 Reimbursement Policy',
    type: 'Policy',
    department: 'Human Resources',
    requiredClearance: 1,
    docId: 'doc-policy-reimb-2024',
    summary: 'Superseded policy with 45-day window, $240 domestic hotel cap, and $500 / 24-mo stipend.',
  },
  {
    id: 'node-pol-2026',
    label: '2026 Reimbursement Policy',
    type: 'Policy',
    department: 'Human Resources',
    requiredClearance: 1,
    docId: 'doc-policy-reimb-2026',
    summary: 'Active policy with 30-day window, $275 hotel cap, $85/day flat per diem, and $800/yr stipend.',
  },
  {
    id: 'node-sec-009',
    label: 'RBAC Standard SEC-009',
    type: 'Policy',
    department: 'Engineering',
    requiredClearance: 1,
    docId: 'doc-sec-rbac',
    summary: '3-tier enterprise clearance and pre-retrieval payload enforcement standard.',
  },
  {
    id: 'node-dept-eng',
    label: 'Engineering',
    type: 'Department',
    requiredClearance: 1,
    summary: 'Platform, ML retrieval, and security architecture organization.',
  },
  {
    id: 'node-dept-fin',
    label: 'Finance',
    type: 'Department',
    requiredClearance: 1,
    summary: 'Financial reporting, FinOps budgeting, and T&E audit control.',
  },
  {
    id: 'node-dept-hr',
    label: 'Human Resources',
    type: 'Department',
    requiredClearance: 1,
    summary: 'Global people operations, reimbursement policy, and employee onboarding.',
  },
  {
    id: 'node-dept-sup',
    label: 'Customer Support',
    type: 'Department',
    requiredClearance: 1,
    summary: 'Tier-1/Tier-2 customer operations and incident triage.',
  },
];

export const SEED_GRAPH_EDGES: GraphEdge[] = [
  { id: 'e1', source: 'node-elena', target: 'node-helios', relation: 'ARCHITECTS', evidenceDocId: 'doc-tech-helios', evidencePage: 1, weight: 1.0 },
  { id: 'e2', source: 'node-elena', target: 'node-sec-009', relation: 'AUTHORED', evidenceDocId: 'doc-sec-rbac', evidencePage: 1, weight: 0.95 },
  { id: 'e3', source: 'node-elena', target: 'node-dept-eng', relation: 'LEADS', evidenceDocId: 'doc-support-postmortem', evidencePage: 2, weight: 0.9 },
  { id: 'e4', source: 'node-helios', target: 'node-qdrant', relation: 'USES_TECH', evidenceDocId: 'doc-tech-helios', evidencePage: 2, weight: 1.0 },
  { id: 'e5', source: 'node-helios', target: 'node-k8s', relation: 'DEPLOYED_ON', evidenceDocId: 'doc-support-postmortem', evidencePage: 2, weight: 0.9 },
  { id: 'e6', source: 'node-helios', target: 'node-pymupdf', relation: 'INGESTS_VIA', evidenceDocId: 'doc-tech-helios', evidencePage: 1, weight: 0.9 },
  { id: 'e7', source: 'node-aether', target: 'node-helios', relation: 'DEPENDS_ON', evidenceDocId: 'doc-proj-aether', evidencePage: 1, weight: 0.95 },
  { id: 'e8', source: 'node-david', target: 'node-aether', relation: 'MANAGED', evidenceDocId: 'doc-proj-aether', evidencePage: 1, weight: 0.9 },
  { id: 'e9', source: 'node-david', target: 'node-dept-sup', relation: 'BELONGS_TO', evidenceDocId: 'doc-proj-aether', evidencePage: 2, weight: 0.85 },
  { id: 'e10', source: 'node-priya', target: 'node-pol-2026', relation: 'AUTHORED', evidenceDocId: 'doc-policy-reimb-2026', evidencePage: 1, weight: 1.0 },
  { id: 'e11', source: 'node-priya', target: 'node-pol-2024', relation: 'AUTHORED', evidenceDocId: 'doc-policy-reimb-2024', evidencePage: 1, weight: 0.85 },
  { id: 'e12', source: 'node-pol-2026', target: 'node-pol-2024', relation: 'SUPERSEDES', evidenceDocId: 'doc-policy-reimb-2026', evidencePage: 1, weight: 1.0 },
  { id: 'e13', source: 'node-priya', target: 'node-dept-hr', relation: 'LEADS', evidenceDocId: 'doc-handbook-2026', evidencePage: 1, weight: 0.9 },
  { id: 'e14', source: 'node-marcus', target: 'node-dept-fin', relation: 'LEADS', evidenceDocId: 'doc-fin-2023-2025', evidencePage: 1, weight: 0.95 },
  { id: 'e15', source: 'node-marcus', target: 'node-pol-2026', relation: 'CO_GOVERNED', evidenceDocId: 'doc-fin-2023-2025', evidencePage: 3, weight: 0.85 },
  { id: 'e16', source: 'node-marcus', target: 'node-helios', relation: 'FUNDS_BUDGET', evidenceDocId: 'doc-fin-q1-2026', evidencePage: 1, weight: 0.9 },
  { id: 'e17', source: 'node-helios', target: 'node-sec-009', relation: 'ENFORCES', evidenceDocId: 'doc-sec-rbac', evidencePage: 2, weight: 0.95 },
  { id: 'e18', source: 'node-elena', target: 'node-meridian', relation: 'CHAIRS_TECH', evidenceDocId: 'doc-exec-ma', evidencePage: 2, weight: 0.95 },
  { id: 'e19', source: 'node-marcus', target: 'node-meridian', relation: 'CHAIRS_FINANCE', evidenceDocId: 'doc-exec-ma', evidencePage: 2, weight: 0.95 },
  { id: 'e20', source: 'node-meridian', target: 'node-helios', relation: 'ENHANCES', evidenceDocId: 'doc-exec-ma', evidencePage: 1, weight: 0.9 },
];

export const EVALUATION_BENCHMARK_CASES: EvaluationCase[] = [
  {
    id: 'eval-1',
    query: 'Summarize the company financial performance ARR and operating margin from FY2023 to FY2025.',
    queryType: 'tabular-numeric',
    groundTruthDocIds: ['doc-fin-2023-2025'],
    expectedKeywords: ['118.4M', '149.2M', '194.8M', '19.7M', '76.0%'],
    description: '3-year financial KPI extraction across multi-page report',
  },
  {
    id: 'eval-2',
    query: 'Compare the 2024 and 2026 employee reimbursement policies on lodging caps, meal per diem, and submission deadlines.',
    queryType: 'policy-compare',
    groundTruthDocIds: ['doc-policy-reimb-2024', 'doc-policy-reimb-2026'],
    expectedKeywords: ['45 calendar days', '30 calendar days', '$240', '$275', '$85/day'],
    description: 'Cross-document policy comparison requiring exact year disambiguation',
  },
  {
    id: 'eval-3',
    query: 'Which projects depend on Project Helios and how did Project Aether affect support MTTR?',
    queryType: 'graph-multi-hop',
    groundTruthDocIds: ['doc-proj-aether', 'doc-tech-helios'],
    expectedKeywords: ['Project Aether', '14,200', '38.2%', '4.2 hours'],
    description: 'GraphRAG multi-hop project dependency + KPI impact synthesis',
  },
  {
    id: 'eval-4',
    query: 'What caused INC-2026-041 search latency spike and what technical requirements keep Qdrant under 185 ms?',
    queryType: 'multi-doc',
    groundTruthDocIds: ['doc-support-postmortem', 'doc-tech-helios'],
    expectedKeywords: ['2,410 ms', 'taint pool', '142 ms', 'ef_search=128', 'Reciprocal Rank Fusion'],
    description: 'Multi-document synthesis linking support incident to engineering spec',
  },
  {
    id: 'eval-5',
    query: 'How does RBAC Standard SEC-009 enforce clearance filtering before vector scoring?',
    queryType: 'multi-doc',
    groundTruthDocIds: ['doc-sec-rbac', 'doc-tech-helios'],
    expectedKeywords: ['Level 1', 'Level 2', 'Level 3', 'pre-retrieval', 'required_clearance'],
    description: 'Exact identifier + security architecture verification',
  },
  {
    id: 'eval-6',
    query: 'How much did the new 2026 travel rules and FinOps INT8 quantization save in Q1 2026?',
    queryType: 'tabular-numeric',
    groundTruthDocIds: ['doc-fin-q1-2026', 'doc-fin-2023-2025'],
    expectedKeywords: ['$2.74M', '$742K', 'INT8', '-7.1%'],
    description: 'Q1 2026 FinOps ledger + annual budget cross-check',
  },
  {
    id: 'eval-7',
    query: 'What are the hybrid work anchor days and annual learning budget in the employee handbook?',
    queryType: 'multi-doc',
    groundTruthDocIds: ['doc-handbook-2026'],
    expectedKeywords: ['Tuesday', 'Wednesday', 'Thursday', '$2,000', '22 days'],
    description: 'Direct policy lookup with exact numeric details',
  },
  {
    id: 'eval-8',
    query: 'Tell me about the hotel and meal allowance changes and why the company reduced T&E spend.',
    queryType: 'self-corrective',
    groundTruthDocIds: ['doc-policy-reimb-2026', 'doc-fin-2023-2025'],
    expectedKeywords: ['pre-travel', 'reimbursement', '$85/day', '18.4%'],
    description: 'Underspecified query testing self-corrective reformulation across HR + Finance',
  },
];

export const SUGGESTED_QUERIES = [
  {
    label: 'Compare 2024 vs 2026 Reimbursement',
    query: 'Compare the old 2024 and new 2026 employee reimbursement policies, including exact page citations.',
    minClearance: 1,
  },
  {
    label: '3-Year Financial Summary',
    query: "Summarize the company's financial performance (ARR, gross margin, and operating income) from FY2023 to FY2025.",
    minClearance: 2,
  },
  {
    label: 'Project Helios Tech & Incident',
    query: 'What are the technical requirements of Project Helios and how was incident INC-2026-041 resolved?',
    minClearance: 2,
  },
  {
    label: 'Project Aether & Graph Impact',
    query: 'Find all documents related to Project Aether and explain its dependencies and support KPI improvements.',
    minClearance: 1,
  },
  {
    label: 'RBAC Clearance Test (L3 M&A)',
    query: 'What is the valuation and deal structure of Project Meridian?',
    minClearance: 1,
  },
];
