import { pgTable, text, timestamp, boolean, integer, real, json, unique } from 'drizzle-orm/pg-core';

// Users - supports both regular users and trainers
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  name: text('name'),
  password: text('password').notNull(),
  avatarUrl: text('avatar_url'),
  isTrainer: boolean('is_trainer').default(false),
  bio: text('bio'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Trainer-Client relationships
export const trainerClients = pgTable('trainer_clients', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  trainerId: text('trainer_id').notNull().references(() => users.id),
  clientId: text('client_id').notNull().references(() => users.id),
  status: text('status').default('pending'), // pending, active, ended
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  uniqueTrainerClient: unique().on(table.trainerId, table.clientId),
}));

// Workouts
export const workouts = pgTable('workouts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title'),
  duration: integer('duration').notNull(), // in minutes
  fitnessLevel: text('fitness_level').notNull(),
  equipment: text('equipment').array(),
  notes: text('notes'),
  isPublic: boolean('is_public').default(false),
  shareCode: text('share_code').unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Exercises with YouTube video support
export const exercises = pgTable('exercises', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  workoutId: text('workout_id').notNull().references(() => workouts.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  sets: integer('sets'),
  reps: text('reps'),
  duration: text('duration'),
  equipment: text('equipment'),
  tips: text('tips'),
  description: text('description'),
  videoUrl: text('video_url'), // YouTube video URL
  category: text('category').notNull(), // warmup, main, cooldown
  orderIndex: integer('order_index').notNull(),
});

// Exercise library with video demonstrations
export const exerciseLibrary = pgTable('exercise_library', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull().unique(),
  description: text('description'),
  videoUrl: text('video_url'), // YouTube video URL
  muscleGroup: text('muscle_group').array(),
  equipment: text('equipment').array(),
  difficulty: text('difficulty').notNull(), // beginner, intermediate, advanced
  createdAt: timestamp('created_at').defaultNow(),
});

// Food logging with photo analysis
export const foodLogs = pgTable('food_logs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  photoUrl: text('photo_url'),
  mealType: text('meal_type').notNull(), // breakfast, lunch, dinner, snack
  foodName: text('food_name'),
  calories: integer('calories'),
  protein: real('protein'),
  carbs: real('carbs'),
  fat: real('fat'),
  fiber: real('fiber'),
  analysis: json('analysis'), // Full AI analysis
  notes: text('notes'),
  loggedAt: timestamp('logged_at').defaultNow(),
});

// Friendships
export const friendships = pgTable('friendships', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  senderId: text('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  receiverId: text('receiver_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: text('status').default('pending'), // pending, accepted, rejected
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  uniqueFriendship: unique().on(table.senderId, table.receiverId),
}));

// Challenges
export const challenges = pgTable('challenges', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  creatorId: text('creator_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // workout_count, total_minutes, streak, custom
  goal: integer('goal'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  isPublic: boolean('is_public').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Challenge participants
export const challengeParticipants = pgTable('challenge_participants', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  challengeId: text('challenge_id').notNull().references(() => challenges.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  progress: integer('progress').default(0),
  joinedAt: timestamp('joined_at').defaultNow(),
}, (table) => ({
  uniqueParticipant: unique().on(table.challengeId, table.userId),
}));

// Daily stats
export const dailyStats = pgTable('daily_stats', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id),
  date: timestamp('date').notNull(),
  workoutCount: integer('workout_count').default(0),
  totalMinutes: integer('total_minutes').default(0),
  caloriesIn: integer('calories_in'),
  proteinTotal: real('protein_total'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  uniqueUserDate: unique().on(table.userId, table.date),
}));

// Types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Workout = typeof workouts.$inferSelect;
export type NewWorkout = typeof workouts.$inferInsert;
export type Exercise = typeof exercises.$inferSelect;
export type FoodLog = typeof foodLogs.$inferSelect;
export type Challenge = typeof challenges.$inferSelect;
