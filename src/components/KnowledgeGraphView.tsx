import { useEffect, useMemo, useState } from 'react';
import { MessageSquare, RotateCcw, Search, ZoomIn, ZoomOut } from 'lucide-react';
import { computeGraphLayout } from '../engine/graph';
import type {
  EnterpriseUser,
  GraphEdge,
  GraphEntityType,
  GraphNode,
} from '../engine/types';
import { PageInspectorPanel } from './PageInspectorPanel';

interface KnowledgeGraphViewProps {
  activeUser: EnterpriseUser;
  nodes: GraphNode[];
  edges: GraphEdge[];
  loading: boolean;
  onAskAboutEntity: (entityLabel: string) => void;
}

const ENTITY_TYPES: Array<'All' | GraphEntityType> = [
  'All',
  'Person',
  'Project',
  'Department',
  'Policy',
  'Technology',
  'Document',
];

const TYPE_STYLES: Record<
  GraphEntityType,
  { fill: string; stroke: string; text: string }
> = {
  Person: { fill: '#EFF6FF', stroke: '#1D4ED8', text: '#1E3A8A' },
  Project: { fill: '#F0FDF4', stroke: '#15803D', text: '#14532D' },
  Department: { fill: '#F8FAFC', stroke: '#475569', text: '#0F172A' },
  Policy: { fill: '#FFFBEB', stroke: '#B45309', text: '#78350F' },
  Technology: { fill: '#F5F3FF', stroke: '#6D28D9', text: '#4C1D95' },
  Document: { fill: '#F1F5F9', stroke: '#334155', text: '#0F172A' },
};

export function KnowledgeGraphView({
  activeUser,
  nodes,
  edges,
  loading,
  onAskAboutEntity,
}: KnowledgeGraphViewProps) {
  const [typeFilter, setTypeFilter] = useState<'All' | GraphEntityType>('All');
  const [search, setSearch] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [inspectEvidence, setInspectEvidence] = useState<{
    docId: string;
    page: number;
  } | null>(null);

  const visibleNodes = useMemo(() => {
    const q = search.trim().toLowerCase();
    return nodes.filter((n) => {
      if (typeFilter !== 'All' && n.type !== typeFilter) return false;
      if (!q) return true;
      return (
        n.label.toLowerCase().includes(q) || n.summary.toLowerCase().includes(q)
      );
    });
  }, [nodes, typeFilter, search]);

  const visibleNodeIds = useMemo(
    () => new Set(visibleNodes.map((n) => n.id)),
    [visibleNodes],
  );

  const visibleEdges = useMemo(
    () =>
      edges.filter(
        (e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target),
      ),
    [edges, visibleNodeIds],
  );

  const positionedNodes = useMemo(
    () => computeGraphLayout(visibleNodes, visibleEdges, 860, 540),
    [visibleNodes, visibleEdges],
  );

  const posMap = useMemo(
    () => new Map(positionedNodes.map((n) => [n.id, n])),
    [positionedNodes],
  );

  useEffect(() => {
    if (
      selectedNodeId &&
      !visibleNodeIds.has(selectedNodeId) &&
      positionedNodes.length > 0
    ) {
      setSelectedNodeId(positionedNodes[0].id);
    } else if (!selectedNodeId && positionedNodes.length > 0) {
      const helios = positionedNodes.find((n) => n.id === 'node-helios');
      setSelectedNodeId((helios ?? positionedNodes[0]).id);
    }
  }, [positionedNodes, selectedNodeId, visibleNodeIds]);

  const selectedNode = positionedNodes.find((n) => n.id === selectedNodeId) ?? null;

  const connectedEdges = useMemo(() => {
    if (!selectedNode) return [];
    return visibleEdges.filter(
      (e) => e.source === selectedNode.id || e.target === selectedNode.id,
    );
  }, [selectedNode, visibleEdges]);

  const connectedNodeIds = useMemo(() => {
    const set = new Set<string>();
    if (selectedNode) set.add(selectedNode.id);
    for (const e of connectedEdges) {
      set.add(e.source);
      set.add(e.target);
    }
    return set;
  }, [selectedNode, connectedEdges]);

  return (
    <div className="flex-1 flex min-w-0 h-full overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 h-full bg-slate-50">
        {/* Toolbar */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 space-y-3 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-lg font-semibold text-slate-900">
                Enterprise GraphRAG Explorer
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {visibleNodes.length} authorized entities <span aria-hidden="true">·</span>{' '}
                {visibleEdges.length} verified relationships for {activeUser.name} (Clearance L
                {activeUser.clearance})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-52">
                <Search
                  className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                  aria-hidden="true"
                />
                <label htmlFor="graph-node-search" className="sr-only">
                  Search graph entities
                </label>
                <input
                  id="graph-node-search"
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter entity…"
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-2 focus:outline-blue-700"
                />
              </div>

              <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.7, Number((z - 0.15).toFixed(2))))}
                  aria-label="Zoom out graph"
                  className="p-1.5 text-slate-600 hover:bg-slate-50 border-r border-slate-200"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom(1)}
                  aria-label="Reset graph zoom"
                  className="px-2 py-1 text-xs font-mono tabular-nums text-slate-700 hover:bg-slate-50 border-r border-slate-200"
                >
                  {Math.round(zoom * 100)}%
                </button>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(1.6, Number((z + 0.15).toFixed(2))))}
                  aria-label="Zoom in graph"
                  className="p-1.5 text-slate-600 hover:bg-slate-50"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto max-w-full w-fit">
            {ENTITY_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  typeFilter === t
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Main Canvas + Entity Detail Inspector */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
          <div className="flex-1 relative overflow-auto p-4 flex items-center justify-center">
            {loading ? (
              <div className="w-full h-96 bg-white border border-slate-200 rounded-xl animate-pulse" />
            ) : positionedNodes.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3">
                <p className="text-sm font-medium text-slate-900">
                  No authorized entities match your filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setTypeFilter('All');
                    setSearch('');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-900 text-white rounded-lg"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  Reset Graph Filters
                </button>
              </div>
            ) : (
              <div className="w-full h-full min-h-[420px] bg-white border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center">
                <svg
                  data-testid="knowledge-graph-svg"
                  viewBox="0 0 860 540"
                  className="w-full h-full max-h-[600px] select-none"
                  style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
                >
                  <defs>
                    <marker
                      id="edge-arrow"
                      viewBox="0 0 10 10"
                      refX="18"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="#94A3B8" />
                    </marker>
                    <marker
                      id="edge-arrow-active"
                      viewBox="0 0 10 10"
                      refX="18"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="#1D4ED8" />
                    </marker>
                  </defs>

                  {/* Edges */}
                  {visibleEdges.map((edge) => {
                    const src = posMap.get(edge.source);
                    const tgt = posMap.get(edge.target);
                    if (!src || !tgt) return null;
                    const isHighlighted =
                      selectedNode &&
                      (edge.source === selectedNode.id || edge.target === selectedNode.id);

                    const midX = (src.x + tgt.x) / 2;
                    const midY = (src.y + tgt.y) / 2;

                    return (
                      <g key={edge.id}>
                        <line
                          x1={src.x}
                          y1={src.y}
                          x2={tgt.x}
                          y2={tgt.y}
                          stroke={isHighlighted ? '#1D4ED8' : '#CBD5E1'}
                          strokeWidth={isHighlighted ? 2 : 1.2}
                          strokeOpacity={selectedNode && !isHighlighted ? 0.35 : 0.9}
                          markerEnd={
                            isHighlighted ? 'url(#edge-arrow-active)' : 'url(#edge-arrow)'
                          }
                        />
                        {isHighlighted && (
                          <g transform={`translate(${midX}, ${midY})`}>
                            <rect
                              x={-edge.relation.length * 3.2 - 6}
                              y={-9}
                              width={edge.relation.length * 6.4 + 12}
                              height={18}
                              rx={4}
                              fill="#FFFFFF"
                              stroke="#BFDBFE"
                              strokeWidth={1}
                            />
                            <text
                              textAnchor="middle"
                              dominantBaseline="central"
                              fontSize="9"
                              fontFamily="JetBrains Mono, monospace"
                              fill="#1E40AF"
                            >
                              {edge.relation}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {/* Nodes */}
                  {positionedNodes.map((node) => {
                    const style = TYPE_STYLES[node.type];
                    const isSelected = selectedNode?.id === node.id;
                    const isNeighbor = connectedNodeIds.has(node.id);
                    const dimmed = selectedNode && !isNeighbor;
                    const r = isSelected ? 22 : 17;

                    return (
                      <g
                        key={node.id}
                        role="button"
                        tabIndex={0}
                        aria-label={`Inspect entity ${node.label} (${node.type})`}
                        transform={`translate(${node.x}, ${node.y})`}
                        onClick={() => setSelectedNodeId(node.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedNodeId(node.id);
                          }
                        }}
                        style={{ cursor: 'pointer', opacity: dimmed ? 0.35 : 1 }}
                      >
                        <circle
                          r={r}
                          fill={style.fill}
                          stroke={isSelected ? '#1D4ED8' : style.stroke}
                          strokeWidth={isSelected ? 2.5 : 1.5}
                        />
                        <text
                          y={1}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize="9"
                          fontWeight="600"
                          fontFamily="JetBrains Mono, monospace"
                          fill={style.text}
                        >
                          {node.type.slice(0, 3).toUpperCase()}
                        </text>
                        <rect
                          x={-Math.min(75, node.label.length * 3.6 + 8)}
                          y={r + 5}
                          width={Math.min(150, node.label.length * 7.2 + 16)}
                          height={18}
                          rx={4}
                          fill="#FFFFFF"
                          fillOpacity={0.92}
                        />
                        <text
                          y={r + 14}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize="11"
                          fontWeight={isSelected ? '600' : '500'}
                          fontFamily="DM Sans, sans-serif"
                          fill="#0F172A"
                        >
                          {node.label.length > 22
                            ? `${node.label.slice(0, 20)}…`
                            : node.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            )}
          </div>

          {/* Right Node Detail Panel */}
          <aside className="w-full lg:w-[340px] shrink-0 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 p-5 overflow-y-auto space-y-5">
            {selectedNode ? (
              <>
                <div className="space-y-1.5">
                  <div className="text-xs text-slate-500">
                    {selectedNode.type} <span aria-hidden="true">·</span> Clearance L
                    {selectedNode.requiredClearance}
                    {selectedNode.department ? ` · ${selectedNode.department}` : ''}
                  </div>
                  <h2 className="font-display text-base font-semibold text-slate-900">
                    {selectedNode.label}
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedNode.summary}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onAskAboutEntity(selectedNode.label)}
                  className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                  Query Assistant About {selectedNode.label}
                </button>

                <div className="space-y-2.5 pt-2 border-t border-slate-200">
                  <h3 className="text-xs font-semibold text-slate-700">
                    Verified Relationships ({connectedEdges.length})
                  </h3>

                  {connectedEdges.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      No visible relationships under the current filter.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {connectedEdges.map((edge) => {
                        const isOutgoing = edge.source === selectedNode.id;
                        const otherId = isOutgoing ? edge.target : edge.source;
                        const otherNode = nodes.find((n) => n.id === otherId);

                        return (
                          <div
                            key={edge.id}
                            className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5"
                          >
                            <div className="text-xs text-slate-800 font-medium">
                              {isOutgoing ? (
                                <>
                                  <span className="font-mono text-blue-700">{edge.relation}</span>{' '}
                                  <span aria-hidden="true">→</span>{' '}
                                  <button
                                    type="button"
                                    onClick={() => setSelectedNodeId(otherId)}
                                    className="underline decoration-slate-300 hover:text-blue-700"
                                  >
                                    {otherNode?.label ?? otherId}
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedNodeId(otherId)}
                                    className="underline decoration-slate-300 hover:text-blue-700"
                                  >
                                    {otherNode?.label ?? otherId}
                                  </button>{' '}
                                  <span aria-hidden="true">→</span>{' '}
                                  <span className="font-mono text-blue-700">{edge.relation}</span>
                                </>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setInspectEvidence({
                                  docId: edge.evidenceDocId,
                                  page: edge.evidencePage,
                                })
                              }
                              className="text-[11px] font-mono text-slate-500 hover:text-blue-700"
                            >
                              Evidence: {edge.evidenceDocId} · p.{edge.evidencePage}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-500">
                Select any entity node in the graph to inspect its multi-hop relationships and
                document provenance.
              </p>
            )}
          </aside>
        </div>
      </div>

      {inspectEvidence && (
        <PageInspectorPanel
          docId={inspectEvidence.docId}
          initialPage={inspectEvidence.page}
          userId={activeUser.id}
          onClose={() => setInspectEvidence(null)}
        />
      )}
    </div>
  );
}
