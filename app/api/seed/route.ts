import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// POST /api/seed - Create test users
// Only works with secret key for security
export async function POST(req: Request) {
  try {
    const { secret } = await req.json();

    // Simple security check
    if (secret !== 'snapfit-seed-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const password = await bcrypt.hash('Test1234!', 12);
    const results: string[] = [];

    // Check and create Regular User
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, 'testuser@snapfit.com'),
    });

    if (!existingUser) {
      await db.insert(users).values({
        email: 'testuser@snapfit.com',
        password,
        name: 'Alex Johnson',
        isTrainer: false,
        bio: 'Fitness enthusiast on a journey to better health. Love HIIT and strength training!',
        fitnessGoal: 'build_muscle',
        currentWeight: '175',
        targetWeight: '185',
        height: '178',
        gender: 'male',
        xp: 2450,
        level: 5,
        currentStreak: 12,
        longestStreak: 21,
        totalWorkouts: 47,
        totalMinutes: 1680,
      });
      results.push('Created: testuser@snapfit.com');
    } else {
      results.push('Exists: testuser@snapfit.com');
    }

    // Check and create Trainer User
    const existingTrainer = await db.query.users.findFirst({
      where: eq(users.email, 'testtrainer@snapfit.com'),
    });

    if (!existingTrainer) {
      await db.insert(users).values({
        email: 'testtrainer@snapfit.com',
        password,
        name: 'Coach Sarah Miller',
        isTrainer: true,
        bio: 'Certified Personal Trainer with 8+ years experience. Specializing in weight loss and strength training.',
        certifications: ['NASM-CPT', 'ACE Certified', 'Precision Nutrition L1'],
        specializations: ['Weight Loss', 'Strength Training', 'HIIT', 'Nutrition Coaching'],
        hourlyRate: '75',
        instagramUrl: 'https://instagram.com/coachsarah',
        youtubeUrl: 'https://youtube.com/@coachsarahmiller',
        xp: 15200,
        level: 12,
        currentStreak: 45,
        longestStreak: 90,
        totalWorkouts: 312,
        totalMinutes: 12480,
      });
      results.push('Created: testtrainer@snapfit.com');
    } else {
      results.push('Exists: testtrainer@snapfit.com');
    }

    return NextResponse.json({
      success: true,
      results,
      credentials: {
        regularUser: {
          email: 'testuser@snapfit.com',
          password: 'Test1234!',
        },
        trainer: {
          email: 'testtrainer@snapfit.com',
          password: 'Test1234!',
        },
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed users', details: String(error) },
      { status: 500 }
    );
  }
}
