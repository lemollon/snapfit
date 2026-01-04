'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/lib/theme-context';
import { ReactNode } from 'react';
import AIChatBar from '@/components/AIChatBar';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        {children}
        <AIChatBar />
      </ThemeProvider>
    </SessionProvider>
  );
}
