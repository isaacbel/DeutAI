const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn(`[Auth] Token missing for ${req.method} ${req.originalUrl}`);
    return res.status(401).json({
      error: 'TOKEN_MISSING',
      message: 'Authorization header must be Bearer token.',
    });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    console.warn(`[Auth] Empty bearer token for ${req.method} ${req.originalUrl}`);
    return res.status(401).json({
      error: 'TOKEN_MISSING',
      message: 'Authorization bearer token is missing.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.userId) {
      console.warn(`[Auth] Token invalid: userId missing for ${req.method} ${req.originalUrl}`);
      return res.status(401).json({
        error: 'TOKEN_INVALID',
        message: 'Token is invalid.',
      });
    }

    req.user = { userId: decoded.userId, email: decoded.email };
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      console.warn(`[Auth] Token expired for ${req.method} ${req.originalUrl}`);
      return res.status(401).json({
        error: 'TOKEN_EXPIRED',
        message: 'Token has expired.',
      });
    }

    console.warn(`[Auth] Token invalid for ${req.method} ${req.originalUrl}: ${err.message}`);
    return res.status(401).json({
      error: 'TOKEN_INVALID',
      message: 'Token is invalid.',
    });
  }
}

module.exports = authMiddleware;
