'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
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
} from 'lucide-react';

interface Exercise {
  name: string;
  duration?: string;
  description?: string;
  sets?: number;
  reps?: string;
  equipment?: string;
  tips?: string;
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
  date: string;
  duration: number;
  fitnessLevel: string;
  plan: WorkoutPlan;
}

type Tab = 'workout' | 'timer' | 'history' | 'settings';

export default function SnapFit() {
  // State
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

  // Expandable sections
  const [expandedSections, setExpandedSections] = useState({
    warmup: true,
    main: true,
    cooldown: true,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Load saved data from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('snapfit_api_key');
    const savedWorkoutsData = localStorage.getItem('snapfit_workouts');
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedWorkoutsData) setSavedWorkouts(JSON.parse(savedWorkoutsData));
  }, []);

  // Save API key to localStorage
  useEffect(() => {
    if (apiKey) localStorage.setItem('snapfit_api_key', apiKey);
  }, [apiKey]);

  // Save workouts to localStorage
  useEffect(() => {
    localStorage.setItem('snapfit_workouts', JSON.stringify(savedWorkouts));
  }, [savedWorkouts]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && timerRemaining > 0) {
      interval = setInterval(() => {
        setTimerRemaining((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            // Play sound or vibrate
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
      // Convert images to base64
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

  const saveWorkout = () => {
    if (!workoutPlan) return;

    const newWorkout: SavedWorkout = {
      id: crypto.randomUUID(),
      date: new Date().toLocaleString(),
      duration,
      fitnessLevel,
      plan: workoutPlan,
    };

    setSavedWorkouts((prev) => [newWorkout, ...prev]);
  };

  const deleteWorkout = (id: string) => {
    setSavedWorkouts((prev) => prev.filter((w) => w.id !== id));
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
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
        activeTab === tab
          ? 'bg-indigo-600 text-white shadow-lg'
          : 'bg-white/60 text-gray-600 hover:bg-white'
      }`}
    >
      <Icon size={18} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <Camera className="text-indigo-600" size={36} />
            SnapFit
          </h1>
          <p className="text-gray-600 mt-1">Snap. Train. Transform.</p>
        </header>

        {/* Tabs */}
        <nav className="flex justify-center gap-2 mb-6 flex-wrap">
          <TabButton tab="workout" icon={Dumbbell} label="Create Workout" />
          <TabButton tab="timer" icon={Timer} label="Rest Timer" />
          <TabButton tab="history" icon={History} label="History" />
          <TabButton tab="settings" icon={Settings} label="Settings" />
        </nav>

        {/* Main Content */}
        <main className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
          {/* Workout Tab */}
          {activeTab === 'workout' && (
            <div className="space-y-6">
              {/* Photos Section */}
              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Camera className="text-indigo-600" />
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
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Upload size={18} />
                    Upload Photos
                  </button>
                  {photos.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 size={18} />
                      Clear All
                    </button>
                  )}
                </div>

                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                />

                {photos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {photos.map((photo) => (
                      <div key={photo.id} className="relative group">
                        <img
                          src={photo.url}
                          alt="Workout environment"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removePhoto(photo.id)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-500">
                    <Camera className="mx-auto mb-2 text-gray-400" size={48} />
                    <p>Take or upload photos of your workout space</p>
                  </div>
                )}
              </section>

              {/* Preferences */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fitness Level
                  </label>
                  <select
                    value={fitnessLevel}
                    onChange={(e) => setFitnessLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration: {duration} minutes
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="120"
                    step="5"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </section>

              <section>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workout Types
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(workoutTypes).map(([type, checked]) => (
                    <label
                      key={type}
                      className={`flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer transition-colors ${
                        checked
                          ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300'
                          : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          setWorkoutTypes((prev) => ({
                            ...prev,
                            [type]: e.target.checked,
                          }))
                        }
                        className="sr-only"
                      />
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </label>
                  ))}
                </div>
              </section>

              {/* Generate Button */}
              <button
                onClick={generateWorkout}
                disabled={!apiKey || photos.length === 0 || isLoading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Analyzing your environment...
                  </>
                ) : (
                  <>
                    <Dumbbell size={20} />
                    Generate Workout Plan
                  </>
                )}
              </button>

              {!apiKey && (
                <p className="text-amber-600 text-sm text-center">
                  Please add your Anthropic API key in Settings
                </p>
              )}

              {error && (
                <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
              )}

              {/* Workout Plan Display */}
              {workoutPlan && (
                <div className="space-y-4 mt-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">
                      Your {duration}-Minute Workout
                    </h2>
                    <button
                      onClick={saveWorkout}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Save size={18} />
                      Save
                    </button>
                  </div>

                  {/* Equipment */}
                  <div className="flex flex-wrap gap-2">
                    {workoutPlan.equipment.map((item, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  {/* Warmup */}
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleSection('warmup')}
                      className="w-full p-4 flex items-center justify-between text-left"
                    >
                      <span className="text-lg font-semibold text-orange-700">
                        Warm-up
                      </span>
                      {expandedSections.warmup ? (
                        <ChevronUp className="text-orange-600" />
                      ) : (
                        <ChevronDown className="text-orange-600" />
                      )}
                    </button>
                    {expandedSections.warmup && (
                      <div className="px-4 pb-4 space-y-2">
                        {workoutPlan.workout.warmup.map((ex, i) => (
                          <div
                            key={i}
                            className="p-3 bg-white rounded-lg shadow-sm"
                          >
                            <div className="font-medium text-gray-800">
                              {ex.name}
                            </div>
                            <div className="text-sm text-orange-600">
                              {ex.duration}
                            </div>
                            <div className="text-sm text-gray-600">
                              {ex.description}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Main Workout */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleSection('main')}
                      className="w-full p-4 flex items-center justify-between text-left"
                    >
                      <span className="text-lg font-semibold text-indigo-700">
                        Main Workout
                      </span>
                      {expandedSections.main ? (
                        <ChevronUp className="text-indigo-600" />
                      ) : (
                        <ChevronDown className="text-indigo-600" />
                      )}
                    </button>
                    {expandedSections.main && (
                      <div className="px-4 pb-4 space-y-2">
                        {workoutPlan.workout.main.map((ex, i) => (
                          <div
                            key={i}
                            className="p-3 bg-white rounded-lg shadow-sm"
                          >
                            <div className="flex justify-between items-start">
                              <div className="font-medium text-gray-800">
                                {ex.name}
                              </div>
                              <div className="text-sm font-semibold text-indigo-600">
                                {ex.sets} x {ex.reps}
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              Equipment: {ex.equipment}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {ex.tips}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Cooldown */}
                  <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleSection('cooldown')}
                      className="w-full p-4 flex items-center justify-between text-left"
                    >
                      <span className="text-lg font-semibold text-green-700">
                        Cool-down & Stretch
                      </span>
                      {expandedSections.cooldown ? (
                        <ChevronUp className="text-green-600" />
                      ) : (
                        <ChevronDown className="text-green-600" />
                      )}
                    </button>
                    {expandedSections.cooldown && (
                      <div className="px-4 pb-4 space-y-2">
                        {workoutPlan.workout.cooldown.map((ex, i) => (
                          <div
                            key={i}
                            className="p-3 bg-white rounded-lg shadow-sm"
                          >
                            <div className="font-medium text-gray-800">
                              {ex.name}
                            </div>
                            <div className="text-sm text-green-600">
                              {ex.duration}
                            </div>
                            <div className="text-sm text-gray-600">
                              {ex.description}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {workoutPlan.notes && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
                      <strong>Important:</strong> {workoutPlan.notes}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Timer Tab */}
          {activeTab === 'timer' && (
            <div className="max-w-md mx-auto text-center space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800">Rest Timer</h2>

              {/* Presets */}
              <div className="flex justify-center gap-2">
                {[30, 60, 90, 120].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => {
                      setTimerSeconds(sec);
                      setTimerRemaining(sec);
                      setTimerRunning(false);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      timerSeconds === sec
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>

              {/* Timer Display */}
              <div
                className={`timer-display py-8 rounded-2xl bg-white shadow-inner ${
                  timerRunning ? 'timer-running' : ''
                }`}
              >
                {formatTime(timerRemaining)}
              </div>

              {/* Progress */}
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-1000"
                  style={{
                    width: `${((timerSeconds - timerRemaining) / timerSeconds) * 100}%`,
                  }}
                />
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    if (timerRemaining === 0) setTimerRemaining(timerSeconds);
                    setTimerRunning(!timerRunning);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-lg font-semibold"
                >
                  {timerRunning ? (
                    <>
                      <Pause size={24} /> Pause
                    </>
                  ) : (
                    <>
                      <Play size={24} /> Start
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setTimerRunning(false);
                    setTimerRemaining(timerSeconds);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-lg"
                >
                  <RotateCcw size={24} /> Reset
                </button>
              </div>

              {/* Custom Time */}
              <div className="pt-4">
                <label className="block text-sm text-gray-600 mb-2">
                  Custom duration (seconds)
                </label>
                <input
                  type="number"
                  min="5"
                  max="300"
                  value={timerSeconds}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setTimerSeconds(val);
                    if (!timerRunning) setTimerRemaining(val);
                  }}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-center"
                />
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                Workout History
              </h2>

              {savedWorkouts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <History className="mx-auto mb-4 text-gray-400" size={48} />
                  <p>No saved workouts yet.</p>
                  <p className="text-sm">Generate and save a workout to see it here!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedWorkouts.map((workout) => (
                    <div
                      key={workout.id}
                      className="p-4 bg-gray-50 rounded-xl border border-gray-200"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-gray-800">
                            {workout.duration}-min {workout.fitnessLevel} workout
                          </div>
                          <div className="text-sm text-gray-500">
                            {workout.date}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {workout.plan.workout.main.length} exercises |{' '}
                            {workout.plan.equipment.slice(0, 3).join(', ')}
                            {workout.plan.equipment.length > 3 && '...'}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteWorkout(workout.id)}
                          className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          setWorkoutPlan(workout.plan);
                          setActiveTab('workout');
                        }}
                        className="mt-3 w-full py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-medium"
                      >
                        View Workout
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="max-w-md mx-auto space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800">Settings</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anthropic API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Your API key is stored locally and never sent to our servers.
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="font-medium text-gray-800 mb-3">Data Management</h3>
                <button
                  onClick={() => {
                    localStorage.removeItem('snapfit_workouts');
                    setSavedWorkouts([]);
                  }}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Clear All Saved Workouts
                </button>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="font-medium text-gray-800 mb-2">About</h3>
                <p className="text-sm text-gray-600">
                  SnapFit uses Claude AI to analyze your workout environment and
                  create personalized exercise routines based on available
                  equipment and space.
                </p>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="text-center mt-6 text-sm text-gray-500">
          Made with React + Claude AI
        </footer>
      </div>
    </div>
  );
}
