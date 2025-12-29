'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Dumbbell, Mail, Lock, User, Eye, EyeOff, Camera, Zap, Users, Trophy,
  ChevronRight, Star, Play, Check, ArrowRight, Sparkles, Target, Heart,
  Clock, TrendingUp, Apple, Utensils, Flame, Award, Crown, ChevronDown
} from 'lucide-react';

// Premium fitness imagery - wide shots showing full context
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=85', // Gym wide shot
  'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1920&q=85', // Gym interior wide
  'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1920&q=85', // Weights wide shot
];

// Transformation & results focused imagery
const TRANSFORMATION_IMAGES = {
  before: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80',
  after: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80',
  workout: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
  abs: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
  strong: 'https://images.unsplash.com/photo-1550345332-09e3ac987658?w=800&q=80',
  meal: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
  protein: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800&q=80',
};

// Aspirational testimonials with fit avatars
const TESTIMONIALS = [
  {
    name: 'Jessica T.',
    role: 'Lost 45 lbs in 6 months',
    quote: 'SnapFit completely changed my life. The AI workouts pushed me harder than any trainer ever did. I finally have the body I always dreamed of!',
    avatar: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=150&q=80',
    stats: { lost: '45 lbs', time: '6 months' }
  },
  {
    name: 'Marcus R.',
    role: 'Gained 20 lbs muscle',
    quote: 'The meal tracking is insane. I finally understand my nutrition and the gains have been unreal. Best fitness investment I ever made.',
    avatar: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=150&q=80',
    stats: { gained: '20 lbs', time: '4 months' }
  },
  {
    name: 'Sophia K.',
    role: 'Fitness Influencer • 250K',
    quote: 'I recommend SnapFit to all my followers. The photo-to-workout feature is literally magic. No more excuses!',
    avatar: 'https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=150&q=80',
    stats: { followers: '250K', workouts: '500+' }
  },
];

// Feature grid with bold visuals
const FEATURES = [
  {
    icon: Camera,
    title: 'AI Vision',
    desc: 'Snap any space. Our AI sees every piece of equipment you can use.',
    gradient: 'from-violet-600 to-indigo-600',
    image: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400&q=80'
  },
  {
    icon: Utensils,
    title: 'Smart Nutrition',
    desc: 'Photo your meals. Instant macros, calories, and nutrition insights.',
    gradient: 'from-emerald-500 to-teal-600',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'
  },
  {
    icon: Zap,
    title: 'Instant Workouts',
    desc: 'Personalized routines in seconds. No thinking, just results.',
    gradient: 'from-orange-500 to-red-600',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80'
  },
  {
    icon: TrendingUp,
    title: 'Track Progress',
    desc: 'Watch your transformation unfold with detailed analytics.',
    gradient: 'from-pink-500 to-rose-600',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80'
  },
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
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <div className="relative bg-zinc-900 rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-zinc-800">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-pink-500/10 rounded-3xl" />

        <div className="relative p-8">
          <button
            onClick={() => setShowAuth(false)}
            className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {isLogin ? 'Welcome Back' : 'Join SnapFit'}
              </h2>
              <p className="text-zinc-400 text-sm">
                {isLogin ? 'Continue your transformation' : 'Start your fitness journey'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Your name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-3.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/20">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTrainer}
                    onChange={(e) => setIsTrainer(e.target.checked)}
                    className="w-5 h-5 text-orange-500 bg-zinc-800 border-zinc-600 rounded focus:ring-orange-500"
                  />
                  <div className="ml-3">
                    <span className="font-semibold text-white">I&apos;m a Trainer</span>
                    <p className="text-sm text-zinc-400">Manage clients & sell products</p>
                  </div>
                </label>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50 text-lg"
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Start Free'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <span className="text-orange-400 font-semibold">{isLogin ? 'Sign up free' : 'Sign in'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {showAuth && <AuthModal />}

      {/* Premium Dark Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-black/90 backdrop-blur-xl border-b border-zinc-800' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight">SNAPFIT</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-zinc-400 hover:text-white font-medium transition-colors">Features</a>
              <a href="#results" className="text-zinc-400 hover:text-white font-medium transition-colors">Results</a>
              <a href="#testimonials" className="text-zinc-400 hover:text-white font-medium transition-colors">Success</a>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => { setShowAuth(true); setIsLogin(true); }}
                className="text-zinc-300 hover:text-white font-medium px-4 py-2 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => { setShowAuth(true); setIsLogin(false); }}
                className="bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold px-6 py-2.5 rounded-full hover:shadow-lg hover:shadow-orange-500/25 transition-all"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO - Full Screen Impact */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          {HERO_IMAGES.map((img, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                i === currentHeroImage ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
          {/* Dark overlay with gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 right-10 hidden lg:block animate-pulse">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <Flame className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">Today&apos;s Burn</p>
                <p className="text-lg font-bold">847 cal</p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-1/4 right-20 hidden lg:block animate-pulse delay-500">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                <Trophy className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">Streak</p>
                <p className="text-lg font-bold">21 Days</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 mb-8">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium">AI-Powered Fitness Revolution</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black leading-[0.9] mb-8">
              <span className="block">YOUR BODY.</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-rose-500">
                YOUR RULES.
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-zinc-300 mb-10 leading-relaxed max-w-2xl">
              <span className="text-white font-semibold">Snap a photo.</span> Get an AI workout instantly.
              Track meals with your camera. No gym required.
              <span className="text-orange-400 font-semibold"> Just results.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button
                onClick={() => { setShowAuth(true); setIsLogin(false); }}
                className="group flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold text-lg px-10 py-5 rounded-full hover:shadow-2xl hover:shadow-orange-500/30 transition-all"
              >
                Start Your Transformation
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => router.push('/?guest=true')}
                className="group flex items-center justify-center gap-3 bg-white/5 backdrop-blur-sm text-white font-bold text-lg px-10 py-5 rounded-full hover:bg-white/10 transition-all border border-white/10"
              >
                <Play className="w-5 h-5" />
                Watch Demo
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-6">
              <div className="flex -space-x-4">
                {TESTIMONIALS.map((t, i) => (
                  <img
                    key={i}
                    src={t.avatar}
                    alt=""
                    className="w-12 h-12 rounded-full border-2 border-black object-cover ring-2 ring-orange-500/20"
                  />
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
                  <span className="ml-2 text-sm font-semibold">4.9</span>
                </div>
                <p className="text-sm text-zinc-400">Trusted by 50,000+ athletes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <ChevronDown className="w-8 h-8 text-white/50 animate-bounce" />
        </div>
      </section>

      {/* FEATURES - Bento Grid Style */}
      <section id="features" className="py-32 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 rounded-full border border-orange-500/20 mb-6">
              <Camera className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-400">Why SnapFit?</span>
            </div>
            <h2 className="text-5xl sm:text-6xl font-black mb-6">
              SNAP. TRAIN.
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500"> TRANSFORM.</span>
            </h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              Your camera is your new personal trainer. No equipment? No problem.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {FEATURES.map((feature, i) => (
              <div
                key={i}
                className="group relative bg-zinc-900/50 rounded-3xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-all"
              >
                <div className="absolute inset-0">
                  <img src={feature.image} alt="" className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/90 to-transparent" />
                </div>
                <div className="relative p-8 sm:p-10">
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-lg text-zinc-400 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RESULTS Section - Before/After Vibes */}
      <section id="results" className="py-32 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-pink-500/5" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full border border-green-500/20 mb-6">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-400">Real Results</span>
              </div>
              <h2 className="text-5xl sm:text-6xl font-black mb-6 leading-tight">
                TRACK YOUR
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                  TRANSFORMATION
                </span>
              </h2>
              <p className="text-xl text-zinc-400 mb-10 leading-relaxed">
                Progress photos, body measurements, weight tracking—all in one place.
                Watch your body evolve with AI-powered insights and weekly reports.
              </p>

              <div className="grid grid-cols-2 gap-6 mb-10">
                {[
                  { icon: Camera, label: 'Progress Photos', value: 'Unlimited' },
                  { icon: TrendingUp, label: 'Body Metrics', value: '12+ tracked' },
                  { icon: Award, label: 'Achievements', value: '40+ badges' },
                  { icon: Zap, label: 'AI Reports', value: 'Weekly' },
                ].map((stat, i) => (
                  <div key={i} className="bg-zinc-900/50 rounded-2xl p-5 border border-zinc-800">
                    <stat.icon className="w-6 h-6 text-emerald-400 mb-3" />
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-zinc-500">{stat.label}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => { setShowAuth(true); setIsLogin(false); }}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold px-8 py-4 rounded-full hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
              >
                Start Tracking Free
              </button>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <img
                  src={TRANSFORMATION_IMAGES.workout}
                  alt="Workout"
                  className="rounded-2xl object-cover h-64 w-full"
                />
                <img
                  src={TRANSFORMATION_IMAGES.abs}
                  alt="Results"
                  className="rounded-2xl object-cover h-64 w-full mt-8"
                />
                <img
                  src={TRANSFORMATION_IMAGES.meal}
                  alt="Nutrition"
                  className="rounded-2xl object-cover h-64 w-full -mt-8"
                />
                <img
                  src={TRANSFORMATION_IMAGES.strong}
                  alt="Strength"
                  className="rounded-2xl object-cover h-64 w-full"
                />
              </div>

              {/* Floating Stats Card */}
              <div className="absolute -bottom-6 -left-6 bg-zinc-900 rounded-2xl p-5 border border-zinc-800 shadow-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Flame className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">This Week</p>
                    <p className="text-2xl font-bold">-2.4 lbs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS - Premium Cards */}
      <section id="testimonials" className="py-32 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500/10 rounded-full border border-pink-500/20 mb-6">
              <Crown className="w-4 h-4 text-pink-400" />
              <span className="text-sm font-medium text-pink-400">Success Stories</span>
            </div>
            <h2 className="text-5xl sm:text-6xl font-black mb-6">
              REAL PEOPLE.
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-500"> REAL RESULTS.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-zinc-900/50 rounded-3xl p-8 border border-zinc-800 hover:border-zinc-700 transition-all group">
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-orange-400 text-orange-400" />
                  ))}
                </div>
                <p className="text-lg text-zinc-300 mb-8 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-4">
                  <img
                    src={t.avatar}
                    alt=""
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-orange-500/20"
                  />
                  <div>
                    <p className="font-bold text-white">{t.name}</p>
                    <p className="text-sm text-orange-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="py-16 bg-gradient-to-r from-orange-600 via-pink-600 to-rose-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '50K+', label: 'Active Users' },
              { value: '2M+', label: 'Workouts Done' },
              { value: '1M+', label: 'Meals Tracked' },
              { value: '4.9★', label: 'App Rating' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl sm:text-5xl font-black text-white mb-2">{stat.value}</p>
                <p className="text-white/80 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 bg-black relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80"
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-black/70" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-8 leading-tight">
            READY TO
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-rose-500">
              TRANSFORM?
            </span>
          </h2>
          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
            Join 50,000+ people who stopped making excuses and started making progress.
            Your transformation starts with one snap.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => { setShowAuth(true); setIsLogin(false); }}
              className="group flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold text-xl px-12 py-5 rounded-full hover:shadow-2xl hover:shadow-orange-500/30 transition-all"
            >
              Start Free Now
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <p className="mt-6 text-sm text-zinc-500">
            No credit card required • Free forever to start
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
            <p className="text-sm text-zinc-500">© 2024 SnapFit. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-zinc-500 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-zinc-500 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-zinc-500 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
