'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ShieldCheck, RotateCcw, AlertTriangle, ArrowRight, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { SessionDraft } from '@/types/farways';
import { useToast } from '@/components/ToastProvider';

interface SessionGuardContextType {
  saveDraft: (key: string, data: Record<string, unknown>, metadata?: { title?: string; subtitle?: string; stepName?: string }) => void;
  getDraft: (key: string) => SessionDraft | null;
  clearDraft: (key: string) => void;
  activeDraft: SessionDraft | null;
  simulateSessionExpiration: () => void;
}

const SessionGuardContext = createContext<SessionGuardContextType | undefined>(undefined);

const DRAFT_STORAGE_PREFIX = 'farways_draft_';

export function SessionGuardProvider({ children }: { children: React.ReactNode }) {
  const { user, openAuthModal, signOut } = useAuth();
  const toast = useToast();

  const [activeDraft, setActiveDraft] = useState<SessionDraft | null>(null);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [lastUserSnapshot, setLastUserSnapshot] = useState<string | null>(null);

  // Load latest active draft from sessionStorage
  const reloadLatestDraft = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const keys = Object.keys(sessionStorage).filter((k) => k.startsWith(DRAFT_STORAGE_PREFIX));
      if (keys.length > 0) {
        // Pick the most recent draft
        let latest: SessionDraft | null = null;
        for (const k of keys) {
          const raw = sessionStorage.getItem(k);
          if (raw) {
            const parsed: SessionDraft = JSON.parse(raw);
            if (!latest || parsed.timestamp > latest.timestamp) {
              latest = parsed;
            }
          }
        }
        setActiveDraft(latest);
      } else {
        setActiveDraft(null);
      }
    } catch (e) {
      console.warn('[SessionGuard] Failed to parse sessionStorage draft:', e);
    }
  }, []);

  useEffect(() => {
    reloadLatestDraft();
  }, [reloadLatestDraft]);

  // Track session termination while draft is active
  useEffect(() => {
    if (user) {
      setLastUserSnapshot(user.id);
    } else if (lastUserSnapshot && !user) {
      // User was logged in, but their session terminated or was cleared
      if (activeDraft) {
        setShowRecoveryModal(true);
      }
    }
  }, [user, lastUserSnapshot, activeDraft]);

  const saveDraft = useCallback(
    (key: string, data: Record<string, unknown>, metadata?: { title?: string; subtitle?: string; stepName?: string }) => {
      if (typeof window === 'undefined') return;
      const draft: SessionDraft = {
        id: key,
        url: window.location.pathname,
        timestamp: Date.now(),
        formData: data,
        title: metadata?.title || 'Active Booking Draft',
        subtitle: metadata?.subtitle || 'In-progress reservation',
        stepName: metadata?.stepName,
      };

      try {
        sessionStorage.setItem(`${DRAFT_STORAGE_PREFIX}${key}`, JSON.stringify(draft));
        setActiveDraft(draft);
      } catch (e) {
        console.warn('[SessionGuard] Failed to write draft to sessionStorage:', e);
      }
    },
    []
  );

  const getDraft = useCallback((key: string): SessionDraft | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = sessionStorage.getItem(`${DRAFT_STORAGE_PREFIX}${key}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const clearDraft = useCallback((key: string) => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem(`${DRAFT_STORAGE_PREFIX}${key}`);
      reloadLatestDraft();
    } catch {
      // Safe ignore
    }
  }, [reloadLatestDraft]);

  const simulateSessionExpiration = useCallback(() => {
    // Manually simulate auth token refresh without losing form drafts
    if (!activeDraft) {
      saveDraft('simulated-checkout', {
        travelerName: 'Dr. Ananya Roy',
        travelerEmail: 'ananya.roy@example.com',
        travelerPhone: '9811223344',
        specialRequests: 'Quiet room on upper floor',
      }, {
        title: 'The Taj Mahal Palace, Mumbai',
        subtitle: 'Luxury Grande Room (2 Nights)',
        stepName: 'Checkout Traveler Verification Step',
      });
    }
    signOut();
    setShowRecoveryModal(true);
    toast.warning('Auth session expired. Preserving form state non-destructively.');
  }, [activeDraft, saveDraft, signOut, toast]);

  const handleReconnect = () => {
    setShowRecoveryModal(false);
    openAuthModal('signin');
  };

  return (
    <SessionGuardContext.Provider
      value={{
        saveDraft,
        getDraft,
        clearDraft,
        activeDraft,
        simulateSessionExpiration,
      }}
    >
      {children}

      {/* Non-Destructive Session Recovery Modal */}
      {showRecoveryModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-calm"
        >
          <div className="bg-white border border-line rounded-2xl shadow-modal w-full max-w-md overflow-hidden p-6 relative">
            <button
              onClick={() => setShowRecoveryModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate hover:text-ink hover:bg-sky transition-colors cursor-pointer"
              aria-label="Dismiss recovery notice"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-xl bg-sky flex items-center justify-center text-ocean mb-4 border border-sky-deep">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green border border-green-200 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Zero-Data-Loss Session Recovery</span>
            </div>

            <h3 className="text-xl font-bold text-ink">
              Session Interrupted — We Saved Your Progress!
            </h3>

            <p className="text-xs text-slate mt-1.5 leading-relaxed">
              Your authentication session expired or disconnected. Legacy OTAs would wipe your entered form,
              forcing you to restart. Farways has safely preserved your complete draft in local session memory.
            </p>

            {activeDraft && (
              <div className="mt-4 p-3.5 rounded-xl bg-sky border border-line text-xs space-y-1">
                <div className="font-bold text-ink flex items-center justify-between">
                  <span>{activeDraft.title || 'Saved Itinerary Draft'}</span>
                  <span className="text-[10px] text-ocean font-normal">
                    {new Date(activeDraft.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {activeDraft.subtitle && (
                  <div className="text-slate">{activeDraft.subtitle}</div>
                )}
                {activeDraft.stepName && (
                  <div className="text-[11px] text-slate-muted pt-1 border-t border-line">
                    Saved at: <span className="font-medium text-ink">{activeDraft.stepName}</span>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleReconnect}
                className="w-full btn-primary py-2.5 text-sm font-bold flex items-center justify-center gap-2"
              >
                <span>Reconnect Session & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowRecoveryModal(false)}
                className="w-full btn-secondary py-2 text-xs font-medium text-slate hover:text-ink"
              >
                Dismiss (Keep Draft in Memory)
              </button>
            </div>
          </div>
        </div>
      )}
    </SessionGuardContext.Provider>
  );
}

export function useSessionGuard() {
  const context = useContext(SessionGuardContext);
  if (!context) {
    throw new Error('useSessionGuard must be used within a SessionGuardProvider');
  }
  return context;
}
