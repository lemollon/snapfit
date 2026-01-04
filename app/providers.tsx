'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/lib/theme-context';
import { ToastProvider } from '@/components/Toast';
import { ReactNode } from 'react';
import AIChatBar from '@/components/AIChatBar';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <ToastProvider>
          {children}
          <AIChatBar />
        </ToastProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
