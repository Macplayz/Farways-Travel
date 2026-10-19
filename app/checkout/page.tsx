'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Check, 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  FileCheck, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { farwaysDataService } from '@/lib/supabase/client';
import { Stay, Flight, Train, Cab, Addon, ItemType } from '@/types/farways';
import { OrderSummaryCard } from '@/components/checkout/OrderSummaryCard';
import { NeutralAddonsPanel } from '@/components/checkout/NeutralAddonsPanel';
import { TravelerAndPaymentForm } from '@/components/checkout/TravelerAndPaymentForm';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const rawType = (searchParams.get('type') || 'stay') as ItemType;
  const rawId = searchParams.get('id') || 'stay-mum-01';

  const [item, setItem] = useState<Stay | Flight | Train | Cab | null>(null);
  const [itemType, setItemType] = useState<ItemType>(rawType);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load selected inventory item from Supabase / Data Service
  useEffect(() => {
    let active = true;

    async function loadItem() {
      setIsLoading(true);
      try {
        let loaded: Stay | Flight | Train | Cab | null = null;
        if (rawType === 'flight') {
          loaded = await farwaysDataService.getFlightById(rawId);
          if (!loaded) loaded = await farwaysDataService.getFlightById('flt-01');
        } else if (rawType === 'train') {
          loaded = await farwaysDataService.getTrainById(rawId);
          if (!loaded) loaded = await farwaysDataService.getTrainById('trn-01');
        } else if (rawType === 'cab') {
          loaded = await farwaysDataService.getCabById(rawId);
          if (!loaded) loaded = await farwaysDataService.getCabById('cab-01');
        } else {
          loaded = await farwaysDataService.getStayById(rawId);
          if (!loaded) loaded = await farwaysDataService.getStayById('stay-mum-01');
        }

        if (active) {
          setItem(loaded);
          setItemType(rawType);
        }
      } catch (err) {
        console.warn('[Checkout Load Error]', err);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadItem();

    return () => {
      active = false;
    };
  }, [rawType, rawId]);

  const handleToggleAddon = (addon: Addon) => {
    setSelectedAddons((prev) => {
      const exists = prev.some((a) => a.id === addon.id);
      if (exists) {
        return prev.filter((a) => a.id !== addon.id);
      } else {
        return [...prev, addon];
      }
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <Loader2 className="w-10 h-10 text-ocean animate-spin mb-3" />
        <h2 className="text-base font-bold text-ink">Verifying Real-Time Inventory & Fare...</h2>
        <p className="text-xs text-slate mt-1">Connecting to live Supabase database with zero drip pricing.</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-10 h-10 text-slate mx-auto mb-3" />
        <h2 className="text-base font-bold text-ink">Selected Inventory Not Found</h2>
        <p className="text-xs text-slate mt-1 mb-4">Please return to the discovery page to select an item.</p>
        <Link href="/" className="btn-primary text-xs">
          Return to Farways Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button & context */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Search Results</span>
        </Link>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky text-ocean border border-sky-deep">
          <ShieldCheck className="w-3.5 h-3.5 text-green" />
          <span>Encrypted Checkout (256-bit TLS)</span>
        </span>
      </div>

      {/* =========================================================================
          3-STEP PROGRESS INDICATOR (Requirement 1)
          1. Review -> 2. Pay -> 3. Confirmation
          ========================================================================= */}
      <nav aria-label="Checkout Progress" className="bg-white border border-line rounded-2xl p-4 sm:p-5 shadow-subtle">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {/* Step 1: Review */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-green text-white font-bold text-xs flex items-center justify-center">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-ink">1. Review Fare</div>
              <div className="text-[10px] text-green font-medium">Verified Upfront</div>
            </div>
          </div>

          <div className="flex-1 h-0.5 bg-green mx-3 sm:mx-6"></div>

          {/* Step 2: Pay (Active) */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-ocean text-white font-bold text-xs flex items-center justify-center shadow-sm">
              2
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-ocean">2. Traveler & Pay</div>
              <div className="text-[10px] text-slate font-medium">Zero Surcharges</div>
            </div>
          </div>

          <div className="flex-1 h-0.5 bg-line mx-3 sm:mx-6"></div>

          {/* Step 3: Confirmation (Upcoming) */}
          <div className="flex items-center gap-2.5 opacity-50">
            <div className="w-7 h-7 rounded-full bg-sky-deep text-slate font-bold text-xs flex items-center justify-center">
              3
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-slate">3. Ticket Issued</div>
              <div className="text-[10px] text-slate">Instant Confirmation</div>
            </div>
          </div>
        </div>
      </nav>

      {/* =========================================================================
          TWO-COLUMN CHECKOUT LAYOUT
          Left Column (lg:col-span-7): Add-ons + Traveler & Payment Form
          Right Column (lg:col-span-5): Live Order Summary Card
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Neutral Opt-In Addons Panel (Lab 4 Wireframe) */}
          <NeutralAddonsPanel
            itemType={itemType}
            selectedAddons={selectedAddons}
            onToggleAddon={handleToggleAddon}
          />

          {/* Step 2: Validated Traveler & Payment Form */}
          <TravelerAndPaymentForm
            item={item}
            itemType={itemType}
            selectedAddons={selectedAddons}
            stayNights={itemType === 'stay' ? 2 : 1}
          />
        </div>

        {/* Right Column: Order Summary Card with Live 15s Polling */}
        <div className="lg:col-span-5">
          <OrderSummaryCard
            item={item}
            itemType={itemType}
            selectedAddons={selectedAddons}
            stayNights={itemType === 'stay' ? 2 : 1}
          />
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-sky pb-28 md:pb-20">
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-10 h-10 text-ocean animate-spin mb-3" />
            <h2 className="text-base font-bold text-ink">Preparing Checkout Session...</h2>
          </div>
        }
      >
        <CheckoutContent />
      </Suspense>
    </main>
  );
}
