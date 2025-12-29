'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, DollarSign, TrendingUp, TrendingDown, Users, ShoppingBag,
  Calendar, ChevronRight, Loader2, CreditCard, BarChart3, PieChart
} from 'lucide-react';

interface RevenueSummary {
  totalRevenue: number;
  totalFees: number;
  netRevenue: number;
  transactionCount: number;
  averageOrderValue: number;
  totalClients: number;
  programsSold: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  netAmount: number;
  description?: string;
  createdAt: string;
}

export default function RevenuePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [revenueByType, setRevenueByType] = useState<Record<string, number>>({});
  const [chartData, setChartData] = useState<{ date: string; revenue: number }[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [topPrograms, setTopPrograms] = useState<any[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user && !(session.user as any).isTrainer) {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchRevenue();
    }
  }, [session, period]);

  const fetchRevenue = async () => {
    try {
      const res = await fetch(`/api/trainer/revenue?period=${period}`);
      const data = await res.json();

      setSummary(data.summary);
      setRevenueByType(data.revenueByType || {});
      setChartData(data.chartData || []);
      setTransactions(data.recentTransactions || []);
      setTopPrograms(data.topPrograms || []);
    } catch (error) {
      console.error('Failed to fetch revenue:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'program_sale': return 'Program Sale';
      case 'subscription': return 'Subscription';
      case 'tip': return 'Tip';
      case 'refund': return 'Refund';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'program_sale': return 'text-green-400 bg-green-500/20';
      case 'subscription': return 'text-blue-400 bg-blue-500/20';
      case 'tip': return 'text-purple-400 bg-purple-500/20';
      case 'refund': return 'text-red-400 bg-red-500/20';
      default: return 'text-zinc-400 bg-zinc-500/20';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // Calculate max for chart
  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/trainer" className="p-2 hover:bg-zinc-800 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold">Revenue Dashboard</h1>
              <p className="text-sm text-zinc-400">Track your earnings</p>
            </div>
          </div>

          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:border-orange-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl border border-green-500/20">
            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center mb-3">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-zinc-400 text-sm">Net Revenue</p>
            <p className="text-2xl font-bold text-green-400">{formatCurrency(summary?.netRevenue || 0)}</p>
          </div>

          <div className="p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center mb-3">
              <ShoppingBag className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-zinc-400 text-sm">Programs Sold</p>
            <p className="text-2xl font-bold">{summary?.programsSold || 0}</p>
          </div>

          <div className="p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center mb-3">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-zinc-400 text-sm">Total Clients</p>
            <p className="text-2xl font-bold">{summary?.totalClients || 0}</p>
          </div>

          <div className="p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800">
            <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center mb-3">
              <BarChart3 className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-zinc-400 text-sm">Avg Order Value</p>
            <p className="text-2xl font-bold">{formatCurrency(summary?.averageOrderValue || 0)}</p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800">
          <h3 className="font-semibold mb-6">Revenue Over Time</h3>
          <div className="h-48 flex items-end gap-1">
            {chartData.map((day, i) => (
              <div
                key={day.date}
                className="flex-1 group relative"
              >
                <div
                  className="w-full bg-gradient-to-t from-orange-500 to-pink-500 rounded-t-sm transition-all group-hover:opacity-80"
                  style={{
                    height: `${(day.revenue / maxRevenue) * 100}%`,
                    minHeight: day.revenue > 0 ? '4px' : '0'
                  }}
                />
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-zinc-800 px-2 py-1 rounded text-xs whitespace-nowrap">
                  {formatCurrency(day.revenue)}
                  <br />
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Revenue by Type */}
          <div className="p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800">
            <h3 className="font-semibold mb-4">Revenue by Type</h3>
            <div className="space-y-3">
              {Object.entries(revenueByType).map(([type, amount]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      type === 'program_sale' ? 'bg-green-500' :
                      type === 'subscription' ? 'bg-blue-500' :
                      type === 'tip' ? 'bg-purple-500' : 'bg-zinc-500'
                    }`} />
                    <span className="text-zinc-300">{getTypeLabel(type)}</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(amount)}</span>
                </div>
              ))}
              {Object.keys(revenueByType).length === 0 && (
                <p className="text-zinc-500 text-center py-4">No revenue data yet</p>
              )}
            </div>
          </div>

          {/* Top Programs */}
          <div className="p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800">
            <h3 className="font-semibold mb-4">Top Selling Programs</h3>
            <div className="space-y-3">
              {topPrograms.map((program, i) => (
                <div key={program.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-pink-500/20 flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{program.name}</p>
                    <p className="text-sm text-zinc-400">{program.totalSales || 0} sales</p>
                  </div>
                  <span className="text-green-400 font-semibold">
                    {formatCurrency(program.totalRevenue || 0)}
                  </span>
                </div>
              ))}
              {topPrograms.length === 0 && (
                <p className="text-zinc-500 text-center py-4">No programs yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800">
          <h3 className="font-semibold mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getTypeColor(tx.type)}`}>
                    {getTypeLabel(tx.type)}
                  </span>
                  <div>
                    <p className="font-medium">{tx.description || getTypeLabel(tx.type)}</p>
                    <p className="text-sm text-zinc-400">
                      {tx.createdAt && new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${tx.type === 'refund' ? 'text-red-400' : 'text-green-400'}`}>
                    {tx.type === 'refund' ? '-' : '+'}{formatCurrency(tx.netAmount)}
                  </p>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-zinc-500 text-center py-8">No transactions yet</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
