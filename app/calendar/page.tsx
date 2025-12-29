'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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
} from 'lucide-react';

interface ScheduledWorkout {
  id: string;
  title: string;
  description?: string;
  scheduledFor: string;
  duration?: number;
  status: string;
  isRecurring: boolean;
}

interface MealPlan {
  id: string;
  name: string;
  mealType: string;
  scheduledFor: string;
  targetCalories?: number;
  targetProtein?: number;
  status: string;
}

interface DayData {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  workouts: ScheduledWorkout[];
  meals: MealPlan[];
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [workouts, setWorkouts] = useState<ScheduledWorkout[]>([]);
  const [meals, setMeals] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'month' | 'week'>('month');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<'workout' | 'meal'>('workout');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchCalendarData();
    }
  }, [status, router, currentDate]);

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const startDate = formatDate(startOfMonth);
      const endDate = formatDate(endOfMonth);

      const res = await fetch(`/api/calendar?start=${startDate}&end=${endDate}`);
      const data = await res.json();

      setWorkouts(data.workouts || []);
      setMeals(data.meals || []);
    } catch (error) {
      console.error('Failed to fetch calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarDays = (): DayData[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: DayData[] = [];

    // Previous month days
    const prevMonth = new Date(year, month, 0);
    for (let i = startingDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonth.getDate() - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, today),
        workouts: workouts.filter(w => isSameDay(new Date(w.scheduledFor), date)),
        meals: meals.filter(m => isSameDay(new Date(m.scheduledFor), date)),
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: isSameDay(date, today),
        workouts: workouts.filter(w => isSameDay(new Date(w.scheduledFor), date)),
        meals: meals.filter(m => isSameDay(new Date(m.scheduledFor), date)),
      });
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, today),
        workouts: workouts.filter(w => isSameDay(new Date(w.scheduledFor), date)),
        meals: meals.filter(m => isSameDay(new Date(m.scheduledFor), date)),
      });
    }

    return days;
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const getSelectedDayData = (): DayData | null => {
    if (!selectedDate) return null;
    return {
      date: selectedDate,
      isCurrentMonth: true,
      isToday: isSameDay(selectedDate, new Date()),
      workouts: workouts.filter(w => isSameDay(new Date(w.scheduledFor), selectedDate)),
      meals: meals.filter(m => isSameDay(new Date(m.scheduledFor), selectedDate)),
    };
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
  const selectedDayData = getSelectedDayData();

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-lg border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-bold">Calendar</h1>
            </div>
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={prevMonth}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              {/* Day Headers */}
              <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800">
                {DAYS.map((day) => (
                  <div
                    key={day}
                    className="p-3 text-center text-sm font-medium text-zinc-500 dark:text-zinc-400"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7">
                {calendarDays.map((day, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(day.date)}
                    className={`relative min-h-[80px] sm:min-h-[100px] p-2 border-b border-r border-zinc-200 dark:border-zinc-800 transition-colors ${
                      !day.isCurrentMonth ? 'bg-zinc-50 dark:bg-zinc-950' : 'bg-white dark:bg-zinc-900'
                    } ${
                      selectedDate && isSameDay(day.date, selectedDate)
                        ? 'ring-2 ring-orange-500 ring-inset'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm ${
                        day.isToday
                          ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold'
                          : !day.isCurrentMonth
                            ? 'text-zinc-400 dark:text-zinc-600'
                            : 'text-zinc-900 dark:text-zinc-100'
                      }`}
                    >
                      {day.date.getDate()}
                    </span>

                    {/* Event Indicators */}
                    <div className="mt-1 space-y-1">
                      {day.workouts.slice(0, 2).map((workout) => (
                        <div
                          key={workout.id}
                          className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-600 dark:text-blue-400 truncate"
                        >
                          <Dumbbell className="inline w-3 h-3 mr-1" />
                          <span className="hidden sm:inline">{workout.title}</span>
                        </div>
                      ))}
                      {day.meals.slice(0, 2).map((meal) => (
                        <div
                          key={meal.id}
                          className="text-xs px-1.5 py-0.5 rounded bg-green-500/20 text-green-600 dark:text-green-400 truncate"
                        >
                          <UtensilsCrossed className="inline w-3 h-3 mr-1" />
                          <span className="hidden sm:inline">{meal.name}</span>
                        </div>
                      ))}
                      {(day.workouts.length + day.meals.length > 4) && (
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                          +{day.workouts.length + day.meals.length - 4} more
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Selected Day Details */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {selectedDayData ? (
                <div className="bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {selectedDayData.date.toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </h3>
                      {selectedDayData.isToday && (
                        <span className="text-sm text-orange-500">Today</span>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedDate(null)}
                      className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Add Event Buttons */}
                  <div className="flex gap-2 mb-6">
                    <button
                      onClick={() => {
                        setAddType('workout');
                        setShowAddModal(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Dumbbell className="w-4 h-4" />
                      Workout
                    </button>
                    <button
                      onClick={() => {
                        setAddType('meal');
                        setShowAddModal(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium transition-colors"
                    >
                      <UtensilsCrossed className="w-4 h-4" />
                      Meal
                    </button>
                  </div>

                  {/* Workouts */}
                  {selectedDayData.workouts.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3 flex items-center gap-2">
                        <Dumbbell className="w-4 h-4" />
                        Workouts
                      </h4>
                      <div className="space-y-2">
                        {selectedDayData.workouts.map((workout) => (
                          <div
                            key={workout.id}
                            className="p-3 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h5 className="font-medium">{workout.title}</h5>
                                {workout.description && (
                                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                    {workout.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                                  {workout.duration && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {workout.duration} min
                                    </span>
                                  )}
                                  <span className={`flex items-center gap-1 ${
                                    workout.status === 'completed' ? 'text-green-500' : ''
                                  }`}>
                                    {workout.status === 'completed' ? (
                                      <Check className="w-3 h-3" />
                                    ) : (
                                      <Target className="w-3 h-3" />
                                    )}
                                    {workout.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Meals */}
                  {selectedDayData.meals.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3 flex items-center gap-2">
                        <UtensilsCrossed className="w-4 h-4" />
                        Meals
                      </h4>
                      <div className="space-y-2">
                        {selectedDayData.meals.map((meal) => (
                          <div
                            key={meal.id}
                            className="p-3 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 capitalize">
                                  {meal.mealType}
                                </span>
                                <h5 className="font-medium mt-1">{meal.name}</h5>
                                <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                                  {meal.targetCalories && (
                                    <span className="flex items-center gap-1">
                                      <Flame className="w-3 h-3" />
                                      {meal.targetCalories} kcal
                                    </span>
                                  )}
                                  {meal.targetProtein && (
                                    <span>{meal.targetProtein}g protein</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {selectedDayData.workouts.length === 0 && selectedDayData.meals.length === 0 && (
                    <div className="text-center py-8">
                      <CalendarIcon className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
                      <p className="text-zinc-500 dark:text-zinc-400">No events scheduled</p>
                      <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">
                        Add a workout or meal to get started
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 text-center">
                  <CalendarIcon className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
                  <p className="text-zinc-500 dark:text-zinc-400">Select a date</p>
                  <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">
                    Click on a day to see details
                  </p>
                </div>
              )}

              {/* Stats Summary */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                    <Dumbbell className="w-4 h-4" />
                    <span className="text-sm">Workouts</span>
                  </div>
                  <p className="text-2xl font-bold">{workouts.length}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">this month</p>
                </div>
                <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
                    <UtensilsCrossed className="w-4 h-4" />
                    <span className="text-sm">Meals</span>
                  </div>
                  <p className="text-2xl font-bold">{meals.length}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">this month</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                {addType === 'workout' ? (
                  <>
                    <Dumbbell className="w-5 h-5 text-blue-500" />
                    Schedule Workout
                  </>
                ) : (
                  <>
                    <UtensilsCrossed className="w-5 h-5 text-green-500" />
                    Plan Meal
                  </>
                )}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Date</p>
                <p className="font-medium">
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>

              {addType === 'workout' ? (
                <>
                  <div>
                    <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                      Workout Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Morning HIIT"
                      className="w-full p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      placeholder="45"
                      className="w-full p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                      Meal Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., High Protein Breakfast"
                      className="w-full p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                      Meal Type
                    </label>
                    <select className="w-full p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:border-orange-500">
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snack">Snack</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                      Target Calories
                    </label>
                    <input
                      type="number"
                      placeholder="500"
                      className="w-full p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 p-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement save logic
                    setShowAddModal(false);
                  }}
                  className="flex-1 p-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
