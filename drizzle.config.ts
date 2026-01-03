import type { Config } from 'drizzle-kit';

// Ensure SSL is appended to DATABASE_URL for Render PostgreSQL
function getDbUrl(): string {
  const url = process.env.DATABASE_URL || '';
  // Append sslmode=require if not already present
  if (url && !url.includes('sslmode=')) {
    return url.includes('?') ? `${url}&sslmode=require` : `${url}?sslmode=require`;
  }
  return url;
}

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: getDbUrl(),
  },
} satisfies Config;
