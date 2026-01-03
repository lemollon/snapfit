import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { passwordResetTokens } from '@/lib/db/schema';
import { eq, and, gt } from 'drizzle-orm';

const isDev = process.env.NODE_ENV === 'development';

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find valid token
    let token;
    try {
      token = await db.select()
        .from(passwordResetTokens)
        .where(and(
          eq(passwordResetTokens.email, normalizedEmail),
          eq(passwordResetTokens.code, code),
          eq(passwordResetTokens.used, false),
          gt(passwordResetTokens.expiresAt, new Date())
        ))
        .limit(1);
    } catch (dbError) {
      console.error('Database error verifying code:', dbError);
      const errorMessage = dbError instanceof Error ? dbError.message : 'Unknown error';
      return NextResponse.json(
        { error: isDev ? `Database error: ${errorMessage}` : 'Failed to verify code' },
        { status: 500 }
      );
    }

    if (token.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    return NextResponse.json({ success: true, valid: true });
  } catch (error) {
    console.error('Verify code error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: isDev ? `Error: ${errorMessage}` : 'Failed to verify code' },
      { status: 500 }
    );
  }
}
