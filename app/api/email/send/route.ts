import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendEmail, emailTemplates, getEmailConfig } from '@/lib/email';

type EmailType = 'welcome' | 'password-reset' | 'trainer-invite' | 'achievement' | 'weekly-report' | 'custom';

interface EmailRequest {
  type: EmailType;
  to: string;
  data?: Record<string, unknown>;
  // For custom emails
  subject?: string;
  html?: string;
  text?: string;
}

/**
 * POST /api/email/send
 * Send an email using Resend
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Require authentication for sending emails
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: EmailRequest = await request.json();
    const { type, to, data } = body;

    if (!type || !to) {
      return NextResponse.json(
        { error: 'type and to fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    let emailContent: { subject: string; html: string };

    switch (type) {
      case 'welcome':
        emailContent = emailTemplates.welcome(
          (data?.userName as string) || 'there'
        );
        break;

      case 'password-reset':
        if (!data?.resetUrl) {
          return NextResponse.json(
            { error: 'resetUrl is required for password-reset emails' },
            { status: 400 }
          );
        }
        emailContent = emailTemplates.passwordReset(
          data.resetUrl as string,
          (data?.userName as string) || 'there'
        );
        break;

      case 'trainer-invite':
        if (!data?.trainerName || !data?.inviteUrl) {
          return NextResponse.json(
            { error: 'trainerName and inviteUrl are required for trainer-invite emails' },
            { status: 400 }
          );
        }
        emailContent = emailTemplates.trainerInvite(
          data.trainerName as string,
          (data?.clientName as string) || 'there',
          data.inviteUrl as string
        );
        break;

      case 'achievement':
        if (!data?.achievementName) {
          return NextResponse.json(
            { error: 'achievementName is required for achievement emails' },
            { status: 400 }
          );
        }
        emailContent = emailTemplates.achievementUnlocked(
          (data?.userName as string) || 'Champion',
          data.achievementName as string,
          (data?.achievementDescription as string) || 'You earned a new achievement!'
        );
        break;

      case 'weekly-report':
        emailContent = emailTemplates.weeklyReport(
          (data?.userName as string) || 'there',
          {
            workoutsCompleted: (data?.workoutsCompleted as number) || 0,
            caloriesBurned: (data?.caloriesBurned as number) || 0,
            streak: (data?.streak as number) || 0,
            weekOverWeekChange: (data?.weekOverWeekChange as string) || 'N/A',
          }
        );
        break;

      case 'custom':
        if (!body.subject || !body.html) {
          return NextResponse.json(
            { error: 'subject and html are required for custom emails' },
            { status: 400 }
          );
        }
        emailContent = {
          subject: body.subject,
          html: body.html,
        };
        break;

      default:
        return NextResponse.json(
          { error: `Unknown email type: ${type}` },
          { status: 400 }
        );
    }

    const result = await sendEmail({
      to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: body.text,
      tags: [
        { name: 'type', value: type },
        { name: 'sender', value: session.user.id },
      ],
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to send email',
        success: false,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/email/send
 * Get email service status
 */
export async function GET() {
  const config = getEmailConfig();

  return NextResponse.json({
    configured: config.configured,
    fromEmail: config.fromEmail,
    availableTemplates: [
      'welcome',
      'password-reset',
      'trainer-invite',
      'achievement',
      'weekly-report',
      'custom',
    ],
  });
}
