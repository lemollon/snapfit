import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, passwordResetTokens } from '@/lib/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const isDev = process.env.NODE_ENV === 'development';

export async function POST(req: NextRequest) {
  try {
    const { email, code, password } = await req.json();

    if (!email || !code || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
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
      console.error('Database error finding token:', dbError);
      const errorMessage = dbError instanceof Error ? dbError.message : 'Unknown error';
      return NextResponse.json(
        { error: isDev ? `Database error: ${errorMessage}` : 'Failed to reset password' },
        { status: 500 }
      );
    }

    if (token.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    try {
      await db.update(users)
        .set({ password: hashedPassword, updatedAt: new Date() })
        .where(eq(users.id, token[0].userId));
    } catch (updateError) {
      console.error('Database error updating password:', updateError);
      const errorMessage = updateError instanceof Error ? updateError.message : 'Unknown error';
      return NextResponse.json(
        { error: isDev ? `Database error: ${errorMessage}` : 'Failed to reset password' },
        { status: 500 }
      );
    }

    // Mark token as used
    try {
      await db.update(passwordResetTokens)
        .set({ used: true })
        .where(eq(passwordResetTokens.id, token[0].id));
    } catch (tokenUpdateError) {
      // Non-critical error, log but don't fail
      console.error('Warning: Failed to mark token as used:', tokenUpdateError);
    }

    return NextResponse.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: isDev ? `Error: ${errorMessage}` : 'Failed to reset password' },
      { status: 500 }
    );
  }
}
