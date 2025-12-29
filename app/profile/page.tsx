'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Camera,
  Edit3,
  Save,
  X,
  Instagram,
  Youtube,
  Twitter,
  Globe,
  MapPin,
  Award,
  Flame,
  Dumbbell,
  Clock,
  TrendingUp,
  Target,
  Scale,
  Ruler,
  Calendar,
  Star,
  Medal,
  Crown,
  Zap,
  Trophy,
  Heart,
  ChevronRight,
  Loader2,
  ArrowLeft,
  Share2,
  Settings,
  BarChart3,
  Users,
  Sun,
  Moon,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useTheme } from '@/lib/theme-context';
import { AchievementIcon, AvatarPlaceholder } from '@/components/achievement-icon';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  coverUrl?: string;
  bio?: string;
  location?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  fitnessGoal?: string;
  targetWeight?: number;
  currentWeight?: number;
  height?: number;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  totalWorkouts: number;
  totalMinutes: number;
  isTrainer?: boolean;
  certifications?: string[];
  specializations?: string[];
  hourlyRate?: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  iconEmoji?: string;
  category: string;
  rarity: string;
  earnedAt?: string;
  isComplete: boolean;
  progress: number;
}

interface WeightLog {
  id: string;
  weight: number;
  unit: string;
  loggedAt: string;
}

const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000,
  15000, 20000, 27000, 35000, 45000, 60000, 80000, 105000, 140000, 200000,
];

const LEVEL_TITLES = [
  'Newcomer', 'Beginner', 'Trainee', 'Regular', 'Dedicated',
  'Committed', 'Warrior', 'Champion', 'Elite', 'Master',
  'Legend', 'Titan', 'Hero', 'Mythic', 'Immortal',
  'Demigod', 'God', 'Transcendent', 'Infinite', 'Supreme',
];

const RARITY_COLORS: Record<string, string> = {
  common: 'from-gray-400 to-gray-500',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-amber-400 to-orange-500',
};

const RARITY_BG: Record<string, string> = {
  common: 'bg-gray-500/20 border-gray-500/30',
  rare: 'bg-blue-500/20 border-blue-500/30',
  epic: 'bg-purple-500/20 border-purple-500/30',
  legendary: 'bg-amber-500/20 border-amber-500/30',
};

function getLevelProgress(xp: number, level: number): number {
  if (level >= LEVEL_THRESHOLDS.length) return 100;
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[level - 1];
  const progress = ((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  return Math.min(Math.max(progress, 0), 100);
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'progress' | 'settings'>('overview');

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    location: '',
    instagramUrl: '',
    tiktokUrl: '',
    youtubeUrl: '',
    twitterUrl: '',
    websiteUrl: '',
    fitnessGoal: '',
    targetWeight: '',
    height: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchProfile();
      fetchAchievements();
      fetchWeightLogs();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();
      if (data.user) {
        setProfile(data.user);
        setEditForm({
          name: data.user.name || '',
          bio: data.user.bio || '',
          location: data.user.location || '',
          instagramUrl: data.user.instagramUrl || '',
          tiktokUrl: data.user.tiktokUrl || '',
          youtubeUrl: data.user.youtubeUrl || '',
          twitterUrl: data.user.twitterUrl || '',
          websiteUrl: data.user.websiteUrl || '',
          fitnessGoal: data.user.fitnessGoal || '',
          targetWeight: data.user.targetWeight?.toString() || '',
          height: data.user.height?.toString() || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAchievements = async () => {
    try {
      const res = await fetch('/api/achievements');
      const data = await res.json();
      setAchievements(data.achievements || []);
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    }
  };

  const fetchWeightLogs = async () => {
    try {
      const res = await fetch('/api/body/weight?limit=30');
      const data = await res.json();
      setWeightLogs(data.logs || []);
    } catch (error) {
      console.error('Failed to fetch weight logs:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          bio: editForm.bio,
          location: editForm.location,
          instagramUrl: editForm.instagramUrl,
          tiktokUrl: editForm.tiktokUrl,
          youtubeUrl: editForm.youtubeUrl,
          twitterUrl: editForm.twitterUrl,
          websiteUrl: editForm.websiteUrl,
          fitnessGoal: editForm.fitnessGoal,
          targetWeight: editForm.targetWeight ? parseFloat(editForm.targetWeight) : null,
          height: editForm.height ? parseFloat(editForm.height) : null,
        }),
      });
      const data = await res.json();
      if (data.user) {
        setProfile(data.user);
        setEditing(false);
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (type: 'avatar' | 'cover', file: File) => {
    // For now, we'll use a placeholder. In production, you'd upload to S3/Cloudinary
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const res = await fetch('/api/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            [type === 'avatar' ? 'avatarUrl' : 'coverUrl']: base64,
          }),
        });
        const data = await res.json();
        if (data.user) {
          setProfile(data.user);
        }
      } catch (error) {
        console.error(`Failed to upload ${type}:`, error);
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <p className="text-zinc-500 dark:text-zinc-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <p className="text-zinc-500 dark:text-zinc-400">Profile not found</p>
      </div>
    );
  }

  const levelProgress = getLevelProgress(profile.xp, profile.level);
  const levelTitle = LEVEL_TITLES[Math.min(profile.level - 1, LEVEL_TITLES.length - 1)];
  const completedAchievements = achievements.filter(a => a.isComplete);
  const recentAchievements = completedAchievements.slice(0, 6);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white">
      {/* Hidden file inputs */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleImageUpload('avatar', e.target.files[0])}
      />
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleImageUpload('cover', e.target.files[0])}
      />

      {/* Cover Photo */}
      <div className="relative h-48 sm:h-64 md:h-80">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: profile.coverUrl
              ? `url(${profile.coverUrl})`
              : 'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #8b5cf6 100%)',
          }}
        />
        <div className="absolute inset-0 bg-black/40" />

        {/* Back button */}
        <Link
          href="/"
          className="absolute top-4 left-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        {/* Edit cover button */}
        <button
          onClick={() => coverInputRef.current?.click()}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
        >
          <Camera className="w-5 h-5" />
        </button>
      </div>

      {/* Profile Header */}
      <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-10">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-black overflow-hidden bg-zinc-800">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name || 'Profile'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <AvatarPlaceholder name={profile.name || 'User'} size="xl" className="w-full h-full" />
              )}
            </div>
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-2 right-2 p-2 rounded-full bg-orange-500 hover:bg-orange-600 transition-colors shadow-lg"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Name & Level */}
          <div className="flex-1 sm:pt-20">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold">{profile.name}</h1>
              {profile.isTrainer && (
                <span className="px-2 py-1 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-xs font-semibold">
                  TRAINER
                </span>
              )}
            </div>

            {/* Level Badge */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/30">
                <Crown className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-medium text-orange-400">Level {profile.level} • {levelTitle}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-zinc-400">
                <Zap className="w-4 h-4 text-yellow-400" />
                {profile.xp.toLocaleString()} XP
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="mt-3 max-w-xs">
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
            </div>

            {profile.location && (
              <div className="flex items-center gap-1 mt-2 text-zinc-400 text-sm">
                <MapPin className="w-4 h-4" />
                {profile.location}
              </div>
            )}
          </div>

          {/* Edit Button */}
          <div className="sm:pt-20">
            {editing ? (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-lg font-medium hover:bg-zinc-700 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="mt-6">
          {editing ? (
            <textarea
              value={editForm.bio}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              placeholder="Write something about yourself..."
              className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 resize-none focus:outline-none focus:border-orange-500"
              rows={3}
            />
          ) : (
            profile.bio && <p className="text-zinc-300">{profile.bio}</p>
          )}
        </div>

        {/* Social Links */}
        <div className="flex gap-3 mt-4">
          {editing ? (
            <div className="grid grid-cols-2 gap-3 w-full">
              <div className="flex items-center gap-2 p-2 bg-zinc-900 rounded-lg border border-zinc-700">
                <Instagram className="w-5 h-5 text-pink-400" />
                <input
                  type="text"
                  value={editForm.instagramUrl}
                  onChange={(e) => setEditForm({ ...editForm, instagramUrl: e.target.value })}
                  placeholder="Instagram URL"
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2 p-2 bg-zinc-900 rounded-lg border border-zinc-700">
                <Youtube className="w-5 h-5 text-red-500" />
                <input
                  type="text"
                  value={editForm.youtubeUrl}
                  onChange={(e) => setEditForm({ ...editForm, youtubeUrl: e.target.value })}
                  placeholder="YouTube URL"
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2 p-2 bg-zinc-900 rounded-lg border border-zinc-700">
                <Twitter className="w-5 h-5 text-blue-400" />
                <input
                  type="text"
                  value={editForm.twitterUrl}
                  onChange={(e) => setEditForm({ ...editForm, twitterUrl: e.target.value })}
                  placeholder="Twitter URL"
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2 p-2 bg-zinc-900 rounded-lg border border-zinc-700">
                <Globe className="w-5 h-5 text-green-400" />
                <input
                  type="text"
                  value={editForm.websiteUrl}
                  onChange={(e) => setEditForm({ ...editForm, websiteUrl: e.target.value })}
                  placeholder="Website URL"
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <>
              {profile.instagramUrl && (
                <a href={profile.instagramUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
                  <Instagram className="w-5 h-5 text-pink-400" />
                </a>
              )}
              {profile.youtubeUrl && (
                <a href={profile.youtubeUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
                  <Youtube className="w-5 h-5 text-red-500" />
                </a>
              )}
              {profile.twitterUrl && (
                <a href={profile.twitterUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
                  <Twitter className="w-5 h-5 text-blue-400" />
                </a>
              )}
              {profile.websiteUrl && (
                <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
                  <Globe className="w-5 h-5 text-green-400" />
                </a>
              )}
            </>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
          <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
              <Dumbbell className="w-4 h-4" />
              Workouts
            </div>
            <p className="text-2xl font-bold">{profile.totalWorkouts}</p>
          </div>
          <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
              <Clock className="w-4 h-4" />
              Minutes
            </div>
            <p className="text-2xl font-bold">{profile.totalMinutes.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
              <Flame className="w-4 h-4 text-orange-400" />
              Current Streak
            </div>
            <p className="text-2xl font-bold">{profile.currentStreak} <span className="text-sm text-zinc-400">days</span></p>
          </div>
          <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
              <Trophy className="w-4 h-4 text-amber-400" />
              Best Streak
            </div>
            <p className="text-2xl font-bold">{profile.longestStreak} <span className="text-sm text-zinc-400">days</span></p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-8 p-1 bg-zinc-900 rounded-lg overflow-x-auto">
          {(['overview', 'achievements', 'progress', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-6 pb-12">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Fitness Goals */}
              <div className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-orange-400" />
                  Fitness Goals
                </h3>
                {editing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">Goal</label>
                      <select
                        value={editForm.fitnessGoal}
                        onChange={(e) => setEditForm({ ...editForm, fitnessGoal: e.target.value })}
                        className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                      >
                        <option value="">Select goal</option>
                        <option value="lose_weight">Lose Weight</option>
                        <option value="build_muscle">Build Muscle</option>
                        <option value="maintain">Maintain</option>
                        <option value="improve_endurance">Improve Endurance</option>
                        <option value="increase_strength">Increase Strength</option>
                        <option value="flexibility">Improve Flexibility</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">Target Weight (kg)</label>
                      <input
                        type="number"
                        value={editForm.targetWeight}
                        onChange={(e) => setEditForm({ ...editForm, targetWeight: e.target.value })}
                        className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">Height (cm)</label>
                      <input
                        type="number"
                        value={editForm.height}
                        onChange={(e) => setEditForm({ ...editForm, height: e.target.value })}
                        className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-zinc-400">Goal</p>
                      <p className="font-medium capitalize">{profile.fitnessGoal?.replace('_', ' ') || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Target Weight</p>
                      <p className="font-medium">{profile.targetWeight ? `${profile.targetWeight} kg` : 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Height</p>
                      <p className="font-medium">{profile.height ? `${profile.height} cm` : 'Not set'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Achievements */}
              <div className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    Achievements
                  </h3>
                  <button
                    onClick={() => setActiveTab('achievements')}
                    className="text-sm text-orange-400 hover:text-orange-300 flex items-center gap-1"
                  >
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {recentAchievements.length > 0 ? (
                    recentAchievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`relative p-3 rounded-xl border ${RARITY_BG[achievement.rarity]} flex flex-col items-center text-center`}
                      >
                        <AchievementIcon
                          category={achievement.category}
                          rarity={achievement.rarity}
                          isComplete={achievement.isComplete}
                          size="sm"
                          className="mb-1"
                        />
                        <p className="text-xs font-medium truncate w-full">{achievement.name}</p>
                      </div>
                    ))
                  ) : (
                    <p className="col-span-full text-zinc-400 text-sm">No achievements yet. Start working out to earn your first!</p>
                  )}
                </div>
              </div>

              {/* Weight Progress */}
              {weightLogs.length > 0 && (
                <div className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Scale className="w-5 h-5 text-blue-400" />
                      Weight Progress
                    </h3>
                    <Link
                      href="/body"
                      className="text-sm text-orange-400 hover:text-orange-300 flex items-center gap-1"
                    >
                      View All <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="flex items-end gap-1 h-24">
                    {weightLogs.slice(-14).map((log, idx) => {
                      const minWeight = Math.min(...weightLogs.slice(-14).map(l => l.weight));
                      const maxWeight = Math.max(...weightLogs.slice(-14).map(l => l.weight));
                      const range = maxWeight - minWeight || 1;
                      const height = ((log.weight - minWeight) / range) * 80 + 20;
                      return (
                        <div
                          key={log.id}
                          className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all hover:from-blue-400 hover:to-blue-300"
                          style={{ height: `${height}%` }}
                          title={`${log.weight} ${log.unit}`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-zinc-400">
                    <span>14 days ago</span>
                    <span>Today</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {completedAchievements.length} of {achievements.length} Achievements
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-xl border ${
                      achievement.isComplete
                        ? RARITY_BG[achievement.rarity]
                        : 'bg-zinc-900/30 border-zinc-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <AchievementIcon
                        category={achievement.category}
                        rarity={achievement.rarity}
                        isComplete={achievement.isComplete}
                        size="lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{achievement.name}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${RARITY_COLORS[achievement.rarity]} text-white`}>
                            {achievement.rarity}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-400 mt-1">{achievement.description}</p>
                        {!achievement.isComplete && achievement.progress > 0 && (
                          <div className="mt-2">
                            <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-orange-500 to-pink-500"
                                style={{ width: `${achievement.progress}%` }}
                              />
                            </div>
                            <p className="text-xs text-zinc-500 mt-1">{achievement.progress}% complete</p>
                          </div>
                        )}
                        {achievement.isComplete && achievement.earnedAt && (
                          <p className="text-xs text-zinc-500 mt-2">
                            Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/body"
                  className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors group"
                >
                  <Scale className="w-8 h-8 text-blue-400 mb-3" />
                  <h3 className="text-lg font-semibold group-hover:text-orange-400 transition-colors">Weight Tracking</h3>
                  <p className="text-sm text-zinc-400 mt-1">Log and track your weight over time</p>
                </Link>
                <Link
                  href="/body/measurements"
                  className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors group"
                >
                  <Ruler className="w-8 h-8 text-green-400 mb-3" />
                  <h3 className="text-lg font-semibold group-hover:text-orange-400 transition-colors">Body Measurements</h3>
                  <p className="text-sm text-zinc-400 mt-1">Track chest, waist, arms, and more</p>
                </Link>
                <Link
                  href="/body/photos"
                  className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors group"
                >
                  <Camera className="w-8 h-8 text-pink-400 mb-3" />
                  <h3 className="text-lg font-semibold group-hover:text-orange-400 transition-colors">Progress Photos</h3>
                  <p className="text-sm text-zinc-400 mt-1">Visualize your transformation</p>
                </Link>
                <Link
                  href="/reports"
                  className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors group"
                >
                  <BarChart3 className="w-8 h-8 text-purple-400 mb-3" />
                  <h3 className="text-lg font-semibold group-hover:text-orange-400 transition-colors">Weekly Reports</h3>
                  <p className="text-sm text-zinc-400 mt-1">AI-generated progress analysis</p>
                </Link>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
                <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Email</label>
                    <p className="text-zinc-300">{profile.email}</p>
                  </div>
                  {editing && (
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">Display Name</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  )}
                  {editing && (
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">Location</label>
                      <input
                        type="text"
                        value={editForm.location}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        placeholder="City, Country"
                        className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Theme Preferences */}
              <div className="p-6 bg-zinc-100 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Sun className="w-5 h-5 text-amber-500" />
                  Appearance
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-2">Theme</label>
                    <ThemeToggle variant="full" />
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Choose between light and dark mode for your preferred viewing experience.
                  </p>
                </div>
              </div>

              {profile.isTrainer && (
                <div className="p-6 bg-zinc-100 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <h3 className="text-lg font-semibold mb-4">Trainer Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-zinc-400">Certifications</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {profile.certifications?.length ? (
                          profile.certifications.map((cert, idx) => (
                            <span key={idx} className="px-2 py-1 bg-zinc-800 rounded text-sm">{cert}</span>
                          ))
                        ) : (
                          <span className="text-zinc-500">No certifications added</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Specializations</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {profile.specializations?.length ? (
                          profile.specializations.map((spec, idx) => (
                            <span key={idx} className="px-2 py-1 bg-zinc-800 rounded text-sm">{spec}</span>
                          ))
                        ) : (
                          <span className="text-zinc-500">No specializations added</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Hourly Rate</p>
                      <p className="font-medium">{profile.hourlyRate ? `$${profile.hourlyRate}/hr` : 'Not set'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
