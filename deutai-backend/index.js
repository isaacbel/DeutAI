require('dotenv').config();

const { validateEnv } = require('./config/env');

process.on('unhandledRejection', (reason) => {
  console.error('[UnhandledRejection]', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[UncaughtException]', err);
  process.exit(1);
});

const { missing } = validateEnv();
if (missing.length > 0) {
  console.error('[FATAL] Missing critical environment variables. Configure them and restart the server.');
  process.exit(1);
}

const app = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT || 3001;
let server;

async function shutdown(signal) {
  console.log(`[Server] ${signal} received; shutting down gracefully.`);

  if (server) {
    server.close(async () => {
      try {
        await pool.end();
      } catch (err) {
        console.error('[DB] Error while closing pool:', err.message);
      } finally {
        process.exit(0);
      }
    });
    return;
  }

  try {
    await pool.end();
  } catch (err) {
    console.error('[DB] Error while closing pool:', err.message);
  }
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

async function startServer() {
  try {
    await pool.query('SELECT 1');
    console.log('[DB] PostgreSQL connection established.');
  } catch (err) {
    console.error('[DB] Failed to connect to PostgreSQL:', err.message);
    process.exit(1);
  }

  server = app.listen(PORT, () => {
    console.log(`[Server] DeutAI listening on port ${PORT}.`);
    console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}.`);
  });

  server.on('error', (err) => {
    console.error('[Server] Failed to start:', err.message);
    process.exit(1);
  });
}

startServer();
