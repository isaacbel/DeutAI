require('dotenv').config();

const app = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await pool.query('SELECT 1');
    console.log('[DB] Connexion PostgreSQL établie');
  } catch (err) {
    console.error('[DB] Impossible de se connecter à PostgreSQL :', err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`[Server] DeutAI — Système 404 en écoute sur le port ${PORT}`);
    console.log(`[Server] Environnement : ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
