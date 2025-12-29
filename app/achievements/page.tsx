'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Trophy,
  Medal,
  Star,
  Crown,
  Zap,
  Flame,
  ArrowLeft,
  Loader2,
  Lock,
  CheckCircle2,
  TrendingUp,
  Filter,
  Sparkles,
} from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  iconEmoji?: string;
  category: string;
  type: string;
  requirement?: number;
  xpReward: number;
  rarity: string;
  isHidden: boolean;
  earnedAt?: string;
  isComplete: boolean;
  progress: number;
}

interface UserStats {
  xp: number;
  level: number;
  totalWorkouts: number;
  currentStreak: number;
  longestStreak: number;
}

const RARITY_STYLES: Record<string, { gradient: string; bg: string; border: string; glow: string }> = {
  common: {
    gradient: 'from-gray-400 to-gray-500',
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/30',
    glow: '',
  },
  rare: {
    gradient: 'from-blue-400 to-blue-600',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    glow: 'shadow-blue-500/20',
  },
  epic: {
    gradient: 'from-purple-400 to-purple-600',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    glow: 'shadow-purple-500/20',
  },
  legendary: {
    gradient: 'from-amber-400 via-orange-500 to-yellow-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    glow: 'shadow-amber-500/30 shadow-lg',
  },
};

const CATEGORY_ICONS: Record<string, typeof Trophy> = {
  workout: Flame,
  nutrition: Star,
  streak: Zap,
  social: Trophy,
  milestone: Crown,
  special: Sparkles,
};

const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000,
  15000, 20000, 27000, 35000, 45000, 60000, 80000, 105000, 140000, 200000,
];

function getLevelProgress(xp: number, level: number): number {
  if (level >= LEVEL_THRESHOLDS.length) return 100;
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[level - 1];
  const progress = ((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  return Math.min(Math.max(progress, 0), 100);
}

export default function AchievementsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'earned' | 'locked'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [achievementsRes, profileRes] = await Promise.all([
        fetch('/api/achievements'),
        fetch('/api/profile'),
      ]);

      const [achievementsData, profileData] = await Promise.all([
        achievementsRes.json(),
        profileRes.json(),
      ]);

      setAchievements(achievementsData.achievements || []);
      if (profileData.user) {
        setUserStats({
          xp: profileData.user.xp || 0,
          level: profileData.user.level || 1,
          totalWorkouts: profileData.user.totalWorkouts || 0,
          currentStreak: profileData.user.currentStreak || 0,
          longestStreak: profileData.user.longestStreak || 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <p className="text-zinc-500 dark:text-zinc-400">Loading achievements...</p>
        </div>
      </div>
    );
  }

  const categories = ['all', ...new Set(achievements.map(a => a.category))];
  const filteredAchievements = achievements.filter(a => {
    if (filter === 'earned' && !a.isComplete) return false;
    if (filter === 'locked' && a.isComplete) return false;
    if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
    if (a.isHidden && !a.isComplete) return false;
    return true;
  });

  const earnedCount = achievements.filter(a => a.isComplete).length;
  const totalXPEarned = achievements
    .filter(a => a.isComplete)
    .reduce((sum, a) => sum + a.xpReward, 0);

  const levelProgress = userStats ? getLevelProgress(userStats.xp, userStats.level) : 0;

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-lg border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold">Achievements</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Stats Overview */}
        {userStats && (
          <div className="mb-8">
            <div className="p-6 bg-gradient-to-br from-orange-500/10 to-pink-500/10 rounded-2xl border border-orange-500/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">Level {userStats.level}</h2>
                    <span className="px-2 py-0.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold rounded-full">
                      {userStats.xp.toLocaleString()} XP
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all duration-500"
                        style={{ width: `${levelProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      {Math.round(levelProgress)}% to Level {userStats.level + 1}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-xl">
                  <p className="text-2xl font-bold text-orange-500">{earnedCount}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Earned</p>
                </div>
                <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-xl">
                  <p className="text-2xl font-bold text-pink-500">{achievements.length}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Total</p>
                </div>
                <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-xl">
                  <p className="text-2xl font-bold text-amber-500">{totalXPEarned.toLocaleString()}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">XP Earned</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
            {(['all', 'earned', 'locked'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-white dark:bg-zinc-800 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {f === 'all' ? 'All' : f === 'earned' ? 'Earned' : 'Locked'}
              </button>
            ))}
          </div>

          <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg overflow-x-auto">
            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat] || Trophy;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    categoryFilter === cat
                      ? 'bg-white dark:bg-zinc-800 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  {cat !== 'all' && <Icon className="w-3.5 h-3.5" />}
                  {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Achievement Count */}
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
          Showing {filteredAchievements.length} achievement{filteredAchievements.length !== 1 ? 's' : ''}
        </p>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredAchievements.map((achievement) => {
            const rarityStyle = RARITY_STYLES[achievement.rarity] || RARITY_STYLES.common;
            const CategoryIcon = CATEGORY_ICONS[achievement.category] || Trophy;

            return (
              <div
                key={achievement.id}
                className={`relative p-5 rounded-2xl border transition-all ${
                  achievement.isComplete
                    ? `${rarityStyle.bg} ${rarityStyle.border} ${rarityStyle.glow}`
                    : 'bg-zinc-100 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800 opacity-70'
                }`}
              >
                {/* Rarity Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${rarityStyle.gradient} text-white font-medium`}>
                    {achievement.rarity}
                  </span>
                </div>

                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`relative ${!achievement.isComplete ? 'grayscale opacity-50' : ''}`}>
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl ${
                      achievement.isComplete
                        ? `bg-gradient-to-br ${rarityStyle.gradient}`
                        : 'bg-zinc-200 dark:bg-zinc-800'
                    }`}>
                      {achievement.iconEmoji || '🏆'}
                    </div>
                    {achievement.isComplete && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {!achievement.isComplete && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-zinc-400 dark:bg-zinc-600 rounded-full flex items-center justify-center">
                        <Lock className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <CategoryIcon className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">
                        {achievement.category}
                      </span>
                    </div>
                    <h3 className="font-semibold mt-1">{achievement.name}</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                      {achievement.description}
                    </p>

                    {/* Progress */}
                    {!achievement.isComplete && achievement.progress > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-zinc-500 dark:text-zinc-400">Progress</span>
                          <span className="font-medium">{achievement.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${rarityStyle.gradient} transition-all`}
                            style={{ width: `${achievement.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* XP Reward */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1 text-amber-500">
                        <Zap className="w-4 h-4" />
                        <span className="text-sm font-medium">+{achievement.xpReward} XP</span>
                      </div>
                      {achievement.isComplete && achievement.earnedAt && (
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          {new Date(achievement.earnedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No achievements found</h3>
            <p className="text-zinc-500 dark:text-zinc-400">
              {filter === 'earned'
                ? "You haven't earned any achievements yet. Keep working out!"
                : filter === 'locked'
                  ? "You've unlocked all achievements in this category!"
                  : 'Try changing your filters.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
