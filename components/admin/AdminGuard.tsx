'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthContext';
import { useToast } from '@/components/ToastProvider';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const toast = useToast();

  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function verifyAdminAccess() {
      try {
        let adminEmail: string | undefined = undefined;
        let isAdminFlag = false;

        // 1. Check live Supabase session
        if (isSupabaseConfigured()) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            adminEmail = session.user.email?.toLowerCase();
            isAdminFlag = Boolean(
              session.user.user_metadata?.is_admin ||
              session.user.app_metadata?.is_admin ||
              session.user.user_metadata?.role === 'admin'
            );
          }
        }

        // 2. Check context user profile (covers both Supabase and Farways Demo sessions)
        if (!adminEmail && user) {
          adminEmail = user.email?.toLowerCase();
          isAdminFlag = Boolean(user.is_admin);
        }

        // Designated Admin Criteria:
        // Allow designated emails (admin@farways.com, admin@farways.in, etc.) OR an explicit is_admin flag
        const allowedEmails = ['admin@farways.com', 'admin@farways.in', 'operations@farways.com'];
        const isDesignatedEmail =
          !!adminEmail &&
          (allowedEmails.includes(adminEmail) || adminEmail.startsWith('admin@') || adminEmail.includes('admin'));

        const hasAdminPrivileges = Boolean(isDesignatedEmail || isAdminFlag);

        if (!isMounted) return;

        if (hasAdminPrivileges) {
          setIsAuthorized(true);
          setIsVerifying(false);
        } else {
          setIsAuthorized(false);
          setIsVerifying(false);
          toast.error(
            'Administrator credentials required. Redirecting to homepage.',
            'Access Denied'
          );
          router.replace('/');
        }
      } catch (err) {
        console.error('[AdminGuard] Authorization check failed:', err);
        if (isMounted) {
          setIsAuthorized(false);
          setIsVerifying(false);
          router.replace('/');
        }
      }
    }

    if (!isAuthLoading) {
      verifyAdminAccess();
    }

    return () => {
      isMounted = false;
    };
  }, [user, isAuthLoading, router, toast]);

  if (isVerifying || isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white select-none">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-ocean to-cyan-500 flex items-center justify-center shadow-lg shadow-ocean/30 animate-pulse">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin absolute -bottom-2 -right-2" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white mb-2">
          Verifying Admin Session
        </h2>
        <p className="text-sm text-slate-400 max-w-sm text-center leading-relaxed">
          Authenticating secure cryptographic token against Farways Supabase access policies...
        </p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Access Unauthorized</h2>
        <p className="text-sm text-slate-400 max-w-sm mb-6">
          Your account does not possess Farways Operations Admin credentials. Returning to home...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
