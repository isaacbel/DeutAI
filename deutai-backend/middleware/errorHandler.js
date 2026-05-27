function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = statusCode >= 500
    ? 'Internal server error.'
    : err.message || 'Request failed.';

  if (process.env.NODE_ENV !== 'production') {
    console.error('[ErrorHandler]', code, err.message, err.stack);
  } else {
    console.error('[ErrorHandler]', code, err.message);
  }

  if (code === 'AI_PARSE_ERROR' || code === 'CLAUDE_PARSE_ERROR') {
    return res.status(422).json({
      error: 'AI_PARSE_ERROR',
      message: 'AI response could not be parsed.',
    });
  }

  if (code === 'AI_SERVICE_UNAVAILABLE' || code === 'AI_ALL_PROVIDERS_FAILED') {
    return res.status(503).json({
      error: 'AI_SERVICE_UNAVAILABLE',
      message: 'AI service is currently unavailable.',
    });
  }

  if (code === 'RATE_LIMIT') {
    return res.status(429).json({
      error: 'RATE_LIMIT',
      message: 'Too many requests. Please try again later.',
      retryAfter: err.retryAfter || null,
    });
  }

  if (code === 'NOT_FOUND') {
    return res.status(404).json({
      error: 'NOT_FOUND',
      message: 'Resource not found.',
    });
  }

  if (code === 'FORBIDDEN') {
    return res.status(403).json({
      error: 'FORBIDDEN',
      message: 'Forbidden.',
    });
  }

  if (code === 'CORS_NOT_ALLOWED') {
    return res.status(403).json({
      error: 'CORS_NOT_ALLOWED',
      message,
    });
  }

  return res.status(statusCode).json({
    error: code,
    message,
  });
}

module.exports = errorHandler;
