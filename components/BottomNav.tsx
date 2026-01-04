'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Calendar,
  Dumbbell,
  Trophy,
  User,
  Timer,
  Utensils,
  Target,
  BarChart3
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/timer', label: 'Timer', icon: Timer },
  { href: '/habits', label: 'Habits', icon: Target },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Don't show on login, register, onboarding pages
  const hiddenPaths = ['/login', '/register', '/onboarding', '/forgot-password'];
  if (hiddenPaths.some(path => pathname.startsWith(path))) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 safe-area-pb">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all ${
                isActive
                  ? 'text-violet-400'
                  : 'text-white/50 hover:text-white/80 active:scale-95'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className={`text-xs mt-1 ${isActive ? 'font-medium' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 w-12 h-0.5 bg-violet-400 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
