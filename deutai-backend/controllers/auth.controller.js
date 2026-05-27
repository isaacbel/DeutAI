const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Joi = require('joi');
const pool = require('../config/db');
const { sendPasswordResetEmail } = require('../services/email.service');

const SALT_ROUNDS = 10; // 12 rounds is too slow for Render free tier (~10s), 10 is still secure

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(8).required(),
});

function generateAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
}

function generateRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

async function register(req, res, next) {
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: error.details.map((d) => d.message).join(', '),
      details: error.details.map((d) => d.message),
    });
  }

  const { email, password } = value;

  try {
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'EMAIL_EXISTS', message: 'Cette adresse e-mail est déjà utilisée.' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2)',
      [email.toLowerCase(), passwordHash]
    );

    return res.status(201).json({ message: 'Compte créé avec succès' });
  } catch (err) {
    console.error('[AuthController] register :', err.message);
    next(err);
  }
}

async function login(req, res, next) {
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      details: error.details.map((d) => d.message),
    });
  }

  const { email, password } = value;

  try {
    const result = await pool.query(
      'SELECT id, email, password_hash FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
    }

    const payload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return res.status(200).json({
      access_token: accessToken,
      refresh_token: refreshToken,
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    console.error('[AuthController] login :', err.message);
    next(err);
  }
}

async function refresh(req, res, next) {
  const { refresh_token } = req.body;

  // Bug fix: validate type and presence before passing to jwt.verify
  if (!refresh_token || typeof refresh_token !== 'string') {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      details: ['refresh_token est requis et doit être une chaîne de caractères'],
    });
  }

  try {
    const decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);

    // Guard: decoded payload must carry userId
    if (!decoded.userId) {
      return res.status(401).json({ error: 'TOKEN_INVALID' });
    }

    const accessToken = generateAccessToken({
      userId: decoded.userId,
      email: decoded.email,
    });

    return res.status(200).json({ access_token: accessToken });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'TOKEN_INVALID' });
  }
}

async function forgotPassword(req, res, next) {
  const { error, value } = forgotPasswordSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      details: error.details.map((d) => d.message),
    });
  }

  const { email } = value;
  const genericResponse = {
    message: 'Si cet email existe, un lien de réinitialisation a été envoyé.',
  };

  try {
    const result = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(200).json(genericResponse);
    }

    const userId = result.rows[0].id;
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    await pool.query(
      `INSERT INTO password_resets (user_id, token_hash, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '1 hour')`,
      [userId, tokenHash]
    );

    await sendPasswordResetEmail(email.toLowerCase(), rawToken);

    return res.status(200).json(genericResponse);
  } catch (err) {
    console.error('[AuthController] forgotPassword :', err.message);
    return res.status(200).json(genericResponse);
  }
}

async function resetPassword(req, res, next) {
  const { error, value } = resetPasswordSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      details: error.details.map((d) => d.message),
    });
  }

  const { token, password } = value;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT id, user_id FROM password_resets
       WHERE token_hash = $1
         AND used = false
         AND expires_at > NOW()`,
      [tokenHash]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'TOKEN_INVALID_OR_EXPIRED' });
    }

    const { id: resetId, user_id: userId } = result.rows[0];
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Bug fix: wrap both UPDATEs in a transaction so they are atomic.
    // If the password update succeeds but used=true fails, the token
    // stays reusable — this prevents that race condition.
    await client.query('BEGIN');
    await client.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [passwordHash, userId]
    );
    await client.query(
      'UPDATE password_resets SET used = true WHERE id = $1',
      [resetId]
    );
    await client.query('COMMIT');

    return res.status(200).json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('[AuthController] resetPassword :', err.message);
    next(err);
  } finally {
    client.release();
  }
}

module.exports = { register, login, refresh, forgotPassword, resetPassword };
