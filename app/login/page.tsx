'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Dumbbell, Mail, Lock, User, Eye, EyeOff, Camera, Zap, Users, Trophy,
  ChevronRight, Star, Play, Check, ArrowRight, Sparkles, Target, Heart,
  Clock, TrendingUp, Apple, Utensils, Smartphone, Scan, ImageIcon
} from 'lucide-react';

// Hero images for the landing page
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80',
  'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=1200&q=80',
];

const FEATURE_IMAGES = {
  ai: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=600&q=80',
  food: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80',
  social: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&q=80',
  progress: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80',
  camera: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&q=80',
};

const TESTIMONIALS = [
  { name: 'Sarah M.', role: 'Lost 30 lbs', quote: 'SnapFit transformed how I work out. The AI sees equipment I never thought to use!', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80' },
  { name: 'James K.', role: 'Personal Trainer', quote: 'I recommend SnapFit to all my clients. The food tracking is incredibly accurate.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80' },
  { name: 'Maria L.', role: 'Fitness Enthusiast', quote: 'The challenges keep me motivated. I love competing with friends!', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80' },
];

// Emphasize the SNAP concept - photo-first AI features
const SNAP_FEATURES = [
  { icon: Camera, title: 'Snap Your Space', desc: 'Point your camera at any room—gym, living room, hotel, outdoors—and AI detects every piece of equipment you can use', color: 'from-orange-500 to-red-500' },
  { icon: Utensils, title: 'Snap Your Food', desc: 'Take a photo of your meal and get instant calorie counts, macros, and nutrition insights powered by AI', color: 'from-green-500 to-emerald-500' },
  { icon: Zap, title: 'Instant AI Workouts', desc: 'Get a complete personalized workout routine in seconds based on what the AI sees in your photos', color: 'from-blue-500 to-indigo-500' },
];

const MORE_FEATURES = [
  { icon: Trophy, title: 'Challenges & Goals', desc: 'Compete with friends and unlock achievements' },
  { icon: TrendingUp, title: 'Track Progress', desc: 'Visualize your fitness journey with detailed stats' },
  { icon: Users, title: 'Social Motivation', desc: 'Connect with friends and share your wins' },
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

  // Rotate hero images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

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
          const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
          });

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

  const handleGuestMode = () => {
    router.push('/?guest=true');
  };

  // Auth Modal/Drawer
  const AuthModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-300">
        {/* Header with image */}
        <div className="relative h-32 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-t-3xl overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <button
            onClick={() => setShowAuth(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="absolute bottom-4 left-6">
            <div className="flex items-center gap-2 text-white">
              <Dumbbell className="w-8 h-8" />
              <span className="text-2xl font-bold">SnapFit</span>
            </div>
          </div>
        </div>

        {/* Auth form */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {isLogin ? 'Welcome back!' : 'Start your journey'}
          </h2>
          <p className="text-gray-500 mb-6">
            {isLogin ? 'Sign in to continue your fitness journey' : 'Create your free account today'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-100">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTrainer}
                    onChange={(e) => setIsTrainer(e.target.checked)}
                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <span className="ml-3 font-medium text-gray-700">I&apos;m a fitness trainer</span>
                </label>
                <p className="mt-1 text-sm text-gray-500 ml-7">
                  Manage clients and create custom workout plans
                </p>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50"
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              {isLogin ? "Don't have an account? Sign up free" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {showAuth && <AuthModal />}

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">SnapFit</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 font-medium">How It Works</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 font-medium">Success Stories</a>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleGuestMode}
                className="hidden sm:block text-gray-600 hover:text-gray-900 font-medium"
              >
                Try Demo
              </button>
              <button
                onClick={() => { setShowAuth(true); setIsLogin(true); }}
                className="text-gray-700 hover:text-gray-900 font-medium px-4 py-2"
              >
                Sign In
              </button>
              <button
                onClick={() => { setShowAuth(true); setIsLogin(false); }}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold px-5 py-2 rounded-full hover:shadow-lg hover:shadow-orange-500/25 transition-all"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen pt-16 overflow-hidden">
        {/* Background image carousel */}
        <div className="absolute inset-0">
          {HERO_IMAGES.map((img, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                i === currentHeroImage ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={img}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm mb-6">
              <Camera className="w-4 h-4 text-orange-400" />
              <span>Snap. Train. Transform.</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
              📸 Snap Your Space.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400">
                🍽️ Snap Your Food.
              </span>
              <br />
              <span className="text-white/90 text-4xl sm:text-5xl">
                💪 Get AI-Powered Results.
              </span>
            </h1>

            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              <strong className="text-white">Take a photo of any room</strong> and our AI finds every piece of equipment you can use.
              <strong className="text-white"> Snap your meals</strong> for instant nutrition tracking.
              No gym? No problem. No guesswork. Just results.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={() => { setShowAuth(true); setIsLogin(false); }}
                className="group flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg px-8 py-4 rounded-full hover:shadow-2xl hover:shadow-orange-500/30 transition-all"
              >
                Start Free Today
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={handleGuestMode}
                className="group flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white font-bold text-lg px-8 py-4 rounded-full hover:bg-white/20 transition-all border border-white/20"
              >
                <Play className="w-5 h-5" />
                Try Demo Mode
              </button>
            </div>

            {/* Demo Links */}
            <div className="flex flex-wrap gap-3 mb-8">
              <button
                onClick={() => router.push('/demo/user')}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-all text-sm"
              >
                <User className="w-4 h-4" />
                See User Experience
              </button>
              <button
                onClick={() => router.push('/demo/trainer')}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-all text-sm"
              >
                <Users className="w-4 h-4" />
                See Trainer Experience
              </button>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-6">
              <div className="flex -space-x-3">
                {TESTIMONIALS.map((t, i) => (
                  <img
                    key={i}
                    src={t.avatar}
                    alt=""
                    className="w-10 h-10 rounded-full border-2 border-white object-cover"
                  />
                ))}
              </div>
              <div className="text-white/80">
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm">Join 50,000+ fitness enthusiasts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* Why "Snap" Fit - Core Concept */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full text-orange-600 text-sm font-medium mb-4">
              <Camera className="w-4 h-4" />
              <span>Why &quot;Snap&quot; Fit?</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Your Camera is Your Personal Trainer
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Just snap a photo—of your space, your food, your environment—and our AI does the rest.
              No manual logging, no guesswork, just results.
            </p>
          </div>

          {/* Main SNAP features - larger cards */}
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {SNAP_FEATURES.map((feature, i) => (
              <div
                key={i}
                className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2`} />
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Secondary features - smaller cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {MORE_FEATURES.map((feature, i) => (
              <div
                key={i}
                className="flex items-start gap-4 bg-white rounded-xl p-5 shadow-sm border border-gray-100"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                  <feature.icon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              How SnapFit Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in seconds with our simple 3-step process
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Snap Your Space', desc: 'Take a photo of your gym, living room, backyard, or any space you want to work out in.', image: FEATURE_IMAGES.ai },
              { step: '02', title: 'AI Analyzes Equipment', desc: 'Our AI instantly identifies all usable equipment—from dumbbells to chairs and beyond.', image: FEATURE_IMAGES.progress },
              { step: '03', title: 'Get Your Workout', desc: 'Receive a personalized routine with exercises, sets, reps, and form tips.', image: FEATURE_IMAGES.social },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="relative rounded-2xl overflow-hidden mb-6 aspect-[4/3]">
                  <img
                    src={item.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="text-6xl font-black text-white/30">{item.step}</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
                {i < 2 && (
                  <ChevronRight className="hidden lg:block absolute -right-6 top-1/3 w-8 h-8 text-orange-500" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Preview Section */}
      <section className="py-24 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                Track Your Meals with AI
              </h2>
              <p className="text-xl text-white/80 mb-8">
                Simply snap a photo of your meal and get instant nutritional breakdown.
                Calories, protein, carbs, fat—all tracked automatically.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  'Instant photo-to-nutrition analysis',
                  'Daily calorie and macro tracking',
                  'Meal history and patterns',
                  'Personalized suggestions',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white/90">{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={handleGuestMode}
                className="bg-white text-orange-600 font-bold px-8 py-4 rounded-full hover:shadow-xl transition-all"
              >
                Try Food Tracking
              </button>
            </div>
            <div className="relative">
              <img
                src={FEATURE_IMAGES.food}
                alt="Food tracking"
                className="rounded-3xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Apple className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Today&apos;s Intake</p>
                    <p className="text-sm text-gray-500">1,847 / 2,200 cal</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what our community is saying about SnapFit
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-gray-900">{t.name}</p>
                    <p className="text-sm text-orange-600">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '50K+', label: 'Active Users' },
              { value: '1M+', label: 'Workouts Generated' },
              { value: '500K+', label: 'Meals Tracked' },
              { value: '4.9', label: 'App Rating' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500 mb-2">
                  {stat.value}
                </p>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready to Transform Your Fitness?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join thousands who&apos;ve discovered a smarter way to work out.
            Start free today—no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => { setShowAuth(true); setIsLogin(false); }}
              className="group flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg px-10 py-4 rounded-full hover:shadow-2xl hover:shadow-orange-500/30 transition-all"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={handleGuestMode}
              className="flex items-center justify-center gap-2 bg-white/10 text-white font-bold text-lg px-10 py-4 rounded-full hover:bg-white/20 transition-all"
            >
              <Play className="w-5 h-5" />
              Try Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">SnapFit</span>
            </div>
            <p className="text-sm">
              © 2024 SnapFit. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
