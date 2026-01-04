'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  ArrowLeft, Trophy, Users, Target, Flame, Zap, Clock, Award,
  ChevronRight, Star, Crown, Medal, TrendingUp, Gift, Calendar,
  CheckCircle, Lock, Share2, Loader2
} from 'lucide-react';
import SocialShareModal from '@/components/SocialShareModal';
import { useToast } from '@/components/Toast';

// Hero image
const HERO_IMAGE = 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1200&auto=format&fit=crop&q=80';

interface GlobalChallenge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  type: 'steps' | 'workouts' | 'minutes' | 'calories' | 'streak';
  goal: number;
  unit: string;
  startDate: string;
  endDate: string;
  xpReward: number;
  prizeDescription?: string;
  participantCount: number;
  isJoined: boolean;
  progress?: number;
  rank?: number;
  isFeatured?: boolean;
  isCompleted?: boolean;
  daysLeft: number;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  progress: number;
  isCurrentUser?: boolean;
  level: number;
  badge?: string;
}

const SAMPLE_CHALLENGES: GlobalChallenge[] = [
  {
    id: '1',
    name: 'January Step Challenge',
    description: 'Walk 500,000 steps this month and earn exclusive rewards!',
    imageUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&auto=format&fit=crop&q=80',
    type: 'steps',
    goal: 500000,
    unit: 'steps',
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    xpReward: 1000,
    prizeDescription: 'Exclusive "Step Master" badge + 1000 XP',
    participantCount: 12453,
    isJoined: true,
    progress: 234567,
    rank: 1247,
    isFeatured: true,
    daysLeft: 28,
  },
  {
    id: '2',
    name: '30-Day Workout Warrior',
    description: 'Complete 30 workouts in 30 days. Are you up for the challenge?',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&auto=format&fit=crop&q=80',
    type: 'workouts',
    goal: 30,
    unit: 'workouts',
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    xpReward: 1500,
    participantCount: 8234,
    isJoined: true,
    progress: 12,
    rank: 892,
    daysLeft: 28,
  },
  {
    id: '3',
    name: 'Calorie Crusher',
    description: 'Burn 50,000 calories this month through exercise.',
    imageUrl: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400&auto=format&fit=crop&q=80',
    type: 'calories',
    goal: 50000,
    unit: 'kcal',
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    xpReward: 750,
    participantCount: 5621,
    isJoined: false,
    daysLeft: 28,
  },
  {
    id: '4',
    name: '7-Day Streak Sprint',
    description: 'Maintain a 7-day workout streak to earn XP.',
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&auto=format&fit=crop&q=80',
    type: 'streak',
    goal: 7,
    unit: 'days',
    startDate: '2025-01-01',
    endDate: '2025-01-07',
    xpReward: 300,
    participantCount: 15789,
    isJoined: true,
    progress: 7,
    isCompleted: true,
    daysLeft: 0,
  },
];

const SAMPLE_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'FitnessPro123', avatar: '💪', progress: 487234, level: 42, badge: '🏆' },
  { rank: 2, name: 'MarathonMike', avatar: '🏃', progress: 465123, level: 38, badge: '🥈' },
  { rank: 3, name: 'StepQueen', avatar: '👑', progress: 453890, level: 35, badge: '🥉' },
  { rank: 4, name: 'WalkingWarrior', avatar: '⚔️', progress: 421456, level: 31 },
  { rank: 5, name: 'HealthyHero', avatar: '🦸', progress: 398234, level: 29 },
  { rank: 6, name: 'CardioKing', avatar: '🎯', progress: 387654, level: 27 },
  { rank: 7, name: 'GymRat2025', avatar: '🐀', progress: 356789, level: 25 },
  { rank: 8, name: 'FitFam', avatar: '👨‍👩‍👧', progress: 334567, level: 23 },
  { rank: 9, name: 'MoveMore', avatar: '🚶', progress: 312456, level: 21 },
  { rank: 10, name: 'StepCounter', avatar: '📱', progress: 298765, level: 19 },
  { rank: 1247, name: 'You', avatar: '⭐', progress: 234567, level: 15, isCurrentUser: true },
];

const TYPE_CONFIG = {
  steps: { icon: Target, color: 'from-green-500 to-emerald-600' },
  workouts: { icon: Zap, color: 'from-violet-500 to-purple-600' },
  minutes: { icon: Clock, color: 'from-blue-500 to-cyan-600' },
  calories: { icon: Flame, color: 'from-orange-500 to-red-600' },
  streak: { icon: TrendingUp, color: 'from-amber-500 to-yellow-600' },
};

export default function GlobalChallengesPage() {
  const { data: session } = useSession();
  const toast = useToast();
  const [challenges, setChallenges] = useState<GlobalChallenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<GlobalChallenge | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'completed'>('active');
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [currentUserPosition, setCurrentUserPosition] = useState<LeaderboardEntry | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareContent, setShareContent] = useState<{ title: string; subtitle: string } | null>(null);

  const handleShare = (challenge?: GlobalChallenge) => {
    const c = challenge || selectedChallenge;
    if (c) {
      setShareContent({
        title: c.name,
        subtitle: `Join me in the ${c.name}! ${c.participantCount.toLocaleString()} people are already participating.`,
      });
      setShowShareModal(true);
    }
  };

  // Fetch leaderboard when challenge is selected
  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!selectedChallenge) {
        setLeaderboard([]);
        setCurrentUserPosition(null);
        return;
      }

      setLeaderboardLoading(true);
      try {
        const response = await fetch(`/api/challenges/global/leaderboard?challengeId=${selectedChallenge.id}&limit=10`);
        if (response.ok) {
          const data = await response.json();
          setLeaderboard(data.leaderboard || []);
          setCurrentUserPosition(data.currentUserPosition || null);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        toast.error('Failed to load leaderboard', 'Please try again.');
      } finally {
        setLeaderboardLoading(false);
      }
    };

    fetchLeaderboard();
  }, [selectedChallenge]);

  // Fetch challenges from API
  useEffect(() => {
    const fetchChallenges = async () => {
      if (!session?.user) {
        // Show sample data for demo (logged out users)
        setChallenges(SAMPLE_CHALLENGES);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/challenges/global');
        if (!response.ok) {
          throw new Error('Failed to fetch challenges');
        }
        const data = await response.json();
        // API returns array directly
        if (Array.isArray(data) && data.length > 0) {
          const apiChallenges = data.map((challenge: any) => ({
            ...challenge,
            daysLeft: Math.max(0, Math.ceil((new Date(challenge.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
          }));
          setChallenges(apiChallenges);
        } else {
          // Use sample data when no challenges returned
          setChallenges(SAMPLE_CHALLENGES);
        }
      } catch (error) {
        console.error('Error fetching challenges:', error);
        toast.error('Failed to load challenges', 'Please try refreshing the page.');
        // Use sample data as fallback
        setChallenges(SAMPLE_CHALLENGES);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, [session]);

  const joinChallenge = async (challengeId: string) => {
    // Optimistically update UI
    setChallenges(challenges.map(c =>
      c.id === challengeId
        ? { ...c, isJoined: true, progress: 0, participantCount: c.participantCount + 1 }
        : c
    ));

    // Call API to join challenge
    try {
      await fetch('/api/challenges/global', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId }),
      });
    } catch (error) {
      console.error('Error joining challenge:', error);
      toast.error('Failed to join challenge', 'Please try again.');
      // Revert optimistic update
      setChallenges(challenges.map(c =>
        c.id === challengeId
          ? { ...c, isJoined: false, progress: undefined, participantCount: c.participantCount - 1 }
          : c
      ));
    }
  };


  const getProgressPercent = (challenge: GlobalChallenge): number => {
    if (!challenge.progress) return 0;
    return Math.min(100, (challenge.progress / challenge.goal) * 100);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const activeChallenges = challenges.filter(c => !c.isCompleted && c.daysLeft > 0);
  const completedChallenges = challenges.filter(c => c.isCompleted);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Header */}
      <div className="relative">
        <div
          className="h-56 bg-cover bg-center"
          style={{ backgroundImage: `url("${HERO_IMAGE}")` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-slate-900" />
        </div>

        {/* Header Actions */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Link
            href="/"
            className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>

          <button
            onClick={() => handleShare(challenges[0])}
            className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl hover:bg-white/20 transition-all"
          >
            <Share2 className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Title */}
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-6 h-6 text-amber-400" />
              <span className="text-amber-400 font-semibold">Community</span>
            </div>
            <h1 className="text-3xl font-bold text-white">Global Challenges</h1>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">{formatNumber(challenges.reduce((a, c) => a + c.participantCount, 0))}</p>
            <p className="text-white/60 text-sm">Participants</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
          </div>
        )}

        {/* Stats Cards */}
        {!loading && <div className="grid grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-violet-500/20 to-purple-600/20 backdrop-blur-xl rounded-2xl border border-violet-500/30 p-4 text-center">
            <Trophy className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{challenges.filter(c => c.isJoined).length}</p>
            <p className="text-xs text-white/60">Joined</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-xl rounded-2xl border border-green-500/30 p-4 text-center">
            <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{completedChallenges.length}</p>
            <p className="text-xs text-white/60">Completed</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-xl rounded-2xl border border-orange-500/30 p-4 text-center">
            <Zap className="w-6 h-6 text-orange-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{challenges.reduce((a, c) => a + (c.isCompleted ? c.xpReward : 0), 0)}</p>
            <p className="text-xs text-white/60">XP Earned</p>
          </div>
        </div>}

        {/* Tab Navigation */}
        <div className="flex gap-2 bg-white/5 backdrop-blur-xl rounded-2xl p-1">
          {[
            { id: 'active', label: 'Active', count: activeChallenges.length },
            { id: 'upcoming', label: 'Upcoming', count: 0 },
            { id: 'completed', label: 'Completed', count: completedChallenges.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-white/20' : 'bg-white/10'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Featured Challenge */}
        {activeTab === 'active' && challenges.find(c => c.isFeatured && !c.isCompleted) && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <h2 className="text-lg font-semibold text-white">Featured Challenge</h2>
            </div>

            {(() => {
              const featured = challenges.find(c => c.isFeatured && !c.isCompleted)!;
              const config = TYPE_CONFIG[featured.type];
              const Icon = config.icon;
              const progress = getProgressPercent(featured);

              return (
                <div
                  onClick={() => setSelectedChallenge(featured)}
                  className="relative overflow-hidden rounded-3xl cursor-pointer"
                >
                  <img
                    src={featured.imageUrl}
                    alt={featured.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Featured
                      </span>
                      <span className="px-2 py-1 bg-white/20 text-white text-xs rounded-full">
                        {featured.daysLeft} days left
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{featured.name}</h3>

                    {featured.isJoined && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-white/60">Your Progress</span>
                          <span className="text-white font-semibold">
                            {formatNumber(featured.progress || 0)} / {formatNumber(featured.goal)}
                          </span>
                        </div>
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${config.color} transition-all`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-white/50 text-xs mt-1">Rank #{featured.rank} of {formatNumber(featured.participantCount)}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Challenge List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">
            {activeTab === 'active' ? 'All Active Challenges' : activeTab === 'completed' ? 'Completed Challenges' : 'Coming Soon'}
          </h2>

          {(activeTab === 'active' ? activeChallenges : activeTab === 'completed' ? completedChallenges : []).map((challenge) => {
            const config = TYPE_CONFIG[challenge.type];
            const Icon = config.icon;
            const progress = getProgressPercent(challenge);

            return (
              <div
                key={challenge.id}
                onClick={() => setSelectedChallenge(challenge)}
                className={`bg-white/5 backdrop-blur-xl rounded-2xl border p-4 cursor-pointer transition-all hover:border-violet-500/50 ${
                  challenge.isCompleted
                    ? 'border-green-500/30 bg-green-500/10'
                    : 'border-white/10'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${config.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">{challenge.name}</h3>
                      {challenge.isCompleted && (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-sm text-white/50 mb-2">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {formatNumber(challenge.participantCount)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Gift className="w-4 h-4" />
                        {challenge.xpReward} XP
                      </span>
                      {challenge.daysLeft > 0 && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {challenge.daysLeft}d left
                        </span>
                      )}
                    </div>

                    {challenge.isJoined && !challenge.isCompleted && (
                      <div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${config.color} transition-all`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-1 text-xs text-white/50">
                          <span>{Math.round(progress)}% complete</span>
                          <span>#{challenge.rank}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <ChevronRight className="w-5 h-5 text-white/40" />
                </div>
              </div>
            );
          })}

          {activeTab === 'upcoming' && (
            <div className="text-center py-12">
              <Lock className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/60">No upcoming challenges yet</p>
              <p className="text-white/40 text-sm">Check back soon!</p>
            </div>
          )}
        </div>

        {/* Motivational Card */}
        <div className="bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-3xl border border-violet-500/30 p-6 text-center">
          <Crown className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white mb-2">Compete Globally</h3>
          <p className="text-white/60 mb-4">
            Join challenges, climb leaderboards, and earn exclusive rewards while getting fit with the community!
          </p>
        </div>
      </div>

      {/* Challenge Detail Modal */}
      {selectedChallenge && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="min-h-screen">
            {/* Challenge Image */}
            <div className="relative h-64">
              <img
                src={selectedChallenge.imageUrl}
                alt={selectedChallenge.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/50" />

              <button
                onClick={() => setSelectedChallenge(null)}
                className="absolute top-4 left-4 p-3 bg-black/40 backdrop-blur-sm rounded-full"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>

              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-2xl font-bold text-white mb-2">{selectedChallenge.name}</h2>
                <p className="text-white/70">{selectedChallenge.description}</p>
              </div>
            </div>

            {/* Challenge Content */}
            <div className="px-4 py-6 space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 text-center">
                  <Target className="w-6 h-6 text-violet-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-white">{formatNumber(selectedChallenge.goal)}</p>
                  <p className="text-xs text-white/50">{selectedChallenge.unit}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 text-center">
                  <Users className="w-6 h-6 text-green-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-white">{formatNumber(selectedChallenge.participantCount)}</p>
                  <p className="text-xs text-white/50">Participants</p>
                </div>
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 text-center">
                  <Gift className="w-6 h-6 text-amber-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-white">{selectedChallenge.xpReward}</p>
                  <p className="text-xs text-white/50">XP Reward</p>
                </div>
              </div>

              {/* Your Progress */}
              {selectedChallenge.isJoined && (
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
                  <h3 className="font-semibold text-white mb-4">Your Progress</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60">
                      {formatNumber(selectedChallenge.progress || 0)} / {formatNumber(selectedChallenge.goal)} {selectedChallenge.unit}
                    </span>
                    <span className="text-white font-bold">{Math.round(getProgressPercent(selectedChallenge))}%</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${TYPE_CONFIG[selectedChallenge.type].color} transition-all`}
                      style={{ width: `${getProgressPercent(selectedChallenge)}%` }}
                    />
                  </div>
                  {selectedChallenge.rank && (
                    <p className="text-white/50 text-sm mt-2">
                      You&apos;re ranked #{selectedChallenge.rank} out of {formatNumber(selectedChallenge.participantCount)} participants
                    </p>
                  )}
                </div>
              )}

              {/* Leaderboard */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <h3 className="font-semibold text-white">Leaderboard</h3>
                  <span className="text-white/50 text-sm">Top 10</span>
                </div>

                <div className="divide-y divide-white/5">
                  {leaderboardLoading ? (
                    <div className="p-8 text-center">
                      <Loader2 className="w-6 h-6 text-violet-400 animate-spin mx-auto" />
                      <p className="text-white/50 text-sm mt-2">Loading leaderboard...</p>
                    </div>
                  ) : leaderboard.length === 0 ? (
                    <div className="p-8 text-center">
                      <Trophy className="w-10 h-10 text-white/20 mx-auto mb-2" />
                      <p className="text-white/50 text-sm">No participants yet</p>
                      <p className="text-white/30 text-xs">Be the first to join!</p>
                    </div>
                  ) : (
                    <>
                      {leaderboard.map((entry) => (
                        <div
                          key={entry.rank}
                          className={`px-4 py-3 flex items-center gap-3 ${
                            entry.isCurrentUser ? 'bg-violet-500/10' : ''
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            entry.rank === 1 ? 'bg-amber-500 text-white' :
                            entry.rank === 2 ? 'bg-gray-300 text-gray-800' :
                            entry.rank === 3 ? 'bg-amber-700 text-white' :
                            'bg-white/10 text-white/60'
                          }`}>
                            {entry.rank <= 3 ? (entry.badge || entry.rank) : entry.rank}
                          </div>
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl overflow-hidden">
                            {entry.avatar?.startsWith('http') ? (
                              <img src={entry.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              entry.avatar || '👤'
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium ${entry.isCurrentUser ? 'text-violet-400' : 'text-white'}`}>
                              {entry.name}
                            </p>
                            <p className="text-xs text-white/50">Level {entry.level}</p>
                          </div>
                          <p className="font-bold text-white">{formatNumber(entry.progress)}</p>
                        </div>
                      ))}

                      {/* Current user if not in top 10 */}
                      {currentUserPosition && currentUserPosition.rank > 10 && (
                        <>
                          <div className="px-4 py-2 text-center text-white/30 text-sm">• • •</div>
                          <div className="px-4 py-3 flex items-center gap-3 bg-violet-500/10">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white/60">
                              {currentUserPosition.rank}
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl overflow-hidden">
                              {currentUserPosition.avatar?.startsWith('http') ? (
                                <img src={currentUserPosition.avatar} alt="" className="w-full h-full object-cover" />
                              ) : (
                                currentUserPosition.avatar || '⭐'
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-violet-400">{currentUserPosition.name}</p>
                              <p className="text-xs text-white/50">Level {currentUserPosition.level}</p>
                            </div>
                            <p className="font-bold text-white">{formatNumber(currentUserPosition.progress)}</p>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Prize Info */}
              {selectedChallenge.prizeDescription && (
                <div className="bg-gradient-to-r from-amber-500/20 to-yellow-600/20 backdrop-blur-xl rounded-2xl border border-amber-500/30 p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/20 rounded-xl">
                      <Award className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Prize</p>
                      <p className="text-white/70 text-sm">{selectedChallenge.prizeDescription}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Join/Leave Button */}
              {!selectedChallenge.isJoined ? (
                <button
                  onClick={() => {
                    joinChallenge(selectedChallenge.id);
                    setSelectedChallenge({ ...selectedChallenge, isJoined: true, progress: 0 });
                  }}
                  className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl font-semibold text-white hover:from-violet-600 hover:to-purple-700 transition-all"
                >
                  <Trophy className="w-5 h-5 inline mr-2" />
                  Join Challenge
                </button>
              ) : selectedChallenge.isCompleted ? (
                <button className="w-full py-4 bg-green-500/20 rounded-2xl font-semibold text-green-400 flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Challenge Completed!
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedChallenge(null)}
                    className="flex-1 py-4 bg-white/10 rounded-2xl font-semibold text-white"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleShare()}
                    className="flex-1 py-4 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl font-semibold text-white"
                  >
                    <Share2 className="w-5 h-5 inline mr-2" />
                    Share
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareContent && (
        <SocialShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          content={{
            type: 'challenge',
            title: shareContent.title,
            subtitle: shareContent.subtitle,
          }}
        />
      )}
    </div>
  );
}
