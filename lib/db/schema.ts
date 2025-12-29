import { pgTable, text, timestamp, boolean, integer, real, json, unique, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users - supports both regular users and trainers
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  name: text('name'),
  password: text('password').notNull(),
  avatarUrl: text('avatar_url'),
  coverUrl: text('cover_url'), // Profile cover/banner image
  isTrainer: boolean('is_trainer').default(false),
  isAdmin: boolean('is_admin').default(false),
  bio: text('bio'),
  // Social links
  instagramUrl: text('instagram_url'),
  tiktokUrl: text('tiktok_url'),
  youtubeUrl: text('youtube_url'),
  twitterUrl: text('twitter_url'),
  websiteUrl: text('website_url'),
  // Fitness profile
  fitnessGoal: text('fitness_goal'), // lose_weight, build_muscle, maintain, improve_endurance
  targetWeight: real('target_weight'),
  currentWeight: real('current_weight'),
  height: real('height'), // in cm
  dateOfBirth: date('date_of_birth'),
  gender: text('gender'),
  // Trainer specific
  certifications: text('certifications').array(),
  specializations: text('specializations').array(),
  hourlyRate: real('hourly_rate'),
  // Trainer store links
  shopUrl: text('shop_url'), // Main store URL
  amazonStorefront: text('amazon_storefront'),
  supplementStoreUrl: text('supplement_store_url'),
  apparelStoreUrl: text('apparel_store_url'),
  // Gamification
  xp: integer('xp').default(0),
  level: integer('level').default(1),
  currentStreak: integer('current_streak').default(0),
  longestStreak: integer('longest_streak').default(0),
  totalWorkouts: integer('total_workouts').default(0),
  totalMinutes: integer('total_minutes').default(0),
  lastActiveAt: timestamp('last_active_at'),
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

// ============================================
// BODY TRACKING
// ============================================

// Weight tracking history
export const weightLogs = pgTable('weight_logs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  weight: real('weight').notNull(), // in kg or lbs based on user preference
  unit: text('unit').default('kg'), // kg or lbs
  notes: text('notes'),
  loggedAt: timestamp('logged_at').defaultNow(),
});

// Body measurements tracking
export const bodyMeasurements = pgTable('body_measurements', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  chest: real('chest'),
  waist: real('waist'),
  hips: real('hips'),
  leftArm: real('left_arm'),
  rightArm: real('right_arm'),
  leftThigh: real('left_thigh'),
  rightThigh: real('right_thigh'),
  leftCalf: real('left_calf'),
  rightCalf: real('right_calf'),
  neck: real('neck'),
  shoulders: real('shoulders'),
  bodyFatPercent: real('body_fat_percent'),
  unit: text('unit').default('cm'), // cm or inches
  notes: text('notes'),
  measuredAt: timestamp('measured_at').defaultNow(),
});

// Progress photos
export const progressPhotos = pgTable('progress_photos', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  photoUrl: text('photo_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  type: text('type').notNull(), // front, side, back
  weight: real('weight'), // weight at time of photo
  notes: text('notes'),
  isPublic: boolean('is_public').default(false),
  takenAt: timestamp('taken_at').defaultNow(),
});

// Daily logs (daily check-in data)
export const dailyLogs = pgTable('daily_logs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  weight: real('weight'),
  bodyFat: real('body_fat'),
  mood: integer('mood'), // 1-5 scale
  energyLevel: integer('energy_level'), // 1-5 scale
  sleepHours: real('sleep_hours'),
  sleepQuality: integer('sleep_quality'), // 1-5 scale
  waterIntake: real('water_intake'), // liters
  stepsCount: integer('steps_count'),
  notes: text('notes'),
  // Macro totals for the day (calculated from food logs)
  totalCalories: integer('total_calories'),
  totalProtein: real('total_protein'),
  totalCarbs: real('total_carbs'),
  totalFat: real('total_fat'),
  totalFiber: real('total_fiber'),
  // Goals for the day
  calorieGoal: integer('calorie_goal'),
  proteinGoal: real('protein_goal'),
  carbGoal: real('carb_goal'),
  fatGoal: real('fat_goal'),
  // Progress
  workoutsCompleted: integer('workouts_completed').default(0),
  workoutsPlanned: integer('workouts_planned').default(0),
  mealsLogged: integer('meals_logged').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  uniqueUserDate: unique().on(table.userId, table.date),
}));

// ============================================
// CALENDAR & SCHEDULING
// ============================================

// Scheduled workouts (planned workouts)
export const scheduledWorkouts = pgTable('scheduled_workouts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  trainerId: text('trainer_id').references(() => users.id), // If assigned by trainer
  title: text('title').notNull(),
  description: text('description'),
  workoutTemplateId: text('workout_template_id'), // Reference to saved workout
  scheduledFor: timestamp('scheduled_for').notNull(),
  duration: integer('duration'), // Expected duration in minutes
  isRecurring: boolean('is_recurring').default(false),
  recurringPattern: text('recurring_pattern'), // daily, weekly, monthly, custom
  recurringDays: integer('recurring_days').array(), // 0-6 for days of week
  status: text('status').default('scheduled'), // scheduled, completed, skipped, rescheduled
  completedWorkoutId: text('completed_workout_id'), // Link to actual workout if completed
  reminderMinutes: integer('reminder_minutes').default(30), // Reminder before workout
  createdAt: timestamp('created_at').defaultNow(),
});

// Meal plans (scheduled meals)
export const mealPlans = pgTable('meal_plans', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  trainerId: text('trainer_id').references(() => users.id), // If assigned by trainer
  name: text('name').notNull(),
  mealType: text('meal_type').notNull(), // breakfast, lunch, dinner, snack
  scheduledFor: date('scheduled_for').notNull(),
  foods: json('foods'), // Array of food items with portions
  targetCalories: integer('target_calories'),
  targetProtein: real('target_protein'),
  targetCarbs: real('target_carbs'),
  targetFat: real('target_fat'),
  notes: text('notes'),
  isRecurring: boolean('is_recurring').default(false),
  recurringDays: integer('recurring_days').array(),
  status: text('status').default('planned'), // planned, logged, skipped
  completedFoodLogId: text('completed_food_log_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ============================================
// GAMIFICATION
// ============================================

// Achievement definitions
export const achievements = pgTable('achievements', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull().unique(),
  description: text('description').notNull(),
  iconUrl: text('icon_url'),
  iconEmoji: text('icon_emoji'),
  category: text('category').notNull(), // workout, nutrition, streak, social, milestone
  type: text('type').notNull(), // threshold, cumulative, streak, special
  requirement: integer('requirement'), // e.g., 100 for "Complete 100 workouts"
  xpReward: integer('xp_reward').default(100),
  rarity: text('rarity').default('common'), // common, rare, epic, legendary
  isHidden: boolean('is_hidden').default(false), // Secret achievements
  createdAt: timestamp('created_at').defaultNow(),
});

// User's earned achievements
export const userAchievements = pgTable('user_achievements', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  achievementId: text('achievement_id').notNull().references(() => achievements.id),
  earnedAt: timestamp('earned_at').defaultNow(),
  progress: integer('progress').default(0), // For progressive achievements
  isComplete: boolean('is_complete').default(false),
}, (table) => ({
  uniqueUserAchievement: unique().on(table.userId, table.achievementId),
}));

// XP transaction history
export const xpTransactions = pgTable('xp_transactions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(), // Can be negative for penalties
  reason: text('reason').notNull(), // workout_completed, meal_logged, streak_bonus, achievement, etc.
  referenceId: text('reference_id'), // ID of related entity (workout, achievement, etc.)
  referenceType: text('reference_type'), // workout, achievement, challenge, etc.
  createdAt: timestamp('created_at').defaultNow(),
});

// ============================================
// AI & REPORTS
// ============================================

// AI-generated progress reports
export const progressReports = pgTable('progress_reports', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // weekly, monthly, quarterly
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  summary: text('summary'), // AI-generated summary
  highlights: json('highlights'), // Key achievements during period
  workoutStats: json('workout_stats'), // Workouts, minutes, etc.
  nutritionStats: json('nutrition_stats'), // Calories, macros, etc.
  bodyStats: json('body_stats'), // Weight change, measurements
  recommendations: json('recommendations'), // AI suggestions
  goals: json('goals'), // Goals for next period
  overallScore: integer('overall_score'), // 0-100 performance score
  createdAt: timestamp('created_at').defaultNow(),
});

// ============================================
// SOCIAL & COMMUNICATION
// ============================================

// In-app messages (trainer-client, friend-to-friend)
export const messages = pgTable('messages', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  senderId: text('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  receiverId: text('receiver_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  attachmentUrl: text('attachment_url'), // Image, video, workout share, etc.
  attachmentType: text('attachment_type'), // image, video, workout, meal, progress_photo
  isRead: boolean('is_read').default(false),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Notifications
export const notifications = pgTable('notifications', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // friend_request, trainer_invite, achievement, reminder, challenge, message
  title: text('title').notNull(),
  body: text('body'),
  data: json('data'), // Additional data for the notification
  isRead: boolean('is_read').default(false),
  readAt: timestamp('read_at'),
  actionUrl: text('action_url'), // Deep link within app
  createdAt: timestamp('created_at').defaultNow(),
});

// Activity feed (for social features)
export const activityFeed = pgTable('activity_feed', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // workout_completed, meal_logged, achievement_earned, challenge_joined, streak_milestone
  referenceId: text('reference_id'), // ID of related entity
  referenceType: text('reference_type'), // workout, food_log, achievement, challenge
  visibility: text('visibility').default('friends'), // public, friends, private
  likes: integer('likes').default(0),
  comments: integer('comments').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Comments on activity feed
export const activityComments = pgTable('activity_comments', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  activityId: text('activity_id').notNull().references(() => activityFeed.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Likes on activity feed
export const activityLikes = pgTable('activity_likes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  activityId: text('activity_id').notNull().references(() => activityFeed.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  uniqueLike: unique().on(table.activityId, table.userId),
}));

// ============================================
// TRAINER FEATURES
// ============================================

// Workout templates (trainers can create and assign)
export const workoutTemplates = pgTable('workout_templates', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  trainerId: text('trainer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  duration: integer('duration'), // Expected duration in minutes
  fitnessLevel: text('fitness_level'), // beginner, intermediate, advanced
  category: text('category'), // strength, cardio, flexibility, hiit, etc.
  equipment: text('equipment').array(),
  exercises: json('exercises'), // Array of exercise objects
  isPublic: boolean('is_public').default(false), // Can be shared publicly
  usageCount: integer('usage_count').default(0), // How many times assigned
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Trainer notes about clients
export const trainerNotes = pgTable('trainer_notes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  trainerId: text('trainer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  clientId: text('client_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  category: text('category'), // general, medical, goals, progress, behavior
  isPrivate: boolean('is_private').default(true), // Only visible to trainer
  createdAt: timestamp('created_at').defaultNow(),
});

// Trainer products/store items
export const trainerProducts = pgTable('trainer_products', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  trainerId: text('trainer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  productUrl: text('product_url').notNull(), // Link to purchase
  category: text('category').notNull(), // supplements, apparel, equipment, programs, ebooks, other
  price: real('price'),
  currency: text('currency').default('USD'),
  isFeatured: boolean('is_featured').default(false),
  isActive: boolean('is_active').default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// ============================================
// RELATIONS
// ============================================

export const usersRelations = relations(users, ({ many }) => ({
  workouts: many(workouts),
  foodLogs: many(foodLogs),
  dailyStats: many(dailyStats),
  sentFriendships: many(friendships, { relationName: 'sender' }),
  receivedFriendships: many(friendships, { relationName: 'receiver' }),
  createdChallenges: many(challenges),
  challengeParticipations: many(challengeParticipants),
  // New relations
  weightLogs: many(weightLogs),
  bodyMeasurements: many(bodyMeasurements),
  progressPhotos: many(progressPhotos),
  scheduledWorkouts: many(scheduledWorkouts),
  mealPlans: many(mealPlans),
  achievements: many(userAchievements),
  xpTransactions: many(xpTransactions),
  progressReports: many(progressReports),
  sentMessages: many(messages, { relationName: 'sender' }),
  receivedMessages: many(messages, { relationName: 'receiver' }),
  notifications: many(notifications),
  activityFeed: many(activityFeed),
  workoutTemplates: many(workoutTemplates),
  trainerNotes: many(trainerNotes),
  trainerProducts: many(trainerProducts),
}));

export const workoutsRelations = relations(workouts, ({ one, many }) => ({
  user: one(users, {
    fields: [workouts.userId],
    references: [users.id],
  }),
  exercises: many(exercises),
}));

export const exercisesRelations = relations(exercises, ({ one }) => ({
  workout: one(workouts, {
    fields: [exercises.workoutId],
    references: [workouts.id],
  }),
}));

export const foodLogsRelations = relations(foodLogs, ({ one }) => ({
  user: one(users, {
    fields: [foodLogs.userId],
    references: [users.id],
  }),
}));

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  sender: one(users, {
    fields: [friendships.senderId],
    references: [users.id],
    relationName: 'sender',
  }),
  receiver: one(users, {
    fields: [friendships.receiverId],
    references: [users.id],
    relationName: 'receiver',
  }),
}));

export const challengesRelations = relations(challenges, ({ one, many }) => ({
  creator: one(users, {
    fields: [challenges.creatorId],
    references: [users.id],
  }),
  participants: many(challengeParticipants),
}));

export const challengeParticipantsRelations = relations(challengeParticipants, ({ one }) => ({
  challenge: one(challenges, {
    fields: [challengeParticipants.challengeId],
    references: [challenges.id],
  }),
  user: one(users, {
    fields: [challengeParticipants.userId],
    references: [users.id],
  }),
}));

export const dailyStatsRelations = relations(dailyStats, ({ one }) => ({
  user: one(users, {
    fields: [dailyStats.userId],
    references: [users.id],
  }),
}));

// New table relations
export const weightLogsRelations = relations(weightLogs, ({ one }) => ({
  user: one(users, {
    fields: [weightLogs.userId],
    references: [users.id],
  }),
}));

export const bodyMeasurementsRelations = relations(bodyMeasurements, ({ one }) => ({
  user: one(users, {
    fields: [bodyMeasurements.userId],
    references: [users.id],
  }),
}));

export const progressPhotosRelations = relations(progressPhotos, ({ one }) => ({
  user: one(users, {
    fields: [progressPhotos.userId],
    references: [users.id],
  }),
}));

export const scheduledWorkoutsRelations = relations(scheduledWorkouts, ({ one }) => ({
  user: one(users, {
    fields: [scheduledWorkouts.userId],
    references: [users.id],
  }),
  trainer: one(users, {
    fields: [scheduledWorkouts.trainerId],
    references: [users.id],
  }),
}));

export const mealPlansRelations = relations(mealPlans, ({ one }) => ({
  user: one(users, {
    fields: [mealPlans.userId],
    references: [users.id],
  }),
  trainer: one(users, {
    fields: [mealPlans.trainerId],
    references: [users.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id],
  }),
}));

export const xpTransactionsRelations = relations(xpTransactions, ({ one }) => ({
  user: one(users, {
    fields: [xpTransactions.userId],
    references: [users.id],
  }),
}));

export const progressReportsRelations = relations(progressReports, ({ one }) => ({
  user: one(users, {
    fields: [progressReports.userId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: 'sender',
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: 'receiver',
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const activityFeedRelations = relations(activityFeed, ({ one, many }) => ({
  user: one(users, {
    fields: [activityFeed.userId],
    references: [users.id],
  }),
  activityComments: many(activityComments),
  activityLikes: many(activityLikes),
}));

export const activityCommentsRelations = relations(activityComments, ({ one }) => ({
  activity: one(activityFeed, {
    fields: [activityComments.activityId],
    references: [activityFeed.id],
  }),
  user: one(users, {
    fields: [activityComments.userId],
    references: [users.id],
  }),
}));

export const activityLikesRelations = relations(activityLikes, ({ one }) => ({
  activity: one(activityFeed, {
    fields: [activityLikes.activityId],
    references: [activityFeed.id],
  }),
  user: one(users, {
    fields: [activityLikes.userId],
    references: [users.id],
  }),
}));

export const workoutTemplatesRelations = relations(workoutTemplates, ({ one }) => ({
  trainer: one(users, {
    fields: [workoutTemplates.trainerId],
    references: [users.id],
  }),
}));

export const trainerNotesRelations = relations(trainerNotes, ({ one }) => ({
  trainer: one(users, {
    fields: [trainerNotes.trainerId],
    references: [users.id],
  }),
  client: one(users, {
    fields: [trainerNotes.clientId],
    references: [users.id],
  }),
}));

export const trainerProductsRelations = relations(trainerProducts, ({ one }) => ({
  trainer: one(users, {
    fields: [trainerProducts.trainerId],
    references: [users.id],
  }),
}));

// ============================================
// FORM CHECK AI
// ============================================

// Form check video submissions
export const formChecks = pgTable('form_checks', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  trainerId: text('trainer_id').references(() => users.id), // If reviewed by trainer
  exerciseName: text('exercise_name').notNull(),
  videoUrl: text('video_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  duration: integer('duration'), // Video duration in seconds
  status: text('status').default('pending'), // pending, analyzing, reviewed, needs_work, good
  aiAnalysis: json('ai_analysis'), // AI-generated form analysis
  aiScore: integer('ai_score'), // 0-100 form score
  trainerFeedback: text('trainer_feedback'), // Manual trainer notes
  trainerScore: integer('trainer_score'), // Trainer-assigned score
  keyPoints: json('key_points'), // Array of specific form points
  improvements: json('improvements'), // Suggested improvements
  createdAt: timestamp('created_at').defaultNow(),
  reviewedAt: timestamp('reviewed_at'),
});

// ============================================
// RECOVERY & READINESS
// ============================================

// Daily recovery tracking
export const recoveryLogs = pgTable('recovery_logs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  // Sleep data
  sleepHours: real('sleep_hours'),
  sleepQuality: integer('sleep_quality'), // 1-10
  // Subjective metrics
  energyLevel: integer('energy_level'), // 1-10
  motivation: integer('motivation'), // 1-10
  stressLevel: integer('stress_level'), // 1-10
  muscleSoreness: integer('muscle_soreness'), // 1-10
  mood: integer('mood'), // 1-10
  // Wearable data (if connected)
  restingHeartRate: integer('resting_heart_rate'),
  hrv: integer('hrv'), // Heart rate variability
  // Calculated scores
  recoveryScore: integer('recovery_score'), // 0-100 overall readiness
  recommendedIntensity: text('recommended_intensity'), // rest, light, moderate, high, max
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  uniqueUserDate: unique().on(table.userId, table.date),
}));

// ============================================
// CLIENT RISK ALERTS (FOR TRAINERS)
// ============================================

// Client engagement tracking
export const clientEngagement = pgTable('client_engagement', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  trainerId: text('trainer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  clientId: text('client_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  // Engagement metrics
  lastWorkoutAt: timestamp('last_workout_at'),
  lastCheckInAt: timestamp('last_check_in_at'),
  lastMessageAt: timestamp('last_message_at'),
  workoutsLast7Days: integer('workouts_last_7_days').default(0),
  workoutsLast30Days: integer('workouts_last_30_days').default(0),
  averageWorkoutCompletion: real('average_workout_completion'), // Percentage
  missedScheduledWorkouts: integer('missed_scheduled_workouts').default(0),
  // Risk scoring
  riskScore: integer('risk_score').default(0), // 0-100, higher = more at risk
  riskLevel: text('risk_level').default('low'), // low, medium, high, critical
  riskFactors: json('risk_factors'), // Array of risk factors
  // Alert status
  alertSent: boolean('alert_sent').default(false),
  alertSentAt: timestamp('alert_sent_at'),
  alertDismissed: boolean('alert_dismissed').default(false),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  uniqueTrainerClient: unique().on(table.trainerId, table.clientId),
}));

// ============================================
// AUTOMATED CHECK-INS
// ============================================

// Check-in templates (trainer creates)
export const checkInTemplates = pgTable('check_in_templates', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  trainerId: text('trainer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  frequency: text('frequency').notNull(), // daily, weekly, biweekly, monthly
  dayOfWeek: integer('day_of_week'), // 0-6 for weekly
  dayOfMonth: integer('day_of_month'), // 1-31 for monthly
  timeOfDay: text('time_of_day'), // HH:MM format
  // What to collect
  collectWeight: boolean('collect_weight').default(true),
  collectPhotos: boolean('collect_photos').default(true),
  collectMeasurements: boolean('collect_measurements').default(false),
  collectMood: boolean('collect_mood').default(true),
  collectSleep: boolean('collect_sleep').default(true),
  collectNutrition: boolean('collect_nutrition').default(false),
  customQuestions: json('custom_questions'), // Array of custom questions
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Scheduled check-ins
export const scheduledCheckIns = pgTable('scheduled_check_ins', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  templateId: text('template_id').notNull().references(() => checkInTemplates.id, { onDelete: 'cascade' }),
  clientId: text('client_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  trainerId: text('trainer_id').notNull().references(() => users.id),
  scheduledFor: timestamp('scheduled_for').notNull(),
  status: text('status').default('pending'), // pending, completed, missed, skipped
  reminderSent: boolean('reminder_sent').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Check-in responses
export const checkInResponses = pgTable('check_in_responses', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  scheduledCheckInId: text('scheduled_check_in_id').notNull().references(() => scheduledCheckIns.id, { onDelete: 'cascade' }),
  clientId: text('client_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  trainerId: text('trainer_id').notNull().references(() => users.id),
  // Collected data
  weight: real('weight'),
  photoUrls: text('photo_urls').array(),
  measurements: json('measurements'),
  moodScore: integer('mood_score'), // 1-10
  sleepHours: real('sleep_hours'),
  sleepQuality: integer('sleep_quality'), // 1-10
  nutritionNotes: text('nutrition_notes'),
  customAnswers: json('custom_answers'), // Answers to custom questions
  clientNotes: text('client_notes'),
  // Trainer review
  trainerNotes: text('trainer_notes'),
  trainerReviewedAt: timestamp('trainer_reviewed_at'),
  submittedAt: timestamp('submitted_at').defaultNow(),
});

// ============================================
// PROGRAM MARKETPLACE
// ============================================

// Training programs (multi-week structured programs)
export const trainingPrograms = pgTable('training_programs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  trainerId: text('trainer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  longDescription: text('long_description'), // Full sales page content
  coverImageUrl: text('cover_image_url'),
  previewVideoUrl: text('preview_video_url'),
  // Program details
  durationWeeks: integer('duration_weeks').notNull(),
  fitnessLevel: text('fitness_level').notNull(), // beginner, intermediate, advanced
  category: text('category').notNull(), // strength, weight_loss, muscle_building, athletic, etc.
  equipment: text('equipment').array(),
  workoutsPerWeek: integer('workouts_per_week'),
  // Pricing
  price: real('price').notNull(),
  currency: text('currency').default('USD'),
  salePrice: real('sale_price'),
  saleEndsAt: timestamp('sale_ends_at'),
  // Settings
  isDripContent: boolean('is_drip_content').default(true), // Release weeks gradually
  includesNutrition: boolean('includes_nutrition').default(false),
  includesCoaching: boolean('includes_coaching').default(false),
  maxParticipants: integer('max_participants'), // null = unlimited
  // Stats
  totalSales: integer('total_sales').default(0),
  totalRevenue: real('total_revenue').default(0),
  averageRating: real('average_rating'),
  reviewCount: integer('review_count').default(0),
  // Status
  status: text('status').default('draft'), // draft, published, archived
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Program weeks (content for each week)
export const programWeeks = pgTable('program_weeks', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  programId: text('program_id').notNull().references(() => trainingPrograms.id, { onDelete: 'cascade' }),
  weekNumber: integer('week_number').notNull(),
  name: text('name'), // "Week 1: Foundation"
  description: text('description'),
  workouts: json('workouts'), // Array of workout objects
  nutritionPlan: json('nutrition_plan'), // Optional meal plan
  tips: text('tips'), // Coach tips for the week
  videoUrl: text('video_url'), // Optional weekly intro video
  createdAt: timestamp('created_at').defaultNow(),
});

// Program purchases
export const programPurchases = pgTable('program_purchases', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  programId: text('program_id').notNull().references(() => trainingPrograms.id),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  trainerId: text('trainer_id').notNull().references(() => users.id),
  // Purchase details
  pricePaid: real('price_paid').notNull(),
  currency: text('currency').default('USD'),
  paymentMethod: text('payment_method'),
  paymentId: text('payment_id'), // External payment processor ID
  // Progress
  startedAt: timestamp('started_at'),
  currentWeek: integer('current_week').default(1),
  completedWeeks: integer('completed_weeks').array(),
  status: text('status').default('active'), // active, completed, refunded, paused
  completedAt: timestamp('completed_at'),
  // Access control
  accessExpiresAt: timestamp('access_expires_at'), // For limited-time access
  purchasedAt: timestamp('purchased_at').defaultNow(),
}, (table) => ({
  uniquePurchase: unique().on(table.programId, table.userId),
}));

// Program reviews
export const programReviews = pgTable('program_reviews', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  programId: text('program_id').notNull().references(() => trainingPrograms.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(), // 1-5
  title: text('title'),
  review: text('review'),
  isVerifiedPurchase: boolean('is_verified_purchase').default(false),
  helpfulCount: integer('helpful_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  uniqueReview: unique().on(table.programId, table.userId),
}));

// ============================================
// REVENUE & PAYMENTS
// ============================================

// Trainer earnings/transactions
export const trainerEarnings = pgTable('trainer_earnings', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  trainerId: text('trainer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // program_sale, subscription, tip, refund
  amount: real('amount').notNull(),
  currency: text('currency').default('USD'),
  fee: real('fee').default(0), // Platform fee
  netAmount: real('net_amount').notNull(), // After fees
  status: text('status').default('pending'), // pending, completed, failed, refunded
  // Reference
  referenceType: text('reference_type'), // program, subscription, etc.
  referenceId: text('reference_id'),
  clientId: text('client_id').references(() => users.id),
  description: text('description'),
  // Payout
  payoutId: text('payout_id'),
  paidOutAt: timestamp('paid_out_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Monthly revenue snapshots (for dashboard)
export const revenueSnapshots = pgTable('revenue_snapshots', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  trainerId: text('trainer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  month: date('month').notNull(), // First day of month
  // Revenue metrics
  totalRevenue: real('total_revenue').default(0),
  programRevenue: real('program_revenue').default(0),
  subscriptionRevenue: real('subscription_revenue').default(0),
  otherRevenue: real('other_revenue').default(0),
  refunds: real('refunds').default(0),
  netRevenue: real('net_revenue').default(0),
  // Client metrics
  totalClients: integer('total_clients').default(0),
  newClients: integer('new_clients').default(0),
  churnedClients: integer('churned_clients').default(0),
  // Sales metrics
  programsSold: integer('programs_sold').default(0),
  averageOrderValue: real('average_order_value'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  uniqueMonthTrainer: unique().on(table.trainerId, table.month),
}));

// ============================================
// TESTIMONIALS
// ============================================

// Client testimonials
export const testimonials = pgTable('testimonials', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  trainerId: text('trainer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  clientId: text('client_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  // Content
  quote: text('quote').notNull(),
  rating: integer('rating'), // 1-5
  // Before/After
  beforePhotoUrl: text('before_photo_url'),
  afterPhotoUrl: text('after_photo_url'),
  beforeWeight: real('before_weight'),
  afterWeight: real('after_weight'),
  transformationDuration: text('transformation_duration'), // "3 months", "6 weeks", etc.
  // Details
  programId: text('program_id').references(() => trainingPrograms.id),
  category: text('category'), // weight_loss, muscle_gain, strength, athletic, lifestyle
  // Display settings
  displayName: text('display_name'), // Can be anonymous or real name
  isAnonymous: boolean('is_anonymous').default(false),
  isApproved: boolean('is_approved').default(false),
  isFeatured: boolean('is_featured').default(false),
  // Social sharing
  shareableImageUrl: text('shareable_image_url'), // Auto-generated image for social
  sharedToInstagram: boolean('shared_to_instagram').default(false),
  sharedToWebsite: boolean('shared_to_website').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  approvedAt: timestamp('approved_at'),
});

// Testimonial requests
export const testimonialRequests = pgTable('testimonial_requests', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  trainerId: text('trainer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  clientId: text('client_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  message: text('message'), // Custom request message
  status: text('status').default('pending'), // pending, completed, declined, expired
  requestedAt: timestamp('requested_at').defaultNow(),
  respondedAt: timestamp('responded_at'),
  testimonialId: text('testimonial_id').references(() => testimonials.id),
});

// ============================================
// AI PROGRAMMING ASSISTANT
// ============================================

// AI-generated program drafts
export const aiProgramDrafts = pgTable('ai_program_drafts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  trainerId: text('trainer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  clientId: text('client_id').references(() => users.id), // If generating for specific client
  // Input parameters
  prompt: text('prompt'), // What trainer asked for
  clientProfile: json('client_profile'), // Client details for personalization
  goals: text('goals').array(),
  duration: integer('duration'), // Weeks
  daysPerWeek: integer('days_per_week'),
  equipment: text('equipment').array(),
  restrictions: text('restrictions').array(), // Injuries, limitations
  // Generated content
  generatedProgram: json('generated_program'), // Full program structure
  generatedAt: timestamp('generated_at').defaultNow(),
  // Usage
  status: text('status').default('draft'), // draft, accepted, rejected, modified
  acceptedAt: timestamp('accepted_at'),
  resultingProgramId: text('resulting_program_id').references(() => trainingPrograms.id),
  resultingTemplateId: text('resulting_template_id').references(() => workoutTemplates.id),
});

// ============================================
// TYPES FOR TYPESCRIPT
// ============================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Workout = typeof workouts.$inferSelect;
export type NewWorkout = typeof workouts.$inferInsert;
export type Exercise = typeof exercises.$inferSelect;
export type FoodLog = typeof foodLogs.$inferSelect;
export type Challenge = typeof challenges.$inferSelect;
export type WeightLog = typeof weightLogs.$inferSelect;
export type BodyMeasurement = typeof bodyMeasurements.$inferSelect;
export type ProgressPhoto = typeof progressPhotos.$inferSelect;
export type DailyLog = typeof dailyLogs.$inferSelect;
export type ScheduledWorkout = typeof scheduledWorkouts.$inferSelect;
export type MealPlan = typeof mealPlans.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type XpTransaction = typeof xpTransactions.$inferSelect;
export type ProgressReport = typeof progressReports.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type ActivityFeedItem = typeof activityFeed.$inferSelect;
export type WorkoutTemplate = typeof workoutTemplates.$inferSelect;
export type TrainerNote = typeof trainerNotes.$inferSelect;
export type TrainerProduct = typeof trainerProducts.$inferSelect;
// New feature types
export type FormCheck = typeof formChecks.$inferSelect;
export type RecoveryLog = typeof recoveryLogs.$inferSelect;
export type ClientEngagement = typeof clientEngagement.$inferSelect;
export type CheckInTemplate = typeof checkInTemplates.$inferSelect;
export type ScheduledCheckIn = typeof scheduledCheckIns.$inferSelect;
export type CheckInResponse = typeof checkInResponses.$inferSelect;
export type TrainingProgram = typeof trainingPrograms.$inferSelect;
export type ProgramWeek = typeof programWeeks.$inferSelect;
export type ProgramPurchase = typeof programPurchases.$inferSelect;
export type ProgramReview = typeof programReviews.$inferSelect;
export type TrainerEarning = typeof trainerEarnings.$inferSelect;
export type RevenueSnapshot = typeof revenueSnapshots.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;
export type TestimonialRequest = typeof testimonialRequests.$inferSelect;
export type AiProgramDraft = typeof aiProgramDrafts.$inferSelect;
