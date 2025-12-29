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
  X,
  Award,
  Zap,
  Activity,
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
    if (score >= 80) return 'from-emerald-400 to-green-400';
    if (score >= 60) return 'from-amber-400 to-yellow-400';
    return 'from-rose-400 to-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-green-500';
    if (score >= 60) return 'from-amber-500 to-yellow-500';
    return 'from-rose-500 to-red-500';
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
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-zinc-400">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Premium animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 -left-1/4 w-[600px] h-[600px] bg-gradient-to-r from-orange-500/15 to-pink-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -right-1/4 w-[600px] h-[600px] bg-gradient-to-r from-violet-500/15 to-purple-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      </div>

      {/* Premium Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/50 border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl blur opacity-50" />
                <div className="relative w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold">Progress Reports</h1>
                <p className="text-xs text-zinc-400">AI-powered insights</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            <LogOut className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
      </header>

      <main className="relative max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* Premium Generate Button */}
        <div className="relative group mb-8">
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-pink-500 to-violet-500 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity" />
          <button
            onClick={generateReport}
            disabled={generating}
            className="relative w-full p-5 bg-gradient-to-r from-orange-500 to-pink-600 rounded-2xl font-bold flex items-center justify-center gap-3 disabled:opacity-50 text-lg"
          >
            {generating ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Analyzing Your Data...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                Generate Weekly Report
              </>
            )}
          </button>
        </div>

        {reports.length === 0 ? (
          <div className="text-center py-16">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full blur-xl opacity-30" />
              <div className="relative w-24 h-24 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center">
                <BarChart3 className="w-12 h-12 text-zinc-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">No Reports Yet</h3>
            <p className="text-zinc-400 mb-4 max-w-sm mx-auto">
              Generate your first AI-powered weekly report to get personalized insights
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-sm text-zinc-500">
              <span className="flex items-center gap-1 px-3 py-1 bg-zinc-900 rounded-full">
                <Dumbbell className="w-4 h-4 text-orange-500" /> Workouts
              </span>
              <span className="flex items-center gap-1 px-3 py-1 bg-zinc-900 rounded-full">
                <Flame className="w-4 h-4 text-pink-500" /> Nutrition
              </span>
              <span className="flex items-center gap-1 px-3 py-1 bg-zinc-900 rounded-full">
                <Scale className="w-4 h-4 text-blue-500" /> Body Stats
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg">Your Reports</h3>
              <span className="text-sm text-zinc-400">{reports.length} total</span>
            </div>

            {reports.map(report => (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className="group relative w-full"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/50 to-pink-500/50 rounded-2xl blur opacity-0 group-hover:opacity-50 transition-opacity" />
                <div className="relative bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl blur opacity-30" />
                        <div className="relative w-14 h-14 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center">
                          <Activity className="w-7 h-7" />
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-lg">Weekly Report</p>
                        <p className="text-sm text-zinc-400">
                          {new Date(report.periodStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {' - '}
                          {new Date(report.periodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    {report.overallScore && (
                      <div className="text-right">
                        <div className={`text-3xl font-black bg-gradient-to-r ${getScoreColor(report.overallScore)} bg-clip-text text-transparent`}>
                          {getScoreGrade(report.overallScore)}
                        </div>
                        <p className="text-xs text-zinc-500">{report.overallScore}/100</p>
                      </div>
                    )}
                  </div>

                  {/* Stats Preview */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {report.workoutStats && (
                      <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
                        <Dumbbell className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                        <p className="text-lg font-bold">{report.workoutStats.totalWorkouts}</p>
                        <p className="text-xs text-zinc-500">Workouts</p>
                      </div>
                    )}
                    {report.workoutStats && (
                      <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
                        <Zap className="w-5 h-5 mx-auto mb-1 text-pink-500" />
                        <p className="text-lg font-bold">{report.workoutStats.totalMinutes}</p>
                        <p className="text-xs text-zinc-500">Minutes</p>
                      </div>
                    )}
                    {report.bodyStats?.weightChange !== undefined && (
                      <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
                        <Scale className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                        <p className="text-lg font-bold">
                          {report.bodyStats.weightChange > 0 ? '+' : ''}
                          {report.bodyStats.weightChange.toFixed(1)}
                        </p>
                        <p className="text-xs text-zinc-500">lbs</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">View full report</span>
                    <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Premium Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg my-8">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-pink-500 to-violet-500 rounded-3xl blur-lg opacity-30" />

            <div className="relative bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden max-h-[85vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-zinc-950/95 backdrop-blur-sm p-5 border-b border-white/10 flex items-center justify-between z-10">
                <h3 className="text-xl font-bold">Weekly Report</h3>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Score Section */}
                {selectedReport.overallScore && (
                  <div className="text-center py-4">
                    <div className="relative inline-block">
                      <div className={`absolute inset-0 bg-gradient-to-r ${getScoreBg(selectedReport.overallScore)} rounded-full blur-2xl opacity-50`} />
                      <div className={`relative w-32 h-32 bg-gradient-to-br ${getScoreBg(selectedReport.overallScore)} rounded-full flex items-center justify-center`}>
                        <div>
                          <p className="text-4xl font-black">{getScoreGrade(selectedReport.overallScore)}</p>
                          <p className="text-sm opacity-80">{selectedReport.overallScore}/100</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-zinc-400 mt-4">
                      {new Date(selectedReport.periodStart).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                      {' - '}
                      {new Date(selectedReport.periodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                )}

                {/* AI Summary */}
                {selectedReport.summary && (
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl blur opacity-20" />
                    <div className="relative bg-zinc-900 rounded-2xl p-5 border border-white/10">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-orange-500" />
                        <h4 className="font-bold">AI Summary</h4>
                      </div>
                      <p className="text-zinc-300 leading-relaxed">{selectedReport.summary}</p>
                    </div>
                  </div>
                )}

                {/* Workout Stats */}
                {selectedReport.workoutStats && (
                  <div>
                    <h4 className="font-bold mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                        <Dumbbell className="w-4 h-4 text-orange-500" />
                      </div>
                      Workout Stats
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-zinc-900 border border-white/10 rounded-xl p-4">
                        <p className="text-3xl font-black bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                          {selectedReport.workoutStats.totalWorkouts}
                        </p>
                        <p className="text-sm text-zinc-400">Total Workouts</p>
                      </div>
                      <div className="bg-zinc-900 border border-white/10 rounded-xl p-4">
                        <p className="text-3xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                          {selectedReport.workoutStats.totalMinutes}
                        </p>
                        <p className="text-sm text-zinc-400">Total Minutes</p>
                      </div>
                      {selectedReport.workoutStats.averageIntensity && (
                        <div className="bg-zinc-900 border border-white/10 rounded-xl p-4">
                          <p className="text-xl font-bold capitalize">{selectedReport.workoutStats.averageIntensity}</p>
                          <p className="text-sm text-zinc-400">Avg Intensity</p>
                        </div>
                      )}
                      {selectedReport.workoutStats.mostFrequentType && (
                        <div className="bg-zinc-900 border border-white/10 rounded-xl p-4">
                          <p className="text-xl font-bold capitalize">{selectedReport.workoutStats.mostFrequentType}</p>
                          <p className="text-sm text-zinc-400">Top Workout</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Nutrition Stats */}
                {selectedReport.nutritionStats && (
                  <div>
                    <h4 className="font-bold mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
                        <Flame className="w-4 h-4 text-pink-500" />
                      </div>
                      Nutrition Stats
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-zinc-900 border border-white/10 rounded-xl p-4 text-center">
                        <p className="text-2xl font-black bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                          {selectedReport.nutritionStats.averageCalories}
                        </p>
                        <p className="text-xs text-zinc-400">Avg Calories</p>
                      </div>
                      <div className="bg-zinc-900 border border-white/10 rounded-xl p-4 text-center">
                        <p className="text-2xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                          {selectedReport.nutritionStats.averageProtein}g
                        </p>
                        <p className="text-xs text-zinc-400">Avg Protein</p>
                      </div>
                      <div className="bg-zinc-900 border border-white/10 rounded-xl p-4 text-center">
                        <p className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                          {selectedReport.nutritionStats.mealsLogged}
                        </p>
                        <p className="text-xs text-zinc-400">Meals</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Body Stats */}
                {selectedReport.bodyStats && selectedReport.bodyStats.weightChange !== undefined && (
                  <div>
                    <h4 className="font-bold mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Scale className="w-4 h-4 text-blue-500" />
                      </div>
                      Body Stats
                    </h4>
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-20" />
                      <div className="relative bg-zinc-900 border border-white/10 rounded-2xl p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-zinc-400 mb-1">Weight Change</p>
                            <p className="text-3xl font-black flex items-center gap-2">
                              {selectedReport.bodyStats.weightChange > 0 ? (
                                <TrendingUp className="w-6 h-6 text-emerald-500" />
                              ) : selectedReport.bodyStats.weightChange < 0 ? (
                                <TrendingDown className="w-6 h-6 text-blue-500" />
                              ) : null}
                              <span className={selectedReport.bodyStats.weightChange > 0 ? 'text-emerald-400' : 'text-blue-400'}>
                                {selectedReport.bodyStats.weightChange > 0 ? '+' : ''}
                                {selectedReport.bodyStats.weightChange.toFixed(1)} lbs
                              </span>
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
                  </div>
                )}

                {/* Recommendations */}
                {selectedReport.recommendations && selectedReport.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-bold mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <Target className="w-4 h-4 text-emerald-500" />
                      </div>
                      Recommendations
                    </h4>
                    <div className="space-y-3">
                      {selectedReport.recommendations.map((rec, i) => (
                        <div key={i} className="bg-zinc-900 border border-white/10 rounded-xl p-4 flex items-start gap-4">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center font-bold shrink-0">
                            {i + 1}
                          </div>
                          <p className="text-zinc-300 leading-relaxed">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
