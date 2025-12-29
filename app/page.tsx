'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Camera,
  Upload,
  Dumbbell,
  Timer,
  History,
  Settings,
  Trash2,
  X,
  Play,
  Pause,
  RotateCcw,
  Save,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  UtensilsCrossed,
  Users,
  Trophy,
  LogOut,
  UserPlus,
  Check,
  XCircle,
  Plus,
  ExternalLink,
  Flame,
  Target,
  TrendingUp,
  Award,
  Zap,
  Heart,
  Calendar,
  BarChart3,
  Star,
  Medal,
  Crown,
  Sparkles,
  ChevronRight,
  Clock,
  Activity,
  User,
  Scale,
  Ruler,
} from 'lucide-react';

// Stock fitness images from Unsplash
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80', // gym
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80', // woman workout
  'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=1200&q=80', // running
];

const EXERCISE_IMAGES: Record<string, string> = {
  'push-ups': 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400&q=80',
  'squats': 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80',
  'plank': 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400&q=80',
  'lunges': 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400&q=80',
  'deadlift': 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&q=80',
  'running': 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&q=80',
  'yoga': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80',
  'stretching': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80',
  'default': 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&q=80',
};

const MOTIVATIONAL_QUOTES = [
  { quote: "The only bad workout is the one that didn't happen.", author: "Unknown" },
  { quote: "Your body can stand almost anything. It's your mind you have to convince.", author: "Unknown" },
  { quote: "Success is what comes after you stop making excuses.", author: "Luis Galarza" },
  { quote: "The pain you feel today will be the strength you feel tomorrow.", author: "Arnold Schwarzenegger" },
  { quote: "Don't limit your challenges. Challenge your limits.", author: "Unknown" },
];

const ACHIEVEMENTS = [
  { id: 'first_workout', name: 'First Steps', icon: Star, description: 'Complete your first workout', requirement: 1 },
  { id: 'streak_3', name: 'On Fire', icon: Flame, description: '3-day workout streak', requirement: 3 },
  { id: 'streak_7', name: 'Week Warrior', icon: Medal, description: '7-day workout streak', requirement: 7 },
  { id: 'streak_30', name: 'Monthly Master', icon: Crown, description: '30-day workout streak', requirement: 30 },
  { id: 'workouts_10', name: 'Getting Strong', icon: Dumbbell, description: 'Complete 10 workouts', requirement: 10 },
  { id: 'workouts_50', name: 'Fitness Fanatic', icon: Trophy, description: 'Complete 50 workouts', requirement: 50 },
  { id: 'calories_1000', name: 'Calorie Crusher', icon: Zap, description: 'Burn 1000 calories', requirement: 1000 },
  { id: 'social_5', name: 'Social Butterfly', icon: Users, description: 'Add 5 friends', requirement: 5 },
];

const QUICK_WORKOUTS = [
  { id: 'hiit', name: 'HIIT Blast', duration: 20, level: 'intermediate', image: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=400&q=80', calories: 250 },
  { id: 'strength', name: 'Full Body Strength', duration: 45, level: 'intermediate', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&q=80', calories: 350 },
  { id: 'yoga', name: 'Morning Yoga Flow', duration: 30, level: 'beginner', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80', calories: 150 },
  { id: 'cardio', name: 'Cardio Burn', duration: 25, level: 'advanced', image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&q=80', calories: 300 },
  { id: 'core', name: 'Core Crusher', duration: 15, level: 'intermediate', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80', calories: 120 },
  { id: 'stretch', name: 'Recovery Stretch', duration: 20, level: 'beginner', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80', calories: 80 },
];

interface Exercise {
  name: string;
  duration?: string;
  description?: string;
  sets?: number;
  reps?: string;
  equipment?: string;
  tips?: string;
  videoUrl?: string;
}

interface WorkoutPlan {
  equipment: string[];
  workout: {
    warmup: Exercise[];
    main: Exercise[];
    cooldown: Exercise[];
  };
  notes?: string;
}

interface SavedWorkout {
  id: string;
  createdAt: string;
  duration: number;
  fitnessLevel: string;
  title?: string;
  exercises?: Exercise[];
}

interface FoodLog {
  id: string;
  loggedAt: string;
  mealType: string;
  foodName?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  photoUrl?: string;
}

interface Friend {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isTrainer?: boolean;
}

interface Challenge {
  id: string;
  name: string;
  description?: string;
  type: string;
  goal?: number;
  startDate: string;
  endDate: string;
  participantCount: number;
  isJoined: boolean;
  userProgress: number;
}

type Tab = 'home' | 'workout' | 'timer' | 'history' | 'food' | 'friends' | 'challenges' | 'settings';

function SnapFitContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isGuestMode = searchParams.get('guest') === 'true';

  // State
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [photos, setPhotos] = useState<{ id: string; url: string; file: File }[]>([]);
  const [fitnessLevel, setFitnessLevel] = useState('intermediate');
  const [duration, setDuration] = useState(30);
  const [workoutTypes, setWorkoutTypes] = useState({
    strength: true,
    cardio: true,
    bodyweight: true,
    flexibility: true,
  });
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedWorkouts, setSavedWorkouts] = useState<SavedWorkout[]>([]);

  // Stats state
  const [streak, setStreak] = useState(0);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [weeklyGoal, setWeeklyGoal] = useState(5);
  const [weeklyProgress, setWeeklyProgress] = useState(0);
  const [todayQuote, setTodayQuote] = useState(MOTIVATIONAL_QUOTES[0]);

  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState(60);

  // Food state
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [foodPhoto, setFoodPhoto] = useState<File | null>(null);
  const [foodPhotoPreview, setFoodPhotoPreview] = useState<string | null>(null);
  const [mealType, setMealType] = useState('lunch');
  const [analyzingFood, setAnalyzingFood] = useState(false);
  const [foodAnalysis, setFoodAnalysis] = useState<any>(null);
  const [dailyCalories, setDailyCalories] = useState(0);
  const [dailyProtein, setDailyProtein] = useState(0);

  // Friends state
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [friendEmail, setFriendEmail] = useState('');
  const [friendsLoading, setFriendsLoading] = useState(false);

  // Challenges state
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [challengesLoading, setChallengesLoading] = useState(false);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    name: '',
    description: '',
    type: 'workout_count',
    goal: 10,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  // Expandable sections
  const [expandedSections, setExpandedSections] = useState({
    warmup: true,
    main: true,
    cooldown: true,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const foodInputRef = useRef<HTMLInputElement>(null);

  // Auth redirect - skip if guest mode
  useEffect(() => {
    if (status === 'unauthenticated' && !isGuestMode) {
      router.push('/login');
    }
  }, [status, router, isGuestMode]);

  // Load preferences and set random quote
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('snapfit_dark_mode');
    if (savedDarkMode) setDarkMode(savedDarkMode === 'true');

    // Random motivational quote
    const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    setTodayQuote(randomQuote);

    // Load streak from localStorage (would be from DB in production)
    const savedStreak = localStorage.getItem('snapfit_streak');
    if (savedStreak) setStreak(parseInt(savedStreak));
  }, []);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('snapfit_dark_mode', String(darkMode));
  }, [darkMode]);

  // Load workouts from database
  useEffect(() => {
    if (session) {
      fetchWorkouts();
    }
  }, [session]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && timerRemaining > 0) {
      interval = setInterval(() => {
        setTimerRemaining((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            if ('vibrate' in navigator) {
              navigator.vibrate([200, 100, 200]);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerRemaining]);

  const fetchWorkouts = async () => {
    try {
      const res = await fetch('/api/workouts');
      if (res.ok) {
        const data = await res.json();
        const workouts = data.workouts || [];
        setSavedWorkouts(workouts);
        setTotalWorkouts(workouts.length);
        setTotalMinutes(workouts.reduce((acc: number, w: SavedWorkout) => acc + (w.duration || 0), 0));

        // Calculate weekly progress
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const thisWeekWorkouts = workouts.filter((w: SavedWorkout) => new Date(w.createdAt) > oneWeekAgo);
        setWeeklyProgress(thisWeekWorkouts.length);
      }
    } catch (err) {
      console.error('Failed to fetch workouts:', err);
    }
  };

  const fetchFoodLogs = async () => {
    try {
      const res = await fetch('/api/food');
      if (res.ok) {
        const data = await res.json();
        const logs = data.foodLogs || [];
        setFoodLogs(logs);

        // Calculate daily totals
        const today = new Date().toDateString();
        const todayLogs = logs.filter((l: FoodLog) => new Date(l.loggedAt).toDateString() === today);
        setDailyCalories(todayLogs.reduce((acc: number, l: FoodLog) => acc + (l.calories || 0), 0));
        setDailyProtein(todayLogs.reduce((acc: number, l: FoodLog) => acc + (l.protein || 0), 0));
      }
    } catch (err) {
      console.error('Failed to fetch food logs:', err);
    }
  };

  const fetchFriends = async () => {
    setFriendsLoading(true);
    try {
      const res = await fetch('/api/friends');
      if (res.ok) {
        const data = await res.json();
        setFriends(data.friends || []);
        setPendingRequests(data.pendingRequests || []);
      }
    } catch (err) {
      console.error('Failed to fetch friends:', err);
    } finally {
      setFriendsLoading(false);
    }
  };

  const fetchChallenges = async () => {
    setChallengesLoading(true);
    try {
      const res = await fetch('/api/challenges?type=public');
      if (res.ok) {
        const data = await res.json();
        setChallenges(data.challenges || []);
      }
    } catch (err) {
      console.error('Failed to fetch challenges:', err);
    } finally {
      setChallengesLoading(false);
    }
  };

  // Load data when tabs change
  useEffect(() => {
    if (session) {
      if (activeTab === 'home') {
        fetchWorkouts();
        fetchFoodLogs();
      }
      if (activeTab === 'food') fetchFoodLogs();
      if (activeTab === 'friends') fetchFriends();
      if (activeTab === 'challenges') fetchChallenges();
    }
  }, [activeTab, session]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      setPhotos((prev) => [...prev, { id: crypto.randomUUID(), url, file }]);
    });
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === id);
      if (photo) URL.revokeObjectURL(photo.url);
      return prev.filter((p) => p.id !== id);
    });
  };

  const clearAll = () => {
    photos.forEach((p) => URL.revokeObjectURL(p.url));
    setPhotos([]);
    setWorkoutPlan(null);
    setError(null);
  };

  const generateWorkout = async () => {
    if (photos.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const imagePromises = photos.map(async (photo) => {
        const arrayBuffer = await photo.file.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(arrayBuffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ''
          )
        );
        return {
          type: 'image' as const,
          source: {
            type: 'base64' as const,
            media_type: photo.file.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
            data: base64,
          },
        };
      });

      const images = await Promise.all(imagePromises);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images,
          fitnessLevel,
          duration,
          workoutTypes: Object.entries(workoutTypes)
            .filter(([, v]) => v)
            .map(([k]) => k)
            .join(', '),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate workout');
      }

      setWorkoutPlan(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const saveWorkout = async () => {
    if (!workoutPlan) return;

    try {
      const exerciseList = [
        ...workoutPlan.workout.warmup.map((ex, i) => ({ ...ex, category: 'warmup', orderIndex: i })),
        ...workoutPlan.workout.main.map((ex, i) => ({ ...ex, category: 'main', orderIndex: i })),
        ...workoutPlan.workout.cooldown.map((ex, i) => ({ ...ex, category: 'cooldown', orderIndex: i })),
      ];

      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${duration}-min ${fitnessLevel} workout`,
          duration,
          fitnessLevel,
          equipment: workoutPlan.equipment,
          notes: workoutPlan.notes,
          exerciseList,
        }),
      });

      if (res.ok) {
        // Update streak
        const newStreak = streak + 1;
        setStreak(newStreak);
        localStorage.setItem('snapfit_streak', String(newStreak));

        fetchWorkouts();
      }
    } catch (err) {
      console.error('Failed to save workout:', err);
    }
  };

  const deleteWorkout = async (id: string) => {
    try {
      const res = await fetch(`/api/workouts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSavedWorkouts((prev) => prev.filter((w) => w.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete workout:', err);
    }
  };

  const handleFoodPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFoodPhoto(file);
      setFoodPhotoPreview(URL.createObjectURL(file));
      setFoodAnalysis(null);
    }
  };

  const analyzeFood = async () => {
    if (!foodPhoto) return;

    setAnalyzingFood(true);
    try {
      const arrayBuffer = await foodPhoto.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );

      const res = await fetch('/api/food/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
      });

      if (res.ok) {
        const data = await res.json();
        setFoodAnalysis(data.analysis);
      }
    } catch (err) {
      console.error('Failed to analyze food:', err);
    } finally {
      setAnalyzingFood(false);
    }
  };

  const saveFoodLog = async () => {
    if (!foodAnalysis) return;

    try {
      const res = await fetch('/api/food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mealType,
          foodName: foodAnalysis.foodName,
          calories: foodAnalysis.calories,
          protein: foodAnalysis.protein,
          carbs: foodAnalysis.carbs,
          fat: foodAnalysis.fat,
          fiber: foodAnalysis.fiber,
          analysis: foodAnalysis,
        }),
      });

      if (res.ok) {
        setFoodPhoto(null);
        setFoodPhotoPreview(null);
        setFoodAnalysis(null);
        fetchFoodLogs();
      }
    } catch (err) {
      console.error('Failed to save food log:', err);
    }
  };

  const sendFriendRequest = async () => {
    if (!friendEmail) return;

    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: friendEmail }),
      });

      if (res.ok) {
        setFriendEmail('');
        fetchFriends();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (err) {
      console.error('Failed to send friend request:', err);
    }
  };

  const respondToFriendRequest = async (friendId: string, action: 'accept' | 'reject') => {
    try {
      await fetch(`/api/friends/${friendId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      fetchFriends();
    } catch (err) {
      console.error('Failed to respond to friend request:', err);
    }
  };

  const createChallenge = async () => {
    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newChallenge),
      });

      if (res.ok) {
        setShowCreateChallenge(false);
        setNewChallenge({
          name: '',
          description: '',
          type: 'workout_count',
          goal: 10,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });
        fetchChallenges();
      }
    } catch (err) {
      console.error('Failed to create challenge:', err);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    try {
      const res = await fetch(`/api/challenges/${challengeId}`, { method: 'POST' });
      if (res.ok) {
        fetchChallenges();
      }
    } catch (err) {
      console.error('Failed to join challenge:', err);
    }
  };

  const toggleSection = (section: 'warmup' | 'main' | 'cooldown') => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getExerciseImage = (exerciseName: string) => {
    const name = exerciseName.toLowerCase();
    for (const [key, url] of Object.entries(EXERCISE_IMAGES)) {
      if (name.includes(key)) return url;
    }
    return EXERCISE_IMAGES.default;
  };

  const TabButton = ({ tab, icon: Icon, label }: { tab: Tab; icon: typeof Dumbbell; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl font-medium transition-all text-xs ${
        activeTab === tab
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
          : darkMode
          ? 'text-gray-400 hover:text-white hover:bg-gray-700'
          : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  if (status === 'loading') {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50'}`}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" />
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading your fitness journey...</p>
        </div>
      </div>
    );
  }

  // Allow guest mode or authenticated users
  if (!session && !isGuestMode) {
    return null;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50'}`}>
      {/* Guest Mode Banner */}
      {isGuestMode && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-sm sm:text-base font-medium text-center sm:text-left">
              🎉 You&apos;re exploring SnapFit! Sign up to save your workouts and track progress.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="bg-white text-orange-600 font-semibold px-4 py-1.5 rounded-full text-sm hover:bg-orange-50 transition-colors whitespace-nowrap"
            >
              Create Free Account
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-lg ${darkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'} border-b`}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Dumbbell className="text-indigo-500" size={28} />
              <Sparkles className="absolute -top-1 -right-1 text-yellow-400" size={12} />
            </div>
            <h1 className={`text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`}>
              SnapFit
            </h1>
            {isGuestMode && (
              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">Demo</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Streak Badge */}
            {streak > 0 && (
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${darkMode ? 'bg-orange-900/50 text-orange-400' : 'bg-orange-100 text-orange-600'}`}>
                <Flame size={16} />
                <span className="font-bold text-sm">{streak}</span>
              </div>
            )}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-gray-700 text-yellow-400' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {session ? (
              <button
                onClick={() => signOut()}
                className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                <LogOut size={20} />
              </button>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold px-4 py-1.5 rounded-full text-sm hover:shadow-lg transition-all"
              >
                Sign Up
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-24">
        {/* Home Tab - Dashboard */}
        {activeTab === 'home' && (
          <div className="py-6 space-y-6">
            {/* Welcome Section with Quote */}
            <div className={`relative overflow-hidden rounded-2xl ${darkMode ? 'bg-gradient-to-r from-indigo-900 to-purple-900' : 'bg-gradient-to-r from-indigo-500 to-purple-600'} p-6 text-white`}>
              <div className="absolute inset-0 opacity-10">
                <img src={HERO_IMAGES[0]} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="relative z-10">
                <p className="text-indigo-200 text-sm">{isGuestMode ? 'Welcome to SnapFit!' : 'Welcome back,'}</p>
                <h2 className="text-2xl font-bold mb-4">{isGuestMode ? 'Try out our features 🎯' : `${session?.user?.name || 'Athlete'} 💪`}</h2>
                <blockquote className="italic text-indigo-100 border-l-2 border-indigo-300 pl-4">
                  "{todayQuote.quote}"
                  <footer className="text-indigo-200 text-sm mt-1">— {todayQuote.author}</footer>
                </blockquote>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${darkMode ? 'bg-orange-900/50' : 'bg-orange-100'}`}>
                  <Flame className="text-orange-500" size={20} />
                </div>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{streak}</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Day Streak</p>
              </div>
              <div className={`p-4 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${darkMode ? 'bg-indigo-900/50' : 'bg-indigo-100'}`}>
                  <Dumbbell className="text-indigo-500" size={20} />
                </div>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{totalWorkouts}</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Workouts</p>
              </div>
              <div className={`p-4 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${darkMode ? 'bg-green-900/50' : 'bg-green-100'}`}>
                  <Clock className="text-green-500" size={20} />
                </div>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{totalMinutes}</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Minutes</p>
              </div>
              <div className={`p-4 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${darkMode ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
                  <Zap className="text-purple-500" size={20} />
                </div>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{dailyCalories}</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Calories Today</p>
              </div>
            </div>

            {/* Weekly Goal Progress */}
            <div className={`p-5 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Target className={`${darkMode ? 'text-indigo-400' : 'text-indigo-500'}`} size={24} />
                  <div>
                    <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Weekly Goal</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{weeklyProgress} of {weeklyGoal} workouts</p>
                  </div>
                </div>
                <span className={`text-2xl font-bold ${weeklyProgress >= weeklyGoal ? 'text-green-500' : darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {Math.round((weeklyProgress / weeklyGoal) * 100)}%
                </span>
              </div>
              <div className={`h-3 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div
                  className={`h-full rounded-full transition-all duration-500 ${weeklyProgress >= weeklyGoal ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
                  style={{ width: `${Math.min((weeklyProgress / weeklyGoal) * 100, 100)}%` }}
                />
              </div>
              {weeklyProgress >= weeklyGoal && (
                <div className="mt-3 flex items-center gap-2 text-green-500">
                  <Award size={16} />
                  <span className="text-sm font-medium">Goal achieved! You're crushing it! 🎉</span>
                </div>
              )}
            </div>

            {/* Quick Start Workouts */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Quick Start</h3>
                <button
                  onClick={() => setActiveTab('workout')}
                  className="text-indigo-500 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Create Custom <ChevronRight size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {QUICK_WORKOUTS.slice(0, 6).map((workout) => (
                  <div
                    key={workout.id}
                    className={`group relative overflow-hidden rounded-2xl cursor-pointer transform hover:scale-105 transition-all duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
                    onClick={() => setActiveTab('workout')}
                  >
                    <div className="absolute inset-0">
                      <img src={workout.image} alt={workout.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                      <div className={`absolute inset-0 ${darkMode ? 'bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent' : 'bg-gradient-to-t from-black/70 via-black/30 to-transparent'}`} />
                    </div>
                    <div className="relative p-4 h-36 flex flex-col justify-end">
                      <h4 className="font-bold text-white">{workout.name}</h4>
                      <div className="flex items-center gap-3 text-white/80 text-sm mt-1">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {workout.duration}m
                        </span>
                        <span className="flex items-center gap-1">
                          <Flame size={12} />
                          {workout.calories} cal
                        </span>
                      </div>
                      <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                        workout.level === 'beginner' ? 'bg-green-500/80' :
                        workout.level === 'intermediate' ? 'bg-yellow-500/80' : 'bg-red-500/80'
                      } text-white`}>
                        {workout.level}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements Preview */}
            <div className={`p-5 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Achievements</h3>
                <Trophy className={`${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} size={20} />
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {ACHIEVEMENTS.slice(0, 5).map((achievement) => {
                  const Icon = achievement.icon;
                  const isUnlocked =
                    (achievement.id === 'first_workout' && totalWorkouts >= 1) ||
                    (achievement.id === 'streak_3' && streak >= 3) ||
                    (achievement.id === 'workouts_10' && totalWorkouts >= 10);

                  return (
                    <div
                      key={achievement.id}
                      className={`flex-shrink-0 w-20 text-center p-3 rounded-xl transition-all ${
                        isUnlocked
                          ? darkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'
                          : darkMode ? 'bg-gray-700/50 opacity-50' : 'bg-gray-100 opacity-50'
                      }`}
                    >
                      <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 ${
                        isUnlocked
                          ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                          : darkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-200 text-gray-400'
                      }`}>
                        <Icon size={18} />
                      </div>
                      <p className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{achievement.name}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Workout Tab */}
        {activeTab === 'workout' && (
          <div className="py-6 space-y-6">
            {/* Hero Section */}
            <div className={`relative overflow-hidden rounded-2xl h-48 ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-indigo-500 to-purple-600'}`}>
              <img
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80"
                alt="Gym"
                className="absolute inset-0 w-full h-full object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/80 to-purple-600/80" />
              <div className="relative z-10 h-full flex flex-col justify-center p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">AI-Powered Workouts</h2>
                <p className="text-indigo-100">Snap your space, get a personalized workout in seconds</p>
              </div>
            </div>

            <section>
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                <Camera className="text-indigo-500" />
                Capture Your Environment
              </h3>

              <div className="flex flex-wrap gap-3 mb-4">
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
                >
                  <Camera size={18} />
                  Take Photo
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all font-medium ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-50 shadow'}`}
                >
                  <Upload size={18} />
                  Upload
                </button>
                {photos.length > 0 && (
                  <button onClick={clearAll} className="flex items-center gap-2 px-5 py-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 font-medium">
                    <Trash2 size={18} />
                    Clear
                  </button>
                )}
              </div>

              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileUpload} />
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />

              {photos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative group rounded-xl overflow-hidden shadow-lg">
                      <img src={photo.url} alt="Workout environment" className="w-full h-28 object-cover" />
                      <button
                        onClick={() => removePhoto(photo.id)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`border-2 border-dashed rounded-2xl p-12 text-center ${darkMode ? 'border-gray-600 bg-gray-800/50' : 'border-gray-300 bg-gray-50'}`}>
                  <Camera className={`mx-auto mb-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={48} />
                  <p className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Take or upload photos of your workout space</p>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Our AI will detect equipment and create your perfect workout</p>
                </div>
              )}
            </section>

            {/* Preferences */}
            <section className={`p-5 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Customize Your Workout</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Fitness Level
                  </label>
                  <select
                    value={fitnessLevel}
                    onChange={(e) => setFitnessLevel(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-indigo-500 transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                  >
                    <option value="beginner">🌱 Beginner</option>
                    <option value="intermediate">💪 Intermediate</option>
                    <option value="advanced">🔥 Advanced</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Duration: <span className="text-indigo-500 font-bold">{duration} min</span>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="120"
                    step="5"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              </div>

              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Workout Types
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(workoutTypes).map(([type, checked]) => (
                  <label
                    key={type}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all font-medium ${
                      checked
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                        : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => setWorkoutTypes((prev) => ({ ...prev, [type]: e.target.checked }))}
                      className="sr-only"
                    />
                    {type === 'strength' && '🏋️'}
                    {type === 'cardio' && '🏃'}
                    {type === 'bodyweight' && '🤸'}
                    {type === 'flexibility' && '🧘'}
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </label>
                ))}
              </div>
            </section>

            <button
              onClick={generateWorkout}
              disabled={photos.length === 0 || isLoading}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 text-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Analyzing your space...
                </>
              ) : (
                <>
                  <Sparkles size={24} />
                  Generate AI Workout
                </>
              )}
            </button>

            {error && (
              <div className="p-4 bg-red-100 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
                <XCircle size={20} />
                {error}
              </div>
            )}

            {/* Workout Plan Display */}
            {workoutPlan && (
              <div className="space-y-4">
                <div className={`p-5 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        Your {duration}-Minute Workout
                      </h2>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Personalized based on your equipment
                      </p>
                    </div>
                    <button
                      onClick={saveWorkout}
                      className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all font-medium"
                    >
                      <Save size={18} />
                      Save
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {workoutPlan.equipment.map((item, i) => (
                      <span key={i} className={`px-3 py-1 rounded-full text-sm font-medium ${darkMode ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Warmup */}
                <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-orange-900/20' : 'bg-gradient-to-r from-orange-50 to-amber-50'}`}>
                  <button onClick={() => toggleSection('warmup')} className="w-full p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${darkMode ? 'bg-orange-900/50' : 'bg-orange-200'}`}>
                        <Activity className={`${darkMode ? 'text-orange-400' : 'text-orange-600'}`} size={18} />
                      </div>
                      <span className={`font-semibold ${darkMode ? 'text-orange-400' : 'text-orange-700'}`}>Warm-up</span>
                    </div>
                    {expandedSections.warmup ? <ChevronUp /> : <ChevronDown />}
                  </button>
                  {expandedSections.warmup && (
                    <div className="px-4 pb-4 space-y-3">
                      {workoutPlan.workout.warmup.map((ex, i) => (
                        <div key={i} className={`p-4 rounded-xl flex gap-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                          <img src={getExerciseImage(ex.name)} alt={ex.name} className="w-16 h-16 rounded-lg object-cover" />
                          <div className="flex-1">
                            <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{ex.name}</div>
                            <div className={`text-sm ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>{ex.duration}</div>
                            <div className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{ex.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Main Workout */}
                <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-indigo-900/20' : 'bg-gradient-to-r from-indigo-50 to-purple-50'}`}>
                  <button onClick={() => toggleSection('main')} className="w-full p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${darkMode ? 'bg-indigo-900/50' : 'bg-indigo-200'}`}>
                        <Dumbbell className={`${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} size={18} />
                      </div>
                      <span className={`font-semibold ${darkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>Main Workout</span>
                    </div>
                    {expandedSections.main ? <ChevronUp /> : <ChevronDown />}
                  </button>
                  {expandedSections.main && (
                    <div className="px-4 pb-4 space-y-3">
                      {workoutPlan.workout.main.map((ex, i) => (
                        <div key={i} className={`p-4 rounded-xl flex gap-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                          <img src={getExerciseImage(ex.name)} alt={ex.name} className="w-16 h-16 rounded-lg object-cover" />
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{ex.name}</div>
                              <div className={`text-sm font-bold px-2 py-1 rounded-lg ${darkMode ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-600'}`}>
                                {ex.sets} x {ex.reps}
                              </div>
                            </div>
                            <div className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Equipment: {ex.equipment}</div>
                            <div className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{ex.tips}</div>
                            {ex.videoUrl && (
                              <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-indigo-500 mt-2 hover:underline">
                                <ExternalLink size={14} /> Watch Demo
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cooldown */}
                <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-green-900/20' : 'bg-gradient-to-r from-green-50 to-teal-50'}`}>
                  <button onClick={() => toggleSection('cooldown')} className="w-full p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${darkMode ? 'bg-green-900/50' : 'bg-green-200'}`}>
                        <Heart className={`${darkMode ? 'text-green-400' : 'text-green-600'}`} size={18} />
                      </div>
                      <span className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'}`}>Cool-down</span>
                    </div>
                    {expandedSections.cooldown ? <ChevronUp /> : <ChevronDown />}
                  </button>
                  {expandedSections.cooldown && (
                    <div className="px-4 pb-4 space-y-3">
                      {workoutPlan.workout.cooldown.map((ex, i) => (
                        <div key={i} className={`p-4 rounded-xl flex gap-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                          <img src={getExerciseImage(ex.name)} alt={ex.name} className="w-16 h-16 rounded-lg object-cover" />
                          <div className="flex-1">
                            <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{ex.name}</div>
                            <div className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{ex.duration}</div>
                            <div className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{ex.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Timer Tab */}
        {activeTab === 'timer' && (
          <div className="py-6 max-w-md mx-auto">
            <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg text-center`}>
              <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Rest Timer</h2>

              <div className="flex justify-center gap-2 mb-6">
                {[30, 60, 90, 120].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => { setTimerSeconds(sec); setTimerRemaining(sec); setTimerRunning(false); }}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      timerSeconds === sec
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                        : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>

              <div className={`text-7xl font-mono font-bold py-10 rounded-2xl mb-6 ${
                timerRunning
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                  : darkMode ? 'bg-gray-700 text-indigo-400' : 'bg-gray-100 text-indigo-600'
              }`}>
                {formatTime(timerRemaining)}
              </div>

              <div className={`h-3 rounded-full overflow-hidden mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
                  style={{ width: `${((timerSeconds - timerRemaining) / timerSeconds) * 100}%` }}
                />
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => { if (timerRemaining === 0) setTimerRemaining(timerSeconds); setTimerRunning(!timerRunning); }}
                  className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl text-lg font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  {timerRunning ? <><Pause size={24} /> Pause</> : <><Play size={24} /> Start</>}
                </button>
                <button
                  onClick={() => { setTimerRunning(false); setTimerRemaining(timerSeconds); }}
                  className={`flex items-center gap-2 px-6 py-4 rounded-2xl ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100'}`}
                >
                  <RotateCcw size={24} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="py-6 space-y-4">
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Workout History</h2>

            {savedWorkouts.length === 0 ? (
              <div className={`text-center py-16 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <History className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} size={64} />
                <p className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No saved workouts yet</p>
                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Complete a workout to see it here!</p>
                <button
                  onClick={() => setActiveTab('workout')}
                  className="mt-4 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium"
                >
                  Start a Workout
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {savedWorkouts.map((workout) => (
                  <div key={workout.id} className={`p-4 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${darkMode ? 'bg-indigo-900/50' : 'bg-indigo-100'}`}>
                          <Dumbbell className="text-indigo-500" size={24} />
                        </div>
                        <div>
                          <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {workout.title || `${workout.duration}-min workout`}
                          </div>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {new Date(workout.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                              {workout.duration} min
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-600'}`}>
                              {workout.fitnessLevel}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => deleteWorkout(workout.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Food Tab */}
        {activeTab === 'food' && (
          <div className="py-6 space-y-6">
            {/* Daily Summary */}
            <div className={`p-5 rounded-2xl ${darkMode ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30' : 'bg-gradient-to-r from-green-100 to-emerald-100'}`}>
              <h3 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Today's Nutrition</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <p className={`text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{dailyCalories}</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Calories</p>
                </div>
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <p className={`text-3xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{dailyProtein}g</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Protein</p>
                </div>
              </div>
            </div>

            {/* Photo Upload */}
            <div className={`p-5 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Log a Meal</h3>

              <div className="flex gap-3 mb-4">
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className={`px-4 py-3 rounded-xl ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
                >
                  <option value="breakfast">🌅 Breakfast</option>
                  <option value="lunch">☀️ Lunch</option>
                  <option value="dinner">🌙 Dinner</option>
                  <option value="snack">🍎 Snack</option>
                </select>
                <button
                  onClick={() => foodInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium"
                >
                  <Camera size={18} />
                  Snap Food Photo
                </button>
              </div>
              <input ref={foodInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFoodPhotoChange} />

              {foodPhotoPreview && (
                <div className="space-y-4">
                  <img src={foodPhotoPreview} alt="Food" className="w-full max-w-md rounded-xl mx-auto" />

                  {!foodAnalysis ? (
                    <button
                      onClick={analyzeFood}
                      disabled={analyzingFood}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium disabled:opacity-50"
                    >
                      {analyzingFood ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                      {analyzingFood ? 'Analyzing with AI...' : 'Analyze with AI'}
                    </button>
                  ) : (
                    <div className={`p-5 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <h4 className={`font-bold text-lg mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{foodAnalysis.foodName}</h4>
                      <div className="grid grid-cols-4 gap-3 mb-4">
                        <div className={`p-3 rounded-xl text-center ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                          <div className="text-xl font-bold text-indigo-500">{foodAnalysis.calories}</div>
                          <div className="text-xs text-gray-500">Calories</div>
                        </div>
                        <div className={`p-3 rounded-xl text-center ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                          <div className="text-xl font-bold text-green-500">{foodAnalysis.protein}g</div>
                          <div className="text-xs text-gray-500">Protein</div>
                        </div>
                        <div className={`p-3 rounded-xl text-center ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                          <div className="text-xl font-bold text-yellow-500">{foodAnalysis.carbs}g</div>
                          <div className="text-xs text-gray-500">Carbs</div>
                        </div>
                        <div className={`p-3 rounded-xl text-center ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                          <div className="text-xl font-bold text-red-500">{foodAnalysis.fat}g</div>
                          <div className="text-xs text-gray-500">Fat</div>
                        </div>
                      </div>
                      <button
                        onClick={saveFoodLog}
                        className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium"
                      >
                        Save to Log
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Food History */}
            <div>
              <h3 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Recent Meals</h3>
              {foodLogs.length === 0 ? (
                <div className={`text-center py-12 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                  <UtensilsCrossed className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} size={48} />
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No meals logged yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {foodLogs.map((log) => (
                    <div key={log.id} className={`p-4 rounded-xl flex justify-between items-center ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-green-900/50' : 'bg-green-100'}`}>
                          {log.mealType === 'breakfast' && '🌅'}
                          {log.mealType === 'lunch' && '☀️'}
                          {log.mealType === 'dinner' && '🌙'}
                          {log.mealType === 'snack' && '🍎'}
                        </div>
                        <div>
                          <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{log.foodName || 'Meal'}</div>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{log.mealType}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-indigo-500">{log.calories} cal</div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          P:{log.protein}g C:{log.carbs}g F:{log.fat}g
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <div className="py-6 space-y-6">
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Friends</h2>

            {/* Add Friend */}
            <div className={`p-5 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Add a Friend</h3>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={friendEmail}
                  onChange={(e) => setFriendEmail(e.target.value)}
                  placeholder="Enter email address"
                  className={`flex-1 px-4 py-3 rounded-xl ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
                />
                <button onClick={sendFriendRequest} className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium">
                  <UserPlus size={20} />
                </button>
              </div>
            </div>

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <div>
                <h3 className={`font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Pending Requests</h3>
                <div className="space-y-2">
                  {pendingRequests.map((req) => (
                    <div key={req.id} className={`p-4 rounded-xl flex justify-between items-center ${darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          {req.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{req.name}</div>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{req.email}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => respondToFriendRequest(req.id, 'accept')} className="p-2 bg-green-500 text-white rounded-lg">
                          <Check size={18} />
                        </button>
                        <button onClick={() => respondToFriendRequest(req.id, 'reject')} className="p-2 bg-red-500 text-white rounded-lg">
                          <XCircle size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Friends List */}
            <div>
              <h3 className={`font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Your Friends</h3>
              {friendsLoading ? (
                <div className="text-center py-8"><Loader2 className="animate-spin mx-auto text-indigo-500" size={32} /></div>
              ) : friends.length === 0 ? (
                <div className={`text-center py-12 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                  <Users className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} size={48} />
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No friends yet. Add some!</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {friends.map((friend) => (
                    <div key={friend.id} className={`p-4 rounded-xl flex items-center gap-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${darkMode ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white' : 'bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600'}`}>
                        {friend.name?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{friend.name}</div>
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{friend.email}</div>
                      </div>
                      {friend.isTrainer && (
                        <span className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs rounded-full font-medium">Trainer</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Challenges Tab */}
        {activeTab === 'challenges' && (
          <div className="py-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Challenges</h2>
              <button
                onClick={() => setShowCreateChallenge(!showCreateChallenge)}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium flex items-center gap-2"
              >
                <Plus size={18} />
                Create
              </button>
            </div>

            {/* Create Challenge Form */}
            {showCreateChallenge && (
              <div className={`p-5 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg space-y-4`}>
                <input
                  type="text"
                  value={newChallenge.name}
                  onChange={(e) => setNewChallenge({ ...newChallenge, name: e.target.value })}
                  placeholder="Challenge name"
                  className={`w-full px-4 py-3 rounded-xl ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
                />
                <textarea
                  value={newChallenge.description}
                  onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                  placeholder="Description"
                  className={`w-full px-4 py-3 rounded-xl ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
                />
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={newChallenge.type}
                    onChange={(e) => setNewChallenge({ ...newChallenge, type: e.target.value })}
                    className={`px-4 py-3 rounded-xl ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
                  >
                    <option value="workout_count">Workout Count</option>
                    <option value="total_minutes">Total Minutes</option>
                    <option value="streak">Daily Streak</option>
                  </select>
                  <input
                    type="number"
                    value={newChallenge.goal}
                    onChange={(e) => setNewChallenge({ ...newChallenge, goal: Number(e.target.value) })}
                    placeholder="Goal"
                    className={`px-4 py-3 rounded-xl ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="date"
                    value={newChallenge.startDate}
                    onChange={(e) => setNewChallenge({ ...newChallenge, startDate: e.target.value })}
                    className={`px-4 py-3 rounded-xl ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
                  />
                  <input
                    type="date"
                    value={newChallenge.endDate}
                    onChange={(e) => setNewChallenge({ ...newChallenge, endDate: e.target.value })}
                    className={`px-4 py-3 rounded-xl ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
                  />
                </div>
                <button onClick={createChallenge} className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium">
                  Create Challenge
                </button>
              </div>
            )}

            {/* Challenges List */}
            {challengesLoading ? (
              <div className="text-center py-8"><Loader2 className="animate-spin mx-auto text-indigo-500" size={32} /></div>
            ) : challenges.length === 0 ? (
              <div className={`text-center py-12 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <Trophy className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} size={48} />
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No challenges yet. Create one!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {challenges.map((challenge) => (
                  <div key={challenge.id} className={`p-5 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>{challenge.name}</h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{challenge.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${darkMode ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}>
                        {challenge.type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Users size={16} />
                        {challenge.participantCount} participants
                      </div>
                      {challenge.isJoined ? (
                        <div className="flex items-center gap-3">
                          <div className={`h-2 w-32 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                            <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500" style={{ width: `${Math.min((challenge.userProgress / (challenge.goal || 1)) * 100, 100)}%` }} />
                          </div>
                          <span className="text-sm font-bold text-green-500">{challenge.userProgress}/{challenge.goal}</span>
                        </div>
                      ) : (
                        <button onClick={() => joinChallenge(challenge.id)} className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium text-sm">
                          Join Challenge
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="py-6 max-w-md mx-auto space-y-4">
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Settings</h2>

            <div className={`p-5 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {darkMode ? <Moon className="text-indigo-400" size={24} /> : <Sun className="text-yellow-500" size={24} />}
                  <div>
                    <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Dark Mode</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Toggle theme</p>
                  </div>
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${darkMode ? 'bg-indigo-600' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            <div className={`p-5 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <div className="flex items-center gap-3 mb-3">
                <Target className={`${darkMode ? 'text-indigo-400' : 'text-indigo-500'}`} size={24} />
                <div>
                  <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Weekly Goal</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Set your target workouts per week</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {[3, 4, 5, 6, 7].map((num) => (
                  <button
                    key={num}
                    onClick={() => setWeeklyGoal(num)}
                    className={`w-10 h-10 rounded-xl font-bold transition-all ${
                      weeklyGoal === num
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                        : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className={`p-5 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Account</h3>
              {isGuestMode ? (
                <div className="space-y-3">
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    You&apos;re in demo mode. Create an account to save your data.
                  </p>
                  <button
                    onClick={() => router.push('/login')}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                  >
                    Create Free Account
                  </button>
                </div>
              ) : session && (
                <>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${darkMode ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white' : 'bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600'}`}>
                      {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{session.user?.name || 'User'}</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{session.user?.email}</p>
                    </div>
                  </div>
                  {(session.user as any)?.isTrainer && (
                    <span className="inline-block mt-3 px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs rounded-full font-medium">
                      Trainer Account
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Quick Links to New Features */}
            <div className={`p-5 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className={`font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Quick Links</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/profile"
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}`}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>Profile</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Edit your info</p>
                  </div>
                </Link>

                <Link
                  href="/body"
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}`}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                    <Scale className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>Body</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Track weight</p>
                  </div>
                </Link>

                <Link
                  href="/calendar"
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}`}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>Calendar</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Plan workouts</p>
                  </div>
                </Link>

                <Link
                  href="/achievements"
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}`}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>Achievements</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>View badges</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Sign Out Button */}
            {session && !isGuestMode && (
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className={`w-full p-4 rounded-2xl ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} shadow-lg flex items-center justify-center gap-2 text-red-500 font-medium transition-all`}
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 ${darkMode ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-200'} border-t backdrop-blur-lg safe-area-pb`}>
        <div className="max-w-md mx-auto px-2 py-2 flex justify-around">
          <TabButton tab="home" icon={Activity} label="Home" />
          <TabButton tab="workout" icon={Dumbbell} label="Workout" />
          <TabButton tab="food" icon={UtensilsCrossed} label="Food" />
          <TabButton tab="challenges" icon={Trophy} label="Compete" />
          <TabButton tab="settings" icon={Settings} label="Settings" />
        </div>
      </nav>
    </div>
  );
}

// Loading component for Suspense fallback
function SnapFitLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Dumbbell className="w-8 h-8 text-white" />
        </div>
        <p className="text-gray-500">Loading SnapFit...</p>
      </div>
    </div>
  );
}

// Wrap in Suspense for useSearchParams
export default function SnapFit() {
  return (
    <Suspense fallback={<SnapFitLoading />}>
      <SnapFitContent />
    </Suspense>
  );
}
