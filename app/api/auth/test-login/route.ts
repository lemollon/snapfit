/**
 * Test Login Endpoint
 *
 * This endpoint simulates the login flow and returns detailed information
 * about what's happening. Use this to diagnose login issues.
 *
 * POST /api/auth/test-login
 * Body: { email: string, password: string }
 *
 * Returns detailed information about:
 * 1. Email normalization
 * 2. User lookup result
 * 3. Password verification
 * 4. Any errors encountered
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    steps: [],
  };

  try {
    // Step 1: Parse request body
    const body = await req.json();
    const { email, password } = body;
    (diagnostics.steps as unknown[]).push({
      step: 1,
      action: 'Parse request body',
      success: true,
      emailProvided: !!email,
      passwordProvided: !!password,
    });

    // Step 2: Validate input
    if (!email || !password) {
      (diagnostics.steps as unknown[]).push({
        step: 2,
        action: 'Validate input',
        success: false,
        error: 'Email and password are required',
      });
      return NextResponse.json({
        success: false,
        error: 'Email and password are required',
        diagnostics,
        duration: Date.now() - startTime,
      });
    }
    (diagnostics.steps as unknown[]).push({
      step: 2,
      action: 'Validate input',
      success: true,
    });

    // Step 3: Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    (diagnostics.steps as unknown[]).push({
      step: 3,
      action: 'Normalize email',
      success: true,
      originalEmail: email,
      normalizedEmail,
      wasModified: email !== normalizedEmail,
    });

    // Step 4: Query database for user
    let user: (typeof users.$inferSelect) | undefined;
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, normalizedEmail))
        .limit(1);
      user = result[0];

      (diagnostics.steps as unknown[]).push({
        step: 4,
        action: 'Query database for user',
        success: true,
        userFound: !!user,
        resultCount: result.length,
        userId: user?.id,
        userName: user?.name,
        userEmail: user?.email,
        hasPassword: !!user?.password,
        passwordLength: user?.password?.length,
        isTrainer: user?.isTrainer,
      });
    } catch (dbError) {
      const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
      (diagnostics.steps as unknown[]).push({
        step: 4,
        action: 'Query database for user',
        success: false,
        error: errorMessage,
      });
      return NextResponse.json({
        success: false,
        error: 'Database error during user lookup',
        errorDetails: errorMessage,
        diagnostics,
        duration: Date.now() - startTime,
      });
    }

    // Step 5: Check if user exists
    if (!user) {
      (diagnostics.steps as unknown[]).push({
        step: 5,
        action: 'Check user exists',
        success: false,
        error: 'User not found in database',
      });
      return NextResponse.json({
        success: false,
        error: 'User not found',
        diagnostics,
        duration: Date.now() - startTime,
      });
    }
    (diagnostics.steps as unknown[]).push({
      step: 5,
      action: 'Check user exists',
      success: true,
    });

    // Step 6: Check if password field exists
    if (!user.password) {
      (diagnostics.steps as unknown[]).push({
        step: 6,
        action: 'Check password field exists',
        success: false,
        error: 'User has no password stored',
      });
      return NextResponse.json({
        success: false,
        error: 'User has no password stored',
        diagnostics,
        duration: Date.now() - startTime,
      });
    }
    (diagnostics.steps as unknown[]).push({
      step: 6,
      action: 'Check password field exists',
      success: true,
      passwordFormat: user.password.startsWith('$2a$') || user.password.startsWith('$2b$')
        ? 'bcrypt'
        : 'unknown',
    });

    // Step 7: Verify password
    let passwordMatch: boolean;
    try {
      passwordMatch = await bcrypt.compare(password, user.password);
      (diagnostics.steps as unknown[]).push({
        step: 7,
        action: 'Verify password with bcrypt',
        success: true,
        passwordMatch,
        bcryptCostFactor: user.password.split('$')[2], // Extract cost factor from hash
      });
    } catch (bcryptError) {
      const errorMessage = bcryptError instanceof Error ? bcryptError.message : String(bcryptError);
      (diagnostics.steps as unknown[]).push({
        step: 7,
        action: 'Verify password with bcrypt',
        success: false,
        error: errorMessage,
      });
      return NextResponse.json({
        success: false,
        error: 'Password verification failed',
        errorDetails: errorMessage,
        diagnostics,
        duration: Date.now() - startTime,
      });
    }

    // Step 8: Final result
    if (!passwordMatch) {
      (diagnostics.steps as unknown[]).push({
        step: 8,
        action: 'Final authentication check',
        success: false,
        error: 'Password does not match',
      });
      return NextResponse.json({
        success: false,
        error: 'Password does not match',
        diagnostics,
        duration: Date.now() - startTime,
      });
    }

    (diagnostics.steps as unknown[]).push({
      step: 8,
      action: 'Final authentication check',
      success: true,
      message: 'Login would succeed',
    });

    return NextResponse.json({
      success: true,
      message: 'Login credentials are valid',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isTrainer: user.isTrainer,
      },
      diagnostics,
      duration: Date.now() - startTime,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    (diagnostics.steps as unknown[]).push({
      step: 'error',
      action: 'Unexpected error',
      success: false,
      error: errorMessage,
    });
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      errorDetails: errorMessage,
      diagnostics,
      duration: Date.now() - startTime,
    }, { status: 500 });
  }
}
