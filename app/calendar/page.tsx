'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  UtensilsCrossed,
  Plus,
  ArrowLeft,
  Loader2,
  X,
  Clock,
  Check,
  Flame,
  Target,
  Camera,
  Droplets,
  Moon,
  Smile,
  Zap,
  Scale,
  TrendingUp,
  Image,
  ClipboardCheck,
  MoreHorizontal,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  LogOut,
  Search,
  Video,
  Filter,
  List,
} from 'lucide-react';

interface CalendarData {
  events: any[];
  workouts: { scheduled: any[]; completed: any[] };
  meals: { planned: any[]; logged: any[] };
  photos: { all: any[]; byDate: Record<string, any[]> };
  dailyLogs: any[];
  checkIns: any[];
  macros: {
    byDate: Record<string, { calories: number; protein: number; carbs: number; fat: number; fiber: number; mealsLogged: number }>;
    periodTotals: any;
    periodAverages: any;
    goals: { calories: number; protein: number };
  };
  summary: any;
}

interface TimelineItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  timestamp: string;
  duration?: number;
  calories?: number;
  protein?: number;
  photoUrl?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  aiScore?: number;
  mealType?: string;
  status?: string;
  icon: string;
  color: string;
  // Daily log fields
  weight?: number;
  mood?: number;
  energyLevel?: number;
  sleepHours?: number;
  waterIntake?: number;
  notes?: string;
}

interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  timestamp: string;
  photoUrl?: string;
  thumbnailUrl?: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function isSameDay(date1: Date, date2: Date): boolean {
  return formatDate(date1) === formatDate(date2);
}

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month' | 'timeline'>('month');
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<'workout' | 'meal' | 'food' | 'photo' | 'daily'>('workout');
  const [saving, setSaving] = useState(false);

  // Timeline and Search states
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [timelineGrouped, setTimelineGrouped] = useState<Record<string, TimelineItem[]>>({});
  const [timelineFilter, setTimelineFilter] = useState<'all' | 'meals' | 'workouts' | 'photos' | 'form-checks'>('all');
  const [timelinePage, setTimelinePage] = useState(1);
  const [timelineHasMore, setTimelineHasMore] = useState(true);
  const [timelineLoading, setTimelineLoading] = useState(false);

  // Search states
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchType, setSearchType] = useState<'all' | 'meals' | 'workouts' | 'photos' | 'form-checks'>('all');

  // Form states
  const [workoutForm, setWorkoutForm] = useState({ title: '', description: '', duration: 45 });
  const [mealForm, setMealForm] = useState({ name: '', mealType: 'breakfast', targetCalories: 0, targetProtein: 0 });
  const [foodForm, setFoodForm] = useState({ mealType: 'breakfast', foodName: '', calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [dailyForm, setDailyForm] = useState({ weight: 0, mood: 3, energyLevel: 3, sleepHours: 7, sleepQuality: 3, waterIntake: 2, notes: '' });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      if (view === 'timeline') {
        fetchTimeline(1, true);
      } else {
        fetchCalendarData();
      }
    }
  }, [status, router, currentDate, view, timelineFilter]);

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      let start: Date, end: Date;

      if (view === 'day') {
        start = new Date(selectedDate);
        start.setHours(0, 0, 0, 0);
        end = new Date(selectedDate);
        end.setHours(23, 59, 59, 999);
      } else if (view === 'week') {
        start = new Date(currentDate);
        start.setDate(start.getDate() - start.getDay());
        end = new Date(start);
        end.setDate(end.getDate() + 6);
      } else {
        start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      }

      const res = await fetch(`/api/calendar?start=${formatDate(start)}&end=${formatDate(end)}&view=${view}`);
      const data = await res.json();
      setCalendarData(data);
    } catch (error) {
      console.error('Failed to fetch calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeline = async (page: number = 1, reset: boolean = false) => {
    setTimelineLoading(true);
    try {
      const res = await fetch(
        `/api/calendar/timeline?page=${page}&limit=20&filter=${timelineFilter}`
      );
      const data = await res.json();

      if (reset) {
        setTimelineItems(data.items);
        setTimelineGrouped(data.groupedByDate);
      } else {
        setTimelineItems(prev => [...prev, ...data.items]);
        setTimelineGrouped(prev => {
          const merged = { ...prev };
          Object.entries(data.groupedByDate).forEach(([date, items]) => {
            if (merged[date]) {
              merged[date] = [...merged[date], ...(items as TimelineItem[])];
            } else {
              merged[date] = items as TimelineItem[];
            }
          });
          return merged;
        });
      }

      setTimelinePage(page);
      setTimelineHasMore(data.pagination.hasMore);
    } catch (error) {
      console.error('Failed to fetch timeline:', error);
    } finally {
      setTimelineLoading(false);
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const res = await fetch(
        `/api/calendar/search?q=${encodeURIComponent(query)}&type=${searchType}`
      );
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchType]);

  const handleSave = async () => {
    setSaving(true);
    try {
      let body: any = { type: '' };

      if (addType === 'workout') {
        body = {
          type: 'scheduled_workout',
          title: workoutForm.title,
          description: workoutForm.description,
          scheduledFor: selectedDate.toISOString(),
          duration: workoutForm.duration,
        };
      } else if (addType === 'meal') {
        body = {
          type: 'meal_plan',
          name: mealForm.name,
          mealType: mealForm.mealType,
          scheduledFor: formatDate(selectedDate),
          targetCalories: mealForm.targetCalories,
          targetProtein: mealForm.targetProtein,
        };
      } else if (addType === 'food') {
        body = {
          type: 'food_log',
          mealType: foodForm.mealType,
          foodName: foodForm.foodName,
          calories: foodForm.calories,
          protein: foodForm.protein,
          carbs: foodForm.carbs,
          fat: foodForm.fat,
        };
      } else if (addType === 'daily') {
        body = {
          type: 'daily_log',
          date: formatDate(selectedDate),
          weight: dailyForm.weight || undefined,
          mood: dailyForm.mood,
          energyLevel: dailyForm.energyLevel,
          sleepHours: dailyForm.sleepHours,
          sleepQuality: dailyForm.sleepQuality,
          waterIntake: dailyForm.waterIntake,
          notes: dailyForm.notes,
        };
      }

      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setShowAddModal(false);
        fetchCalendarData();
        // Reset forms
        setWorkoutForm({ title: '', description: '', duration: 45 });
        setMealForm({ name: '', mealType: 'breakfast', targetCalories: 0, targetProtein: 0 });
        setFoodForm({ mealType: 'breakfast', foodName: '', calories: 0, protein: 0, carbs: 0, fat: 0 });
      }
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteWorkout = async (id: string, complete: boolean) => {
    try {
      await fetch('/api/calendar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'scheduled_workout',
          id,
          status: complete ? 'completed' : 'skipped',
        }),
      });
      fetchCalendarData();
    } catch (error) {
      console.error('Failed to update workout:', error);
    }
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: { date: Date; isCurrentMonth: boolean; isToday: boolean }[] = [];

    // Previous month days
    const prevMonth = new Date(year, month, 0);
    for (let i = startingDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonth.getDate() - i);
      days.push({ date, isCurrentMonth: false, isToday: isSameDay(date, today) });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month, i);
      days.push({ date, isCurrentMonth: true, isToday: isSameDay(date, today) });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, isCurrentMonth: false, isToday: isSameDay(date, today) });
    }

    return days;
  };

  const generateWeekDays = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const getDataForDate = (date: Date) => {
    if (!calendarData) return { workouts: [], meals: [], photos: [], macros: null, dailyLog: null };
    const dateKey = formatDate(date);

    return {
      workouts: calendarData.events.filter(e =>
        (e.type === 'scheduled_workout' || e.type === 'completed_workout') &&
        formatDate(new Date(e.date)) === dateKey
      ),
      meals: calendarData.meals.logged.filter(m => m.loggedAt && formatDate(new Date(m.loggedAt)) === dateKey),
      photos: calendarData.photos.byDate[dateKey] || [],
      macros: calendarData.macros.byDate[dateKey] || null,
      dailyLog: calendarData.dailyLogs.find(l => l.date === dateKey) || null,
      checkIns: calendarData.checkIns.filter(c => formatDate(new Date(c.scheduledFor)) === dateKey),
    };
  };

  const prevPeriod = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (view === 'week') {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 7);
      setCurrentDate(newDate);
    } else {
      const newDate = new Date(selectedDate);
      newDate.setDate(newDate.getDate() - 1);
      setSelectedDate(newDate);
      setCurrentDate(newDate);
    }
  };

  const nextPeriod = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (view === 'week') {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 7);
      setCurrentDate(newDate);
    } else {
      const newDate = new Date(selectedDate);
      newDate.setDate(newDate.getDate() + 1);
      setSelectedDate(newDate);
      setCurrentDate(newDate);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <p className="text-zinc-500 dark:text-zinc-400">Loading calendar...</p>
        </div>
      </div>
    );
  }

  const calendarDays = generateCalendarDays();
  const weekDays = generateWeekDays();
  const selectedDayData = getDataForDate(selectedDate);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-lg border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold">Daily Tracker</h1>
            </div>
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <button
                onClick={() => setShowSearch(true)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
              {/* View Toggle */}
              <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
                {(['day', 'week', 'month', 'timeline'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
                      view === v
                        ? 'bg-white dark:bg-zinc-700 shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <button
                onClick={goToToday}
                className="px-3 py-1.5 text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
              >
                Today
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Period Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={prevPeriod} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold">
              {view === 'day' && selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              {view === 'week' && `Week of ${weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
              {view === 'month' && `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
            </h2>
            <button onClick={nextPeriod} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Add Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setAddType('daily'); setShowAddModal(true); }}
              className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-600 dark:text-purple-400 rounded-lg text-sm font-medium transition-colors"
            >
              <ClipboardCheck className="w-4 h-4" />
              Daily Log
            </button>
            <button
              onClick={() => { setAddType('food'); setShowAddModal(true); }}
              className="flex items-center gap-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium transition-colors"
            >
              <UtensilsCrossed className="w-4 h-4" />
              Log Meal
            </button>
            <button
              onClick={() => { setAddType('workout'); setShowAddModal(true); }}
              className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium transition-colors"
            >
              <Dumbbell className="w-4 h-4" />
              Schedule
            </button>
          </div>
        </div>

        {/* Macro Summary Bar */}
        {calendarData && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-orange-500/10 to-pink-500/10 rounded-xl border border-orange-500/20">
              <div className="flex items-center gap-2 text-orange-500 mb-1">
                <Flame className="w-4 h-4" />
                <span className="text-sm font-medium">Calories</span>
              </div>
              <p className="text-2xl font-bold">{calendarData.macros.periodAverages.calories}</p>
              <p className="text-xs text-zinc-500">avg/day • Goal: {calendarData.macros.goals.calories}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20">
              <div className="flex items-center gap-2 text-blue-500 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Protein</span>
              </div>
              <p className="text-2xl font-bold">{calendarData.macros.periodAverages.protein}g</p>
              <p className="text-xs text-zinc-500">avg/day • Goal: {calendarData.macros.goals.protein}g</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20">
              <div className="flex items-center gap-2 text-yellow-600 mb-1">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">Carbs</span>
              </div>
              <p className="text-2xl font-bold">{calendarData.macros.periodAverages.carbs}g</p>
              <p className="text-xs text-zinc-500">avg/day</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
              <div className="flex items-center gap-2 text-purple-500 mb-1">
                <Droplets className="w-4 h-4" />
                <span className="text-sm font-medium">Fat</span>
              </div>
              <p className="text-2xl font-bold">{calendarData.macros.periodAverages.fat}g</p>
              <p className="text-xs text-zinc-500">avg/day</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
              <div className="flex items-center gap-2 text-green-500 mb-1">
                <Dumbbell className="w-4 h-4" />
                <span className="text-sm font-medium">Workouts</span>
              </div>
              <p className="text-2xl font-bold">{calendarData.summary.totalWorkouts}</p>
              <p className="text-xs text-zinc-500">{calendarData.summary.scheduledWorkouts} scheduled</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid / Week View / Day View */}
          <div className={view === 'day' ? 'lg:col-span-3' : 'lg:col-span-2'}>
            {view === 'month' && (
              <div className="bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                {/* Day Headers */}
                <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800">
                  {DAYS.map((day) => (
                    <div key={day} className="p-3 text-center text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7">
                  {calendarDays.map((day, idx) => {
                    const dayData = getDataForDate(day.date);
                    const hasData = dayData.workouts.length > 0 || dayData.meals.length > 0 || dayData.photos.length > 0;
                    const firstPhoto = dayData.photos[0];

                    return (
                      <button
                        key={idx}
                        onClick={() => { setSelectedDate(day.date); setView('day'); }}
                        className={`relative min-h-[80px] sm:min-h-[100px] p-2 border-b border-r border-zinc-200 dark:border-zinc-800 transition-colors overflow-hidden ${
                          !day.isCurrentMonth ? 'bg-zinc-50 dark:bg-zinc-950' : 'bg-white dark:bg-zinc-900'
                        } ${
                          isSameDay(day.date, selectedDate)
                            ? 'ring-2 ring-orange-500 ring-inset'
                            : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                        }`}
                      >
                        {/* Photo Background Thumbnail */}
                        {firstPhoto && firstPhoto.photoUrl && (
                          <div className="absolute inset-0 opacity-30">
                            <img
                              src={firstPhoto.thumbnailUrl || firstPhoto.photoUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          </div>
                        )}

                        <div className="relative z-10">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm ${
                            day.isToday
                              ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold'
                              : !day.isCurrentMonth
                                ? 'text-zinc-400 dark:text-zinc-600'
                                : firstPhoto
                                  ? 'text-white font-medium bg-black/30'
                                  : 'text-zinc-900 dark:text-zinc-100'
                          }`}>
                            {day.date.getDate()}
                          </span>

                          {/* Indicators */}
                          <div className="mt-1 flex flex-wrap gap-1">
                            {dayData.workouts.length > 0 && (
                              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-sm" />
                            )}
                            {dayData.meals.length > 0 && (
                              <span className="w-2 h-2 rounded-full bg-green-500 shadow-sm" />
                            )}
                            {dayData.photos.length > 1 && (
                              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-purple-500 text-white text-[8px] font-bold shadow-sm">
                                {dayData.photos.length}
                              </span>
                            )}
                            {dayData.photos.length === 1 && !firstPhoto?.photoUrl && (
                              <span className="w-2 h-2 rounded-full bg-purple-500 shadow-sm" />
                            )}
                            {dayData.macros && (
                              <span className="w-2 h-2 rounded-full bg-orange-500 shadow-sm" />
                            )}
                          </div>
                        </div>

                        {/* Calorie indicator */}
                        {dayData.macros && (
                          <div className="absolute bottom-1 left-1 right-1 z-10">
                            <div className="h-1 bg-zinc-200/50 dark:bg-zinc-700/50 rounded-full overflow-hidden backdrop-blur-sm">
                              <div
                                className="h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full"
                                style={{ width: `${Math.min(100, (dayData.macros.calories / (calendarData?.macros.goals.calories || 2000)) * 100)}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {view === 'week' && (
              <div className="bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="grid grid-cols-7 divide-x divide-zinc-200 dark:divide-zinc-800">
                  {weekDays.map((day, idx) => {
                    const dayData = getDataForDate(day);
                    const isToday = isSameDay(day, new Date());
                    const isSelected = isSameDay(day, selectedDate);

                    return (
                      <button
                        key={idx}
                        onClick={() => { setSelectedDate(day); setView('day'); }}
                        className={`min-h-[300px] p-3 transition-colors ${
                          isSelected ? 'bg-orange-500/10' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                        }`}
                      >
                        <div className="text-center mb-4">
                          <p className="text-sm text-zinc-500">{DAYS[idx]}</p>
                          <p className={`text-2xl font-bold ${isToday ? 'text-orange-500' : ''}`}>
                            {day.getDate()}
                          </p>
                        </div>

                        {/* Day summary */}
                        <div className="space-y-2 text-left">
                          {dayData.workouts.map((w, i) => (
                            <div key={i} className="text-xs p-1.5 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded truncate">
                              {w.title}
                            </div>
                          ))}
                          {dayData.meals.length > 0 && (
                            <div className="text-xs p-1.5 bg-green-500/20 text-green-600 dark:text-green-400 rounded">
                              {dayData.meals.length} meals
                            </div>
                          )}
                          {dayData.macros && (
                            <div className="text-xs text-zinc-500">
                              {dayData.macros.calories} kcal
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {view === 'day' && (
              <div className="space-y-6">
                {/* Daily Stats */}
                {selectedDayData.dailyLog && (
                  <div className="bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <ClipboardCheck className="w-5 h-5 text-purple-500" />
                      Daily Check-in
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedDayData.dailyLog.weight && (
                        <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl">
                          <div className="flex items-center gap-2 text-zinc-500 text-sm mb-1">
                            <Scale className="w-4 h-4" />
                            Weight
                          </div>
                          <p className="text-xl font-bold">{selectedDayData.dailyLog.weight} kg</p>
                        </div>
                      )}
                      <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl">
                        <div className="flex items-center gap-2 text-zinc-500 text-sm mb-1">
                          <Smile className="w-4 h-4" />
                          Mood
                        </div>
                        <p className="text-xl font-bold">{selectedDayData.dailyLog.mood}/5</p>
                      </div>
                      <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl">
                        <div className="flex items-center gap-2 text-zinc-500 text-sm mb-1">
                          <Moon className="w-4 h-4" />
                          Sleep
                        </div>
                        <p className="text-xl font-bold">{selectedDayData.dailyLog.sleepHours}h</p>
                      </div>
                      <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl">
                        <div className="flex items-center gap-2 text-zinc-500 text-sm mb-1">
                          <Droplets className="w-4 h-4" />
                          Water
                        </div>
                        <p className="text-xl font-bold">{selectedDayData.dailyLog.waterIntake}L</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Macros for the day */}
                {selectedDayData.macros && (
                  <div className="bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-500" />
                      Nutrition
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-sm text-zinc-500 mb-1">Calories</p>
                        <p className="text-2xl font-bold text-orange-500">{selectedDayData.macros.calories}</p>
                        <div className="mt-2 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-500 rounded-full"
                            style={{ width: `${Math.min(100, (selectedDayData.macros.calories / (calendarData?.macros.goals.calories || 2000)) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-zinc-500 mb-1">Protein</p>
                        <p className="text-2xl font-bold text-blue-500">{selectedDayData.macros.protein}g</p>
                        <div className="mt-2 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${Math.min(100, (selectedDayData.macros.protein / (calendarData?.macros.goals.protein || 150)) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-zinc-500 mb-1">Carbs</p>
                        <p className="text-2xl font-bold text-yellow-500">{selectedDayData.macros.carbs}g</p>
                      </div>
                      <div>
                        <p className="text-sm text-zinc-500 mb-1">Fat</p>
                        <p className="text-2xl font-bold text-purple-500">{selectedDayData.macros.fat}g</p>
                      </div>
                      <div>
                        <p className="text-sm text-zinc-500 mb-1">Meals</p>
                        <p className="text-2xl font-bold">{selectedDayData.macros.mealsLogged}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Workouts */}
                <div className="bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Dumbbell className="w-5 h-5 text-blue-500" />
                      Workouts
                    </h3>
                    <button
                      onClick={() => { setAddType('workout'); setShowAddModal(true); }}
                      className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  {selectedDayData.workouts.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDayData.workouts.map((workout) => (
                        <div key={workout.id} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-800 rounded-xl">
                          <div>
                            <h4 className="font-medium">{workout.title}</h4>
                            <div className="flex items-center gap-3 text-sm text-zinc-500 mt-1">
                              {workout.duration && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {workout.duration} min
                                </span>
                              )}
                              <span className={`px-2 py-0.5 rounded-full text-xs ${
                                workout.status === 'completed' ? 'bg-green-500/20 text-green-600' :
                                workout.status === 'skipped' ? 'bg-red-500/20 text-red-600' :
                                'bg-blue-500/20 text-blue-600'
                              }`}>
                                {workout.status || 'scheduled'}
                              </span>
                            </div>
                          </div>
                          {workout.type === 'scheduled_workout' && workout.status === 'scheduled' && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleCompleteWorkout(workout.id, true)}
                                className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-600 rounded-lg transition-colors"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleCompleteWorkout(workout.id, false)}
                                className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-600 rounded-lg transition-colors"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-500 text-center py-8">No workouts scheduled</p>
                  )}
                </div>

                {/* Meals */}
                <div className="bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <UtensilsCrossed className="w-5 h-5 text-green-500" />
                      Meals
                    </h3>
                    <button
                      onClick={() => { setAddType('food'); setShowAddModal(true); }}
                      className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  {selectedDayData.meals.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDayData.meals.map((meal) => (
                        <div key={meal.id} className="p-4 bg-white dark:bg-zinc-800 rounded-xl">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-600 capitalize">
                                {meal.mealType}
                              </span>
                              <h4 className="font-medium mt-1">{meal.foodName || 'Meal'}</h4>
                            </div>
                            <div className="text-right text-sm">
                              <p className="font-medium text-orange-500">{meal.calories} kcal</p>
                              <p className="text-zinc-500">{meal.protein}g protein</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-500 text-center py-8">No meals logged</p>
                  )}
                </div>

                {/* Progress Photos */}
                <div className="bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Camera className="w-5 h-5 text-purple-500" />
                      Progress Photos
                    </h3>
                    <button className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  {selectedDayData.photos.length > 0 ? (
                    <div className="grid grid-cols-3 gap-4">
                      {selectedDayData.photos.map((photo) => (
                        <div key={photo.id} className="aspect-[3/4] bg-zinc-200 dark:bg-zinc-700 rounded-xl overflow-hidden">
                          <img src={photo.photoUrl} alt={photo.type} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Image className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                      <p className="text-zinc-500">No photos for this day</p>
                      <button className="mt-4 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors">
                        Upload Photo
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timeline View */}
            {view === 'timeline' && (
              <div className="lg:col-span-3 space-y-4">
                {/* Timeline Filters */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {(['all', 'meals', 'workouts', 'photos', 'form-checks'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setTimelineFilter(f)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                        timelineFilter === f
                          ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {f === 'all' ? 'All Activity' : f.replace('-', ' ')}
                    </button>
                  ))}
                </div>

                {/* Timeline Items Grouped by Date */}
                {Object.keys(timelineGrouped).length === 0 && !timelineLoading ? (
                  <div className="text-center py-16 bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl">
                    <List className="w-12 h-12 mx-auto mb-4 text-zinc-400" />
                    <p className="text-zinc-500">No activity found</p>
                    <p className="text-sm text-zinc-400 mt-1">Start logging meals, workouts, or photos to see your timeline</p>
                  </div>
                ) : (
                  Object.entries(timelineGrouped)
                    .sort(([a], [b]) => b.localeCompare(a))
                    .map(([dateKey, items]) => (
                      <div key={dateKey} className="space-y-3">
                        {/* Date Header */}
                        <div className="sticky top-20 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-sm py-2">
                          <h3 className="text-lg font-semibold">
                            {new Date(dateKey).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </h3>
                        </div>

                        {/* Items for this date */}
                        <div className="space-y-3 ml-4 border-l-2 border-zinc-200 dark:border-zinc-800 pl-4">
                          {items.map((item) => (
                            <div
                              key={`${item.type}-${item.id}`}
                              className="bg-zinc-100 dark:bg-zinc-900/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                            >
                              <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                  item.color === 'blue' ? 'bg-blue-500/20 text-blue-500' :
                                  item.color === 'green' ? 'bg-green-500/20 text-green-500' :
                                  item.color === 'purple' ? 'bg-purple-500/20 text-purple-500' :
                                  item.color === 'pink' ? 'bg-pink-500/20 text-pink-500' :
                                  item.color === 'amber' ? 'bg-amber-500/20 text-amber-500' :
                                  item.color === 'indigo' ? 'bg-indigo-500/20 text-indigo-500' :
                                  item.color === 'red' ? 'bg-red-500/20 text-red-500' :
                                  'bg-zinc-500/20 text-zinc-500'
                                }`}>
                                  {item.icon === 'dumbbell' && <Dumbbell className="w-5 h-5" />}
                                  {item.icon === 'utensils' && <UtensilsCrossed className="w-5 h-5" />}
                                  {item.icon === 'camera' && <Camera className="w-5 h-5" />}
                                  {item.icon === 'video' && <Video className="w-5 h-5" />}
                                  {item.icon === 'clipboard' && <ClipboardCheck className="w-5 h-5" />}
                                  {item.icon === 'calendar' && <CalendarIcon className="w-5 h-5" />}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium truncate">{item.title}</h4>
                                    <span className="text-xs text-zinc-400">
                                      {new Date(item.timestamp).toLocaleTimeString('en-US', {
                                        hour: 'numeric',
                                        minute: '2-digit',
                                      })}
                                    </span>
                                  </div>

                                  {/* Type-specific content */}
                                  {item.type === 'meal' && (
                                    <div className="flex items-center gap-3 mt-1 text-sm text-zinc-500">
                                      {item.mealType && <span className="capitalize">{item.mealType}</span>}
                                      {item.calories && <span>{item.calories} kcal</span>}
                                      {item.protein && <span>{item.protein}g protein</span>}
                                    </div>
                                  )}

                                  {item.type === 'workout' && (
                                    <div className="flex items-center gap-3 mt-1 text-sm text-zinc-500">
                                      {item.duration && <span>{item.duration} min</span>}
                                      {item.calories && <span>{item.calories} kcal burned</span>}
                                    </div>
                                  )}

                                  {item.type === 'scheduled_workout' && (
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        item.status === 'completed' ? 'bg-green-500/20 text-green-600' :
                                        item.status === 'skipped' ? 'bg-red-500/20 text-red-600' :
                                        'bg-blue-500/20 text-blue-600'
                                      }`}>
                                        {item.status || 'scheduled'}
                                      </span>
                                      {item.duration && <span className="text-sm text-zinc-500">{item.duration} min</span>}
                                    </div>
                                  )}

                                  {item.type === 'form-check' && (
                                    <div className="flex items-center gap-2 mt-1">
                                      {item.aiScore && (
                                        <span className={`text-sm font-medium ${
                                          item.aiScore >= 80 ? 'text-green-500' :
                                          item.aiScore >= 60 ? 'text-yellow-500' :
                                          'text-red-500'
                                        }`}>
                                          Score: {item.aiScore}/100
                                        </span>
                                      )}
                                      {item.status && <span className="text-xs text-zinc-400 capitalize">{item.status}</span>}
                                    </div>
                                  )}

                                  {item.type === 'daily-log' && (
                                    <div className="flex items-center gap-3 mt-1 text-sm text-zinc-500">
                                      {item.weight && <span>{item.weight} kg</span>}
                                      {item.mood && <span>Mood: {item.mood}/5</span>}
                                      {item.sleepHours && <span>Sleep: {item.sleepHours}h</span>}
                                    </div>
                                  )}
                                </div>

                                {/* Photo/Video thumbnail */}
                                {(item.photoUrl || item.thumbnailUrl) && (
                                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-700 shrink-0">
                                    <img
                                      src={item.thumbnailUrl || item.photoUrl}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                )}

                {/* Load More Button */}
                {timelineHasMore && (
                  <div className="text-center py-4">
                    <button
                      onClick={() => fetchTimeline(timelinePage + 1, false)}
                      disabled={timelineLoading}
                      className="px-6 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {timelineLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                      ) : (
                        'Load More'
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar (visible in month/week view) */}
          {(view === 'month' || view === 'week') && (
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Selected Day Preview */}
                <div className="bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </h3>
                      {isSameDay(selectedDate, new Date()) && (
                        <span className="text-sm text-orange-500">Today</span>
                      )}
                    </div>
                    <button
                      onClick={() => setView('day')}
                      className="text-sm text-orange-500 hover:text-orange-600"
                    >
                      View Day
                    </button>
                  </div>

                  {/* Quick summary */}
                  {selectedDayData.macros && (
                    <div className="mb-4 p-3 bg-white dark:bg-zinc-800 rounded-xl">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500">Calories</span>
                        <span className="font-medium">{selectedDayData.macros.calories} / {calendarData?.macros.goals.calories}</span>
                      </div>
                      <div className="mt-2 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full"
                          style={{ width: `${Math.min(100, (selectedDayData.macros.calories / (calendarData?.macros.goals.calories || 2000)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Quick actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { setAddType('food'); setShowAddModal(true); }}
                      className="p-3 bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 rounded-xl text-sm font-medium transition-colors"
                    >
                      <UtensilsCrossed className="w-5 h-5 mx-auto mb-1" />
                      Log Meal
                    </button>
                    <button
                      onClick={() => { setAddType('workout'); setShowAddModal(true); }}
                      className="p-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl text-sm font-medium transition-colors"
                    >
                      <Dumbbell className="w-5 h-5 mx-auto mb-1" />
                      Workout
                    </button>
                    <button
                      onClick={() => { setAddType('daily'); setShowAddModal(true); }}
                      className="p-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl text-sm font-medium transition-colors"
                    >
                      <ClipboardCheck className="w-5 h-5 mx-auto mb-1" />
                      Daily Log
                    </button>
                    <button className="p-3 bg-pink-500/10 hover:bg-pink-500/20 text-pink-600 dark:text-pink-400 rounded-xl text-sm font-medium transition-colors">
                      <Camera className="w-5 h-5 mx-auto mb-1" />
                      Photo
                    </button>
                  </div>
                </div>

                {/* Period Stats */}
                {calendarData && (
                  <div className="bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      {view === 'week' ? 'This Week' : 'This Month'}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Days tracked</span>
                        <span className="font-medium">{calendarData.summary.daysWithData} / {calendarData.summary.totalDays}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Workouts</span>
                        <span className="font-medium">{calendarData.summary.totalWorkouts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Meals logged</span>
                        <span className="font-medium">{calendarData.summary.totalMeals}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Photos</span>
                        <span className="font-medium">{calendarData.summary.totalPhotos}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm p-4 pt-20">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            {/* Search Header */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search meals, workouts, photos..."
                  className="flex-1 bg-transparent text-lg focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={() => { setShowSearch(false); setSearchQuery(''); setSearchResults([]); }}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Type Filters */}
              <div className="flex flex-wrap gap-2 mt-3">
                {(['all', 'meals', 'workouts', 'photos', 'form-checks'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setSearchType(t)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors capitalize ${
                      searchType === t
                        ? 'bg-orange-500 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {t === 'all' ? 'All' : t.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {searchLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                </div>
              ) : searchQuery.length < 2 ? (
                <div className="text-center py-12 text-zinc-500">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Start typing to search your history</p>
                  <p className="text-sm text-zinc-400 mt-1">Search for meals, workouts, photos, and more</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  <p>No results found for "{searchQuery}"</p>
                  <p className="text-sm text-zinc-400 mt-1">Try different keywords or filters</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {searchResults.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => {
                        const date = new Date(result.timestamp);
                        setSelectedDate(date);
                        setCurrentDate(date);
                        setView('day');
                        setShowSearch(false);
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                      className="w-full p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-left flex items-center gap-4"
                    >
                      {/* Thumbnail */}
                      {result.thumbnailUrl || result.photoUrl ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-700 shrink-0">
                          <img
                            src={result.thumbnailUrl || result.photoUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                          result.type === 'workout' ? 'bg-blue-500/20 text-blue-500' :
                          result.type === 'meal' ? 'bg-green-500/20 text-green-500' :
                          result.type === 'photo' ? 'bg-purple-500/20 text-purple-500' :
                          result.type === 'form-check' ? 'bg-pink-500/20 text-pink-500' :
                          'bg-zinc-500/20 text-zinc-500'
                        }`}>
                          {result.type === 'workout' && <Dumbbell className="w-5 h-5" />}
                          {result.type === 'meal' && <UtensilsCrossed className="w-5 h-5" />}
                          {result.type === 'photo' && <Camera className="w-5 h-5" />}
                          {result.type === 'form-check' && <Video className="w-5 h-5" />}
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{result.title}</p>
                        <div className="flex items-center gap-2 text-sm text-zinc-500">
                          <span className="capitalize">{result.type.replace('-', ' ')}</span>
                          <span>•</span>
                          <span>
                            {new Date(result.timestamp).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        {result.subtitle && (
                          <p className="text-sm text-zinc-400 truncate mt-0.5">{result.subtitle}</p>
                        )}
                      </div>

                      <ChevronRight className="w-5 h-5 text-zinc-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">
                {addType === 'workout' && 'Schedule Workout'}
                {addType === 'meal' && 'Plan Meal'}
                {addType === 'food' && 'Log Meal'}
                {addType === 'daily' && 'Daily Check-in'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Date Display */}
              <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                <p className="text-sm text-zinc-500">Date</p>
                <p className="font-medium">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>

              {/* Workout Form */}
              {addType === 'workout' && (
                <>
                  <div>
                    <label className="block text-sm text-zinc-500 mb-1">Workout Title *</label>
                    <input
                      type="text"
                      value={workoutForm.title}
                      onChange={(e) => setWorkoutForm({ ...workoutForm, title: e.target.value })}
                      placeholder="e.g., Morning HIIT"
                      className="w-full p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-500 mb-1">Duration (minutes)</label>
                    <input
                      type="number"
                      value={workoutForm.duration}
                      onChange={(e) => setWorkoutForm({ ...workoutForm, duration: parseInt(e.target.value) || 0 })}
                      className="w-full p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-500 mb-1">Notes</label>
                    <textarea
                      value={workoutForm.description}
                      onChange={(e) => setWorkoutForm({ ...workoutForm, description: e.target.value })}
                      placeholder="Optional notes..."
                      className="w-full p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:border-orange-500 resize-none"
                      rows={3}
                    />
                  </div>
                </>
              )}

              {/* Food Log Form */}
              {addType === 'food' && (
                <>
                  <div>
                    <label className="block text-sm text-zinc-500 mb-1">Meal Type</label>
                    <select
                      value={foodForm.mealType}
                      onChange={(e) => setFoodForm({ ...foodForm, mealType: e.target.value })}
                      className="w-full p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:border-orange-500"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snack">Snack</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-500 mb-1">Food Name</label>
                    <input
                      type="text"
                      value={foodForm.foodName}
                      onChange={(e) => setFoodForm({ ...foodForm, foodName: e.target.value })}
                      placeholder="e.g., Grilled Chicken Salad"
                      className="w-full p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-zinc-500 mb-1">Calories</label>
                      <input
                        type="number"
                        value={foodForm.calories || ''}
                        onChange={(e) => setFoodForm({ ...foodForm, calories: parseInt(e.target.value) || 0 })}
                        placeholder="500"
                        className="w-full p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-500 mb-1">Protein (g)</label>
                      <input
                        type="number"
                        value={foodForm.protein || ''}
                        onChange={(e) => setFoodForm({ ...foodForm, protein: parseInt(e.target.value) || 0 })}
                        placeholder="30"
                        className="w-full p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-500 mb-1">Carbs (g)</label>
                      <input
                        type="number"
                        value={foodForm.carbs || ''}
                        onChange={(e) => setFoodForm({ ...foodForm, carbs: parseInt(e.target.value) || 0 })}
                        placeholder="40"
                        className="w-full p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-500 mb-1">Fat (g)</label>
                      <input
                        type="number"
                        value={foodForm.fat || ''}
                        onChange={(e) => setFoodForm({ ...foodForm, fat: parseInt(e.target.value) || 0 })}
                        placeholder="15"
                        className="w-full p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Daily Log Form */}
              {addType === 'daily' && (
                <>
                  <div>
                    <label className="block text-sm text-zinc-500 mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={dailyForm.weight || ''}
                      onChange={(e) => setDailyForm({ ...dailyForm, weight: parseFloat(e.target.value) || 0 })}
                      placeholder="75.5"
                      className="w-full p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-zinc-500 mb-1">Mood (1-5)</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            onClick={() => setDailyForm({ ...dailyForm, mood: n })}
                            className={`flex-1 p-2 rounded-lg transition-colors ${
                              dailyForm.mood === n
                                ? 'bg-orange-500 text-white'
                                : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-500 mb-1">Energy (1-5)</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            onClick={() => setDailyForm({ ...dailyForm, energyLevel: n })}
                            className={`flex-1 p-2 rounded-lg transition-colors ${
                              dailyForm.energyLevel === n
                                ? 'bg-orange-500 text-white'
                                : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-zinc-500 mb-1">Sleep (hours)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={dailyForm.sleepHours}
                        onChange={(e) => setDailyForm({ ...dailyForm, sleepHours: parseFloat(e.target.value) || 0 })}
                        className="w-full p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-500 mb-1">Water (L)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={dailyForm.waterIntake}
                        onChange={(e) => setDailyForm({ ...dailyForm, waterIntake: parseFloat(e.target.value) || 0 })}
                        className="w-full p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-500 mb-1">Notes</label>
                    <textarea
                      value={dailyForm.notes}
                      onChange={(e) => setDailyForm({ ...dailyForm, notes: e.target.value })}
                      placeholder="How are you feeling today?"
                      className="w-full p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:border-orange-500 resize-none"
                      rows={3}
                    />
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 p-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 p-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
