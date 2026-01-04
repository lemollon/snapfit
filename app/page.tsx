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
  Watch,
  BookOpen,
  Droplets,
  Globe,
  Repeat,
  Utensils,
} from 'lucide-react';
import { useToast } from '@/components/Toast';

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

type Tab = 'home' | 'workout' | 'timer' | 'history' | 'food' | 'friends' | 'challenges' | 'settings' | 'calendar';

function SnapFitContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
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

  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalType, setSuccessModalType] = useState<'workout' | 'meal'>('workout');
  const [successModalData, setSuccessModalData] = useState<{ title: string; duration?: number; calories?: number }>({ title: '' });

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

  // Check onboarding status for authenticated users and redirect trainers
  useEffect(() => {
    if (status === 'authenticated' && session?.user && !isGuestMode) {
      // Redirect trainers to their dashboard
      if ((session.user as any)?.isTrainer) {
        router.push('/trainer');
        return;
      }

      fetch('/api/profile')
        .then(res => res.json())
        .then(data => {
          if (data.user && !data.user.onboardingCompleted) {
            router.push('/onboarding');
          }
        })
        .catch(err => console.error('Failed to check onboarding status:', err));
    }
  }, [status, session, router, isGuestMode]);

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
      toast.error('Failed to load workouts', 'Please try refreshing the page.');
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
      toast.error('Failed to load food logs', 'Please try refreshing the page.');
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
      toast.error('Failed to load friends', 'Please try refreshing the page.');
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
      toast.error('Failed to load challenges', 'Please try refreshing the page.');
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

        // Show success modal with Add to Calendar option
        setSuccessModalType('workout');
        setSuccessModalData({ title: `${duration}-min ${fitnessLevel} workout`, duration });
        setShowSuccessModal(true);
      }
    } catch (err) {
      console.error('Failed to save workout:', err);
      toast.error('Failed to save workout', 'Please try again.');
    }
  };

  const deleteWorkout = async (id: string) => {
    try {
      const res = await fetch(`/api/workouts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSavedWorkouts((prev) => prev.filter((w) => w.id !== id));
        toast.success('Workout deleted', 'The workout has been removed from your history.');
      } else {
        throw new Error('Failed to delete');
      }
    } catch (err) {
      console.error('Failed to delete workout:', err);
      toast.error('Failed to delete workout', 'Please try again.');
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
      toast.error('Failed to analyze food', 'Please try again with a clearer photo.');
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
        // Show success modal with Add to Calendar option
        setSuccessModalType('meal');
        setSuccessModalData({
          title: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)}: ${foodAnalysis.foodName}`,
          calories: foodAnalysis.calories
        });
        setShowSuccessModal(true);

        setFoodPhoto(null);
        setFoodPhotoPreview(null);
        setFoodAnalysis(null);
        fetchFoodLogs();
      }
    } catch (err) {
      console.error('Failed to save food log:', err);
      toast.error('Failed to save meal', 'Please try again.');
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
        toast.success('Request sent', 'Friend request has been sent!');
      } else {
        const data = await res.json();
        toast.error('Failed to send request', data.error || 'Please try again.');
      }
    } catch (err) {
      console.error('Failed to send friend request:', err);
      toast.error('Failed to send request', 'Please check your connection and try again.');
    }
  };

  const respondToFriendRequest = async (friendId: string, action: 'accept' | 'reject') => {
    try {
      const res = await fetch(`/api/friends/${friendId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error('Failed to respond');
      fetchFriends();
      toast.success(
        action === 'accept' ? 'Friend added!' : 'Request declined',
        action === 'accept' ? 'You are now friends!' : 'The request has been declined.'
      );
    } catch (err) {
      console.error('Failed to respond to friend request:', err);
      toast.error('Failed to respond', 'Please try again.');
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
        toast.success('Challenge created!', 'Your new challenge is ready. Invite friends to join!');
      } else {
        throw new Error('Failed to create challenge');
      }
    } catch (err) {
      console.error('Failed to create challenge:', err);
      toast.error('Failed to create challenge', 'Please try again.');
    }
  };

  const joinChallenge = async (challengeId: string) => {
    try {
      const res = await fetch(`/api/challenges/${challengeId}`, { method: 'POST' });
      if (res.ok) {
        fetchChallenges();
        toast.success('Joined challenge!', 'Good luck on your challenge!');
      } else {
        throw new Error('Failed to join challenge');
      }
    } catch (err) {
      console.error('Failed to join challenge:', err);
      toast.error('Failed to join challenge', 'Please try again.');
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

  const addToCalendar = (type: 'workout' | 'meal', data: { title: string; duration?: number; calories?: number }) => {
    const now = new Date();
    const endTime = new Date(now.getTime() + (data.duration || 30) * 60 * 1000);

    // Format dates for Google Calendar
    const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d{3}/g, '');

    const title = encodeURIComponent(data.title);
    const description = encodeURIComponent(
      type === 'workout'
        ? `Completed ${data.duration || 30}-minute workout via SnapFit 💪`
        : `Logged ${data.title} (${data.calories || 0} calories) via SnapFit 🍽️`
    );

    // Create Google Calendar URL
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatDate(now)}/${formatDate(endTime)}&details=${description}`;

    // Open in new tab
    window.open(googleCalendarUrl, '_blank');
    setShowSuccessModal(false);
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
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Premium animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 -left-1/4 w-[800px] h-[800px] bg-gradient-to-r from-orange-500/15 to-pink-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -right-1/4 w-[800px] h-[800px] bg-gradient-to-r from-violet-500/15 to-purple-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-pink-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        {/* Noise texture */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      </div>
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

      {/* Premium Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/50 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between relative">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative w-11 h-11 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Dumbbell className="text-white" size={24} />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black bg-gradient-to-r from-white via-orange-200 to-pink-200 bg-clip-text text-transparent">
                SnapFit
              </h1>
              {isGuestMode && (
                <span className="text-xs text-orange-400 font-medium">Demo Mode</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Premium Streak Badge */}
            {streak > 0 && (
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full blur opacity-50" />
                <div className="relative flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/30 rounded-full">
                  <Flame className="text-orange-400" size={18} />
                  <span className="font-bold text-orange-400">{streak}</span>
                </div>
              </div>
            )}
            {session ? (
              <button
                onClick={() => signOut()}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                <LogOut size={20} className="text-zinc-400" />
              </button>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-600 rounded-full blur opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold px-5 py-2 rounded-full text-sm">
                  Sign Up Free
                </div>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-24">
        {/* Home Tab - Dashboard */}
        {activeTab === 'home' && (
          <div className="py-6 space-y-6 relative">
            {/* Premium Welcome Section */}
            <div className="relative overflow-hidden rounded-3xl">
              {/* Background image with overlay */}
              <div className="absolute inset-0">
                <img src={HERO_IMAGES[0]} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/60" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              </div>
              {/* Animated gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-pink-500/10 to-violet-500/20 animate-pulse" />

              <div className="relative z-10 p-8">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-400 text-sm font-medium">{isGuestMode ? 'Welcome to SnapFit!' : 'Welcome back,'}</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black mb-4 bg-gradient-to-r from-white via-orange-100 to-pink-100 bg-clip-text text-transparent">
                  {isGuestMode ? 'Try out our features' : session?.user?.name || 'Athlete'}
                </h2>
                <blockquote className="max-w-lg">
                  <p className="text-zinc-300 italic border-l-2 border-orange-500 pl-4">
                    "{todayQuote.quote}"
                  </p>
                  <footer className="text-zinc-500 text-sm mt-2 pl-4">— {todayQuote.author}</footer>
                </blockquote>
              </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Streak Card */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
                <div className="relative p-5 bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-2xl">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-pink-500/20 flex items-center justify-center mb-3">
                    <Flame className="text-orange-500" size={24} />
                  </div>
                  <p className="text-3xl font-black bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">{streak}</p>
                  <p className="text-sm text-zinc-400">Day Streak</p>
                </div>
              </div>

              {/* Workouts Card */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
                <div className="relative p-5 bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-2xl">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-3">
                    <Dumbbell className="text-blue-500" size={24} />
                  </div>
                  <p className="text-3xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{totalWorkouts}</p>
                  <p className="text-sm text-zinc-400">Workouts</p>
                </div>
              </div>

              {/* Minutes Card */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
                <div className="relative p-5 bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-2xl">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center mb-3">
                    <Clock className="text-emerald-500" size={24} />
                  </div>
                  <p className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">{totalMinutes}</p>
                  <p className="text-sm text-zinc-400">Minutes</p>
                </div>
              </div>

              {/* Calories Card */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
                <div className="relative p-5 bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-2xl">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center mb-3">
                    <Zap className="text-violet-500" size={24} />
                  </div>
                  <p className="text-3xl font-black bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">{dailyCalories}</p>
                  <p className="text-sm text-zinc-400">Calories Today</p>
                </div>
              </div>
            </div>

            {/* Premium Weekly Goal Progress */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-pink-500 to-violet-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="relative p-6 bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                      <Target className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Weekly Goal</h3>
                      <p className="text-sm text-zinc-400">{weeklyProgress} of {weeklyGoal} workouts</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-3xl font-black ${weeklyProgress >= weeklyGoal ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'bg-gradient-to-r from-orange-400 to-pink-400'} bg-clip-text text-transparent`}>
                      {Math.round((weeklyProgress / weeklyGoal) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="h-4 rounded-full overflow-hidden bg-zinc-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${weeklyProgress >= weeklyGoal ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-orange-500 via-pink-500 to-violet-500'}`}
                    style={{ width: `${Math.min((weeklyProgress / weeklyGoal) * 100, 100)}%` }}
                  />
                </div>
                {weeklyProgress >= weeklyGoal && (
                  <div className="mt-4 flex items-center gap-2 text-green-400">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Award size={18} />
                    </div>
                    <span className="font-medium">Goal achieved! You're crushing it!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Premium Quick Start Workouts */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold text-white">Quick Start</h3>
                <button
                  onClick={() => setActiveTab('workout')}
                  className="flex items-center gap-1 text-orange-400 hover:text-orange-300 text-sm font-medium group"
                >
                  Create Custom <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {QUICK_WORKOUTS.slice(0, 6).map((workout) => (
                  <div
                    key={workout.id}
                    className="group relative overflow-hidden rounded-2xl cursor-pointer transform hover:scale-[1.02] transition-all duration-300"
                    onClick={() => setActiveTab('workout')}
                  >
                    {/* Glow effect on hover */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl blur opacity-0 group-hover:opacity-50 transition-opacity" />
                    <div className="relative overflow-hidden rounded-2xl">
                      <div className="absolute inset-0">
                        <img src={workout.image} alt={workout.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                      </div>
                      <div className="relative p-5 h-40 flex flex-col justify-end">
                        <h4 className="font-bold text-white text-lg">{workout.name}</h4>
                        <div className="flex items-center gap-3 text-white/80 text-sm mt-2">
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {workout.duration}m
                          </span>
                          <span className="flex items-center gap-1">
                            <Flame size={14} />
                            {workout.calories} cal
                          </span>
                        </div>
                        <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                          workout.level === 'beginner' ? 'bg-emerald-500/80 text-emerald-100' :
                          workout.level === 'intermediate' ? 'bg-amber-500/80 text-amber-100' : 'bg-rose-500/80 text-rose-100'
                        }`}>
                          {workout.level.charAt(0).toUpperCase() + workout.level.slice(1)}
                        </span>
                      </div>
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

        {/* Calendar Tab - Advanced Fitness Calendar */}
        {activeTab === 'calendar' && (
          <div className="pb-6 max-w-lg mx-auto">
            {/* Calendar Header */}
            <div className="relative mb-6 overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600"
                   style={{backgroundImage: 'url("https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=60")', backgroundSize: 'cover', backgroundPosition: 'center'}}>
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/85 via-blue-500/85 to-indigo-600/85" />
              </div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold text-white">Fitness Calendar</h1>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push('/calendar')}
                      className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                    >
                      <ChevronDown className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
                <p className="text-white/80 text-sm">Track your workouts, meals, and progress</p>
              </div>
            </div>

            {/* Month Navigation */}
            <div className={`flex items-center justify-between mb-4 px-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              <button
                onClick={() => router.push('/calendar')}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              >
                <ChevronDown className="w-5 h-5 rotate-90" />
              </button>
              <h2 className="text-lg font-bold">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
              <button
                onClick={() => router.push('/calendar')}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              >
                <ChevronDown className="w-5 h-5 -rotate-90" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className={`rounded-2xl ${darkMode ? 'bg-gray-800/50' : 'bg-white'} shadow-lg overflow-hidden mb-6`}>
              {/* Day Headers */}
              <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={i} className={`p-3 text-center text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7">
                {(() => {
                  const today = new Date();
                  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                  const startPadding = firstDay.getDay();
                  const days = [];

                  // Add empty cells for padding
                  for (let i = 0; i < startPadding; i++) {
                    days.push(<div key={`empty-${i}`} className="p-3" />);
                  }

                  // Add actual days
                  for (let day = 1; day <= lastDay.getDate(); day++) {
                    const isToday = day === today.getDate();
                    const hasWorkout = [2, 4, 6, 9, 11, 13, 16, 18, 20, 23, 25, 27, 30].includes(day);
                    const hasMeal = [1, 3, 5, 7, 8, 10, 12, 14, 15, 17, 19, 21, 22, 24, 26, 28, 29].includes(day);

                    days.push(
                      <button
                        key={day}
                        onClick={() => router.push('/calendar')}
                        className={`p-2 text-center relative ${isToday ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl mx-1 my-1' : ''} ${darkMode && !isToday ? 'text-gray-300 hover:bg-gray-700' : !isToday ? 'text-gray-700 hover:bg-gray-100' : ''} transition-colors`}
                      >
                        <span className="text-sm font-medium">{day}</span>
                        <div className="flex justify-center gap-0.5 mt-1">
                          {hasWorkout && <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />}
                          {hasMeal && <div className="w-1.5 h-1.5 rounded-full bg-green-400" />}
                        </div>
                      </button>
                    );
                  }

                  return days;
                })()}
              </div>
            </div>

            {/* Legend */}
            <div className={`flex justify-center gap-6 mb-6 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-400" />
                <span>Workout</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span>Meal Logged</span>
              </div>
            </div>

            {/* Today's Schedule */}
            <div className={`rounded-2xl ${darkMode ? 'bg-gray-800/50' : 'bg-white'} shadow-lg p-5 mb-6`}>
              <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Today&apos;s Schedule</h3>

              <div className="space-y-3">
                <div className={`flex items-center gap-4 p-3 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-orange-50'}`}>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                    <Dumbbell className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Morning Workout</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>7:00 AM - Upper Body Strength</p>
                  </div>
                  <Check className="w-5 h-5 text-green-500" />
                </div>

                <div className={`flex items-center gap-4 p-3 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-green-50'}`}>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                    <UtensilsCrossed className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Breakfast</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>8:30 AM - Protein Oats & Berries</p>
                  </div>
                  <Check className="w-5 h-5 text-green-500" />
                </div>

                <div className={`flex items-center gap-4 p-3 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                    <UtensilsCrossed className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Lunch</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>12:30 PM - Planned</p>
                  </div>
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>

                <div className={`flex items-center gap-4 p-3 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-purple-50'}`}>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                    <Dumbbell className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Evening Cardio</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>6:00 PM - 30 min HIIT</p>
                  </div>
                  <Clock className="w-5 h-5 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Weekly Stats Overview */}
            <div className={`rounded-2xl ${darkMode ? 'bg-gray-800/50' : 'bg-white'} shadow-lg p-5 mb-6`}>
              <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>This Week</h3>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mx-auto mb-2">
                    <Flame className="w-7 h-7 text-white" />
                  </div>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>5</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Workouts</p>
                </div>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-2">
                    <UtensilsCrossed className="w-7 h-7 text-white" />
                  </div>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>18</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Meals Logged</p>
                </div>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mx-auto mb-2">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>1,850</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Calories Burned</p>
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className={`rounded-2xl ${darkMode ? 'bg-gray-800/50' : 'bg-white'} shadow-lg p-5`}>
              <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Upcoming</h3>

              <div className="space-y-3">
                <div className={`flex items-center gap-4 p-3 rounded-xl border ${darkMode ? 'border-gray-700 bg-gray-700/30' : 'border-gray-200'}`}>
                  <div className="text-center">
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>TUE</p>
                    <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{new Date().getDate() + 1}</p>
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Leg Day Challenge</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>9:00 AM - Heavy Squats & Lunges</p>
                  </div>
                  <Trophy className="w-5 h-5 text-yellow-500" />
                </div>

                <div className={`flex items-center gap-4 p-3 rounded-xl border ${darkMode ? 'border-gray-700 bg-gray-700/30' : 'border-gray-200'}`}>
                  <div className="text-center">
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>FRI</p>
                    <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{new Date().getDate() + 4}</p>
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Weekly Weigh-In</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Track your progress</p>
                  </div>
                  <Scale className="w-5 h-5 text-blue-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile & More Tab - Premium Design */}
        {activeTab === 'settings' && (
          <div className="pb-6 max-w-lg mx-auto">
            {/* Hero Profile Section */}
            <div className="relative mb-6">
              {/* Background Image/Gradient */}
              <div className="h-32 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 rounded-b-3xl"
                   style={{backgroundImage: 'url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=60")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundBlendMode: 'overlay'}}>
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/80 via-pink-500/80 to-purple-600/80 rounded-b-3xl" />
              </div>

              {/* Profile Card Overlay */}
              <div className={`relative -mt-16 mx-4 p-5 rounded-2xl ${darkMode ? 'bg-gray-800/95 backdrop-blur-xl' : 'bg-white/95 backdrop-blur-xl'} shadow-2xl border ${darkMode ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center font-bold text-2xl bg-gradient-to-br from-orange-500 to-pink-600 text-white shadow-lg`}>
                      {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || 'G'}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h2 className={`text-xl font-bold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {session?.user?.name || 'Guest User'}
                    </h2>
                    <p className={`text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {session?.user?.email || 'Try the demo'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {(session?.user as any)?.isTrainer && (
                        <span className="px-2 py-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs rounded-full font-medium">
                          PRO Trainer
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                        Level 1
                      </span>
                    </div>
                  </div>

                  {/* Edit Profile Button */}
                  <Link href="/profile" className={`p-2 rounded-xl ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}>
                    <Settings className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  </Link>
                </div>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-4 gap-2 mt-5 pt-5 border-t border-dashed ${darkMode ? 'border-gray-700' : 'border-gray-200'}">
                  <div className="text-center">
                    <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{totalWorkouts}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Workouts</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{streak}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Day Streak</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>0</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>XP Points</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-lg font-bold text-orange-500`}>{weeklyProgress}/{weeklyGoal}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>This Week</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Cards - Premium Grid */}
            <div className="px-4 space-y-4">
              {/* Primary Features Row */}
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setActiveTab('calendar')} className="group relative overflow-hidden rounded-2xl aspect-[4/3] text-left">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600"
                       style={{backgroundImage: 'url("https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&auto=format&fit=crop&q=60")', backgroundSize: 'cover', backgroundPosition: 'center'}}>
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/90 to-red-600/90 group-hover:from-orange-500/80 group-hover:to-red-600/80 transition-all" />
                  </div>
                  <div className="relative h-full p-4 flex flex-col justify-between">
                    <Calendar className="w-8 h-8 text-white/90" />
                    <div>
                      <p className="text-white font-bold text-lg">Calendar</p>
                      <p className="text-white/70 text-xs">Plan & track</p>
                    </div>
                  </div>
                </button>

                <Link href="/body" className="group relative overflow-hidden rounded-2xl aspect-[4/3]">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600"
                       style={{backgroundImage: 'url("https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&auto=format&fit=crop&q=60")', backgroundSize: 'cover', backgroundPosition: 'center'}}>
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/90 to-teal-600/90 group-hover:from-emerald-500/80 group-hover:to-teal-600/80 transition-all" />
                  </div>
                  <div className="relative h-full p-4 flex flex-col justify-between">
                    <Scale className="w-8 h-8 text-white/90" />
                    <div>
                      <p className="text-white font-bold text-lg">Body</p>
                      <p className="text-white/70 text-xs">Track progress</p>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Secondary Features - Compact List */}
              <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <Link href="/achievements" className={`flex items-center gap-4 p-4 border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Achievements</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Unlock badges & rewards</p>
                  </div>
                  <ChevronRight className={`w-5 h-5 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                </Link>

                <Link href="/recovery" className={`flex items-center gap-4 p-4 border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Recovery</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Readiness & wellness</p>
                  </div>
                  <ChevronRight className={`w-5 h-5 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                </Link>

                <Link href="/form-check" className={`flex items-center gap-4 p-4 border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Form Check</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>AI-powered analysis</p>
                  </div>
                  <span className="px-2 py-0.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs rounded-full font-medium">AI</span>
                </Link>

                <Link href="/programs" className={`flex items-center gap-4 p-4 border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <Dumbbell className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Programs</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Expert training plans</p>
                  </div>
                  <ChevronRight className={`w-5 h-5 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                </Link>

                <Link href="/timer" className={`flex items-center gap-4 p-4 border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Timer className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Workout Timers</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>AMRAP, EMOM, Tabata & more</p>
                  </div>
                  <span className="px-2 py-0.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs rounded-full font-medium">New</span>
                </Link>

                <Link href="/records" className={`flex items-center gap-4 p-4 border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
                    <Medal className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Personal Records</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Track PRs & celebrate wins</p>
                  </div>
                  <ChevronRight className={`w-5 h-5 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                </Link>

                <Link href="/habits" className={`flex items-center gap-4 p-4 border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Repeat className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Daily Habits</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Water, sleep, steps & more</p>
                  </div>
                  <span className="px-2 py-0.5 bg-gradient-to-r from-sky-500 to-blue-500 text-white text-xs rounded-full font-medium">New</span>
                </Link>

                <Link href="/recipes" className={`flex items-center gap-4 p-4 border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-lime-400 to-green-500 flex items-center justify-center shadow-lg shadow-green-500/20">
                    <Utensils className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Recipe Library</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Healthy meals & macros</p>
                  </div>
                  <ChevronRight className={`w-5 h-5 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                </Link>

                <Link href="/wearables" className={`flex items-center gap-4 p-4 border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Watch className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Wearable Sync</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Apple, Garmin, Whoop & more</p>
                  </div>
                  <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs rounded-full font-medium">New</span>
                </Link>

                <Link href="/challenges/global" className={`flex items-center gap-4 p-4 ${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors`}>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Global Challenges</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Compete worldwide</p>
                  </div>
                  <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs rounded-full font-medium">New</span>
                </Link>
              </div>

              {/* Social & Compete Section */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveTab('friends')}
                  className="group relative overflow-hidden rounded-2xl aspect-[3/2]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600"
                       style={{backgroundImage: 'url("https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&auto=format&fit=crop&q=60")', backgroundSize: 'cover', backgroundPosition: 'center'}}>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/90 to-indigo-600/90 group-hover:from-blue-500/80 group-hover:to-indigo-600/80 transition-all" />
                  </div>
                  <div className="relative h-full p-4 flex flex-col justify-between">
                    <Users className="w-7 h-7 text-white/90" />
                    <div>
                      <p className="text-white font-bold">Friends</p>
                      <p className="text-white/70 text-xs">Connect & share</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('challenges')}
                  className="group relative overflow-hidden rounded-2xl aspect-[3/2]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-orange-600"
                       style={{backgroundImage: 'url("https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&auto=format&fit=crop&q=60")', backgroundSize: 'cover', backgroundPosition: 'center'}}>
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/90 to-orange-600/90 group-hover:from-yellow-500/80 group-hover:to-orange-600/80 transition-all" />
                  </div>
                  <div className="relative h-full p-4 flex flex-col justify-between">
                    <Trophy className="w-7 h-7 text-white/90" />
                    <div>
                      <p className="text-white font-bold">Challenges</p>
                      <p className="text-white/70 text-xs">Compete & win</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Trainer Dashboard - Premium Card */}
              {session && (session.user as any)?.isTrainer && (
                <div className="space-y-3">
                  <Link href="/trainer" className="block relative overflow-hidden rounded-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"
                         style={{backgroundImage: 'url("https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&auto=format&fit=crop&q=60")', backgroundSize: 'cover', backgroundPosition: 'center'}}>
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/95 via-purple-600/90 to-pink-600/95" />
                    </div>
                    <div className="relative p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                          <Users className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-bold text-lg">Trainer Dashboard</p>
                          <p className="text-white/70 text-sm">Manage clients, programs & revenue</p>
                        </div>
                        <ChevronRight className="w-6 h-6 text-white/70" />
                      </div>
                    </div>
                  </Link>

                  <Link href="/trainer/branding" className={`flex items-center gap-4 p-4 rounded-2xl ${darkMode ? 'bg-gray-800 hover:bg-gray-700/50' : 'bg-white hover:bg-gray-50'} shadow-lg transition-colors`}>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-400 to-pink-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>White-Label Branding</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Customize your brand colors & logo</p>
                    </div>
                    <span className="px-2 py-0.5 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white text-xs rounded-full font-medium">PRO</span>
                  </Link>
                </div>
              )}

              {/* Settings Section */}
              <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                  <p className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Preferences</p>
                </div>

                {/* Dark Mode Toggle */}
                <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                  <div className="flex items-center gap-3">
                    {darkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                    <div>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Dark Mode</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Easier on the eyes</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${darkMode ? 'bg-indigo-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-lg ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                {/* Weekly Goal */}
                <div className={`p-4`}>
                  <div className="flex items-center gap-3 mb-3">
                    <Target className={`w-5 h-5 ${darkMode ? 'text-orange-400' : 'text-orange-500'}`} />
                    <div>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Weekly Goal</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Workouts per week</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {[3, 4, 5, 6, 7].map((num) => (
                      <button
                        key={num}
                        onClick={() => setWeeklyGoal(num)}
                        className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${
                          weeklyGoal === num
                            ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/25'
                            : darkMode ? 'bg-gray-700 text-gray-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Guest Mode CTA or Sign Out */}
              {isGuestMode ? (
                <div className={`p-5 rounded-2xl ${darkMode ? 'bg-gradient-to-br from-orange-500/20 to-pink-500/20 border border-orange-500/30' : 'bg-gradient-to-br from-orange-50 to-pink-50 border border-orange-200'}`}>
                  <p className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Create Your Account</p>
                  <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Save your progress and unlock all features
                  </p>
                  <button
                    onClick={() => router.push('/login')}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all"
                  >
                    Get Started Free
                  </button>
                </div>
              ) : session && (
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className={`w-full p-4 rounded-2xl ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} shadow-lg flex items-center justify-center gap-2 text-red-500 font-medium transition-all`}
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 ${darkMode ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-200'} border-t backdrop-blur-lg safe-area-pb`}>
        <div className="max-w-lg mx-auto px-1 py-2 flex justify-around">
          <TabButton tab="home" icon={Activity} label="Home" />
          <TabButton tab="workout" icon={Dumbbell} label="Train" />
          <TabButton tab="calendar" icon={Calendar} label="Calendar" />
          <TabButton tab="food" icon={UtensilsCrossed} label="Food" />
          <TabButton tab="settings" icon={User} label="Profile" />
        </div>
      </nav>

      {/* Success Modal with Add to Calendar */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSuccessModal(false)} />

          {/* Modal */}
          <div className={`relative w-full max-w-sm rounded-3xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl overflow-hidden`}>
            {/* Success Header */}
            <div className={`p-6 text-center ${successModalType === 'workout' ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                {successModalType === 'workout' ? (
                  <Dumbbell className="w-10 h-10 text-white" />
                ) : (
                  <UtensilsCrossed className="w-10 h-10 text-white" />
                )}
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {successModalType === 'workout' ? 'Workout Saved!' : 'Meal Logged!'}
              </h3>
              <p className="text-white/80 text-sm">{successModalData.title}</p>
            </div>

            {/* Actions */}
            <div className="p-6 space-y-3">
              <button
                onClick={() => addToCalendar(successModalType, successModalData)}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-2xl font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all"
              >
                <Calendar className="w-5 h-5" />
                Add to Google Calendar
              </button>

              <button
                onClick={() => setShowSuccessModal(false)}
                className={`w-full py-4 px-6 rounded-2xl font-medium transition-all ${
                  darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Done
              </button>
            </div>

            {/* Stats badge */}
            <div className={`px-6 pb-6 flex justify-center gap-4`}>
              {successModalType === 'workout' && successModalData.duration && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <Clock className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {successModalData.duration} min
                  </span>
                </div>
              )}
              {successModalType === 'meal' && successModalData.calories && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <Flame className={`w-4 h-4 ${darkMode ? 'text-orange-400' : 'text-orange-500'}`} />
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {successModalData.calories} cal
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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
