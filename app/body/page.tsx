'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Scale,
  Ruler,
  Camera,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowLeft,
  Loader2,
  X,
  Check,
  Target,
  Flame,
  BarChart3,
  ChevronRight,
  Activity,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/components/Toast';

// Premium stock images
const HERO_IMAGE = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&auto=format&fit=crop&q=80';
const WEIGHT_BG = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop&q=80';
const MEASURE_BG = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=80';
const PHOTO_BG = 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=80';

interface WeightLog {
  id: string;
  weight: number;
  unit: string;
  notes?: string;
  loggedAt: string;
}

interface BodyMeasurement {
  id: string;
  chest?: number;
  waist?: number;
  hips?: number;
  leftArm?: number;
  rightArm?: number;
  leftThigh?: number;
  rightThigh?: number;
  leftCalf?: number;
  rightCalf?: number;
  neck?: number;
  shoulders?: number;
  bodyFatPercent?: number;
  unit: string;
  notes?: string;
  measuredAt: string;
}

interface UserProfile {
  currentWeight?: number;
  targetWeight?: number;
  height?: number;
}

export default function BodyTrackingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'weight' | 'measurements' | 'photos'>('weight');
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddWeight, setShowAddWeight] = useState(false);
  const [showAddMeasurement, setShowAddMeasurement] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newWeight, setNewWeight] = useState({
    weight: '',
    unit: 'kg',
    notes: '',
  });

  const [newMeasurement, setNewMeasurement] = useState({
    chest: '',
    waist: '',
    hips: '',
    leftArm: '',
    rightArm: '',
    leftThigh: '',
    rightThigh: '',
    neck: '',
    shoulders: '',
    bodyFatPercent: '',
    unit: 'cm',
    notes: '',
  });

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
      const [weightRes, measurementRes, profileRes] = await Promise.all([
        fetch('/api/body/weight?limit=90'),
        fetch('/api/body/measurements?limit=30'),
        fetch('/api/profile'),
      ]);

      const [weightData, measurementData, profileData] = await Promise.all([
        weightRes.json(),
        measurementRes.json(),
        profileRes.json(),
      ]);

      setWeightLogs(weightData.logs || []);
      setMeasurements(measurementData.measurements || []);
      setProfile(profileData.user);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data', 'Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWeight = async () => {
    if (!newWeight.weight) return;
    setSaving(true);
    try {
      const res = await fetch('/api/body/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight: parseFloat(newWeight.weight),
          unit: newWeight.unit,
          notes: newWeight.notes || undefined,
        }),
      });
      const data = await res.json();
      if (data.log) {
        setWeightLogs([data.log, ...weightLogs]);
        setNewWeight({ weight: '', unit: 'kg', notes: '' });
        setShowAddWeight(false);
        toast.success('Weight logged', 'Your weight has been recorded.');
      }
    } catch (error) {
      console.error('Failed to add weight:', error);
      toast.error('Failed to save weight', 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddMeasurement = async () => {
    setSaving(true);
    try {
      const measurementData: Record<string, number | string | undefined> = {
        unit: newMeasurement.unit,
      };

      if (newMeasurement.chest) measurementData.chest = parseFloat(newMeasurement.chest);
      if (newMeasurement.waist) measurementData.waist = parseFloat(newMeasurement.waist);
      if (newMeasurement.hips) measurementData.hips = parseFloat(newMeasurement.hips);
      if (newMeasurement.leftArm) measurementData.leftArm = parseFloat(newMeasurement.leftArm);
      if (newMeasurement.rightArm) measurementData.rightArm = parseFloat(newMeasurement.rightArm);
      if (newMeasurement.leftThigh) measurementData.leftThigh = parseFloat(newMeasurement.leftThigh);
      if (newMeasurement.rightThigh) measurementData.rightThigh = parseFloat(newMeasurement.rightThigh);
      if (newMeasurement.neck) measurementData.neck = parseFloat(newMeasurement.neck);
      if (newMeasurement.shoulders) measurementData.shoulders = parseFloat(newMeasurement.shoulders);
      if (newMeasurement.bodyFatPercent) measurementData.bodyFatPercent = parseFloat(newMeasurement.bodyFatPercent);
      if (newMeasurement.notes) measurementData.notes = newMeasurement.notes;

      const res = await fetch('/api/body/measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(measurementData),
      });
      const data = await res.json();
      if (data.measurement) {
        setMeasurements([data.measurement, ...measurements]);
        setNewMeasurement({
          chest: '', waist: '', hips: '', leftArm: '', rightArm: '',
          leftThigh: '', rightThigh: '', neck: '', shoulders: '',
          bodyFatPercent: '', unit: 'cm', notes: '',
        });
        setShowAddMeasurement(false);
        toast.success('Measurements saved', 'Your measurements have been recorded.');
      }
    } catch (error) {
      console.error('Failed to add measurement:', error);
      toast.error('Failed to save measurements', 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center animate-pulse">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-400">Loading body tracking...</p>
        </div>
      </div>
    );
  }

  const latestWeight = weightLogs[0];
  const previousWeight = weightLogs[1];
  const weightChange = latestWeight && previousWeight
    ? latestWeight.weight - previousWeight.weight
    : 0;

  const targetDiff = profile?.targetWeight && latestWeight
    ? latestWeight.weight - profile.targetWeight
    : null;

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
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
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
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Body Tracking</h1>
          </div>
          <p className="text-white/70">Track your transformation journey</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 -mt-2">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-xl border border-blue-500/20 p-4">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-medium mb-2">
                <Scale className="w-4 h-4" />
                Current Weight
              </div>
              <p className="text-3xl font-bold text-white">
                {latestWeight ? latestWeight.weight : '--'}
                <span className="text-sm text-gray-400 ml-1 font-normal">{latestWeight?.unit || 'kg'}</span>
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-xl border border-green-500/20 p-4">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-2 text-green-400 text-xs font-medium mb-2">
                <Target className="w-4 h-4" />
                Target Weight
              </div>
              <p className="text-3xl font-bold text-white">
                {profile?.targetWeight || '--'}
                <span className="text-sm text-gray-400 ml-1 font-normal">kg</span>
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur-xl border border-purple-500/20 p-4">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-medium mb-2">
                {weightChange < 0 ? <TrendingDown className="w-4 h-4" /> :
                 weightChange > 0 ? <TrendingUp className="w-4 h-4" /> :
                 <Minus className="w-4 h-4" />}
                Change
              </div>
              <p className={`text-3xl font-bold ${
                weightChange < 0 ? 'text-green-400' :
                weightChange > 0 ? 'text-red-400' : 'text-gray-400'
              }`}>
                {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)}
                <span className="text-sm text-gray-400 ml-1 font-normal">kg</span>
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 backdrop-blur-xl border border-orange-500/20 p-4">
            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-2 text-orange-400 text-xs font-medium mb-2">
                <Flame className="w-4 h-4" />
                To Goal
              </div>
              <p className={`text-3xl font-bold ${
                targetDiff && targetDiff <= 0 ? 'text-green-400' : 'text-white'
              }`}>
                {targetDiff !== null ? (targetDiff > 0 ? targetDiff.toFixed(1) : '🎉') : '--'}
                {targetDiff !== null && targetDiff > 0 && <span className="text-sm text-gray-400 ml-1 font-normal">kg</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 p-1.5 bg-white/5 backdrop-blur-xl rounded-2xl mb-6 border border-white/10">
          <button
            onClick={() => setActiveTab('weight')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'weight'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Scale className="w-4 h-4" />
            Weight
          </button>
          <button
            onClick={() => setActiveTab('measurements')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'measurements'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Ruler className="w-4 h-4" />
            Measure
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'photos'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            Photos
          </button>
        </div>

        {/* Tab Content */}
        <div className="pb-8">
          {activeTab === 'weight' && (
            <div className="space-y-4">
              {/* Add Weight Button */}
              <button
                onClick={() => setShowAddWeight(true)}
                className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-dashed border-blue-500/30 hover:border-blue-500/50 p-5 transition-all group"
              >
                <div className="flex items-center justify-center gap-3 text-blue-400 group-hover:text-blue-300">
                  <div className="p-2 bg-blue-500/20 rounded-xl">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="font-semibold">Log Today&apos;s Weight</span>
                </div>
              </button>

              {/* Weight Chart */}
              {weightLogs.length > 1 && (
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-400" />
                      Weight Trend
                    </h3>
                    <span className="text-xs text-gray-500">Last 30 entries</span>
                  </div>
                  <div className="flex items-end gap-1 h-28">
                    {weightLogs.slice(0, 30).reverse().map((log, idx) => {
                      const minWeight = Math.min(...weightLogs.slice(0, 30).map(l => l.weight));
                      const maxWeight = Math.max(...weightLogs.slice(0, 30).map(l => l.weight));
                      const range = maxWeight - minWeight || 1;
                      const height = ((log.weight - minWeight) / range) * 80 + 20;
                      const isLatest = idx === weightLogs.slice(0, 30).length - 1;
                      return (
                        <div
                          key={log.id}
                          className={`flex-1 rounded-t-lg transition-all cursor-pointer ${
                            isLatest
                              ? 'bg-gradient-to-t from-blue-500 to-blue-400'
                              : 'bg-gradient-to-t from-blue-500/50 to-blue-400/50 hover:from-blue-500/70 hover:to-blue-400/70'
                          }`}
                          style={{ height: `${height}%` }}
                          title={`${log.weight} ${log.unit} - ${new Date(log.loggedAt).toLocaleDateString()}`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-3 text-xs text-gray-500">
                    <span>{weightLogs.length > 30 ? '30 days ago' : `${weightLogs.length} entries`}</span>
                    <span>Today</span>
                  </div>
                </div>
              )}

              {/* Weight History */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Recent Entries</h3>
                {weightLogs.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                      <Scale className="w-8 h-8 text-blue-400" />
                    </div>
                    <p className="text-gray-400 font-medium">No weight entries yet</p>
                    <p className="text-sm text-gray-500 mt-1">Start logging to track your progress</p>
                  </div>
                ) : (
                  weightLogs.slice(0, 10).map((log, idx) => {
                    const prevLog = weightLogs[idx + 1];
                    const change = prevLog ? log.weight - prevLog.weight : 0;
                    return (
                      <div
                        key={log.id}
                        className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center gap-4"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                          <Scale className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-xl text-white">{log.weight} <span className="text-sm font-normal text-gray-400">{log.unit}</span></p>
                          <p className="text-sm text-gray-500">
                            {new Date(log.loggedAt).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                        {change !== 0 && (
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
                            change < 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {change < 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                            <span className="text-sm font-semibold">{Math.abs(change).toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'measurements' && (
            <div className="space-y-4">
              {/* Add Measurement Button */}
              <button
                onClick={() => setShowAddMeasurement(true)}
                className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-dashed border-emerald-500/30 hover:border-emerald-500/50 p-5 transition-all group"
              >
                <div className="flex items-center justify-center gap-3 text-emerald-400 group-hover:text-emerald-300">
                  <div className="p-2 bg-emerald-500/20 rounded-xl">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="font-semibold">Log Measurements</span>
                </div>
              </button>

              {/* Latest Measurements */}
              {measurements.length > 0 && (
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 overflow-hidden">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-semibold text-white">Latest Measurements</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {measurements[0].chest && (
                      <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                        <p className="text-xs text-emerald-400 font-medium mb-1">Chest</p>
                        <p className="text-2xl font-bold text-white">{measurements[0].chest}<span className="text-sm text-gray-400 ml-1">{measurements[0].unit}</span></p>
                      </div>
                    )}
                    {measurements[0].waist && (
                      <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
                        <p className="text-xs text-blue-400 font-medium mb-1">Waist</p>
                        <p className="text-2xl font-bold text-white">{measurements[0].waist}<span className="text-sm text-gray-400 ml-1">{measurements[0].unit}</span></p>
                      </div>
                    )}
                    {measurements[0].hips && (
                      <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                        <p className="text-xs text-purple-400 font-medium mb-1">Hips</p>
                        <p className="text-2xl font-bold text-white">{measurements[0].hips}<span className="text-sm text-gray-400 ml-1">{measurements[0].unit}</span></p>
                      </div>
                    )}
                    {measurements[0].leftArm && (
                      <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20">
                        <p className="text-xs text-orange-400 font-medium mb-1">Left Arm</p>
                        <p className="text-2xl font-bold text-white">{measurements[0].leftArm}<span className="text-sm text-gray-400 ml-1">{measurements[0].unit}</span></p>
                      </div>
                    )}
                    {measurements[0].rightArm && (
                      <div className="p-4 rounded-xl bg-gradient-to-br from-rose-500/10 to-red-500/10 border border-rose-500/20">
                        <p className="text-xs text-rose-400 font-medium mb-1">Right Arm</p>
                        <p className="text-2xl font-bold text-white">{measurements[0].rightArm}<span className="text-sm text-gray-400 ml-1">{measurements[0].unit}</span></p>
                      </div>
                    )}
                    {measurements[0].bodyFatPercent && (
                      <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-sky-500/10 border border-cyan-500/20">
                        <p className="text-xs text-cyan-400 font-medium mb-1">Body Fat</p>
                        <p className="text-2xl font-bold text-white">{measurements[0].bodyFatPercent}<span className="text-sm text-gray-400 ml-1">%</span></p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-4 text-center">
                    Measured on {new Date(measurements[0].measuredAt).toLocaleDateString()}
                  </p>
                </div>
              )}

              {/* Measurement History */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">History</h3>
                {measurements.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mx-auto mb-4">
                      <Ruler className="w-8 h-8 text-emerald-400" />
                    </div>
                    <p className="text-gray-400 font-medium">No measurements yet</p>
                    <p className="text-sm text-gray-500 mt-1">Track your body measurements over time</p>
                  </div>
                ) : (
                  measurements.map((m) => (
                    <div
                      key={m.id}
                      className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10"
                    >
                      <p className="font-medium text-white mb-3">
                        {new Date(m.measuredAt).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {m.chest && <span className="text-xs px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-full font-medium">Chest: {m.chest}{m.unit}</span>}
                        {m.waist && <span className="text-xs px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-full font-medium">Waist: {m.waist}{m.unit}</span>}
                        {m.hips && <span className="text-xs px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-full font-medium">Hips: {m.hips}{m.unit}</span>}
                        {m.leftArm && <span className="text-xs px-3 py-1.5 bg-orange-500/20 text-orange-400 rounded-full font-medium">L.Arm: {m.leftArm}{m.unit}</span>}
                        {m.rightArm && <span className="text-xs px-3 py-1.5 bg-rose-500/20 text-rose-400 rounded-full font-medium">R.Arm: {m.rightArm}{m.unit}</span>}
                        {m.bodyFatPercent && <span className="text-xs px-3 py-1.5 bg-cyan-500/20 text-cyan-400 rounded-full font-medium">BF: {m.bodyFatPercent}%</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="space-y-4">
              {/* Progress Photos Hero */}
              <div
                className="relative h-48 rounded-2xl bg-cover bg-center overflow-hidden"
                style={{ backgroundImage: `url("${PHOTO_BG}")` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-xl font-bold text-white mb-1">Progress Photos</h3>
                  <p className="text-white/70 text-sm">Visualize your transformation</p>
                </div>
              </div>

              <Link
                href="/body/photos"
                className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/20 hover:border-pink-500/40 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white group-hover:text-pink-300 transition-colors">Manage Photos</p>
                  <p className="text-sm text-gray-400">Take front, side, and back photos</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-pink-400 transition-colors" />
              </Link>

              <div className="p-6 text-center rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-pink-400" />
                </div>
                <p className="text-gray-400 font-medium">Track your visual progress</p>
                <p className="text-sm text-gray-500 mt-1 mb-4">Regular photos help you see changes you might miss</p>
                <Link
                  href="/body/photos"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-pink-500/25 transition-all"
                >
                  <Camera className="w-4 h-4" />
                  Add Photos
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Weight Modal */}
      {showAddWeight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-white/10 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-xl">
                  <Scale className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Log Weight</h3>
              </div>
              <button
                onClick={() => setShowAddWeight(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-2">Weight</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newWeight.weight}
                    onChange={(e) => setNewWeight({ ...newWeight, weight: e.target.value })}
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white text-lg font-semibold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="70.5"
                    autoFocus
                  />
                </div>
                <div className="w-24">
                  <label className="block text-sm text-gray-400 mb-2">Unit</label>
                  <select
                    value={newWeight.unit}
                    onChange={(e) => setNewWeight({ ...newWeight, unit: e.target.value })}
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="kg">kg</option>
                    <option value="lb">lb</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Notes (optional)</label>
                <textarea
                  value={newWeight.notes}
                  onChange={(e) => setNewWeight({ ...newWeight, notes: e.target.value })}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 resize-none"
                  rows={2}
                  placeholder="Morning weight, after workout, etc."
                />
              </div>

              <button
                onClick={handleAddWeight}
                disabled={!newWeight.weight || saving}
                className="w-full p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Check className="w-5 h-5" />
                )}
                Save Weight
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Measurement Modal */}
      {showAddMeasurement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-white/10 p-6 my-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-xl">
                  <Ruler className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Log Measurements</h3>
              </div>
              <button
                onClick={() => setShowAddMeasurement(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4 p-3 bg-white/5 rounded-xl">
                <label className="text-sm text-gray-400">Unit:</label>
                <select
                  value={newMeasurement.unit}
                  onChange={(e) => setNewMeasurement({ ...newMeasurement, unit: e.target.value })}
                  className="px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="cm">cm</option>
                  <option value="in">in</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'chest', label: 'Chest', color: 'emerald' },
                  { key: 'waist', label: 'Waist', color: 'blue' },
                  { key: 'hips', label: 'Hips', color: 'purple' },
                  { key: 'neck', label: 'Neck', color: 'pink' },
                  { key: 'shoulders', label: 'Shoulders', color: 'orange' },
                  { key: 'bodyFatPercent', label: 'Body Fat %', color: 'cyan' },
                  { key: 'leftArm', label: 'Left Arm', color: 'amber' },
                  { key: 'rightArm', label: 'Right Arm', color: 'rose' },
                  { key: 'leftThigh', label: 'Left Thigh', color: 'indigo' },
                  { key: 'rightThigh', label: 'Right Thigh', color: 'teal' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-xs text-gray-400 mb-1.5">{label}</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newMeasurement[key as keyof typeof newMeasurement]}
                      onChange={(e) => setNewMeasurement({ ...newMeasurement, [key]: e.target.value })}
                      className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Notes (optional)</label>
                <textarea
                  value={newMeasurement.notes}
                  onChange={(e) => setNewMeasurement({ ...newMeasurement, notes: e.target.value })}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500 resize-none"
                  rows={2}
                />
              </div>

              <button
                onClick={handleAddMeasurement}
                disabled={saving}
                className="w-full p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Check className="w-5 h-5" />
                )}
                Save Measurements
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
