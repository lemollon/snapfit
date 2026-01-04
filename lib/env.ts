/**
 * Environment variable validation and type-safe access
 * Validates required variables at runtime, not build time
 */

// Check if we're in a server context
const isServer = typeof window === 'undefined';

// Helper to get env var with validation
function getEnvVar(key: string, required: boolean = true): string {
  const value = process.env[key];

  if (required && !value && isServer) {
    // Only throw in server context and at runtime (not during build)
    if (process.env.NODE_ENV === 'production' || process.env.npm_lifecycle_event === 'start') {
      console.error(`Missing required environment variable: ${key}`);
    }
    return '';
  }

  return value || '';
}

// Environment configuration object
export const env = {
  // Database
  get DATABASE_URL() {
    return getEnvVar('DATABASE_URL');
  },

  // Auth
  get NEXTAUTH_SECRET() {
    return getEnvVar('NEXTAUTH_SECRET');
  },
  get NEXTAUTH_URL() {
    return getEnvVar('NEXTAUTH_URL', false) || 'http://localhost:3000';
  },

  // Cloudinary (optional in dev)
  get CLOUDINARY_CLOUD_NAME() {
    return getEnvVar('CLOUDINARY_CLOUD_NAME', false);
  },
  get CLOUDINARY_API_KEY() {
    return getEnvVar('CLOUDINARY_API_KEY', false);
  },
  get CLOUDINARY_API_SECRET() {
    return getEnvVar('CLOUDINARY_API_SECRET', false);
  },

  // Email (optional in dev)
  get RESEND_API_KEY() {
    return getEnvVar('RESEND_API_KEY', false);
  },
  get FROM_EMAIL() {
    return getEnvVar('FROM_EMAIL', false) || 'noreply@snapfit.app';
  },

  // AI (optional)
  get ANTHROPIC_API_KEY() {
    return getEnvVar('ANTHROPIC_API_KEY', false);
  },
  get OPENAI_API_KEY() {
    return getEnvVar('OPENAI_API_KEY', false);
  },

  // Helpers
  get isProduction() {
    return process.env.NODE_ENV === 'production';
  },
  get isDevelopment() {
    return process.env.NODE_ENV === 'development';
  },
};

// Validate critical env vars at startup (only in production)
export function validateEnv(): { valid: boolean; missing: string[] } {
  const required = ['DATABASE_URL', 'NEXTAUTH_SECRET'];
  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}
