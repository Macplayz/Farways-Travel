import React, { Suspense } from 'react';
import Image from 'next/image';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Compass, 
  Sparkles,
  Award
} from 'lucide-react';
import { farwaysDataService } from '@/lib/supabase/client';
import { DiscoveryEngine } from '@/components/discovery/DiscoveryEngine';

export const revalidate = 60; // 60s ISR or dynamic data

export default async function HomePage() {
  const stays = await farwaysDataService.getStays();
  const flights = await farwaysDataService.getFlights();
  const trains = await farwaysDataService.getTrains();
  const cabs = await farwaysDataService.getCabs();
  const isConnected = farwaysDataService.isConfigured();

  return (
    <main className="min-h-screen bg-sky/50 pb-28 md:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-8">
        
        {/* =========================================================================
            1. PREMIUM COMMERCIAL HERO SECTION WITH HIGH-RES PHOTOGRAPHY & DARK OVERLAY
            Elevates platform to top-tier commercial OTA standard with radical honesty
            ========================================================================= */}
        <section className="relative rounded-3xl overflow-hidden shadow-2xl text-white min-h-[440px] sm:min-h-[500px] flex flex-col justify-end p-6 sm:p-10 lg:p-14 border border-white/10 group">
          {/* High-Resolution Premium Travel Background Image via next/image */}
          <Image
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2400&q=85"
            alt="Farways Luxury Oceanfront Destination"
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover object-center transform scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
          />

          {/* Dark Commercial Vignette & Contrast Overlay (bg-black/50 + gradient) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40 backdrop-blur-[0.5px]" />

          {/* Foreground Hero Content Layer */}
          <div className="relative z-10 max-w-3xl space-y-5">
            {/* Trust Pill & Commercial Standard Badge */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-md border border-white/25 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Guaranteed Upfront Pricing · Zero Hidden Drip Fees</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-ocean/70 text-white backdrop-blur-md border border-white/20 shadow-sm hidden sm:inline-flex">
                <Award className="w-3.5 h-3.5 text-sky-200" />
                <span>Next-Gen Ethical OTA</span>
              </span>
            </div>

            {/* Headline with Luxury Commercial Typography */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white drop-shadow-md">
                Radical Transparency. <br />
                <span className="text-sky-300 font-extrabold">Exceptional Journeys.</span>
              </h1>

              <p className="text-sm sm:text-base text-gray-200 max-w-2xl leading-relaxed drop-shadow-sm pt-1">
                India’s premier travel platform designed for absolute clarity. Explore verified luxury stays, 
                non-stop flight corridors, express rail, and pre-fixed cabs with guaranteed all-inclusive fares. 
                Zero hidden service markups, zero pre-selected basket traps.
              </p>
            </div>

            {/* Glassmorphic Total-Fare Promise Banner */}
            <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 shadow-xl text-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/15">
                <span className="font-extrabold uppercase tracking-wider text-sky-300 text-[11px] flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-sky-300" />
                  <span>The Farways Total-Fare Promise</span>
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>100% Price Lock Guarantee</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block text-xs">Total Upfront Breakdown</span>
                    <span className="text-gray-300 text-[11px] leading-snug block mt-0.5">
                      Base rate, GST, and tolls are itemized on the very first card before you click.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block text-xs">Zero Sneaked Addons</span>
                    <span className="text-gray-300 text-[11px] leading-snug block mt-0.5">
                      Insurance, meals, and baggage are strictly unselected by default. Complete control.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block text-xs">Zero False Urgency</span>
                    <span className="text-gray-300 text-[11px] leading-snug block mt-0.5">
                      No countdown timers, no fabricated scarcity warnings, no confirmshaming popups.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. MULTI-MODAL TABBED DISCOVERY ENGINE
            Stays (24), Flights (8), Trains (8), Cabs (8) with live instant filtering
            ========================================================================= */}
        <Suspense fallback={
          <div className="bg-white border border-line rounded-2xl p-12 text-center shadow-subtle animate-pulse">
            <div className="w-12 h-12 bg-sky-deep rounded-full mx-auto mb-3" />
            <div className="h-4 bg-slate/20 rounded w-48 mx-auto mb-2" />
            <div className="h-3 bg-slate/10 rounded w-64 mx-auto" />
          </div>
        }>
          <DiscoveryEngine
            initialStays={stays}
            initialFlights={flights}
            initialTrains={trains}
            initialCabs={cabs}
          />
        </Suspense>

        {/* =========================================================================
            3. COMMERCIAL VALUE PROPOSITION & CONSUMER PLEDGE
            ========================================================================= */}
        <section className="bg-white border border-line rounded-2xl p-6 sm:p-8 shadow-subtle text-xs text-slate space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line">
            <div className="flex items-center gap-2">
              <span className="font-bold text-ink text-sm">The Farways Travel Charter</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky text-ocean border border-sky-deep">
                Consumer-First Guarantee
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero Price Manipulation</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-bold text-ink mb-1">True Upfront Pricing</h4>
              <p className="leading-relaxed">
                By comparing base fare, taxes, and platform markup upfront, Farways ensures the price you see on the first search card is the exact final amount charged at payment.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-ink mb-1">Side-by-Side Comparison</h4>
              <p className="leading-relaxed">
                Our intuitive comparison engine eliminates tab overload, allowing travelers to cross-reference room amenities, cancellation rules, baggage policies, and flight durations in a unified layout.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-ink mb-1">Protected Booking Sessions</h4>
              <p className="leading-relaxed">
                Intelligent session preservation guards your in-progress reservations against unexpected tab closures or timeouts, guaranteeing zero data re-entry during checkout.
              </p>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
