'use client';

import { useState, useEffect, useRef } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Dumbbell, Mail, Lock, User, Eye, EyeOff, Camera, Zap, Users, Trophy,
  ChevronRight, Star, Play, Check, ArrowRight, Sparkles, Target, Heart,
  Clock, TrendingUp, Apple, Utensils, Flame, Award, Crown, ChevronDown,
  MousePointer2, Smartphone, BarChart3, Shield, Gift, Bolt, Timer,
  Calendar, MessageCircle, ShoppingBag, Activity, X
} from 'lucide-react';

// Live activity data for social proof
const LIVE_ACTIVITIES = [
  { user: 'Sarah M.', action: 'just completed', item: 'HIIT Blast', time: '2s ago', icon: Flame },
  { user: 'Mike R.', action: 'earned', item: 'Week Warrior badge', time: '15s ago', icon: Trophy },
  { user: 'Emma L.', action: 'logged', item: '1,847 calories today', time: '23s ago', icon: Utensils },
  { user: 'Jake T.', action: 'started', item: 'Morning Yoga Flow', time: '45s ago', icon: Heart },
  { user: 'Lisa K.', action: 'hit a', item: '30-day streak!', time: '1m ago', icon: Zap },
  { user: 'Chris P.', action: 'lost', item: '3.2 lbs this week', time: '2m ago', icon: TrendingUp },
];

// Premium testimonials
const TESTIMONIALS = [
  {
    name: 'Jessica Thompson',
    role: 'Lost 45 lbs in 6 months',
    quote: 'SnapFit completely transformed my relationship with fitness. The AI understands exactly what I need.',
    avatar: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=150&q=80',
    stats: { metric: '-45 lbs', duration: '6 months' },
    gradient: 'from-pink-500 to-rose-600'
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Gained 20 lbs muscle',
    quote: 'The meal tracking combined with AI workouts is a game changer. Best investment in my health.',
    avatar: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=150&q=80',
    stats: { metric: '+20 lbs', duration: '4 months' },
    gradient: 'from-blue-500 to-indigo-600'
  },
  {
    name: 'Sophia Kim',
    role: 'Fitness Influencer • 250K',
    quote: 'I recommend SnapFit to all my followers. The photo-to-workout feature is unlike anything else.',
    avatar: 'https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=150&q=80',
    stats: { metric: '250K+', duration: 'followers' },
    gradient: 'from-amber-500 to-orange-600'
  },
];

// How it works steps
const STEPS = [
  {
    number: '01',
    title: 'Snap Your Space',
    description: 'Take a photo of any space – your living room, hotel, park, or gym. Our AI sees everything.',
    icon: Camera,
    gradient: 'from-violet-500 to-purple-600',
    mockup: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&q=80'
  },
  {
    number: '02',
    title: 'Get AI Workout',
    description: 'In seconds, receive a personalized workout using exactly what\'s available to you.',
    icon: Sparkles,
    gradient: 'from-orange-500 to-pink-600',
    mockup: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80'
  },
  {
    number: '03',
    title: 'Train & Track',
    description: 'Follow along with video guides, track your progress, and watch yourself transform.',
    icon: TrendingUp,
    gradient: 'from-emerald-500 to-teal-600',
    mockup: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80'
  }
];

// Feature grid with images
const FEATURES = [
  { icon: Camera, title: 'AI Vision', desc: 'Snap any space for instant workouts', color: 'text-violet-400', bg: 'bg-violet-500/10', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80' },
  { icon: Utensils, title: 'Meal Tracking', desc: 'Photo your food, get macros instantly', color: 'text-emerald-400', bg: 'bg-emerald-500/10', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80' },
  { icon: TrendingUp, title: 'Progress Photos', desc: 'Visual transformation timeline', color: 'text-pink-400', bg: 'bg-pink-500/10', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80' },
  { icon: Trophy, title: 'Achievements', desc: '40+ badges to unlock', color: 'text-amber-400', bg: 'bg-amber-500/10', image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&q=80' },
  { icon: MessageCircle, title: 'Trainer Chat', desc: 'Connect with certified pros', color: 'text-blue-400', bg: 'bg-blue-500/10', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80' },
  { icon: ShoppingBag, title: 'Marketplace', desc: 'Programs & supplements', color: 'text-rose-400', bg: 'bg-rose-500/10', image: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400&q=80' },
];

// Exercise videos with YouTube IDs for demo
const EXERCISE_VIDEOS = [
  { title: 'Push-ups', category: 'Upper Body', duration: '0:30', image: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&q=80', gradient: 'from-blue-500 to-cyan-500', youtubeId: 'IODxDxX7oi4' },
  { title: 'Squats', category: 'Lower Body', duration: '0:45', image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&q=80', gradient: 'from-orange-500 to-red-500', youtubeId: 'aclHkVaku9U' },
  { title: 'Plank', category: 'Core', duration: '1:00', image: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=600&q=80', gradient: 'from-purple-500 to-pink-500', youtubeId: 'pSHjTRCQxIw' },
  { title: 'Lunges', category: 'Lower Body', duration: '0:40', image: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=600&q=80', gradient: 'from-green-500 to-emerald-500', youtubeId: 'QOVaHwm-Q6U' },
  { title: 'Deadlift', category: 'Full Body', duration: '0:50', image: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=600&q=80', gradient: 'from-amber-500 to-orange-500', youtubeId: 'r4MzxtBKyNE' },
  { title: 'Yoga Flow', category: 'Flexibility', duration: '2:00', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80', gradient: 'from-teal-500 to-cyan-500', youtubeId: 'v7AYKMP6rOE' },
];

export default function LoginPage() {
  const router = useRouter();
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isTrainer, setIsTrainer] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [videoModal, setVideoModal] = useState<{ show: boolean; video: typeof EXERCISE_VIDEOS[0] | null }>({ show: false, video: null });

  // Cycle through live activities
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentActivity((prev) => (prev + 1) % LIVE_ACTIVITIES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Track scroll for nav
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track mouse for gradient effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const result = await signIn('credentials', { email, password, redirect: false });
        if (result?.error) {
          setError(result.error);
        } else {
          router.push('/');
          router.refresh();
        }
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name, isTrainer }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error);
        } else {
          const result = await signIn('credentials', { email, password, redirect: false });
          if (result?.ok) {
            router.push('/');
            router.refresh();
          }
        }
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const AuthModal = () => (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Animated gradient border */}
        <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-pink-500 to-violet-500 rounded-3xl blur-lg opacity-50 animate-pulse pointer-events-none" />

        <div className="relative bg-zinc-950 rounded-3xl border border-zinc-800 overflow-hidden">
          {/* Header gradient */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-orange-500/20 via-pink-500/10 to-transparent pointer-events-none" />

          <div className="relative p-8">
            <button
              onClick={() => setShowAuth(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-800 transition-colors"
            >
              <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-600 rounded-2xl blur-lg opacity-50" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-orange-500 to-pink-600 rounded-2xl flex items-center justify-center">
                  <Dumbbell className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">
                  {isLogin ? 'Welcome Back' : 'Join SnapFit'}
                </h2>
                <p className="text-zinc-400">
                  {isLogin ? 'Continue your journey' : 'Start transforming today'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Name</label>
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl opacity-0 group-focus-within:opacity-50 blur transition-opacity pointer-events-none" />
                    <div className="relative flex items-center">
                      <User className="absolute left-4 w-5 h-5 text-zinc-500 pointer-events-none" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-transparent transition-all"
                        placeholder="Your name"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl opacity-0 group-focus-within:opacity-50 blur transition-opacity pointer-events-none" />
                  <div className="relative flex items-center">
                    <Mail className="absolute left-4 w-5 h-5 text-zinc-500 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-transparent transition-all"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Password</label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl opacity-0 group-focus-within:opacity-50 blur transition-opacity pointer-events-none" />
                  <div className="relative flex items-center">
                    <Lock className="absolute left-4 w-5 h-5 text-zinc-500 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-12 pr-12 py-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 text-zinc-500 hover:text-zinc-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {!isLogin && (
                <div className="relative p-4 rounded-xl bg-gradient-to-r from-orange-500/5 to-pink-500/5 border border-orange-500/20 overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                  <label className="flex items-center cursor-pointer relative">
                    <input
                      type="checkbox"
                      checked={isTrainer}
                      onChange={(e) => setIsTrainer(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      isTrainer ? 'bg-gradient-to-r from-orange-500 to-pink-500 border-transparent' : 'border-zinc-600'
                    }`}>
                      {isTrainer && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <div className="ml-3">
                      <span className="font-semibold text-white">I&apos;m a Trainer</span>
                      <p className="text-sm text-zinc-400">Manage clients & sell products</p>
                    </div>
                  </label>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="relative w-full group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl blur opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold py-4 rounded-xl text-lg">
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {isLogin ? 'Sign In' : 'Start Free'}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400 font-semibold">
                  {isLogin ? 'Sign up free' : 'Sign in'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {showAuth && <AuthModal />}

      {/* Demo Selection Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
          <div className="relative w-full max-w-lg">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-lg opacity-30 pointer-events-none" />
            <div className="relative bg-zinc-950 rounded-3xl border border-zinc-800 p-8">
              <button
                onClick={() => setShowDemoModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="text-center mb-8">
                <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 mb-4">
                  <Play className="w-8 h-8 text-violet-400" />
                </div>
                <h2 className="text-2xl font-black mb-2">Explore SnapFit</h2>
                <p className="text-zinc-400">Choose a demo to see the full experience</p>
              </div>

              <div className="grid gap-4">
                <button
                  onClick={() => { setShowDemoModal(false); router.push('/demo/user'); }}
                  className="group relative p-6 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/20 hover:border-blue-500/40 transition-all text-left overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
                  <div className="relative flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <User className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1 group-hover:text-blue-400 transition-colors">User Account</h3>
                      <p className="text-sm text-zinc-400 mb-3">Track workouts, log meals, view progress</p>
                      <div className="flex flex-wrap gap-2">
                        {['AI Workouts', 'Food Tracking', 'Progress Photos'].map((tag) => (
                          <span key={tag} className="text-xs px-2 py-1 rounded-lg bg-zinc-800/50 text-zinc-400">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>

                <button
                  onClick={() => { setShowDemoModal(false); router.push('/demo/trainer'); }}
                  className="group relative p-6 rounded-2xl bg-gradient-to-br from-orange-500/5 to-pink-500/5 border border-orange-500/20 hover:border-orange-500/40 transition-all text-left overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
                  <div className="relative flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Users className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1 group-hover:text-orange-400 transition-colors">Trainer Account</h3>
                      <p className="text-sm text-zinc-400 mb-3">Manage clients, create programs, sell products</p>
                      <div className="flex flex-wrap gap-2">
                        {['Client Management', 'Workout Templates', 'Product Store'].map((tag) => (
                          <span key={tag} className="text-xs px-2 py-1 rounded-lg bg-zinc-800/50 text-zinc-400">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              </div>

              <p className="text-xs text-zinc-500 mt-6 text-center">
                Demo accounts have limited features. Sign up for full access!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic gradient that follows cursor */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30 transition-all duration-1000"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(249, 115, 22, 0.15), transparent 40%)`
        }}
      />

      {/* Noise texture overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
      }} />

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled ? 'bg-black/80 backdrop-blur-2xl border-b border-zinc-800/50' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl blur-md opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-11 h-11 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Dumbbell className="w-6 h-6 text-white" />
                </div>
              </div>
              <span className="text-2xl font-black tracking-tight">SNAPFIT</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-zinc-400 hover:text-white font-medium transition-colors">How It Works</a>
              <a href="#features" className="text-zinc-400 hover:text-white font-medium transition-colors">Features</a>
              <a href="#testimonials" className="text-zinc-400 hover:text-white font-medium transition-colors">Results</a>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => { setShowAuth(true); setIsLogin(true); }}
                className="text-zinc-300 hover:text-white font-medium px-4 py-2 transition-colors hidden sm:block"
              >
                Sign In
              </button>
              <button
                onClick={() => { setShowAuth(true); setIsLogin(false); }}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-pink-600 rounded-full blur opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold px-6 py-2.5 rounded-full">
                  Get Started
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION - Maximum Impact */}
      <section className="relative min-h-screen flex items-center pt-20">
        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-pink-600/10 to-violet-600/20 animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/30 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s' }} />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/30 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />
          <div className="absolute top-1/3 right-0 w-64 h-64 bg-violet-500/20 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }} />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              {/* Live Activity Badge */}
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 mb-8 group hover:border-orange-500/30 transition-colors cursor-default">
                <div className="relative">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping" />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-white">{LIVE_ACTIVITIES[currentActivity].user}</span>
                  <span className="text-zinc-400">{LIVE_ACTIVITIES[currentActivity].action}</span>
                  <span className="text-orange-400 font-medium">{LIVE_ACTIVITIES[currentActivity].item}</span>
                </div>
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.95] mb-8">
                <span className="block">SNAP.</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-violet-500">TRAIN.</span>
                <span className="block">TRANSFORM.</span>
              </h1>

              <p className="text-xl text-zinc-400 mb-10 leading-relaxed max-w-lg">
                The only fitness app that uses AI to create
                <span className="text-white font-semibold"> personalized workouts from a single photo</span>.
                Your space. Your rules. Real results.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button
                  onClick={() => { setShowAuth(true); setIsLogin(false); }}
                  className="relative group"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-pink-500 to-violet-500 rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold text-lg px-10 py-5 rounded-2xl group-hover:shadow-2xl transition-all">
                    Start Free Today
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
                <button
                  onClick={() => setShowDemoModal(true)}
                  className="group flex items-center justify-center gap-3 bg-white/5 backdrop-blur-sm text-white font-bold text-lg px-10 py-5 rounded-2xl hover:bg-white/10 transition-all border border-white/10 hover:border-white/20"
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 ml-0.5" />
                  </div>
                  Try Demo
                </button>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex -space-x-3">
                  {TESTIMONIALS.map((t, i) => (
                    <div key={i} className="relative group">
                      <div className={`absolute inset-0 bg-gradient-to-r ${t.gradient} rounded-full blur opacity-0 group-hover:opacity-50 transition-opacity`} />
                      <img
                        src={t.avatar}
                        alt=""
                        className="relative w-12 h-12 rounded-full border-2 border-black object-cover"
                      />
                    </div>
                  ))}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-sm font-bold border-2 border-black">
                    +50K
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-orange-400 text-orange-400" />
                    ))}
                    <span className="ml-2 text-sm font-bold">4.9</span>
                  </div>
                  <p className="text-sm text-zinc-500">Trusted by 50K+ athletes</p>
                </div>
              </div>
            </div>

            {/* Right Content - App Preview */}
            <div className="relative hidden lg:block">
              {/* Phone Mockup */}
              <div className="relative mx-auto" style={{ width: '300px' }}>
                <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 via-pink-500/20 to-violet-500/20 rounded-[3rem] blur-2xl" />
                <div className="relative bg-zinc-900 rounded-[2.5rem] p-3 border border-zinc-800 shadow-2xl">
                  {/* Phone notch */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-10" />

                  {/* Screen content */}
                  <div className="relative bg-black rounded-[2rem] overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80"
                      alt="SnapFit App"
                      className="w-full h-[500px] object-cover opacity-60"
                    />

                    {/* Overlay UI */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-pink-600 flex items-center justify-center">
                          <Camera className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm text-zinc-400">Equipment Detected</p>
                          <p className="font-bold">12 items found</p>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-orange-500 to-pink-600 rounded-2xl p-4 text-center">
                        <p className="font-bold text-lg">Generate Workout</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -left-8 top-20 bg-zinc-900/90 backdrop-blur-xl rounded-2xl p-4 border border-zinc-800 shadow-2xl animate-float" style={{ animationDuration: '6s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                    <Flame className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400">Today&apos;s Burn</p>
                    <p className="text-xl font-bold">847 cal</p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-4 bottom-32 bg-zinc-900/90 backdrop-blur-xl rounded-2xl p-4 border border-zinc-800 shadow-2xl animate-float" style={{ animationDuration: '8s', animationDelay: '2s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400">Current Streak</p>
                    <p className="text-xl font-bold">21 Days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2 text-zinc-500">
            <span className="text-xs tracking-wider uppercase">Scroll to explore</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 rounded-full border border-violet-500/20 mb-6">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium text-violet-400">Simple as 1-2-3</span>
            </div>
            <h2 className="text-5xl sm:text-6xl font-black mb-6">
              HOW IT <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-500">WORKS</span>
            </h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              From photo to personalized workout in under 30 seconds
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={i} className="group relative">
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div className="absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-zinc-700 to-transparent hidden lg:block" />
                )}

                <div className="relative h-full bg-zinc-900/50 rounded-3xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-all group-hover:shadow-2xl group-hover:shadow-violet-500/5">
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={step.mockup}
                      alt={step.title}
                      className="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />

                    {/* Step Number */}
                    <div className="absolute top-4 left-4 px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/10">
                      <span className="text-sm font-bold text-white">{step.number}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                      <step.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                    <p className="text-zinc-400 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WORKOUT VIDEO SHOWCASE */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-black" />
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-gradient-to-r from-pink-500/20 to-transparent rounded-full blur-[100px] -translate-y-1/2" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-gradient-to-l from-violet-500/20 to-transparent rounded-full blur-[100px] -translate-y-1/2" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/10 rounded-full border border-rose-500/20 mb-6">
              <Play className="w-4 h-4 text-rose-400" />
              <span className="text-sm font-medium text-rose-400">See It In Action</span>
            </div>
            <h2 className="text-5xl sm:text-6xl font-black mb-6">
              TRAIN <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-500">ANYWHERE</span>
            </h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              Workout demos with proper form guides for every exercise
            </p>
          </div>

          {/* Video Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {EXERCISE_VIDEOS.map((video, i) => (
              <div
                key={i}
                className="group relative rounded-2xl overflow-hidden cursor-pointer"
                onClick={() => setVideoModal({ show: true, video })}
              >
                <div className="aspect-video relative">
                  <img
                    src={video.image}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80" />

                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${video.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <Play className="w-7 h-7 text-white ml-1" />
                    </div>
                  </div>

                  {/* Duration badge */}
                  <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-sm font-medium">
                    {video.duration}
                  </div>

                  {/* Title and category */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className={`text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r ${video.gradient}`}>{video.category}</p>
                    <h3 className="text-xl font-bold text-white">{video.title}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-zinc-400 mb-6">
              500+ exercise videos with step-by-step instructions
            </p>
            <button
              onClick={() => { setShowAuth(true); setIsLogin(false); }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-rose-500/25 transition-all"
            >
              <Play className="w-5 h-5" />
              Access Full Video Library
            </button>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-zinc-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-orange-500/10 to-transparent rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 rounded-full border border-orange-500/20 mb-6">
              <Zap className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-400">Packed with Power</span>
            </div>
            <h2 className="text-5xl sm:text-6xl font-black mb-6">
              EVERYTHING <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">YOU NEED</span>
            </h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              One app to rule your fitness journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <div
                key={i}
                className="group relative rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all hover:-translate-y-1 overflow-hidden"
              >
                {/* Feature image */}
                <div className="aspect-[16/9] relative overflow-hidden">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent" />
                  <div className={`absolute bottom-4 left-4 w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center backdrop-blur-sm`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                </div>
                {/* Feature content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-zinc-400">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-32 relative">
        <div className="absolute inset-0 bg-black" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-zinc-950 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500/10 rounded-full border border-pink-500/20 mb-6">
              <Crown className="w-4 h-4 text-pink-400" />
              <span className="text-sm font-medium text-pink-400">Success Stories</span>
            </div>
            <h2 className="text-5xl sm:text-6xl font-black mb-6">
              REAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-500">RESULTS</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="group relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${t.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                <div className="relative bg-zinc-900/80 backdrop-blur-sm rounded-3xl p-8 border border-zinc-800 hover:border-zinc-700 transition-all h-full">
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-6">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-5 h-5 fill-orange-400 text-orange-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-lg text-zinc-300 mb-8 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>

                  {/* Stat Badge */}
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${t.gradient} mb-6`}>
                    <span className="text-2xl font-black">{t.stats.metric}</span>
                    <span className="text-white/80 text-sm">{t.stats.duration}</span>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className={`absolute inset-0 bg-gradient-to-r ${t.gradient} rounded-full blur-sm opacity-50`} />
                      <img
                        src={t.avatar}
                        alt=""
                        className="relative w-14 h-14 rounded-full object-cover border-2 border-black"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-white">{t.name}</p>
                      <p className={`text-sm text-transparent bg-clip-text bg-gradient-to-r ${t.gradient}`}>{t.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-pink-600 to-violet-600" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'linear-gradient(45deg, rgba(0,0,0,.1) 25%, transparent 25%, transparent 75%, rgba(0,0,0,.1) 75%, rgba(0,0,0,.1)), linear-gradient(45deg, rgba(0,0,0,.1) 25%, transparent 25%, transparent 75%, rgba(0,0,0,.1) 75%, rgba(0,0,0,.1))',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 10px 10px'
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '50K+', label: 'Active Users', icon: Users },
              { value: '2M+', label: 'Workouts Done', icon: Dumbbell },
              { value: '1M+', label: 'Meals Tracked', icon: Utensils },
              { value: '4.9', label: 'App Rating', icon: Star },
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-4xl sm:text-5xl font-black text-white mb-1">{stat.value}</p>
                <p className="text-white/80 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-black" />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-pink-500/5 to-violet-500/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-full blur-[100px]" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 mb-8">
            <Gift className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium">Free forever to start</span>
          </div>

          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-8 leading-tight">
            YOUR TRANSFORMATION
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-violet-500">
              STARTS NOW
            </span>
          </h2>

          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
            Join 50,000+ people who stopped making excuses and started making progress.
          </p>

          <button
            onClick={() => { setShowAuth(true); setIsLogin(false); }}
            className="relative group inline-flex"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-pink-500 to-violet-500 rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity animate-pulse" style={{ animationDuration: '3s' }} />
            <div className="relative flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold text-xl px-14 py-6 rounded-2xl">
              Get Started Free
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          <p className="mt-6 text-sm text-zinc-500">
            No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-zinc-950 border-t border-zinc-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black">SNAPFIT</span>
            </div>
            <p className="text-sm text-zinc-500">&copy; 2024 SnapFit. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-zinc-500 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-zinc-500 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-zinc-500 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>

      {/* CSS for floating animation */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      {/* Video Modal */}
      {videoModal.show && videoModal.video && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setVideoModal({ show: false, video: null })}
        >
          <div
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setVideoModal({ show: false, video: null })}
              className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Video title */}
            <div className="mb-4">
              <p className={`text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r ${videoModal.video.gradient}`}>
                {videoModal.video.category}
              </p>
              <h3 className="text-2xl font-bold text-white">{videoModal.video.title}</h3>
            </div>

            {/* YouTube embed */}
            <div className="aspect-video rounded-2xl overflow-hidden bg-zinc-900">
              <iframe
                src={`https://www.youtube.com/embed/${videoModal.video.youtubeId}?autoplay=1`}
                title={videoModal.video.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Info below video */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-zinc-400">Duration: {videoModal.video.duration}</p>
              <button
                onClick={() => { setVideoModal({ show: false, video: null }); setShowAuth(true); setIsLogin(false); }}
                className={`px-6 py-2 bg-gradient-to-r ${videoModal.video.gradient} rounded-full font-bold text-white hover:shadow-lg transition-all`}
              >
                Get Full Access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
