import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, passwordResetTokens } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { sendPasswordResetEmail, isEmailConfigured } from '@/lib/email';

// Generate a 6-digit code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find user by email
    const user = await db.select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (user.length === 0) {
      // Don't reveal if email exists - return success anyway for security
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a reset code will be sent'
      });
    }

    // Generate reset code
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store the reset token
    await db.insert(passwordResetTokens).values({
      userId: user[0].id,
      email: email.toLowerCase(),
      code,
      expiresAt,
    });

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(
      email.toLowerCase(),
      code,
      user[0].name || undefined
    );

    if (!emailResult.success && isEmailConfigured()) {
      console.error('Failed to send reset email:', emailResult.error);
      // Still return success to not reveal account existence
    }

    return NextResponse.json({
      success: true,
      message: 'Reset code sent to your email',
      // Only include code in dev mode when email is not configured
      ...(!isEmailConfigured() && { code, devMode: true })
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
