'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Trophy, TrendingUp, Dumbbell, Timer, Ruler, Flame,
  ChevronRight, Star, Zap, Crown, Medal, Target, Plus, X,
  Calendar, Award, Sparkles, PartyPopper, Loader2
} from 'lucide-react';
import Celebration, { useCelebration } from '@/components/Celebration';
import { useToast } from '@/components/Toast';
import { triggerHaptic } from '@/lib/haptics';
import { staggerContainer, listItem, cardHover, cardTap, fadeInUp, popIn } from '@/lib/animations';

// Hero image
const HERO_IMAGE = 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=1200&auto=format&fit=crop&q=80';


interface PersonalRecord {
  id: string;
  exerciseName: string;
  category: 'strength' | 'cardio' | 'bodyweight' | 'olympic';
  maxWeight?: number;
  maxReps?: number;
  fastestTime?: number;
  longestDistance?: number;
  unit: string;
  achievedAt: string;
  improvement?: number;
  isNew?: boolean;
}

interface PRHistory {
  id: string;
  exerciseName: string;
  recordType: string;
  previousValue: number;
  newValue: number;
  improvement: number;
  achievedAt: string;
}

const SAMPLE_RECORDS: PersonalRecord[] = [
  { id: '1', exerciseName: 'Bench Press', category: 'strength', maxWeight: 225, maxReps: 5, unit: 'lbs', achievedAt: '2025-01-02', improvement: 10, isNew: true },
  { id: '2', exerciseName: 'Deadlift', category: 'strength', maxWeight: 405, maxReps: 3, unit: 'lbs', achievedAt: '2024-12-28' },
  { id: '3', exerciseName: 'Squat', category: 'strength', maxWeight: 315, maxReps: 5, unit: 'lbs', achievedAt: '2024-12-20' },
  { id: '4', exerciseName: 'Pull-ups', category: 'bodyweight', maxReps: 18, unit: 'reps', achievedAt: '2024-12-15' },
  { id: '5', exerciseName: 'Push-ups', category: 'bodyweight', maxReps: 65, unit: 'reps', achievedAt: '2024-12-10' },
  { id: '6', exerciseName: '5K Run', category: 'cardio', fastestTime: 1380, longestDistance: 5, unit: 'km', achievedAt: '2024-12-05' },
  { id: '7', exerciseName: 'Clean & Jerk', category: 'olympic', maxWeight: 185, unit: 'lbs', achievedAt: '2024-11-30' },
  { id: '8', exerciseName: 'Snatch', category: 'olympic', maxWeight: 155, unit: 'lbs', achievedAt: '2024-11-25' },
];

const SAMPLE_HISTORY: PRHistory[] = [
  { id: '1', exerciseName: 'Bench Press', recordType: 'max_weight', previousValue: 215, newValue: 225, improvement: 4.7, achievedAt: '2025-01-02' },
  { id: '2', exerciseName: 'Deadlift', recordType: 'max_weight', previousValue: 385, newValue: 405, improvement: 5.2, achievedAt: '2024-12-28' },
  { id: '3', exerciseName: 'Pull-ups', recordType: 'max_reps', previousValue: 15, newValue: 18, improvement: 20, achievedAt: '2024-12-15' },
];

const CATEGORY_CONFIG = {
  strength: { icon: Dumbbell, color: 'from-violet-500 to-purple-600', label: 'Strength' },
  cardio: { icon: Timer, color: 'from-green-500 to-emerald-600', label: 'Cardio' },
  bodyweight: { icon: Zap, color: 'from-orange-500 to-red-600', label: 'Bodyweight' },
  olympic: { icon: Crown, color: 'from-amber-500 to-yellow-600', label: 'Olympic' },
};

export default function RecordsPage() {
  const { data: session } = useSession();
  const toast = useToast();
  const [records, setRecords] = useState<PersonalRecord[]>(SAMPLE_RECORDS);
  const [history, setHistory] = useState<PRHistory[]>(SAMPLE_HISTORY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showNewPRModal, setShowNewPRModal] = useState(false);
  const [celebratedPR, setCelebratedPR] = useState<PersonalRecord | null>(null);

  // Use the celebration hook for premium animations
  const { celebrate, CelebrationComponent } = useCelebration();

  // Form state for new PR
  const [newPRForm, setNewPRForm] = useState({
    exerciseName: '',
    category: 'strength' as 'strength' | 'cardio' | 'bodyweight' | 'olympic',
    weight: '',
    reps: '',
    unit: 'lbs',
  });

  // Fetch records from API
  useEffect(() => {
    const fetchRecords = async () => {
      if (!session?.user) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/records');
        if (response.ok) {
          const data = await response.json();
          if (data.records && data.records.length > 0) {
            const transformedRecords = data.records.map((r: any) => ({
              id: r.id,
              exerciseName: r.exerciseName,
              category: r.category,
              maxWeight: r.maxWeight,
              maxReps: r.maxReps,
              fastestTime: r.fastestTime,
              longestDistance: r.longestDistance,
              unit: r.unit,
              achievedAt: r.updatedAt || r.createdAt,
              improvement: r.improvement,
              isNew: r.isNew,
            }));
            setRecords(transformedRecords);
          }
          if (data.history && data.history.length > 0) {
            const transformedHistory = data.history.map((h: any) => ({
              id: h.id,
              exerciseName: h.exerciseName,
              recordType: h.recordType,
              previousValue: h.previousValue,
              newValue: h.newValue,
              improvement: h.improvementPercent || ((h.newValue - h.previousValue) / h.previousValue * 100),
              achievedAt: h.achievedAt || h.createdAt,
            }));
            setHistory(transformedHistory);
          }
        }
      } catch (error) {
        console.error('Error fetching records:', error);
        toast.error('Failed to load records', 'Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [session]);

  // Check for new PRs and celebrate
  useEffect(() => {
    const newPR = records.find(r => r.isNew);
    if (newPR) {
      setCelebratedPR(newPR);
      triggerHaptic('success');
      celebrate('pr', 'NEW PR!', `${newPR.exerciseName} - ${newPR.maxWeight || newPR.maxReps}${newPR.unit}`);
    }
  }, [records, celebrate]);

  const savePR = async () => {
    if (!newPRForm.exerciseName || (!newPRForm.weight && !newPRForm.reps)) {
      return;
    }

    setSaving(true);

    // Create local record for demo
    const newRecord: PersonalRecord = {
      id: `local-${Date.now()}`,
      exerciseName: newPRForm.exerciseName,
      category: newPRForm.category,
      maxWeight: newPRForm.weight ? parseInt(newPRForm.weight) : undefined,
      maxReps: newPRForm.reps ? parseInt(newPRForm.reps) : undefined,
      unit: newPRForm.unit,
      achievedAt: new Date().toISOString(),
      isNew: true,
      improvement: 5,
    };

    if (session?.user) {
      try {
        const response = await fetch('/api/records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            exerciseName: newPRForm.exerciseName,
            category: newPRForm.category,
            value: newPRForm.weight ? parseInt(newPRForm.weight) : parseInt(newPRForm.reps),
            reps: newPRForm.reps ? parseInt(newPRForm.reps) : undefined,
            unit: newPRForm.unit,
            recordType: 'max_weight',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.isNewPR) {
            newRecord.id = data.record.id;
          }
        }
      } catch (error) {
        console.error('Error saving PR:', error);
        toast.error('Failed to save PR', 'Please try again.');
      }
    }

    setRecords([newRecord, ...records.map(r => ({ ...r, isNew: false }))]);
    setShowNewPRModal(false);
    setNewPRForm({ exerciseName: '', category: 'strength', weight: '', reps: '', unit: 'lbs' });
    setSaving(false);

    // Trigger celebration with haptic feedback
    setCelebratedPR(newRecord);
    triggerHaptic('success');
    celebrate('pr', 'NEW PR!', `${newRecord.exerciseName} - ${newRecord.maxWeight || newRecord.maxReps}${newRecord.unit}`);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getRecordValue = (record: PersonalRecord): string => {
    if (record.maxWeight) return `${record.maxWeight} ${record.unit}`;
    if (record.maxReps) return `${record.maxReps} reps`;
    if (record.fastestTime) return formatTime(record.fastestTime);
    if (record.longestDistance) return `${record.longestDistance} ${record.unit}`;
    return '-';
  };

  const filteredRecords = selectedCategory === 'all'
    ? records
    : records.filter(r => r.category === selectedCategory);

  // Calculate totals
  const totalPRs = records.length;
  const recentPRs = records.filter(r => {
    const date = new Date(r.achievedAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return date > thirtyDaysAgo;
  }).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-violet-500 animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading records...</p>
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
            onClick={() => setShowNewPRModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl font-medium text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Log PR
          </button>
        </div>

        {/* Title & Trophy */}
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-6 h-6 text-amber-400" />
              <span className="text-amber-400 font-semibold">Personal Best</span>
            </div>
            <h1 className="text-3xl font-bold text-white">PR Board</h1>
          </div>

          <div className="text-right">
            <p className="text-4xl font-bold text-white">{totalPRs}</p>
            <p className="text-white/60 text-sm">Total Records</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-violet-500/20 to-purple-600/20 backdrop-blur-xl rounded-2xl border border-violet-500/30 p-4 text-center">
            <Trophy className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{totalPRs}</p>
            <p className="text-xs text-white/60">All Time</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-xl rounded-2xl border border-green-500/30 p-4 text-center">
            <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{recentPRs}</p>
            <p className="text-xs text-white/60">This Month</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-xl rounded-2xl border border-orange-500/30 p-4 text-center">
            <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">
              {records.find(r => r.isNew)?.improvement || 0}%
            </p>
            <p className="text-xs text-white/60">Last PR Gain</p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            All
          </button>
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2 rounded-full whitespace-nowrap flex items-center gap-2 transition-all ${
                  selectedCategory === key
                    ? `bg-gradient-to-r ${config.color} text-white`
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {config.label}
              </button>
            );
          })}
        </div>

        {/* Records List */}
        <motion.div
          className="space-y-3"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Medal className="w-5 h-5 text-amber-400" />
            Your Records
          </h2>

          <AnimatePresence mode="popLayout">
            {filteredRecords.map((record, index) => {
              const categoryConfig = CATEGORY_CONFIG[record.category];
              const CategoryIcon = categoryConfig.icon;

              return (
                <motion.div
                  key={record.id}
                  variants={listItem}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  layout
                  whileHover={cardHover}
                  whileTap={cardTap}
                  className={`bg-white/5 backdrop-blur-xl rounded-2xl border p-4 cursor-pointer ${
                    record.isNew
                      ? 'border-amber-500/50 ring-2 ring-amber-500/20'
                      : 'border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div
                        className={`p-3 rounded-xl bg-gradient-to-r ${categoryConfig.color}`}
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <CategoryIcon className="w-5 h-5 text-white" />
                      </motion.div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">{record.exerciseName}</h3>
                          {record.isNew && (
                            <motion.span
                              className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full flex items-center gap-1"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                            >
                              <Sparkles className="w-3 h-3" />
                              NEW PR!
                            </motion.span>
                          )}
                        </div>
                        <p className="text-sm text-white/50">{formatDate(record.achievedAt)}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-bold text-white">{getRecordValue(record)}</p>
                      {record.improvement && (
                        <motion.p
                          className="text-sm text-green-400 flex items-center justify-end gap-1"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <TrendingUp className="w-3 h-3" />
                          +{record.improvement}%
                        </motion.p>
                      )}
                    </div>
                  </div>

                  {/* Additional details for strength exercises */}
                  {record.maxWeight && record.maxReps && (
                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-4 text-sm text-white/60">
                      <span>Best: {record.maxWeight} {record.unit} × {record.maxReps} reps</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Recent PR History */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-violet-400" />
            PR History
          </h2>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden divide-y divide-white/5">
            {history.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">{item.exerciseName}</h3>
                  <p className="text-sm text-white/50">{formatDate(item.achievedAt)}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-white">
                    <span className="text-white/40">{item.previousValue}</span>
                    <ChevronRight className="w-4 h-4 text-white/40" />
                    <span className="font-bold text-green-400">{item.newValue}</span>
                  </div>
                  <p className="text-sm text-green-400">+{item.improvement.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Motivational Card */}
        <div className="bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-3xl border border-violet-500/30 p-6 text-center">
          <Award className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white mb-2">Keep Breaking Records!</h3>
          <p className="text-white/60">
            You&apos;ve set {totalPRs} personal records. Your next PR is just one workout away!
          </p>
          <Link
            href="/"
            className="inline-block mt-4 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl font-semibold text-white hover:from-violet-600 hover:to-purple-700 transition-all"
          >
            Start Workout
          </Link>
        </div>
      </div>

      {/* New PR Modal */}
      {showNewPRModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Log New PR</h3>
              <button
                onClick={() => setShowNewPRModal(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-all"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Exercise</label>
                <input
                  type="text"
                  value={newPRForm.exerciseName}
                  onChange={(e) => setNewPRForm({ ...newPRForm, exerciseName: e.target.value })}
                  placeholder="e.g., Bench Press"
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setNewPRForm({ ...newPRForm, category: key as any })}
                        className={`p-3 rounded-xl flex items-center gap-2 border transition-all ${
                          newPRForm.category === key
                            ? `bg-gradient-to-r ${config.color} border-transparent text-white`
                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{config.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Weight</label>
                  <input
                    type="number"
                    value={newPRForm.weight}
                    onChange={(e) => setNewPRForm({ ...newPRForm, weight: e.target.value })}
                    placeholder="0"
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Reps</label>
                  <input
                    type="number"
                    value={newPRForm.reps}
                    onChange={(e) => setNewPRForm({ ...newPRForm, reps: e.target.value })}
                    placeholder="0"
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={savePR}
              disabled={saving || !newPRForm.exerciseName || (!newPRForm.weight && !newPRForm.reps)}
              className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl font-semibold text-white hover:from-violet-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
              ) : (
                <Trophy className="w-5 h-5 inline mr-2" />
              )}
              {saving ? 'Saving...' : 'Save PR'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
