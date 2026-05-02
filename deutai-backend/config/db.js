const { Pool } = require('pg');

function resolveSsl() {
  if (process.env.DATABASE_SSL === '0' || process.env.DATABASE_SSL === 'false') {
    return false;
  }
  const url = process.env.DATABASE_URL || '';
  const needsSsl =
    process.env.NODE_ENV === 'production' ||
    /neon\.tech|supabase\.co|render\.com|sslmode=require|sslmode=verify/i.test(url);
  return needsSsl ? { rejectUnauthorized: false } : false;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: resolveSsl(),
  max: 10,
  idleTimeoutMillis: 30000,
  // Neon (and other serverless DBs) can need >5s on cold start / wake
  connectionTimeoutMillis: Number(process.env.PG_CONNECT_TIMEOUT_MS) || 20000,
});

pool.on('error', (err) => {
  console.error('[DB] Erreur inattendue sur le pool PostgreSQL :', err.message);
});

module.exports = pool;
