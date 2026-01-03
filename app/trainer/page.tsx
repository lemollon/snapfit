'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users, Dumbbell, UtensilsCrossed, ArrowLeft, Plus, Mail, RefreshCw,
  Clock, TrendingUp, ChevronRight, X, User, Activity, Calendar,
  BarChart3, Eye, UserMinus, UserCheck, Loader2, ShoppingBag, FileText,
  Sparkles, Crown, Zap, DollarSign, Home
} from 'lucide-react';

// Premium stock image
const HERO_IMAGE = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&auto=format&fit=crop&q=80';

interface Client {
  id: string;
  clientId: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  status: string;
  joinedAt: string;
  workoutCount: number;
  foodLogCount: number;
  lastActivity: string | null;
}

interface ClientDetail {
  client: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
    bio: string | null;
    createdAt: string;
    relationStatus: string;
    joinedTrainerAt: string;
  };
  stats: {
    totalWorkouts: number;
    totalFoodLogs: number;
    totalMinutes: number;
    avgCaloriesPerMeal: number;
  };
  recentWorkouts: Array<{
    id: string;
    title: string | null;
    duration: number;
    fitnessLevel: string;
    createdAt: string;
  }>;
  recentFoodLogs: Array<{
    id: string;
    mealType: string;
    foodName: string | null;
    calories: number | null;
    protein: number | null;
    loggedAt: string;
  }>;
}

export default function TrainerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [pendingClients, setPendingClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [clientEmail, setClientEmail] = useState('');
  const [addingClient, setAddingClient] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientDetail | null>(null);
  const [loadingClient, setLoadingClient] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchClients();
    }
  }, [session]);

  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/trainer/clients');
      if (!res.ok) {
        if (res.status === 403) {
          setError('This feature is only available for trainer accounts');
        } else {
          const data = await res.json();
          setError(data.error || 'Failed to load clients');
        }
        return;
      }
      const data = await res.json();
      setClients(data.clients || []);
      setPendingClients(data.pending || []);
    } catch {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const addClient = async () => {
    if (!clientEmail.trim()) return;
    setAddingClient(true);
    try {
      const res = await fetch('/api/trainer/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to add client');
        return;
      }
      setClientEmail('');
      setShowAddClient(false);
      fetchClients();
    } catch {
      alert('Failed to add client');
    } finally {
      setAddingClient(false);
    }
  };

  const viewClientDetail = async (clientId: string) => {
    setLoadingClient(true);
    try {
      const res = await fetch(`/api/trainer/clients/${clientId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedClient(data);
      }
    } catch {
      alert('Failed to load client details');
    } finally {
      setLoadingClient(false);
    }
  };

  const updateClientStatus = async (clientId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/trainer/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchClients();
        if (selectedClient?.client.id === clientId) {
          setSelectedClient(null);
        }
      }
    } catch {
      alert('Failed to update client');
    }
  };

  const removeClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to remove this client?')) return;
    try {
      const res = await fetch(`/api/trainer/clients/${clientId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchClients();
        if (selectedClient?.client.id === clientId) {
          setSelectedClient(null);
        }
      }
    } catch {
      alert('Failed to remove client');
    }
  };

  const formatRelativeTime = (dateStr: string | null) => {
    if (!dateStr) return 'No activity';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center animate-pulse">
            <Users className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-400">Loading trainer dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-500/20 to-rose-500/20 flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-8">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const totalWorkouts = clients.reduce((sum, c) => sum + c.workoutCount, 0);
  const totalMeals = clients.reduce((sum, c) => sum + c.foodLogCount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Header */}
      <div className="relative">
        <div
          className="h-64 bg-cover bg-center"
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
            <Home className="w-5 h-5 text-white" />
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchClients}
              className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl hover:bg-white/20 transition-all"
            >
              <RefreshCw className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => setShowAddClient(true)}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl font-semibold text-white hover:shadow-lg hover:shadow-violet-500/25 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Client</span>
            </button>
          </div>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 pb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg shadow-violet-500/30">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Trainer Dashboard</h1>
              <p className="text-white/70">Welcome back, {session?.user?.name?.split(' ')[0] || 'Coach'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-2 pb-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { icon: Users, value: clients.length, label: 'Active Clients', gradient: 'from-blue-500 to-cyan-500', glow: 'shadow-blue-500/20' },
            { icon: Clock, value: pendingClients.length, label: 'Pending', gradient: 'from-amber-500 to-orange-500', glow: 'shadow-amber-500/20' },
            { icon: Dumbbell, value: totalWorkouts, label: 'Total Workouts', gradient: 'from-orange-500 to-pink-500', glow: 'shadow-orange-500/20' },
            { icon: UtensilsCrossed, value: totalMeals, label: 'Meals Logged', gradient: 'from-green-500 to-emerald-500', glow: 'shadow-green-500/20' },
          ].map((stat, idx) => (
            <div key={idx} className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br opacity-20 rounded-full -translate-y-1/2 translate-x-1/2" style={{ background: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }} />
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3 shadow-lg ${stat.glow}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: '/trainer/products', icon: ShoppingBag, label: 'Products', desc: 'Sell items', gradient: 'from-green-500 to-teal-600' },
              { href: '/trainer/templates', icon: FileText, label: 'Templates', desc: 'Workouts', gradient: 'from-purple-500 to-pink-600' },
              { href: '/trainer/revenue', icon: DollarSign, label: 'Revenue', desc: 'Earnings', gradient: 'from-emerald-500 to-green-600' },
              { href: '/trainer/check-ins', icon: Activity, label: 'Check-ins', desc: 'Progress', gradient: 'from-blue-500 to-cyan-600' },
              { href: '/programs', icon: Dumbbell, label: 'Programs', desc: 'Create & sell', gradient: 'from-amber-500 to-orange-600' },
              { href: '/profile', icon: User, label: 'Profile', desc: 'Edit info', gradient: 'from-indigo-500 to-violet-600' },
            ].map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 p-4 transition-all"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-2 shadow-lg group-hover:scale-105 transition-transform`}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <p className="font-semibold text-white text-sm">{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Client List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pending Clients */}
            {pendingClients.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  Pending Invitations
                  <span className="ml-auto px-2.5 py-0.5 bg-amber-500/20 text-amber-400 rounded-full text-xs font-medium">
                    {pendingClients.length}
                  </span>
                </h2>
                <div className="space-y-2">
                  {pendingClients.map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center font-bold text-white shadow-lg">
                          {client.name?.charAt(0) || client.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{client.name || 'No name'}</p>
                          <p className="text-sm text-gray-400">{client.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateClientStatus(client.clientId, 'active')}
                          className="p-2.5 bg-green-500/20 text-green-400 rounded-xl hover:bg-green-500/30 transition-colors"
                          title="Activate"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeClient(client.clientId)}
                          className="p-2.5 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors"
                          title="Remove"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Clients */}
            <div>
              <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Your Clients
                {clients.length > 0 && (
                  <span className="ml-auto px-2.5 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                    {clients.length}
                  </span>
                )}
              </h2>
              {clients.length === 0 ? (
                <div className="text-center py-12 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10 text-violet-400/50" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No clients yet</h3>
                  <p className="text-gray-500 mb-6 max-w-xs mx-auto">Add your first client to start tracking their fitness journey</p>
                  <button
                    onClick={() => setShowAddClient(true)}
                    className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-violet-500/25 transition-all"
                  >
                    Add Your First Client
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {clients.map((client) => (
                    <div
                      key={client.id}
                      className={`group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border p-4 cursor-pointer hover:bg-white/10 transition-all ${
                        selectedClient?.client.id === client.clientId
                          ? 'border-violet-500 shadow-lg shadow-violet-500/10'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                      onClick={() => viewClientDetail(client.clientId)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg">
                            {client.name?.charAt(0) || client.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{client.name || 'No name'}</p>
                            <p className="text-sm text-gray-400">{client.email}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-violet-400 transition-colors" />
                      </div>
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <div className="w-6 h-6 rounded-lg bg-orange-500/20 flex items-center justify-center">
                            <Dumbbell className="w-3.5 h-3.5 text-orange-400" />
                          </div>
                          <span>{client.workoutCount}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <div className="w-6 h-6 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <UtensilsCrossed className="w-3.5 h-3.5 text-green-400" />
                          </div>
                          <span>{client.foodLogCount}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 ml-auto">
                          <Activity className="w-3.5 h-3.5" />
                          <span>{formatRelativeTime(client.lastActivity)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Client Detail Panel */}
          <div className="lg:col-span-1">
            {loadingClient ? (
              <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-violet-400" />
              </div>
            ) : selectedClient ? (
              <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden sticky top-4">
                {/* Client Header */}
                <div className="relative bg-gradient-to-r from-violet-600 to-purple-600 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center font-bold text-2xl text-white shadow-lg">
                      {selectedClient.client.name?.charAt(0) || '?'}
                    </div>
                    <button
                      onClick={() => setSelectedClient(null)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                  <h3 className="text-xl font-bold text-white">{selectedClient.client.name || 'No name'}</h3>
                  <p className="text-white/70 text-sm">{selectedClient.client.email}</p>
                </div>

                {/* Stats */}
                <div className="p-4 grid grid-cols-2 gap-3">
                  {[
                    { label: 'Workouts', value: selectedClient.stats.totalWorkouts, color: 'text-orange-400' },
                    { label: 'Minutes', value: selectedClient.stats.totalMinutes, color: 'text-blue-400' },
                    { label: 'Meals', value: selectedClient.stats.totalFoodLogs, color: 'text-green-400' },
                    { label: 'Cal/Meal', value: selectedClient.stats.avgCaloriesPerMeal, color: 'text-amber-400' },
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                      <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Recent Workouts */}
                <div className="p-4 border-t border-white/10">
                  <h4 className="font-semibold text-white mb-3 text-sm flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-orange-400" />
                    Recent Workouts
                  </h4>
                  {selectedClient.recentWorkouts.length === 0 ? (
                    <p className="text-gray-500 text-sm">No workouts yet</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedClient.recentWorkouts.slice(0, 3).map((w) => (
                        <div key={w.id} className="flex items-center gap-3 text-sm p-2.5 bg-white/5 rounded-xl">
                          <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                            <Dumbbell className="w-4 h-4 text-orange-400" />
                          </div>
                          <span className="flex-1 truncate text-white">{w.title || 'Workout'}</span>
                          <span className="text-gray-500">{w.duration}m</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Meals */}
                <div className="p-4 border-t border-white/10">
                  <h4 className="font-semibold text-white mb-3 text-sm flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4 text-green-400" />
                    Recent Meals
                  </h4>
                  {selectedClient.recentFoodLogs.length === 0 ? (
                    <p className="text-gray-500 text-sm">No meals logged yet</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedClient.recentFoodLogs.slice(0, 3).map((f) => (
                        <div key={f.id} className="flex items-center gap-3 text-sm p-2.5 bg-white/5 rounded-xl">
                          <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <UtensilsCrossed className="w-4 h-4 text-green-400" />
                          </div>
                          <span className="flex-1 truncate text-white">{f.foodName || f.mealType}</span>
                          <span className="text-gray-500">{f.calories || 0} cal</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-white/10">
                  <button
                    onClick={() => removeClient(selectedClient.client.id)}
                    className="w-full py-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 flex items-center justify-center gap-2 transition-colors border border-red-500/20 font-medium"
                  >
                    <UserMinus className="w-4 h-4" />
                    Remove Client
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-gray-500">Select a client to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAddClient(false)} />
          <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-500/20 rounded-xl">
                  <Plus className="w-5 h-5 text-violet-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Add New Client</h2>
              </div>
              <button
                onClick={() => setShowAddClient(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <p className="text-gray-400 text-sm mb-6">
              Enter the email address of an existing SnapFit user to add them as your client.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Client Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="client@example.com"
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50"
                  />
                </div>
              </div>

              <button
                onClick={addClient}
                disabled={addingClient || !clientEmail.trim()}
                className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-violet-500/25 transition-all"
              >
                {addingClient ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Add Client
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
