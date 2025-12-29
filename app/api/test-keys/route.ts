import { NextRequest, NextResponse } from 'next/server';
import { testCloudinaryConnection, getCloudinaryConfig } from '@/lib/cloudinary';
import { testEmailConnection, getEmailConfig } from '@/lib/email';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

interface TestResult {
  service: string;
  configured: boolean;
  working: boolean;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * GET /api/test-keys
 * Test all API key configurations
 *
 * For security, this endpoint should only be accessible in development
 * or by authenticated admin users in production
 */
export async function GET(request: NextRequest) {
  // Security check - only allow in development or with specific header
  const isDev = process.env.NODE_ENV !== 'production';
  const testHeader = request.headers.get('x-test-keys');

  if (!isDev && testHeader !== process.env.NEXTAUTH_SECRET) {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    );
  }

  const results: TestResult[] = [];

  // Test Cloudinary
  const cloudinaryConfig = getCloudinaryConfig();
  if (cloudinaryConfig.configured) {
    const cloudinaryTest = await testCloudinaryConnection();
    results.push({
      service: 'Cloudinary',
      configured: true,
      working: cloudinaryTest.success,
      message: cloudinaryTest.message,
      details: cloudinaryTest.details,
    });
  } else {
    results.push({
      service: 'Cloudinary',
      configured: false,
      working: false,
      message: 'Not configured - missing CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET',
      details: cloudinaryConfig,
    });
  }

  // Test Resend
  const emailConfig = getEmailConfig();
  if (emailConfig.configured) {
    const emailTest = await testEmailConnection();
    results.push({
      service: 'Resend (Email)',
      configured: true,
      working: emailTest.success,
      message: emailTest.message,
      details: emailTest.details,
    });
  } else {
    results.push({
      service: 'Resend (Email)',
      configured: false,
      working: false,
      message: 'Not configured - missing RESEND_API_KEY',
      details: emailConfig,
    });
  }

  // Test Anthropic
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      // Simple API test - just check if we can make a minimal request
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Say "OK"' }],
      });

      results.push({
        service: 'Anthropic (Claude AI)',
        configured: true,
        working: true,
        message: 'API key is valid and working',
        details: {
          model: response.model,
          usage: response.usage,
        },
      });
    } catch (error) {
      results.push({
        service: 'Anthropic (Claude AI)',
        configured: true,
        working: false,
        message: error instanceof Error ? error.message : 'Failed to connect',
        details: { error: String(error) },
      });
    }
  } else {
    results.push({
      service: 'Anthropic (Claude AI)',
      configured: false,
      working: false,
      message: 'Not configured - missing ANTHROPIC_API_KEY',
    });
  }

  // Test OpenAI
  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      // Simple API test
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Say "OK"' }],
      });

      results.push({
        service: 'OpenAI',
        configured: true,
        working: true,
        message: 'API key is valid and working',
        details: {
          model: response.model,
          usage: response.usage,
        },
      });
    } catch (error) {
      results.push({
        service: 'OpenAI',
        configured: true,
        working: false,
        message: error instanceof Error ? error.message : 'Failed to connect',
        details: { error: String(error) },
      });
    }
  } else {
    results.push({
      service: 'OpenAI',
      configured: false,
      working: false,
      message: 'Not configured - missing OPENAI_API_KEY',
    });
  }

  // Summary
  const allConfigured = results.every((r) => r.configured);
  const allWorking = results.every((r) => r.working);
  const workingCount = results.filter((r) => r.working).length;
  const configuredCount = results.filter((r) => r.configured).length;

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    summary: {
      totalServices: results.length,
      configured: configuredCount,
      working: workingCount,
      allConfigured,
      allWorking,
      status: allWorking
        ? 'ALL_SYSTEMS_GO'
        : allConfigured
        ? 'SOME_ISSUES'
        : 'NEEDS_CONFIGURATION',
    },
    results,
  });
}
