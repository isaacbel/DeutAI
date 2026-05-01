CREATE TABLE IF NOT EXISTS ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  provider TEXT NOT NULL,
  task TEXT NOT NULL,
  prompt TEXT,
  success BOOLEAN NOT NULL,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_ai_logs_created_at ON ai_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_provider ON ai_logs (provider);
CREATE INDEX IF NOT EXISTS idx_ai_logs_task ON ai_logs (task);
