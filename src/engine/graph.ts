import { tokenize } from './chunker';
import type {
  DocumentRecord,
  EnterpriseUser,
  GraphContextResult,
  GraphEdge,
  GraphNode,
} from './types';
import { canUserAccessDocument } from './retrieval';

export function filterGraphForUser(
  nodes: GraphNode[],
  edges: GraphEdge[],
  documents: DocumentRecord[],
  user: EnterpriseUser,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const authorizedDocIds = new Set(
    documents.filter((d) => canUserAccessDocument(user, d)).map((d) => d.id),
  );

  const visibleNodes = nodes.filter((node) => {
    if (user.clearance < node.requiredClearance) return false;
    if (node.docId && !authorizedDocIds.has(node.docId)) return false;
    return true;
  });

  const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));
  const visibleEdges = edges.filter(
    (edge) =>
      visibleNodeIds.has(edge.source) &&
      visibleNodeIds.has(edge.target) &&
      authorizedDocIds.has(edge.evidenceDocId),
  );

  return { nodes: visibleNodes, edges: visibleEdges };
}

/**
 * GraphRAG 1-hop and 2-hop traversal over authorized enterprise entities.
 */
export function queryGraphContext(
  query: string,
  allNodes: GraphNode[],
  allEdges: GraphEdge[],
  documents: DocumentRecord[],
  user: EnterpriseUser,
  maxNodes = 10,
): GraphContextResult {
  const { nodes, edges } = filterGraphForUser(allNodes, allEdges, documents, user);
  const queryTokens = tokenize(query);
  const queryLower = query.toLowerCase();

  // Score seed nodes by lexical & label overlap
  const scoredSeeds = nodes
    .map((node) => {
      const hay = `${node.label} ${node.type} ${node.summary}`.toLowerCase();
      let score = 0;
      if (queryLower.includes(node.label.toLowerCase())) {
        score += 5;
      }
      for (const t of queryTokens) {
        if (hay.includes(t)) score += 1.2;
      }
      return { node, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  const seedNodes = scoredSeeds.slice(0, 3).map((s) => s.node);
  if (seedNodes.length === 0) {
    return { nodes: [], edges: [], summaryLines: [] };
  }

  const collectedIds = new Set<string>(seedNodes.map((n) => n.id));
  const collectedEdges: GraphEdge[] = [];

  // 1-hop expansion
  for (const edge of edges) {
    if (collectedIds.has(edge.source) || collectedIds.has(edge.target)) {
      collectedEdges.push(edge);
      if (collectedIds.size < maxNodes) {
        collectedIds.add(edge.source);
        collectedIds.add(edge.target);
      }
    }
  }

  // 2-hop bridge expansion for remaining slots
  if (collectedIds.size < maxNodes) {
    for (const edge of edges) {
      if (
        (collectedIds.has(edge.source) || collectedIds.has(edge.target)) &&
        !collectedEdges.some((e) => e.id === edge.id)
      ) {
        collectedEdges.push(edge);
        collectedIds.add(edge.source);
        collectedIds.add(edge.target);
        if (collectedIds.size >= maxNodes) break;
      }
    }
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const resultNodes = Array.from(collectedIds)
    .map((id) => nodeMap.get(id))
    .filter((n): n is GraphNode => Boolean(n))
    .slice(0, maxNodes);

  const finalNodeIds = new Set(resultNodes.map((n) => n.id));
  const finalEdges = collectedEdges.filter(
    (e) => finalNodeIds.has(e.source) && finalNodeIds.has(e.target),
  );

  const summaryLines = finalEdges.slice(0, 8).map((edge) => {
    const src = nodeMap.get(edge.source)?.label ?? edge.source;
    const tgt = nodeMap.get(edge.target)?.label ?? edge.target;
    return `${src} --[${edge.relation}]--> ${tgt} (evidence: ${edge.evidenceDocId}, p.${edge.evidencePage})`;
  });

  return {
    nodes: resultNodes,
    edges: finalEdges,
    summaryLines,
  };
}

export interface PositionedGraphNode extends GraphNode {
  x: number;
  y: number;
  degree: number;
}

/**
 * Deterministic force-refined layout inside a fixed SVG canvas coordinate frame.
 */
export function computeGraphLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  width = 860,
  height = 540,
): PositionedGraphNode[] {
  if (nodes.length === 0) return [];

  const degreeMap = new Map<string, number>();
  for (const n of nodes) degreeMap.set(n.id, 0);
  for (const e of edges) {
    degreeMap.set(e.source, (degreeMap.get(e.source) ?? 0) + 1);
    degreeMap.set(e.target, (degreeMap.get(e.target) ?? 0) + 1);
  }

  const typeOrder: Record<GraphNode['type'], number> = {
    Department: 0,
    Project: 1,
    Person: 2,
    Policy: 3,
    Technology: 4,
    Document: 5,
  };

  const cx = width / 2;
  const cy = height / 2;

  const sorted = [...nodes].sort(
    (a, b) => typeOrder[a.type] - typeOrder[b.type] || a.label.localeCompare(b.label),
  );

  const positions = sorted.map((node, idx) => {
    const ring = typeOrder[node.type] % 3;
    const radius = 140 + ring * 78;
    const angle = (idx / Math.max(1, sorted.length)) * Math.PI * 2 - Math.PI / 2;
    return {
      ...node,
      x: cx + Math.cos(angle) * radius * 1.45,
      y: cy + Math.sin(angle) * radius * 0.92,
      vx: 0,
      vy: 0,
      degree: degreeMap.get(node.id) ?? 0,
    };
  });

  const posMap = new Map(positions.map((p) => [p.id, p]));

  // 70 deterministic relaxation iterations for generous, collision-free spacing
  for (let iter = 0; iter < 70; iter++) {
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const a = positions[i];
        const b = positions[j];
        const dx = b.x - a.x || 0.5;
        const dy = b.y - a.y || 0.5;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq) || 1;
        const repulsion = 14500 / Math.max(900, distSq);
        const fx = (dx / dist) * repulsion;
        const fy = (dy / dist) * repulsion;
        a.vx -= fx;
        a.vy -= fy;
        b.vx += fx;
        b.vy += fy;
      }
    }

    for (const edge of edges) {
      const a = posMap.get(edge.source);
      const b = posMap.get(edge.target);
      if (!a || !b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const targetDist = 185;
      const spring = (dist - targetDist) * 0.028;
      const fx = (dx / dist) * spring;
      const fy = (dy / dist) * spring;
      a.vx += fx;
      a.vy += fy;
      b.vx -= fx;
      b.vy -= fy;
    }

    for (const p of positions) {
      p.vx += (cx - p.x) * 0.004;
      p.vy += (cy - p.y) * 0.004;
      p.x = Math.max(88, Math.min(width - 88, p.x + p.vx * 0.65));
      p.y = Math.max(58, Math.min(height - 64, p.y + p.vy * 0.65));
      p.vx *= 0.42;
      p.vy *= 0.42;
    }
  }

  return positions.map(({ vx: _vx, vy: _vy, ...rest }) => ({
    ...rest,
    x: Math.round(rest.x),
    y: Math.round(rest.y),
  }));
}
