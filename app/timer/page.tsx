'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Play, Pause, RotateCcw, Settings, Volume2, VolumeX,
  Timer, Zap, Flame, Clock, Target, Infinity, Plus, Minus, Save,
  ChevronDown, ChevronUp, Trophy, X, Check, Star, Bookmark
} from 'lucide-react';
import { useCelebration } from '@/components/Celebration';
import { triggerHaptic } from '@/lib/haptics';
import { popIn, scaleIn } from '@/lib/animations';

// Hero image
const HERO_IMAGE = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&auto=format&fit=crop&q=80';

type TimerMode = 'amrap' | 'emom' | 'tabata' | 'stopwatch' | 'countdown' | 'interval';

interface TimerPreset {
  id: string;
  name: string;
  type: TimerMode;
  rounds?: number;
  workDuration?: number;
  restDuration?: number;
  totalDuration?: number;
  intervals?: { name: string; duration: number; type: 'work' | 'rest' }[];
  isFavorite?: boolean;
}

const TIMER_MODES = [
  { id: 'amrap' as TimerMode, name: 'AMRAP', icon: Infinity, color: 'from-orange-500 to-red-600', description: 'As Many Rounds As Possible' },
  { id: 'emom' as TimerMode, name: 'EMOM', icon: Clock, color: 'from-blue-500 to-cyan-600', description: 'Every Minute On the Minute' },
  { id: 'tabata' as TimerMode, name: 'Tabata', icon: Zap, color: 'from-green-500 to-emerald-600', description: '20s work / 10s rest × 8' },
  { id: 'stopwatch' as TimerMode, name: 'Stopwatch', icon: Timer, color: 'from-violet-500 to-purple-600', description: 'Count up timer' },
  { id: 'countdown' as TimerMode, name: 'Countdown', icon: Target, color: 'from-pink-500 to-rose-600', description: 'Count down from set time' },
  { id: 'interval' as TimerMode, name: 'Interval', icon: Flame, color: 'from-amber-500 to-orange-600', description: 'Custom work/rest intervals' },
];

const DEFAULT_PRESETS: TimerPreset[] = [
  { id: '1', name: 'Classic Tabata', type: 'tabata', rounds: 8, workDuration: 20, restDuration: 10, isFavorite: true },
  { id: '2', name: '12 Min AMRAP', type: 'amrap', totalDuration: 720, isFavorite: false },
  { id: '3', name: '10 Min EMOM', type: 'emom', totalDuration: 600, rounds: 10, isFavorite: false },
  { id: '4', name: 'HIIT 30/30', type: 'interval', rounds: 10, workDuration: 30, restDuration: 30, isFavorite: true },
  { id: '5', name: '5 Min Countdown', type: 'countdown', totalDuration: 300, isFavorite: false },
];

export default function TimerPage() {
  // Timer state
  const [mode, setMode] = useState<TimerMode>('tabata');
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [isWorkPhase, setIsWorkPhase] = useState(true);
  const [roundsCompleted, setRoundsCompleted] = useState(0);

  // Settings
  const [rounds, setRounds] = useState(8);
  const [workDuration, setWorkDuration] = useState(20);
  const [restDuration, setRestDuration] = useState(10);
  const [totalDuration, setTotalDuration] = useState(720); // 12 min default for AMRAP
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [presets, setPresets] = useState<TimerPreset[]>(DEFAULT_PRESETS);
  const [showPresets, setShowPresets] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [presetName, setPresetName] = useState('');

  // Premium celebration animations
  const { celebrate, CelebrationComponent } = useCelebration();

  // Refs
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContext = useRef<AudioContext | null>(null);

  // Play beep sound
  const playBeep = useCallback((frequency: number = 800, duration: number = 150) => {
    if (!soundEnabled) return;

    try {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const oscillator = audioContext.current.createOscillator();
      const gainNode = audioContext.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.current.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + duration / 1000);

      oscillator.start(audioContext.current.currentTime);
      oscillator.stop(audioContext.current.currentTime + duration / 1000);
    } catch (e) {
      console.log('Audio not supported');
    }
  }, [soundEnabled]);

  // Play countdown beeps (3, 2, 1)
  const playCountdownBeep = useCallback(() => {
    playBeep(600, 100);
  }, [playBeep]);

  // Play phase change sound
  const playPhaseChange = useCallback((isWork: boolean) => {
    if (isWork) {
      playBeep(1000, 200);
      setTimeout(() => playBeep(1200, 200), 200);
    } else {
      playBeep(500, 300);
    }
  }, [playBeep]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(Math.abs(seconds) / 60);
    const secs = Math.abs(seconds) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize timer based on mode
  const initializeTimer = useCallback(() => {
    switch (mode) {
      case 'tabata':
        setTimeRemaining(workDuration);
        setTotalTime(rounds * (workDuration + restDuration));
        break;
      case 'emom':
        setTimeRemaining(60);
        setTotalTime(rounds * 60);
        break;
      case 'amrap':
      case 'countdown':
        setTimeRemaining(totalDuration);
        setTotalTime(totalDuration);
        break;
      case 'interval':
        setTimeRemaining(workDuration);
        setTotalTime(rounds * (workDuration + restDuration));
        break;
      case 'stopwatch':
        setTimeRemaining(0);
        setTotalTime(0);
        break;
    }
    setCurrentRound(1);
    setIsWorkPhase(true);
    setRoundsCompleted(0);
  }, [mode, rounds, workDuration, restDuration, totalDuration]);

  // Reset timer
  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    initializeTimer();
  }, [initializeTimer]);

  // Initialize on mode change
  useEffect(() => {
    resetTimer();
  }, [mode, resetTimer]);

  // Timer logic
  useEffect(() => {
    if (!isRunning || isPaused) return;

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        // Countdown beeps for last 3 seconds
        if (mode !== 'stopwatch' && prev <= 4 && prev > 1) {
          playCountdownBeep();
        }

        if (mode === 'stopwatch') {
          setTotalTime((t) => t + 1);
          return prev + 1;
        }

        // For countdown modes
        if (prev <= 1) {
          // Handle phase/round transitions
          switch (mode) {
            case 'tabata':
            case 'interval':
              if (isWorkPhase) {
                // Switch to rest
                playPhaseChange(false);
                setIsWorkPhase(false);
                return restDuration;
              } else {
                // Switch to work, next round
                if (currentRound >= rounds) {
                  // Timer complete
                  setIsRunning(false);
                  playBeep(1200, 500);
                  setTimeout(() => playBeep(1200, 500), 500);
                  return 0;
                }
                playPhaseChange(true);
                setIsWorkPhase(true);
                setCurrentRound((r) => r + 1);
                setRoundsCompleted((r) => r + 1);
                return workDuration;
              }

            case 'emom':
              if (currentRound >= rounds) {
                setIsRunning(false);
                playBeep(1200, 500);
                return 0;
              }
              playPhaseChange(true);
              setCurrentRound((r) => r + 1);
              setRoundsCompleted((r) => r + 1);
              return 60;

            case 'amrap':
            case 'countdown':
              setIsRunning(false);
              playBeep(1200, 500);
              setTimeout(() => playBeep(1200, 500), 500);
              return 0;

            default:
              return 0;
          }
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, mode, isWorkPhase, currentRound, rounds, workDuration, restDuration, playCountdownBeep, playPhaseChange, playBeep]);

  // Celebrate when timer completes (not stopwatch)
  useEffect(() => {
    if (!isRunning && roundsCompleted > 0 && mode !== 'stopwatch') {
      triggerHaptic('success');
      const modeName = TIMER_MODES.find(m => m.id === mode)?.name || 'Workout';
      celebrate('challenge', 'WORKOUT COMPLETE!', `${roundsCompleted} rounds of ${modeName}`);
    }
  }, [isRunning, roundsCompleted, mode, celebrate]);

  // Start/pause timer
  const toggleTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      setIsPaused(false);
      playBeep(800, 100);
    } else {
      setIsPaused(!isPaused);
    }
  };

  // Load preset
  const loadPreset = (preset: TimerPreset) => {
    setMode(preset.type);
    if (preset.rounds) setRounds(preset.rounds);
    if (preset.workDuration) setWorkDuration(preset.workDuration);
    if (preset.restDuration) setRestDuration(preset.restDuration);
    if (preset.totalDuration) setTotalDuration(preset.totalDuration);
    setShowPresets(false);
  };

  // Save current as preset
  const savePreset = () => {
    if (!presetName.trim()) return;

    const newPreset: TimerPreset = {
      id: Date.now().toString(),
      name: presetName,
      type: mode,
      rounds,
      workDuration,
      restDuration,
      totalDuration,
      isFavorite: false,
    };

    setPresets([...presets, newPreset]);
    setPresetName('');
    setShowSaveModal(false);
  };

  // Toggle favorite
  const toggleFavorite = (id: string) => {
    setPresets(presets.map(p =>
      p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
    ));
  };

  // Get progress percentage
  const getProgress = () => {
    if (mode === 'stopwatch') return 0;
    if (totalTime === 0) return 0;

    const elapsed = totalTime - timeRemaining;
    return (elapsed / totalTime) * 100;
  };

  // Get current mode config
  const currentMode = TIMER_MODES.find(m => m.id === mode)!;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Premium Celebration Component */}
      {CelebrationComponent}

      {/* Hero Header */}
      <div className="relative">
        <div
          className="h-48 bg-cover bg-center"
          style={{ backgroundImage: `url("${HERO_IMAGE}")` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-slate-900" />
        </div>

        {/* Header Actions */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Link
            href="/"
            className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl hover:bg-white/20 transition-all"
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-white" />
              ) : (
                <VolumeX className="w-5 h-5 text-white/50" />
              )}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl hover:bg-white/20 transition-all"
            >
              <Settings className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-3xl font-bold text-white mb-1">Workout Timer</h1>
          <p className="text-white/60">Train smarter with precision timing</p>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Timer Mode Selector */}
        <div className="grid grid-cols-3 gap-2">
          {TIMER_MODES.map((timerMode) => {
            const Icon = timerMode.icon;
            const isActive = mode === timerMode.id;
            return (
              <button
                key={timerMode.id}
                onClick={() => setMode(timerMode.id)}
                disabled={isRunning}
                className={`p-3 rounded-2xl transition-all ${
                  isActive
                    ? `bg-gradient-to-r ${timerMode.color} shadow-lg`
                    : 'bg-white/5 hover:bg-white/10'
                } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Icon className={`w-5 h-5 mx-auto mb-1 ${isActive ? 'text-white' : 'text-white/60'}`} />
                <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-white/60'}`}>
                  {timerMode.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Timer Display */}
        <div className="relative">
          {/* Progress Ring */}
          <div className="relative w-72 h-72 mx-auto">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="144"
                cy="144"
                r="130"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="12"
              />
              {/* Progress circle */}
              <circle
                cx="144"
                cy="144"
                r="130"
                fill="none"
                stroke="url(#timerGradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 130}`}
                strokeDashoffset={`${2 * Math.PI * 130 * (1 - getProgress() / 100)}`}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
            </svg>

            {/* Timer Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {/* Phase indicator for interval timers */}
              {(mode === 'tabata' || mode === 'interval') && isRunning && (
                <div className={`px-4 py-1 rounded-full text-sm font-semibold mb-2 ${
                  isWorkPhase
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {isWorkPhase ? 'WORK' : 'REST'}
                </div>
              )}

              {/* Time Display */}
              <div className={`text-6xl font-bold font-mono ${
                timeRemaining <= 3 && isRunning && mode !== 'stopwatch'
                  ? 'text-red-400 animate-pulse'
                  : 'text-white'
              }`}>
                {formatTime(timeRemaining)}
              </div>

              {/* Round indicator */}
              {(mode === 'tabata' || mode === 'emom' || mode === 'interval') && (
                <div className="text-white/60 mt-2">
                  Round {currentRound} / {rounds}
                </div>
              )}

              {/* Mode description */}
              <div className="text-white/40 text-sm mt-1">
                {currentMode.description}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={resetTimer}
            className="p-4 bg-white/10 backdrop-blur-xl rounded-full hover:bg-white/20 transition-all"
          >
            <RotateCcw className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={toggleTimer}
            className={`p-6 rounded-full shadow-lg transition-all ${
              isRunning && !isPaused
                ? 'bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700'
                : 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700'
            }`}
          >
            {isRunning && !isPaused ? (
              <Pause className="w-8 h-8 text-white" />
            ) : (
              <Play className="w-8 h-8 text-white ml-1" />
            )}
          </button>

          <button
            onClick={() => setShowSaveModal(true)}
            className="p-4 bg-white/10 backdrop-blur-xl rounded-full hover:bg-white/20 transition-all"
          >
            <Bookmark className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Quick Settings */}
        {showSettings && !isRunning && (
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 space-y-6">
            <h3 className="text-lg font-semibold text-white">Timer Settings</h3>

            {/* Rounds (for applicable modes) */}
            {(mode === 'tabata' || mode === 'emom' || mode === 'interval') && (
              <div className="space-y-2">
                <label className="text-sm text-white/60">Rounds</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setRounds(Math.max(1, rounds - 1))}
                    className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
                  >
                    <Minus className="w-5 h-5 text-white" />
                  </button>
                  <span className="text-2xl font-bold text-white w-16 text-center">{rounds}</span>
                  <button
                    onClick={() => setRounds(rounds + 1)}
                    className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
                  >
                    <Plus className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            )}

            {/* Work Duration */}
            {(mode === 'tabata' || mode === 'interval') && (
              <div className="space-y-2">
                <label className="text-sm text-white/60">Work Duration (seconds)</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setWorkDuration(Math.max(5, workDuration - 5))}
                    className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
                  >
                    <Minus className="w-5 h-5 text-white" />
                  </button>
                  <span className="text-2xl font-bold text-white w-16 text-center">{workDuration}s</span>
                  <button
                    onClick={() => setWorkDuration(workDuration + 5)}
                    className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
                  >
                    <Plus className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            )}

            {/* Rest Duration */}
            {(mode === 'tabata' || mode === 'interval') && (
              <div className="space-y-2">
                <label className="text-sm text-white/60">Rest Duration (seconds)</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setRestDuration(Math.max(5, restDuration - 5))}
                    className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
                  >
                    <Minus className="w-5 h-5 text-white" />
                  </button>
                  <span className="text-2xl font-bold text-white w-16 text-center">{restDuration}s</span>
                  <button
                    onClick={() => setRestDuration(restDuration + 5)}
                    className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
                  >
                    <Plus className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            )}

            {/* Total Duration (for AMRAP/Countdown) */}
            {(mode === 'amrap' || mode === 'countdown') && (
              <div className="space-y-2">
                <label className="text-sm text-white/60">Total Duration</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setTotalDuration(Math.max(60, totalDuration - 60))}
                    className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
                  >
                    <Minus className="w-5 h-5 text-white" />
                  </button>
                  <span className="text-2xl font-bold text-white w-20 text-center">{formatTime(totalDuration)}</span>
                  <button
                    onClick={() => setTotalDuration(totalDuration + 60)}
                    className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
                  >
                    <Plus className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Presets */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
          <button
            onClick={() => setShowPresets(!showPresets)}
            className="w-full p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-amber-400" />
              <span className="font-semibold text-white">Saved Presets</span>
            </div>
            {showPresets ? (
              <ChevronUp className="w-5 h-5 text-white/60" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white/60" />
            )}
          </button>

          {showPresets && (
            <div className="border-t border-white/10 divide-y divide-white/5">
              {presets.map((preset) => {
                const presetMode = TIMER_MODES.find(m => m.id === preset.type)!;
                const PresetIcon = presetMode.icon;
                return (
                  <div
                    key={preset.id}
                    className="p-4 flex items-center justify-between hover:bg-white/5 transition-all"
                  >
                    <button
                      onClick={() => loadPreset(preset)}
                      className="flex items-center gap-3 flex-1"
                      disabled={isRunning}
                    >
                      <div className={`p-2 rounded-xl bg-gradient-to-r ${presetMode.color}`}>
                        <PresetIcon className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-white">{preset.name}</p>
                        <p className="text-xs text-white/50">{presetMode.name}</p>
                      </div>
                    </button>
                    <button
                      onClick={() => toggleFavorite(preset.id)}
                      className="p-2 hover:bg-white/10 rounded-xl transition-all"
                    >
                      <Star className={`w-5 h-5 ${preset.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-white/30'}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {roundsCompleted > 0 && (
          <div className="bg-gradient-to-r from-violet-500/20 to-purple-600/20 backdrop-blur-xl rounded-3xl border border-violet-500/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-6 h-6 text-amber-400" />
              <h3 className="text-lg font-semibold text-white">Session Stats</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{roundsCompleted}</p>
                <p className="text-xs text-white/60">Rounds</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{formatTime(totalTime - timeRemaining)}</p>
                <p className="text-xs text-white/60">Elapsed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{Math.round((roundsCompleted / rounds) * 100)}%</p>
                <p className="text-xs text-white/60">Complete</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save Preset Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Save Preset</h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-all"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            <input
              type="text"
              placeholder="Preset name..."
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />

            <div className="bg-white/5 rounded-2xl p-4 space-y-2">
              <p className="text-sm text-white/60">Current Settings:</p>
              <p className="text-white">Mode: <span className="text-violet-400">{currentMode.name}</span></p>
              {(mode === 'tabata' || mode === 'emom' || mode === 'interval') && (
                <p className="text-white">Rounds: <span className="text-violet-400">{rounds}</span></p>
              )}
              {(mode === 'tabata' || mode === 'interval') && (
                <>
                  <p className="text-white">Work: <span className="text-green-400">{workDuration}s</span></p>
                  <p className="text-white">Rest: <span className="text-blue-400">{restDuration}s</span></p>
                </>
              )}
              {(mode === 'amrap' || mode === 'countdown') && (
                <p className="text-white">Duration: <span className="text-violet-400">{formatTime(totalDuration)}</span></p>
              )}
            </div>

            <button
              onClick={savePreset}
              disabled={!presetName.trim()}
              className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:from-violet-600 hover:to-purple-700"
            >
              <Save className="w-5 h-5 inline mr-2" />
              Save Preset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
