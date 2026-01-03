'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Search, Star, Clock, Dumbbell,
  ShoppingCart, ChevronRight, Loader2, Crown, Sparkles,
  Play, Users, Flame, Target
} from 'lucide-react';

// Premium stock image
const HERO_IMAGE = 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=1200&auto=format&fit=crop&q=80';

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
  { id: 'all', label: 'All', icon: Sparkles },
  { id: 'strength', label: 'Strength', icon: Dumbbell },
  { id: 'weight_loss', label: 'Fat Loss', icon: Flame },
  { id: 'muscle_building', label: 'Build', icon: Target },
  { id: 'athletic', label: 'Athletic', icon: Play },
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
      case 'beginner': return { bg: 'from-green-500/20 to-emerald-500/10', border: 'border-green-500/30', text: 'text-green-400' };
      case 'intermediate': return { bg: 'from-yellow-500/20 to-amber-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' };
      case 'advanced': return { bg: 'from-red-500/20 to-rose-500/10', border: 'border-red-500/30', text: 'text-red-400' };
      default: return { bg: 'from-gray-500/20 to-slate-500/10', border: 'border-gray-500/30', text: 'text-gray-400' };
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center animate-pulse">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-400">Loading programs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Header */}
      <div className="relative">
        <div
          className="h-56 bg-cover bg-center"
          style={{ backgroundImage: `url("${HERO_IMAGE}")` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-slate-900" />
        </div>

        {/* Back Button */}
        <div className="absolute top-4 left-4">
          <Link
            href="/"
            className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 pb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/20">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Programs</h1>
          </div>
          <p className="text-white/70">Expert-designed training programs</p>
        </div>
      </div>

      <div className="px-4 -mt-2 pb-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 p-1.5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 mb-6">
          <button
            onClick={() => setTab('browse')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              tab === 'browse'
                ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/25'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Browse
          </button>
          <button
            onClick={() => setTab('owned')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              tab === 'owned'
                ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/25'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Play className="w-4 h-4" />
            My Programs
            {ownedPrograms.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {ownedPrograms.length}
              </span>
            )}
          </button>
        </div>

        {tab === 'browse' ? (
          <>
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search programs..."
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 mb-4">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                      category === cat.id
                        ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/25'
                        : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Programs Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
              </div>
            ) : programs.length === 0 ? (
              <div className="text-center py-16 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <Dumbbell className="w-10 h-10 text-violet-500/50" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No programs found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {programs.map((program) => {
                  const levelStyle = getLevelBadge(program.fitnessLevel);
                  return (
                    <div
                      key={program.id}
                      className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-violet-500/30 transition-all cursor-pointer"
                      onClick={() => router.push(`/programs/${program.id}`)}
                    >
                      <div className="flex">
                        {/* Image */}
                        <div className="relative w-32 h-36 flex-shrink-0 overflow-hidden">
                          {program.coverImageUrl ? (
                            <img
                              src={program.coverImageUrl}
                              alt={program.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-violet-500/30 to-purple-500/30 flex items-center justify-center">
                              <Dumbbell className="w-10 h-10 text-gray-600" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-900/50" />

                          {/* Popular Badge */}
                          {program.totalSales && program.totalSales > 100 && (
                            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-amber-500/90 rounded-lg text-xs font-semibold text-white">
                              <Crown className="w-3 h-3" />
                              Popular
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-4">
                          {/* Level Badge */}
                          <div className={`inline-flex items-center px-2.5 py-1 rounded-lg bg-gradient-to-r ${levelStyle.bg} border ${levelStyle.border} mb-2`}>
                            <span className={`text-xs font-semibold capitalize ${levelStyle.text}`}>
                              {program.fitnessLevel}
                            </span>
                          </div>

                          <h3 className="font-bold text-white group-hover:text-violet-300 transition-colors mb-1 line-clamp-1">
                            {program.name}
                          </h3>
                          <p className="text-sm text-gray-400 mb-3 line-clamp-1">{program.description}</p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-sm">
                              <span className="flex items-center gap-1 text-gray-400">
                                <Clock className="w-3.5 h-3.5" /> {program.durationWeeks}w
                              </span>
                              {program.averageRating && (
                                <span className="flex items-center gap-1 text-amber-400">
                                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                                  {program.averageRating.toFixed(1)}
                                </span>
                              )}
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              {program.salePrice ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-500 line-through">${program.price}</span>
                                  <span className="text-lg font-bold text-green-400">${program.salePrice}</span>
                                </div>
                              ) : (
                                <span className="text-lg font-bold text-white">${program.price}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="flex items-center pr-4">
                          <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-violet-400 transition-colors" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          /* Owned Programs */
          <div>
            {ownedPrograms.length === 0 ? (
              <div className="text-center py-16 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-10 h-10 text-violet-500/50" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No programs yet</h3>
                <p className="text-gray-500 mb-6">You haven&apos;t purchased any programs</p>
                <button
                  onClick={() => setTab('browse')}
                  className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-violet-500/25 transition-all"
                >
                  Browse Programs
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {ownedPrograms.map(({ purchase, program, trainer }) => (
                  <div
                    key={purchase.id}
                    className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-violet-500/30 transition-all cursor-pointer"
                    onClick={() => router.push(`/programs/${program.id}`)}
                  >
                    <div className="flex items-center gap-4 p-4">
                      {/* Image */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                        {program?.coverImageUrl ? (
                          <img src={program.coverImageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-violet-500/30 to-purple-500/30 flex items-center justify-center">
                            <Dumbbell className="w-8 h-8 text-gray-600" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white mb-1 truncate">{program?.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                          <Users className="w-3.5 h-3.5" />
                          <span>By {trainer?.name}</span>
                        </div>

                        {/* Progress */}
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-black/30 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all"
                              style={{
                                width: `${((purchase.completedWeeks?.length || 0) / (program?.durationWeeks || 1)) * 100}%`
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-400 whitespace-nowrap">
                            Week {purchase.currentWeek}/{program?.durationWeeks}
                          </span>
                        </div>
                      </div>

                      {/* Play Button */}
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform">
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
