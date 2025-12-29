'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Search, Filter, Star, Clock, Users, Dumbbell,
  ShoppingCart, Play, ChevronRight, Loader2, Check, Crown, LogOut
} from 'lucide-react';

interface Program {
  id: string;
  name: string;
  description: string;
  coverImageUrl?: string;
  durationWeeks: number;
  fitnessLevel: string;
  category: string;
  price: number;
  salePrice?: number;
  averageRating?: number;
  reviewCount?: number;
  totalSales?: number;
  trainer?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

const CATEGORIES = [
  { id: 'all', label: 'All Programs' },
  { id: 'strength', label: 'Strength' },
  { id: 'weight_loss', label: 'Weight Loss' },
  { id: 'muscle_building', label: 'Muscle Building' },
  { id: 'athletic', label: 'Athletic' },
  { id: 'flexibility', label: 'Flexibility' },
];

export default function ProgramsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [ownedPrograms, setOwnedPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [tab, setTab] = useState<'browse' | 'owned'>('browse');

  useEffect(() => {
    fetchPrograms();
  }, [category, search]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchOwnedPrograms();
    }
  }, [session]);

  const fetchPrograms = async () => {
    try {
      let url = '/api/programs?type=browse';
      if (category !== 'all') url += `&category=${category}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await fetch(url);
      const data = await res.json();
      setPrograms(data.programs || []);
    } catch (error) {
      console.error('Failed to fetch programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOwnedPrograms = async () => {
    try {
      const res = await fetch('/api/programs?type=owned');
      const data = await res.json();
      setOwnedPrograms(data.purchases || []);
    } catch (error) {
      console.error('Failed to fetch owned programs:', error);
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500/20 text-green-400';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400';
      case 'advanced': return 'bg-red-500/20 text-red-400';
      default: return 'bg-zinc-500/20 text-zinc-400';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 hover:bg-zinc-800 rounded-xl transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold">Program Marketplace</h1>
                <p className="text-sm text-zinc-400">Expert-designed training programs</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setTab('browse')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                tab === 'browse' ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              Browse
            </button>
            <button
              onClick={() => setTab('owned')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                tab === 'owned' ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              My Programs
              {ownedPrograms.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {ownedPrograms.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {tab === 'browse' ? (
          <>
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search programs..."
                  className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:border-orange-500"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                      category === cat.id
                        ? 'bg-orange-500 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Programs Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              </div>
            ) : programs.length === 0 ? (
              <div className="text-center py-20 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                <Dumbbell className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
                <p className="text-zinc-400">No programs found</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {programs.map((program) => (
                  <div
                    key={program.id}
                    className="group bg-zinc-900/50 rounded-2xl border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all cursor-pointer"
                    onClick={() => router.push(`/programs/${program.id}`)}
                  >
                    <div className="relative h-48 overflow-hidden">
                      {program.coverImageUrl ? (
                        <img
                          src={program.coverImageUrl}
                          alt={program.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-500/20 to-pink-500/20 flex items-center justify-center">
                          <Dumbbell className="w-16 h-16 text-zinc-700" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getLevelBadge(program.fitnessLevel)}`}>
                          {program.fitnessLevel}
                        </span>
                        {program.totalSales && program.totalSales > 100 && (
                          <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded-lg text-xs font-medium flex items-center gap-1">
                            <Crown className="w-3 h-3" /> Popular
                          </span>
                        )}
                      </div>

                      {/* Price */}
                      <div className="absolute bottom-3 right-3">
                        {program.salePrice ? (
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-400 line-through text-sm">${program.price}</span>
                            <span className="text-xl font-bold text-green-400">${program.salePrice}</span>
                          </div>
                        ) : (
                          <span className="text-xl font-bold">${program.price}</span>
                        )}
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-1 group-hover:text-orange-400 transition-colors">
                        {program.name}
                      </h3>
                      <p className="text-zinc-400 text-sm mb-4 line-clamp-2">{program.description}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-zinc-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" /> {program.durationWeeks} weeks
                          </span>
                          {program.averageRating && (
                            <span className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                              {program.averageRating.toFixed(1)}
                            </span>
                          )}
                        </div>

                        {program.trainer && (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-xs font-bold">
                              {program.trainer.name?.charAt(0) || '?'}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Owned Programs */
          <div>
            {ownedPrograms.length === 0 ? (
              <div className="text-center py-20 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
                <p className="text-zinc-400 mb-4">You haven&apos;t purchased any programs yet</p>
                <button
                  onClick={() => setTab('browse')}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl font-semibold"
                >
                  Browse Programs
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {ownedPrograms.map(({ purchase, program, trainer }) => (
                  <div
                    key={purchase.id}
                    className="flex items-center gap-4 p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-all"
                    onClick={() => router.push(`/programs/${program.id}`)}
                  >
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                      {program?.coverImageUrl ? (
                        <img src={program.coverImageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Dumbbell className="w-8 h-8 text-zinc-700" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold mb-1">{program?.name}</h3>
                      <p className="text-sm text-zinc-400 mb-2">By {trainer?.name}</p>

                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-pink-600"
                            style={{
                              width: `${((purchase.completedWeeks?.length || 0) / (program?.durationWeeks || 1)) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-sm text-zinc-400">
                          Week {purchase.currentWeek} of {program?.durationWeeks}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-zinc-600" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
