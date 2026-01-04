'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Moon, Battery, Brain, Heart, Zap, Activity,
  TrendingUp, Loader2, Check, Sparkles, Clock, Lightbulb
} from 'lucide-react';
import { useToast } from '@/components/Toast';

// Premium stock image
const HERO_IMAGE = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&auto=format&fit=crop&q=80';

interface RecoveryLog {
  id: string;
  date: string;
  sleepHours?: number;
  sleepQuality?: number;
  energyLevel?: number;
  motivation?: number;
  stressLevel?: number;
  muscleSoreness?: number;
  mood?: number;
  recoveryScore?: number;
  recommendedIntensity?: string;
}

export default function RecoveryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logs, setLogs] = useState<RecoveryLog[]>([]);
  const [todayLog, setTodayLog] = useState<RecoveryLog | null>(null);
  const [hasLoggedToday, setHasLoggedToday] = useState(false);

  // Form state
  const [sleepHours, setSleepHours] = useState(7);
  const [sleepQuality, setSleepQuality] = useState(7);
  const [energyLevel, setEnergyLevel] = useState(7);
  const [motivation, setMotivation] = useState(7);
  const [stressLevel, setStressLevel] = useState(4);
  const [muscleSoreness, setMuscleSoreness] = useState(3);
  const [mood, setMood] = useState(7);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    fetchRecoveryData();
  }, []);

  const fetchRecoveryData = async () => {
    try {
      const res = await fetch('/api/recovery?days=14');
      if (!res.ok) throw new Error('Failed to fetch recovery data');
      const data = await res.json();
      setLogs(data.logs || []);
      setTodayLog(data.todayLog);
      setHasLoggedToday(data.hasLoggedToday);

      if (data.todayLog) {
        setSleepHours(data.todayLog.sleepHours || 7);
        setSleepQuality(data.todayLog.sleepQuality || 7);
        setEnergyLevel(data.todayLog.energyLevel || 7);
        setMotivation(data.todayLog.motivation || 7);
        setStressLevel(data.todayLog.stressLevel || 4);
        setMuscleSoreness(data.todayLog.muscleSoreness || 3);
        setMood(data.todayLog.mood || 7);
      }
    } catch (error) {
      console.error('Failed to fetch recovery data:', error);
      toast.error('Failed to load recovery data', 'Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sleepHours,
          sleepQuality,
          energyLevel,
          motivation,
          stressLevel,
          muscleSoreness,
          mood,
        }),
      });

      if (!res.ok) throw new Error('Failed to save recovery data');
      const data = await res.json();
      if (data.log) {
        setTodayLog(data.log);
        setHasLoggedToday(true);
        fetchRecoveryData();
        toast.success('Recovery logged', 'Your recovery data has been saved.');
      }
    } catch (error) {
      console.error('Failed to save recovery data:', error);
      toast.error('Failed to save recovery data', 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-400 to-emerald-500';
    if (score >= 60) return 'from-yellow-400 to-orange-500';
    if (score >= 40) return 'from-orange-400 to-red-500';
    return 'from-red-400 to-rose-500';
  };

  const getScoreGlow = (score: number) => {
    if (score >= 80) return 'shadow-green-500/30';
    if (score >= 60) return 'shadow-yellow-500/30';
    if (score >= 40) return 'shadow-orange-500/30';
    return 'shadow-red-500/30';
  };

  const getIntensityInfo = (intensity: string) => {
    switch (intensity) {
      case 'max': return { label: 'Go All Out!', desc: 'You\'re fully recovered', color: 'text-green-400', bg: 'from-green-500/20 to-emerald-500/10', border: 'border-green-500/30' };
      case 'high': return { label: 'Train Hard', desc: 'Great energy today', color: 'text-emerald-400', bg: 'from-emerald-500/20 to-teal-500/10', border: 'border-emerald-500/30' };
      case 'moderate': return { label: 'Moderate Session', desc: 'Listen to your body', color: 'text-yellow-400', bg: 'from-yellow-500/20 to-amber-500/10', border: 'border-yellow-500/30' };
      case 'light': return { label: 'Light Activity', desc: 'Active recovery day', color: 'text-orange-400', bg: 'from-orange-500/20 to-amber-500/10', border: 'border-orange-500/30' };
      default: return { label: 'Rest Day', desc: 'Focus on recovery', color: 'text-red-400', bg: 'from-red-500/20 to-rose-500/10', border: 'border-red-500/30' };
    }
  };

  const SliderInput = ({
    label,
    value,
    onChange,
    icon: Icon,
    lowLabel,
    highLabel,
    gradient,
    iconColor,
  }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
    icon: any;
    lowLabel: string;
    highLabel: string;
    gradient: string;
    iconColor: string;
  }) => (
    <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-white">{label}</span>
        </div>
        <span className={`text-2xl font-bold ${iconColor}`}>{value}</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min="1"
          max="10"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-orange-500 [&::-webkit-slider-thumb]:to-pink-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-orange-500/30 [&::-webkit-slider-thumb]:cursor-pointer"
        />
        <div className="absolute top-0 left-0 right-0 h-2 rounded-full overflow-hidden pointer-events-none">
          <div
            className={`h-full bg-gradient-to-r ${gradient} transition-all`}
            style={{ width: `${(value - 1) / 9 * 100}%` }}
          />
        </div>
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center animate-pulse">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-400">Loading recovery data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Header */}
      <div className="relative">
        <div
          className="h-56 bg-cover bg-center"
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
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Recovery Score</h1>
          </div>
          <p className="text-white/70">Track your readiness to train</p>
        </div>
      </div>

      <div className="px-4 -mt-2 pb-8">
        {/* Today's Score Card */}
        {todayLog?.recoveryScore && (
          <div className="relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 mb-6">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-radial from-cyan-500/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />

            <div className="relative flex items-center gap-6">
              {/* Score Circle */}
              <div className={`relative w-28 h-28 rounded-full bg-gradient-to-br ${getScoreColor(todayLog.recoveryScore)} shadow-2xl ${getScoreGlow(todayLog.recoveryScore)} flex items-center justify-center`}>
                <div className="absolute inset-1 bg-slate-900 rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-black text-white">{todayLog.recoveryScore}</div>
                    <div className="text-xs text-gray-400">Score</div>
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              {todayLog.recommendedIntensity && (
                <div className="flex-1">
                  <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r ${getIntensityInfo(todayLog.recommendedIntensity).bg} border ${getIntensityInfo(todayLog.recommendedIntensity).border} mb-2`}>
                    <Activity className={`w-4 h-4 ${getIntensityInfo(todayLog.recommendedIntensity).color}`} />
                    <span className={`text-sm font-semibold ${getIntensityInfo(todayLog.recommendedIntensity).color}`}>
                      {getIntensityInfo(todayLog.recommendedIntensity).label}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">{getIntensityInfo(todayLog.recommendedIntensity).desc}</p>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="text-center p-3 bg-white/5 rounded-xl">
                <Moon className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{todayLog.sleepHours}h</p>
                <p className="text-xs text-gray-500">Sleep</p>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-xl">
                <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{todayLog.energyLevel}/10</p>
                <p className="text-xs text-gray-500">Energy</p>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-xl">
                <Heart className="w-5 h-5 text-rose-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{todayLog.mood}/10</p>
                <p className="text-xs text-gray-500">Mood</p>
              </div>
            </div>
          </div>
        )}

        {/* Check-in Form */}
        <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white">
                {hasLoggedToday ? 'Update Check-in' : 'Morning Check-in'}
              </h2>
              <p className="text-sm text-gray-400">How are you feeling today?</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Sleep Hours */}
            <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-white">Sleep Duration</span>
                </div>
                <span className="text-2xl font-bold text-indigo-400">{sleepHours}h</span>
              </div>
              <input
                type="range"
                min="3"
                max="12"
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-indigo-500 [&::-webkit-slider-thumb]:to-purple-500 [&::-webkit-slider-thumb]:shadow-lg"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>3 hours</span>
                <span>12 hours</span>
              </div>
            </div>

            <SliderInput
              label="Sleep Quality"
              value={sleepQuality}
              onChange={setSleepQuality}
              icon={Moon}
              lowLabel="Terrible"
              highLabel="Amazing"
              gradient="from-purple-500 to-violet-600"
              iconColor="text-purple-400"
            />

            <SliderInput
              label="Energy Level"
              value={energyLevel}
              onChange={setEnergyLevel}
              icon={Zap}
              lowLabel="Exhausted"
              highLabel="Energized"
              gradient="from-yellow-500 to-amber-600"
              iconColor="text-yellow-400"
            />

            <SliderInput
              label="Motivation"
              value={motivation}
              onChange={setMotivation}
              icon={TrendingUp}
              lowLabel="None"
              highLabel="Fired Up"
              gradient="from-orange-500 to-red-600"
              iconColor="text-orange-400"
            />

            <SliderInput
              label="Stress Level"
              value={stressLevel}
              onChange={setStressLevel}
              icon={Brain}
              lowLabel="Calm"
              highLabel="Stressed"
              gradient="from-red-500 to-rose-600"
              iconColor="text-red-400"
            />

            <SliderInput
              label="Muscle Soreness"
              value={muscleSoreness}
              onChange={setMuscleSoreness}
              icon={Activity}
              lowLabel="Fresh"
              highLabel="Very Sore"
              gradient="from-pink-500 to-rose-600"
              iconColor="text-pink-400"
            />

            <SliderInput
              label="Mood"
              value={mood}
              onChange={setMood}
              icon={Heart}
              lowLabel="Low"
              highLabel="Great"
              gradient="from-rose-500 to-pink-600"
              iconColor="text-rose-400"
            />

            <button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl font-bold text-lg text-white flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-orange-500/25 transition-all disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Battery className="w-5 h-5" />
                  {hasLoggedToday ? 'Update Score' : 'Calculate Recovery Score'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Recent History */}
        {logs.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-4">Recent History</h3>
            <div className="space-y-3">
              {logs.slice(0, 7).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10"
                >
                  <div>
                    <div className="font-semibold text-white">
                      {new Date(log.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Moon className="w-3.5 h-3.5" />
                      {log.sleepHours}h sleep
                      <span className="text-gray-600">•</span>
                      <span className="capitalize">{log.recommendedIntensity}</span>
                    </div>
                  </div>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getScoreColor(log.recoveryScore || 0)} flex items-center justify-center shadow-lg ${getScoreGlow(log.recoveryScore || 0)}`}>
                    <span className="text-xl font-bold text-white">{log.recoveryScore || '-'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-white">Recovery Tips</h3>
          </div>
          <ul className="space-y-3">
            {[
              'Aim for 7-9 hours of quality sleep each night',
              'Log your recovery first thing in the morning',
              'High stress and soreness? Consider a lighter workout',
              'Stay hydrated and eat nutritious meals',
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-green-400" />
                </div>
                <span className="text-gray-300 text-sm">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
