import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'SnapFit - AI Workout Planner',
  description: 'Snap. Train. Transform. AI-powered workout planning based on your environment.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased bg-white dark:bg-black text-zinc-900 dark:text-white transition-colors">
        <Providers>
          <main className="pb-20 md:pb-0">
            {children}
          </main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
