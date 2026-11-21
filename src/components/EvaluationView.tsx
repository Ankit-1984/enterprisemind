import { Play, RefreshCw } from 'lucide-react';
import type { EvaluationSuiteResult, ExperimentVariantMetrics } from '../engine/types';

interface EvaluationViewProps {
  evaluation: EvaluationSuiteResult | null;
  loading: boolean;
  onRunBenchmark: () => void;
}

const GROUPS: Array<{
  group: ExperimentVariantMetrics['experimentGroup'];
  title: string;
  subtitle: string;
}> = [
  {
    group: 'Retrieval',
    title: '01. Retrieval Ablation: Vector vs Hybrid (BM25 + Vector RRF)',
    subtitle: 'Measures top-5 document recall and rank precision on policy codes & paraphrases.',
  },
  {
    group: 'Ranking',
    title: '02. Ranking Ablation: Without vs With Cross-Signal Reranking',
    subtitle: 'Measures MRR lift and exact year/section alignment after RRF pooling.',
  },
  {
    group: 'Generation',
    title: '03. Generation Ablation: Basic Single-Pass vs Agentic + GraphRAG',
    subtitle: 'Compares multi-doc synthesis correctness and latency/token trade-off.',
  },
  {
    group: 'Accuracy',
    title: '04. Accuracy Ablation: Unverified vs Citation-Verified Pipeline',
    subtitle: 'Measures claim-to-page faithfulness and hallucination prevention.',
  },
];

function ComparisonBar({
  label,
  baselineVal,
  upgradedVal,
  format = 'pct',
}: {
  label: string;
  baselineVal: number;
  upgradedVal: number;
  format?: 'pct' | 'num';
}) {
  const bPct = Math.min(100, Math.max(0, baselineVal * 100));
  const uPct = Math.min(100, Math.max(0, upgradedVal * 100));
  const fmt = (v: number) =>
    format === 'pct' ? `${(v * 100).toFixed(1)}%` : v.toFixed(3);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-600">{label}</span>
        <span className="font-mono tabular-nums text-slate-900">
          {fmt(baselineVal)} <span aria-hidden="true">→</span>{' '}
          <strong className="text-blue-700 font-semibold">{fmt(upgradedVal)}</strong>
        </span>
      </div>
      <div className="space-y-1">
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-slate-400 rounded-full"
            style={{ width: `${bPct}%` }}
          />
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-700 rounded-full"
            style={{ width: `${uPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function EvaluationView({
  evaluation,
  loading,
  onRunBenchmark,
}: EvaluationViewProps) {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-display text-lg font-semibold text-slate-900">
              Empirical Evaluation &amp; Ablation Lab
            </h1>
            <p className="text-xs text-slate-600">
              Live quantitative benchmark across {evaluation?.casesEvaluated ?? 8} multi-document
              test cases ({evaluation?.corpusSizeDocs ?? 10} docs ·{' '}
              {evaluation?.corpusSizeChunks ?? 0} semantic chunks) measuring Recall@5, MRR,
              Faithfulness, Citation Accuracy, and Latency.
            </p>
          </div>
          <button
            type="button"
            onClick={onRunBenchmark}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            {loading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Play className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            {loading ? 'Running Suite…' : 'Run Live Benchmark'}
          </button>
        </div>

        {evaluation ? (
          <>
            {/* 4 Ablation Comparison Pairs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {GROUPS.map(({ group, title, subtitle }) => {
                const pair = evaluation.variants.filter(
                  (v) => v.experimentGroup === group,
                );
                if (pair.length < 2) return null;
                const [baseline, upgraded] = pair;

                return (
                  <section
                    key={group}
                    className="bg-white border border-slate-200 rounded-xl p-5 space-y-4"
                  >
                    <div>
                      <h2 className="font-display text-sm font-semibold text-slate-900">
                        {title}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-slate-500 border-b border-slate-100 pb-2">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-xs bg-slate-400 inline-block" />
                        {baseline.variantName}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-xs bg-blue-700 inline-block" />
                        {upgraded.variantName}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <ComparisonBar
                        label="Recall@5"
                        baselineVal={baseline.recallAt5}
                        upgradedVal={upgraded.recallAt5}
                      />
                      <ComparisonBar
                        label="Mean Reciprocal Rank (MRR)"
                        baselineVal={baseline.mrr}
                        upgradedVal={upgraded.mrr}
                        format="num"
                      />
                      <ComparisonBar
                        label="Answer Correctness"
                        baselineVal={baseline.answerCorrectness}
                        upgradedVal={upgraded.answerCorrectness}
                      />
                      <ComparisonBar
                        label="Citation Accuracy"
                        baselineVal={baseline.citationAccuracy}
                        upgradedVal={upgraded.citationAccuracy}
                      />
                    </div>
                  </section>
                );
              })}
            </div>

            {/* Full Quantitative Comparison Matrix */}
            <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
                <h2 className="font-display text-sm font-semibold text-slate-900">
                  Full Experiment Comparison Matrix
                </h2>
                <span className="text-xs font-mono text-slate-500 tabular-nums">
                  Evaluated {new Date(evaluation.runTimestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-2.5 px-4">Experiment</th>
                      <th className="py-2.5 px-4">Pipeline Variant</th>
                      <th className="py-2.5 px-4 text-right">Recall@5</th>
                      <th className="py-2.5 px-4 text-right">MRR</th>
                      <th className="py-2.5 px-4 text-right">Correctness</th>
                      <th className="py-2.5 px-4 text-right">Faithfulness</th>
                      <th className="py-2.5 px-4 text-right">Citation Acc.</th>
                      <th className="py-2.5 px-4 text-right">Latency</th>
                      <th className="py-2.5 px-4 text-right">Tokens</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {evaluation.variants.map((v) => (
                      <tr key={v.variantName} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-medium text-slate-500">
                          {v.experimentGroup}
                        </td>
                        <td className="py-2.5 px-4 font-medium text-slate-900">
                          {v.variantName}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-800">
                          {(v.recallAt5 * 100).toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-800">
                          {v.mrr.toFixed(3)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-800">
                          {(v.answerCorrectness * 100).toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-800">
                          {(v.faithfulness * 100).toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-800">
                          {(v.citationAccuracy * 100).toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-600">
                          {v.avgLatencyMs} ms
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-600">
                          {v.avgTokens}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Per-Query Benchmark Diagnostics */}
            <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-200">
                <h2 className="font-display text-sm font-semibold text-slate-900">
                  Per-Case Retrieval Diagnostics ({evaluation.perCaseDetails.length} Cases)
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-2.5 px-4">Benchmark Query</th>
                      <th className="py-2.5 px-4">Category</th>
                      <th className="py-2.5 px-4 text-right">Vector R@5</th>
                      <th className="py-2.5 px-4 text-right">Hybrid+Rerank R@5</th>
                      <th className="py-2.5 px-4 text-right">No-Rerank MRR</th>
                      <th className="py-2.5 px-4 text-right">Reranked MRR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {evaluation.perCaseDetails.map((c) => (
                      <tr key={c.caseId} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 text-slate-900 max-w-md">
                          <div className="font-medium truncate">{c.query}</div>
                          <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                            Top hits: {c.topRetrievedDocs.join(', ')}
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 font-mono">
                          {c.queryType}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-700">
                          {(c.vectorRecallAt5 * 100).toFixed(0)}%
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono tabular-nums font-semibold text-blue-700">
                          {(c.hybridRecallAt5 * 100).toFixed(0)}%
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-700">
                          {c.noRerankMrr.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono tabular-nums font-semibold text-emerald-700">
                          {c.rerankMrr.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
            <p className="text-sm text-slate-600">Loading evaluation benchmark suite…</p>
          </div>
        )}
      </div>
    </div>
  );
}
