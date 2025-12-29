// Achievement definitions to seed the database
// Run this once to populate the achievements table

export interface AchievementSeed {
  name: string;
  description: string;
  iconEmoji: string;
  category: 'workout' | 'nutrition' | 'streak' | 'social' | 'milestone';
  type: 'threshold' | 'cumulative' | 'streak' | 'special';
  requirement: number;
  xpReward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isHidden?: boolean;
}

export const ACHIEVEMENTS_SEED: AchievementSeed[] = [
  // ============================================
  // WORKOUT ACHIEVEMENTS
  // ============================================
  {
    name: 'First Steps',
    description: 'Complete your first workout',
    iconEmoji: '👟',
    category: 'workout',
    type: 'threshold',
    requirement: 1,
    xpReward: 50,
    rarity: 'common',
  },
  {
    name: 'Getting Started',
    description: 'Complete 5 workouts',
    iconEmoji: '🏃',
    category: 'workout',
    type: 'cumulative',
    requirement: 5,
    xpReward: 100,
    rarity: 'common',
  },
  {
    name: 'Workout Warrior',
    description: 'Complete 25 workouts',
    iconEmoji: '⚔️',
    category: 'workout',
    type: 'cumulative',
    requirement: 25,
    xpReward: 250,
    rarity: 'rare',
  },
  {
    name: 'Fitness Fanatic',
    description: 'Complete 50 workouts',
    iconEmoji: '🔥',
    category: 'workout',
    type: 'cumulative',
    requirement: 50,
    xpReward: 500,
    rarity: 'rare',
  },
  {
    name: 'Iron Will',
    description: 'Complete 100 workouts',
    iconEmoji: '🦾',
    category: 'workout',
    type: 'cumulative',
    requirement: 100,
    xpReward: 1000,
    rarity: 'epic',
  },
  {
    name: 'Legendary Athlete',
    description: 'Complete 250 workouts',
    iconEmoji: '🏆',
    category: 'workout',
    type: 'cumulative',
    requirement: 250,
    xpReward: 2500,
    rarity: 'legendary',
  },
  {
    name: 'Hour Power',
    description: 'Complete 60 minutes of exercise',
    iconEmoji: '⏱️',
    category: 'workout',
    type: 'cumulative',
    requirement: 60,
    xpReward: 100,
    rarity: 'common',
  },
  {
    name: 'Marathon Mentality',
    description: 'Complete 500 minutes of exercise',
    iconEmoji: '🎽',
    category: 'workout',
    type: 'cumulative',
    requirement: 500,
    xpReward: 300,
    rarity: 'rare',
  },
  {
    name: 'Time Lord',
    description: 'Complete 2000 minutes of exercise',
    iconEmoji: '⌛',
    category: 'workout',
    type: 'cumulative',
    requirement: 2000,
    xpReward: 1000,
    rarity: 'epic',
  },
  {
    name: 'Early Bird',
    description: 'Complete a workout before 7 AM',
    iconEmoji: '🌅',
    category: 'workout',
    type: 'special',
    requirement: 1,
    xpReward: 150,
    rarity: 'rare',
  },
  {
    name: 'Night Owl',
    description: 'Complete a workout after 10 PM',
    iconEmoji: '🦉',
    category: 'workout',
    type: 'special',
    requirement: 1,
    xpReward: 150,
    rarity: 'rare',
  },

  // ============================================
  // NUTRITION ACHIEVEMENTS
  // ============================================
  {
    name: 'Food Logger',
    description: 'Log your first meal',
    iconEmoji: '🍽️',
    category: 'nutrition',
    type: 'threshold',
    requirement: 1,
    xpReward: 50,
    rarity: 'common',
  },
  {
    name: 'Mindful Eater',
    description: 'Log 10 meals',
    iconEmoji: '🥗',
    category: 'nutrition',
    type: 'cumulative',
    requirement: 10,
    xpReward: 100,
    rarity: 'common',
  },
  {
    name: 'Nutrition Ninja',
    description: 'Log 50 meals',
    iconEmoji: '🥋',
    category: 'nutrition',
    type: 'cumulative',
    requirement: 50,
    xpReward: 250,
    rarity: 'rare',
  },
  {
    name: 'Calorie Counter',
    description: 'Log 100 meals',
    iconEmoji: '📊',
    category: 'nutrition',
    type: 'cumulative',
    requirement: 100,
    xpReward: 500,
    rarity: 'rare',
  },
  {
    name: 'Macro Master',
    description: 'Log 250 meals',
    iconEmoji: '🧬',
    category: 'nutrition',
    type: 'cumulative',
    requirement: 250,
    xpReward: 1000,
    rarity: 'epic',
  },
  {
    name: 'Full Day Tracker',
    description: 'Log breakfast, lunch, and dinner in one day',
    iconEmoji: '📅',
    category: 'nutrition',
    type: 'special',
    requirement: 3,
    xpReward: 100,
    rarity: 'common',
  },
  {
    name: 'Protein Power',
    description: 'Log 100g+ protein in a single day',
    iconEmoji: '💪',
    category: 'nutrition',
    type: 'special',
    requirement: 100,
    xpReward: 200,
    rarity: 'rare',
  },

  // ============================================
  // STREAK ACHIEVEMENTS
  // ============================================
  {
    name: 'Consistency is Key',
    description: 'Maintain a 3-day streak',
    iconEmoji: '🔑',
    category: 'streak',
    type: 'streak',
    requirement: 3,
    xpReward: 100,
    rarity: 'common',
  },
  {
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    iconEmoji: '📆',
    category: 'streak',
    type: 'streak',
    requirement: 7,
    xpReward: 250,
    rarity: 'rare',
  },
  {
    name: 'Two Week Titan',
    description: 'Maintain a 14-day streak',
    iconEmoji: '🗓️',
    category: 'streak',
    type: 'streak',
    requirement: 14,
    xpReward: 500,
    rarity: 'rare',
  },
  {
    name: 'Monthly Monster',
    description: 'Maintain a 30-day streak',
    iconEmoji: '👹',
    category: 'streak',
    type: 'streak',
    requirement: 30,
    xpReward: 1000,
    rarity: 'epic',
  },
  {
    name: 'Unstoppable',
    description: 'Maintain a 60-day streak',
    iconEmoji: '🚀',
    category: 'streak',
    type: 'streak',
    requirement: 60,
    xpReward: 2000,
    rarity: 'epic',
  },
  {
    name: 'Legendary Streak',
    description: 'Maintain a 100-day streak',
    iconEmoji: '👑',
    category: 'streak',
    type: 'streak',
    requirement: 100,
    xpReward: 5000,
    rarity: 'legendary',
  },
  {
    name: 'Year of Dedication',
    description: 'Maintain a 365-day streak',
    iconEmoji: '🎖️',
    category: 'streak',
    type: 'streak',
    requirement: 365,
    xpReward: 10000,
    rarity: 'legendary',
  },

  // ============================================
  // SOCIAL ACHIEVEMENTS
  // ============================================
  {
    name: 'Social Butterfly',
    description: 'Add your first friend',
    iconEmoji: '🦋',
    category: 'social',
    type: 'threshold',
    requirement: 1,
    xpReward: 50,
    rarity: 'common',
  },
  {
    name: 'Squad Goals',
    description: 'Have 5 friends',
    iconEmoji: '👥',
    category: 'social',
    type: 'cumulative',
    requirement: 5,
    xpReward: 150,
    rarity: 'rare',
  },
  {
    name: 'Fitness Influencer',
    description: 'Have 20 friends',
    iconEmoji: '🌟',
    category: 'social',
    type: 'cumulative',
    requirement: 20,
    xpReward: 500,
    rarity: 'epic',
  },
  {
    name: 'Challenge Accepted',
    description: 'Join your first challenge',
    iconEmoji: '🎯',
    category: 'social',
    type: 'threshold',
    requirement: 1,
    xpReward: 100,
    rarity: 'common',
  },
  {
    name: 'Challenge Creator',
    description: 'Create your first challenge',
    iconEmoji: '🏗️',
    category: 'social',
    type: 'threshold',
    requirement: 1,
    xpReward: 150,
    rarity: 'rare',
  },
  {
    name: 'Champion',
    description: 'Win a challenge',
    iconEmoji: '🥇',
    category: 'social',
    type: 'threshold',
    requirement: 1,
    xpReward: 500,
    rarity: 'epic',
  },

  // ============================================
  // MILESTONE ACHIEVEMENTS
  // ============================================
  {
    name: 'Profile Complete',
    description: 'Fill out your entire profile',
    iconEmoji: '✅',
    category: 'milestone',
    type: 'special',
    requirement: 1,
    xpReward: 100,
    rarity: 'common',
  },
  {
    name: 'Transformation Journey',
    description: 'Upload your first progress photo',
    iconEmoji: '📸',
    category: 'milestone',
    type: 'threshold',
    requirement: 1,
    xpReward: 100,
    rarity: 'common',
  },
  {
    name: 'Before & After',
    description: 'Upload 10 progress photos',
    iconEmoji: '🖼️',
    category: 'milestone',
    type: 'cumulative',
    requirement: 10,
    xpReward: 300,
    rarity: 'rare',
  },
  {
    name: 'Weight Watcher',
    description: 'Log your weight for 7 consecutive days',
    iconEmoji: '⚖️',
    category: 'milestone',
    type: 'streak',
    requirement: 7,
    xpReward: 200,
    rarity: 'rare',
  },
  {
    name: 'Goal Getter',
    description: 'Reach your target weight',
    iconEmoji: '🎯',
    category: 'milestone',
    type: 'special',
    requirement: 1,
    xpReward: 1000,
    rarity: 'legendary',
  },
  {
    name: 'Level Up!',
    description: 'Reach level 5',
    iconEmoji: '⬆️',
    category: 'milestone',
    type: 'threshold',
    requirement: 5,
    xpReward: 250,
    rarity: 'rare',
  },
  {
    name: 'Elite Status',
    description: 'Reach level 10',
    iconEmoji: '💎',
    category: 'milestone',
    type: 'threshold',
    requirement: 10,
    xpReward: 500,
    rarity: 'epic',
  },
  {
    name: 'Grandmaster',
    description: 'Reach level 25',
    iconEmoji: '🔮',
    category: 'milestone',
    type: 'threshold',
    requirement: 25,
    xpReward: 2500,
    rarity: 'legendary',
  },

  // ============================================
  // HIDDEN/SECRET ACHIEVEMENTS
  // ============================================
  {
    name: 'Weekend Warrior',
    description: 'Work out on both Saturday and Sunday',
    iconEmoji: '🎉',
    category: 'workout',
    type: 'special',
    requirement: 2,
    xpReward: 150,
    rarity: 'rare',
    isHidden: true,
  },
  {
    name: 'New Year, New Me',
    description: 'Complete a workout on January 1st',
    iconEmoji: '🎆',
    category: 'workout',
    type: 'special',
    requirement: 1,
    xpReward: 300,
    rarity: 'epic',
    isHidden: true,
  },
  {
    name: 'Comeback Kid',
    description: 'Return after 30+ days of inactivity',
    iconEmoji: '🔙',
    category: 'milestone',
    type: 'special',
    requirement: 1,
    xpReward: 200,
    rarity: 'rare',
    isHidden: true,
  },
];

// XP required for each level
export function getXpForLevel(level: number): number {
  return level * 500;
}

// Calculate level from XP
export function getLevelFromXp(xp: number): number {
  let level = 1;
  let xpNeeded = 0;
  while (xp >= xpNeeded + getXpForLevel(level)) {
    xpNeeded += getXpForLevel(level);
    level++;
  }
  return level;
}

// Get level title based on level
export function getLevelTitle(level: number): string {
  if (level >= 50) return 'Legendary Champion';
  if (level >= 40) return 'Grandmaster';
  if (level >= 30) return 'Elite Athlete';
  if (level >= 25) return 'Master';
  if (level >= 20) return 'Expert';
  if (level >= 15) return 'Veteran';
  if (level >= 10) return 'Skilled';
  if (level >= 5) return 'Intermediate';
  if (level >= 2) return 'Beginner';
  return 'Newbie';
}
