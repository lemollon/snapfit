'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Users, Dumbbell, UtensilsCrossed, ArrowLeft, Plus, Mail, RefreshCw,
  Clock, TrendingUp, ChevronRight, X, Check, User, Activity, Calendar,
  BarChart3, Eye, UserMinus, UserCheck, Loader2
} from 'lucide-react';

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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
    return formatDate(dateStr);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-white animate-spin mx-auto mb-4" />
          <p className="text-white/70">Loading trainer dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-white/70 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 text-white">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Trainer Dashboard</h1>
                <p className="text-sm text-white/60">Manage your clients</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchClients}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowAddClient(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg font-medium hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Client
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center mb-3">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold">{clients.length}</p>
            <p className="text-white/60 text-sm">Active Clients</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-3">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold">{pendingClients.length}</p>
            <p className="text-white/60 text-sm">Pending</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
            <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center mb-3">
              <Dumbbell className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-3xl font-bold">
              {clients.reduce((sum, c) => sum + c.workoutCount, 0)}
            </p>
            <p className="text-white/60 text-sm">Total Workouts</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center mb-3">
              <UtensilsCrossed className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold">
              {clients.reduce((sum, c) => sum + c.foodLogCount, 0)}
            </p>
            <p className="text-white/60 text-sm">Total Meals Logged</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Client List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pending Clients */}
            {pendingClients.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  Pending Invitations
                </h2>
                <div className="space-y-2">
                  {pendingClients.map((client) => (
                    <div
                      key={client.id}
                      className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center font-bold">
                          {client.name?.charAt(0) || client.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{client.name || 'No name'}</p>
                          <p className="text-sm text-white/60">{client.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateClientStatus(client.clientId, 'active')}
                          className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30"
                          title="Activate"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeClient(client.clientId)}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
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
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Your Clients
              </h2>
              {clients.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                  <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60 mb-4">No clients yet</p>
                  <button
                    onClick={() => setShowAddClient(true)}
                    className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg font-medium"
                  >
                    Add Your First Client
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {clients.map((client) => (
                    <div
                      key={client.id}
                      className={`bg-white/5 border rounded-xl p-4 cursor-pointer hover:bg-white/10 transition-all ${
                        selectedClient?.client.id === client.clientId
                          ? 'border-indigo-500'
                          : 'border-white/10'
                      }`}
                      onClick={() => viewClientDetail(client.clientId)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-lg">
                            {client.name?.charAt(0) || client.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold">{client.name || 'No name'}</p>
                            <p className="text-sm text-white/60">{client.email}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/40" />
                      </div>
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10">
                        <div className="flex items-center gap-1.5 text-sm text-white/70">
                          <Dumbbell className="w-4 h-4 text-orange-400" />
                          <span>{client.workoutCount} workouts</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-white/70">
                          <UtensilsCrossed className="w-4 h-4 text-green-400" />
                          <span>{client.foodLogCount} meals</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-white/50 ml-auto">
                          <Activity className="w-4 h-4" />
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
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-400" />
              </div>
            ) : selectedClient ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden sticky top-24">
                {/* Client Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center font-bold text-2xl">
                      {selectedClient.client.name?.charAt(0) || '?'}
                    </div>
                    <button
                      onClick={() => setSelectedClient(null)}
                      className="p-2 hover:bg-white/10 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <h3 className="text-xl font-bold">{selectedClient.client.name || 'No name'}</h3>
                  <p className="text-white/70">{selectedClient.client.email}</p>
                </div>

                {/* Stats */}
                <div className="p-4 grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold">{selectedClient.stats.totalWorkouts}</p>
                    <p className="text-xs text-white/60">Workouts</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold">{selectedClient.stats.totalMinutes}</p>
                    <p className="text-xs text-white/60">Minutes</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold">{selectedClient.stats.totalFoodLogs}</p>
                    <p className="text-xs text-white/60">Meals Logged</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold">{selectedClient.stats.avgCaloriesPerMeal}</p>
                    <p className="text-xs text-white/60">Avg Cal/Meal</p>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="p-4 border-t border-white/10">
                  <h4 className="font-semibold mb-3 text-sm">Recent Workouts</h4>
                  {selectedClient.recentWorkouts.length === 0 ? (
                    <p className="text-white/50 text-sm">No workouts yet</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedClient.recentWorkouts.slice(0, 3).map((w) => (
                        <div key={w.id} className="flex items-center gap-2 text-sm">
                          <Dumbbell className="w-4 h-4 text-orange-400" />
                          <span className="flex-1 truncate">{w.title || 'Workout'}</span>
                          <span className="text-white/50">{w.duration}m</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-white/10">
                  <h4 className="font-semibold mb-3 text-sm">Recent Meals</h4>
                  {selectedClient.recentFoodLogs.length === 0 ? (
                    <p className="text-white/50 text-sm">No meals logged yet</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedClient.recentFoodLogs.slice(0, 3).map((f) => (
                        <div key={f.id} className="flex items-center gap-2 text-sm">
                          <UtensilsCrossed className="w-4 h-4 text-green-400" />
                          <span className="flex-1 truncate">{f.foodName || f.mealType}</span>
                          <span className="text-white/50">{f.calories || 0} cal</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-white/10">
                  <button
                    onClick={() => removeClient(selectedClient.client.id)}
                    className="w-full py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 flex items-center justify-center gap-2"
                  >
                    <UserMinus className="w-4 h-4" />
                    Remove Client
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <Eye className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/60">Select a client to view details</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Client Modal */}
      {showAddClient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Add New Client</h2>
              <button
                onClick={() => setShowAddClient(false)}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-white/60 text-sm mb-4">
              Enter the email address of an existing SnapFit user to add them as your client.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Client Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="client@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                onClick={addClient}
                disabled={addingClient || !clientEmail.trim()}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {addingClient ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
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
