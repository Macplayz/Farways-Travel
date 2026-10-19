'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Compass, 
  ShieldCheck, 
  Building2, 
  Plane, 
  TrainFront, 
  Car, 
  Ticket, 
  User, 
  Lock, 
  Eye, 
  RotateCcw, 
  Sparkles, 
  Database, 
  CheckCircle2, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { DatabaseStatusPill } from '@/components/DatabaseStatusModal';

export function Footer() {
  return (
    <footer className="bg-white border-t border-line text-xs text-slate mt-16 print:hidden">
      {/* =========================================================================
          TOP BANNER: ETHICAL HCI PLEDGE & LAB USABILITY BADGES
          ========================================================================= */}
      <div className="bg-gradient-to-r from-ink via-ocean-dark to-ocean text-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-white/15">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md border border-white/20 text-sky-deep">
                <ShieldCheck className="w-3.5 h-3.5 text-green-300" />
                <span>The Farways Ethical Travel Commitment</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Travel Booking Engineered for Human Well-Being, Not Dark Patterns.
              </h2>
              <p className="text-xs sm:text-sm text-sky/80 leading-relaxed">
                An IEEE HCI empirical benchmark eliminating fabricated urgency timers, hidden checkout markups, 
                and cognitive visual fatigue found on commercial aggregators. Every rate is guaranteed 100% tax-included.
              </p>
            </div>

            {/* Quick Live DB Inspector Trigger in Banner */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shrink-0 flex flex-col sm:flex-row sm:items-center gap-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-sky-deep tracking-wider block">
                  Evaluation Data Layer
                </span>
                <span className="text-xs font-bold text-white block">
                  Supabase PostgreSQL / Local Fallback
                </span>
              </div>
              <DatabaseStatusPill />
            </div>
          </div>

          {/* Lab 1–9 Usability Compliance Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
            {/* Badge 1: WCAG AAA Contrast */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-green/20 text-green-300 flex items-center justify-center shrink-0">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white text-xs">WCAG AAA Contrast</div>
                <div className="text-[10px] text-sky/70">Anti-fatigue visual tokens</div>
              </div>
            </div>

            {/* Badge 2: Zero Drip-Pricing Certified */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white text-xs">Zero Drip Pricing</div>
                <div className="text-[10px] text-sky/70">100% upfront itemized fare</div>
              </div>
            </div>

            {/* Badge 3: Neutral Opt-In Verified */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-sky-deep/20 text-sky-deep flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white text-xs">Neutral Opt-In</div>
                <div className="text-[10px] text-sky/70">Zero pre-checked addons</div>
              </div>
            </div>

            {/* Badge 4: Non-Destructive Session Guard */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white text-xs">Session Resilience</div>
                <div className="text-[10px] text-sky/70">Zero data loss on token drops</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MAIN SITEMAP & DIRECTORY LINKS
          ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          
          {/* Brand Info & Mission */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-ocean text-white flex items-center justify-center shadow-xs">
                <Compass className="w-4 h-4" />
              </div>
              <span className="text-xl font-black text-ink tracking-tight">
                Farways
              </span>
            </Link>
            <p className="text-slate leading-relaxed max-w-sm">
              The first transparent travel booking platform engineered for academic evaluation in Human-Computer Interaction. 
              Benchmarking honest design systems against dark pattern market leaders.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-muted">
              <span>IEEE HCI Usability Paper Artifact</span>
              <span>•</span>
              <span>Next.js 14 & Supabase</span>
            </div>
          </div>

          {/* Travel Modes */}
          <div className="space-y-3">
            <h3 className="font-extrabold uppercase text-ink tracking-wider text-[11px]">
              Travel Modes
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/?tab=stays" className="hover:text-ocean flex items-center gap-1.5 transition-colors">
                  <Building2 className="w-3.5 h-3.5 text-ocean" />
                  <span>Stays & Hotels (24)</span>
                </Link>
              </li>
              <li>
                <Link href="/?tab=flights" className="hover:text-ocean flex items-center gap-1.5 transition-colors">
                  <Plane className="w-3.5 h-3.5 text-ocean" />
                  <span>Airlines & Flights (8)</span>
                </Link>
              </li>
              <li>
                <Link href="/?tab=trains" className="hover:text-ocean flex items-center gap-1.5 transition-colors">
                  <TrainFront className="w-3.5 h-3.5 text-ocean" />
                  <span>Indian Railways (8)</span>
                </Link>
              </li>
              <li>
                <Link href="/?tab=cabs" className="hover:text-ocean flex items-center gap-1.5 transition-colors">
                  <Car className="w-3.5 h-3.5 text-ocean" />
                  <span>Airport Cabs (8)</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Traveler Center */}
          <div className="space-y-3">
            <h3 className="font-extrabold uppercase text-ink tracking-wider text-[11px]">
              Traveler Center
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="hover:text-ocean flex items-center gap-1.5 transition-colors">
                  <Ticket className="w-3.5 h-3.5 text-ocean" />
                  <span>My Trips & Itineraries</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-ocean flex items-center gap-1.5 transition-colors">
                  <User className="w-3.5 h-3.5 text-ocean" />
                  <span>Profile & Preferences</span>
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-ocean flex items-center gap-1.5 transition-colors">
                  <span>Sign In / Register</span>
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-ocean flex items-center gap-1.5 transition-colors">
                  <span>Checkout & Price Lock</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* HCI Methodology & Research */}
          <div className="space-y-3">
            <h3 className="font-extrabold uppercase text-ink tracking-wider text-[11px]">
              HCI Research Labs
            </h3>
            <ul className="space-y-2 text-slate">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-green shrink-0" />
                <span>Lab 1: Deceptive Drip Neutralization</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-green shrink-0" />
                <span>Lab 3: Middle-Aged & Elderly Usability</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-green shrink-0" />
                <span>Lab 4: Tab Hoarding Reduction</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-green shrink-0" />
                <span>Lab 8: Session Fault Recovery</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Legal, Ethics, & Evaluation Bar */}
        <div className="pt-8 mt-8 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-muted">
          <div>
            © {new Date().getFullYear()} Farways Ethical Travel Platform. All Rights Reserved. IEEE Transactions on Human-Computer Interaction.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-ink font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-green" />
              <span>Zero Behavioral Ad Tracking</span>
            </span>
            <span>•</span>
            <span>WCAG 2.1 AAA Compliant</span>
            <span>•</span>
            <span className="font-mono text-ink">v1.4.2</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
