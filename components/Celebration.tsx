'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap, PartyPopper, Flame, Target } from 'lucide-react';
import { triggerCelebration } from '@/lib/haptics';

interface CelebrationProps {
  type?: 'pr' | 'streak' | 'goal' | 'achievement' | 'level-up' | 'challenge';
  title?: string;
  subtitle?: string;
  isVisible: boolean;
  onComplete?: () => void;
  autoHide?: boolean;
  duration?: number;
}

const CELEBRATION_CONFIG = {
  pr: {
    icon: Trophy,
    gradient: 'from-amber-400 via-orange-500 to-red-500',
    particleColors: ['#FCD34D', '#FB923C', '#EF4444', '#FBBF24'],
    defaultTitle: 'NEW PR!',
    sound: 'success',
  },
  streak: {
    icon: Flame,
    gradient: 'from-orange-400 via-red-500 to-pink-500',
    particleColors: ['#FB923C', '#EF4444', '#EC4899', '#F97316'],
    defaultTitle: 'STREAK!',
    sound: 'streak',
  },
  goal: {
    icon: Target,
    gradient: 'from-green-400 via-emerald-500 to-teal-500',
    particleColors: ['#4ADE80', '#10B981', '#14B8A6', '#34D399'],
    defaultTitle: 'GOAL REACHED!',
    sound: 'goal',
  },
  achievement: {
    icon: Star,
    gradient: 'from-violet-400 via-purple-500 to-fuchsia-500',
    particleColors: ['#A78BFA', '#8B5CF6', '#D946EF', '#C084FC'],
    defaultTitle: 'ACHIEVEMENT!',
    sound: 'achievement',
  },
  'level-up': {
    icon: Zap,
    gradient: 'from-blue-400 via-indigo-500 to-purple-500',
    particleColors: ['#60A5FA', '#6366F1', '#8B5CF6', '#818CF8'],
    defaultTitle: 'LEVEL UP!',
    sound: 'levelup',
  },
  challenge: {
    icon: PartyPopper,
    gradient: 'from-pink-400 via-rose-500 to-red-500',
    particleColors: ['#F472B6', '#FB7185', '#EF4444', '#FDA4AF'],
    defaultTitle: 'CHALLENGE COMPLETE!',
    sound: 'challenge',
  },
};

const CONFETTI_COUNT = 50;

function Confetti({ colors }: { colors: string[] }) {
  const particles = Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 0.5,
    size: 4 + Math.random() * 8,
    rotation: Math.random() * 360,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.x}%`,
            top: '-20px',
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
          initial={{
            y: -20,
            x: 0,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            y: window.innerHeight + 100,
            x: (Math.random() - 0.5) * 200,
            rotate: particle.rotation + Math.random() * 720,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 2 + Math.random(),
            delay: particle.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

function Sparkles({ count = 12 }: { count?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const distance = 80 + Math.random() * 40;
        return (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 w-2 h-2 bg-white rounded-full"
            initial={{
              scale: 0,
              x: 0,
              y: 0,
              opacity: 1,
            }}
            animate={{
              scale: [0, 1.5, 0],
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: 0.8,
              delay: i * 0.03,
              ease: 'easeOut',
            }}
          />
        );
      })}
    </div>
  );
}

function RingWave() {
  return (
    <>
      {[0, 0.2, 0.4].map((delay, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-4 border-white/30 rounded-full"
          initial={{ width: 0, height: 0, opacity: 1 }}
          animate={{
            width: 300,
            height: 300,
            opacity: 0,
          }}
          transition={{
            duration: 1,
            delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </>
  );
}

export default function Celebration({
  type = 'achievement',
  title,
  subtitle,
  isVisible,
  onComplete,
  autoHide = true,
  duration = 3000,
}: CelebrationProps) {
  const [showContent, setShowContent] = useState(false);
  const config = CELEBRATION_CONFIG[type];
  const Icon = config.icon;

  const handleComplete = useCallback(() => {
    if (onComplete) {
      onComplete();
    }
  }, [onComplete]);

  useEffect(() => {
    if (isVisible) {
      // Trigger haptic feedback
      triggerCelebration();

      // Show content with slight delay for impact
      const showTimer = setTimeout(() => setShowContent(true), 100);

      // Auto-hide if enabled
      if (autoHide) {
        const hideTimer = setTimeout(() => {
          setShowContent(false);
          handleComplete();
        }, duration);

        return () => {
          clearTimeout(showTimer);
          clearTimeout(hideTimer);
        };
      }

      return () => clearTimeout(showTimer);
    } else {
      setShowContent(false);
    }
  }, [isVisible, autoHide, duration, handleComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowContent(false);
              handleComplete();
            }}
          />

          {/* Confetti */}
          <Confetti colors={config.particleColors} />

          {/* Ring waves */}
          <RingWave />

          {/* Main content */}
          <AnimatePresence>
            {showContent && (
              <motion.div
                className="relative z-10 flex flex-col items-center"
                initial={{ scale: 0, rotate: -180 }}
                animate={{
                  scale: 1,
                  rotate: 0,
                  transition: {
                    type: 'spring',
                    stiffness: 200,
                    damping: 15,
                  },
                }}
                exit={{
                  scale: 0,
                  rotate: 180,
                  transition: { duration: 0.3 },
                }}
              >
                {/* Sparkles */}
                <Sparkles count={16} />

                {/* Icon container */}
                <motion.div
                  className={`w-32 h-32 bg-gradient-to-br ${config.gradient} rounded-full flex items-center justify-center shadow-2xl`}
                  animate={{
                    boxShadow: [
                      '0 0 0 0 rgba(255,255,255,0.4)',
                      '0 0 0 20px rgba(255,255,255,0)',
                      '0 0 0 0 rgba(255,255,255,0)',
                    ],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: 2,
                    }}
                  >
                    <Icon className="w-16 h-16 text-white drop-shadow-lg" />
                  </motion.div>
                </motion.div>

                {/* Title */}
                <motion.h2
                  className={`mt-6 text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r ${config.gradient}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {title || config.defaultTitle}
                </motion.h2>

                {/* Subtitle */}
                {subtitle && (
                  <motion.p
                    className="mt-2 text-xl text-white/80"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {subtitle}
                  </motion.p>
                )}

                {/* Tap to dismiss */}
                <motion.p
                  className="mt-8 text-sm text-white/40"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  Tap anywhere to continue
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Export a hook for easy celebration triggering
export function useCelebration() {
  const [celebration, setCelebration] = useState<{
    isVisible: boolean;
    type: CelebrationProps['type'];
    title?: string;
    subtitle?: string;
  }>({
    isVisible: false,
    type: 'achievement',
  });

  const celebrate = useCallback((
    type: CelebrationProps['type'] = 'achievement',
    title?: string,
    subtitle?: string
  ) => {
    setCelebration({
      isVisible: true,
      type,
      title,
      subtitle,
    });
  }, []);

  const dismiss = useCallback(() => {
    setCelebration(prev => ({ ...prev, isVisible: false }));
  }, []);

  return {
    celebration,
    celebrate,
    dismiss,
    CelebrationComponent: (
      <Celebration
        type={celebration.type}
        title={celebration.title}
        subtitle={celebration.subtitle}
        isVisible={celebration.isVisible}
        onComplete={dismiss}
      />
    ),
  };
}
