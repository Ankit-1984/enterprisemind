import { useMemo, useState } from 'react';
import { Eye, Lock, Search, Upload } from 'lucide-react';
import type { DocumentCategory, EnterpriseUser } from '../engine/types';
import type { DocumentSummary } from '../utils/api';
import { PageInspectorPanel } from './PageInspectorPanel';

interface DocumentsViewProps {
  activeUser: EnterpriseUser;
  documents: DocumentSummary[];
  restrictedCount: number;
  totalDocuments: number;
  loading: boolean;
  onOpenUpload: () => void;
}

const CATEGORIES: Array<'All' | DocumentCategory> = [
  'All',
  'Policy',
  'Financial Report',
  'Technical Spec',
  'Project Report',
  'Employee Handbook',
  'Support Record',
];

export function DocumentsView({
  activeUser,
  documents,
  restrictedCount,
  totalDocuments,
  loading,
  onOpenUpload,
}: DocumentsViewProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | DocumentCategory>('All');
  const [inspectDocId, setInspectDocId] = useState<string | null>(null);

  const filteredDocs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return documents.filter((doc) => {
      if (categoryFilter !== 'All' && doc.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        doc.title.toLowerCase().includes(q) ||
        doc.department.toLowerCase().includes(q) ||
        doc.summary.toLowerCase().includes(q) ||
        doc.author.toLowerCase().includes(q)
      );
    });
  }, [documents, search, categoryFilter]);

  return (
    <div className="flex-1 flex min-w-0 h-full overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 h-full bg-slate-50">
        {/* Header & Filters */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 space-y-4 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-lg font-semibold text-slate-900">
                Document Vault &amp; Semantic Index
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing {documents.length} authorized of {totalDocuments} total indexed documents
                for {activeUser.name} (Clearance L{activeUser.clearance})
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenUpload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
              Add to Vault
            </button>
          </div>

          {restrictedCount > 0 && (
            <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2">
              <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" aria-hidden="true" />
              <span>
                {restrictedCount} confidential document{restrictedCount === 1 ? '' : 's'} hidden
                under RBAC Standard SEC-009 for Clearance Level {activeUser.clearance} (
                {activeUser.department}).
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto max-w-full">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    categoryFilter === cat
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search
                className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <label htmlFor="doc-vault-search" className="sr-only">
                Filter authorized documents
              </label>
              <input
                id="doc-vault-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, author, department…"
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-2 focus:outline-blue-700"
              />
            </div>
          </div>
        </div>

        {/* High-Density Data Table */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4].map((row) => (
                  <div key={row} className="h-10 bg-slate-100 rounded animate-pulse" />
                ))}
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="p-10 text-center space-y-3">
                <p className="text-sm font-medium text-slate-900">
                  No authorized documents match your current filter.
                </p>
                <p className="text-xs text-slate-500">
                  Try clearing the search query or ingest a new document into the vault.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setCategoryFilter('All');
                  }}
                  className="px-3.5 py-2 text-xs font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                    <tr>
                      <th className="py-2.5 px-4">Document</th>
                      <th className="py-2.5 px-4">Scope &amp; Metadata</th>
                      <th className="py-2.5 px-4 text-right">Pages</th>
                      <th className="py-2.5 px-4 text-right">Chunks</th>
                      <th className="py-2.5 px-4 text-right">Updated</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {filteredDocs.map((doc) => (
                      <tr
                        key={doc.id}
                        className={`hover:bg-slate-50 transition-colors ${
                          inspectDocId === doc.id ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <td className="py-3 px-4 max-w-md">
                          <div className="font-medium text-slate-900 leading-snug">
                            {doc.title}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            {doc.summary}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                          <span>{doc.category}</span>
                          <span aria-hidden="true"> · </span>
                          <span>{doc.department}</span>
                          <span aria-hidden="true"> · </span>
                          <span className="font-mono text-slate-900">
                            L{doc.requiredClearance}
                          </span>
                          <span aria-hidden="true"> · </span>
                          <span className="font-mono">{doc.format}</span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                          {doc.pageCount}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                          {doc.chunkCount}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500 whitespace-nowrap">
                          {doc.updatedAt}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setInspectDocId(doc.id)}
                            aria-label={`Inspect ${doc.title}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50 border border-slate-200 rounded-md transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {inspectDocId && (
        <PageInspectorPanel
          docId={inspectDocId}
          initialPage={1}
          userId={activeUser.id}
          onClose={() => setInspectDocId(null)}
        />
      )}
    </div>
  );
}
