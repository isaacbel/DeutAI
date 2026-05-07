require('dotenv').config();

// Fix #35 — fail fast if critical secrets are missing
if (!process.env.JWT_SECRET) {
  console.error('[FATAL] JWT_SECRET is not set. Set it in your .env file and restart.');
  process.exit(1);
}

const app = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT || 3001;

// Fix #38 — catch unhandled async errors that bypass Express middleware
process.on('unhandledRejection', (reason) => {
  console.error('[UnhandledRejection]', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[UncaughtException]', err);
  process.exit(1);
});

// Fix #39 — graceful shutdown: drain the DB pool before exit
async function shutdown(signal) {
  console.log(`[Server] ${signal} received — shutting down gracefully`);
  try { await pool.end(); } catch (e) { /* ignore */ }
  process.exit(0);
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

async function startServer() {
  try {
    await pool.query('SELECT 1');
    console.log('[DB] Connexion PostgreSQL établie');
  } catch (err) {
    console.error('[DB] Impossible de se connecter à PostgreSQL :', err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`[Server] DeutAI en écoute sur le port ${PORT}`);
    console.log(`[Server] Environnement : ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
