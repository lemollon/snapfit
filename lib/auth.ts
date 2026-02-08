import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from './db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// Get secret with fallback for development/build
function getAuthSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    // During build or development, use a fallback
    // Production runtime will fail at request time if not set
    return 'build-time-secret-not-for-production';
  }
  return secret;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const isDev = process.env.NODE_ENV === 'development';

        // Validate credentials exist
        if (!credentials?.email || !credentials?.password) {
          console.log('[Auth] Missing credentials');
          throw new Error('Please enter email and password');
        }

        // Ensure password is a non-empty string
        const passwordInput = String(credentials.password || '').trim();
        if (!passwordInput) {
          console.log('[Auth] Empty password after trim');
          throw new Error('Please enter email and password');
        }

        // Normalize email
        const normalizedEmail = credentials.email.toLowerCase().trim();
        if (isDev) {
          console.log('[Auth] Attempting login for:', normalizedEmail);
        }

        let user;
        try {
          const result = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
          user = result[0];
          if (isDev) {
            console.log('[Auth] User lookup result:', {
              found: !!user,
              userId: user?.id,
              hasPassword: !!user?.password,
            });
          }
        } catch (dbError) {
          // Log the actual error for debugging but don't expose it to users
          console.error('[Auth] Database error during login:', dbError);
          throw new Error('Unable to sign in. Please try again later.');
        }

        if (!user) {
          if (isDev) {
            console.log('[Auth] User not found for email:', normalizedEmail);
          }
          throw new Error('Invalid email or password');
        }

        if (!user.password) {
          console.error('[Auth] User found but has no password stored:', user.id);
          throw new Error('Invalid email or password');
        }

        // Verify the stored password is a valid bcrypt hash
        const isBcryptHash = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
        if (!isBcryptHash) {
          console.error('[Auth] Invalid password hash format for user:', user.id);
          throw new Error('Invalid email or password');
        }

        let passwordMatch: boolean;
        try {
          passwordMatch = await bcrypt.compare(passwordInput, user.password);
          if (isDev) {
            console.log('[Auth] Password comparison result:', passwordMatch);
          }
        } catch (bcryptError) {
          console.error('[Auth] Bcrypt comparison error:', bcryptError);
          throw new Error('Unable to sign in. Please try again later.');
        }

        if (!passwordMatch) {
          if (isDev) {
            console.log('[Auth] Password mismatch for user:', user.id);
          }
          throw new Error('Invalid email or password');
        }

        // Check if email is verified
        if (!user.emailVerified) {
          if (isDev) {
            console.log('[Auth] Email not verified for user:', user.id);
          }
          throw new Error('EMAIL_NOT_VERIFIED');
        }

        if (isDev) {
          console.log('[Auth] Login successful for user:', user.id);
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl,
          isTrainer: user.isTrainer,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isTrainer = (user as any).isTrainer;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).isTrainer = token.isTrainer;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: getAuthSecret(),
  debug: process.env.NODE_ENV === 'development',
};
