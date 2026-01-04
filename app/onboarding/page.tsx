'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Dumbbell, Target, Scale, Ruler, ChevronRight, ChevronLeft,
  User, Activity, Heart, Zap, Trophy, Flame, Check, Loader2
} from 'lucide-react';
import { useToast } from '@/components/Toast';

const FITNESS_GOALS = [
  { id: 'lose_weight', label: 'Lose Weight', icon: Scale, color: 'from-blue-500 to-cyan-500' },
  { id: 'build_muscle', label: 'Build Muscle', icon: Dumbbell, color: 'from-orange-500 to-red-500' },
  { id: 'get_fit', label: 'Get Fit', icon: Activity, color: 'from-green-500 to-emerald-500' },
  { id: 'increase_endurance', label: 'Increase Endurance', icon: Heart, color: 'from-pink-500 to-rose-500' },
  { id: 'improve_flexibility', label: 'Improve Flexibility', icon: Zap, color: 'from-purple-500 to-violet-500' },
  { id: 'maintain', label: 'Maintain Health', icon: Trophy, color: 'from-amber-500 to-yellow-500' },
];

const EXPERIENCE_LEVELS = [
  { id: 'beginner', label: 'Beginner', description: 'New to fitness or returning after a long break' },
  { id: 'intermediate', label: 'Intermediate', description: 'Workout regularly for 6+ months' },
  { id: 'advanced', label: 'Advanced', description: 'Training consistently for 2+ years' },
];

const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Sedentary', description: 'Little to no exercise, desk job' },
  { id: 'light', label: 'Lightly Active', description: 'Light exercise 1-3 days/week' },
  { id: 'moderate', label: 'Moderately Active', description: 'Moderate exercise 3-5 days/week' },
  { id: 'very', label: 'Very Active', description: 'Hard exercise 6-7 days/week' },
  { id: 'extra', label: 'Extra Active', description: 'Very hard exercise & physical job' },
];

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    fitnessGoal: '',
    experienceLevel: '',
    activityLevel: '',
    currentWeight: '',
    targetWeight: '',
    height: '',
    gender: '',
    dateOfBirth: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (session?.user?.name) {
      setFormData(prev => ({ ...prev, name: session.user.name || '' }));
    }
  }, [status, session, router]);

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          currentWeight: formData.currentWeight ? parseFloat(formData.currentWeight) : null,
          targetWeight: formData.targetWeight ? parseFloat(formData.targetWeight) : null,
          height: formData.height ? parseFloat(formData.height) : null,
          onboardingCompleted: true,
        }),
      });

      if (res.ok) {
        router.push('/');
      } else {
        console.error('Failed to save profile');
        toast.error('Failed to save profile', 'Please try again.');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile', 'Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return formData.name.trim().length > 0;
      case 2: return formData.fitnessGoal !== '';
      case 3: return formData.experienceLevel !== '' && formData.activityLevel !== '';
      case 4: return true; // Body stats are optional
      default: return true;
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-zinc-800 z-50">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all duration-300"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </div>

      <div className="max-w-lg mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {step === 1 && "Let's get started!"}
            {step === 2 && "What's your goal?"}
            {step === 3 && "Tell us about yourself"}
            {step === 4 && "Body measurements"}
          </h1>
          <p className="text-zinc-400">Step {step} of {totalSteps}</p>
        </div>

        {/* Step 1: Name */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">What should we call you?</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                  placeholder="Your name"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Gender (optional)</label>
              <div className="grid grid-cols-3 gap-3">
                {['male', 'female', 'other'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setFormData({ ...formData, gender: g })}
                    className={`p-3 rounded-xl font-medium transition-all ${
                      formData.gender === g
                        ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                        : 'bg-zinc-900 border border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Date of birth (optional)</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-4 py-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        )}

        {/* Step 2: Fitness Goal */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-zinc-400 text-center mb-6">Select your primary fitness goal</p>
            {FITNESS_GOALS.map((goal) => (
              <button
                key={goal.id}
                onClick={() => setFormData({ ...formData, fitnessGoal: goal.id })}
                className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all ${
                  formData.fitnessGoal === goal.id
                    ? 'bg-gradient-to-r ' + goal.color + ' text-white'
                    : 'bg-zinc-900 border border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  formData.fitnessGoal === goal.id ? 'bg-white/20' : 'bg-zinc-800'
                }`}>
                  <goal.icon className="w-6 h-6" />
                </div>
                <span className="font-medium text-lg">{goal.label}</span>
                {formData.fitnessGoal === goal.id && (
                  <Check className="w-5 h-5 ml-auto" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Step 3: Experience & Activity Level */}
        {step === 3 && (
          <div className="space-y-8">
            <div>
              <h3 className="font-medium mb-4">Experience Level</h3>
              <div className="space-y-3">
                {EXPERIENCE_LEVELS.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setFormData({ ...formData, experienceLevel: level.id })}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      formData.experienceLevel === level.id
                        ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                        : 'bg-zinc-900 border border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="font-medium">{level.label}</div>
                    <div className={`text-sm ${formData.experienceLevel === level.id ? 'text-white/80' : 'text-zinc-400'}`}>
                      {level.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-4">Activity Level</h3>
              <div className="space-y-3">
                {ACTIVITY_LEVELS.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setFormData({ ...formData, activityLevel: level.id })}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      formData.activityLevel === level.id
                        ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                        : 'bg-zinc-900 border border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="font-medium">{level.label}</div>
                    <div className={`text-sm ${formData.activityLevel === level.id ? 'text-white/80' : 'text-zinc-400'}`}>
                      {level.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Body Stats */}
        {step === 4 && (
          <div className="space-y-6">
            <p className="text-zinc-400 text-center mb-6">Optional - helps us personalize recommendations</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Current Weight</label>
                <div className="relative">
                  <Scale className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="number"
                    value={formData.currentWeight}
                    onChange={(e) => setFormData({ ...formData, currentWeight: e.target.value })}
                    className="w-full pl-12 pr-12 py-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                    placeholder="0"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">lbs</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Target Weight</label>
                <div className="relative">
                  <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="number"
                    value={formData.targetWeight}
                    onChange={(e) => setFormData({ ...formData, targetWeight: e.target.value })}
                    className="w-full pl-12 pr-12 py-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                    placeholder="0"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">lbs</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Height</label>
              <div className="relative">
                <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="w-full pl-12 pr-12 py-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                  placeholder="0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">cm</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-4 mt-8">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 py-4 border border-zinc-800 rounded-xl font-medium hover:bg-zinc-900 transition-all flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
          )}

          {step < totalSteps ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Complete Setup
                  <Check className="w-5 h-5" />
                </>
              )}
            </button>
          )}
        </div>

        {/* Skip option */}
        {step === 4 && (
          <button
            onClick={handleSubmit}
            className="w-full mt-4 py-3 text-zinc-400 hover:text-white transition-colors"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}
