'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { ToastProvider } from '@/components/ToastProvider';
import { SessionGuardProvider } from '@/components/SessionGuard';
import { Navbar } from '@/components/Navbar';
import { AuthModal } from '@/components/AuthModal';
import { CompareProvider } from '@/components/CompareTray';
import { AiSupportWidget } from '@/components/AiSupportWidget';
import { Footer } from '@/components/Footer';

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return (
      <ToastProvider>
        <AuthProvider>
          <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
            {children}
          </div>
          <AuthModal />
        </AuthProvider>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <AuthProvider>
        <SessionGuardProvider>
          <CompareProvider>
            <Navbar />
            <div className="flex-1 min-h-[calc(100vh-64px)] flex flex-col justify-between">
              <div>{children}</div>
              <Footer />
            </div>
            <AuthModal />
            <AiSupportWidget />
          </CompareProvider>
        </SessionGuardProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

