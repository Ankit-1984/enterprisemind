import { useEffect, useState } from 'react';
import { BookOpen, CheckCircle2, FileText, X } from 'lucide-react';
import type { CitationRef, DocumentRecord } from '../engine/types';
import { fetchDocumentDetail } from '../utils/api';

interface PageInspectorPanelProps {
  docId: string;
  initialPage?: number;
  highlightExcerpt?: string;
  userId: string;
  onClose: () => void;
  citation?: CitationRef;
}

export function PageInspectorPanel({
  docId,
  initialPage = 1,
  highlightExcerpt,
  userId,
  onClose,
}: PageInspectorPanelProps) {
  const [doc, setDoc] = useState<DocumentRecord | null>(null);
  const [activePage, setActivePage] = useState(initialPage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setActivePage(initialPage);
  }, [docId, initialPage]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchDocumentDetail(docId, userId)
      .then((loaded) => {
        if (!cancelled) {
          setDoc(loaded);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load document.');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [docId, userId]);

  const currentPage =
    doc?.pages.find((p) => p.pageNumber === activePage) ?? doc?.pages[0];

  const renderHighlightedContent = (content: string) => {
    if (!highlightExcerpt || highlightExcerpt.length < 18) {
      return <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{content}</p>;
    }
    const snippet = highlightExcerpt.slice(0, 48).trim();
    const idx = content.toLowerCase().indexOf(snippet.toLowerCase());
    if (idx === -1) {
      return <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{content}</p>;
    }
    const matchEnd = Math.min(content.length, idx + highlightExcerpt.length);
    return (
      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
        {content.slice(0, idx)}
        <mark className="bg-amber-100 text-slate-900 px-1 py-0.5 rounded">
          {content.slice(idx, matchEnd)}
        </mark>
        {content.slice(matchEnd)}
      </p>
    );
  };

  return (
    <aside
      aria-label="Document Page Inspector"
      className="w-full lg:w-[400px] xl:w-[440px] shrink-0 bg-white border-l border-slate-200 flex flex-col h-full overflow-hidden"
    >
      <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen className="w-4 h-4 text-blue-700 shrink-0" aria-hidden="true" />
          <h3 className="font-display text-sm font-semibold text-slate-900 truncate">
            Source Page Inspector
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close source inspector"
          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="p-5 space-y-3">
          <div className="h-5 bg-slate-100 rounded w-3/4 animate-pulse" />
          <div className="h-3 bg-slate-100 rounded w-1/2 animate-pulse" />
          <div className="h-32 bg-slate-100 rounded w-full animate-pulse mt-4" />
        </div>
      ) : error ? (
        <div className="p-5">
          <div className="p-4 border border-red-200 bg-red-50 rounded-lg text-sm text-red-800">
            {error}
          </div>
        </div>
      ) : doc ? (
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <FileText className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span>{doc.category}</span>
              <span aria-hidden="true">·</span>
              <span>{doc.department}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">Clearance L{doc.requiredClearance}</span>
            </div>
            <h4 className="font-display text-base font-semibold text-slate-900 leading-snug">
              {doc.title}
            </h4>
            <p className="text-xs text-slate-500">
              Author: {doc.author} <span aria-hidden="true">·</span> Updated {doc.updatedAt} <span aria-hidden="true">·</span> {doc.format}
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap border-y border-slate-200 py-2.5">
            <span className="text-xs font-medium text-slate-500 mr-1">Pages:</span>
            {doc.pages.map((p) => (
              <button
                key={p.pageNumber}
                type="button"
                onClick={() => setActivePage(p.pageNumber)}
                className={`px-2.5 py-1 text-xs font-mono rounded-md transition-colors whitespace-nowrap ${
                  p.pageNumber === currentPage?.pageNumber
                    ? 'bg-slate-900 text-white font-medium'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                p.{p.pageNumber}
              </button>
            ))}
          </div>

          {currentPage && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h5 className="text-sm font-semibold text-slate-900">
                  Page {currentPage.pageNumber}: {currentPage.sectionTitle}
                </h5>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  Verified
                </span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                {renderHighlightedContent(currentPage.content)}
              </div>
            </div>
          )}

          {highlightExcerpt && (
            <div className="pt-2 border-t border-slate-200 space-y-1.5">
              <p className="text-xs font-medium text-slate-500">Cited Verbatim Passage</p>
              <blockquote className="text-xs text-slate-600 bg-white border border-slate-200 rounded-lg p-3 leading-relaxed">
                “{highlightExcerpt}”
              </blockquote>
            </div>
          )}
        </div>
      ) : null}
    </aside>
  );
}
