'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Eye, 
  Type, 
  Coins, 
  CheckCircle2, 
  Save, 
  Sparkles, 
  Accessibility, 
  Lock 
} from 'lucide-react';
import { farwaysDataService } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthContext';
import { useToast } from '@/components/ToastProvider';

export function PreferencesView() {
  const { user } = useAuth();
  const toast = useToast();

  // Accessibility state (Lab 3 Findings)
  const [highContrast, setHighContrast] = useState(user?.highContrastMode ?? false);
  const [largerText, setLargerText] = useState(user?.largeTextMode ?? false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Currency & Display preferences
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'EUR' | 'GBP'>(
    (user?.preferredCurrency as any) || 'INR'
  );
  const [priceDisplay, setPriceDisplay] = useState<'detailed_itemized' | 'all_inclusive'>('detailed_itemized');
  const [marketingOptIn, setMarketingOptIn] = useState(
    user?.marketingOptIn ?? user?.preferences?.marketingOptIn ?? false
  );
  const [isSaving, setIsSaving] = useState(false);

  // Load saved preferences on mount or from user profile
  useEffect(() => {
    if (user) {
      if (user.highContrastMode !== undefined) setHighContrast(Boolean(user.highContrastMode));
      if (user.largeTextMode !== undefined) setLargerText(Boolean(user.largeTextMode));
      if (user.preferredCurrency) setCurrency(user.preferredCurrency as any);
      if (user.marketingOptIn !== undefined) setMarketingOptIn(Boolean(user.marketingOptIn));
    } else if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('farways_accessibility_prefs');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.highContrast !== undefined) setHighContrast(parsed.highContrast);
          if (parsed.largerText !== undefined) setLargerText(parsed.largerText);
          if (parsed.reducedMotion !== undefined) setReducedMotion(parsed.reducedMotion);
          if (parsed.currency) setCurrency(parsed.currency);
          if (parsed.priceDisplay) setPriceDisplay(parsed.priceDisplay);
          if (parsed.marketingOptIn !== undefined) setMarketingOptIn(parsed.marketingOptIn);
        }
      } catch {
        // Safe ignore
      }
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    const prefs = {
      highContrast,
      largerText,
      reducedMotion,
      currency,
      priceDisplay,
      marketingOptIn,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('farways_accessibility_prefs', JSON.stringify(prefs));

      // Apply root attributes for accessible styling
      if (highContrast) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }

      if (largerText) {
        document.documentElement.classList.add('text-scale-lg');
      } else {
        document.documentElement.classList.remove('text-scale-lg');
      }
    }

    if (user?.email || user?.id) {
      await farwaysDataService.updateUserPreferences(user.email || user.id, {
        highContrastMode: highContrast,
        largeTextMode: largerText,
        marketingOptIn,
        preferredCurrency: currency,
      });
    }

    setIsSaving(false);
    toast.success('Your accessibility & display settings have been saved to Supabase user_profiles.', 'Preferences Saved');
  };

  return (
    <div className="space-y-6 animate-calm">
      {/* Header */}
      <div className="bg-white border border-line rounded-2xl p-6 shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-line">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky text-ocean border border-sky-deep mb-1">
              <Accessibility className="w-3.5 h-3.5 text-ocean" />
              <span>Accessibility & HCI Usability Customization</span>
            </div>
            <h3 className="text-lg font-bold text-ink">
              Profile & Accessibility Preferences
            </h3>
            <p className="text-xs text-slate">
              Customized based on our Lab 3 Usability findings for middle-aged, elderly, and visual-fatigue travelers.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Preferences</span>
          </button>
        </div>

        {/* Section 1: Accessibility Controls */}
        <div className="pt-4 space-y-4">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-ink flex items-center gap-2">
            <Eye className="w-4 h-4 text-ocean" />
            <span>Visual Accessibility (Lab 3 Usability Study)</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* High Contrast Mode */}
            <label className="flex items-start gap-3 p-4 rounded-xl border border-line hover:border-sky-deep bg-sky/30 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
                className="mt-0.5 rounded border-line text-ocean focus:ring-ocean cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-bold text-ink block">High Contrast Mode</span>
                <span className="text-slate text-[11px] leading-relaxed">
                  Enhances borders and text contrast beyond standard WCAG AAA requirements to prevent eye fatigue.
                </span>
              </div>
            </label>

            {/* Larger Text Size */}
            <label className="flex items-start gap-3 p-4 rounded-xl border border-line hover:border-sky-deep bg-sky/30 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={largerText}
                onChange={(e) => setLargerText(e.target.checked)}
                className="mt-0.5 rounded border-line text-ocean focus:ring-ocean cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-bold text-ink block">Comfortable Large Text Size</span>
                <span className="text-slate text-[11px] leading-relaxed">
                  Scales fonts, touch targets, and pricing badges for elderly travelers and high-DPI displays.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Section 2: Pricing & Currency Preferences */}
        <div className="pt-6 border-t border-line mt-6 space-y-4">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-ink flex items-center gap-2">
            <Coins className="w-4 h-4 text-ocean" />
            <span>Pricing & Currency Settings</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Currency */}
            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">
                Default Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-white text-xs font-semibold text-ink focus:border-ocean focus:outline-none"
              >
                <option value="INR">INR (₹) — Indian Rupee (Default)</option>
                <option value="USD">USD ($) — US Dollar</option>
                <option value="EUR">EUR (€) — Euro</option>
                <option value="GBP">GBP (£) — British Pound</option>
              </select>
            </div>

            {/* Price Display */}
            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">
                Catalog Price Presentation
              </label>
              <select
                value={priceDisplay}
                onChange={(e) => setPriceDisplay(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-white text-xs font-semibold text-ink focus:border-ocean focus:outline-none"
              >
                <option value="detailed_itemized">
                  Detailed Itemized (Upfront Base + GST + Fee)
                </option>
                <option value="all_inclusive">
                  All-Inclusive Net Single Total
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Ethical Privacy & Neutral Opt-In */}
        <div className="pt-6 border-t border-line mt-6 space-y-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-ink flex items-center gap-2">
            <Lock className="w-4 h-4 text-ocean" />
            <span>Ethical Privacy Policy (Neutral Opt-In)</span>
          </h4>

          <label className="flex items-start gap-3 p-4 rounded-xl border border-line bg-white cursor-pointer select-none">
            <input
              type="checkbox"
              checked={marketingOptIn}
              onChange={(e) => setMarketingOptIn(e.target.checked)}
              className="mt-0.5 rounded border-line text-ocean focus:ring-ocean cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-bold text-ink block">Receive Low-Fare Flight & Hotel Alerts</span>
              <span className="text-slate text-[11px] leading-relaxed">
                Neutral opt-in: Strictly unchecked by default. Farways guarantees zero third-party data broker sharing or behavioral ad tracking.
              </span>
            </div>
          </label>
        </div>

        {/* Section 4: Authenticated Traveler Audit */}
        <div className="pt-4 border-t border-line mt-6 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-muted gap-2">
          <span>Session Traveler ID: {user?.id || 'Active Anonymous Usability Session'}</span>
          <span>Farways Ethical Travel Core v1.4.2</span>
        </div>
      </div>
    </div>
  );
}
