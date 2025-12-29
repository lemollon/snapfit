'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
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
  Calendar,
  ChevronRight,
  Loader2,
  X,
  Check,
  Target,
  Flame,
  BarChart3,
} from 'lucide-react';

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
      }
    } catch (error) {
      console.error('Failed to add weight:', error);
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
      }
    } catch (error) {
      console.error('Failed to add measurement:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <p className="text-zinc-500 dark:text-zinc-400">Loading body tracking...</p>
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
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-lg border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold">Body Tracking</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl border border-blue-500/30">
            <div className="flex items-center gap-2 text-blue-400 text-sm mb-1">
              <Scale className="w-4 h-4" />
              Current
            </div>
            <p className="text-2xl font-bold">
              {latestWeight ? `${latestWeight.weight}` : '--'}
              <span className="text-sm text-zinc-400 ml-1">{latestWeight?.unit || 'kg'}</span>
            </p>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl border border-green-500/30">
            <div className="flex items-center gap-2 text-green-400 text-sm mb-1">
              <Target className="w-4 h-4" />
              Target
            </div>
            <p className="text-2xl font-bold">
              {profile?.targetWeight || '--'}
              <span className="text-sm text-zinc-400 ml-1">kg</span>
            </p>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl border border-purple-500/30">
            <div className="flex items-center gap-2 text-purple-400 text-sm mb-1">
              {weightChange < 0 ? <TrendingDown className="w-4 h-4" /> :
               weightChange > 0 ? <TrendingUp className="w-4 h-4" /> :
               <Minus className="w-4 h-4" />}
              Change
            </div>
            <p className={`text-2xl font-bold ${
              weightChange < 0 ? 'text-green-400' :
              weightChange > 0 ? 'text-red-400' : 'text-zinc-400'
            }`}>
              {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)}
              <span className="text-sm text-zinc-400 ml-1">kg</span>
            </p>
          </div>

          <div className="p-4 bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-xl border border-orange-500/30">
            <div className="flex items-center gap-2 text-orange-400 text-sm mb-1">
              <Flame className="w-4 h-4" />
              To Goal
            </div>
            <p className={`text-2xl font-bold ${
              targetDiff && targetDiff <= 0 ? 'text-green-400' : 'text-zinc-400'
            }`}>
              {targetDiff !== null ? (targetDiff > 0 ? `-${targetDiff.toFixed(1)}` : 'Goal!') : '--'}
              {targetDiff !== null && targetDiff > 0 && <span className="text-sm text-zinc-400 ml-1">kg left</span>}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg mb-6">
          <button
            onClick={() => setActiveTab('weight')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'weight'
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Scale className="w-4 h-4" />
            Weight
          </button>
          <button
            onClick={() => setActiveTab('measurements')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'measurements'
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Ruler className="w-4 h-4" />
            Measurements
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'photos'
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            Photos
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'weight' && (
          <div className="space-y-6">
            {/* Add Weight Button */}
            <button
              onClick={() => setShowAddWeight(true)}
              className="w-full p-4 bg-zinc-900/50 rounded-xl border border-dashed border-zinc-700 hover:border-orange-500 transition-colors flex items-center justify-center gap-2 text-zinc-400 hover:text-orange-400"
            >
              <Plus className="w-5 h-5" />
              Log Weight
            </button>

            {/* Weight Chart */}
            {weightLogs.length > 1 && (
              <div className="p-6 bg-zinc-100 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  Weight History
                </h3>
                <div className="flex items-end gap-1 h-32">
                  {weightLogs.slice(0, 30).reverse().map((log, idx) => {
                    const minWeight = Math.min(...weightLogs.slice(0, 30).map(l => l.weight));
                    const maxWeight = Math.max(...weightLogs.slice(0, 30).map(l => l.weight));
                    const range = maxWeight - minWeight || 1;
                    const height = ((log.weight - minWeight) / range) * 80 + 20;
                    return (
                      <div
                        key={log.id}
                        className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all hover:from-blue-400 hover:to-blue-300 cursor-pointer"
                        style={{ height: `${height}%` }}
                        title={`${log.weight} ${log.unit} - ${new Date(log.loggedAt).toLocaleDateString()}`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between mt-2 text-xs text-zinc-400">
                  <span>{weightLogs.length > 30 ? '30 days ago' : `${weightLogs.length} entries`}</span>
                  <span>Today</span>
                </div>
              </div>
            )}

            {/* Weight History List */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Recent Entries</h3>
              {weightLogs.length === 0 ? (
                <div className="p-8 text-center bg-zinc-100 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <Scale className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                  <p className="text-zinc-400">No weight entries yet</p>
                  <p className="text-sm text-zinc-500 mt-1">Start logging to track your progress</p>
                </div>
              ) : (
                weightLogs.slice(0, 10).map((log, idx) => {
                  const prevLog = weightLogs[idx + 1];
                  const change = prevLog ? log.weight - prevLog.weight : 0;
                  return (
                    <div
                      key={log.id}
                      className="p-4 bg-zinc-100 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                          <Scale className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{log.weight} {log.unit}</p>
                          <p className="text-sm text-zinc-400">
                            {new Date(log.loggedAt).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      {change !== 0 && (
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                          change < 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {change < 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                          {Math.abs(change).toFixed(1)} {log.unit}
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
          <div className="space-y-6">
            {/* Add Measurement Button */}
            <button
              onClick={() => setShowAddMeasurement(true)}
              className="w-full p-4 bg-zinc-900/50 rounded-xl border border-dashed border-zinc-700 hover:border-orange-500 transition-colors flex items-center justify-center gap-2 text-zinc-400 hover:text-orange-400"
            >
              <Plus className="w-5 h-5" />
              Log Measurements
            </button>

            {/* Latest Measurements */}
            {measurements.length > 0 && (
              <div className="p-6 bg-zinc-100 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-semibold mb-4">Latest Measurements</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {measurements[0].chest && (
                    <div className="p-3 bg-zinc-800/50 rounded-lg">
                      <p className="text-sm text-zinc-400">Chest</p>
                      <p className="text-xl font-semibold">{measurements[0].chest} {measurements[0].unit}</p>
                    </div>
                  )}
                  {measurements[0].waist && (
                    <div className="p-3 bg-zinc-800/50 rounded-lg">
                      <p className="text-sm text-zinc-400">Waist</p>
                      <p className="text-xl font-semibold">{measurements[0].waist} {measurements[0].unit}</p>
                    </div>
                  )}
                  {measurements[0].hips && (
                    <div className="p-3 bg-zinc-800/50 rounded-lg">
                      <p className="text-sm text-zinc-400">Hips</p>
                      <p className="text-xl font-semibold">{measurements[0].hips} {measurements[0].unit}</p>
                    </div>
                  )}
                  {measurements[0].leftArm && (
                    <div className="p-3 bg-zinc-800/50 rounded-lg">
                      <p className="text-sm text-zinc-400">Left Arm</p>
                      <p className="text-xl font-semibold">{measurements[0].leftArm} {measurements[0].unit}</p>
                    </div>
                  )}
                  {measurements[0].rightArm && (
                    <div className="p-3 bg-zinc-800/50 rounded-lg">
                      <p className="text-sm text-zinc-400">Right Arm</p>
                      <p className="text-xl font-semibold">{measurements[0].rightArm} {measurements[0].unit}</p>
                    </div>
                  )}
                  {measurements[0].neck && (
                    <div className="p-3 bg-zinc-800/50 rounded-lg">
                      <p className="text-sm text-zinc-400">Neck</p>
                      <p className="text-xl font-semibold">{measurements[0].neck} {measurements[0].unit}</p>
                    </div>
                  )}
                  {measurements[0].shoulders && (
                    <div className="p-3 bg-zinc-800/50 rounded-lg">
                      <p className="text-sm text-zinc-400">Shoulders</p>
                      <p className="text-xl font-semibold">{measurements[0].shoulders} {measurements[0].unit}</p>
                    </div>
                  )}
                  {measurements[0].leftThigh && (
                    <div className="p-3 bg-zinc-800/50 rounded-lg">
                      <p className="text-sm text-zinc-400">Left Thigh</p>
                      <p className="text-xl font-semibold">{measurements[0].leftThigh} {measurements[0].unit}</p>
                    </div>
                  )}
                  {measurements[0].rightThigh && (
                    <div className="p-3 bg-zinc-800/50 rounded-lg">
                      <p className="text-sm text-zinc-400">Right Thigh</p>
                      <p className="text-xl font-semibold">{measurements[0].rightThigh} {measurements[0].unit}</p>
                    </div>
                  )}
                  {measurements[0].bodyFatPercent && (
                    <div className="p-3 bg-zinc-800/50 rounded-lg">
                      <p className="text-sm text-zinc-400">Body Fat</p>
                      <p className="text-xl font-semibold">{measurements[0].bodyFatPercent}%</p>
                    </div>
                  )}
                </div>
                <p className="text-sm text-zinc-500 mt-4">
                  Measured on {new Date(measurements[0].measuredAt).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Measurement History */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">History</h3>
              {measurements.length === 0 ? (
                <div className="p-8 text-center bg-zinc-100 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <Ruler className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                  <p className="text-zinc-400">No measurements yet</p>
                  <p className="text-sm text-zinc-500 mt-1">Track your body measurements over time</p>
                </div>
              ) : (
                measurements.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 bg-zinc-100 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">
                        {new Date(m.measuredAt).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {m.chest && <span className="text-sm px-2 py-1 bg-zinc-800 rounded">Chest: {m.chest}{m.unit}</span>}
                      {m.waist && <span className="text-sm px-2 py-1 bg-zinc-800 rounded">Waist: {m.waist}{m.unit}</span>}
                      {m.hips && <span className="text-sm px-2 py-1 bg-zinc-800 rounded">Hips: {m.hips}{m.unit}</span>}
                      {m.leftArm && <span className="text-sm px-2 py-1 bg-zinc-800 rounded">L.Arm: {m.leftArm}{m.unit}</span>}
                      {m.rightArm && <span className="text-sm px-2 py-1 bg-zinc-800 rounded">R.Arm: {m.rightArm}{m.unit}</span>}
                      {m.bodyFatPercent && <span className="text-sm px-2 py-1 bg-zinc-800 rounded">BF: {m.bodyFatPercent}%</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'photos' && (
          <div className="space-y-6">
            <Link
              href="/body/photos"
              className="block w-full p-4 bg-zinc-900/50 rounded-xl border border-dashed border-zinc-700 hover:border-orange-500 transition-colors text-center"
            >
              <Camera className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
              <p className="text-zinc-400 hover:text-orange-400">Go to Progress Photos</p>
            </Link>

            <div className="p-8 text-center bg-zinc-100 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <Camera className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400">Visualize your transformation</p>
              <p className="text-sm text-zinc-500 mt-1">Take front, side, and back photos to track progress</p>
              <Link
                href="/body/photos"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                <Camera className="w-4 h-4" />
                Manage Photos
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Add Weight Modal */}
      {showAddWeight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Log Weight</h3>
              <button
                onClick={() => setShowAddWeight(false)}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm text-zinc-400 mb-1">Weight</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newWeight.weight}
                    onChange={(e) => setNewWeight({ ...newWeight, weight: e.target.value })}
                    className="w-full p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                    placeholder="70.5"
                    autoFocus
                  />
                </div>
                <div className="w-24">
                  <label className="block text-sm text-zinc-400 mb-1">Unit</label>
                  <select
                    value={newWeight.unit}
                    onChange={(e) => setNewWeight({ ...newWeight, unit: e.target.value })}
                    className="w-full p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="kg">kg</option>
                    <option value="lb">lb</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Notes (optional)</label>
                <textarea
                  value={newWeight.notes}
                  onChange={(e) => setNewWeight({ ...newWeight, notes: e.target.value })}
                  className="w-full p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500 resize-none"
                  rows={2}
                  placeholder="Morning weight, after workout, etc."
                />
              </div>

              <button
                onClick={handleAddWeight}
                disabled={!newWeight.weight || saving}
                className="w-full p-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
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
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Log Measurements</h3>
              <button
                onClick={() => setShowAddMeasurement(false)}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <label className="text-sm text-zinc-400">Unit:</label>
                <select
                  value={newMeasurement.unit}
                  onChange={(e) => setNewMeasurement({ ...newMeasurement, unit: e.target.value })}
                  className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="cm">cm</option>
                  <option value="in">in</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Chest</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMeasurement.chest}
                    onChange={(e) => setNewMeasurement({ ...newMeasurement, chest: e.target.value })}
                    className="w-full p-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Waist</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMeasurement.waist}
                    onChange={(e) => setNewMeasurement({ ...newMeasurement, waist: e.target.value })}
                    className="w-full p-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Hips</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMeasurement.hips}
                    onChange={(e) => setNewMeasurement({ ...newMeasurement, hips: e.target.value })}
                    className="w-full p-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Neck</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMeasurement.neck}
                    onChange={(e) => setNewMeasurement({ ...newMeasurement, neck: e.target.value })}
                    className="w-full p-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Shoulders</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMeasurement.shoulders}
                    onChange={(e) => setNewMeasurement({ ...newMeasurement, shoulders: e.target.value })}
                    className="w-full p-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Body Fat %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMeasurement.bodyFatPercent}
                    onChange={(e) => setNewMeasurement({ ...newMeasurement, bodyFatPercent: e.target.value })}
                    className="w-full p-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Left Arm</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMeasurement.leftArm}
                    onChange={(e) => setNewMeasurement({ ...newMeasurement, leftArm: e.target.value })}
                    className="w-full p-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Right Arm</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMeasurement.rightArm}
                    onChange={(e) => setNewMeasurement({ ...newMeasurement, rightArm: e.target.value })}
                    className="w-full p-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Left Thigh</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMeasurement.leftThigh}
                    onChange={(e) => setNewMeasurement({ ...newMeasurement, leftThigh: e.target.value })}
                    className="w-full p-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Right Thigh</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMeasurement.rightThigh}
                    onChange={(e) => setNewMeasurement({ ...newMeasurement, rightThigh: e.target.value })}
                    className="w-full p-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Notes (optional)</label>
                <textarea
                  value={newMeasurement.notes}
                  onChange={(e) => setNewMeasurement({ ...newMeasurement, notes: e.target.value })}
                  className="w-full p-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500 resize-none"
                  rows={2}
                />
              </div>

              <button
                onClick={handleAddMeasurement}
                disabled={saving}
                className="w-full p-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
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
