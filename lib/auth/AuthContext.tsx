'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured, farwaysDataService } from '@/lib/supabase/client';
import { UserProfile } from '@/types/farways';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  signIn: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    fullName: string,
    identifier: string,
    password: string,
    marketingOptIn: boolean,
    details?: { phone?: string; city?: string }
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  demoLogin: (preset?: 'evaluator' | 'arjun' | 'priya') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: Record<string, UserProfile> = {
  evaluator: {
    id: 'usr-eval-01',
    email: 'evaluator@iit.ac.in',
    fullName: 'Prof. Arvind Sharma (HCI Evaluator)',
    phone: '9820198201',
    city: 'Mumbai',
    preferredCurrency: 'INR',
    rewardPoints: 1500,
    preferences: {
      marketingOptIn: false,
      transparentPriceDisplay: 'detailed_itemized',
      ecoFriendlyFilter: true,
    },
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  arjun: {
    id: 'usr-arjun-01',
    email: 'arjun.sharma@example.com',
    fullName: 'Arjun Sharma',
    phone: '9820123456',
    city: 'Mumbai',
    preferredCurrency: 'INR',
    rewardPoints: 500,
    preferences: {
      marketingOptIn: false,
      transparentPriceDisplay: 'detailed_itemized',
      ecoFriendlyFilter: true,
    },
    createdAt: '2026-01-15T10:00:00.000Z',
  },
  priya: {
    id: 'usr-priya-02',
    email: 'priya.patel@example.com',
    fullName: 'Priya Patel',
    phone: '9876543210',
    city: 'Delhi NCR',
    preferredCurrency: 'INR',
    rewardPoints: 750,
    preferences: {
      marketingOptIn: false,
      transparentPriceDisplay: 'all_inclusive',
      ecoFriendlyFilter: false,
    },
    createdAt: '2026-02-01T14:30:00.000Z',
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  // Load initial session
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        if (isSupabaseConfigured()) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            const dbProfile = await farwaysDataService.getUserProfile(session.user.id || session.user.email || '');
            const profile: UserProfile = {
              id: session.user.id,
              email: session.user.email || '',
              fullName: dbProfile?.fullName || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Traveler',
              phone: dbProfile?.phone || session.user.phone,
              city: dbProfile?.city,
              preferredCurrency: dbProfile?.preferredCurrency || 'INR',
              rewardPoints: dbProfile?.rewardPoints ?? 500,
              preferences: {
                marketingOptIn: dbProfile?.marketingOptIn ?? session.user.user_metadata?.marketing_opt_in ?? false,
                transparentPriceDisplay: 'detailed_itemized',
                ecoFriendlyFilter: false,
              },
              createdAt: session.user.created_at,
            };
            setUser(profile);
            setIsLoading(false);
            return;
          }
        }

        // Local storage demo fallback
        if (typeof window !== 'undefined') {
          const cached = localStorage.getItem('farways_current_user');
          if (cached && mounted) {
            try {
              const parsed = JSON.parse(cached);
              setUser(parsed);
            } catch {
              localStorage.removeItem('farways_current_user');
            }
          }
        }
      } catch (err) {
        console.warn('[Farways Auth] Init session error:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initAuth();

    // Listen to Supabase auth events if connected
    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;
        if (event === 'SIGNED_IN' && session?.user) {
          const dbProfile = await farwaysDataService.getUserProfile(session.user.id || session.user.email || '');
          const profile: UserProfile = {
            id: session.user.id,
            email: session.user.email || '',
            fullName: dbProfile?.fullName || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Traveler',
            phone: dbProfile?.phone || session.user.phone,
            city: dbProfile?.city,
            preferredCurrency: dbProfile?.preferredCurrency || 'INR',
            rewardPoints: dbProfile?.rewardPoints ?? 500,
            preferences: {
              marketingOptIn: dbProfile?.marketingOptIn ?? session.user.user_metadata?.marketing_opt_in ?? false,
              transparentPriceDisplay: 'detailed_itemized',
              ecoFriendlyFilter: false,
            },
            createdAt: session.user.created_at,
          };
          setUser(profile);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('farways_current_user');
          }
        }
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, []);

  const openAuthModal = useCallback((mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const signIn = async (identifier: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanId = identifier.trim().toLowerCase();
    
    // Live Supabase Authentication if connected
    if (isSupabaseConfigured()) {
      try {
        const isPhone = /^[6-9]\d{9}$/.test(cleanId);
        const { data, error } = isPhone
          ? await supabase.auth.signInWithPassword({ phone: `+91${cleanId}`, password })
          : await supabase.auth.signInWithPassword({ email: cleanId, password });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          const dbProfile = await farwaysDataService.getUserProfile(data.user.id || data.user.email || '');
          const profile: UserProfile = {
            id: data.user.id,
            email: data.user.email || cleanId,
            fullName: dbProfile?.fullName || data.user.user_metadata?.full_name || cleanId.split('@')[0] || 'Traveler',
            phone: dbProfile?.phone || data.user.phone || (isPhone ? cleanId : undefined),
            city: dbProfile?.city,
            preferredCurrency: dbProfile?.preferredCurrency || 'INR',
            rewardPoints: dbProfile?.rewardPoints ?? 500,
            preferences: {
              marketingOptIn: dbProfile?.marketingOptIn ?? data.user.user_metadata?.marketing_opt_in ?? false,
              transparentPriceDisplay: 'detailed_itemized',
              ecoFriendlyFilter: false,
            },
            createdAt: data.user.created_at,
          };

          await farwaysDataService.upsertUserProfile(profile);
          setUser(profile);
          closeAuthModal();
          return { success: true };
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Authentication failed';
        return { success: false, error: message };
      }
    }

    // Graceful Demo / Local Auth Mode
    const isIndianPhone = /^[6-9]\d{9}$/.test(cleanId);
    const mockEmail = isIndianPhone ? `${cleanId}@mobile.farways.in` : cleanId;
    const mockName = cleanId.includes('@') ? cleanId.split('@')[0] : `Traveler ${cleanId.slice(-4)}`;

    const existingProfile = await farwaysDataService.getUserProfile(cleanId);

    const profile: UserProfile = {
      id: existingProfile?.id || `usr-${Date.now()}`,
      email: existingProfile?.email || mockEmail,
      fullName: existingProfile?.fullName || (mockName.charAt(0).toUpperCase() + mockName.slice(1)),
      phone: existingProfile?.phone || (isIndianPhone ? cleanId : undefined),
      city: existingProfile?.city,
      preferredCurrency: existingProfile?.preferredCurrency || 'INR',
      rewardPoints: existingProfile?.rewardPoints ?? 500,
      preferences: {
        marketingOptIn: existingProfile?.marketingOptIn ?? false,
        transparentPriceDisplay: 'detailed_itemized',
        ecoFriendlyFilter: false,
      },
      createdAt: existingProfile?.createdAt || new Date().toISOString(),
    };

    await farwaysDataService.upsertUserProfile(profile);
    setUser(profile);
    if (typeof window !== 'undefined') {
      localStorage.setItem('farways_current_user', JSON.stringify(profile));
    }
    closeAuthModal();
    return { success: true };
  };

  const signUp = async (
    fullName: string,
    identifier: string,
    password: string,
    marketingOptIn: boolean,
    details?: { phone?: string; city?: string }
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanName = fullName.trim();
    const cleanId = identifier.trim().toLowerCase();
    const isIndianPhone = /^[6-9]\d{9}$/.test(cleanId);
    const resolvedPhone = details?.phone?.trim() || (isIndianPhone ? cleanId : undefined);
    const resolvedCity = details?.city?.trim();

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = isIndianPhone
          ? await supabase.auth.signUp({
              phone: `+91${cleanId}`,
              password,
              options: {
                data: { full_name: cleanName, marketing_opt_in: marketingOptIn, city: resolvedCity },
              },
            })
          : await supabase.auth.signUp({
              email: cleanId,
              password,
              options: {
                data: { full_name: cleanName, marketing_opt_in: marketingOptIn, city: resolvedCity },
              },
            });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            email: data.user.email || cleanId,
            fullName: cleanName,
            phone: resolvedPhone,
            city: resolvedCity,
            preferredCurrency: 'INR',
            rewardPoints: 500,
            preferences: {
              marketingOptIn,
              transparentPriceDisplay: 'detailed_itemized',
              ecoFriendlyFilter: false,
            },
            createdAt: data.user.created_at,
          };
          await farwaysDataService.upsertUserProfile(profile);
          setUser(profile);
          closeAuthModal();
          return { success: true };
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Sign up failed';
        return { success: false, error: message };
      }
    }

    // Graceful Demo / Local Fallback
    const profile: UserProfile = {
      id: `usr-${Date.now()}`,
      email: isIndianPhone ? `${cleanId}@mobile.farways.in` : cleanId,
      fullName: cleanName,
      phone: resolvedPhone,
      city: resolvedCity,
      preferredCurrency: 'INR',
      rewardPoints: 500,
      preferences: {
        marketingOptIn,
        transparentPriceDisplay: 'detailed_itemized',
        ecoFriendlyFilter: false,
      },
      createdAt: new Date().toISOString(),
    };

    await farwaysDataService.upsertUserProfile(profile);
    setUser(profile);
    if (typeof window !== 'undefined') {
      localStorage.setItem('farways_current_user', JSON.stringify(profile));
    }
    closeAuthModal();
    return { success: true };
  };

  const signOut = async () => {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Safe fallback
      }
    }
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('farways_current_user');
    }
  };

  const demoLogin = (preset: 'evaluator' | 'arjun' | 'priya' = 'evaluator') => {
    const selected = DEMO_USERS[preset] || DEMO_USERS.evaluator;
    farwaysDataService.upsertUserProfile(selected);
    setUser(selected);
    if (typeof window !== 'undefined') {
      localStorage.setItem('farways_current_user', JSON.stringify(selected));
    }
    closeAuthModal();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        signIn,
        signUp,
        signOut,
        demoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
