'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart3,
  ArrowLeft,
  Loader2,
  LogOut,
  Calendar,
  TrendingUp,
  TrendingDown,
  Dumbbell,
  Flame,
  Scale,
  Target,
  ChevronRight,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface WeeklyReport {
  id: string;
  periodStart: string;
  periodEnd: string;
  summary?: string;
  workoutStats?: {
    totalWorkouts: number;
    totalMinutes: number;
    averageIntensity: string;
    mostFrequentType: string;
  };
  nutritionStats?: {
    averageCalories: number;
    averageProtein: number;
    mealsLogged: number;
  };
  bodyStats?: {
    startWeight?: number;
    endWeight?: number;
    weightChange?: number;
  };
  overallScore?: number;
  recommendations?: string[];
  createdAt: string;
}

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchReports();
    }
  }, [status, router]);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports');
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/reports/weekly', {
        method: 'POST',
      });
      if (res.ok) {
        await fetchReports();
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setGenerating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    return 'D';
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 bg-black/90 backdrop-blur-lg border-b border-zinc-800 z-40">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 -ml-2 hover:bg-zinc-800 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold">Progress Reports</h1>
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
        {/* Generate Report Button */}
        <button
          onClick={generateReport}
          disabled={generating}
          className="w-full mb-6 p-4 bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl font-medium flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating AI Report...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Weekly Report
            </>
          )}
        </button>

        {reports.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Reports Yet</h3>
            <p className="text-zinc-500 mb-2">Generate your first AI-powered weekly report</p>
            <p className="text-sm text-zinc-600">
              Reports analyze your workouts, nutrition, and body stats to give you personalized insights
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-medium text-zinc-400">Your Reports</h3>

            {reports.map(report => (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className="w-full bg-zinc-900 rounded-xl p-4 hover:bg-zinc-800 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Weekly Report</p>
                      <p className="text-sm text-zinc-500">
                        {new Date(report.periodStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {' - '}
                        {new Date(report.periodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  {report.overallScore && (
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getScoreColor(report.overallScore)}`}>
                        {getScoreGrade(report.overallScore)}
                      </p>
                      <p className="text-xs text-zinc-500">{report.overallScore}/100</p>
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {report.workoutStats && (
                    <div className="bg-zinc-800 rounded-lg p-2 text-center">
                      <Dumbbell className="w-4 h-4 mx-auto mb-1 text-orange-500" />
                      <p className="text-sm font-medium">{report.workoutStats.totalWorkouts}</p>
                      <p className="text-xs text-zinc-500">Workouts</p>
                    </div>
                  )}
                  {report.workoutStats && (
                    <div className="bg-zinc-800 rounded-lg p-2 text-center">
                      <Flame className="w-4 h-4 mx-auto mb-1 text-red-500" />
                      <p className="text-sm font-medium">{report.workoutStats.totalMinutes}</p>
                      <p className="text-xs text-zinc-500">Minutes</p>
                    </div>
                  )}
                  {report.bodyStats?.weightChange !== undefined && (
                    <div className="bg-zinc-800 rounded-lg p-2 text-center">
                      <Scale className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                      <p className="text-sm font-medium">
                        {report.bodyStats.weightChange > 0 ? '+' : ''}
                        {report.bodyStats.weightChange.toFixed(1)}
                      </p>
                      <p className="text-xs text-zinc-500">lbs</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-zinc-500">
                  <span>View full report</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center overflow-y-auto">
          <div className="bg-zinc-900 w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-zinc-900 p-4 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-lg font-bold">Weekly Report</h3>
              <button onClick={() => setSelectedReport(null)} className="p-2 hover:bg-zinc-800 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Period */}
              <div className="text-center">
                <p className="text-zinc-400">
                  {new Date(selectedReport.periodStart).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                  {' - '}
                  {new Date(selectedReport.periodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
                {selectedReport.overallScore && (
                  <div className="mt-4">
                    <p className={`text-5xl font-bold ${getScoreColor(selectedReport.overallScore)}`}>
                      {getScoreGrade(selectedReport.overallScore)}
                    </p>
                    <p className="text-zinc-500">Overall Score: {selectedReport.overallScore}/100</p>
                  </div>
                )}
              </div>

              {/* AI Summary */}
              {selectedReport.summary && (
                <div className="bg-zinc-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-orange-500" />
                    <h4 className="font-medium">AI Summary</h4>
                  </div>
                  <p className="text-zinc-300 leading-relaxed">{selectedReport.summary}</p>
                </div>
              )}

              {/* Workout Stats */}
              {selectedReport.workoutStats && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-orange-500" />
                    Workout Stats
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-800 rounded-lg p-3">
                      <p className="text-2xl font-bold">{selectedReport.workoutStats.totalWorkouts}</p>
                      <p className="text-sm text-zinc-400">Total Workouts</p>
                    </div>
                    <div className="bg-zinc-800 rounded-lg p-3">
                      <p className="text-2xl font-bold">{selectedReport.workoutStats.totalMinutes}</p>
                      <p className="text-sm text-zinc-400">Total Minutes</p>
                    </div>
                    {selectedReport.workoutStats.averageIntensity && (
                      <div className="bg-zinc-800 rounded-lg p-3">
                        <p className="text-lg font-medium capitalize">{selectedReport.workoutStats.averageIntensity}</p>
                        <p className="text-sm text-zinc-400">Avg Intensity</p>
                      </div>
                    )}
                    {selectedReport.workoutStats.mostFrequentType && (
                      <div className="bg-zinc-800 rounded-lg p-3">
                        <p className="text-lg font-medium capitalize">{selectedReport.workoutStats.mostFrequentType}</p>
                        <p className="text-sm text-zinc-400">Top Workout</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Nutrition Stats */}
              {selectedReport.nutritionStats && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-red-500" />
                    Nutrition Stats
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-zinc-800 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold">{selectedReport.nutritionStats.averageCalories}</p>
                      <p className="text-xs text-zinc-400">Avg Calories</p>
                    </div>
                    <div className="bg-zinc-800 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold">{selectedReport.nutritionStats.averageProtein}g</p>
                      <p className="text-xs text-zinc-400">Avg Protein</p>
                    </div>
                    <div className="bg-zinc-800 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold">{selectedReport.nutritionStats.mealsLogged}</p>
                      <p className="text-xs text-zinc-400">Meals Logged</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Body Stats */}
              {selectedReport.bodyStats && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-blue-500" />
                    Body Stats
                  </h4>
                  <div className="bg-zinc-800 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-zinc-400">Weight Change</p>
                        <p className="text-2xl font-bold flex items-center gap-2">
                          {selectedReport.bodyStats.weightChange !== undefined && (
                            <>
                              {selectedReport.bodyStats.weightChange > 0 ? (
                                <TrendingUp className="w-5 h-5 text-green-500" />
                              ) : selectedReport.bodyStats.weightChange < 0 ? (
                                <TrendingDown className="w-5 h-5 text-red-500" />
                              ) : null}
                              {selectedReport.bodyStats.weightChange > 0 ? '+' : ''}
                              {selectedReport.bodyStats.weightChange.toFixed(1)} lbs
                            </>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-zinc-400">
                          {selectedReport.bodyStats.startWeight} → {selectedReport.bodyStats.endWeight} lbs
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {selectedReport.recommendations && selectedReport.recommendations.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-500" />
                    Recommendations
                  </h4>
                  <div className="space-y-2">
                    {selectedReport.recommendations.map((rec, i) => (
                      <div key={i} className="bg-zinc-800 rounded-lg p-3 flex items-start gap-3">
                        <span className="text-orange-500 font-medium">{i + 1}.</span>
                        <p className="text-zinc-300">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
