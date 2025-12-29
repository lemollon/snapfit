'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Ruler,
  Plus,
  ArrowLeft,
  Loader2,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  LogOut,
  Calendar,
  ChevronRight,
} from 'lucide-react';

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

const MEASUREMENT_FIELDS = [
  { key: 'chest', label: 'Chest', icon: '💪' },
  { key: 'waist', label: 'Waist', icon: '📏' },
  { key: 'hips', label: 'Hips', icon: '🍑' },
  { key: 'shoulders', label: 'Shoulders', icon: '🎯' },
  { key: 'neck', label: 'Neck', icon: '👔' },
  { key: 'leftArm', label: 'Left Arm', icon: '💪' },
  { key: 'rightArm', label: 'Right Arm', icon: '💪' },
  { key: 'leftThigh', label: 'Left Thigh', icon: '🦵' },
  { key: 'rightThigh', label: 'Right Thigh', icon: '🦵' },
  { key: 'leftCalf', label: 'Left Calf', icon: '🦶' },
  { key: 'rightCalf', label: 'Right Calf', icon: '🦶' },
  { key: 'bodyFatPercent', label: 'Body Fat %', icon: '📊' },
];

export default function BodyMeasurementsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedMeasurement, setSelectedMeasurement] = useState<BodyMeasurement | null>(null);

  const [newMeasurement, setNewMeasurement] = useState({
    chest: '',
    waist: '',
    hips: '',
    leftArm: '',
    rightArm: '',
    leftThigh: '',
    rightThigh: '',
    leftCalf: '',
    rightCalf: '',
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
      fetchMeasurements();
    }
  }, [status, router]);

  const fetchMeasurements = async () => {
    try {
      const res = await fetch('/api/body/measurements');
      if (res.ok) {
        const data = await res.json();
        setMeasurements(data.measurements || []);
      }
    } catch (error) {
      console.error('Failed to fetch measurements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const measurementData: Record<string, any> = {
        unit: newMeasurement.unit,
        notes: newMeasurement.notes || null,
      };

      MEASUREMENT_FIELDS.forEach(field => {
        const value = newMeasurement[field.key as keyof typeof newMeasurement];
        if (value && value !== '') {
          measurementData[field.key] = parseFloat(value as string);
        }
      });

      const res = await fetch('/api/body/measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(measurementData),
      });

      if (res.ok) {
        await fetchMeasurements();
        setShowAddModal(false);
        setNewMeasurement({
          chest: '',
          waist: '',
          hips: '',
          leftArm: '',
          rightArm: '',
          leftThigh: '',
          rightThigh: '',
          leftCalf: '',
          rightCalf: '',
          neck: '',
          shoulders: '',
          bodyFatPercent: '',
          unit: 'cm',
          notes: '',
        });
      }
    } catch (error) {
      console.error('Failed to save measurement:', error);
    } finally {
      setSaving(false);
    }
  };

  const getChange = (field: string) => {
    if (measurements.length < 2) return null;
    const current = measurements[0][field as keyof BodyMeasurement] as number | undefined;
    const previous = measurements[1][field as keyof BodyMeasurement] as number | undefined;
    if (current === undefined || previous === undefined) return null;
    return current - previous;
  };

  const getTrend = (change: number | null) => {
    if (change === null) return null;
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-zinc-500" />;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const latestMeasurement = measurements[0];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 bg-black/90 backdrop-blur-lg border-b border-zinc-800 z-40">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/body" className="p-2 -ml-2 hover:bg-zinc-800 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold">Body Measurements</h1>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {measurements.length === 0 ? (
          <div className="text-center py-12">
            <Ruler className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Measurements Yet</h3>
            <p className="text-zinc-500 mb-6">Track your body measurements to see your progress over time</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl font-medium"
            >
              Add First Measurement
            </button>
          </div>
        ) : (
          <>
            {/* Current Measurements Card */}
            <div className="bg-zinc-900 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Current Measurements</h3>
                <p className="text-sm text-zinc-500">
                  {latestMeasurement && new Date(latestMeasurement.measuredAt).toLocaleDateString()}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {MEASUREMENT_FIELDS.map(field => {
                  const value = latestMeasurement?.[field.key as keyof BodyMeasurement] as number | undefined;
                  if (value === undefined) return null;

                  const change = getChange(field.key);
                  const unit = field.key === 'bodyFatPercent' ? '%' : latestMeasurement?.unit || 'cm';

                  return (
                    <div key={field.key} className="bg-zinc-800 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">{field.icon}</span>
                        <span className="text-xs text-zinc-400">{field.label}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold">
                          {value} {unit}
                        </span>
                        {change !== null && (
                          <div className="flex items-center gap-1">
                            {getTrend(change)}
                            <span className={`text-xs ${
                              change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : 'text-zinc-500'
                            }`}>
                              {change > 0 ? '+' : ''}{change.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* History */}
            <h3 className="font-medium mb-3">Measurement History</h3>
            <div className="space-y-2">
              {measurements.map(measurement => (
                <button
                  key={measurement.id}
                  onClick={() => setSelectedMeasurement(measurement)}
                  className="w-full bg-zinc-900 rounded-xl p-4 flex items-center justify-between hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">
                        {new Date(measurement.measuredAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-sm text-zinc-500">
                        {Object.entries(measurement).filter(([k, v]) =>
                          MEASUREMENT_FIELDS.some(f => f.key === k) && v !== null
                        ).length} measurements
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-600" />
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add Measurement FAB */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-orange-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center overflow-y-auto">
          <div className="bg-zinc-900 w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Add Measurements</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-zinc-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Unit Selection */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Unit</label>
                <div className="flex gap-2">
                  {['cm', 'inches'].map(unit => (
                    <button
                      key={unit}
                      onClick={() => setNewMeasurement(prev => ({ ...prev, unit }))}
                      className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                        newMeasurement.unit === unit
                          ? 'bg-orange-500 text-white'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>

              {/* Measurement Fields */}
              <div className="grid grid-cols-2 gap-3">
                {MEASUREMENT_FIELDS.map(field => (
                  <div key={field.key}>
                    <label className="block text-xs text-zinc-400 mb-1">{field.label}</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newMeasurement[field.key as keyof typeof newMeasurement]}
                      onChange={e => setNewMeasurement(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.key === 'bodyFatPercent' ? '%' : newMeasurement.unit}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Notes (optional)</label>
                <textarea
                  value={newMeasurement.notes}
                  onChange={e => setNewMeasurement(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any notes..."
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 resize-none"
                  rows={2}
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Measurements'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedMeasurement && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-zinc-900 w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">
                {new Date(selectedMeasurement.measuredAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </h3>
              <button onClick={() => setSelectedMeasurement(null)} className="p-2 hover:bg-zinc-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {MEASUREMENT_FIELDS.map(field => {
                const value = selectedMeasurement[field.key as keyof BodyMeasurement] as number | undefined;
                if (value === undefined) return null;

                const unit = field.key === 'bodyFatPercent' ? '%' : selectedMeasurement.unit;

                return (
                  <div key={field.key} className="bg-zinc-800 rounded-lg p-3">
                    <p className="text-xs text-zinc-400 mb-1">{field.label}</p>
                    <p className="text-lg font-semibold">{value} {unit}</p>
                  </div>
                );
              })}
            </div>

            {selectedMeasurement.notes && (
              <div className="mt-4 p-3 bg-zinc-800 rounded-lg">
                <p className="text-sm text-zinc-400">{selectedMeasurement.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
