'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';

interface ThemeToggleProps {
  variant?: 'icon' | 'full' | 'compact';
  className?: string;
}

export function ThemeToggle({ variant = 'icon', className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-lg transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800 ${className}`}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-amber-400" />
        ) : (
          <Moon className="w-5 h-5 text-zinc-600" />
        )}
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={toggleTheme}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 ${className}`}
      >
        {theme === 'dark' ? (
          <>
            <Sun className="w-4 h-4 text-amber-400" />
            <span className="text-sm">Light</span>
          </>
        ) : (
          <>
            <Moon className="w-4 h-4 text-zinc-600" />
            <span className="text-sm">Dark</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div className={`flex items-center gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg ${className}`}>
      <button
        onClick={() => theme !== 'light' && toggleTheme()}
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
          theme === 'light'
            ? 'bg-white dark:bg-zinc-700 shadow-sm'
            : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'
        }`}
      >
        <Sun className={`w-4 h-4 ${theme === 'light' ? 'text-amber-500' : 'text-zinc-400'}`} />
        <span className="text-sm">Light</span>
      </button>
      <button
        onClick={() => theme !== 'dark' && toggleTheme()}
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
          theme === 'dark'
            ? 'bg-white dark:bg-zinc-700 shadow-sm'
            : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'
        }`}
      >
        <Moon className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-400' : 'text-zinc-400'}`} />
        <span className="text-sm">Dark</span>
      </button>
    </div>
  );
}
