'use client';

import {
  Trophy,
  Flame,
  Zap,
  Star,
  Crown,
  Medal,
  Target,
  Dumbbell,
  Heart,
  Award,
  TrendingUp,
  Users,
  Calendar,
  Sparkles,
  Mountain,
  Timer,
  Rocket,
  Shield,
  Gem,
  Sun,
} from 'lucide-react';

// Map categories to icons
const CATEGORY_ICONS: Record<string, typeof Trophy> = {
  workout: Dumbbell,
  strength: Dumbbell,
  cardio: Heart,
  nutrition: Star,
  streak: Flame,
  social: Users,
  milestone: Trophy,
  special: Sparkles,
  endurance: Timer,
  challenge: Mountain,
  beginner: Rocket,
  consistency: Calendar,
  achievement: Award,
  default: Trophy,
};

// Rarity-based gradient styles
const RARITY_GRADIENTS: Record<string, { from: string; to: string; shadow: string }> = {
  common: {
    from: 'from-zinc-400',
    to: 'to-zinc-500',
    shadow: 'shadow-zinc-500/20',
  },
  rare: {
    from: 'from-blue-400',
    to: 'to-blue-600',
    shadow: 'shadow-blue-500/30',
  },
  epic: {
    from: 'from-purple-400',
    to: 'to-purple-600',
    shadow: 'shadow-purple-500/30',
  },
  legendary: {
    from: 'from-amber-400',
    to: 'to-orange-500',
    shadow: 'shadow-amber-500/40',
  },
};

// Decorative elements based on rarity
const RARITY_DECORATIONS: Record<string, { ring: boolean; pulse: boolean; sparkle: boolean }> = {
  common: { ring: false, pulse: false, sparkle: false },
  rare: { ring: true, pulse: false, sparkle: false },
  epic: { ring: true, pulse: true, sparkle: false },
  legendary: { ring: true, pulse: true, sparkle: true },
};

interface AchievementIconProps {
  category: string;
  rarity: string;
  isComplete: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_CLASSES = {
  sm: { container: 'w-8 h-8', icon: 'w-4 h-4', ring: 'w-10 h-10' },
  md: { container: 'w-12 h-12', icon: 'w-6 h-6', ring: 'w-14 h-14' },
  lg: { container: 'w-14 h-14', icon: 'w-7 h-7', ring: 'w-16 h-16' },
  xl: { container: 'w-20 h-20', icon: 'w-10 h-10', ring: 'w-24 h-24' },
};

export function AchievementIcon({
  category,
  rarity,
  isComplete,
  size = 'md',
  className = '',
}: AchievementIconProps) {
  const Icon = CATEGORY_ICONS[category] || CATEGORY_ICONS.default;
  const gradient = RARITY_GRADIENTS[rarity] || RARITY_GRADIENTS.common;
  const decoration = RARITY_DECORATIONS[rarity] || RARITY_DECORATIONS.common;
  const sizeClass = SIZE_CLASSES[size];

  if (!isComplete) {
    return (
      <div className={`relative ${className}`}>
        <div
          className={`${sizeClass.container} rounded-xl bg-zinc-700/50 flex items-center justify-center`}
        >
          <Icon className={`${sizeClass.icon} text-zinc-500`} />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Outer ring for rare+ */}
      {decoration.ring && (
        <div
          className={`absolute inset-0 ${sizeClass.ring} -m-1 rounded-2xl bg-gradient-to-br ${gradient.from} ${gradient.to} opacity-20 blur-sm`}
        />
      )}

      {/* Pulse animation for epic+ */}
      {decoration.pulse && (
        <div
          className={`absolute inset-0 ${sizeClass.container} rounded-xl bg-gradient-to-br ${gradient.from} ${gradient.to} opacity-30 animate-pulse`}
        />
      )}

      {/* Main icon container */}
      <div
        className={`relative ${sizeClass.container} rounded-xl bg-gradient-to-br ${gradient.from} ${gradient.to} flex items-center justify-center shadow-lg ${gradient.shadow}`}
      >
        <Icon className={`${sizeClass.icon} text-white drop-shadow-sm`} />

        {/* Sparkle effects for legendary */}
        {decoration.sparkle && (
          <>
            <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-300 animate-pulse" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent via-white/10 to-white/30" />
          </>
        )}
      </div>
    </div>
  );
}

// Avatar placeholder component with initials
interface AvatarPlaceholderProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const AVATAR_SIZES = {
  sm: { container: 'w-10 h-10', text: 'text-sm' },
  md: { container: 'w-16 h-16', text: 'text-xl' },
  lg: { container: 'w-24 h-24', text: 'text-3xl' },
  xl: { container: 'w-32 h-32', text: 'text-4xl' },
};

// Generate consistent color from name
function getAvatarGradient(name: string): string {
  const gradients = [
    'from-orange-500 to-pink-500',
    'from-blue-500 to-purple-500',
    'from-green-500 to-teal-500',
    'from-purple-500 to-indigo-500',
    'from-pink-500 to-rose-500',
    'from-amber-500 to-orange-500',
    'from-cyan-500 to-blue-500',
    'from-emerald-500 to-green-500',
  ];

  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
}

function getInitials(name: string): string {
  if (!name) return '?';
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

export function AvatarPlaceholder({ name, size = 'md', className = '' }: AvatarPlaceholderProps) {
  const sizeClass = AVATAR_SIZES[size];
  const gradient = getAvatarGradient(name);
  const initials = getInitials(name);

  return (
    <div
      className={`${sizeClass.container} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg ${className}`}
    >
      <span className={`${sizeClass.text} font-bold text-white drop-shadow-sm`}>{initials}</span>
    </div>
  );
}
