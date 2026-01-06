import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { sql, eq } from 'drizzle-orm';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    databaseUrl: process.env.DATABASE_URL ? 'SET (hidden)' : 'NOT SET',
  };

  try {
    // Test 1: Simple query
    const testQuery = await db.execute(sql`SELECT 1 as test`);
    results.connectionTest = 'SUCCESS';
  } catch (error) {
    results.connectionTest = 'FAILED';
    results.connectionError = error instanceof Error ? error.message : String(error);
  }

  try {
    // Test 2: Check if users table exists and count
    const userCount = await db.select({ count: sql`count(*)` }).from(users);
    results.usersTableTest = 'SUCCESS';
    results.userCount = userCount[0]?.count;
  } catch (error) {
    results.usersTableTest = 'FAILED';
    results.usersTableError = error instanceof Error ? error.message : String(error);
  }

  // Test 3: Check if specific email exists - use select API instead of query API
  if (email) {
    try {
      const [existingUser] = await db.select().from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);
      results.emailCheck = email;
      results.emailExists = !!existingUser;
      if (existingUser) {
        results.existingUserId = existingUser.id;
        results.existingUserName = existingUser.name;
      }
    } catch (error) {
      results.emailCheckError = error instanceof Error ? error.message : String(error);
    }
  }

  // List all user emails (for debugging)
  try {
    const allUsers = await db.select({ email: users.email, name: users.name }).from(users);
    results.allUsers = allUsers;
  } catch (error) {
    results.allUsersError = error instanceof Error ? error.message : String(error);
  }

  return NextResponse.json(results, { status: 200 });
}
