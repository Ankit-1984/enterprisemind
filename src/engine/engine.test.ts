import test from 'node:test';
import assert from 'node:assert/strict';
import { chunkDocument, buildCorpusChunks, computeDeterministicDenseVector, tokenize } from './chunker';
import {
  canUserAccessDocument,
  computeMrr,
  computeRecallAtK,
  filterAuthorizedChunks,
  retrieveChunks,
  runCorpusEvaluationSuite,
} from './retrieval';
import { computeGraphLayout, filterGraphForUser, queryGraphContext } from './graph';
import {
  ENTERPRISE_USERS,
  EVALUATION_BENCHMARK_CASES,
  SEED_DOCUMENTS,
  SEED_GRAPH_EDGES,
  SEED_GRAPH_NODES,
} from './corpus';

const allChunks = buildCorpusChunks(SEED_DOCUMENTS);

test('semantic chunker preserves page provenance and splits multi-page documents', () => {
  const finDoc = SEED_DOCUMENTS.find((d) => d.id === 'doc-fin-2023-2025');
  assert.ok(finDoc, 'Financial report should exist in seed corpus');

  const chunks = chunkDocument(finDoc);
  assert.ok(chunks.length >= 3, 'Should produce at least one chunk per page');

  const pagesRepresented = new Set(chunks.map((c) => c.pageNumber));
  assert.deepEqual(Array.from(pagesRepresented).sort(), [1, 2, 3]);
  assert.equal(chunks[0].docId, finDoc.id);
  assert.ok(chunks[0].lexicalVector.length === 128);
});

test('deterministic dense vector yields high cosine similarity for semantically overlapping text', () => {
  const v1 = computeDeterministicDenseVector('employee travel hotel lodging reimbursement policy 2026');
  const v2 = computeDeterministicDenseVector('2026 reimbursement policy domestic hotel lodging cap');
  const v3 = computeDeterministicDenseVector('kubernetes gpu taint pool latency spike incident');

  const dot = (a: number[], b: number[]) => a.reduce((acc, x, i) => acc + x * b[i], 0);
  assert.ok(dot(v1, v2) > dot(v1, v3), 'Related policy texts should have higher similarity than unrelated incident text');
});

test('RBAC clearance strictly isolates Level 3 confidential documents from Level 1 & Level 2 users', () => {
  const vpExec = ENTERPRISE_USERS.find((u) => u.clearance === 3)!;
  const finDirector = ENTERPRISE_USERS.find((u) => u.id === 'user-marcus')!;
  const supportSpec = ENTERPRISE_USERS.find((u) => u.clearance === 1)!;

  const execDoc = SEED_DOCUMENTS.find((d) => d.id === 'doc-exec-ma')!;
  const finDoc = SEED_DOCUMENTS.find((d) => d.id === 'doc-fin-2023-2025')!;
  const policyDoc = SEED_DOCUMENTS.find((d) => d.id === 'doc-policy-reimb-2026')!;

  assert.equal(canUserAccessDocument(vpExec, execDoc), true);
  assert.equal(canUserAccessDocument(finDirector, execDoc), false);
  assert.equal(canUserAccessDocument(supportSpec, execDoc), false);

  assert.equal(canUserAccessDocument(finDirector, finDoc), true);
  assert.equal(canUserAccessDocument(supportSpec, finDoc), false);
  assert.equal(canUserAccessDocument(supportSpec, policyDoc), true);

  const l1Filtered = filterAuthorizedChunks(allChunks, supportSpec);
  assert.ok(l1Filtered.excludedDocIds.has('doc-exec-ma'));
  assert.ok(l1Filtered.excludedDocIds.has('doc-fin-2023-2025'));
  assert.equal(
    l1Filtered.authorized.some((c) => c.docId === 'doc-exec-ma'),
    false,
    'No L3 chunk may ever leak into L1 authorized chunk pool',
  );
});

test('hybrid retrieval with reranking ranks exact policy comparison documents in top hits', () => {
  const query = 'Compare 2024 and 2026 employee reimbursement policies lodging cap $240 vs $275';
  const hits = retrieveChunks(query, allChunks, {
    mode: 'hybrid',
    rerank: true,
    topK: 5,
  });

  assert.ok(hits.length >= 2);
  const retrievedDocIds = new Set(hits.map((h) => h.chunk.docId));
  assert.ok(retrievedDocIds.has('doc-policy-reimb-2024'), '2024 policy must be retrieved');
  assert.ok(retrievedDocIds.has('doc-policy-reimb-2026'), '2026 policy must be retrieved');
});

test('GraphRAG traversal enforces RBAC and discovers multi-hop relationships', () => {
  const supportSpec = ENTERPRISE_USERS.find((u) => u.clearance === 1)!;
  const vpExec = ENTERPRISE_USERS.find((u) => u.clearance === 3)!;

  const l1Graph = filterGraphForUser(SEED_GRAPH_NODES, SEED_GRAPH_EDGES, SEED_DOCUMENTS, supportSpec);
  assert.equal(
    l1Graph.nodes.some((n) => n.id === 'node-meridian'),
    false,
    'Level 3 Project Meridian node must be hidden from Level 1 user',
  );

  const execGraph = filterGraphForUser(SEED_GRAPH_NODES, SEED_GRAPH_EDGES, SEED_DOCUMENTS, vpExec);
  assert.equal(
    execGraph.nodes.some((n) => n.id === 'node-meridian'),
    true,
    'Level 3 Executive should see Project Meridian in GraphRAG',
  );

  const context = queryGraphContext(
    'Project Aether dependencies and Project Helios',
    SEED_GRAPH_NODES,
    SEED_GRAPH_EDGES,
    SEED_DOCUMENTS,
    vpExec,
  );
  assert.ok(context.nodes.some((n) => n.id === 'node-aether'));
  assert.ok(context.nodes.some((n) => n.id === 'node-helios'));
  assert.ok(context.summaryLines.length > 0);

  const layout = computeGraphLayout(execGraph.nodes, execGraph.edges);
  assert.equal(layout.length, execGraph.nodes.length);
  for (const pos of layout) {
    assert.ok(pos.x >= 70 && pos.x <= 790);
    assert.ok(pos.y >= 54 && pos.y <= 486);
  }
});

test('evaluation metrics and corpus ablation suite compute valid Recall@5 and MRR', () => {
  assert.equal(computeRecallAtK(['doc-a', 'doc-b', 'doc-c'], ['doc-a', 'doc-c'], 5), 1);
  assert.equal(computeRecallAtK(['doc-a', 'doc-b'], ['doc-a', 'doc-c'], 5), 0.5);
  assert.equal(computeMrr(['doc-x', 'doc-a', 'doc-b'], ['doc-a']), 0.5);

  const evalResult = runCorpusEvaluationSuite(
    allChunks,
    EVALUATION_BENCHMARK_CASES,
    SEED_DOCUMENTS.length,
  );
  assert.equal(evalResult.casesEvaluated, EVALUATION_BENCHMARK_CASES.length);
  assert.equal(evalResult.variants.length, 8);

  const hybridRerank = evalResult.variants.find(
    (v) => v.variantName === 'Hybrid With Cross-Signal Reranking',
  )!;
  const vectorOnly = evalResult.variants.find(
    (v) => v.variantName === 'Vector Search Only',
  )!;

  assert.ok(
    hybridRerank.recallAt5 >= vectorOnly.recallAt5,
    'Hybrid + Reranking Recall@5 should meet or exceed Vector-only baseline',
  );
  assert.ok(tokenize('FY2025 ARR $194.8M').includes('fy2025'));
});
