import { db } from '../lib/db';
import { users } from '../lib/db/schema';
import bcrypt from 'bcryptjs';

async function seedTestUsers() {
  console.log('Creating test users...');

  const password = await bcrypt.hash('Test1234!', 12);

  try {
    // Regular User
    const [regularUser] = await db.insert(users).values({
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
    }).onConflictDoNothing().returning();

    console.log('Regular User:', regularUser?.email || 'Already exists (testuser@snapfit.com)');
  } catch (e) {
    console.log('Regular user may already exist');
  }

  try {
    // Trainer User
    const [trainerUser] = await db.insert(users).values({
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
    }).onConflictDoNothing().returning();

    console.log('Trainer:', trainerUser?.email || 'Already exists (testtrainer@snapfit.com)');
  } catch (e) {
    console.log('Trainer user may already exist');
  }

  console.log('\n✅ Test accounts ready!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Regular User: testuser@snapfit.com');
  console.log('Trainer:      testtrainer@snapfit.com');
  console.log('Password:     Test1234!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  process.exit(0);
}

seedTestUsers().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
