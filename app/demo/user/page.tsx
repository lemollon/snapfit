'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, ArrowRight, Camera, Dumbbell, UtensilsCrossed, Users, Trophy,
  Timer, Flame, Target, TrendingUp, Star, Check, Zap, Clock, Calendar,
  ChevronRight, Play, Home
} from 'lucide-react';

const DEMO_SCREENS = [
  {
    id: 'home',
    title: 'Home Dashboard',
    description: 'Your personalized fitness hub with stats, streaks, achievements, and quick workout access.',
    features: [
      'Daily streak tracking with fire badge',
      'Total workouts and minutes logged',
      'Weekly goal progress bar',
      'Motivational quotes that change daily',
      'Quick-start workout cards',
      'Achievement badges you can unlock',
    ],
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    color: 'from-indigo-500 to-purple-600',
  },
  {
    id: 'workout',
    title: 'AI Workout Generator',
    description: 'Snap a photo of any space and get a personalized workout instantly.',
    features: [
      'Take photo of gym, living room, hotel, outdoors',
      'AI detects all usable equipment',
      'Generates complete workout routine',
      'Warm-up, main workout, cool-down',
      'Sets, reps, and form tips included',
      'Save workouts to your history',
    ],
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=800&q=80',
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'food',
    title: 'Smart Food Tracking',
    description: 'Photo your meals for instant AI-powered nutrition analysis.',
    features: [
      'Snap a photo of any meal',
      'AI identifies food and portions',
      'Instant calorie count',
      'Protein, carbs, fat breakdown',
      'Daily intake tracking',
      'Meal history and patterns',
    ],
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'social',
    title: 'Friends & Challenges',
    description: 'Connect with friends and compete in fitness challenges.',
    features: [
      'Add friends by email',
      'See friends\' activity',
      'Join public challenges',
      'Create your own challenges',
      'Track challenge progress',
      'Compete on leaderboards',
    ],
    image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    id: 'timer',
    title: 'Workout Timer',
    description: 'Built-in timer for your exercises with haptic feedback.',
    features: [
      'Customizable countdown timer',
      'Large, easy-to-read display',
      'Vibration alert when done',
      'Perfect for rest periods',
      'Track workout duration',
      'Hands-free operation',
    ],
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
    color: 'from-purple-500 to-pink-500',
  },
];

export default function UserDemoPage() {
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState(0);

  const nextScreen = () => {
    setCurrentScreen((prev) => (prev + 1) % DEMO_SCREENS.length);
  };

  const prevScreen = () => {
    setCurrentScreen((prev) => (prev - 1 + DEMO_SCREENS.length) % DEMO_SCREENS.length);
  };

  const screen = DEMO_SCREENS[currentScreen];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/login')}
            className="flex items-center gap-2 text-white/70 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <div className="flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-orange-500" />
            <span className="font-bold">User Experience Demo</span>
          </div>
          <button
            onClick={() => router.push('/demo/trainer')}
            className="text-sm text-white/70 hover:text-white"
          >
            See Trainer Demo →
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Screen Navigation Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {DEMO_SCREENS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCurrentScreen(i)}
              className={`w-3 h-3 rounded-full transition-all ${
                i === currentScreen
                  ? 'bg-orange-500 w-8'
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Current Screen */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image/Preview */}
          <div className="relative">
            <div className={`absolute inset-0 bg-gradient-to-br ${screen.color} rounded-3xl blur-3xl opacity-30`} />
            <div className="relative bg-gray-800 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <div className="aspect-[9/16] max-h-[600px] relative">
                <img
                  src={screen.image}
                  alt={screen.title}
                  className="w-full h-full object-cover opacity-60"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${screen.color} opacity-40`} />

                {/* Mock UI Overlay */}
                <div className="absolute inset-0 p-6 flex flex-col">
                  {/* Mock Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="w-6 h-6" />
                      <span className="font-bold">SnapFit</span>
                    </div>
                    <div className="flex items-center gap-2 bg-orange-500/80 px-3 py-1 rounded-full">
                      <Flame className="w-4 h-4" />
                      <span className="font-bold text-sm">7</span>
                    </div>
                  </div>

                  {/* Mock Content */}
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      {screen.id === 'workout' && <Camera className="w-20 h-20 mx-auto mb-4 opacity-80" />}
                      {screen.id === 'food' && <UtensilsCrossed className="w-20 h-20 mx-auto mb-4 opacity-80" />}
                      {screen.id === 'home' && <TrendingUp className="w-20 h-20 mx-auto mb-4 opacity-80" />}
                      {screen.id === 'social' && <Trophy className="w-20 h-20 mx-auto mb-4 opacity-80" />}
                      {screen.id === 'timer' && <Timer className="w-20 h-20 mx-auto mb-4 opacity-80" />}
                      <p className="text-2xl font-bold">{screen.title}</p>
                    </div>
                  </div>

                  {/* Mock Bottom Nav */}
                  <div className="flex justify-around bg-black/30 backdrop-blur rounded-2xl p-3">
                    <Home className="w-6 h-6 opacity-60" />
                    <Dumbbell className="w-6 h-6 opacity-60" />
                    <UtensilsCrossed className="w-6 h-6 opacity-60" />
                    <Trophy className="w-6 h-6 opacity-60" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${screen.color} rounded-full text-sm font-medium mb-4`}>
              <span>Screen {currentScreen + 1} of {DEMO_SCREENS.length}</span>
            </div>

            <h1 className="text-4xl font-bold mb-4">{screen.title}</h1>
            <p className="text-xl text-white/70 mb-8">{screen.description}</p>

            <div className="space-y-4 mb-8">
              {screen.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${screen.color} flex items-center justify-center`}>
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-white/90">{feature}</span>
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={prevScreen}
                className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextScreen}
                className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-orange-500/30 transition-all"
              >
                Next Screen
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-white/60 mb-6">Ready to transform your fitness journey?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/login')}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full font-bold text-lg hover:shadow-lg transition-all"
            >
              Get Started Free
            </button>
            <button
              onClick={() => router.push('/?guest=true')}
              className="px-8 py-4 bg-white/10 rounded-full font-bold text-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Try Demo Mode
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
