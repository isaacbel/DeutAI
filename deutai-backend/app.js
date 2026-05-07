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
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Fix #32 — include PUT/PATCH
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
