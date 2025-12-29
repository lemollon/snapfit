'use client';

import { useState } from 'react';
import {
  Dumbbell,
  Target,
  Camera,
  Utensils,
  Trophy,
  Calendar,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  Check,
  Zap,
  Scale,
  Flame,
} from 'lucide-react';

interface OnboardingProps {
  onComplete: (data: OnboardingData) => void;
  userName?: string;
}

interface OnboardingData {
  fitnessGoal: string;
  experienceLevel: string;
  weeklyTarget: number;
  targetWeight?: number;
  currentWeight?: number;
}

const FITNESS_GOALS = [
  { id: 'lose_weight', label: 'Lose Weight', icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
  { id: 'build_muscle', label: 'Build Muscle', icon: Dumbbell, color: 'from-purple-500 to-pink-500' },
  { id: 'maintain', label: 'Stay Fit', icon: Target, color: 'from-green-500 to-emerald-500' },
  { id: 'improve_endurance', label: 'Boost Endurance', icon: Flame, color: 'from-orange-500 to-red-500' },
];

const EXPERIENCE_LEVELS = [
  { id: 'beginner', label: 'Beginner', desc: 'New to fitness', icon: '🌱' },
  { id: 'intermediate', label: 'Intermediate', desc: '1-2 years experience', icon: '💪' },
  { id: 'advanced', label: 'Advanced', desc: '3+ years experience', icon: '🔥' },
];

const FEATURES = [
  { icon: Camera, title: 'AI Workout Generator', desc: 'Snap your space, get personalized workouts instantly', color: 'from-violet-500 to-purple-600' },
  { icon: Utensils, title: 'Food Tracking', desc: 'Photo your meals for automatic nutrition analysis', color: 'from-green-500 to-emerald-600' },
  { icon: Trophy, title: 'Achievements', desc: 'Earn XP, level up, and unlock badges', color: 'from-amber-500 to-orange-600' },
  { icon: Calendar, title: 'Smart Planning', desc: 'Schedule workouts and meals on your calendar', color: 'from-blue-500 to-cyan-600' },
];

export function Onboarding({ onComplete, userName }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    fitnessGoal: '',
    experienceLevel: '',
    weeklyTarget: 4,
    targetWeight: undefined,
    currentWeight: undefined,
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      onComplete(data);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0: return true; // Welcome screen
      case 1: return data.fitnessGoal !== '';
      case 2: return data.experienceLevel !== '';
      case 3: return true; // Features preview
      default: return true;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Progress Bar */}
      <div className="px-6 pt-6">
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-all ${
                i <= step ? 'bg-gradient-to-r from-orange-500 to-pink-500' : 'bg-zinc-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 py-8 overflow-y-auto">
        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-pink-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-orange-500/30">
              <Dumbbell className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-3">
              Welcome{userName ? `, ${userName}` : ''}! 👋
            </h1>
            <p className="text-zinc-400 text-lg max-w-sm">
              Let&apos;s personalize your fitness journey in just a few steps
            </p>

            <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-sm">
              <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 text-center">
                <p className="text-2xl font-bold text-orange-500">50K+</p>
                <p className="text-xs text-zinc-500">Active Users</p>
              </div>
              <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 text-center">
                <p className="text-2xl font-bold text-pink-500">1M+</p>
                <p className="text-xs text-zinc-500">Workouts Done</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Fitness Goal */}
        {step === 1 && (
          <div className="flex-1 flex flex-col">
            <h2 className="text-2xl font-bold mb-2">What&apos;s your goal?</h2>
            <p className="text-zinc-400 mb-8">We&apos;ll customize your experience</p>

            <div className="grid gap-3">
              {FITNESS_GOALS.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => setData({ ...data, fitnessGoal: goal.id })}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    data.fitnessGoal === goal.id
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${goal.color} flex items-center justify-center`}>
                    <goal.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-medium text-lg">{goal.label}</span>
                  {data.fitnessGoal === goal.id && (
                    <Check className="w-5 h-5 text-orange-500 ml-auto" />
                  )}
                </button>
              ))}
            </div>

            {data.fitnessGoal === 'lose_weight' && (
              <div className="mt-6 p-4 bg-zinc-900 rounded-xl border border-zinc-800">
                <label className="block text-sm text-zinc-400 mb-2">Target Weight (optional)</label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={data.targetWeight || ''}
                    onChange={(e) => setData({ ...data, targetWeight: parseFloat(e.target.value) || undefined })}
                    className="flex-1 p-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-orange-500"
                    placeholder="e.g., 70"
                  />
                  <span className="flex items-center px-4 text-zinc-400">kg</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Experience Level */}
        {step === 2 && (
          <div className="flex-1 flex flex-col">
            <h2 className="text-2xl font-bold mb-2">Your fitness level?</h2>
            <p className="text-zinc-400 mb-8">We&apos;ll adjust workout intensity</p>

            <div className="grid gap-3">
              {EXPERIENCE_LEVELS.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setData({ ...data, experienceLevel: level.id })}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    data.experienceLevel === level.id
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-3xl">{level.icon}</span>
                  <div className="text-left">
                    <p className="font-medium">{level.label}</p>
                    <p className="text-sm text-zinc-500">{level.desc}</p>
                  </div>
                  {data.experienceLevel === level.id && (
                    <Check className="w-5 h-5 text-orange-500 ml-auto" />
                  )}
                </button>
              ))}
            </div>

            <div className="mt-8 p-4 bg-zinc-900 rounded-xl border border-zinc-800">
              <label className="block text-sm text-zinc-400 mb-3">Weekly workout target</label>
              <div className="flex items-center justify-between gap-3">
                {[3, 4, 5, 6, 7].map((num) => (
                  <button
                    key={num}
                    onClick={() => setData({ ...data, weeklyTarget: num })}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                      data.weeklyTarget === num
                        ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <p className="text-xs text-zinc-500 mt-2 text-center">days per week</p>
            </div>
          </div>
        )}

        {/* Step 3: Features Preview */}
        {step === 3 && (
          <div className="flex-1 flex flex-col">
            <h2 className="text-2xl font-bold mb-2">You&apos;re all set! 🎉</h2>
            <p className="text-zinc-400 mb-8">Here&apos;s what you can do with SnapFit</p>

            <div className="grid gap-4">
              {FEATURES.map((feature, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 bg-zinc-900 rounded-xl border border-zinc-800"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shrink-0`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{feature.title}</h3>
                    <p className="text-sm text-zinc-500">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-gradient-to-r from-orange-500/10 to-pink-500/10 rounded-xl border border-orange-500/30 text-center">
              <Zap className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="text-sm text-zinc-300">
                Pro tip: Start by taking a photo of your workout space to get your first AI-generated routine!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="px-6 pb-8 pt-4 border-t border-zinc-800 bg-black">
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={handleBack}
              className="px-6 py-4 bg-zinc-800 rounded-xl font-medium hover:bg-zinc-700 transition-all flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {step === totalSteps - 1 ? (
              <>
                Start Training
                <Dumbbell className="w-5 h-5" />
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
