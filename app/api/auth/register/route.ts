import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, emailVerificationTokens } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { sendEmailVerificationEmail } from '@/lib/email';

// Generate a 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export async function POST(req: Request) {
  try {
    const { email, password, name, isTrainer } = await req.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const normalizedEmail = email.toLowerCase().trim();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUsers = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
    const existingUser = existingUsers[0];

    if (existingUser) {
      // Generic message to prevent user enumeration
      return NextResponse.json(
        { error: 'Unable to create account. Please try a different email.' },
        { status: 400 }
      );
    }

    // Hash password with bcrypt (cost factor 12)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with emailVerified = false
    const [newUser] = await db.insert(users).values({
      email: normalizedEmail,
      password: hashedPassword,
      name: name?.trim() || normalizedEmail.split('@')[0],
      isTrainer: isTrainer || false,
      emailVerified: false,
    }).returning();

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

    // Store verification token
    await db.insert(emailVerificationTokens).values({
      userId: newUser.id,
      email: normalizedEmail,
      code: verificationCode,
      expiresAt,
    });

    // Send verification email
    const emailResult = await sendEmailVerificationEmail(
      normalizedEmail,
      verificationCode,
      newUser.name || undefined
    );

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      // Don't fail registration, but log it
    }

    return NextResponse.json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        isTrainer: newUser.isTrainer,
        emailVerified: false,
      },
      message: 'Account created. Please check your email for verification code.',
      requiresVerification: true,
    });
  } catch (error) {
    console.error('Registration error:', error);

    // Provide more specific error messages for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Check for common database errors
    if (errorMessage.includes('connect') || errorMessage.includes('ECONNREFUSED') || errorMessage.includes('timeout')) {
      return NextResponse.json(
        { error: 'Database connection failed. Please try again.' },
        { status: 503 }
      );
    }

    if (errorMessage.includes('duplicate') || errorMessage.includes('unique')) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 400 }
      );
    }

    if (errorMessage.includes('SSL') || errorMessage.includes('ssl')) {
      return NextResponse.json(
        { error: 'Database SSL connection error. Please contact support.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Unable to create account. Please try again.' },
      { status: 500 }
    );
  }
}
