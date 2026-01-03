import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, passwordResetTokens } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { sendPasswordResetEmail, isEmailConfigured } from '@/lib/email';

// Generate a 6-digit code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const isDev = process.env.NODE_ENV === 'development';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    let user;
    try {
      user = await db.select()
        .from(users)
        .where(eq(users.email, normalizedEmail))
        .limit(1);
    } catch (dbError) {
      console.error('Database error finding user:', dbError);
      return NextResponse.json(
        { error: isDev ? `Database error: ${dbError instanceof Error ? dbError.message : 'Unknown'}` : 'Failed to process request' },
        { status: 500 }
      );
    }

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
    try {
      await db.insert(passwordResetTokens).values({
        userId: user[0].id,
        email: normalizedEmail,
        code,
        expiresAt,
      });
    } catch (tokenError) {
      console.error('Database error storing reset token:', tokenError);
      // Check if it's a table not found error
      const errorMessage = tokenError instanceof Error ? tokenError.message : 'Unknown error';
      if (errorMessage.includes('does not exist') || errorMessage.includes('relation')) {
        console.error('The password_reset_tokens table may not exist. Run: npm run db:push');
      }
      return NextResponse.json(
        { error: isDev ? `Database error: ${errorMessage}` : 'Failed to process request' },
        { status: 500 }
      );
    }

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(
      normalizedEmail,
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: isDev ? `Error: ${errorMessage}` : 'Failed to process request' },
      { status: 500 }
    );
  }
}
