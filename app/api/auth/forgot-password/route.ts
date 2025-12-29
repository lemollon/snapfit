import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, passwordResetTokens } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

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

    // In production, you would send an email here
    // For now, we'll log it (in dev) or just acknowledge
    console.log(`Password reset code for ${email}: ${code}`);

    // TODO: Integrate with email service (SendGrid, Resend, etc.)
    // await sendEmail({
    //   to: email,
    //   subject: 'SnapFit Password Reset',
    //   html: `Your password reset code is: <strong>${code}</strong>. It expires in 15 minutes.`
    // });

    return NextResponse.json({
      success: true,
      message: 'Reset code sent to your email',
      // Remove this in production - only for demo/testing
      ...(process.env.NODE_ENV === 'development' && { code })
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
