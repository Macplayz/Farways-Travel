import React, { Suspense } from 'react';
import { 
  ShieldCheck, 
  Eye, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Compass, 
  Lock, 
  Database,
  Layers,
  ArrowRight
} from 'lucide-react';
import { farwaysDataService } from '@/lib/supabase/client';
import { DiscoveryEngine } from '@/components/discovery/DiscoveryEngine';
import { DatabaseStatusPill } from '@/components/DatabaseStatusModal';

export const revalidate = 60; // 60s ISR or dynamic data

export default async function HomePage() {
  const stays = await farwaysDataService.getStays();
  const flights = await farwaysDataService.getFlights();
  const trains = await farwaysDataService.getTrains();
  const cabs = await farwaysDataService.getCabs();
  const isConnected = farwaysDataService.isConfigured();

  return (
    <main className="min-h-screen bg-sky pb-28 md:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* =========================================================================
            1. OCEAN-GRADIENT HERO BANNER & TOTAL-FARE PROMISE BOX
            Zero promotional pop-ups, zero carousels, zero fake countdown timers
            ========================================================================= */}
        <section className="relative rounded-3xl bg-gradient-to-br from-ink via-ocean-dark to-ocean text-white p-8 sm:p-12 shadow-card overflow-hidden">
          {/* Subtle Ambient Decorative Circles (Non-distracting) */}
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/5 blur-2xl pointer-events-none"></div>
          <div className="absolute right-1/3 -bottom-24 w-96 h-96 rounded-full bg-ocean-light/10 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl">
            {/* Top Transparent Pricing Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md border border-white/20 text-white mb-5 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-green-300" />
              <span>Guaranteed Transparent Pricing · Zero Hidden Fees</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.15] mb-4">
              Honest, Calm Travel Booking. <br />
              <span className="text-sky-deep font-normal">Without the Dark Patterns.</span>
            </h1>

            <p className="text-sm sm:text-base text-sky/90 leading-relaxed mb-8">
              Farways is India&apos;s next-generation transparent travel booking platform. 
              We eliminated deceptive drip pricing, manufactured scarcity countdowns, pre-checked add-on traps, 
              and cognitive clutter in favor of radical honesty and true all-inclusive pricing.
            </p>

            {/* Farways Total-Fare Promise Box */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 sm:p-6 shadow-subtle text-xs space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-white/15">
                <span className="font-extrabold uppercase tracking-wider text-sky-deep text-[11px] flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-sky-deep" />
                  <span>The Farways Total-Fare Promise</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/30 text-green-200 border border-green-400/30 font-bold">
                  100% Guaranteed
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-300 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Radical Upfront Breakdown</span>
                    <span className="text-white/80 text-[11px]">
                      Base rate, GST, and platform fees are itemized on every search card before you click.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-300 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Strictly Opt-In Addons</span>
                    <span className="text-white/80 text-[11px]">
                      Baggage, meals, and trip insurance are 100% unselected by default. Zero sneaking.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-300 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Zero Urgency Deception</span>
                    <span className="text-white/80 text-[11px]">
                      Zero artificial timers, zero fake &quot;Only 1 room left!&quot; anxiety drivers, zero confirmshaming.
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
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-muted hidden sm:inline">
                Live Data Engine: {isConnected ? 'Enterprise Cloud Verified' : 'Standard Engine'}
              </span>
              <DatabaseStatusPill />
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
