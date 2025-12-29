'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Camera, Video, Upload, ArrowLeft, Play, CheckCircle, AlertCircle,
  Star, TrendingUp, Target, Loader2, X, ChevronRight, LogOut
} from 'lucide-react';

interface FormCheck {
  id: string;
  exerciseName: string;
  videoUrl: string;
  thumbnailUrl?: string;
  status: string;
  aiScore?: number;
  aiAnalysis?: any;
  keyPoints?: string[];
  improvements?: string[];
  trainerFeedback?: string;
  trainerScore?: number;
  createdAt: string;
}

export default function FormCheckPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formChecks, setFormChecks] = useState<FormCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState<FormCheck | null>(null);
  const [exerciseName, setExerciseName] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    fetchFormChecks();
  }, []);

  const fetchFormChecks = async () => {
    try {
      const res = await fetch('/api/form-check');
      const data = await res.json();
      setFormChecks(data.formChecks || []);
    } catch (error) {
      console.error('Failed to fetch form checks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!exerciseName.trim()) {
      alert('Please enter the exercise name');
      return;
    }

    setUploading(true);
    try {
      // In a real app, upload to cloud storage first
      const videoUrl = URL.createObjectURL(file);

      const res = await fetch('/api/form-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseName,
          videoUrl,
          duration: 30, // Would be extracted from video
        }),
      });

      const data = await res.json();
      if (data.formCheck) {
        setFormChecks([data.formCheck, ...formChecks]);
        setSelectedCheck(data.formCheck);
        setShowUpload(false);
        setExerciseName('');
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-rose-600';
  };

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
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-zinc-800 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold">Form Check AI</h1>
              <p className="text-sm text-zinc-400">Get instant feedback on your form</p>
            </div>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            <Video className="w-5 h-5" />
            New Check
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative mb-8 rounded-3xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80"
            alt="Gym"
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          <div className="absolute inset-0 flex items-center p-8">
            <div>
              <h2 className="text-3xl font-black mb-2">Perfect Your Form</h2>
              <p className="text-zinc-300 max-w-md">
                Upload a video of your exercise and get AI-powered analysis with specific form corrections.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Video, title: 'Record', desc: 'Film yourself doing an exercise' },
            { icon: Target, title: 'Analyze', desc: 'AI checks your form in detail' },
            { icon: TrendingUp, title: 'Improve', desc: 'Get specific corrections' },
          ].map((step, i) => (
            <div key={i} className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-pink-500/20 flex items-center justify-center">
                <step.icon className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="text-sm text-zinc-400">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Form Checks List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Your Form Checks</h3>

          {formChecks.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900/50 rounded-2xl border border-zinc-800">
              <Video className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
              <p className="text-zinc-400 mb-4">No form checks yet</p>
              <button
                onClick={() => setShowUpload(true)}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl font-semibold"
              >
                Upload Your First Video
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {formChecks.map((check) => (
                <div
                  key={check.id}
                  onClick={() => setSelectedCheck(check)}
                  className="group p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 rounded-xl bg-zinc-800 overflow-hidden relative">
                      {check.thumbnailUrl ? (
                        <img src={check.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play className="w-8 h-8 text-zinc-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-8 h-8" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{check.exerciseName}</h4>
                      <div className="flex items-center gap-2 mb-2">
                        {check.status === 'good' && (
                          <span className="flex items-center gap-1 text-green-400 text-sm">
                            <CheckCircle className="w-4 h-4" /> Good Form
                          </span>
                        )}
                        {check.status === 'needs_work' && (
                          <span className="flex items-center gap-1 text-yellow-400 text-sm">
                            <AlertCircle className="w-4 h-4" /> Needs Work
                          </span>
                        )}
                        {check.status === 'analyzing' && (
                          <span className="flex items-center gap-1 text-blue-400 text-sm">
                            <Loader2 className="w-4 h-4 animate-spin" /> Analyzing
                          </span>
                        )}
                      </div>
                      {check.aiScore && (
                        <div className="flex items-center gap-2">
                          <div className={`text-2xl font-black ${getScoreColor(check.aiScore)}`}>
                            {check.aiScore}
                          </div>
                          <div className="text-sm text-zinc-400">/100</div>
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-3xl max-w-md w-full p-6 border border-zinc-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Upload Form Check Video</h3>
              <button onClick={() => setShowUpload(false)} className="p-2 hover:bg-zinc-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-300">Exercise Name</label>
                <input
                  type="text"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  placeholder="e.g., Squat, Deadlift, Bench Press"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:border-orange-500"
                />
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-700 rounded-2xl p-8 text-center cursor-pointer hover:border-orange-500 transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
                {uploading ? (
                  <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-orange-500" />
                ) : (
                  <Upload className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
                )}
                <p className="text-zinc-400">
                  {uploading ? 'Analyzing your form...' : 'Click to upload video'}
                </p>
                <p className="text-sm text-zinc-500 mt-2">MP4, MOV up to 100MB</p>
              </div>

              <p className="text-xs text-zinc-500">
                Tips: Film from the side or front. Make sure your full body is visible. Good lighting helps!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedCheck && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-zinc-800">
            <div className="sticky top-0 bg-zinc-900 p-4 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-xl font-bold">{selectedCheck.exerciseName}</h3>
              <button onClick={() => setSelectedCheck(null)} className="p-2 hover:bg-zinc-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Score */}
              {selectedCheck.aiScore && (
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br ${getScoreBg(selectedCheck.aiScore)}`}>
                    <div>
                      <div className="text-4xl font-black">{selectedCheck.aiScore}</div>
                      <div className="text-sm opacity-80">Form Score</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Analysis */}
              {selectedCheck.aiAnalysis && (
                <div className="space-y-4">
                  <div className="p-4 bg-zinc-800/50 rounded-xl">
                    <h4 className="font-semibold mb-2">Overall Assessment</h4>
                    <p className="text-zinc-300">{selectedCheck.aiAnalysis.overallAssessment}</p>
                  </div>

                  {selectedCheck.aiAnalysis.keyPoints && (
                    <div>
                      <h4 className="font-semibold mb-2">Key Observations</h4>
                      <ul className="space-y-2">
                        {selectedCheck.aiAnalysis.keyPoints.map((point: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-zinc-300">
                            <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedCheck.aiAnalysis.improvements && (
                    <div>
                      <h4 className="font-semibold mb-2">Improvements</h4>
                      <ul className="space-y-2">
                        {selectedCheck.aiAnalysis.improvements.map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-zinc-300">
                            <Target className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedCheck.aiAnalysis.safetyNotes && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <h4 className="font-semibold mb-2 text-red-400">Safety Notes</h4>
                      <p className="text-zinc-300">{selectedCheck.aiAnalysis.safetyNotes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Trainer Feedback */}
              {selectedCheck.trainerFeedback && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <h4 className="font-semibold mb-2 text-blue-400">Trainer Feedback</h4>
                  <p className="text-zinc-300">{selectedCheck.trainerFeedback}</p>
                  {selectedCheck.trainerScore && (
                    <div className="mt-2 text-sm text-blue-400">
                      Trainer Score: {selectedCheck.trainerScore}/100
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
