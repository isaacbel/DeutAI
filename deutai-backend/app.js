require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet'); // Fix #33 — HTTP security headers

const authRoutes     = require('./routes/auth.routes');
const analyzeRoutes  = require('./routes/analyze.routes');
const notebookRoutes = require('./routes/notebook.routes');
const flashcardsRoutes = require('./routes/flashcards.routes');
const statsRoutes    = require('./routes/stats.routes');
const unitsRoutes    = require('./routes/units.routes');
const historyRoutes  = require('./routes/history.routes');
const quizRoutes     = require('./routes/quiz.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ─── CORS ────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'https://deut-ai.vercel.app',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

// Also allow all Vercel preview deployments for this project
const VERCEL_PREVIEW_RE = /^https:\/\/deut-[a-z0-9-]+-isaacbels-projects\.vercel\.app$/;

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server requests (no origin)
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin) || VERCEL_PREVIEW_RE.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ─── Security headers ─────────────────────────────────────────────────────────
app.use(helmet()); // Fix #33

// ─── Body parsing ─────────────────────────────────────────────────────────────
// Images base64 peuvent être volumineuses (~5MB) → limite augmentée
app.use(express.json({ limit: '10mb' }));
// Fix #34 — urlencoded removed: all routes use JSON bodies only

// ─── Ping — cold start Render.com ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).json({ message: 'DeutAI Backend API is running successfully!' });
});

app.get('/ping', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Routes API ───────────────────────────────────────────────────────────────
app.use('/auth',       authRoutes);
app.use('/analyze',    analyzeRoutes);
app.use('/notebook',   notebookRoutes);
app.use('/flashcards', flashcardsRoutes);
app.use('/stats',      statsRoutes);
app.use('/units',      unitsRoutes);
app.use('/history',    historyRoutes);
app.use('/quiz',       quizRoutes);

// ─── 404 pour les routes inconnues ───────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'NOT_FOUND' });
});

// ─── Gestionnaire d'erreurs global ───────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
