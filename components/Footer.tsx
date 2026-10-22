'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
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
} from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-line text-xs text-slate mt-16 print:hidden">
      {/* =========================================================================
          TOP BANNER: COMMERCIAL TRUST PLEDGE & SECURITY BADGES
          ========================================================================= */}
      <div className="bg-gradient-to-r from-ink via-ocean-dark to-ocean text-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-white/15">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md border border-white/20 text-sky-deep">
                <ShieldCheck className="w-3.5 h-3.5 text-green-300" />
                <span>The Farways Total-Fare Promise</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Travel Booking Built for Trust, Transparency & Peace of Mind.
              </h2>
              <p className="text-xs sm:text-sm text-sky/80 leading-relaxed">
                We eliminate fabricated urgency countdowns, deceptive drip pricing, and unwanted pre-selected add-ons. 
                Every price displayed is the exact, all-inclusive fare you pay at checkout.
              </p>
            </div>

            {/* Commercial Trust Verification */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shrink-0 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/30">
                <ShieldCheck className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase text-emerald-300 tracking-wider block">
                  Verified Booking Platform
                </span>
                <span className="text-xs font-bold text-white block">
                  100% Guaranteed All-Inclusive Pricing
                </span>
              </div>
            </div>
          </div>

          {/* Standard Commercial Trust Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
            {/* Badge 1: 256-Bit SSL Secured */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-green/20 text-green-300 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white text-xs">256-Bit SSL Secured</div>
                <div className="text-[10px] text-sky/70">Bank-grade checkout encryption</div>
              </div>
            </div>

            {/* Badge 2: Verified Price Guarantee */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white text-xs">Verified Price Guarantee</div>
                <div className="text-[10px] text-sky/70">Zero hidden drip markups</div>
              </div>
            </div>

            {/* Badge 3: 24/7 Customer Support */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-sky-deep/20 text-sky-deep flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white text-xs">24/7 Customer Care</div>
                <div className="text-[10px] text-sky/70">Live travel concierge support</div>
              </div>
            </div>

            {/* Badge 4: Zero Hidden Surcharges */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white text-xs">Zero Hidden Surcharges</div>
                <div className="text-[10px] text-sky/70">100% upfront itemized fares</div>
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
            <Link href="/" className="inline-flex rounded-md" aria-label="Farways Home">
              <span className="relative block h-12 w-48 overflow-hidden rounded-md">
                <Image
                  src="/farways-logo.png"
                  alt="Farways"
                  width={160}
                  height={160}
                  className="h-full w-full object-cover object-center"
                />
              </span>
            </Link>
            <p className="text-slate leading-relaxed max-w-sm">
              India&apos;s leading transparent travel booking platform. 
              We bring honesty and clarity back to travel reservations with guaranteed upfront pricing across Stays, Flights, Trains, and Cabs.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-muted">
              <span>Customer Trust Charter</span>
              <span>•</span>
              <span>100% Verified Fares</span>
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

          {/* Why Choose Farways */}
          <div className="space-y-3">
            <h3 className="font-extrabold uppercase text-ink tracking-wider text-[11px]">
              Why Choose Farways
            </h3>
            <ul className="space-y-2 text-slate">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-green shrink-0" />
                <span>Zero Hidden Convenience Fees</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-green shrink-0" />
                <span>Zero Pre-Checked Add-on Traps</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-green shrink-0" />
                <span>Side-by-Side Comparison Engine</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-green shrink-0" />
                <span>Protected Booking Sessions</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Legal, Security, & Standards Bar */}
        <div className="pt-8 mt-8 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-muted">
          <div>
            © {new Date().getFullYear()} Farways Travel Technologies Inc. All Rights Reserved. Consumer-First Transparent Travel Booking.
            <span className="block mt-1">Made by: Neelay, Twisha, Param</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-ink font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-green" />
              <span>Zero Behavioral Ad Tracking</span>
            </span>
            <span>•</span>
            <span>PCI-DSS & SSL Compliant</span>
            <span>•</span>
            <span>WCAG 2.1 AAA Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
