import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

export async function GET() {
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    databaseUrl: process.env.DATABASE_URL ? 'SET (hidden)' : 'NOT SET',
  };

  try {
    // Test 1: Simple query
    const testQuery = await db.execute(sql`SELECT 1 as test`);
    results.connectionTest = 'SUCCESS';
    results.testQueryResult = testQuery;
  } catch (error) {
    results.connectionTest = 'FAILED';
    results.connectionError = error instanceof Error ? error.message : String(error);
  }

  try {
    // Test 2: Check if users table exists
    const userCount = await db.select({ count: sql`count(*)` }).from(users);
    results.usersTableTest = 'SUCCESS';
    results.userCount = userCount;
  } catch (error) {
    results.usersTableTest = 'FAILED';
    results.usersTableError = error instanceof Error ? error.message : String(error);
  }

  return NextResponse.json(results, { status: 200 });
}
