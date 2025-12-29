import { Resend } from 'resend';

// Lazy-load Resend to avoid errors when API key is not set
let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

// Your verified domain email (update after domain verification)
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@snapfit.app';
const APP_NAME = 'SnapFit';

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Check if email service is configured
 */
export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

/**
 * Send password reset email with verification code
 */
export async function sendPasswordResetEmail(
  email: string,
  code: string,
  userName?: string
): Promise<EmailResult> {
  if (!isEmailConfigured()) {
    console.log('[DEV MODE] Password reset code:', code);
    return { success: true, messageId: 'dev-mode' };
  }

  try {
    const resend = getResendClient();
    if (!resend) {
      return { success: false, error: 'Email service not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: `${APP_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: `Your ${APP_NAME} Password Reset Code`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" style="max-width: 500px; background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(236, 72, 153, 0.1)); border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); padding: 40px;">
                  <tr>
                    <td align="center" style="padding-bottom: 30px;">
                      <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #f97316, #ec4899); border-radius: 16px; display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 28px; color: white; font-weight: bold;">S</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="color: white; padding-bottom: 20px;">
                      <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Reset Your Password</h1>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="color: #a1a1aa; padding-bottom: 30px; font-size: 16px; line-height: 1.5;">
                      ${userName ? `Hi ${userName},` : 'Hi,'}<br><br>
                      You requested to reset your password. Enter this code to continue:
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-bottom: 30px;">
                      <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px 40px; display: inline-block;">
                        <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: white; font-family: monospace;">${code}</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="color: #71717a; font-size: 14px; line-height: 1.5;">
                      This code expires in <strong style="color: #f97316;">15 minutes</strong>.<br><br>
                      If you didn't request this, you can safely ignore this email.
                    </td>
                  </tr>
                </table>
                <table width="100%" style="max-width: 500px; padding-top: 30px;">
                  <tr>
                    <td align="center" style="color: #52525b; font-size: 12px;">
                      &copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

/**
 * Send trainer invitation email
 */
export async function sendTrainerInviteEmail(
  email: string,
  trainerName: string,
  inviteLink?: string
): Promise<EmailResult> {
  if (!isEmailConfigured()) {
    console.log('[DEV MODE] Trainer invite sent to:', email);
    return { success: true, messageId: 'dev-mode' };
  }

  try {
    const resend = getResendClient();
    if (!resend) {
      return { success: false, error: 'Email service not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: `${APP_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: `${trainerName} invited you to ${APP_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" style="max-width: 500px; background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1)); border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); padding: 40px;">
                  <tr>
                    <td align="center" style="padding-bottom: 30px;">
                      <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #8b5cf6, #ec4899); border-radius: 16px;"></div>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="color: white; padding-bottom: 20px;">
                      <h1 style="margin: 0; font-size: 24px; font-weight: 600;">You've Been Invited!</h1>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="color: #a1a1aa; padding-bottom: 30px; font-size: 16px; line-height: 1.5;">
                      <strong style="color: white;">${trainerName}</strong> wants to be your trainer on ${APP_NAME}.<br><br>
                      Join now to start your fitness journey with personalized guidance!
                    </td>
                  </tr>
                  ${inviteLink ? `
                  <tr>
                    <td align="center" style="padding-bottom: 30px;">
                      <a href="${inviteLink}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">
                        Accept Invitation
                      </a>
                    </td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td align="center" style="color: #71717a; font-size: 14px;">
                      Questions? Just reply to this email.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

/**
 * Send welcome email after signup
 */
export async function sendWelcomeEmail(
  email: string,
  userName: string
): Promise<EmailResult> {
  if (!isEmailConfigured()) {
    console.log('[DEV MODE] Welcome email sent to:', email);
    return { success: true, messageId: 'dev-mode' };
  }

  try {
    const resend = getResendClient();
    if (!resend) {
      return { success: false, error: 'Email service not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: `${APP_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: `Welcome to ${APP_NAME}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" style="max-width: 500px; background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(236, 72, 153, 0.1)); border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); padding: 40px;">
                  <tr>
                    <td align="center" style="padding-bottom: 30px;">
                      <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #f97316, #ec4899); border-radius: 16px;"></div>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="color: white; padding-bottom: 20px;">
                      <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Welcome, ${userName}!</h1>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="color: #a1a1aa; padding-bottom: 30px; font-size: 16px; line-height: 1.5;">
                      You're all set to start your fitness journey with ${APP_NAME}.<br><br>
                      Track workouts, log meals, and achieve your goals!
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="color: #71717a; font-size: 14px;">
                      Let's crush those fitness goals together! 💪
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

export { getResendClient };
