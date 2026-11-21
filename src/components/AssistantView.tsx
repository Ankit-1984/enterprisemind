import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileSearch,
  GitFork,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import { SUGGESTED_QUERIES } from '../engine/corpus';
import type { ChatTurn, CitationRef, EnterpriseUser } from '../engine/types';
import { MarkdownAnswer } from './MarkdownAnswer';
import { PageInspectorPanel } from './PageInspectorPanel';

interface AssistantViewProps {
  activeUser: EnterpriseUser;
  turns: ChatTurn[];
  isLoading: boolean;
  onSubmitQuery: (query: string) => void;
  onClearHistory: () => void;
  onInspectGraphEntity?: () => void;
}

export function AssistantView({
  activeUser,
  turns,
  isLoading,
  onSubmitQuery,
  onClearHistory,
  onInspectGraphEntity,
}: AssistantViewProps) {
  const [input, setInput] = useState('');
  const [expandedTraceIds, setExpandedTraceIds] = useState<Record<string, boolean>>({});
  const [selectedCitation, setSelectedCitation] = useState<CitationRef | null>(null);

  const toggleTrace = (turnId: string) => {
    setExpandedTraceIds((prev) => ({ ...prev, [turnId]: !prev[turnId] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput('');
    onSubmitQuery(trimmed);
  };

  return (
    <div className="flex-1 flex min-w-0 h-full overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 h-full bg-slate-50">
        {/* Sub-toolbar */}
        <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between gap-4 shrink-0">
          <div className="min-w-0">
            <h1 className="font-display text-sm font-semibold text-slate-900 truncate">
              Agentic Knowledge Assistant
            </h1>
            <p className="text-xs text-slate-500 truncate">
              Hybrid BM25 + Vector Retrieval <span aria-hidden="true">·</span> Reranking{' '}
              <span aria-hidden="true">·</span> GraphRAG <span aria-hidden="true">·</span>{' '}
              Self-Corrective Verification
            </p>
          </div>
          {turns.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setSelectedCitation(null);
                onClearHistory();
              }}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              New Thread
            </button>
          )}
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {turns.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-6 lg:p-8 space-y-6">
                <div className="space-y-2 max-w-xl">
                  <h2 className="font-display text-2xl font-semibold text-slate-900 tracking-tight text-balance">
                    Ask complex questions across your authorized enterprise corpus
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Every query executes pre-retrieval RBAC filtering for{' '}
                    <span className="font-medium text-slate-900">{activeUser.name}</span>{' '}
                    (Clearance L{activeUser.clearance}), decomposes multi-document lookups,
                    fuses BM25 and dense embeddings, traverses GraphRAG relationships, and
                    verifies page-level citations.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SUGGESTED_QUERIES.slice(0, 4).map((q) => (
                    <button
                      key={q.label}
                      type="button"
                      onClick={() => onSubmitQuery(q.query)}
                      className="text-left p-4 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-blue-300 transition-colors group focus-visible:outline-2 focus-visible:outline-blue-700"
                    >
                      <div className="text-xs font-semibold text-slate-900 group-hover:text-blue-700">
                        {q.label}
                      </div>
                      <div className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {q.query}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              turns.map((turn) => {
                if (turn.role === 'user') {
                  return (
                    <div key={turn.id} className="flex justify-end">
                      <div className="max-w-xl bg-slate-900 text-white px-4 py-3 rounded-xl text-sm leading-relaxed">
                        {turn.content}
                      </div>
                    </div>
                  );
                }

                if (turn.error) {
                  return (
                    <div
                      key={turn.id}
                      className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
                    >
                      <AlertTriangle
                        className="w-4 h-4 text-red-600 mt-0.5 shrink-0"
                        aria-hidden="true"
                      />
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-red-900">
                          Pipeline Execution Error
                        </div>
                        <p className="text-xs text-red-700">{turn.error}</p>
                      </div>
                    </div>
                  );
                }

                const resp = turn.response;
                if (!resp) return null;
                const isTraceOpen = Boolean(expandedTraceIds[turn.id]);

                return (
                  <article
                    key={turn.id}
                    className="bg-white border border-slate-200 rounded-xl p-5 lg:p-6 space-y-4"
                  >
                    {/* Access Boundary Warning if restricted doc requested */}
                    {resp.verification.accessRestrictedNotices.length > 0 && (
                      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5">
                        <ShieldAlert
                          className="w-4 h-4 text-amber-700 mt-0.5 shrink-0"
                          aria-hidden="true"
                        />
                        <div className="space-y-1">
                          <div className="text-xs font-semibold text-amber-900">
                            RBAC Access Boundary Enforced
                          </div>
                          {resp.verification.accessRestrictedNotices.map((notice, idx) => (
                            <p key={idx} className="text-xs text-amber-800 leading-relaxed">
                              {notice}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Answer prose */}
                    <MarkdownAnswer
                      text={resp.answer}
                      citations={resp.citations}
                      onSelectCitation={(cit) => setSelectedCitation(cit)}
                    />

                    {/* Verified Source Citations List */}
                    {resp.citations.length > 0 && (
                      <div className="pt-3 border-t border-slate-200 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-slate-700">
                            Verified Document References ({resp.citations.length})
                          </span>
                          <span className="text-xs font-mono text-emerald-700 tabular-nums">
                            {Math.round(resp.verification.citationAccuracy * 100)}% citation
                            accuracy · {Math.round(resp.verification.faithfulnessScore * 100)}%
                            faithfulness
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {resp.citations.map((cit) => (
                            <button
                              key={cit.id}
                              type="button"
                              onClick={() => setSelectedCitation(cit)}
                              className={`text-left p-2.5 rounded-lg border transition-colors flex items-start gap-2.5 ${
                                selectedCitation?.id === cit.id
                                  ? 'border-blue-600 bg-blue-50/50'
                                  : 'border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300'
                              }`}
                            >
                              <FileSearch
                                className="w-4 h-4 text-blue-700 mt-0.5 shrink-0"
                                aria-hidden="true"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-medium text-slate-900 truncate">
                                  {cit.docTitle}
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                                  Page {cit.pageNumber} · {cit.sectionTitle}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* GraphRAG Summary Strip */}
                    {resp.graphContext.summaryLines.length > 0 && (
                      <div className="pt-3 border-t border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                            <GitFork className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                            GraphRAG Entity Context ({resp.graphContext.edges.length} edges)
                          </span>
                          {onInspectGraphEntity && (
                            <button
                              type="button"
                              onClick={onInspectGraphEntity}
                              className="text-xs font-medium text-blue-700 hover:underline whitespace-nowrap"
                            >
                              Explore Knowledge Graph
                            </button>
                          )}
                        </div>
                        <div className="text-xs font-mono text-slate-600 space-y-1 bg-slate-50 border border-slate-200 rounded-lg p-3">
                          {resp.graphContext.summaryLines.slice(0, 4).map((line, i) => (
                            <div key={i} className="truncate">
                              {line}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Collapsible Agentic Execution Trace */}
                    <div className="pt-3 border-t border-slate-200">
                      <button
                        type="button"
                        aria-expanded={isTraceOpen}
                        onClick={() => toggleTrace(turn.id)}
                        className="w-full flex items-center justify-between gap-3 text-left text-xs text-slate-600 hover:text-slate-900 py-1"
                      >
                        <span className="inline-flex items-center gap-1.5 font-medium">
                          {isTraceOpen ? (
                            <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                          )}
                          Agentic Reasoning &amp; Retrieval Trace ({resp.agentTrace.length} steps)
                        </span>
                        <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                          {resp.metrics.totalLatencyMs} ms ·{' '}
                          {resp.metrics.estimatedInputTokens + resp.metrics.estimatedOutputTokens}{' '}
                          tokens
                          {resp.metrics.selfCorrectionTriggered ? ' · Self-Corrected' : ''}
                        </span>
                      </button>

                      {isTraceOpen && (
                        <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                          {resp.agentTrace.map((step) => (
                            <div
                              key={step.id}
                              className="flex items-start justify-between gap-3 text-xs py-1.5"
                            >
                              <div className="flex items-start gap-2 min-w-0">
                                <CheckCircle2
                                  className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                                    step.status === 'warning'
                                      ? 'text-amber-600'
                                      : step.status === 'skipped'
                                        ? 'text-slate-400'
                                        : 'text-emerald-600'
                                  }`}
                                  aria-hidden="true"
                                />
                                <div className="min-w-0 space-y-0.5">
                                  <div className="font-medium text-slate-900">
                                    {step.nodeName}
                                  </div>
                                  <p className="text-slate-600 leading-relaxed">{step.detail}</p>
                                  {step.subQueries && step.subQueries.length > 0 && (
                                    <div className="text-[11px] font-mono text-slate-500 pt-0.5">
                                      Sub-queries: {step.subQueries.join(' | ')}
                                    </div>
                                  )}
                                  {step.reformulatedQuery && (
                                    <div className="text-[11px] font-mono text-amber-800 pt-0.5">
                                      Reformulated: &ldquo;{step.reformulatedQuery}&rdquo;
                                    </div>
                                  )}
                                </div>
                              </div>
                              <span className="font-mono text-[11px] text-slate-500 tabular-nums shrink-0">
                                {step.durationMs} ms
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })
            )}

            {isLoading && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-3">
                <Loader2
                  className="w-4 h-4 text-blue-700 animate-spin shrink-0"
                  aria-hidden="true"
                />
                <div className="text-sm text-slate-700">
                  Executing RBAC gate, Hybrid BM25 + Vector search, reranking, and citation
                  verification…
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Composer */}
        <div className="bg-white border-t border-slate-200 px-4 lg:px-8 py-4 shrink-0">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex items-end gap-3">
            <div className="flex-1">
              <label htmlFor="assistant-query-input" className="sr-only">
                Ask EnterpriseMind a question
              </label>
              <input
                id="assistant-query-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask as ${activeUser.name} (Clearance L${activeUser.clearance})…`}
                disabled={isLoading}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-2 focus:outline-blue-700"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || input.trim().length < 2}
              aria-label="Send question"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <span>Ask</span>
              <ArrowUp className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>

      {/* Collapsible Right-Side Document Page Inspector */}
      {selectedCitation && (
        <PageInspectorPanel
          docId={selectedCitation.docId}
          initialPage={selectedCitation.pageNumber}
          highlightExcerpt={selectedCitation.excerpt}
          userId={activeUser.id}
          citation={selectedCitation}
          onClose={() => setSelectedCitation(null)}
        />
      )}
    </div>
  );
}
