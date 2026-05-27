const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Joi = require('joi');
const pool = require('../config/db');
const { sendPasswordResetEmail } = require('../services/email.service');

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

const passwordRule = Joi.string()
  .min(8)
  .pattern(/[A-Za-z]/, 'at least one letter')
  .pattern(/[0-9]/, 'at least one number')
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters.',
    'string.pattern.name': 'Password must contain at least one letter and one number.',
  });

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: passwordRule,
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
  password: passwordRule,
});

function validationResponse(res, error) {
  return res.status(400).json({
    error: 'VALIDATION_ERROR',
    message: 'Invalid request body.',
    details: error.details.map((detail) => detail.message),
  });
}

function generateAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
}

function generateRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
}

async function register(req, res, next) {
  const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
  if (error) return validationResponse(res, error);

  const email = value.email.toLowerCase();

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

    if (existing.rows.length > 0) {
      console.warn(`[Auth] Register blocked: duplicate email ${email}`);
      return res.status(409).json({
        error: 'EMAIL_EXISTS',
        message: 'This email is already registered.',
      });
    }

    const passwordHash = await bcrypt.hash(value.password, SALT_ROUNDS);

    const result = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
      [email, passwordHash]
    );

    return res.status(201).json({
      message: 'Account created successfully.',
      user: result.rows[0],
    });
  } catch (err) {
    if (err.code === '23505') {
      console.warn(`[Auth] Register blocked by unique constraint: duplicate email ${email}`);
      return res.status(409).json({
        error: 'EMAIL_EXISTS',
        message: 'This email is already registered.',
      });
    }

    console.error('[Auth] Register failed:', err.message);
    return next(err);
  }
}

async function login(req, res, next) {
  const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
  if (error) return validationResponse(res, error);

  const email = value.email.toLowerCase();

  try {
    const result = await pool.query(
      'SELECT id, email, password_hash FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      console.warn(`[Auth] Login failed: user not found ${email}`);
      return res.status(404).json({
        error: 'USER_NOT_FOUND',
        message: 'No account exists for this email.',
      });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(value.password, user.password_hash);

    if (!passwordMatch) {
      console.warn(`[Auth] Login failed: wrong password for ${email}`);
      return res.status(401).json({
        error: 'INVALID_PASSWORD',
        message: 'Password is incorrect.',
      });
    }

    const payload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    console.log(`[Auth] Login succeeded for ${email}`);

    return res.status(200).json({
      message: 'Login successful.',
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: ACCESS_TOKEN_EXPIRES_IN,
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    console.error('[Auth] Login failed:', err.message);
    return next(err);
  }
}

async function refresh(req, res) {
  const { refresh_token: refreshToken } = req.body;

  if (!refreshToken || typeof refreshToken !== 'string') {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'refresh_token is required.',
      details: ['refresh_token must be a string.'],
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    if (!decoded.userId) {
      console.warn('[Auth] Refresh failed: token missing userId.');
      return res.status(401).json({
        error: 'TOKEN_INVALID',
        message: 'Refresh token is invalid.',
      });
    }

    const accessToken = generateAccessToken({
      userId: decoded.userId,
      email: decoded.email,
    });

    return res.status(200).json({
      message: 'Access token refreshed.',
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: ACCESS_TOKEN_EXPIRES_IN,
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      console.warn('[Auth] Refresh failed: token expired.');
      return res.status(401).json({
        error: 'TOKEN_EXPIRED',
        message: 'Refresh token has expired.',
      });
    }

    console.warn('[Auth] Refresh failed: invalid token.');
    return res.status(401).json({
      error: 'TOKEN_INVALID',
      message: 'Refresh token is invalid.',
    });
  }
}

async function forgotPassword(req, res) {
  const { error, value } = forgotPasswordSchema.validate(req.body, { abortEarly: false });
  if (error) return validationResponse(res, error);

  const email = value.email.toLowerCase();
  const genericResponse = {
    message: 'If this email exists, a reset link has been sent.',
  };

  try {
    const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      console.warn(`[Auth] Password reset requested for unknown email ${email}`);
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

    await sendPasswordResetEmail(email, rawToken);

    console.log(`[Auth] Password reset email queued for ${email}`);
    return res.status(200).json(genericResponse);
  } catch (err) {
    console.error('[Auth] Password reset failed:', err.message);
    return res.status(200).json(genericResponse);
  }
}

async function resetPassword(req, res, next) {
  const { error, value } = resetPasswordSchema.validate(req.body, { abortEarly: false });
  if (error) return validationResponse(res, error);

  const tokenHash = crypto.createHash('sha256').update(value.token).digest('hex');
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
      console.warn('[Auth] Password reset failed: token invalid or expired.');
      return res.status(400).json({
        error: 'TOKEN_INVALID_OR_EXPIRED',
        message: 'Reset token is invalid or expired.',
      });
    }

    const { id: resetId, user_id: userId } = result.rows[0];
    const passwordHash = await bcrypt.hash(value.password, SALT_ROUNDS);

    await client.query('BEGIN');
    await client.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, userId]);
    await client.query('UPDATE password_resets SET used = true WHERE id = $1', [resetId]);
    await client.query('COMMIT');

    console.log(`[Auth] Password reset succeeded for user ${userId}`);
    return res.status(200).json({ message: 'Password reset successfully.' });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('[Auth] Password reset failed:', err.message);
    return next(err);
  } finally {
    client.release();
  }
}

module.exports = { register, login, refresh, forgotPassword, resetPassword };
