const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required for PostgreSQL connection.');
}

function resolveSsl() {
  if (process.env.DATABASE_SSL === '0' || process.env.DATABASE_SSL === 'false') {
    return false;
  }

  const url = process.env.DATABASE_URL;
  const needsSsl =
    process.env.NODE_ENV === 'production' ||
    /neon\.tech|supabase\.co|render\.com|sslmode=require|sslmode=verify/i.test(url);

  return needsSsl ? { rejectUnauthorized: true } : false;
}

function normalizeConnectionString(connectionString) {
  try {
    const url = new URL(connectionString);
    url.searchParams.delete('sslmode');
    return url.toString();
  } catch {
    return connectionString;
  }
}

function parsePositiveInt(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

const pool = new Pool({
  connectionString: normalizeConnectionString(process.env.DATABASE_URL),
  ssl: resolveSsl(),
  max: parsePositiveInt(process.env.PG_POOL_MAX, 10),
  idleTimeoutMillis: parsePositiveInt(process.env.PG_IDLE_TIMEOUT_MS, 30000),
  connectionTimeoutMillis: parsePositiveInt(process.env.PG_CONNECT_TIMEOUT_MS, 20000),
});

pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[DB] PostgreSQL client connected to pool.');
  }
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected PostgreSQL pool error:', err.message);
});

module.exports = pool;
