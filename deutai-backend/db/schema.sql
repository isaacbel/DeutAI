-- DeutAI — Système 404 | Schéma PostgreSQL
-- Exécuter : psql $DATABASE_URL -f db/schema.sql

-- Extension pour gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────
-- Table : users
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  email_verified  BOOLEAN DEFAULT false,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ─────────────────────────────────────────
-- Table : units
-- (déclarée avant analyses et flashcards car référencée en FK)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS units (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_slug    VARCHAR(100) UNIQUE NOT NULL,
  title           VARCHAR(255) NOT NULL,
  chapter_number  INTEGER,
  type            VARCHAR(20) NOT NULL CHECK (type IN ('card', 'notebook')),
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_units_qr_code_slug ON units(qr_code_slug);

-- ─────────────────────────────────────────
-- Table : analyses
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analyses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source          VARCHAR(20) NOT NULL CHECK (source IN ('text', 'notebook')),
  input_text      TEXT NOT NULL,
  has_error       BOOLEAN NOT NULL,
  error_phrase    TEXT,
  correction      TEXT,
  rule            TEXT,
  error_type      VARCHAR(50) CHECK (
                    error_type IN (
                      'auxiliaire', 'déclinaison', 'conjugaison',
                      'genre', 'ordre', 'autre', 'aucun'
                    )
                  ),
  exercises_json  JSONB,
  errors_json     JSONB,
  global_explanation TEXT,
  unit_id         UUID REFERENCES units(id) ON DELETE SET NULL,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analyses_user_id       ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at    ON analyses(created_at);
CREATE INDEX IF NOT EXISTS idx_analyses_error_type    ON analyses(error_type);
CREATE INDEX IF NOT EXISTS idx_analyses_user_created  ON analyses(user_id, created_at DESC);

-- ─────────────────────────────────────────
-- Table : flashcards
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS flashcards (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  analysis_id     UUID REFERENCES analyses(id) ON DELETE CASCADE,
  unit_id         UUID REFERENCES units(id) ON DELETE SET NULL,
  front           TEXT NOT NULL,
  back            TEXT NOT NULL,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flashcards_user_id    ON flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_created_at ON flashcards(created_at);

-- ─────────────────────────────────────────
-- Table : password_resets
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS password_resets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  VARCHAR(255) NOT NULL,
  expires_at  TIMESTAMP WITH TIME ZONE NOT NULL,
  used        BOOLEAN DEFAULT false,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_resets_token_hash ON password_resets(token_hash);
CREATE INDEX IF NOT EXISTS idx_password_resets_user_id    ON password_resets(user_id);
