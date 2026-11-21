import React from 'react';
import type { CitationRef } from '../engine/types';

interface MarkdownAnswerProps {
  text: string;
  citations: CitationRef[];
  onSelectCitation: (citation: CitationRef) => void;
}

function renderInlineSegments(
  line: string,
  citationsMap: Map<string, CitationRef>,
  onSelectCitation: (c: CitationRef) => void,
  keyPrefix: string,
): React.ReactNode[] {
  const tokenRegex = /(\*\*[^*]+\*\*|`[^`]+`|\[[a-z0-9-]+:\d+\])/gi;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const match of line.matchAll(tokenRegex)) {
    const idx = match.index ?? 0;
    if (idx > lastIndex) {
      parts.push(line.slice(lastIndex, idx));
    }
    const token = match[0];

    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={`${keyPrefix}-b-${idx}`} className="font-semibold text-slate-900">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={`${keyPrefix}-c-${idx}`}
          className="font-mono text-[12px] bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith('[') && token.endsWith(']')) {
      const inner = token.slice(1, -1);
      const citation = citationsMap.get(inner);
      if (citation) {
        const shortTitle =
          citation.docTitle.length > 26
            ? `${citation.docTitle.slice(0, 24)}…`
            : citation.docTitle;
        parts.push(
          <button
            key={`${keyPrefix}-cit-${idx}`}
            type="button"
            onClick={() => onSelectCitation(citation)}
            title={`Inspect ${citation.docTitle}, Page ${citation.pageNumber}`}
            className="inline-flex items-center gap-1 mx-0.5 px-1.5 py-0.5 text-[11px] font-mono font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors align-baseline whitespace-nowrap"
          >
            <span>{shortTitle}</span>
            <span className="text-blue-500">·</span>
            <span>p.{citation.pageNumber}</span>
          </button>,
        );
      } else {
        parts.push(
          <span
            key={`${keyPrefix}-citraw-${idx}`}
            className="font-mono text-xs text-slate-500 mx-0.5"
          >
            {token}
          </span>,
        );
      }
    }
    lastIndex = idx + token.length;
  }

  if (lastIndex < line.length) {
    parts.push(line.slice(lastIndex));
  }

  return parts;
}

export function MarkdownAnswer({
  text,
  citations,
  onSelectCitation,
}: MarkdownAnswerProps) {
  const citationsMap = new Map(citations.map((c) => [c.id, c]));
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trimEnd();

    // Markdown table block
    if (line.trim().startsWith('|') && i + 1 < lines.length && lines[i + 1].includes('---')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim());
        i += 1;
      }
      const parseRow = (row: string) =>
        row
          .replace(/^\|/, '')
          .replace(/\|$/, '')
          .split('|')
          .map((cell) => cell.trim());

      const headers = parseRow(tableLines[0]);
      const bodyRows = tableLines.slice(2).map(parseRow);

      elements.push(
        <div key={`tbl-${i}`} className="my-3 overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {headers.map((h, hIdx) => (
                  <th key={hIdx} className="py-2 px-3 font-semibold text-slate-700">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {bodyRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="py-2 px-3 text-slate-700 tabular-nums align-top">
                      {renderInlineSegments(
                        cell,
                        citationsMap,
                        onSelectCitation,
                        `tbl-${i}-${rIdx}-${cIdx}`,
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    // Bullet list block
    if (/^[-*•]\s+/.test(line.trim())) {
      const items: string[] = [];
      while (i < lines.length && /^[-*•]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*•]\s+/, ''));
        i += 1;
      }
      elements.push(
        <ul key={`ul-${i}`} className="my-2 space-y-1.5 list-disc pl-5 text-sm text-slate-700 leading-relaxed">
          {items.map((item, idx) => (
            <li key={idx}>
              {renderInlineSegments(item, citationsMap, onSelectCitation, `ul-${i}-${idx}`)}
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    // Numbered list block
    if (/^\d+\.\s+/.test(line.trim())) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i += 1;
      }
      elements.push(
        <ol key={`ol-${i}`} className="my-2 space-y-1.5 list-decimal pl-5 text-sm text-slate-700 leading-relaxed">
          {items.map((item, idx) => (
            <li key={idx}>
              {renderInlineSegments(item, citationsMap, onSelectCitation, `ol-${i}-${idx}`)}
            </li>
          ))}
        </ol>,
      );
      continue;
    }

    // Headings
    const hMatch = line.trim().match(/^(#{1,3})\s+(.*)$/);
    if (hMatch) {
      const level = hMatch[1].length;
      const content = hMatch[2];
      elements.push(
        <h4
          key={`h-${i}`}
          className={`font-display font-semibold text-slate-900 mt-3 mb-1.5 ${
            level === 1 ? 'text-base' : 'text-sm'
          }`}
        >
          {renderInlineSegments(content, citationsMap, onSelectCitation, `h-${i}`)}
        </h4>,
      );
      i += 1;
      continue;
    }

    if (line.trim() === '') {
      i += 1;
      continue;
    }

    elements.push(
      <p key={`p-${i}`} className="text-sm text-slate-700 leading-relaxed my-1.5">
        {renderInlineSegments(line, citationsMap, onSelectCitation, `p-${i}`)}
      </p>,
    );
    i += 1;
  }

  return <div className="space-y-1">{elements}</div>;
}
