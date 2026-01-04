'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  LogOut,
  Clock,
  Calendar,
  Dumbbell,
  Star,
  Users,
  Play,
  CheckCircle,
  Lock,
  ChevronRight,
  ShoppingCart,
  Award,
  Target,
} from 'lucide-react';
import { useToast } from '@/components/Toast';

interface ProgramWeek {
  id: string;
  weekNumber: number;
  name?: string;
  description?: string;
  workouts?: any[];
}

interface Program {
  id: string;
  name: string;
  description?: string;
  longDescription?: string;
  coverImageUrl?: string;
  previewVideoUrl?: string;
  durationWeeks: number;
  fitnessLevel: string;
  category: string;
  equipment?: string[];
  workoutsPerWeek?: number;
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
  weeks?: ProgramWeek[];
}

interface PurchaseInfo {
  isPurchased: boolean;
  currentWeek?: number;
  completedWeeks?: number[];
  startedAt?: string;
}

export default function ProgramDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const programId = params.id as string;

  const [program, setProgram] = useState<Program | null>(null);
  const [purchaseInfo, setPurchaseInfo] = useState<PurchaseInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [activeWeek, setActiveWeek] = useState<number | null>(null);
  const [showVideoPreview, setShowVideoPreview] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && programId) {
      fetchProgram();
    }
  }, [status, router, programId]);

  const fetchProgram = async () => {
    try {
      const res = await fetch(`/api/programs/${programId}`);
      if (res.ok) {
        const data = await res.json();
        setProgram(data.program);
        setPurchaseInfo(data.purchaseInfo || { isPurchased: false });
        if (data.purchaseInfo?.currentWeek) {
          setActiveWeek(data.purchaseInfo.currentWeek);
        }
      } else if (res.status === 404) {
        router.push('/programs');
      }
    } catch (error) {
      console.error('Failed to fetch program:', error);
      toast.error('Failed to load program', 'Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      const res = await fetch(`/api/programs/${programId}/purchase`, {
        method: 'POST',
      });
      if (res.ok) {
        await fetchProgram();
      }
    } catch (error) {
      console.error('Failed to purchase program:', error);
      toast.error('Failed to purchase program', 'Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleStartWeek = async (weekNumber: number) => {
    try {
      await fetch(`/api/programs/${programId}/progress`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentWeek: weekNumber }),
      });
      setPurchaseInfo(prev => prev ? { ...prev, currentWeek: weekNumber } : null);
      setActiveWeek(weekNumber);
    } catch (error) {
      console.error('Failed to update progress:', error);
      toast.error('Failed to update progress', 'Please try again.');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-xl mb-4">Program not found</p>
          <Link href="/programs" className="text-orange-500 hover:underline">
            Back to Programs
          </Link>
        </div>
      </div>
    );
  }

  const isOwned = purchaseInfo?.isPurchased;
  const displayPrice = program.salePrice || program.price;
  const hasDiscount = program.salePrice && program.salePrice < program.price;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 bg-black/90 backdrop-blur-lg border-b border-zinc-800 z-40">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/programs" className="p-2 -ml-2 hover:bg-zinc-800 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-bold truncate">{program.name}</h1>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto pb-32">
        {/* Cover Image */}
        {program.coverImageUrl && (
          <div className="aspect-video bg-zinc-900 relative">
            <img
              src={program.coverImageUrl}
              alt={program.name}
              className="w-full h-full object-cover"
            />
            {program.previewVideoUrl && (
              <button
                onClick={() => setShowVideoPreview(true)}
                className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors"
              >
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
              </button>
            )}
          </div>
        )}

        <div className="px-4 py-6">
          {/* Program Info */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">{program.name}</h2>

            {/* Trainer */}
            {program.trainer && (
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center overflow-hidden">
                  {program.trainer.avatarUrl ? (
                    <img src={program.trainer.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-medium">{program.trainer.name?.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <p className="font-medium">{program.trainer.name}</p>
                  <p className="text-sm text-zinc-500">Coach</p>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                <Calendar className="w-4 h-4" />
                {program.durationWeeks} weeks
              </div>
              {program.workoutsPerWeek && (
                <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                  <Dumbbell className="w-4 h-4" />
                  {program.workoutsPerWeek}x/week
                </div>
              )}
              <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                <Target className="w-4 h-4" />
                <span className="capitalize">{program.fitnessLevel}</span>
              </div>
              {program.averageRating && (
                <div className="flex items-center gap-1.5 text-sm text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  {program.averageRating.toFixed(1)} ({program.reviewCount})
                </div>
              )}
              {program.totalSales && program.totalSales > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                  <Users className="w-4 h-4" />
                  {program.totalSales} enrolled
                </div>
              )}
            </div>

            {/* Description */}
            {program.description && (
              <p className="text-zinc-400 leading-relaxed">{program.description}</p>
            )}

            {/* Equipment */}
            {program.equipment && program.equipment.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-zinc-400 mb-2">Equipment needed:</p>
                <div className="flex flex-wrap gap-2">
                  {program.equipment.map((item, i) => (
                    <span key={i} className="px-3 py-1 bg-zinc-800 rounded-full text-sm capitalize">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Long Description */}
          {program.longDescription && (
            <div className="mb-6">
              <h3 className="font-medium mb-3">About This Program</h3>
              <div className="text-zinc-400 leading-relaxed whitespace-pre-line">
                {program.longDescription}
              </div>
            </div>
          )}

          {/* Weeks */}
          <div className="mb-6">
            <h3 className="font-medium mb-3">Program Content</h3>
            <div className="space-y-2">
              {Array.from({ length: program.durationWeeks }, (_, i) => {
                const weekNum = i + 1;
                const week = program.weeks?.find(w => w.weekNumber === weekNum);
                const isCompleted = purchaseInfo?.completedWeeks?.includes(weekNum);
                const isCurrent = purchaseInfo?.currentWeek === weekNum;
                const isUnlocked = isOwned && (weekNum === 1 || (purchaseInfo?.currentWeek && weekNum <= purchaseInfo.currentWeek + 1));

                return (
                  <button
                    key={weekNum}
                    onClick={() => isUnlocked && setActiveWeek(activeWeek === weekNum ? null : weekNum)}
                    disabled={!isOwned}
                    className={`w-full rounded-xl p-4 flex items-center gap-4 transition-all ${
                      isOwned
                        ? isUnlocked
                          ? 'bg-zinc-900 hover:bg-zinc-800'
                          : 'bg-zinc-900/50 cursor-not-allowed'
                        : 'bg-zinc-900/30 cursor-not-allowed'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isCompleted
                        ? 'bg-green-500/20 text-green-500'
                        : isCurrent
                        ? 'bg-orange-500/20 text-orange-500'
                        : isUnlocked
                        ? 'bg-zinc-800 text-white'
                        : 'bg-zinc-800/50 text-zinc-600'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : isUnlocked ? (
                        <span className="font-bold">{weekNum}</span>
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`font-medium ${!isUnlocked && 'text-zinc-600'}`}>
                        {week?.name || `Week ${weekNum}`}
                      </p>
                      {week?.description && (
                        <p className="text-sm text-zinc-500 truncate">{week.description}</p>
                      )}
                    </div>
                    {isUnlocked && (
                      <ChevronRight className={`w-5 h-5 text-zinc-600 transition-transform ${
                        activeWeek === weekNum ? 'rotate-90' : ''
                      }`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Week Detail */}
          {activeWeek && isOwned && (
            <div className="mb-6 bg-zinc-900 rounded-xl p-4">
              <h4 className="font-medium mb-4">Week {activeWeek} Workouts</h4>
              {program.weeks?.find(w => w.weekNumber === activeWeek)?.workouts?.length ? (
                <div className="space-y-2">
                  {program.weeks.find(w => w.weekNumber === activeWeek)?.workouts?.map((workout: any, i: number) => (
                    <div key={i} className="bg-zinc-800 rounded-lg p-3 flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                        <Dumbbell className="w-4 h-4 text-orange-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{workout.name || `Day ${i + 1}`}</p>
                        {workout.duration && (
                          <p className="text-sm text-zinc-500">{workout.duration} min</p>
                        )}
                      </div>
                      <Play className="w-5 h-5 text-zinc-600" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-500 text-center py-4">
                  Workouts for this week will be available soon
                </p>
              )}

              {purchaseInfo?.currentWeek !== activeWeek && (
                <button
                  onClick={() => handleStartWeek(activeWeek)}
                  className="w-full mt-4 py-3 bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl font-medium"
                >
                  Start Week {activeWeek}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Purchase Bar */}
      {!isOwned && (
        <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 p-4">
          <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">${displayPrice}</span>
                {hasDiscount && (
                  <span className="text-sm text-zinc-500 line-through">${program.price}</span>
                )}
              </div>
              {hasDiscount && (
                <p className="text-sm text-green-500">
                  Save ${(program.price - program.salePrice!).toFixed(0)}
                </p>
              )}
            </div>
            <button
              onClick={handlePurchase}
              disabled={purchasing}
              className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {purchasing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  Get Program
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Owned - Continue Button */}
      {isOwned && (
        <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 p-4">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => {
                const currentWeek = purchaseInfo?.currentWeek || 1;
                setActiveWeek(currentWeek);
              }}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl font-medium flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Continue Week {purchaseInfo?.currentWeek || 1}
            </button>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {showVideoPreview && program?.previewVideoUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowVideoPreview(false)}
        >
          <div className="relative w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowVideoPreview(false)}
              className="absolute -top-12 right-0 text-white hover:text-zinc-300"
            >
              Close
            </button>
            <video
              src={program.previewVideoUrl}
              controls
              autoPlay
              className="w-full rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
