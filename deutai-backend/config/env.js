const REQUIRED_ENV = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];

const OPTIONAL_WARNINGS = [
  ['FRONTEND_URL', 'CORS and password-reset links need FRONTEND_URL in production.'],
];

const AI_PROVIDER_ENV = [
  'GROQ_API_KEY',
  'OPENROUTER_API_KEY',
  'GEMINI_API_KEY',
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
];

function validateEnv() {
  const missing = REQUIRED_ENV.filter((name) => !process.env[name]);

  missing.forEach((name) => {
    console.error(`[Env] Missing critical environment variable: ${name}`);
  });

  OPTIONAL_WARNINGS.forEach(([name, warning]) => {
    if (!process.env[name]) {
      console.warn(`[Env] Warning: ${name} is not set. ${warning}`);
    }
  });

  ['JWT_SECRET', 'JWT_REFRESH_SECRET'].forEach((name) => {
    const value = process.env[name];
    if (value && value.length < 32) {
      console.warn(`[Env] Warning: ${name} should be at least 32 characters long.`);
    }
  });

  if (!AI_PROVIDER_ENV.some((name) => Boolean(process.env[name]))) {
    console.warn('[Env] Warning: no AI provider API key is set; AI routes will fail until one is configured.');
  }

  const emailVars = ['EMAIL_HOST', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM'];
  const missingEmailVars = emailVars.filter((name) => !process.env[name]);
  if (missingEmailVars.length > 0) {
    console.warn(`[Env] Warning: password-reset email is not fully configured. Missing: ${missingEmailVars.join(', ')}`);
  }

  return { missing };
}

module.exports = {
  REQUIRED_ENV,
  validateEnv,
};
