export type ClearanceLevel = 1 | 2 | 3;

export type Department =
  | 'Engineering'
  | 'Finance'
  | 'Human Resources'
  | 'Customer Support'
  | 'Executive';

export interface EnterpriseUser {
  id: string;
  name: string;
  title: string;
  department: Department;
  clearance: ClearanceLevel;
  clearanceLabel: string;
  email: string;
}

export type DocumentCategory =
  | 'Policy'
  | 'Financial Report'
  | 'Technical Spec'
  | 'Employee Handbook'
  | 'Support Record'
  | 'Project Report';

export interface DocumentPage {
  pageNumber: number;
  sectionTitle: string;
  content: string;
}

export interface DocumentRecord {
  id: string;
  title: string;
  category: DocumentCategory;
  department: Department;
  requiredClearance: ClearanceLevel;
  allowedDepartments: (Department | '*')[];
  author: string;
  updatedAt: string;
  format: 'PDF' | 'DOCX' | 'MD' | 'CSV' | 'TXT';
  pages: DocumentPage[];
  summary: string;
  entities: string[];
  embeddingStatus: 'indexed' | 'pending';
}

export interface DocumentChunk {
  id: string;
  docId: string;
  docTitle: string;
  category: DocumentCategory;
  department: Department;
  requiredClearance: ClearanceLevel;
  allowedDepartments: (Department | '*')[];
  pageNumber: number;
  sectionTitle: string;
  chunkIndex: number;
  text: string;
  tokenCount: number;
  lexicalVector: number[];
  geminiEmbedding?: number[];
}

export interface RetrievalHit {
  chunk: DocumentChunk;
  bm25Score: number;
  vectorScore: number;
  rrfScore: number;
  rerankScore: number;
  finalScore: number;
  matchMethod: 'hybrid' | 'vector' | 'bm25';
  matchedTerms: string[];
}

export type GraphEntityType =
  | 'Person'
  | 'Project'
  | 'Department'
  | 'Document'
  | 'Technology'
  | 'Policy';

export interface GraphNode {
  id: string;
  label: string;
  type: GraphEntityType;
  department?: Department;
  requiredClearance: ClearanceLevel;
  docId?: string;
  summary: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relation: string;
  evidenceDocId: string;
  evidencePage: number;
  weight: number;
}

export interface GraphContextResult {
  nodes: GraphNode[];
  edges: GraphEdge[];
  summaryLines: string[];
}

export type AgentStageStatus = 'completed' | 'skipped' | 'warning';

export interface AgentTraceStep {
  id: string;
  nodeName:
    | 'RBAC Gate'
    | 'Query Planner'
    | 'Hybrid Retrieval'
    | 'Reranker'
    | 'Self-Correction'
    | 'GraphRAG Context'
    | 'Grounded Synthesis'
    | 'Citation Verifier';
  status: AgentStageStatus;
  durationMs: number;
  detail: string;
  subQueries?: string[];
  reformulatedQuery?: string;
  docsScanned?: number;
  docsAuthorized?: number;
  topHitScore?: number;
}

export interface CitationRef {
  id: string;
  docId: string;
  docTitle: string;
  pageNumber: number;
  sectionTitle: string;
  excerpt: string;
  relevanceScore: number;
  verified: boolean;
}

export interface VerificationReport {
  totalClaims: number;
  verifiedClaims: number;
  citationAccuracy: number;
  faithfulnessScore: number;
  hallucinationFlags: string[];
  accessRestrictedNotices: string[];
}

export interface RagQueryResponse {
  answer: string;
  citations: CitationRef[];
  agentTrace: AgentTraceStep[];
  graphContext: GraphContextResult;
  verification: VerificationReport;
  metrics: {
    totalLatencyMs: number;
    estimatedInputTokens: number;
    estimatedOutputTokens: number;
    authorizedChunksCount: number;
    excludedRestrictedDocsCount: number;
    selfCorrectionTriggered: boolean;
  };
  modelUsed: string;
}

export interface ChatTurn {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  response?: RagQueryResponse;
  error?: string;
}

export interface EvaluationCase {
  id: string;
  query: string;
  queryType:
    | 'multi-doc'
    | 'policy-compare'
    | 'graph-multi-hop'
    | 'tabular-numeric'
    | 'self-corrective';
  groundTruthDocIds: string[];
  expectedKeywords: string[];
  description: string;
}

export interface ExperimentVariantMetrics {
  variantName: string;
  experimentGroup:
    | 'Retrieval'
    | 'Ranking'
    | 'Generation'
    | 'Accuracy';
  recallAt5: number;
  mrr: number;
  answerCorrectness: number;
  faithfulness: number;
  citationAccuracy: number;
  avgLatencyMs: number;
  avgTokens: number;
}

export interface EvaluationSuiteResult {
  runTimestamp: string;
  corpusSizeDocs: number;
  corpusSizeChunks: number;
  casesEvaluated: number;
  variants: ExperimentVariantMetrics[];
  perCaseDetails: Array<{
    caseId: string;
    query: string;
    queryType: string;
    vectorRecallAt5: number;
    hybridRecallAt5: number;
    noRerankMrr: number;
    rerankMrr: number;
    selfCorrectionHelped: boolean;
    topRetrievedDocs: string[];
  }>;
}
