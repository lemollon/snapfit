'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, ArrowRight, Users, Dumbbell, UtensilsCrossed, BarChart3,
  UserPlus, Eye, TrendingUp, Calendar, MessageSquare, Check, Award,
  Clock, Activity, Play, ChevronRight, Mail, Star
} from 'lucide-react';

const TRAINER_SCREENS = [
  {
    id: 'dashboard',
    title: 'Client Dashboard',
    description: 'See all your clients at a glance with their activity stats and progress.',
    features: [
      'View all active clients',
      'See pending client invitations',
      'Total workouts across all clients',
      'Total meals logged by clients',
      'Quick access to client details',
      'Real-time activity updates',
    ],
    mockData: {
      activeClients: 12,
      pending: 3,
      totalWorkouts: 156,
      totalMeals: 423,
    },
    color: 'from-indigo-500 to-purple-600',
  },
  {
    id: 'clients',
    title: 'Client Management',
    description: 'Add new clients by email and manage your client relationships.',
    features: [
      'Invite clients by email address',
      'Clients must have SnapFit account',
      'Accept or reject pending invites',
      'Activate clients when ready',
      'Remove clients if needed',
      'Track client status',
    ],
    mockData: {
      clients: [
        { name: 'Sarah Johnson', email: 'sarah@email.com', workouts: 24, status: 'active' },
        { name: 'Mike Chen', email: 'mike@email.com', workouts: 18, status: 'active' },
        { name: 'Emma Wilson', email: 'emma@email.com', workouts: 0, status: 'pending' },
      ],
    },
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'progress',
    title: 'Client Progress Tracking',
    description: 'Monitor each client\'s workout history and nutrition habits.',
    features: [
      'View client workout history',
      'See meals and calorie intake',
      'Track total minutes trained',
      'Average calories per meal',
      'Recent activity feed',
      'Identify inactive clients',
    ],
    mockData: {
      client: 'Sarah Johnson',
      stats: {
        workouts: 24,
        minutes: 720,
        meals: 86,
        avgCalories: 1850,
      },
    },
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'insights',
    title: 'Client Insights',
    description: 'Get detailed analytics on your clients\' fitness journeys.',
    features: [
      'Client activity trends',
      'Workout frequency patterns',
      'Nutrition consistency',
      'Goal progress tracking',
      'Compare client performance',
      'Identify who needs attention',
    ],
    mockData: {
      insights: [
        { client: 'Sarah', trend: 'up', message: '3 workouts this week' },
        { client: 'Mike', trend: 'down', message: 'No activity in 5 days' },
        { client: 'Emma', trend: 'new', message: 'Just joined, welcome!' },
      ],
    },
    color: 'from-orange-500 to-red-500',
  },
];

export default function TrainerDemoPage() {
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState(0);

  const nextScreen = () => {
    setCurrentScreen((prev) => (prev + 1) % TRAINER_SCREENS.length);
  };

  const prevScreen = () => {
    setCurrentScreen((prev) => (prev - 1 + TRAINER_SCREENS.length) % TRAINER_SCREENS.length);
  };

  const screen = TRAINER_SCREENS[currentScreen];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 text-white">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/login')}
            className="flex items-center gap-2 text-white/70 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-400" />
            <span className="font-bold">Trainer Experience Demo</span>
          </div>
          <button
            onClick={() => router.push('/demo/user')}
            className="text-sm text-white/70 hover:text-white"
          >
            ← See User Demo
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Screen Navigation Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {TRAINER_SCREENS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCurrentScreen(i)}
              className={`w-3 h-3 rounded-full transition-all ${
                i === currentScreen
                  ? 'bg-purple-500 w-8'
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Current Screen */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Mock Dashboard Preview */}
          <div className="relative">
            <div className={`absolute inset-0 bg-gradient-to-br ${screen.color} rounded-3xl blur-3xl opacity-30`} />
            <div className="relative bg-gray-800/80 backdrop-blur rounded-3xl overflow-hidden border border-white/10 shadow-2xl p-6">
              {/* Mock Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold">Trainer Dashboard</p>
                    <p className="text-xs text-white/60">John Smith</p>
                  </div>
                </div>
                <button className="p-2 bg-white/10 rounded-lg">
                  <UserPlus className="w-5 h-5" />
                </button>
              </div>

              {/* Mock Content based on screen */}
              {screen.id === 'dashboard' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-xl p-4">
                      <Users className="w-6 h-6 text-blue-400 mb-2" />
                      <p className="text-2xl font-bold">{screen.mockData.activeClients}</p>
                      <p className="text-xs text-white/60">Active Clients</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <Clock className="w-6 h-6 text-yellow-400 mb-2" />
                      <p className="text-2xl font-bold">{screen.mockData.pending}</p>
                      <p className="text-xs text-white/60">Pending</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <Dumbbell className="w-6 h-6 text-orange-400 mb-2" />
                      <p className="text-2xl font-bold">{screen.mockData.totalWorkouts}</p>
                      <p className="text-xs text-white/60">Total Workouts</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <UtensilsCrossed className="w-6 h-6 text-green-400 mb-2" />
                      <p className="text-2xl font-bold">{screen.mockData.totalMeals}</p>
                      <p className="text-xs text-white/60">Meals Logged</p>
                    </div>
                  </div>
                </div>
              )}

              {screen.id === 'clients' && screen.mockData.clients && (
                <div className="space-y-3">
                  {screen.mockData.clients.map((client, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center font-bold">
                          {client.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-xs text-white/60">{client.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          client.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {client.status}
                        </span>
                        <ChevronRight className="w-4 h-4 text-white/40" />
                      </div>
                    </div>
                  ))}
                  <button className="w-full py-3 bg-white/5 border border-dashed border-white/20 rounded-xl text-white/60 flex items-center justify-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Add New Client
                  </button>
                </div>
              )}

              {screen.id === 'progress' && screen.mockData.stats && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-bold text-xl">
                        S
                      </div>
                      <div>
                        <p className="font-bold">{screen.mockData.client}</p>
                        <p className="text-xs text-white/70">Client since Jan 2024</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                      <p className="text-xl font-bold">{screen.mockData.stats.workouts}</p>
                      <p className="text-xs text-white/60">Workouts</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                      <p className="text-xl font-bold">{screen.mockData.stats.minutes}</p>
                      <p className="text-xs text-white/60">Minutes</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                      <p className="text-xl font-bold">{screen.mockData.stats.meals}</p>
                      <p className="text-xs text-white/60">Meals</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                      <p className="text-xl font-bold">{screen.mockData.stats.avgCalories}</p>
                      <p className="text-xs text-white/60">Avg Cal</p>
                    </div>
                  </div>
                </div>
              )}

              {screen.id === 'insights' && screen.mockData.insights && (
                <div className="space-y-3">
                  {screen.mockData.insights.map((insight, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-4 flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        insight.trend === 'up' ? 'bg-green-500/20' :
                        insight.trend === 'down' ? 'bg-red-500/20' : 'bg-blue-500/20'
                      }`}>
                        {insight.trend === 'up' && <TrendingUp className="w-5 h-5 text-green-400" />}
                        {insight.trend === 'down' && <Activity className="w-5 h-5 text-red-400" />}
                        {insight.trend === 'new' && <Star className="w-5 h-5 text-blue-400" />}
                      </div>
                      <div>
                        <p className="font-medium">{insight.client}</p>
                        <p className="text-sm text-white/60">{insight.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${screen.color} rounded-full text-sm font-medium mb-4`}>
              <span>Screen {currentScreen + 1} of {TRAINER_SCREENS.length}</span>
            </div>

            <h1 className="text-4xl font-bold mb-4">{screen.title}</h1>
            <p className="text-xl text-white/70 mb-8">{screen.description}</p>

            <div className="space-y-4 mb-8">
              {screen.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${screen.color} flex items-center justify-center`}>
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-white/90">{feature}</span>
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={prevScreen}
                className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextScreen}
                className="flex-1 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-500/30 transition-all"
              >
                Next Screen
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-white/60 mb-6">Ready to grow your training business?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/login')}
              className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full font-bold text-lg hover:shadow-lg transition-all"
            >
              Sign Up as Trainer
            </button>
            <button
              onClick={() => router.push('/demo/user')}
              className="px-8 py-4 bg-white/10 rounded-full font-bold text-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2"
            >
              See User Experience
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
