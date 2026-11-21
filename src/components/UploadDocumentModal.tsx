import React, { useState } from 'react';
import { FileUp, Loader2, X } from 'lucide-react';
import type {
  ClearanceLevel,
  Department,
  DocumentCategory,
  DocumentRecord,
  EnterpriseUser,
} from '../engine/types';
import { uploadDocument } from '../utils/api';

interface UploadDocumentModalProps {
  activeUser: EnterpriseUser;
  onClose: () => void;
  onUploaded: (summaryText: string) => void;
}

export function UploadDocumentModal({
  activeUser,
  onClose,
  onUploaded,
}: UploadDocumentModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('Project Report');
  const [department, setDepartment] = useState<Department>(activeUser.department);
  const [requiredClearance, setRequiredClearance] = useState<ClearanceLevel>(1);
  const [rawText, setRawText] = useState('');
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    format: DocumentRecord['format'];
    base64?: string;
    mimeType?: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (!title.trim()) {
      setTitle(file.name.replace(/\.[^.]+$/, ''));
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (ext === 'pdf' || file.type === 'application/pdf' || file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === 'string' ? reader.result : '';
        const base64 = result.split(',')[1] ?? '';
        setFileInfo({
          name: file.name,
          format: ext === 'pdf' ? 'PDF' : 'TXT',
          base64,
          mimeType: file.type || 'application/pdf',
        });
      };
      reader.readAsDataURL(file);
    } else {
      const text = await file.text();
      setRawText(text);
      setFileInfo({
        name: file.name,
        format: ext === 'md' ? 'MD' : ext === 'csv' ? 'CSV' : 'TXT',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (title.trim().length < 3) {
      setError('Please enter a document title (at least 3 characters).');
      return;
    }
    if (!rawText.trim() && !fileInfo?.base64) {
      setError('Please upload a file or paste document text to ingest.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await uploadDocument(
        {
          title: title.trim(),
          category,
          department,
          requiredClearance,
          format: fileInfo?.format ?? 'MD',
          rawText: rawText.trim() || undefined,
          fileBase64: fileInfo?.base64,
          mimeType: fileInfo?.mimeType,
        },
        activeUser.id,
      );
      onUploaded(
        `Indexed "${res.document.title}" (${res.chunksCreated} semantic chunks, ${res.entitiesAdded} graph entities, ${res.edgesAdded} edges).`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Document ingestion failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 id="upload-modal-title" className="font-display text-base font-semibold text-slate-900">
            Ingest Document into EnterpriseMind
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close upload dialog"
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="upload-doc-title"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Document Title
            </label>
            <input
              id="upload-doc-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q2 Cloud Security Audit Summary"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-2 focus:outline-blue-700"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label
                htmlFor="upload-doc-category"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Category
              </label>
              <select
                id="upload-doc-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                className="w-full px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
              >
                <option value="Policy">Policy</option>
                <option value="Financial Report">Financial Report</option>
                <option value="Technical Spec">Technical Spec</option>
                <option value="Project Report">Project Report</option>
                <option value="Employee Handbook">Employee Handbook</option>
                <option value="Support Record">Support Record</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="upload-doc-dept"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Department
              </label>
              <select
                id="upload-doc-dept"
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                className="w-full px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
              >
                <option value="Engineering">Engineering</option>
                <option value="Finance">Finance</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Customer Support">Customer Support</option>
                <option value="Executive">Executive</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="upload-doc-clearance"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                RBAC Clearance
              </label>
              <select
                id="upload-doc-clearance"
                value={requiredClearance}
                onChange={(e) =>
                  setRequiredClearance(Number(e.target.value) as ClearanceLevel)
                }
                className="w-full px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
              >
                <option value={1}>L1 · Company-Wide</option>
                {activeUser.clearance >= 2 && (
                  <option value={2}>L2 · Departmental</option>
                )}
                {activeUser.clearance >= 3 && (
                  <option value={3}>L3 · Executive</option>
                )}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="upload-file-input"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Upload File (PDF, PNG/JPG OCR, MD, CSV, TXT)
            </label>
            <label
              htmlFor="upload-file-input"
              className="flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer text-xs text-slate-600"
            >
              <FileUp className="w-4 h-4 text-slate-500" aria-hidden="true" />
              <span>
                {fileInfo ? `Selected: ${fileInfo.name}` : 'Choose a file to extract & index'}
              </span>
              <input
                id="upload-file-input"
                type="file"
                accept=".pdf,.txt,.md,.csv,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
          </div>

          <div>
            <label
              htmlFor="upload-doc-text"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Or Paste Document Content
            </label>
            <textarea
              id="upload-doc-text"
              rows={5}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste policy clauses, financial figures, or technical specs. Separate pages with --- Page 2 --- if multi-page."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 font-mono leading-relaxed focus:outline-2 focus:outline-blue-700"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white text-xs font-medium rounded-lg"
            >
              {submitting && (
                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
              )}
              {submitting ? 'Chunking & Indexing…' : 'Ingest & Index'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
