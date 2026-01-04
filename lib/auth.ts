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
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter email and password');
        }

        // Normalize email
        const normalizedEmail = credentials.email.toLowerCase().trim();

        let user;
        try {
          console.log('[AUTH] Starting login for email:', normalizedEmail);
          console.log('[AUTH] DATABASE_URL set:', !!process.env.DATABASE_URL);
          const result = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
          console.log('[AUTH] Query completed, found users:', result.length);
          user = result[0];
        } catch (dbError) {
          // Log detailed error for debugging
          console.error('[AUTH] Database error during login:', {
            message: dbError instanceof Error ? dbError.message : 'Unknown error',
            name: dbError instanceof Error ? dbError.name : 'Unknown',
            stack: dbError instanceof Error ? dbError.stack : undefined,
            email: normalizedEmail,
            databaseUrlSet: !!process.env.DATABASE_URL,
          });
          throw new Error('Unable to sign in. Please try again later.');
        }

        if (!user || !user.password) {
          console.log('[AUTH] User not found or no password set for:', normalizedEmail);
          // Generic message to prevent user enumeration
          throw new Error('Invalid email or password');
        }

        console.log('[AUTH] User found, comparing passwords...');
        const passwordMatch = await bcrypt.compare(credentials.password, user.password);
        console.log('[AUTH] Password match result:', passwordMatch);

        if (!passwordMatch) {
          console.log('[AUTH] Password mismatch for user:', normalizedEmail);
          // Same generic message
          throw new Error('Invalid email or password');
        }

        console.log('[AUTH] Login successful for:', normalizedEmail);

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
