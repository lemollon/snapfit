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
  Sparkles,
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

  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [timelineGrouped, setTimelineGrouped] = useState<Record<string, TimelineItem[]>>({});
  const [timelineFilter, setTimelineFilter] = useState<'all' | 'meals' | 'workouts' | 'photos' | 'form-checks'>('all');
  const [timelinePage, setTimelinePage] = useState(1);
  const [timelineHasMore, setTimelineHasMore] = useState(true);
  const [timelineLoading, setTimelineLoading] = useState(false);

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchType, setSearchType] = useState<'all' | 'meals' | 'workouts' | 'photos' | 'form-checks'>('all');

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

    const prevMonth = new Date(year, month, 0);
    for (let i = startingDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonth.getDate() - i);
      days.push({ date, isCurrentMonth: false, isToday: isSameDay(date, today) });
    }

    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month, i);
      days.push({ date, isCurrentMonth: true, isToday: isSameDay(date, today) });
    }

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
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="flex flex-col items-center gap-4 relative z-10">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <p className="text-zinc-400">Loading calendar...</p>
        </div>
      </div>
    );
  }

  const calendarDays = generateCalendarDays();
  const weekDays = generateWeekDays();
  const selectedDayData = getDataForDate(selectedDate);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 -left-1/4 w-[800px] h-[800px] bg-gradient-to-r from-orange-500/15 to-pink-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-1/4 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/15 to-violet-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-1/4 left-1/3 w-[700px] h-[700px] bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl blur-lg opacity-50" />
                  <div className="relative w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">Daily Tracker</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSearch(true)}
                className="p-2.5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
              <div className="flex bg-white/5 backdrop-blur-sm rounded-xl p-1 border border-white/10">
                {(['day', 'week', 'month', 'timeline'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all capitalize ${
                      view === v
                        ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <button
                onClick={goToToday}
                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-orange-500 to-pink-500 hover:shadow-lg hover:shadow-orange-500/25 text-white rounded-xl transition-all"
              >
                Today
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 relative z-10">
        {/* Period Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={prevPeriod} className="p-2.5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold">
              {view === 'day' && selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              {view === 'week' && `Week of ${weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
              {view === 'month' && `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
              {view === 'timeline' && 'Activity Timeline'}
            </h2>
            <button onClick={nextPeriod} className="p-2.5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Add Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setAddType('daily'); setShowAddModal(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-xl text-sm font-medium transition-colors border border-purple-500/20"
            >
              <ClipboardCheck className="w-4 h-4" />
              Daily Log
            </button>
            <button
              onClick={() => { setAddType('food'); setShowAddModal(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl text-sm font-medium transition-colors border border-green-500/20"
            >
              <UtensilsCrossed className="w-4 h-4" />
              Log Meal
            </button>
            <button
              onClick={() => { setAddType('workout'); setShowAddModal(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl text-sm font-medium transition-colors border border-blue-500/20"
            >
              <Dumbbell className="w-4 h-4" />
              Schedule
            </button>
          </div>
        </div>

        {/* Macro Summary Bar */}
        {calendarData && view !== 'timeline' && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {[
              { icon: Flame, label: 'Calories', value: calendarData.macros.periodAverages.calories, goal: calendarData.macros.goals.calories, unit: '', color: 'from-orange-500 to-pink-500' },
              { icon: TrendingUp, label: 'Protein', value: calendarData.macros.periodAverages.protein, goal: calendarData.macros.goals.protein, unit: 'g', color: 'from-blue-500 to-cyan-500' },
              { icon: Zap, label: 'Carbs', value: calendarData.macros.periodAverages.carbs, goal: null, unit: 'g', color: 'from-yellow-500 to-orange-500' },
              { icon: Droplets, label: 'Fat', value: calendarData.macros.periodAverages.fat, goal: null, unit: 'g', color: 'from-purple-500 to-pink-500' },
              { icon: Dumbbell, label: 'Workouts', value: calendarData.summary.totalWorkouts, goal: calendarData.summary.scheduledWorkouts, unit: '', color: 'from-green-500 to-emerald-500' },
            ].map((item, idx) => (
              <div key={idx} className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity`} />
                <div className="relative p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/20 transition-all">
                  <div className={`flex items-center gap-2 mb-2`}>
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                      <item.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-white/70">{item.label}</span>
                  </div>
                  <p className="text-2xl font-bold">{item.value}{item.unit}</p>
                  <p className="text-xs text-zinc-500">{item.goal ? `avg/day | Goal: ${item.goal}${item.unit}` : 'avg/day'}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid / Week View / Day View */}
          <div className={view === 'day' || view === 'timeline' ? 'lg:col-span-3' : 'lg:col-span-2'}>
            {view === 'month' && (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                {/* Day Headers */}
                <div className="grid grid-cols-7 border-b border-white/10">
                  {DAYS.map((day) => (
                    <div key={day} className="p-3 text-center text-sm font-medium text-zinc-400">
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
                        className={`relative min-h-[80px] sm:min-h-[100px] p-2 border-b border-r border-white/5 transition-colors overflow-hidden ${
                          !day.isCurrentMonth ? 'bg-white/[0.02]' : 'bg-transparent'
                        } ${
                          isSameDay(day.date, selectedDate)
                            ? 'ring-2 ring-orange-500 ring-inset bg-orange-500/10'
                            : 'hover:bg-white/5'
                        }`}
                      >
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
                              ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold shadow-lg'
                              : !day.isCurrentMonth
                                ? 'text-zinc-600'
                                : firstPhoto
                                  ? 'text-white font-medium bg-black/30'
                                  : 'text-zinc-100'
                          }`}>
                            {day.date.getDate()}
                          </span>

                          <div className="mt-1 flex flex-wrap gap-1">
                            {dayData.workouts.length > 0 && (
                              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
                            )}
                            {dayData.meals.length > 0 && (
                              <span className="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-500/50" />
                            )}
                            {dayData.photos.length > 1 && (
                              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-purple-500 text-white text-[8px] font-bold shadow-sm">
                                {dayData.photos.length}
                              </span>
                            )}
                            {dayData.photos.length === 1 && !firstPhoto?.photoUrl && (
                              <span className="w-2 h-2 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50" />
                            )}
                            {dayData.macros && (
                              <span className="w-2 h-2 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50" />
                            )}
                          </div>
                        </div>

                        {dayData.macros && (
                          <div className="absolute bottom-1 left-1 right-1 z-10">
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
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
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                <div className="grid grid-cols-7 divide-x divide-white/5">
                  {weekDays.map((day, idx) => {
                    const dayData = getDataForDate(day);
                    const isToday = isSameDay(day, new Date());
                    const isSelected = isSameDay(day, selectedDate);

                    return (
                      <button
                        key={idx}
                        onClick={() => { setSelectedDate(day); setView('day'); }}
                        className={`min-h-[300px] p-3 transition-colors ${
                          isSelected ? 'bg-orange-500/10' : 'hover:bg-white/5'
                        }`}
                      >
                        <div className="text-center mb-4">
                          <p className="text-sm text-zinc-500">{DAYS[idx]}</p>
                          <p className={`text-2xl font-bold ${isToday ? 'text-orange-500' : ''}`}>
                            {day.getDate()}
                          </p>
                        </div>

                        <div className="space-y-2 text-left">
                          {dayData.workouts.map((w, i) => (
                            <div key={i} className="text-xs p-2 bg-blue-500/20 text-blue-400 rounded-lg truncate border border-blue-500/20">
                              {w.title}
                            </div>
                          ))}
                          {dayData.meals.length > 0 && (
                            <div className="text-xs p-2 bg-green-500/20 text-green-400 rounded-lg border border-green-500/20">
                              {dayData.meals.length} meals
                            </div>
                          )}
                          {dayData.macros && (
                            <div className="text-xs text-zinc-400">
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
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <ClipboardCheck className="w-5 h-5 text-purple-400" />
                        Daily Check-in
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {selectedDayData.dailyLog.weight && (
                          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                            <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
                              <Scale className="w-4 h-4" />
                              Weight
                            </div>
                            <p className="text-xl font-bold">{selectedDayData.dailyLog.weight} kg</p>
                          </div>
                        )}
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                          <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
                            <Smile className="w-4 h-4" />
                            Mood
                          </div>
                          <p className="text-xl font-bold">{selectedDayData.dailyLog.mood}/5</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                          <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
                            <Moon className="w-4 h-4" />
                            Sleep
                          </div>
                          <p className="text-xl font-bold">{selectedDayData.dailyLog.sleepHours}h</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                          <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
                            <Droplets className="w-4 h-4" />
                            Water
                          </div>
                          <p className="text-xl font-bold">{selectedDayData.dailyLog.waterIntake}L</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Macros for the day */}
                {selectedDayData.macros && (
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Flame className="w-5 h-5 text-orange-400" />
                        Nutrition
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                          <p className="text-sm text-zinc-400 mb-1">Calories</p>
                          <p className="text-2xl font-bold text-orange-400">{selectedDayData.macros.calories}</p>
                          <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full"
                              style={{ width: `${Math.min(100, (selectedDayData.macros.calories / (calendarData?.macros.goals.calories || 2000)) * 100)}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-zinc-400 mb-1">Protein</p>
                          <p className="text-2xl font-bold text-blue-400">{selectedDayData.macros.protein}g</p>
                          <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                              style={{ width: `${Math.min(100, (selectedDayData.macros.protein / (calendarData?.macros.goals.protein || 150)) * 100)}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-zinc-400 mb-1">Carbs</p>
                          <p className="text-2xl font-bold text-yellow-400">{selectedDayData.macros.carbs}g</p>
                        </div>
                        <div>
                          <p className="text-sm text-zinc-400 mb-1">Fat</p>
                          <p className="text-2xl font-bold text-purple-400">{selectedDayData.macros.fat}g</p>
                        </div>
                        <div>
                          <p className="text-sm text-zinc-400 mb-1">Meals</p>
                          <p className="text-2xl font-bold">{selectedDayData.macros.mealsLogged}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Workouts */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Dumbbell className="w-5 h-5 text-blue-400" />
                      Workouts
                    </h3>
                    <button
                      onClick={() => { setAddType('workout'); setShowAddModal(true); }}
                      className="p-2 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  {selectedDayData.workouts.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDayData.workouts.map((workout) => (
                        <div key={workout.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                          <div>
                            <h4 className="font-medium">{workout.title}</h4>
                            <div className="flex items-center gap-3 text-sm text-zinc-400 mt-1">
                              {workout.duration && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {workout.duration} min
                                </span>
                              )}
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                workout.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/20' :
                                workout.status === 'skipped' ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                                'bg-blue-500/20 text-blue-400 border border-blue-500/20'
                              }`}>
                                {workout.status || 'scheduled'}
                              </span>
                            </div>
                          </div>
                          {workout.type === 'scheduled_workout' && workout.status === 'scheduled' && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleCompleteWorkout(workout.id, true)}
                                className="p-2.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl transition-colors"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleCompleteWorkout(workout.id, false)}
                                className="p-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-colors"
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
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <UtensilsCrossed className="w-5 h-5 text-green-400" />
                      Meals
                    </h3>
                    <button
                      onClick={() => { setAddType('food'); setShowAddModal(true); }}
                      className="p-2 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  {selectedDayData.meals.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDayData.meals.map((meal) => (
                        <div key={meal.id} className="p-4 bg-white/5 rounded-xl border border-white/5">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 capitalize border border-green-500/20">
                                {meal.mealType}
                              </span>
                              <h4 className="font-medium mt-1">{meal.foodName || 'Meal'}</h4>
                            </div>
                            <div className="text-right text-sm">
                              <p className="font-medium text-orange-400">{meal.calories} kcal</p>
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
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Camera className="w-5 h-5 text-purple-400" />
                      Progress Photos
                    </h3>
                    <button
                      onClick={() => router.push('/body/photos')}
                      className="p-2 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  {selectedDayData.photos.length > 0 ? (
                    <div className="grid grid-cols-3 gap-4">
                      {selectedDayData.photos.map((photo) => (
                        <div key={photo.id} className="aspect-[3/4] bg-zinc-800 rounded-xl overflow-hidden border border-white/10">
                          <img src={photo.photoUrl} alt={photo.type} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Image className="w-12 h-12 text-zinc-600 mx-auto mb-2" />
                      <p className="text-zinc-500">No photos for this day</p>
                      <button
                        onClick={() => router.push('/body/photos')}
                        className="mt-4 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/25 text-white rounded-xl transition-all font-medium"
                      >
                        Upload Photo
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timeline View */}
            {view === 'timeline' && (
              <div className="space-y-4">
                {/* Timeline Filters */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {(['all', 'meals', 'workouts', 'photos', 'form-checks'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setTimelineFilter(f)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all capitalize ${
                        timelineFilter === f
                          ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                          : 'bg-white/5 text-zinc-400 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      {f === 'all' ? 'All Activity' : f.replace('-', ' ')}
                    </button>
                  ))}
                </div>

                {Object.keys(timelineGrouped).length === 0 && !timelineLoading ? (
                  <div className="text-center py-16 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                    <List className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
                    <p className="text-zinc-400">No activity found</p>
                    <p className="text-sm text-zinc-500 mt-1">Start logging meals, workouts, or photos to see your timeline</p>
                  </div>
                ) : (
                  Object.entries(timelineGrouped)
                    .sort(([a], [b]) => b.localeCompare(a))
                    .map(([dateKey, items]) => (
                      <div key={dateKey} className="space-y-3">
                        <div className="sticky top-20 z-10 bg-black/80 backdrop-blur-sm py-2">
                          <h3 className="text-lg font-semibold">
                            {new Date(dateKey).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </h3>
                        </div>

                        <div className="space-y-3 ml-4 border-l-2 border-white/10 pl-4">
                          {items.map((item) => (
                            <div
                              key={`${item.type}-${item.id}`}
                              className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-colors"
                            >
                              <div className="flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                  item.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                                  item.color === 'green' ? 'bg-green-500/20 text-green-400' :
                                  item.color === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                                  item.color === 'pink' ? 'bg-pink-500/20 text-pink-400' :
                                  item.color === 'amber' ? 'bg-amber-500/20 text-amber-400' :
                                  item.color === 'indigo' ? 'bg-indigo-500/20 text-indigo-400' :
                                  item.color === 'red' ? 'bg-red-500/20 text-red-400' :
                                  'bg-zinc-500/20 text-zinc-400'
                                }`}>
                                  {item.icon === 'dumbbell' && <Dumbbell className="w-5 h-5" />}
                                  {item.icon === 'utensils' && <UtensilsCrossed className="w-5 h-5" />}
                                  {item.icon === 'camera' && <Camera className="w-5 h-5" />}
                                  {item.icon === 'video' && <Video className="w-5 h-5" />}
                                  {item.icon === 'clipboard' && <ClipboardCheck className="w-5 h-5" />}
                                  {item.icon === 'calendar' && <CalendarIcon className="w-5 h-5" />}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium truncate">{item.title}</h4>
                                    <span className="text-xs text-zinc-500">
                                      {new Date(item.timestamp).toLocaleTimeString('en-US', {
                                        hour: 'numeric',
                                        minute: '2-digit',
                                      })}
                                    </span>
                                  </div>

                                  {item.type === 'meal' && (
                                    <div className="flex items-center gap-3 mt-1 text-sm text-zinc-400">
                                      {item.mealType && <span className="capitalize">{item.mealType}</span>}
                                      {item.calories && <span>{item.calories} kcal</span>}
                                      {item.protein && <span>{item.protein}g protein</span>}
                                    </div>
                                  )}

                                  {item.type === 'workout' && (
                                    <div className="flex items-center gap-3 mt-1 text-sm text-zinc-400">
                                      {item.duration && <span>{item.duration} min</span>}
                                      {item.calories && <span>{item.calories} kcal burned</span>}
                                    </div>
                                  )}

                                  {item.type === 'scheduled_workout' && (
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        item.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                        item.status === 'skipped' ? 'bg-red-500/20 text-red-400' :
                                        'bg-blue-500/20 text-blue-400'
                                      }`}>
                                        {item.status || 'scheduled'}
                                      </span>
                                      {item.duration && <span className="text-sm text-zinc-400">{item.duration} min</span>}
                                    </div>
                                  )}

                                  {item.type === 'form-check' && (
                                    <div className="flex items-center gap-2 mt-1">
                                      {item.aiScore && (
                                        <span className={`text-sm font-medium ${
                                          item.aiScore >= 80 ? 'text-green-400' :
                                          item.aiScore >= 60 ? 'text-yellow-400' :
                                          'text-red-400'
                                        }`}>
                                          Score: {item.aiScore}/100
                                        </span>
                                      )}
                                      {item.status && <span className="text-xs text-zinc-500 capitalize">{item.status}</span>}
                                    </div>
                                  )}

                                  {item.type === 'daily-log' && (
                                    <div className="flex items-center gap-3 mt-1 text-sm text-zinc-400">
                                      {item.weight && <span>{item.weight} kg</span>}
                                      {item.mood && <span>Mood: {item.mood}/5</span>}
                                      {item.sleepHours && <span>Sleep: {item.sleepHours}h</span>}
                                    </div>
                                  )}
                                </div>

                                {(item.photoUrl || item.thumbnailUrl) && (
                                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-800 shrink-0 border border-white/10">
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

                {timelineHasMore && (
                  <div className="text-center py-4">
                    <button
                      onClick={() => fetchTimeline(timelinePage + 1, false)}
                      disabled={timelineLoading}
                      className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-medium transition-colors disabled:opacity-50 border border-white/10"
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
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </h3>
                      {isSameDay(selectedDate, new Date()) && (
                        <span className="text-sm text-orange-400">Today</span>
                      )}
                    </div>
                    <button
                      onClick={() => setView('day')}
                      className="text-sm text-orange-400 hover:text-orange-300"
                    >
                      View Day
                    </button>
                  </div>

                  {selectedDayData.macros && (
                    <div className="mb-4 p-3 bg-white/5 rounded-xl border border-white/5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-400">Calories</span>
                        <span className="font-medium">{selectedDayData.macros.calories} / {calendarData?.macros.goals.calories}</span>
                      </div>
                      <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full"
                          style={{ width: `${Math.min(100, (selectedDayData.macros.calories / (calendarData?.macros.goals.calories || 2000)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { setAddType('food'); setShowAddModal(true); }}
                      className="p-3 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-xl text-sm font-medium transition-colors border border-green-500/20"
                    >
                      <UtensilsCrossed className="w-5 h-5 mx-auto mb-1" />
                      Log Meal
                    </button>
                    <button
                      onClick={() => { setAddType('workout'); setShowAddModal(true); }}
                      className="p-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl text-sm font-medium transition-colors border border-blue-500/20"
                    >
                      <Dumbbell className="w-5 h-5 mx-auto mb-1" />
                      Workout
                    </button>
                    <button
                      onClick={() => { setAddType('daily'); setShowAddModal(true); }}
                      className="p-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-xl text-sm font-medium transition-colors border border-purple-500/20"
                    >
                      <ClipboardCheck className="w-5 h-5 mx-auto mb-1" />
                      Daily Log
                    </button>
                    <button className="p-3 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 rounded-xl text-sm font-medium transition-colors border border-pink-500/20">
                      <Camera className="w-5 h-5 mx-auto mb-1" />
                      Photo
                    </button>
                  </div>
                </div>

                {/* Period Stats */}
                {calendarData && (
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-orange-400" />
                      {view === 'week' ? 'This Week' : 'This Month'}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Days tracked</span>
                        <span className="font-medium">{calendarData.summary.daysWithData} / {calendarData.summary.totalDays}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Workouts</span>
                        <span className="font-medium">{calendarData.summary.totalWorkouts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Meals logged</span>
                        <span className="font-medium">{calendarData.summary.totalMeals}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Photos</span>
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
          <div className="relative w-full max-w-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-2xl blur-xl" />
            <div className="relative bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-4 border-b border-white/10">
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
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {(['all', 'meals', 'workouts', 'photos', 'form-checks'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setSearchType(t)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                        searchType === t
                          ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                          : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                      }`}
                    >
                      {t === 'all' ? 'All' : t.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="max-h-[60vh] overflow-y-auto">
                {searchLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                  </div>
                ) : searchQuery.length < 2 ? (
                  <div className="text-center py-12 text-zinc-400">
                    <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Start typing to search your history</p>
                    <p className="text-sm text-zinc-500 mt-1">Search for meals, workouts, photos, and more</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-12 text-zinc-400">
                    <p>No results found for "{searchQuery}"</p>
                    <p className="text-sm text-zinc-500 mt-1">Try different keywords or filters</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
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
                        className="w-full p-4 hover:bg-white/5 transition-colors text-left flex items-center gap-4"
                      >
                        {result.thumbnailUrl || result.photoUrl ? (
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 shrink-0 border border-white/10">
                            <img
                              src={result.thumbnailUrl || result.photoUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                            result.type === 'workout' ? 'bg-blue-500/20 text-blue-400' :
                            result.type === 'meal' ? 'bg-green-500/20 text-green-400' :
                            result.type === 'photo' ? 'bg-purple-500/20 text-purple-400' :
                            result.type === 'form-check' ? 'bg-pink-500/20 text-pink-400' :
                            'bg-zinc-500/20 text-zinc-400'
                          }`}>
                            {result.type === 'workout' && <Dumbbell className="w-5 h-5" />}
                            {result.type === 'meal' && <UtensilsCrossed className="w-5 h-5" />}
                            {result.type === 'photo' && <Camera className="w-5 h-5" />}
                            {result.type === 'form-check' && <Video className="w-5 h-5" />}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{result.title}</p>
                          <div className="flex items-center gap-2 text-sm text-zinc-500">
                            <span className="capitalize">{result.type.replace('-', ' ')}</span>
                            <span>-</span>
                            <span>
                              {new Date(result.timestamp).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          {result.subtitle && (
                            <p className="text-sm text-zinc-500 truncate mt-0.5">{result.subtitle}</p>
                          )}
                        </div>

                        <ChevronRight className="w-5 h-5 text-zinc-500" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-2xl blur-xl" />
            <div className="relative bg-zinc-900 rounded-2xl border border-white/10 p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">
                  {addType === 'workout' && 'Schedule Workout'}
                  {addType === 'meal' && 'Plan Meal'}
                  {addType === 'food' && 'Log Meal'}
                  {addType === 'daily' && 'Daily Check-in'}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-sm text-zinc-400">Date</p>
                  <p className="font-medium">
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                </div>

                {addType === 'workout' && (
                  <>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">Workout Title *</label>
                      <input
                        type="text"
                        value={workoutForm.title}
                        onChange={(e) => setWorkoutForm({ ...workoutForm, title: e.target.value })}
                        placeholder="e.g., Morning HIIT"
                        className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">Duration (minutes)</label>
                      <input
                        type="number"
                        value={workoutForm.duration}
                        onChange={(e) => setWorkoutForm({ ...workoutForm, duration: parseInt(e.target.value) || 0 })}
                        className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">Notes</label>
                      <textarea
                        value={workoutForm.description}
                        onChange={(e) => setWorkoutForm({ ...workoutForm, description: e.target.value })}
                        placeholder="Optional notes..."
                        className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-all"
                        rows={3}
                      />
                    </div>
                  </>
                )}

                {addType === 'food' && (
                  <>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">Meal Type</label>
                      <select
                        value={foodForm.mealType}
                        onChange={(e) => setFoodForm({ ...foodForm, mealType: e.target.value })}
                        className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      >
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                        <option value="snack">Snack</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">Food Name</label>
                      <input
                        type="text"
                        value={foodForm.foodName}
                        onChange={(e) => setFoodForm({ ...foodForm, foodName: e.target.value })}
                        placeholder="e.g., Grilled Chicken Salad"
                        className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-zinc-400 mb-2">Calories</label>
                        <input
                          type="number"
                          value={foodForm.calories || ''}
                          onChange={(e) => setFoodForm({ ...foodForm, calories: parseInt(e.target.value) || 0 })}
                          placeholder="500"
                          className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-zinc-400 mb-2">Protein (g)</label>
                        <input
                          type="number"
                          value={foodForm.protein || ''}
                          onChange={(e) => setFoodForm({ ...foodForm, protein: parseInt(e.target.value) || 0 })}
                          placeholder="30"
                          className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-zinc-400 mb-2">Carbs (g)</label>
                        <input
                          type="number"
                          value={foodForm.carbs || ''}
                          onChange={(e) => setFoodForm({ ...foodForm, carbs: parseInt(e.target.value) || 0 })}
                          placeholder="40"
                          className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-zinc-400 mb-2">Fat (g)</label>
                        <input
                          type="number"
                          value={foodForm.fat || ''}
                          onChange={(e) => setFoodForm({ ...foodForm, fat: parseInt(e.target.value) || 0 })}
                          placeholder="15"
                          className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </>
                )}

                {addType === 'daily' && (
                  <>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">Weight (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={dailyForm.weight || ''}
                        onChange={(e) => setDailyForm({ ...dailyForm, weight: parseFloat(e.target.value) || 0 })}
                        placeholder="75.5"
                        className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-zinc-400 mb-2">Mood (1-5)</label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n}
                              onClick={() => setDailyForm({ ...dailyForm, mood: n })}
                              className={`flex-1 p-2.5 rounded-lg transition-all ${
                                dailyForm.mood === n
                                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                                  : 'bg-white/5 hover:bg-white/10'
                              }`}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-zinc-400 mb-2">Energy (1-5)</label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n}
                              onClick={() => setDailyForm({ ...dailyForm, energyLevel: n })}
                              className={`flex-1 p-2.5 rounded-lg transition-all ${
                                dailyForm.energyLevel === n
                                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                                  : 'bg-white/5 hover:bg-white/10'
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
                        <label className="block text-sm text-zinc-400 mb-2">Sleep (hours)</label>
                        <input
                          type="number"
                          step="0.5"
                          value={dailyForm.sleepHours}
                          onChange={(e) => setDailyForm({ ...dailyForm, sleepHours: parseFloat(e.target.value) || 0 })}
                          className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-zinc-400 mb-2">Water (L)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={dailyForm.waterIntake}
                          onChange={(e) => setDailyForm({ ...dailyForm, waterIntake: parseFloat(e.target.value) || 0 })}
                          className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">Notes</label>
                      <textarea
                        value={dailyForm.notes}
                        onChange={(e) => setDailyForm({ ...dailyForm, notes: e.target.value })}
                        placeholder="How are you feeling today?"
                        className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-all"
                        rows={3}
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 p-3.5 bg-white/5 hover:bg-white/10 rounded-xl font-medium transition-colors border border-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 p-3.5 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl font-medium hover:shadow-lg hover:shadow-orange-500/25 transition-all disabled:opacity-50"
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
        </div>
      )}
    </div>
  );
}
