import { Resend } from 'resend';

// Initialize Resend client
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export interface EmailConfig {
  configured: boolean;
  hasApiKey: boolean;
  fromEmail: string;
  [key: string]: unknown;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  tags?: Array<{ name: string; value: string }>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Get email configuration status
 */
export function getEmailConfig(): EmailConfig {
  return {
    configured: !!process.env.RESEND_API_KEY,
    hasApiKey: !!process.env.RESEND_API_KEY,
    fromEmail: process.env.FROM_EMAIL || 'noreply@snapfit.app',
  };
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  const config = getEmailConfig();

  if (!config.configured || !resend) {
    console.warn('Email not sent: Resend is not configured');
    return {
      success: false,
      error: 'Email service not configured. Set RESEND_API_KEY environment variable.',
    };
  }

  try {
    // Resend requires at least one of html, text, or template
    if (!options.html && !options.text) {
      return {
        success: false,
        error: 'Either html or text content is required',
      };
    }

    const result = await resend.emails.send({
      from: config.fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html || undefined,
      text: options.text || undefined,
      replyTo: options.replyTo || undefined,
      tags: options.tags || undefined,
    } as Parameters<typeof resend.emails.send>[0]);

    if (result.error) {
      return {
        success: false,
        error: result.error.message,
      };
    }

    return {
      success: true,
      messageId: result.data?.id,
    };
  } catch (error) {
    console.error('Email send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

/**
 * Test Resend connection
 */
export async function testEmailConnection(): Promise<{
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}> {
  const config = getEmailConfig();

  if (!config.configured || !resend) {
    return {
      success: false,
      message: 'Resend is not configured',
      details: config,
    };
  }

  try {
    // Send a test email to verify the API key works
    // Using Resend's test endpoint
    const result = await resend.emails.send({
      from: config.fromEmail,
      to: 'delivered@resend.dev', // Resend's test address
      subject: 'SnapFit API Key Test',
      html: '<p>This is a test email from SnapFit to verify the Resend API key.</p>',
    });

    if (result.error) {
      return {
        success: false,
        message: `Resend API error: ${result.error.message}`,
        details: { error: result.error },
      };
    }

    return {
      success: true,
      message: 'Resend connection successful - test email sent',
      details: {
        messageId: result.data?.id,
        fromEmail: config.fromEmail,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to connect to Resend',
      details: { error: String(error) },
    };
  }
}

// Email templates
export const emailTemplates = {
  /**
   * Welcome email for new users
   */
  welcome: (userName: string): { subject: string; html: string } => ({
    subject: 'Welcome to SnapFit!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to SnapFit!</h1>
            </div>
            <div style="padding: 40px 30px;">
              <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">Hi ${userName},</p>
              <p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;">
                We're excited to have you on board! SnapFit is your all-in-one fitness companion
                that helps you track progress, log meals, and stay motivated on your fitness journey.
              </p>
              <p style="color: #6b7280; line-height: 1.6; margin-bottom: 30px;">
                Get started by setting up your profile and logging your first workout!
              </p>
              <div style="text-align: center;">
                <a href="${process.env.NEXTAUTH_URL || 'https://snapfit.app'}"
                   style="display: inline-block; background: #10b981; color: white; padding: 14px 32px;
                          border-radius: 8px; text-decoration: none; font-weight: 600;">
                  Get Started
                </a>
              </div>
            </div>
            <div style="background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                SnapFit - Your Fitness Journey Starts Here
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  /**
   * Password reset email
   */
  passwordReset: (resetUrl: string, userName: string): { subject: string; html: string } => ({
    subject: 'Reset Your SnapFit Password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #3b82f6, #2563eb); padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
            </div>
            <div style="padding: 40px 30px;">
              <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">Hi ${userName},</p>
              <p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;">
                We received a request to reset your password. Click the button below to create a new password.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}"
                   style="display: inline-block; background: #3b82f6; color: white; padding: 14px 32px;
                          border-radius: 8px; text-decoration: none; font-weight: 600;">
                  Reset Password
                </a>
              </div>
              <p style="color: #9ca3af; font-size: 14px; line-height: 1.6;">
                If you didn't request this, you can safely ignore this email. This link expires in 1 hour.
              </p>
            </div>
            <div style="background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                SnapFit - Your Fitness Journey Starts Here
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  /**
   * Trainer invite email
   */
  trainerInvite: (
    trainerName: string,
    clientName: string,
    inviteUrl: string
  ): { subject: string; html: string } => ({
    subject: `${trainerName} invited you to SnapFit`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">You're Invited!</h1>
            </div>
            <div style="padding: 40px 30px;">
              <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">Hi ${clientName},</p>
              <p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;">
                <strong>${trainerName}</strong> has invited you to join SnapFit as their client!
                Get personalized training programs, track your progress, and achieve your fitness goals together.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteUrl}"
                   style="display: inline-block; background: #8b5cf6; color: white; padding: 14px 32px;
                          border-radius: 8px; text-decoration: none; font-weight: 600;">
                  Accept Invitation
                </a>
              </div>
            </div>
            <div style="background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                SnapFit - Your Fitness Journey Starts Here
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  /**
   * Achievement unlocked notification
   */
  achievementUnlocked: (
    userName: string,
    achievementName: string,
    achievementDescription: string
  ): { subject: string; html: string } => ({
    subject: `You unlocked: ${achievementName}!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 40px 30px; text-align: center;">
              <div style="font-size: 60px; margin-bottom: 10px;">🏆</div>
              <h1 style="color: white; margin: 0; font-size: 28px;">Achievement Unlocked!</h1>
            </div>
            <div style="padding: 40px 30px; text-align: center;">
              <p style="font-size: 18px; color: #374151; margin-bottom: 10px;">Congratulations, ${userName}!</p>
              <h2 style="color: #f59e0b; font-size: 24px; margin: 20px 0;">${achievementName}</h2>
              <p style="color: #6b7280; line-height: 1.6; margin-bottom: 30px;">
                ${achievementDescription}
              </p>
              <a href="${process.env.NEXTAUTH_URL || 'https://snapfit.app'}/achievements"
                 style="display: inline-block; background: #f59e0b; color: white; padding: 14px 32px;
                        border-radius: 8px; text-decoration: none; font-weight: 600;">
                View Your Achievements
              </a>
            </div>
            <div style="background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                Keep crushing it! 💪
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  /**
   * Weekly progress report email
   */
  weeklyReport: (
    userName: string,
    stats: {
      workoutsCompleted: number;
      caloriesBurned: number;
      streak: number;
      weekOverWeekChange: string;
    }
  ): { subject: string; html: string } => ({
    subject: 'Your Weekly SnapFit Report',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Weekly Report</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Here's how you did this week!</p>
            </div>
            <div style="padding: 40px 30px;">
              <p style="font-size: 18px; color: #374151; margin-bottom: 30px;">Hi ${userName},</p>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
                <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; text-align: center;">
                  <div style="font-size: 32px; font-weight: bold; color: #10b981;">${stats.workoutsCompleted}</div>
                  <div style="color: #6b7280; font-size: 14px;">Workouts</div>
                </div>
                <div style="background: #fef3c7; padding: 20px; border-radius: 8px; text-align: center;">
                  <div style="font-size: 32px; font-weight: bold; color: #f59e0b;">${stats.caloriesBurned.toLocaleString()}</div>
                  <div style="color: #6b7280; font-size: 14px;">Calories Burned</div>
                </div>
                <div style="background: #ede9fe; padding: 20px; border-radius: 8px; text-align: center;">
                  <div style="font-size: 32px; font-weight: bold; color: #8b5cf6;">${stats.streak}</div>
                  <div style="color: #6b7280; font-size: 14px;">Day Streak 🔥</div>
                </div>
                <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; text-align: center;">
                  <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">${stats.weekOverWeekChange}</div>
                  <div style="color: #6b7280; font-size: 14px;">vs Last Week</div>
                </div>
              </div>

              <div style="text-align: center;">
                <a href="${process.env.NEXTAUTH_URL || 'https://snapfit.app'}/dashboard"
                   style="display: inline-block; background: #10b981; color: white; padding: 14px 32px;
                          border-radius: 8px; text-decoration: none; font-weight: 600;">
                  View Full Dashboard
                </a>
              </div>
            </div>
            <div style="background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                Keep up the great work! 💪
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
};

export { resend };
