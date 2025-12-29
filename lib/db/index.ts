import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL environment variable is not set. ' +
    'Please add it to your .env file or Vercel environment variables.'
  );
}

// For query purposes - with connection pooling settings for serverless
const queryClient = postgres(connectionString, {
  max: 10, // Maximum connections in pool
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout in seconds
});

export const db = drizzle(queryClient, { schema });

export * from './schema';
