'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, ArrowRight, Users, Dumbbell, UtensilsCrossed, BarChart3,
  UserPlus, TrendingUp, Calendar, MessageSquare, Check, Award,
  Clock, Activity, Star, DollarSign, AlertTriangle, Brain, Video,
  ShoppingBag, FileText, Heart, Zap, Target, Bell, Send, Quote,
  Sparkles, Shield, PieChart, Layout, ClipboardCheck
} from 'lucide-react';

const TRAINER_SCREENS = [
  {
    id: 'dashboard',
    title: 'Client Dashboard',
    description: 'See all your clients at a glance with their activity stats, risk alerts, and quick actions.',
    features: [
      'View all active clients with status',
      'At-risk client alerts at the top',
      'Weekly activity summaries',
      'Client streak and engagement scores',
      'One-click access to client details',
      'Filter by status, engagement, goals',
    ],
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
    color: 'from-indigo-500 to-purple-600',
    icon: Layout,
  },
  {
    id: 'revenue',
    title: 'Revenue Dashboard',
    description: 'Track your earnings from programs, subscriptions, and client payments in real-time.',
    features: [
      'Total revenue overview',
      'Monthly recurring revenue (MRR)',
      'Revenue by source breakdown',
      'Program sales analytics',
      'Client subscription tracking',
      'Payout history and schedule',
    ],
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
    color: 'from-green-500 to-emerald-500',
    icon: DollarSign,
  },
  {
    id: 'risk-alerts',
    title: 'Client Risk Alerts',
    description: 'AI-powered detection of at-risk clients who may churn, with actionable intervention suggestions.',
    features: [
      'Automatic inactivity detection',
      'Declining engagement patterns',
      'Missed check-ins flagged',
      'Goal progress stalls',
      'One-click outreach actions',
      'Risk score for each client',
    ],
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
    color: 'from-red-500 to-orange-500',
    icon: AlertTriangle,
  },
  {
    id: 'check-ins',
    title: 'Automated Check-ins',
    description: 'Set up scheduled check-ins that automatically prompt clients for updates and photos.',
    features: [
      'Weekly/biweekly schedules',
      'Custom question templates',
      'Photo prompts for progress',
      'Auto-reminder notifications',
      'Review responses in-app',
      'Client compliance tracking',
    ],
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80',
    color: 'from-blue-500 to-cyan-500',
    icon: ClipboardCheck,
  },
  {
    id: 'ai-programs',
    title: 'AI Program Generator',
    description: 'Use AI to create personalized training programs in minutes, not hours.',
    features: [
      'Input client goals and constraints',
      'AI generates full periodized plan',
      'Weekly workout breakdown',
      'Exercise alternatives included',
      'Edit and customize output',
      'Save as template or assign to client',
    ],
    image: 'https://images.unsplash.com/photo-1676299081847-824916de030a?w=800&q=80',
    color: 'from-purple-500 to-pink-500',
    icon: Brain,
  },
  {
    id: 'templates',
    title: 'Workout Templates',
    description: 'Build reusable workout templates to quickly assign to clients with personalization.',
    features: [
      'Create from scratch or AI',
      'Organize by category/type',
      'Include warmup/cooldown',
      'Video links for exercises',
      'Clone and modify easily',
      'Track which clients use each',
    ],
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
    color: 'from-orange-500 to-amber-500',
    icon: Dumbbell,
  },
  {
    id: 'marketplace',
    title: 'Program Marketplace',
    description: 'Sell your training programs to users worldwide and earn passive income.',
    features: [
      'List programs for sale',
      'Set your own pricing',
      'Program reviews and ratings',
      'Analytics and sales data',
      'Automatic delivery to buyers',
      'Multiple programs allowed',
    ],
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80',
    color: 'from-amber-500 to-yellow-500',
    icon: ShoppingBag,
  },
  {
    id: 'form-review',
    title: 'Form Check Review',
    description: 'Review client exercise videos, see AI analysis, and add your expert feedback.',
    features: [
      'Client video submissions',
      'AI provides initial score',
      'Add your expert commentary',
      'Highlight specific issues',
      'Suggest corrections',
      'Track improvement over time',
    ],
    image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&q=80',
    color: 'from-cyan-500 to-blue-500',
    icon: Video,
  },
  {
    id: 'testimonials',
    title: 'Testimonial Collection',
    description: 'Request and showcase client testimonials to build your reputation and attract new clients.',
    features: [
      'One-click testimonial requests',
      'Before/after photo prompts',
      'Video testimonial support',
      'Approval workflow',
      'Display on profile page',
      'Share on social media',
    ],
    image: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=800&q=80',
    color: 'from-pink-500 to-rose-500',
    icon: Quote,
  },
  {
    id: 'messaging',
    title: 'Client Messaging',
    description: 'In-app messaging to stay connected with your clients and provide support.',
    features: [
      'Direct message any client',
      'Attach photos and files',
      'Quick response templates',
      'Read receipts',
      'Push notifications',
      'Message history search',
    ],
    image: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=800&q=80',
    color: 'from-violet-500 to-purple-500',
    icon: MessageSquare,
  },
];

export default function TrainerDemoPage() {
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const nextScreen = () => {
    setCurrentScreen((prev) => (prev + 1) % TRAINER_SCREENS.length);
  };

  const prevScreen = () => {
    setCurrentScreen((prev) => (prev - 1 + TRAINER_SCREENS.length) % TRAINER_SCREENS.length);
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

  const screen = TRAINER_SCREENS[currentScreen];
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
            <Users className="w-6 h-6 text-purple-500" />
            <span className="font-bold text-sm sm:text-base">Trainer Features Demo</span>
          </div>
          <button
            onClick={() => router.push('/demo/user')}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            <span className="hidden sm:inline">← User Demo</span>
            <span className="sm:hidden">← User</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Progress Dots */}
        <div className="flex justify-center gap-1.5 mb-4">
          {TRAINER_SCREENS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentScreen(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === currentScreen
                  ? 'w-6 bg-purple-500'
                  : 'w-1.5 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Feature Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {TRAINER_SCREENS.map((s, i) => {
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
                      <p className="text-xs sm:text-sm text-white/70">Trusted by 1,000+ trainers</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="order-1 lg:order-2">
              <div className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r ${screen.color} rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4`}>
                <IconComponent className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Feature {currentScreen + 1} of {TRAINER_SCREENS.length}</span>
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

              {/* Navigation */}
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
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">All Trainer Features</h2>
          <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-10 gap-2 sm:gap-4">
            {TRAINER_SCREENS.map((s, i) => {
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

        {/* Revenue Highlight */}
        <div className="mt-12 sm:mt-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-green-500/30">
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
            <div>
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
                <h3 className="text-xl sm:text-2xl font-bold">Grow Your Income</h3>
              </div>
              <p className="text-sm sm:text-base text-white/70 mb-4 sm:mb-6">
                SnapFit trainers earn an average of $2,500/month through program sales and client subscriptions.
                Build passive income while helping more people reach their goals.
              </p>
              <div className="flex gap-4 sm:gap-6">
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-green-400">$50k+</p>
                  <p className="text-xs sm:text-sm text-white/60">Top trainer annual</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-green-400">15%</p>
                  <p className="text-xs sm:text-sm text-white/60">Platform fee only</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-green-400">Weekly</p>
                  <p className="text-xs sm:text-sm text-white/60">Payouts</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="bg-zinc-800/80 rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-xs">
                <p className="text-xs sm:text-sm text-white/60 mb-2">Example Monthly Revenue</p>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-white/70">Program Sales</span>
                    <span className="font-bold text-green-400">$1,200</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-white/70">Client Subscriptions</span>
                    <span className="font-bold text-green-400">$1,800</span>
                  </div>
                  <div className="h-px bg-white/10" />
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-white/70">Platform Fee (15%)</span>
                    <span className="text-red-400">-$450</span>
                  </div>
                  <div className="h-px bg-white/10" />
                  <div className="flex justify-between text-base sm:text-lg">
                    <span className="font-bold">Your Earnings</span>
                    <span className="font-bold text-green-400">$2,550</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 sm:mt-16 text-center">
          <p className="text-white/60 mb-4 sm:mb-6 text-sm sm:text-base">Ready to scale your training business?</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={() => router.push('/login')}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full font-bold text-base sm:text-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all"
            >
              Sign Up as Trainer
            </button>
            <button
              onClick={() => router.push('/demo/user')}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white/10 rounded-full font-bold text-base sm:text-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2"
            >
              <Dumbbell className="w-5 h-5" />
              See User Features
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
