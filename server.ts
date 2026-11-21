import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';
import { ENTERPRISE_USERS } from './src/engine/corpus';
import { canUserAccessDocument } from './src/engine/retrieval';
import type { ClearanceLevel, Department, DocumentCategory } from './src/engine/types';
import {
  getAuthorizedDocumentsForUser,
  getAuthorizedGraphForUser,
  ingestDocument,
  resolveEnterpriseUser,
  runAgenticRagQuery,
  runLiveEvaluation,
  store,
} from './server/ragPipeline';

const PORT = 3000;
const VALID_CATEGORIES = new Set<DocumentCategory>([
  'Policy',
  'Financial Report',
  'Technical Spec',
  'Employee Handbook',
  'Support Record',
  'Project Report',
]);
const VALID_DEPARTMENTS = new Set<Department>([
  'Engineering',
  'Finance',
  'Human Resources',
  'Customer Support',
  'Executive',
]);

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '12mb' }));

  // Health & RBAC Persona Directory
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      documentsCount: store.documents.length,
      chunksCount: store.chunks.length,
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  app.get('/api/users', (_req, res) => {
    res.json({ users: ENTERPRISE_USERS });
  });

  // Authorized Document Vault listing (RBAC enforced server-side)
  app.get('/api/documents', (req, res) => {
    const userId = req.header('x-enterprise-user-id') || (req.query.userId as string | undefined);
    const { user, authorized, restrictedCount, totalDocuments } =
      getAuthorizedDocumentsForUser(userId);

    const summaries = authorized.map((doc) => ({
      id: doc.id,
      title: doc.title,
      category: doc.category,
      department: doc.department,
      requiredClearance: doc.requiredClearance,
      author: doc.author,
      updatedAt: doc.updatedAt,
      format: doc.format,
      pageCount: doc.pages.length,
      chunkCount: store.chunks.filter((c) => c.docId === doc.id).length,
      summary: doc.summary,
      entities: doc.entities,
      embeddingStatus: doc.embeddingStatus,
    }));

    res.json({
      user,
      documents: summaries,
      restrictedCount,
      totalDocuments,
    });
  });

  // Fetch full document pages (RBAC enforced server-side)
  app.get('/api/documents/:docId', (req, res) => {
    const userId = req.header('x-enterprise-user-id') || (req.query.userId as string | undefined);
    const user = resolveEnterpriseUser(userId);
    const doc = store.documents.find((d) => d.id === req.params.docId);

    if (!doc) {
      res.status(404).json({ error: 'Document not found.' });
      return;
    }

    if (!canUserAccessDocument(user, doc)) {
      res.status(403).json({
        error: `Access denied under RBAC Standard SEC-009. Requires Clearance Level ${doc.requiredClearance} (${doc.department}).`,
      });
      return;
    }

    res.json({ document: doc });
  });

  // Multi-format Document Upload & Semantic Ingestion
  app.post('/api/documents/upload', async (req, res) => {
    try {
      const userId = req.header('x-enterprise-user-id');
      const user = resolveEnterpriseUser(userId);

      const {
        title,
        category,
        department,
        requiredClearance,
        format,
        rawText,
        fileBase64,
        mimeType,
      } = req.body ?? {};

      if (typeof title !== 'string' || title.trim().length < 3) {
        res.status(400).json({ error: 'Document title must be at least 3 characters.' });
        return;
      }

      const safeCategory: DocumentCategory = VALID_CATEGORIES.has(category)
        ? category
        : 'Project Report';
      const safeDepartment: Department = VALID_DEPARTMENTS.has(department)
        ? department
        : user.department;
      const numericClearance = Number(requiredClearance);
      const safeClearance: ClearanceLevel =
        numericClearance === 1 || numericClearance === 2 || numericClearance === 3
          ? numericClearance
          : 1;

      // Prevent privilege escalation beyond uploader's own clearance if creating L3 docs as L1
      const effectiveClearance: ClearanceLevel =
        safeClearance > user.clearance ? user.clearance : safeClearance;

      if (!rawText && !fileBase64) {
        res.status(400).json({ error: 'Provide either document text or a supported file upload.' });
        return;
      }

      const allowedMimeTypes = new Set([
        'application/pdf',
        'image/png',
        'image/jpeg',
        'text/plain',
        'text/markdown',
        'text/csv',
      ]);
      if (mimeType && !allowedMimeTypes.has(mimeType)) {
        res.status(400).json({ error: `Unsupported file format: ${mimeType}` });
        return;
      }

      const result = await ingestDocument({
        title: title.trim(),
        category: safeCategory,
        department: safeDepartment,
        requiredClearance: effectiveClearance,
        author: user.name,
        format: format || 'TXT',
        rawText: typeof rawText === 'string' ? rawText : undefined,
        fileBase64: typeof fileBase64 === 'string' ? fileBase64 : undefined,
        mimeType: typeof mimeType === 'string' ? mimeType : undefined,
      });

      res.status(201).json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Document ingestion failed.';
      res.status(500).json({ error: message });
    }
  });

  // Agentic RAG Conversational Query
  app.post('/api/chat', async (req, res) => {
    try {
      const userId = req.header('x-enterprise-user-id') || req.body?.userId;
      const query = req.body?.query;
      if (typeof query !== 'string' || query.trim().length < 2) {
        res.status(400).json({ error: 'Please enter a valid question (at least 2 characters).' });
        return;
      }

      const response = await runAgenticRagQuery(query.trim(), userId);
      res.json(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to execute Agentic RAG pipeline.';
      const status =
        message.includes('GEMINI_API_KEY') ||
        message.includes('API_KEY') ||
        message.includes('503') ||
        message.includes('UNAVAILABLE') ||
        message.includes('high demand')
          ? 503
          : 500;
      res.status(status).json({ error: message });
    }
  });

  // GraphRAG Authorized Network
  app.get('/api/graph', (req, res) => {
    const userId = req.header('x-enterprise-user-id') || (req.query.userId as string | undefined);
    const data = getAuthorizedGraphForUser(userId);
    res.json(data);
  });

  // Empirical Evaluation Lab Suite
  app.post('/api/evaluation/run', (_req, res) => {
    const result = runLiveEvaluation();
    res.json(result);
  });

  app.get('/api/evaluation', (_req, res) => {
    const result = runLiveEvaluation();
    res.json(result);
  });

  // Vite dev middleware or static dist serving
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexPath = path.join(distDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Build output not found. Run npm run build.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EnterpriseMind server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start EnterpriseMind server:', err);
  process.exit(1);
});
