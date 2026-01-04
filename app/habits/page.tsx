'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Droplets, Moon, Footprints, Brain, Plus, Check,
  Flame, TrendingUp, Calendar, ChevronLeft, ChevronRight, X,
  Target, Award, Sparkles, Bell, Clock, Minus, Settings, Loader2
} from 'lucide-react';
import { useCelebration } from '@/components/Celebration';
import { useToast } from '@/components/Toast';
import { ConfirmModal } from '@/components/ConfirmModal';
import { triggerHaptic } from '@/lib/haptics';
import { staggerContainer, listItem, popIn, scaleIn } from '@/lib/animations';

// Hero image
const HERO_IMAGE = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&auto=format&fit=crop&q=80';

interface Habit {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  type: 'boolean' | 'quantity' | 'duration';
  targetValue?: number;
  unit?: string;
  currentStreak: number;
  longestStreak: number;
  todayValue?: number;
  todayCompleted: boolean;
}

const ICON_MAP: { [key: string]: any } = {
  droplets: Droplets,
  moon: Moon,
  footprints: Footprints,
  brain: Brain,
  flame: Flame,
  target: Target,
  check: Check,
};

const COLOR_MAP: { [key: string]: string } = {
  blue: 'from-blue-500 to-cyan-600',
  purple: 'from-violet-500 to-purple-600',
  green: 'from-green-500 to-emerald-600',
  orange: 'from-orange-500 to-red-600',
  pink: 'from-pink-500 to-rose-600',
  amber: 'from-amber-500 to-yellow-600',
};

// No default demo habits - users should see empty state until they create habits

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function HabitsPage() {
  const { data: session } = useSession();
  const toast = useToast();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [weekData, setWeekData] = useState<(boolean | null)[]>([null, null, null, null, null, null, null]);
  const [customHabitName, setCustomHabitName] = useState('');
  const [customHabitTarget, setCustomHabitTarget] = useState('');
  const [customHabitUnit, setCustomHabitUnit] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; habitId: string | null }>({
    isOpen: false,
    habitId: null,
  });

  // Premium celebration animations
  const { celebrate, CelebrationComponent } = useCelebration();

  // Fetch habits from API
  useEffect(() => {
    const fetchHabits = async () => {
      if (!session?.user) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/habits');
        if (response.ok) {
          const data = await response.json();
          if (data.habits && data.habits.length > 0) {
            // Transform API data to match our Habit interface
            const transformedHabits = data.habits.map((h: any) => ({
              id: h.id,
              name: h.name,
              description: h.description,
              icon: h.icon || 'target',
              color: h.color || 'purple',
              type: h.habitType || 'quantity',
              targetValue: h.targetValue,
              unit: h.unit,
              currentStreak: h.currentStreak || 0,
              longestStreak: h.longestStreak || 0,
              todayValue: data.todayLogs?.find((l: any) => l.habitId === h.id)?.value || 0,
              todayCompleted: data.todayLogs?.find((l: any) => l.habitId === h.id)?.completed || false,
            }));
            setHabits(transformedHabits);
          }
          // Calculate week data from logs
          if (data.weekLogs) {
            const today = new Date();
            const dayOfWeek = today.getDay();
            const newWeekData = [...Array(7)].map((_, i) => {
              if (i === dayOfWeek) return null; // today
              if (i > dayOfWeek) return false; // future days
              // Check if any habit was completed on this day
              return data.weekLogs.some((log: any) => {
                const logDate = new Date(log.logDate);
                return logDate.getDay() === i && log.completed;
              });
            });
            setWeekData(newWeekData);
          }
        }
      } catch (error) {
        console.error('Error fetching habits:', error);
        toast.error('Failed to load habits', 'Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchHabits();
  }, [session, toast]);

  const completedToday = habits.filter(h => h.todayCompleted).length;
  const totalHabits = habits.length;
  const completionRate = Math.round((completedToday / totalHabits) * 100);

  const updateHabitValue = async (habitId: string, increment: number) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const newValue = Math.max(0, (habit.todayValue || 0) + increment);
    const wasCompleted = habit.todayCompleted;
    const completed = habit.targetValue ? newValue >= habit.targetValue : false;

    // Haptic feedback on increment
    triggerHaptic(increment > 0 ? 'light' : 'selection');

    // Optimistic update
    setHabits(habits.map(h => {
      if (h.id === habitId) {
        return { ...h, todayValue: newValue, todayCompleted: completed };
      }
      return h;
    }));

    // Celebrate when habit is completed for the first time today
    if (completed && !wasCompleted) {
      triggerHaptic('success');
      celebrate('goal', 'HABIT COMPLETE!', habit.name);
    }

    // Save to API if logged in
    if (session?.user && !habitId.startsWith('demo-')) {
      try {
        const res = await fetch('/api/habits', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            habitId,
            value: newValue,
            completed,
          }),
        });
        if (!res.ok) throw new Error('Failed to update habit');
      } catch (error) {
        console.error('Error updating habit:', error);
        // Revert optimistic update on error
        setHabits(habits.map(h => {
          if (h.id === habitId) {
            return { ...h, todayValue: habit.todayValue, todayCompleted: wasCompleted };
          }
          return h;
        }));
        toast.error('Sync failed', 'Could not save habit update.');
      }
    }
  };

  const toggleHabit = async (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const newCompleted = !habit.todayCompleted;

    // Optimistic update
    setHabits(habits.map(h => {
      if (h.id === habitId) {
        return { ...h, todayCompleted: newCompleted };
      }
      return h;
    }));

    // Save to API if logged in
    if (session?.user && !habitId.startsWith('demo-')) {
      try {
        const res = await fetch('/api/habits', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            habitId,
            value: newCompleted ? (habit.targetValue || 1) : 0,
            completed: newCompleted,
          }),
        });
        if (!res.ok) throw new Error('Failed to toggle habit');
      } catch (error) {
        console.error('Error updating habit:', error);
        // Revert optimistic update on error
        setHabits(habits.map(h => {
          if (h.id === habitId) {
            return { ...h, todayCompleted: !newCompleted };
          }
          return h;
        }));
        toast.error('Sync failed', 'Could not save habit update.');
      }
    }
  };

  const createHabit = async (preset: { name: string; icon: string; color: string; target: number; unit: string }) => {
    if (!session?.user) {
      // For demo mode, just add to local state
      const newHabit: Habit = {
        id: `demo-${Date.now()}`,
        name: preset.name,
        icon: preset.icon,
        color: preset.color,
        type: 'quantity',
        targetValue: preset.target,
        unit: preset.unit,
        currentStreak: 0,
        longestStreak: 0,
        todayValue: 0,
        todayCompleted: false,
      };
      setHabits([...habits, newHabit]);
      setShowAddModal(false);
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: preset.name,
          icon: preset.icon,
          color: preset.color,
          habitType: 'quantity',
          targetValue: preset.target,
          unit: preset.unit,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newHabit: Habit = {
          id: data.habit.id,
          name: data.habit.name,
          icon: data.habit.icon || preset.icon,
          color: data.habit.color || preset.color,
          type: data.habit.habitType || 'quantity',
          targetValue: data.habit.targetValue,
          unit: data.habit.unit,
          currentStreak: 0,
          longestStreak: 0,
          todayValue: 0,
          todayCompleted: false,
        };
        setHabits([...habits, newHabit]);
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Error creating habit:', error);
    } finally {
      setSaving(false);
    }
  };

  const createCustomHabit = async () => {
    if (!customHabitName.trim()) {
      toast.warning('Missing name', 'Please enter a habit name');
      return;
    }

    const target = parseInt(customHabitTarget) || 1;
    const unit = customHabitUnit.trim() || 'times';

    if (!session?.user) {
      // For demo mode
      const newHabit: Habit = {
        id: `demo-${Date.now()}`,
        name: customHabitName.trim(),
        icon: 'target',
        color: 'purple',
        type: 'quantity',
        targetValue: target,
        unit: unit,
        currentStreak: 0,
        longestStreak: 0,
        todayValue: 0,
        todayCompleted: false,
      };
      setHabits([...habits, newHabit]);
      setShowAddModal(false);
      setCustomHabitName('');
      setCustomHabitTarget('');
      setCustomHabitUnit('');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customHabitName.trim(),
          icon: 'target',
          color: 'purple',
          habitType: 'quantity',
          targetValue: target,
          unit: unit,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newHabit: Habit = {
          id: data.habit.id,
          name: data.habit.name,
          icon: data.habit.icon || 'target',
          color: data.habit.color || 'purple',
          type: data.habit.habitType || 'quantity',
          targetValue: data.habit.targetValue,
          unit: data.habit.unit,
          currentStreak: 0,
          longestStreak: 0,
          todayValue: 0,
          todayCompleted: false,
        };
        setHabits([...habits, newHabit]);
        setShowAddModal(false);
        setCustomHabitName('');
        setCustomHabitTarget('');
        setCustomHabitUnit('');
      }
    } catch (error) {
      console.error('Error creating custom habit:', error);
      toast.error('Failed to create habit', 'Please try again');
    } finally {
      setSaving(false);
    }
  };

  const deleteHabit = async (habitId: string) => {
    // Optimistic update
    setHabits(habits.filter(h => h.id !== habitId));
    setShowDetailModal(false);
    setDeleteConfirm({ isOpen: false, habitId: null });
    toast.success('Habit deleted', 'The habit has been removed.');

    if (!session?.user || habitId.startsWith('demo-')) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/habits?id=${habitId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete habit');
    } catch (error) {
      console.error('Error deleting habit:', error);
      toast.error('Sync error', 'Habit removed locally but may not have synced.');
    } finally {
      setDeleting(false);
    }
  };

  const confirmDeleteHabit = (habitId: string) => {
    setDeleteConfirm({ isOpen: true, habitId });
  };

  const getProgress = (habit: Habit): number => {
    if (!habit.targetValue || !habit.todayValue) return 0;
    return Math.min(100, (habit.todayValue / habit.targetValue) * 100);
  };

  const formatValue = (value: number | undefined, unit: string | undefined): string => {
    if (value === undefined) return '0';
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return value.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-violet-500 animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading habits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Premium Celebration Component */}
      {CelebrationComponent}

      {/* Hero Header */}
      <div className="relative">
        <div
          className="h-48 bg-cover bg-center"
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
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl font-medium text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Habit
          </button>
        </div>

        {/* Title */}
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-3xl font-bold text-white mb-1">Daily Habits</h1>
          <p className="text-white/60">Build consistency, transform your life</p>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Today's Progress */}
        <div className="bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-3xl border border-violet-500/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/60 text-sm">Today&apos;s Progress</p>
              <p className="text-2xl font-bold text-white">{completedToday} / {totalHabits} Complete</p>
            </div>
            <div className="relative w-16 h-16">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="6"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - completionRate / 100)}`}
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#EC4899" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold">{completionRate}%</span>
              </div>
            </div>
          </div>

          {/* Week View */}
          <div className="grid grid-cols-7 gap-2">
            {DAYS.map((day, index) => {
              const isCompleted = weekData[index];
              const isToday = index === new Date().getDay();
              return (
                <div key={index} className="text-center">
                  <p className="text-xs text-white/40 mb-1">{day}</p>
                  <div
                    className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center transition-all ${
                      isToday
                        ? 'ring-2 ring-violet-500 bg-white/10'
                        : isCompleted
                        ? 'bg-gradient-to-r from-violet-500 to-purple-600'
                        : isCompleted === false
                        ? 'bg-white/5'
                        : 'bg-white/5'
                    }`}
                  >
                    {isCompleted === true && !isToday && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                    {isToday && (
                      <span className="text-xs text-white font-bold">
                        {completedToday}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Habits List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-violet-400" />
            Your Habits
          </h2>

          {habits.length === 0 && (
            <div className="text-center py-12 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
              <Target className="w-16 h-16 text-white/20 mx-auto mb-4" />
              {!session?.user ? (
                <>
                  <p className="text-white/60 mb-2">Log in to track your habits</p>
                  <Link
                    href="/login"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl font-semibold text-white hover:from-violet-600 hover:to-purple-700 transition-all"
                  >
                    Log In
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-white/60 mb-2">No habits yet</p>
                  <p className="text-white/40 text-sm mb-4">Start building healthy routines</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl font-semibold text-white"
                  >
                    <Plus className="w-4 h-4" />
                    Add Your First Habit
                  </button>
                </>
              )}
            </div>
          )}

          {habits.map((habit) => {
            const IconComponent = ICON_MAP[habit.icon] || Check;
            const colorClass = COLOR_MAP[habit.color] || COLOR_MAP.purple;
            const progress = getProgress(habit);

            return (
              <div
                key={habit.id}
                className={`bg-white/5 backdrop-blur-xl rounded-2xl border p-4 transition-all ${
                  habit.todayCompleted
                    ? 'border-green-500/50 bg-green-500/10'
                    : 'border-white/10'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon & Completion */}
                  <button
                    onClick={() => habit.type === 'boolean' && toggleHabit(habit.id)}
                    className={`p-3 rounded-xl transition-all ${
                      habit.todayCompleted
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                        : `bg-gradient-to-r ${colorClass}`
                    }`}
                  >
                    {habit.todayCompleted ? (
                      <Check className="w-6 h-6 text-white" />
                    ) : (
                      <IconComponent className="w-6 h-6 text-white" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">{habit.name}</h3>
                      {habit.currentStreak > 0 && (
                        <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs font-medium rounded-full flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          {habit.currentStreak}
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {habit.type !== 'boolean' && (
                      <div className="mb-2">
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${
                              habit.todayCompleted
                                ? 'from-green-500 to-emerald-600'
                                : colorClass
                            } transition-all duration-500`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-white/50">
                            {formatValue(habit.todayValue, habit.unit)} / {habit.targetValue} {habit.unit}
                          </p>
                          <p className="text-xs text-white/50">{Math.round(progress)}%</p>
                        </div>
                      </div>
                    )}

                    {/* Quick Actions for quantity/duration */}
                    {habit.type !== 'boolean' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateHabitValue(habit.id, habit.unit === 'steps' ? -1000 : -1)}
                          className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
                        >
                          <Minus className="w-4 h-4 text-white" />
                        </button>
                        <span className="text-lg font-bold text-white min-w-[60px] text-center">
                          {formatValue(habit.todayValue, habit.unit)}
                        </span>
                        <button
                          onClick={() => updateHabitValue(habit.id, habit.unit === 'steps' ? 1000 : 1)}
                          className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
                        >
                          <Plus className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Streak Info */}
                  <button
                    onClick={() => {
                      setSelectedHabit(habit);
                      setShowDetailModal(true);
                    }}
                    className="p-2 hover:bg-white/10 rounded-xl transition-all"
                  >
                    <Settings className="w-5 h-5 text-white/40" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Streaks Overview */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            Streak Champions
          </h2>

          <div className="space-y-3">
            {habits
              .sort((a, b) => b.currentStreak - a.currentStreak)
              .slice(0, 3)
              .map((habit, index) => {
                const IconComponent = ICON_MAP[habit.icon] || Check;
                const colorClass = COLOR_MAP[habit.color] || COLOR_MAP.purple;
                const medals = ['🥇', '🥈', '🥉'];

                return (
                  <div
                    key={habit.id}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-xl"
                  >
                    <span className="text-2xl">{medals[index]}</span>
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${colorClass}`}>
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{habit.name}</p>
                      <p className="text-xs text-white/50">Best: {habit.longestStreak} days</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-orange-400">{habit.currentStreak}</p>
                      <p className="text-xs text-white/50">days</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Motivational Card */}
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-600/20 backdrop-blur-xl rounded-3xl border border-green-500/30 p-6 text-center">
          <Sparkles className="w-10 h-10 text-green-400 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white mb-2">Keep Going!</h3>
          <p className="text-white/60">
            Small daily habits lead to massive results. You&apos;re building the foundation for success!
          </p>
        </div>
      </div>

      {/* Add Habit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-3xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Add New Habit</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-all"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            {/* Preset Habits */}
            <div className="space-y-2">
              <p className="text-sm text-white/60">Quick Add</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Water', icon: 'droplets', color: 'blue', target: 8, unit: 'glasses' },
                  { name: 'Sleep', icon: 'moon', color: 'purple', target: 8, unit: 'hours' },
                  { name: 'Steps', icon: 'footprints', color: 'green', target: 10000, unit: 'steps' },
                  { name: 'Meditate', icon: 'brain', color: 'orange', target: 10, unit: 'min' },
                  { name: 'Exercise', icon: 'flame', color: 'pink', target: 1, unit: 'workout' },
                  { name: 'Read', icon: 'target', color: 'amber', target: 30, unit: 'min' },
                ].map((preset) => {
                  const IconComponent = ICON_MAP[preset.icon] || Check;
                  const colorClass = COLOR_MAP[preset.color] || COLOR_MAP.purple;
                  return (
                    <button
                      key={preset.name}
                      onClick={() => createHabit(preset)}
                      disabled={saving}
                      className={`p-4 rounded-2xl border border-white/10 hover:border-white/30 transition-all flex items-center gap-3 disabled:opacity-50`}
                    >
                      <div className={`p-2 rounded-xl bg-gradient-to-r ${colorClass}`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-white">{preset.name}</p>
                        <p className="text-xs text-white/50">{preset.target} {preset.unit}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <p className="text-sm text-white/60 mb-3">Or create custom</p>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Habit name..."
                  value={customHabitName}
                  onChange={(e) => setCustomHabitName(e.target.value)}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />

                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    placeholder="Target"
                    value={customHabitTarget}
                    onChange={(e) => setCustomHabitTarget(e.target.value)}
                    className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <input
                    type="text"
                    placeholder="Unit (e.g., glasses)"
                    value={customHabitUnit}
                    onChange={(e) => setCustomHabitUnit(e.target.value)}
                    className="col-span-2 p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={createCustomHabit}
              disabled={saving || !customHabitName.trim()}
              className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl font-semibold text-white hover:from-violet-600 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Create Habit
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Habit Detail Modal */}
      {showDetailModal && selectedHabit && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">{selectedHabit.name}</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-all"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-2xl p-4 text-center">
                <Flame className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{selectedHabit.currentStreak}</p>
                <p className="text-xs text-white/50">Current Streak</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 text-center">
                <Award className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{selectedHabit.longestStreak}</p>
                <p className="text-xs text-white/50">Best Streak</p>
              </div>
            </div>

            {/* Calendar Heatmap - Based on habit completion percentage */}
            <div className="bg-white/5 rounded-2xl p-4">
              <p className="text-sm text-white/60 mb-3">Last 30 Days</p>
              <div className="grid grid-cols-7 gap-1">
                {[...Array(30)].map((_, i) => {
                  // Calculate based on streak data - show completed days based on current streak
                  const daysAgo = 29 - i;
                  const isCompleted = selectedHabit && daysAgo < selectedHabit.currentStreak;
                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded-sm ${
                        isCompleted
                          ? 'bg-gradient-to-r from-violet-500/50 to-purple-600/50'
                          : 'bg-white/10'
                      }`}
                      title={isCompleted ? 'Completed' : 'Not completed'}
                    />
                  );
                })}
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-white/60" />
                  <span className="text-white">Reminder</span>
                </div>
                <button
                  onClick={() => toast.info('Coming soon', 'Reminders will be available in a future update')}
                  className="px-3 py-1 bg-white/10 rounded-lg text-sm text-white/60 hover:bg-white/20 transition-colors"
                >
                  Off
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-white/60" />
                  <span className="text-white">Daily Target</span>
                </div>
                <span className="text-white/60">
                  {selectedHabit.targetValue} {selectedHabit.unit}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => selectedHabit && confirmDeleteHabit(selectedHabit.id)}
                disabled={deleting}
                className="flex-1 py-3 bg-red-500/20 text-red-400 rounded-2xl font-medium hover:bg-red-500/30 transition-all disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Habit'}
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 py-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl font-semibold text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, habitId: null })}
        onConfirm={() => deleteConfirm.habitId && deleteHabit(deleteConfirm.habitId)}
        title="Delete Habit?"
        message="This habit and all its tracking history will be permanently deleted."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
