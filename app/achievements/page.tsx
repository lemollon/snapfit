'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Trophy,
  Crown,
  Zap,
  Flame,
  ArrowLeft,
  Loader2,
  Lock,
  CheckCircle2,
  Star,
  Sparkles,
  Medal,
  Target,
  Award,
} from 'lucide-react';
import { AchievementIcon } from '@/components/achievement-icon';

// Premium stock image
const HERO_IMAGE = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&auto=format&fit=crop&q=80';

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

const RARITY_STYLES: Record<string, { gradient: string; bg: string; border: string; glow: string; text: string }> = {
  common: {
    gradient: 'from-slate-400 to-slate-500',
    bg: 'from-slate-500/20 to-slate-600/10',
    border: 'border-slate-500/30',
    glow: '',
    text: 'text-slate-400',
  },
  rare: {
    gradient: 'from-blue-400 to-cyan-500',
    bg: 'from-blue-500/20 to-cyan-500/10',
    border: 'border-blue-500/30',
    glow: 'shadow-lg shadow-blue-500/20',
    text: 'text-blue-400',
  },
  epic: {
    gradient: 'from-purple-400 to-pink-500',
    bg: 'from-purple-500/20 to-pink-500/10',
    border: 'border-purple-500/30',
    glow: 'shadow-lg shadow-purple-500/20',
    text: 'text-purple-400',
  },
  legendary: {
    gradient: 'from-amber-400 via-orange-500 to-yellow-400',
    bg: 'from-amber-500/20 to-orange-500/10',
    border: 'border-amber-500/40',
    glow: 'shadow-xl shadow-amber-500/30',
    text: 'text-amber-400',
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center animate-pulse">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-400">Loading achievements...</p>
        </div>
      </div>
    );
  }

  const categories = ['all', ...Array.from(new Set(achievements.map(a => a.category)))];
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Header */}
      <div className="relative">
        <div
          className="h-64 bg-cover bg-center"
          style={{ backgroundImage: `url("${HERO_IMAGE}")` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-slate-900" />
        </div>

        {/* Back Button */}
        <div className="absolute top-4 left-4">
          <Link
            href="/"
            className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 pb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg shadow-amber-500/20">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Achievements</h1>
          </div>
          <p className="text-white/70">Unlock rewards as you progress</p>
        </div>
      </div>

      <div className="px-4 -mt-2">
        {/* Level Card */}
        {userStats && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 backdrop-blur-xl border border-amber-500/20 p-6 mb-6">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-500/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-yellow-500 flex items-center justify-center shadow-2xl shadow-amber-500/30">
                  <Crown className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-bold text-white">Level {userStats.level}</h2>
                    <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold rounded-full shadow-lg shadow-amber-500/20">
                      {userStats.xp.toLocaleString()} XP
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="h-3 bg-black/20 rounded-full overflow-hidden backdrop-blur">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500 transition-all duration-500 relative"
                        style={{ width: `${levelProgress}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20" />
                      </div>
                    </div>
                    <p className="text-sm text-amber-300/80 mt-2">
                      {Math.round(levelProgress)}% to Level {userStats.level + 1}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="text-center p-4 bg-white/5 backdrop-blur rounded-2xl border border-white/10">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-2">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-white">{earnedCount}</p>
                  <p className="text-xs text-gray-400">Earned</p>
                </div>
                <div className="text-center p-4 bg-white/5 backdrop-blur rounded-2xl border border-white/10">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mx-auto mb-2">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-white">{achievements.length}</p>
                  <p className="text-xs text-gray-400">Total</p>
                </div>
                <div className="text-center p-4 bg-white/5 backdrop-blur rounded-2xl border border-white/10">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-2">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-white">{totalXPEarned.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">XP Earned</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="space-y-3 mb-6">
          {/* Status Filter */}
          <div className="flex gap-2 p-1.5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
            {(['all', 'earned', 'locked'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  filter === f
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {f === 'all' ? 'All' : f === 'earned' ? 'Earned' : 'Locked'}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat] || Trophy;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                    categoryFilter === cat
                      ? 'bg-white/10 text-white border border-white/20'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {cat !== 'all' && <Icon className="w-4 h-4" />}
                  {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Count */}
        <p className="text-sm text-gray-500 mb-4">
          Showing {filteredAchievements.length} achievement{filteredAchievements.length !== 1 ? 's' : ''}
        </p>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 gap-4 pb-8">
          {filteredAchievements.map((achievement) => {
            const rarityStyle = RARITY_STYLES[achievement.rarity] || RARITY_STYLES.common;
            const CategoryIcon = CATEGORY_ICONS[achievement.category] || Trophy;

            return (
              <div
                key={achievement.id}
                className={`relative overflow-hidden rounded-2xl backdrop-blur-xl border transition-all ${
                  achievement.isComplete
                    ? `bg-gradient-to-br ${rarityStyle.bg} ${rarityStyle.border} ${rarityStyle.glow}`
                    : 'bg-white/5 border-white/10 opacity-60'
                }`}
              >
                {/* Rarity Glow Effect for completed */}
                {achievement.isComplete && achievement.rarity === 'legendary' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-orange-500/10 animate-pulse" />
                )}

                <div className="relative p-5">
                  {/* Rarity Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`text-xs px-3 py-1 rounded-full bg-gradient-to-r ${rarityStyle.gradient} text-white font-semibold uppercase tracking-wide`}>
                      {achievement.rarity}
                    </span>
                  </div>

                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="relative">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${rarityStyle.gradient} flex items-center justify-center shadow-lg ${achievement.isComplete ? rarityStyle.glow : ''}`}>
                        <AchievementIcon
                          category={achievement.category}
                          rarity={achievement.rarity}
                          isComplete={achievement.isComplete}
                          size="lg"
                        />
                      </div>
                      {achievement.isComplete ? (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center border-2 border-slate-900">
                          <Lock className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-16">
                      <div className="flex items-center gap-2 mb-1">
                        <CategoryIcon className={`w-3.5 h-3.5 ${rarityStyle.text}`} />
                        <span className={`text-xs font-medium capitalize ${rarityStyle.text}`}>
                          {achievement.category}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-white">{achievement.name}</h3>
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                        {achievement.description}
                      </p>

                      {/* Progress Bar */}
                      {!achievement.isComplete && achievement.progress > 0 && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-gray-500">Progress</span>
                            <span className={`font-semibold ${rarityStyle.text}`}>{achievement.progress}%</span>
                          </div>
                          <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${rarityStyle.gradient} transition-all relative`}
                              style={{ width: `${achievement.progress}%` }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-4">
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${achievement.isComplete ? 'bg-amber-500/20' : 'bg-white/5'}`}>
                          <Zap className={`w-4 h-4 ${achievement.isComplete ? 'text-amber-400' : 'text-gray-500'}`} />
                          <span className={`text-sm font-semibold ${achievement.isComplete ? 'text-amber-400' : 'text-gray-500'}`}>
                            +{achievement.xpReward} XP
                          </span>
                        </div>
                        {achievement.isComplete && achievement.earnedAt && (
                          <span className="text-xs text-gray-500">
                            Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredAchievements.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-amber-500/50" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No achievements found</h3>
            <p className="text-gray-500 max-w-xs mx-auto">
              {filter === 'earned'
                ? "You haven't earned any achievements yet. Keep working out!"
                : filter === 'locked'
                  ? "Amazing! You've unlocked all achievements in this category!"
                  : 'Try changing your filters to see more.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
