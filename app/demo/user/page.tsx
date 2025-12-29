'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, ArrowRight, Camera, Dumbbell, UtensilsCrossed, Users, Trophy,
  Timer, Flame, Target, TrendingUp, Star, Check, Zap, Clock, Calendar,
  ChevronRight, Play, Home, Heart, Activity, Scale, Moon, Droplets,
  ShoppingBag, Video, Brain, Image, Smile, BarChart3, Award
} from 'lucide-react';

const DEMO_SCREENS = [
  {
    id: 'home',
    title: 'Home Dashboard',
    description: 'Your personalized fitness hub with stats, streaks, achievements, and quick access to all features.',
    features: [
      'Daily streak tracking with fire badge',
      'XP and leveling system',
      'Weekly goal progress bar',
      'Quick access to all features',
      'Achievement notifications',
      'Personalized recommendations',
    ],
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    color: 'from-indigo-500 to-purple-600',
    icon: Home,
  },
  {
    id: 'daily-tracker',
    title: 'Daily Tracker',
    description: 'Comprehensive daily tracking with meals, workouts, photos, and health metrics in one place.',
    features: [
      'Day/Week/Month calendar views',
      'Log meals with full macro tracking',
      'Daily check-in: weight, mood, sleep, water',
      'Progress photo timeline',
      'Calorie & protein goal progress bars',
      'Weekly and monthly summaries',
    ],
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80',
    color: 'from-orange-500 to-pink-500',
    icon: Calendar,
  },
  {
    id: 'workout',
    title: 'AI Workout Generator',
    description: 'Snap a photo of any space and get a personalized workout instantly with video demonstrations.',
    features: [
      'Photo-based equipment detection',
      'AI generates complete routine',
      'YouTube exercise demonstrations',
      'Warm-up, main workout, cool-down',
      'Sets, reps, and rest timing',
      'Save and track workout history',
    ],
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=800&q=80',
    color: 'from-blue-500 to-indigo-500',
    icon: Camera,
  },
  {
    id: 'recovery',
    title: 'Recovery Score',
    description: 'Daily recovery assessment to optimize your training intensity and prevent overtraining.',
    features: [
      'Morning recovery questionnaire',
      'Sleep quality analysis',
      'Muscle soreness tracking',
      'Stress level assessment',
      'AI-powered recommendations',
      'Training intensity suggestions',
    ],
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
    color: 'from-green-500 to-teal-500',
    icon: Heart,
  },
  {
    id: 'form-check',
    title: 'Form Check AI',
    description: 'Upload exercise videos for AI-powered form analysis and personalized improvement tips.',
    features: [
      'Video upload for any exercise',
      'AI analyzes your form',
      'Score out of 100',
      'Specific improvement cues',
      'Safety warnings',
      'Trainer can add feedback',
    ],
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
    color: 'from-purple-500 to-pink-500',
    icon: Video,
  },
  {
    id: 'food',
    title: 'Smart Food Tracking',
    description: 'Photo your meals for instant AI-powered nutrition analysis with full macro breakdown.',
    features: [
      'Snap a photo of any meal',
      'AI identifies food and portions',
      'Instant calorie count',
      'Protein, carbs, fat, fiber breakdown',
      'Daily/weekly macro summaries',
      'Meal history and patterns',
    ],
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
    color: 'from-green-500 to-emerald-500',
    icon: UtensilsCrossed,
  },
  {
    id: 'body',
    title: 'Body Tracking',
    description: 'Track your body transformation with weight logs, measurements, and progress photos.',
    features: [
      'Daily weight logging with trends',
      'Body measurements tracking',
      'Progress photo comparisons',
      'Visual transformation timeline',
      'Goal tracking with projections',
      'Share progress with trainer',
    ],
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    color: 'from-cyan-500 to-blue-500',
    icon: Scale,
  },
  {
    id: 'programs',
    title: 'Program Marketplace',
    description: 'Browse and purchase professional training programs from certified trainers.',
    features: [
      'Browse programs by category',
      'Beginner to advanced levels',
      'Reviews and ratings',
      'One-time purchase, lifetime access',
      'Weekly workout schedules',
      'Nutrition guides included',
    ],
    image: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&q=80',
    color: 'from-amber-500 to-orange-500',
    icon: ShoppingBag,
  },
  {
    id: 'achievements',
    title: 'Gamification & XP',
    description: 'Earn XP, unlock achievements, and compete with friends on leaderboards.',
    features: [
      'XP for every action',
      'Level up system',
      'Unlock achievement badges',
      'Daily and weekly challenges',
      'Leaderboard rankings',
      'Streak bonuses',
    ],
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80',
    color: 'from-yellow-500 to-amber-500',
    icon: Trophy,
  },
  {
    id: 'social',
    title: 'Social & Challenges',
    description: 'Connect with friends, join challenges, and stay motivated together.',
    features: [
      'Add friends by email',
      'See friends\' activity',
      'Join public challenges',
      'Create private challenges',
      'Compete on leaderboards',
      'Message friends and trainers',
    ],
    image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80',
    color: 'from-rose-500 to-pink-500',
    icon: Users,
  },
];

export default function UserDemoPage() {
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const nextScreen = () => {
    setCurrentScreen((prev) => (prev + 1) % DEMO_SCREENS.length);
  };

  const prevScreen = () => {
    setCurrentScreen((prev) => (prev - 1 + DEMO_SCREENS.length) % DEMO_SCREENS.length);
  };

  // Handle touch events for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50; // minimum swipe distance

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        nextScreen(); // Swipe left = next
      } else {
        prevScreen(); // Swipe right = prev
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextScreen();
      if (e.key === 'ArrowLeft') prevScreen();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const screen = DEMO_SCREENS[currentScreen];
  const IconComponent = screen.icon;

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-orange-500" />
            <span className="font-bold text-sm sm:text-base">User Experience Demo</span>
          </div>
          <button
            onClick={() => router.push('/demo/trainer')}
            className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
          >
            <span className="hidden sm:inline">See Trainer Demo →</span>
            <span className="sm:hidden">Trainer →</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Progress Dots */}
        <div className="flex justify-center gap-1.5 mb-4">
          {DEMO_SCREENS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentScreen(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === currentScreen
                  ? 'w-6 bg-orange-500'
                  : 'w-1.5 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Feature Navigation - Scrollable */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {DEMO_SCREENS.map((s, i) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setCurrentScreen(i)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  i === currentScreen
                    ? `bg-gradient-to-r ${s.color} text-white shadow-lg`
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{s.title.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Swipeable Content Area */}
        <div
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="touch-pan-y"
        >
          {/* Current Screen */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Image/Preview */}
            <div className="relative order-2 lg:order-1">
              <div className={`absolute inset-0 bg-gradient-to-br ${screen.color} rounded-3xl blur-3xl opacity-20`} />
              <div className="relative bg-zinc-800/80 backdrop-blur rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                {/* Mobile-friendly aspect ratio */}
                <div className="aspect-[16/10] sm:aspect-[4/3] relative">
                  <img
                    src={screen.image}
                    alt={screen.title}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent`} />

                  {/* Feature Icon Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${screen.color} shadow-2xl`}>
                      <IconComponent className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                    </div>
                  </div>

                  {/* Swipe hint on mobile */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center lg:hidden">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur rounded-full text-xs text-white/70">
                      <ArrowLeft className="w-3 h-3" />
                      <span>Swipe to navigate</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>

                  {/* Bottom info */}
                  <div className="absolute bottom-12 lg:bottom-4 left-0 right-0 p-4 sm:p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-700 border-2 border-zinc-800" />
                        ))}
                      </div>
                      <p className="text-xs sm:text-sm text-white/70">Join 10,000+ users</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="order-1 lg:order-2">
              <div className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r ${screen.color} rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4`}>
                <IconComponent className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Feature {currentScreen + 1} of {DEMO_SCREENS.length}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">{screen.title}</h1>
              <p className="text-base sm:text-xl text-white/70 mb-6 sm:mb-8">{screen.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-6 sm:mb-8">
                {screen.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-white/5 rounded-xl">
                    <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-r ${screen.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </div>
                    <span className="text-xs sm:text-sm text-white/90">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-3 sm:gap-4">
                <button
                  onClick={prevScreen}
                  className="p-2.5 sm:p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button
                  onClick={nextScreen}
                  className={`flex-1 py-3 sm:py-4 bg-gradient-to-r ${screen.color} rounded-full font-bold text-base sm:text-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all`}
                >
                  Next Feature
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid Preview */}
        <div className="mt-12 sm:mt-16">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">All User Features</h2>
          <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-10 gap-2 sm:gap-4">
            {DEMO_SCREENS.map((s, i) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setCurrentScreen(i)}
                  className={`p-2 sm:p-4 rounded-xl sm:rounded-2xl transition-all ${
                    i === currentScreen
                      ? `bg-gradient-to-br ${s.color} shadow-lg scale-105`
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2" />
                  <p className="text-[10px] sm:text-xs font-medium text-center truncate">{s.title.split(' ')[0]}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 sm:mt-16 text-center">
          <p className="text-white/60 mb-4 sm:mb-6 text-sm sm:text-base">Ready to transform your fitness journey?</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={() => router.push('/login')}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full font-bold text-base sm:text-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all"
            >
              Get Started Free
            </button>
            <button
              onClick={() => router.push('/demo/trainer')}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white/10 rounded-full font-bold text-base sm:text-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5" />
              See Trainer Features
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
