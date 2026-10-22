'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured, farwaysDataService } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthContext';
import { SupportedCurrency } from '@/types/farways';

export { type SupportedCurrency } from '@/types/farways';

export const EXCHANGE_RATES: Record<SupportedCurrency, number> = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
};

export const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export const CURRENCY_LABELS: Record<SupportedCurrency, string> = {
  INR: 'INR (₹) — Indian Rupee',
  USD: 'USD ($) — US Dollar',
  EUR: 'EUR (€) — Euro',
  GBP: 'GBP (£) — British Pound',
};

export const CURRENCY_LOCALES: Record<SupportedCurrency, string> = {
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
};

interface CurrencyContextType {
  currency: SupportedCurrency;
  symbol: string;
  rates: Record<SupportedCurrency, number>;
  setCurrency: (newCurrency: SupportedCurrency) => Promise<void>;
  formatPrice: (
    baseAmountInINR: number | string | undefined | null,
    options?: { showDecimals?: boolean; includeCode?: boolean }
  ) => string;
  convertPrice: (baseAmountInINR: number | string | undefined | null) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'farways_preferred_currency';

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { user, updateProfile } = useAuth();
  const [currency, setCurrencyState] = useState<SupportedCurrency>('INR');

  // Initialize preference from user profile, or localStorage fallback
  useEffect(() => {
    if (user?.preferredCurrency) {
      setCurrencyState(user.preferredCurrency);
      return;
    }

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY) as SupportedCurrency | null;
        if (stored && EXCHANGE_RATES[stored]) {
          setCurrencyState(stored);
          return;
        }

        // Secondary fallback to legacy accessibility prefs object
        const legacyPrefs = localStorage.getItem('farways_accessibility_prefs');
        if (legacyPrefs) {
          const parsed = JSON.parse(legacyPrefs);
          if (parsed.currency && EXCHANGE_RATES[parsed.currency as SupportedCurrency]) {
            setCurrencyState(parsed.currency as SupportedCurrency);
          }
        }
      } catch (err) {
        console.warn('[CurrencyProvider] Failed to read cached currency:', err);
      }
    }
  }, [user?.preferredCurrency]);

  // Synchronize preferred_currency changes directly from active Supabase user profile on session load
  useEffect(() => {
    let isMounted = true;

    async function fetchSupabaseProfileCurrency() {
      if (!isSupabaseConfigured() || !user?.id) return;
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('preferred_currency')
          .eq('id', user.id)
          .maybeSingle();

        if (!error && data?.preferred_currency && isMounted) {
          const remoteCur = data.preferred_currency as SupportedCurrency;
          if (EXCHANGE_RATES[remoteCur]) {
            setCurrencyState(remoteCur);
            if (typeof window !== 'undefined') {
              localStorage.setItem(LOCAL_STORAGE_KEY, remoteCur);
            }
          }
        }
      } catch (err) {
        console.warn('[CurrencyProvider] Error fetching profile currency:', err);
      }
    }

    if (user?.id) {
      fetchSupabaseProfileCurrency();
    }

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const setCurrency = useCallback(
    async (newCurrency: SupportedCurrency) => {
      if (!EXCHANGE_RATES[newCurrency]) return;

      // 1. Optimistic UI update
      setCurrencyState(newCurrency);

      // 2. Local storage persistence
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, newCurrency);

          const legacyPrefs = localStorage.getItem('farways_accessibility_prefs');
          const parsed = legacyPrefs ? JSON.parse(legacyPrefs) : {};
          parsed.currency = newCurrency;
          localStorage.setItem('farways_accessibility_prefs', JSON.stringify(parsed));
        } catch (err) {
          console.warn('[CurrencyProvider] Failed to save currency locally:', err);
        }
      }

      // 3. Update Auth context if available
      if (updateProfile && user) {
        try {
          await updateProfile({ preferredCurrency: newCurrency });
        } catch (err) {
          console.warn('[CurrencyProvider] updateProfile failed:', err);
        }
      }

      // 4. Asynchronous Supabase database persistence
      if (user?.id || user?.email) {
        const targetIdentifier = user.id || user.email;
        farwaysDataService.updateUserPreferences(targetIdentifier, {
          preferredCurrency: newCurrency,
        });

        if (isSupabaseConfigured()) {
          try {
            await supabase
              .from('user_profiles')
              .update({ preferred_currency: newCurrency })
              .or(`id.eq.${user.id},email.eq.${user.email}`);
          } catch (err) {
            console.warn('[CurrencyProvider] Supabase update warning:', err);
          }
        }
      }
    },
    [user, updateProfile]
  );

  const convertPrice = useCallback(
    (baseAmountInINR: number | string | undefined | null): number => {
      if (baseAmountInINR === undefined || baseAmountInINR === null) return 0;
      const amount = typeof baseAmountInINR === 'string' ? parseFloat(baseAmountInINR) : baseAmountInINR;
      if (isNaN(amount)) return 0;

      const rate = EXCHANGE_RATES[currency] || 1;
      return amount * rate;
    },
    [currency]
  );

  const formatPrice = useCallback(
    (
      baseAmountInINR: number | string | undefined | null,
      options?: { showDecimals?: boolean; includeCode?: boolean }
    ): string => {
      if (baseAmountInINR === undefined || baseAmountInINR === null) return '';
      const amount = typeof baseAmountInINR === 'string' ? parseFloat(baseAmountInINR) : baseAmountInINR;
      if (isNaN(amount)) return '';

      const rate = EXCHANGE_RATES[currency] || 1;
      const converted = amount * rate;
      const symbol = CURRENCY_SYMBOLS[currency] || '₹';

      let formattedNumber: string;
      if (currency === 'INR') {
        formattedNumber = Math.round(converted).toLocaleString('en-IN');
      } else if (options?.showDecimals) {
        formattedNumber = converted.toLocaleString(CURRENCY_LOCALES[currency] || 'en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      } else {
        // Commercial integer rounding for clean display (e.g. $120, €110, £95)
        formattedNumber = Math.round(converted).toLocaleString(CURRENCY_LOCALES[currency] || 'en-US');
      }

      const result = `${symbol}${formattedNumber}`;
      return options?.includeCode ? `${result} ${currency}` : result;
    },
    [currency]
  );

  const value: CurrencyContextType = {
    currency,
    symbol: CURRENCY_SYMBOLS[currency] || '₹',
    rates: EXCHANGE_RATES,
    setCurrency,
    formatPrice,
    convertPrice,
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextType {
  const context = useContext(CurrencyContext);
  if (!context) {
    // Graceful fallback for components rendered outside provider
    return {
      currency: 'INR',
      symbol: '₹',
      rates: EXCHANGE_RATES,
      setCurrency: async () => {},
      formatPrice: (amount) => {
        const num = typeof amount === 'string' ? parseFloat(amount) : (amount ?? 0);
        return `₹${Math.round(num || 0).toLocaleString('en-IN')}`;
      },
      convertPrice: (amount) => {
        const num = typeof amount === 'string' ? parseFloat(amount) : (amount ?? 0);
        return num || 0;
      },
    };
  }
  return context;
}
