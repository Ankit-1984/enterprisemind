import type { DocumentChunk, DocumentRecord } from './types';

const HASH_VECTOR_DIM = 128;

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
  'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were',
  'will', 'with', 'or', 'this', 'these', 'those', 'their', 'they', 'we', 'our',
  'you', 'your', 'can', 'may', 'must', 'should', 'have', 'had', 'not', 'but',
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9.\-_%$]+/g, ' ')
    .split(/\s+/)
    .map((t) => t.replace(/^[.\-_]+|[.\-_]+$/g, ''))
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

function fnv1aHash(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Deterministic dense projection vector (128-d) combining unigrams and character trigrams
 * so vector similarity runs deterministically in unit tests and as an immediate dense index
 * before or alongside remote Gemini embeddings.
 */
export function computeDeterministicDenseVector(text: string): number[] {
  const vec = new Float64Array(HASH_VECTOR_DIM);
  const tokens = tokenize(text);

  for (const token of tokens) {
    const h1 = fnv1aHash(token);
    const idx = h1 % HASH_VECTOR_DIM;
    const sign = (h1 & 1) === 0 ? 1 : -1;
    vec[idx] += sign * 1.4;

    if (token.length >= 4) {
      for (let i = 0; i <= token.length - 3; i++) {
        const tri = token.slice(i, i + 3);
        const hTri = fnv1aHash(`tri:${tri}`);
        const triIdx = hTri % HASH_VECTOR_DIM;
        const triSign = (hTri & 1) === 0 ? 1 : -1;
        vec[triIdx] += triSign * 0.45;
      }
    }
  }

  let norm = 0;
  for (let i = 0; i < HASH_VECTOR_DIM; i++) {
    norm += vec[i] * vec[i];
  }
  norm = Math.sqrt(norm);
  if (norm === 0) return Array.from(vec);
  return Array.from(vec, (v) => Number((v / norm).toFixed(6)));
}

export interface SemanticChunkOptions {
  maxChars?: number;
  overlapSentences?: number;
}

/**
 * Structure-aware semantic chunker: respects page boundaries and paragraph/sentence
 * units rather than arbitrary fixed character slicing, preserving exact page provenance.
 */
export function chunkDocument(
  doc: DocumentRecord,
  options: SemanticChunkOptions = {},
): DocumentChunk[] {
  const maxChars = options.maxChars ?? 680;
  const overlapSentences = options.overlapSentences ?? 1;
  const chunks: DocumentChunk[] = [];
  let globalIdx = 0;

  for (const page of doc.pages) {
    const paragraphs = page.content
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);

    let bufferSentences: string[] = [];
    let bufferLength = 0;

    const flushBuffer = () => {
      if (bufferSentences.length === 0) return;
      const chunkText = bufferSentences.join(' ').replace(/\s+/g, ' ').trim();
      if (!chunkText) return;

      const tokens = tokenize(chunkText);
      chunks.push({
        id: `${doc.id}-p${page.pageNumber}-c${globalIdx}`,
        docId: doc.id,
        docTitle: doc.title,
        category: doc.category,
        department: doc.department,
        requiredClearance: doc.requiredClearance,
        allowedDepartments: doc.allowedDepartments,
        pageNumber: page.pageNumber,
        sectionTitle: page.sectionTitle,
        chunkIndex: globalIdx,
        text: chunkText,
        tokenCount: Math.max(1, Math.round(chunkText.length / 4)),
        lexicalVector: computeDeterministicDenseVector(`${page.sectionTitle} ${chunkText}`),
      });
      globalIdx += 1;

      if (overlapSentences > 0 && bufferSentences.length > overlapSentences) {
        const tail = bufferSentences.slice(-overlapSentences);
        bufferSentences = [...tail];
        bufferLength = tail.join(' ').length;
      } else {
        bufferSentences = [];
        bufferLength = 0;
      }
      void tokens;
    };

    for (const para of paragraphs) {
      const sentences = para
        .split(/(?<=[.!?])\s+(?=[A-Z0-9$])/)
        .map((s) => s.trim())
        .filter(Boolean);

      for (const sentence of sentences) {
        if (bufferLength > 0 && bufferLength + sentence.length + 1 > maxChars) {
          flushBuffer();
        }
        bufferSentences.push(sentence);
        bufferLength += sentence.length + 1;
      }
      // Natural boundary flush if paragraph was substantial
      if (bufferLength >= maxChars * 0.72) {
        flushBuffer();
      }
    }

    flushBuffer();
  }

  return chunks;
}

export function buildCorpusChunks(docs: DocumentRecord[]): DocumentChunk[] {
  return docs.flatMap((doc) => chunkDocument(doc));
}
