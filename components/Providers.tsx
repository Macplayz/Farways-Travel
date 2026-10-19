'use client';

import React from 'react';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { ToastProvider } from '@/components/ToastProvider';
import { SessionGuardProvider } from '@/components/SessionGuard';
import { Navbar } from '@/components/Navbar';
import { AuthModal } from '@/components/AuthModal';
import { CompareProvider } from '@/components/CompareTray';
import { AiSupportWidget } from '@/components/AiSupportWidget';
import { Footer } from '@/components/Footer';

export function Providers({ children }: { children: React.ReactNode }) {
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

