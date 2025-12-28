'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';

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

type Tab = 'workout' | 'timer' | 'history' | 'food' | 'friends' | 'challenges' | 'settings';

export default function SnapFit() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('workout');
  const [photos, setPhotos] = useState<{ id: string; url: string; file: File }[]>([]);
  const [apiKey, setApiKey] = useState('');
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

  // Auth redirect
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Load preferences from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('snapfit_api_key');
    const savedDarkMode = localStorage.getItem('snapfit_dark_mode');
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedDarkMode) setDarkMode(savedDarkMode === 'true');
  }, []);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('snapfit_dark_mode', String(darkMode));
  }, [darkMode]);

  // Save API key to localStorage
  useEffect(() => {
    if (apiKey) localStorage.setItem('snapfit_api_key', apiKey);
  }, [apiKey]);

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
        setSavedWorkouts(data.workouts || []);
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
        setFoodLogs(data.foodLogs || []);
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
    if (!apiKey || photos.length === 0) return;

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
          apiKey,
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
        body: JSON.stringify({ imageBase64: base64, apiKey }),
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

  const TabButton = ({ tab, icon: Icon, label }: { tab: Tab; icon: typeof Dumbbell; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all text-sm ${
        activeTab === tab
          ? 'bg-indigo-600 text-white shadow-lg'
          : darkMode
          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          : 'bg-white/60 text-gray-600 hover:bg-white'
      }`}
    >
      <Icon size={16} />
      <span className="hidden md:inline">{label}</span>
    </button>
  );

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className={`min-h-screen p-4 sm:p-6 transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Camera className="text-indigo-500" size={32} />
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              SnapFit
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {session.user?.name || session.user?.email}
            </span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full transition-colors ${
                darkMode
                  ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
                  : 'bg-white/80 text-gray-600 hover:bg-white'
              }`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => signOut()}
              className={`p-2 rounded-full transition-colors ${
                darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-white/80 text-gray-600 hover:bg-white'
              }`}
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Tabs */}
        <nav className="flex justify-center gap-1 sm:gap-2 mb-6 flex-wrap">
          <TabButton tab="workout" icon={Dumbbell} label="Workout" />
          <TabButton tab="timer" icon={Timer} label="Timer" />
          <TabButton tab="history" icon={History} label="History" />
          <TabButton tab="food" icon={UtensilsCrossed} label="Food" />
          <TabButton tab="friends" icon={Users} label="Friends" />
          <TabButton tab="challenges" icon={Trophy} label="Challenges" />
          <TabButton tab="settings" icon={Settings} label="Settings" />
        </nav>

        {/* Main Content */}
        <main className={`backdrop-blur-sm rounded-2xl shadow-xl p-6 transition-colors ${darkMode ? 'bg-gray-800' : 'bg-white/80'}`}>
          {/* Workout Tab */}
          {activeTab === 'workout' && (
            <div className="space-y-6">
              <section>
                <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  <Camera className="text-indigo-500" />
                  Capture Your Environment
                </h2>

                <div className="flex flex-wrap gap-3 mb-4">
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Camera size={18} />
                    Take Photo
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    <Upload size={18} />
                    Upload
                  </button>
                  {photos.length > 0 && (
                    <button onClick={clearAll} className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30">
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
                      <div key={photo.id} className="relative group">
                        <img src={photo.url} alt="Workout environment" className="w-full h-24 object-cover rounded-lg" />
                        <button
                          onClick={() => removePhoto(photo.id)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`border-2 border-dashed rounded-xl p-8 text-center ${darkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'}`}>
                    <Camera className="mx-auto mb-2 opacity-50" size={48} />
                    <p>Take or upload photos of your workout space</p>
                  </div>
                )}
              </section>

              {/* Preferences */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Fitness Level
                  </label>
                  <select
                    value={fitnessLevel}
                    onChange={(e) => setFitnessLevel(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Duration: {duration} minutes
                  </label>
                  <input type="range" min="10" max="120" step="5" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full" />
                </div>
              </section>

              <section>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Workout Types
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(workoutTypes).map(([type, checked]) => (
                    <label
                      key={type}
                      className={`flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer transition-colors ${
                        checked ? 'bg-indigo-600 text-white' : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => setWorkoutTypes((prev) => ({ ...prev, [type]: e.target.checked }))}
                        className="sr-only"
                      />
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </label>
                  ))}
                </div>
              </section>

              <button
                onClick={generateWorkout}
                disabled={!apiKey || photos.length === 0 || isLoading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Dumbbell size={20} />
                    Generate Workout
                  </>
                )}
              </button>

              {!apiKey && (
                <p className="text-amber-500 text-sm text-center">Add your Anthropic API key in Settings</p>
              )}

              {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

              {/* Workout Plan Display */}
              {workoutPlan && (
                <div className="space-y-4 mt-6">
                  <div className="flex items-center justify-between">
                    <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      Your {duration}-Minute Workout
                    </h2>
                    <button onClick={saveWorkout} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                      <Save size={18} />
                      Save
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {workoutPlan.equipment.map((item, i) => (
                      <span key={i} className={`px-3 py-1 rounded-full text-sm ${darkMode ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}>
                        {item}
                      </span>
                    ))}
                  </div>

                  {/* Warmup */}
                  <div className={`rounded-xl overflow-hidden ${darkMode ? 'bg-orange-900/30' : 'bg-orange-50'}`}>
                    <button onClick={() => toggleSection('warmup')} className="w-full p-4 flex items-center justify-between">
                      <span className={`font-semibold ${darkMode ? 'text-orange-400' : 'text-orange-700'}`}>Warm-up</span>
                      {expandedSections.warmup ? <ChevronUp /> : <ChevronDown />}
                    </button>
                    {expandedSections.warmup && (
                      <div className="px-4 pb-4 space-y-2">
                        {workoutPlan.workout.warmup.map((ex, i) => (
                          <div key={i} className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                            <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{ex.name}</div>
                            <div className={`text-sm ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>{ex.duration}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Main Workout */}
                  <div className={`rounded-xl overflow-hidden ${darkMode ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
                    <button onClick={() => toggleSection('main')} className="w-full p-4 flex items-center justify-between">
                      <span className={`font-semibold ${darkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>Main Workout</span>
                      {expandedSections.main ? <ChevronUp /> : <ChevronDown />}
                    </button>
                    {expandedSections.main && (
                      <div className="px-4 pb-4 space-y-2">
                        {workoutPlan.workout.main.map((ex, i) => (
                          <div key={i} className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                            <div className="flex justify-between">
                              <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{ex.name}</div>
                              <div className={`text-sm font-semibold ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                {ex.sets} x {ex.reps}
                              </div>
                            </div>
                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{ex.tips}</div>
                            {ex.videoUrl && (
                              <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-500 flex items-center gap-1 mt-1">
                                <ExternalLink size={14} /> Watch Demo
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Cooldown */}
                  <div className={`rounded-xl overflow-hidden ${darkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
                    <button onClick={() => toggleSection('cooldown')} className="w-full p-4 flex items-center justify-between">
                      <span className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'}`}>Cool-down</span>
                      {expandedSections.cooldown ? <ChevronUp /> : <ChevronDown />}
                    </button>
                    {expandedSections.cooldown && (
                      <div className="px-4 pb-4 space-y-2">
                        {workoutPlan.workout.cooldown.map((ex, i) => (
                          <div key={i} className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                            <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{ex.name}</div>
                            <div className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{ex.duration}</div>
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
            <div className="max-w-md mx-auto text-center space-y-6">
              <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Rest Timer</h2>

              <div className="flex justify-center gap-2">
                {[30, 60, 90, 120].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => { setTimerSeconds(sec); setTimerRemaining(sec); setTimerRunning(false); }}
                    className={`px-4 py-2 rounded-lg font-medium ${timerSeconds === sec ? 'bg-indigo-600 text-white' : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100'}`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>

              <div className={`text-6xl font-mono py-8 rounded-2xl ${darkMode ? 'bg-gray-700 text-indigo-400' : 'bg-white'}`}>
                {formatTime(timerRemaining)}
              </div>

              <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div className="h-full bg-indigo-600 transition-all" style={{ width: `${((timerSeconds - timerRemaining) / timerSeconds) * 100}%` }} />
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => { if (timerRemaining === 0) setTimerRemaining(timerSeconds); setTimerRunning(!timerRunning); }}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-lg font-semibold"
                >
                  {timerRunning ? <><Pause size={24} /> Pause</> : <><Play size={24} /> Start</>}
                </button>
                <button
                  onClick={() => { setTimerRunning(false); setTimerRemaining(timerSeconds); }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100'}`}
                >
                  <RotateCcw size={24} /> Reset
                </button>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Workout History</h2>

              {savedWorkouts.length === 0 ? (
                <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <History className="mx-auto mb-4 opacity-50" size={48} />
                  <p>No saved workouts yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedWorkouts.map((workout) => (
                    <div key={workout.id} className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {workout.title || `${workout.duration}-min ${workout.fitnessLevel} workout`}
                          </div>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {new Date(workout.createdAt).toLocaleDateString()}
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
            <div className="space-y-6">
              <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Food Tracking</h2>

              {/* Photo Upload */}
              <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h3 className={`font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Log a Meal</h3>

                <div className="flex gap-4 mb-4">
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value)}
                    className={`px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-600 text-white' : 'bg-white border'}`}
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                  <button onClick={() => foodInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg">
                    <Camera size={18} />
                    Take Photo
                  </button>
                </div>
                <input ref={foodInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFoodPhotoChange} />

                {foodPhotoPreview && (
                  <div className="space-y-4">
                    <img src={foodPhotoPreview} alt="Food" className="w-full max-w-md rounded-lg" />

                    {!foodAnalysis ? (
                      <button
                        onClick={analyzeFood}
                        disabled={analyzingFood || !apiKey}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
                      >
                        {analyzingFood ? <Loader2 className="animate-spin" size={18} /> : <UtensilsCrossed size={18} />}
                        {analyzingFood ? 'Analyzing...' : 'Analyze Food'}
                      </button>
                    ) : (
                      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-white'}`}>
                        <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{foodAnalysis.foodName}</h4>
                        <div className="grid grid-cols-4 gap-2 text-center mb-4">
                          <div className={`p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <div className="text-lg font-bold text-indigo-500">{foodAnalysis.calories}</div>
                            <div className="text-xs">Calories</div>
                          </div>
                          <div className={`p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <div className="text-lg font-bold text-green-500">{foodAnalysis.protein}g</div>
                            <div className="text-xs">Protein</div>
                          </div>
                          <div className={`p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <div className="text-lg font-bold text-yellow-500">{foodAnalysis.carbs}g</div>
                            <div className="text-xs">Carbs</div>
                          </div>
                          <div className={`p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <div className="text-lg font-bold text-red-500">{foodAnalysis.fat}g</div>
                            <div className="text-xs">Fat</div>
                          </div>
                        </div>
                        <button onClick={saveFoodLog} className="w-full py-2 bg-green-600 text-white rounded-lg">
                          Save to Log
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Food History */}
              <div>
                <h3 className={`font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Today's Meals</h3>
                {foodLogs.length === 0 ? (
                  <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No meals logged yet</p>
                ) : (
                  <div className="space-y-2">
                    {foodLogs.map((log) => (
                      <div key={log.id} className={`p-3 rounded-lg flex justify-between ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div>
                          <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{log.foodName || 'Meal'}</div>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{log.mealType}</div>
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
            <div className="space-y-6">
              <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Friends</h2>

              {/* Add Friend */}
              <div className="flex gap-2">
                <input
                  type="email"
                  value={friendEmail}
                  onChange={(e) => setFriendEmail(e.target.value)}
                  placeholder="Friend's email"
                  className={`flex-1 px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white border'}`}
                />
                <button onClick={sendFriendRequest} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2">
                  <UserPlus size={18} />
                  Add
                </button>
              </div>

              {/* Pending Requests */}
              {pendingRequests.length > 0 && (
                <div>
                  <h3 className={`font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Pending Requests</h3>
                  <div className="space-y-2">
                    {pendingRequests.map((req) => (
                      <div key={req.id} className={`p-3 rounded-lg flex justify-between items-center ${darkMode ? 'bg-gray-700' : 'bg-yellow-50'}`}>
                        <div>
                          <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{req.name}</div>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{req.email}</div>
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
                <h3 className={`font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Your Friends</h3>
                {friendsLoading ? (
                  <div className="text-center py-8"><Loader2 className="animate-spin mx-auto" /></div>
                ) : friends.length === 0 ? (
                  <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No friends yet. Add some!</p>
                ) : (
                  <div className="grid gap-3">
                    {friends.map((friend) => (
                      <div key={friend.id} className={`p-4 rounded-lg flex items-center gap-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-600' : 'bg-indigo-100'}`}>
                          {friend.name?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1">
                          <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{friend.name}</div>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{friend.email}</div>
                        </div>
                        {friend.isTrainer && (
                          <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 text-xs rounded-full">Trainer</span>
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
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Challenges</h2>
                <button onClick={() => setShowCreateChallenge(!showCreateChallenge)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2">
                  <Plus size={18} />
                  Create
                </button>
              </div>

              {/* Create Challenge Form */}
              {showCreateChallenge && (
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={newChallenge.name}
                      onChange={(e) => setNewChallenge({ ...newChallenge, name: e.target.value })}
                      placeholder="Challenge name"
                      className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-600 text-white' : 'bg-white border'}`}
                    />
                    <textarea
                      value={newChallenge.description}
                      onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                      placeholder="Description"
                      className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-600 text-white' : 'bg-white border'}`}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <select
                        value={newChallenge.type}
                        onChange={(e) => setNewChallenge({ ...newChallenge, type: e.target.value })}
                        className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-600 text-white' : 'bg-white border'}`}
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
                        className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-600 text-white' : 'bg-white border'}`}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="date"
                        value={newChallenge.startDate}
                        onChange={(e) => setNewChallenge({ ...newChallenge, startDate: e.target.value })}
                        className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-600 text-white' : 'bg-white border'}`}
                      />
                      <input
                        type="date"
                        value={newChallenge.endDate}
                        onChange={(e) => setNewChallenge({ ...newChallenge, endDate: e.target.value })}
                        className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-600 text-white' : 'bg-white border'}`}
                      />
                    </div>
                    <button onClick={createChallenge} className="w-full py-2 bg-green-600 text-white rounded-lg">
                      Create Challenge
                    </button>
                  </div>
                </div>
              )}

              {/* Challenges List */}
              {challengesLoading ? (
                <div className="text-center py-8"><Loader2 className="animate-spin mx-auto" /></div>
              ) : challenges.length === 0 ? (
                <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No challenges yet. Create one!</p>
              ) : (
                <div className="grid gap-4">
                  {challenges.map((challenge) => (
                    <div key={challenge.id} className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{challenge.name}</h3>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{challenge.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${darkMode ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}>
                          {challenge.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <Users size={14} className="inline mr-1" />
                          {challenge.participantCount} participants
                        </div>
                        {challenge.isJoined ? (
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-24 rounded-full overflow-hidden ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                              <div className="h-full bg-green-500" style={{ width: `${(challenge.userProgress / (challenge.goal || 1)) * 100}%` }} />
                            </div>
                            <span className="text-sm text-green-500">{challenge.userProgress}/{challenge.goal}</span>
                          </div>
                        ) : (
                          <button onClick={() => joinChallenge(challenge.id)} className="px-4 py-1 bg-indigo-600 text-white rounded-lg text-sm">
                            Join
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
            <div className="max-w-md mx-auto space-y-6">
              <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Settings</h2>

              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Dark Mode</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Toggle theme</p>
                  </div>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${darkMode ? 'bg-indigo-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Anthropic API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'border'}`}
                />
                <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Stored locally, never sent to our servers.
                </p>
              </div>

              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h3 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Account</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{session.user?.email}</p>
                {(session.user as any)?.isTrainer && (
                  <span className="inline-block mt-2 px-2 py-1 bg-indigo-500/20 text-indigo-400 text-xs rounded-full">Trainer Account</span>
                )}
              </div>
            </div>
          )}
        </main>

        <footer className={`text-center mt-6 text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
          Made with React + Claude AI
        </footer>
      </div>
    </div>
  );
}
