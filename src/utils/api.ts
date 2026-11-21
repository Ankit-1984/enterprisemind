import type {
  ClearanceLevel,
  Department,
  DocumentCategory,
  DocumentRecord,
  EnterpriseUser,
  EvaluationSuiteResult,
  GraphEdge,
  GraphNode,
  RagQueryResponse,
} from '../engine/types';

export interface DocumentSummary {
  id: string;
  title: string;
  category: DocumentCategory;
  department: Department;
  requiredClearance: ClearanceLevel;
  author: string;
  updatedAt: string;
  format: DocumentRecord['format'];
  pageCount: number;
  chunkCount: number;
  summary: string;
  entities: string[];
  embeddingStatus: 'indexed' | 'pending';
}

export interface DocumentsListResponse {
  user: EnterpriseUser;
  documents: DocumentSummary[];
  restrictedCount: number;
  totalDocuments: number;
}

export interface GraphResponse {
  user: EnterpriseUser;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

async function handleJson<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  }
  return data as T;
}

export async function fetchUsers(): Promise<EnterpriseUser[]> {
  const res = await fetch('/api/users');
  const data = await handleJson<{ users: EnterpriseUser[] }>(res);
  return data.users;
}

export async function fetchDocuments(userId: string): Promise<DocumentsListResponse> {
  const res = await fetch('/api/documents', {
    headers: { 'x-enterprise-user-id': userId },
  });
  return handleJson<DocumentsListResponse>(res);
}

export async function fetchDocumentDetail(
  docId: string,
  userId: string,
): Promise<DocumentRecord> {
  const res = await fetch(`/api/documents/${encodeURIComponent(docId)}`, {
    headers: { 'x-enterprise-user-id': userId },
  });
  const data = await handleJson<{ document: DocumentRecord }>(res);
  return data.document;
}

export async function queryAgenticRag(
  query: string,
  userId: string,
): Promise<RagQueryResponse> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-enterprise-user-id': userId,
    },
    body: JSON.stringify({ query, userId }),
  });
  return handleJson<RagQueryResponse>(res);
}

export async function uploadDocument(
  payload: {
    title: string;
    category: DocumentCategory;
    department: Department;
    requiredClearance: ClearanceLevel;
    format: DocumentRecord['format'];
    rawText?: string;
    fileBase64?: string;
    mimeType?: string;
  },
  userId: string,
): Promise<{
  document: DocumentRecord;
  chunksCreated: number;
  entitiesAdded: number;
  edgesAdded: number;
}> {
  const res = await fetch('/api/documents/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-enterprise-user-id': userId,
    },
    body: JSON.stringify(payload),
  });
  return handleJson(res);
}

export async function fetchGraphData(userId: string): Promise<GraphResponse> {
  const res = await fetch('/api/graph', {
    headers: { 'x-enterprise-user-id': userId },
  });
  return handleJson<GraphResponse>(res);
}

export async function runEvaluationSuite(): Promise<EvaluationSuiteResult> {
  const res = await fetch('/api/evaluation/run', { method: 'POST' });
  return handleJson<EvaluationSuiteResult>(res);
}
