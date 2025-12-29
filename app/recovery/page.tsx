'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Moon, Sun, Battery, Brain, Heart, Zap, Activity,
  TrendingUp, TrendingDown, Minus, Loader2, Check, AlertTriangle
} from 'lucide-react';

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

      const data = await res.json();
      if (data.log) {
        setTodayLog(data.log);
        setHasLoggedToday(true);
        fetchRecoveryData();
      }
    } catch (error) {
      console.error('Failed to save recovery data:', error);
    } finally {
      setSaving(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    if (score >= 40) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-rose-600';
  };

  const getIntensityInfo = (intensity: string) => {
    switch (intensity) {
      case 'max': return { label: 'Go All Out', color: 'text-green-400', bg: 'bg-green-500/20' };
      case 'high': return { label: 'Train Hard', color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
      case 'moderate': return { label: 'Moderate Session', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
      case 'light': return { label: 'Light Activity', color: 'text-orange-400', bg: 'bg-orange-500/20' };
      default: return { label: 'Rest Day', color: 'text-red-400', bg: 'bg-red-500/20' };
    }
  };

  const SliderInput = ({
    label,
    value,
    onChange,
    icon: Icon,
    lowLabel,
    highLabel,
    color
  }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
    icon: any;
    lowLabel: string;
    highLabel: string;
    color: string;
  }) => (
    <div className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${color}`} />
          <span className="font-medium">{label}</span>
        </div>
        <span className={`text-xl font-bold ${color}`}>{value}</span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full accent-orange-500"
      />
      <div className="flex justify-between text-xs text-zinc-500 mt-1">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-zinc-800 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">Recovery Score</h1>
            <p className="text-sm text-zinc-400">Track your readiness to train</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Today's Score */}
        {todayLog?.recoveryScore && (
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-40 h-40 rounded-full bg-gradient-to-br ${getScoreColor(todayLog.recoveryScore)} shadow-2xl`}>
              <div>
                <div className="text-5xl font-black">{todayLog.recoveryScore}</div>
                <div className="text-sm opacity-80">Recovery Score</div>
              </div>
            </div>

            {todayLog.recommendedIntensity && (
              <div className="mt-6">
                <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl ${getIntensityInfo(todayLog.recommendedIntensity).bg}`}>
                  <Activity className={`w-5 h-5 ${getIntensityInfo(todayLog.recommendedIntensity).color}`} />
                  <span className={`font-semibold ${getIntensityInfo(todayLog.recommendedIntensity).color}`}>
                    {getIntensityInfo(todayLog.recommendedIntensity).label}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Log Form */}
        <div className="bg-zinc-900/30 rounded-3xl p-6 border border-zinc-800">
          <h2 className="text-lg font-semibold mb-6">
            {hasLoggedToday ? 'Update Today\'s Check-in' : 'Morning Check-in'}
          </h2>

          <div className="space-y-4">
            {/* Sleep Hours */}
            <div className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Moon className="w-5 h-5 text-indigo-400" />
                  <span className="font-medium">Sleep Duration</span>
                </div>
                <span className="text-xl font-bold text-indigo-400">{sleepHours}h</span>
              </div>
              <input
                type="range"
                min="3"
                max="12"
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-zinc-500 mt-1">
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
              color="text-purple-400"
            />

            <SliderInput
              label="Energy Level"
              value={energyLevel}
              onChange={setEnergyLevel}
              icon={Zap}
              lowLabel="Exhausted"
              highLabel="Energized"
              color="text-yellow-400"
            />

            <SliderInput
              label="Motivation"
              value={motivation}
              onChange={setMotivation}
              icon={TrendingUp}
              lowLabel="None"
              highLabel="Fired Up"
              color="text-orange-400"
            />

            <SliderInput
              label="Stress Level"
              value={stressLevel}
              onChange={setStressLevel}
              icon={Brain}
              lowLabel="Calm"
              highLabel="Stressed"
              color="text-red-400"
            />

            <SliderInput
              label="Muscle Soreness"
              value={muscleSoreness}
              onChange={setMuscleSoreness}
              icon={Activity}
              lowLabel="Fresh"
              highLabel="Very Sore"
              color="text-pink-400"
            />

            <SliderInput
              label="Mood"
              value={mood}
              onChange={setMood}
              icon={Heart}
              lowLabel="Low"
              highLabel="Great"
              color="text-rose-400"
            />

            <button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  {hasLoggedToday ? 'Update Score' : 'Calculate Recovery Score'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Recent History */}
        {logs.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Recent History</h3>
            <div className="space-y-2">
              {logs.slice(0, 7).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl border border-zinc-800"
                >
                  <div>
                    <div className="font-medium">
                      {new Date(log.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-sm text-zinc-400">
                      {log.sleepHours}h sleep • {log.recommendedIntensity}
                    </div>
                  </div>
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getScoreColor(log.recoveryScore || 0)} flex items-center justify-center`}>
                    <span className="text-xl font-bold">{log.recoveryScore || '-'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-zinc-900/30 rounded-2xl p-6 border border-zinc-800">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Recovery Tips
          </h3>
          <ul className="space-y-3 text-zinc-300">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-400 mt-1 shrink-0" />
              Aim for 7-9 hours of quality sleep each night
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-400 mt-1 shrink-0" />
              Log your recovery first thing in the morning for best accuracy
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-400 mt-1 shrink-0" />
              High stress and soreness? Consider a lighter workout
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-400 mt-1 shrink-0" />
              Connect a fitness tracker for automatic HRV data
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
