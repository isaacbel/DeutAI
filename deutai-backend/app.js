require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/auth.routes');
const analyzeRoutes = require('./routes/analyze.routes');
const notebookRoutes = require('./routes/notebook.routes');
const flashcardsRoutes = require('./routes/flashcards.routes');
const statsRoutes = require('./routes/stats.routes');
const unitsRoutes = require('./routes/units.routes');
const historyRoutes = require('./routes/history.routes');
const quizRoutes = require('./routes/quiz.routes');
const errorHandler = require('./middleware/errorHandler');
const jsonResponse = require('./middleware/jsonResponse');
const requestLogger = require('./middleware/requestLogger');

const app = express();

const configuredOrigins = [
  'https://deut-ai.vercel.app',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
]
  .filter(Boolean)
  .map((origin) => origin.replace(/\/$/, ''));

const VERCEL_PREVIEW_RE = /^https:\/\/deut-[a-z0-9-]+-isaacbels-projects\.vercel\.app$/;

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/$/, '');
    if (configuredOrigins.includes(normalizedOrigin) || VERCEL_PREVIEW_RE.test(normalizedOrigin)) {
      return callback(null, true);
    }

    const err = new Error(`CORS origin not allowed: ${origin}`);
    err.statusCode = 403;
    err.code = 'CORS_NOT_ALLOWED';
    return callback(err);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(requestLogger);
app.use(jsonResponse);
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(helmet());
app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'DeutAI Backend API is running successfully.',
    status: 'ok',
  });
});

app.get('/ping', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRoutes);
app.use('/analyze', analyzeRoutes);
app.use('/notebook', notebookRoutes);
app.use('/flashcards', flashcardsRoutes);
app.use('/stats', statsRoutes);
app.use('/units', unitsRoutes);
app.use('/history', historyRoutes);
app.use('/quiz', quizRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: 'Route not found.',
  });
});

app.use(errorHandler);

module.exports = app;
