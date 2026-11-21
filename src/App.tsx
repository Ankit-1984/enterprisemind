import { useCallback, useEffect, useState } from 'react';
import { AssistantView } from './components/AssistantView';
import { DocumentsView } from './components/DocumentsView';
import { EvaluationView } from './components/EvaluationView';
import { KnowledgeGraphView } from './components/KnowledgeGraphView';
import { type AppView, TopBar } from './components/TopBar';
import { UploadDocumentModal } from './components/UploadDocumentModal';
import { WorkspaceSidebar } from './components/WorkspaceSidebar';
import { ENTERPRISE_USERS } from './engine/corpus';
import type {
  ChatTurn,
  EnterpriseUser,
  EvaluationSuiteResult,
  GraphEdge,
  GraphNode,
} from './engine/types';
import {
  type DocumentSummary,
  fetchDocuments,
  fetchGraphData,
  fetchUsers,
  queryAgenticRag,
  runEvaluationSuite,
} from './utils/api';

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('assistant');
  const [users, setUsers] = useState<EnterpriseUser[]>(ENTERPRISE_USERS);
  const [activeUser, setActiveUser] = useState<EnterpriseUser>(ENTERPRISE_USERS[0]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  // Documents state
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [restrictedCount, setRestrictedCount] = useState(0);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [docsLoading, setDocsLoading] = useState(true);

  // GraphRAG state
  const [graphNodes, setGraphNodes] = useState<GraphNode[]>([]);
  const [graphEdges, setGraphEdges] = useState<GraphEdge[]>([]);
  const [graphLoading, setGraphLoading] = useState(true);

  // Chat state
  const [chatTurns, setChatTurns] = useState<ChatTurn[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Evaluation state
  const [evaluation, setEvaluation] = useState<EvaluationSuiteResult | null>(null);
  const [evalLoading, setEvalLoading] = useState(false);

  const loadAuthorizedData = useCallback(async (userId: string) => {
    setDocsLoading(true);
    setGraphLoading(true);
    try {
      const [docsRes, graphRes] = await Promise.all([
        fetchDocuments(userId),
        fetchGraphData(userId),
      ]);
      setDocuments(docsRes.documents);
      setRestrictedCount(docsRes.restrictedCount);
      setTotalDocuments(docsRes.totalDocuments);
      setGraphNodes(graphRes.nodes);
      setGraphEdges(graphRes.edges);
    } catch {
      // Errors handled silently in initial hydration; views display counts cleanly
    } finally {
      setDocsLoading(false);
      setGraphLoading(false);
    }
  }, []);

  const handleRunEvaluation = useCallback(async () => {
    setEvalLoading(true);
    try {
      const result = await runEvaluationSuite();
      setEvaluation(result);
    } finally {
      setEvalLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers()
      .then((list) => {
        if (list.length > 0) setUsers(list);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    void loadAuthorizedData(activeUser.id);
  }, [activeUser.id, loadAuthorizedData]);

  useEffect(() => {
    if (activeView === 'evaluation' && !evaluation && !evalLoading) {
      void handleRunEvaluation();
    }
  }, [activeView, evaluation, evalLoading, handleRunEvaluation]);

  const handleSubmitQuery = async (query: string) => {
    setActiveView('assistant');
    const userTurn: ChatTurn = {
      id: `turn-u-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };
    setChatTurns((prev) => [...prev, userTurn]);
    setChatLoading(true);

    try {
      const response = await queryAgenticRag(query, activeUser.id);
      const assistantTurn: ChatTurn = {
        id: `turn-a-${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        timestamp: new Date().toISOString(),
        response,
      };
      setChatTurns((prev) => [...prev, assistantTurn]);
    } catch (err) {
      const errorTurn: ChatTurn = {
        id: `turn-e-${Date.now()}`,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        error: err instanceof Error ? err.message : 'Unable to complete Agentic RAG query.',
      };
      setChatTurns((prev) => [...prev, errorTurn]);
    } finally {
      setChatLoading(false);
    }
  };

  const totalChunksCount = documents.reduce((acc, d) => acc + d.chunkCount, 0);

  return (
    <div className="h-screen flex flex-col bg-slate-50 text-slate-900 overflow-hidden">
      <TopBar
        activeView={activeView}
        onChangeView={setActiveView}
        onOpenUpload={() => setUploadModalOpen(true)}
        onToggleMobileMenu={() => setMobileMenuOpen((v) => !v)}
      />

      {/* Mobile Navigation Tabs (under 15% mobile height budget) */}
      <nav
        aria-label="Mobile section navigation"
        className="md:hidden flex items-center gap-1 bg-white border-b border-slate-200 px-3 py-1.5 overflow-x-auto shrink-0"
      >
        {(
          [
            ['assistant', 'Assistant'],
            ['documents', 'Documents'],
            ['graph', 'Knowledge Graph'],
            ['evaluation', 'Evaluation'],
          ] as Array<[AppView, string]>
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveView(id)}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
              activeView === id
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {uploadNotice && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2 flex items-center justify-between gap-4 text-xs text-emerald-900 shrink-0">
          <span>{uploadNotice}</span>
          <button
            type="button"
            onClick={() => setUploadNotice(null)}
            className="text-emerald-700 font-medium hover:underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex-1 flex min-h-0 overflow-hidden">
        <WorkspaceSidebar
          users={users}
          activeUser={activeUser}
          onSelectUser={(u) => {
            setActiveUser(u);
          }}
          authorizedDocsCount={documents.length}
          restrictedDocsCount={restrictedCount}
          totalChunksCount={totalChunksCount}
          onRunSuggestedQuery={handleSubmitQuery}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        <main className="flex-1 flex min-w-0 min-h-0 overflow-hidden">
          {activeView === 'assistant' && (
            <AssistantView
              activeUser={activeUser}
              turns={chatTurns}
              isLoading={chatLoading}
              onSubmitQuery={handleSubmitQuery}
              onClearHistory={() => setChatTurns([])}
              onInspectGraphEntity={() => setActiveView('graph')}
            />
          )}

          {activeView === 'documents' && (
            <DocumentsView
              activeUser={activeUser}
              documents={documents}
              restrictedCount={restrictedCount}
              totalDocuments={totalDocuments}
              loading={docsLoading}
              onOpenUpload={() => setUploadModalOpen(true)}
            />
          )}

          {activeView === 'graph' && (
            <KnowledgeGraphView
              activeUser={activeUser}
              nodes={graphNodes}
              edges={graphEdges}
              loading={graphLoading}
              onAskAboutEntity={(entityLabel) =>
                handleSubmitQuery(
                  `Find all documents, people, and projects connected to ${entityLabel} and summarize the verified relationships.`,
                )
              }
            />
          )}

          {activeView === 'evaluation' && (
            <EvaluationView
              evaluation={evaluation}
              loading={evalLoading}
              onRunBenchmark={handleRunEvaluation}
            />
          )}
        </main>
      </div>

      {uploadModalOpen && (
        <UploadDocumentModal
          activeUser={activeUser}
          onClose={() => setUploadModalOpen(false)}
          onUploaded={(summaryText) => {
            setUploadModalOpen(false);
            setUploadNotice(summaryText);
            void loadAuthorizedData(activeUser.id);
            if (evaluation) void handleRunEvaluation();
          }}
        />
      )}
    </div>
  );
}
