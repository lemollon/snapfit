/**
 * Micro-animations utility using Framer Motion variants
 * These animations provide consistent, delightful interactions across the app
 */

import { Variants } from 'framer-motion';

// Fade animations
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const fadeInLeft: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const fadeInRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

// Scale animations
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};

export const popIn: Variants = {
  initial: { opacity: 0, scale: 0.5 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 15,
    },
  },
  exit: { opacity: 0, scale: 0.5 },
};

export const bounceIn: Variants = {
  initial: { opacity: 0, scale: 0.3 },
  animate: {
    opacity: 1,
    scale: [0.3, 1.1, 0.9, 1.03, 0.97, 1],
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
  exit: { opacity: 0, scale: 0.3 },
};

// Slide animations
export const slideInFromBottom: Variants = {
  initial: { y: '100%', opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
    },
  },
  exit: { y: '100%', opacity: 0 },
};

export const slideInFromTop: Variants = {
  initial: { y: '-100%', opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
    },
  },
  exit: { y: '-100%', opacity: 0 },
};

export const slideInFromLeft: Variants = {
  initial: { x: '-100%', opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
    },
  },
  exit: { x: '-100%', opacity: 0 },
};

export const slideInFromRight: Variants = {
  initial: { x: '100%', opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
    },
  },
  exit: { x: '100%', opacity: 0 },
};

// Stagger children animations
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerFast: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const staggerSlow: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

// List item animations
export const listItem: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
  exit: { opacity: 0, x: 20 },
};

// Card animations
export const cardHover = {
  scale: 1.02,
  y: -4,
  transition: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 25,
  },
};

export const cardTap = {
  scale: 0.98,
  transition: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 25,
  },
};

// Button animations
export const buttonHover = {
  scale: 1.05,
  transition: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 17,
  },
};

export const buttonTap = {
  scale: 0.95,
  transition: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 17,
  },
};

// Pulse animation for notifications
export const pulse: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatDelay: 2,
    },
  },
};

// Shake animation for errors
export const shake: Variants = {
  initial: { x: 0 },
  animate: {
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.5,
    },
  },
};

// Glow animation
export const glow = {
  boxShadow: [
    '0 0 0 0 rgba(139, 92, 246, 0)',
    '0 0 0 10px rgba(139, 92, 246, 0.3)',
    '0 0 0 20px rgba(139, 92, 246, 0)',
  ],
  transition: {
    duration: 1.5,
    repeat: Infinity,
  },
};

// Spin animation for loading
export const spin = {
  rotate: 360,
  transition: {
    duration: 1,
    repeat: Infinity,
    ease: 'linear',
  },
};

// Float animation
export const float: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-5, 5, -5],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Wiggle animation for attention
export const wiggle: Variants = {
  initial: { rotate: 0 },
  animate: {
    rotate: [-3, 3, -3, 3, 0],
    transition: {
      duration: 0.5,
    },
  },
};

// Progress bar animation
export const progressBar = (width: number): Variants => ({
  initial: { width: 0 },
  animate: {
    width: `${width}%`,
    transition: {
      duration: 1,
      ease: 'easeOut',
    },
  },
});

// Counter animation helper
export function getCounterAnimation(duration: number = 1) {
  return {
    type: 'tween' as const,
    duration,
    ease: 'easeOut',
  };
}

// Confetti particle animation
export const confettiParticle = (index: number): Variants => ({
  initial: {
    opacity: 1,
    y: 0,
    x: 0,
    rotate: 0,
  },
  animate: {
    opacity: [1, 1, 0],
    y: [0, -150 - Math.random() * 100, -100 + Math.random() * 300],
    x: [(index % 2 === 0 ? 1 : -1) * Math.random() * 150],
    rotate: Math.random() * 720,
    transition: {
      duration: 1.5 + Math.random() * 0.5,
      ease: 'easeOut',
    },
  },
});

// Page transition
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
    },
  },
};

// Modal animation
export const modalOverlay: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const modalContent: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
};

// Toast notification
export const toast: Variants = {
  initial: { opacity: 0, y: 50, scale: 0.9 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 400,
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.9,
    transition: {
      duration: 0.2,
    },
  },
};

export default {
  fadeIn,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  popIn,
  bounceIn,
  slideInFromBottom,
  slideInFromTop,
  slideInFromLeft,
  slideInFromRight,
  staggerContainer,
  staggerFast,
  staggerSlow,
  listItem,
  cardHover,
  cardTap,
  buttonHover,
  buttonTap,
  pulse,
  shake,
  glow,
  spin,
  float,
  wiggle,
  progressBar,
  confettiParticle,
  pageTransition,
  modalOverlay,
  modalContent,
  toast,
};
