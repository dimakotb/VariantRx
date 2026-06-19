import type { ReactNode } from 'react';
import TopBar from '@/components/layout/TopBar';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col font-sans overflow-hidden">
      <TopBar />
      {children}
    </div>
  );
}
