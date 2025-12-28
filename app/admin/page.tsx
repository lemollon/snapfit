'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Users, Dumbbell, UtensilsCrossed, Shield, TrendingUp, Clock,
  Mail, Calendar, Award, Activity, RefreshCw, ChevronDown, ChevronUp,
  User, ArrowLeft
} from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  isTrainer: boolean;
  isAdmin: boolean;
  bio: string | null;
  createdAt: string;
  workoutCount: number;
  foodLogCount: number;
}

interface RecentWorkout {
  id: string;
  userId: string;
  title: string | null;
  duration: number;
  createdAt: string;
  userName: string | null;
  userEmail: string | null;
}

interface RecentFoodLog {
  id: string;
  userId: string;
  foodName: string | null;
  mealType: string;
  calories: number | null;
  loggedAt: string;
  userName: string | null;
  userEmail: string | null;
}

interface AdminData {
  stats: {
    totalUsers: number;
    totalWorkouts: number;
    totalFoodLogs: number;
    trainerCount: number;
  };
  users: UserData[];
  recentActivity: {
    workouts: RecentWorkout[];
    foodLogs: RecentFoodLog[];
  };
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'workouts' | 'food'>('users');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchAdminData();
    }
  }, [session]);

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin');
      if (!res.ok) {
        if (res.status === 403) {
          setError('You do not have admin access');
        } else {
          setError('Failed to load admin data');
        }
        return;
      }
      const adminData = await res.json();
      setData(adminData);
    } catch {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-gray-400">SnapFit Management</p>
              </div>
            </div>
          </div>
          <button
            onClick={fetchAdminData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-3xl font-bold">{data?.stats.totalUsers || 0}</p>
            <p className="text-gray-400 text-sm">Total Users</p>
          </div>
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4">
              <Dumbbell className="w-6 h-6 text-orange-400" />
            </div>
            <p className="text-3xl font-bold">{data?.stats.totalWorkouts || 0}</p>
            <p className="text-gray-400 text-sm">Total Workouts</p>
          </div>
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
              <UtensilsCrossed className="w-6 h-6 text-green-400" />
            </div>
            <p className="text-3xl font-bold">{data?.stats.totalFoodLogs || 0}</p>
            <p className="text-gray-400 text-sm">Food Logs</p>
          </div>
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
              <Award className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-3xl font-bold">{data?.stats.trainerCount || 0}</p>
            <p className="text-gray-400 text-sm">Trainers</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'users', label: 'Users', icon: Users },
            { id: 'workouts', label: 'Recent Workouts', icon: Dumbbell },
            { id: 'food', label: 'Recent Food Logs', icon: UtensilsCrossed },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'users' | 'workouts' | 'food')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Users Table */}
        {activeTab === 'users' && (
          <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-750">
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">User</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Email</th>
                    <th className="text-center py-4 px-6 text-sm font-medium text-gray-400">Workouts</th>
                    <th className="text-center py-4 px-6 text-sm font-medium text-gray-400">Food Logs</th>
                    <th className="text-center py-4 px-6 text-sm font-medium text-gray-400">Role</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-700 hover:bg-gray-750 cursor-pointer"
                      onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{user.name || 'No name'}</p>
                            <p className="text-sm text-gray-500">ID: {user.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-300">{user.email}</td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 rounded-lg text-sm">
                          <Dumbbell className="w-3 h-3" />
                          {user.workoutCount}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm">
                          <UtensilsCrossed className="w-3 h-3" />
                          {user.foodLogCount}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {user.isAdmin ? (
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm">Admin</span>
                        ) : user.isTrainer ? (
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm">Trainer</span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-600/50 text-gray-400 rounded-lg text-sm">User</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-gray-400 text-sm">
                        {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(!data?.users || data.users.length === 0) && (
              <div className="py-12 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No users found</p>
              </div>
            )}
          </div>
        )}

        {/* Recent Workouts */}
        {activeTab === 'workouts' && (
          <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
            <div className="divide-y divide-gray-700">
              {data?.recentActivity.workouts.map((workout) => (
                <div key={workout.id} className="p-4 hover:bg-gray-750">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                        <Dumbbell className="w-5 h-5 text-orange-400" />
                      </div>
                      <div>
                        <p className="font-medium">{workout.title || 'Untitled Workout'}</p>
                        <p className="text-sm text-gray-400">
                          by {workout.userName || workout.userEmail} • {workout.duration} min
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {workout.createdAt ? formatRelativeTime(workout.createdAt) : 'N/A'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {(!data?.recentActivity.workouts || data.recentActivity.workouts.length === 0) && (
              <div className="py-12 text-center text-gray-500">
                <Dumbbell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No recent workouts</p>
              </div>
            )}
          </div>
        )}

        {/* Recent Food Logs */}
        {activeTab === 'food' && (
          <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
            <div className="divide-y divide-gray-700">
              {data?.recentActivity.foodLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-gray-750">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                        <UtensilsCrossed className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium">{log.foodName || 'Unknown Food'}</p>
                        <p className="text-sm text-gray-400">
                          by {log.userName || log.userEmail} • {log.mealType} • {log.calories || 0} cal
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {log.loggedAt ? formatRelativeTime(log.loggedAt) : 'N/A'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {(!data?.recentActivity.foodLogs || data.recentActivity.foodLogs.length === 0) && (
              <div className="py-12 text-center text-gray-500">
                <UtensilsCrossed className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No recent food logs</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
