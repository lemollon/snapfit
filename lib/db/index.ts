import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Lazy initialization to prevent build-time errors
let queryClient: ReturnType<typeof postgres> | null = null;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getConnectionString(): string {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL environment variable is not set. ' +
      'Please add it to your .env file or Vercel environment variables.'
    );
  }
  return connectionString;
}

function createDb() {
  if (!dbInstance) {
    const connectionString = getConnectionString();
    // For query purposes - with connection pooling settings for serverless
    // SSL is required for Render external connections
    queryClient = postgres(connectionString, {
      max: 10, // Maximum connections in pool
      idle_timeout: 20, // Close idle connections after 20 seconds
      connect_timeout: 10, // Connection timeout in seconds
      ssl: 'require', // Required for Render external connections
    });
    dbInstance = drizzle(queryClient, { schema });
  }
  return dbInstance;
}

// Export a proxy that lazily initializes the database connection
// This prevents errors during build time when DATABASE_URL is not set
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    const instance = createDb();
    const value = instance[prop as keyof typeof instance];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  },
});

export * from './schema';
