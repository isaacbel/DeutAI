function errorHandler(err, req, res, next) {
  // Fix #37 — only expose stack traces outside production
  if (process.env.NODE_ENV !== 'production') {
    console.error('[ErrorHandler]', err.message, err.stack);
  } else {
    console.error('[ErrorHandler]', err.message);
  }

  if (err.code === 'AI_PARSE_ERROR' || err.code === 'CLAUDE_PARSE_ERROR') {
    return res.status(422).json({ error: 'AI_PARSE_ERROR' });
  }

  if (err.code === 'AI_SERVICE_UNAVAILABLE' || err.code === 'AI_ALL_PROVIDERS_FAILED') {
    return res.status(503).json({ error: 'AI_SERVICE_UNAVAILABLE' });
  }

  if (err.code === 'RATE_LIMIT') {
    return res.status(429).json({
      error: 'RATE_LIMIT',
      retryAfter: err.retryAfter || null,
    });
  }

  if (err.code === 'NOT_FOUND') {
    return res.status(404).json({ error: 'NOT_FOUND' });
  }

  if (err.code === 'FORBIDDEN') {
    return res.status(403).json({ error: 'FORBIDDEN' });
  }

  return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
}

module.exports = errorHandler;
