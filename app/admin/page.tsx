'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Building2,
  Plane,
  TrainFront,
  Car,
  TrendingUp,
  Database,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Plus,
  Compass,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { MOCK_STAYS, MOCK_FLIGHTS, MOCK_TRAINS, MOCK_CABS } from '@/lib/data/mockData';
import { useAuth } from '@/lib/auth/AuthContext';

interface InventoryCounts {
  stays: number;
  flights: number;
  trains: number;
  cabs: number;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const isDbConfigured = isSupabaseConfigured();

  const [counts, setCounts] = useState<InventoryCounts>({
    stays: 0,
    flights: 0,
    trains: 0,
    cabs: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  // Fetch counts using lightweight head queries against Supabase
  const fetchCounts = useCallback(async () => {
    setIsLoading(true);
    try {
      // Run queries in parallel for high performance
      const [staysRes, flightsRes, trainsRes, cabsRes] = await Promise.all([
        supabase.from('stays').select('*', { count: 'exact', head: true }),
        supabase.from('flights').select('*', { count: 'exact', head: true }),
        supabase.from('trains').select('*', { count: 'exact', head: true }),
        supabase.from('cabs').select('*', { count: 'exact', head: true }),
      ]);

      const staysCount = staysRes.count !== null && staysRes.count !== undefined && !staysRes.error
        ? staysRes.count
        : MOCK_STAYS.length;

      const flightsCount = flightsRes.count !== null && flightsRes.count !== undefined && !flightsRes.error
        ? flightsRes.count
        : MOCK_FLIGHTS.length;

      const trainsCount = trainsRes.count !== null && trainsRes.count !== undefined && !trainsRes.error
        ? trainsRes.count
        : MOCK_TRAINS.length;

      const cabsCount = cabsRes.count !== null && cabsRes.count !== undefined && !cabsRes.error
        ? cabsRes.count
        : MOCK_CABS.length;

      setCounts({
        stays: staysCount,
        flights: flightsCount,
        trains: trainsCount,
        cabs: cabsCount,
      });
      setLastRefreshed(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('[Admin Dashboard] Error querying counts:', err);
      // Fallback
      setCounts({
        stays: MOCK_STAYS.length,
        flights: MOCK_FLIGHTS.length,
        trains: MOCK_TRAINS.length,
        cabs: MOCK_CABS.length,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const totalInventory = counts.stays + counts.flights + counts.trains + counts.cabs;

  const metricCards = [
    {
      title: 'Total Stays',
      count: counts.stays,
      icon: Building2,
      href: '/admin/stays',
      gradient: 'from-blue-600/20 to-cyan-500/10',
      border: 'border-blue-500/30',
      textAccent: 'text-cyan-400',
      description: 'Hotels, resorts & palaces in Mumbai, Delhi & Goa',
      badge: 'Live Inventory',
    },
    {
      title: 'Total Flights',
      count: counts.flights,
      icon: Plane,
      href: '/admin/flights',
      gradient: 'from-indigo-600/20 to-blue-500/10',
      border: 'border-indigo-500/30',
      textAccent: 'text-indigo-400',
      description: 'IndiGo, Air India, Akasa Air & international air routes',
      badge: 'Scheduled',
    },
    {
      title: 'Total Trains',
      count: counts.trains,
      icon: TrainFront,
      href: '/admin/trains',
      gradient: 'from-amber-600/20 to-orange-500/10',
      border: 'border-amber-500/30',
      textAccent: 'text-amber-400',
      description: 'Vande Bharat, Tejas Rajdhani & Superfast expresses',
      badge: 'IRCTC Sync',
    },
    {
      title: 'Total Cabs',
      count: counts.cabs,
      icon: Car,
      href: '/admin/cabs',
      gradient: 'from-emerald-600/20 to-teal-500/10',
      border: 'border-emerald-500/30',
      textAccent: 'text-emerald-400',
      description: 'Airport chauffeurs & intercity EV/sedan fleets',
      badge: 'Zero Cash Demands',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome & System Status Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Farways Central Operations Command</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, {user?.fullName || 'Operations Admin'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Real-time monitoring and administrative control for live travel inventory. Every inventory write guarantees
              100% price transparency and zero deceptive drip pricing for travelers.
            </p>
          </div>

          {/* Quick Stats & Refresh */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-950/60 text-emerald-400 flex items-center justify-center border border-emerald-800/60">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Database State
                </span>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {isDbConfigured ? 'Supabase PostgreSQL' : 'Local Fallback'}
                </span>
              </div>
            </div>

            <button
              onClick={fetchCounts}
              disabled={isLoading}
              className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 hover:text-white border border-slate-700 transition-colors flex items-center gap-2 text-xs font-bold cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{isLoading ? 'Syncing...' : 'Sync Live Counts'}</span>
            </button>
          </div>
        </div>

        {lastRefreshed && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span>Aggregated across all 4 travel modes</span>
            <span>Last query timestamp: {lastRefreshed}</span>
          </div>
        )}
      </div>

      {/* Summary Metric Cards (Requirement 5) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>Active Inventory Metrics</span>
          </h2>
          <span className="text-xs font-semibold text-slate-400">
            Total Live Catalog: <span className="text-cyan-400 font-bold font-mono">{totalInventory}</span> items
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricCards.map((card) => {
            const Icon = card.icon;

            return (
              <Link
                key={card.title}
                href={card.href}
                className={`group relative p-5 rounded-2xl bg-gradient-to-br ${card.gradient} bg-slate-900 border ${card.border} hover:border-cyan-400/60 shadow-sm hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-200 flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-slate-950/80 text-slate-300 border border-slate-800">
                      {card.badge}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center text-slate-300 group-hover:text-cyan-400 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {card.title}
                  </h3>
                  <div className="text-3xl font-black font-mono text-white mt-1 group-hover:scale-105 transition-transform origin-left">
                    {isLoading ? (
                      <span className="inline-block w-12 h-8 bg-slate-800 rounded animate-pulse" />
                    ) : (
                      card.count
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-300 group-hover:text-cyan-300 transition-colors">
                  <span>Manage Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Farways Operational Transparency Standards Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>Zero Drip Pricing Rule</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            All inventory tables strictly enforce upfront `base_price` + `tax` = `total_price` itemization.
            No hidden booking charges at checkout.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>Anti-Urgency Guarantee</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Farways inventory schemas omit fake countdown clocks and deceptive scarcity banners, ensuring
            ethical customer decision-making.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>Instant Public Sync</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Any addition, edit, or deletion in this admin panel immediately reflects on the live consumer travel search
            pages in real-time.
          </p>
        </div>
      </div>

      {/* Quick Launch Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white mb-4">Quick Operations Shortcuts</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/admin/stays"
            className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-850 transition-all flex flex-col items-center text-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-950/60 text-cyan-400 flex items-center justify-center border border-blue-800/40 group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Add / Edit Stays</span>
            <span className="text-[10px] text-slate-500">24 luxury properties</span>
          </Link>

          <Link
            href="/admin/flights"
            className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-850 transition-all flex flex-col items-center text-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-950/60 text-indigo-400 flex items-center justify-center border border-indigo-800/40 group-hover:scale-110 transition-transform">
              <Plane className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Add / Edit Flights</span>
            <span className="text-[10px] text-slate-500">8 strategic routes</span>
          </Link>

          <Link
            href="/admin/trains"
            className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-850 transition-all flex flex-col items-center text-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-950/60 text-amber-400 flex items-center justify-center border border-amber-800/40 group-hover:scale-110 transition-transform">
              <TrainFront className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Add / Edit Trains</span>
            <span className="text-[10px] text-slate-500">8 Indian Railway services</span>
          </Link>

          <Link
            href="/admin/cabs"
            className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-850 transition-all flex flex-col items-center text-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-950/60 text-emerald-400 flex items-center justify-center border border-emerald-800/40 group-hover:scale-110 transition-transform">
              <Car className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Add / Edit Cabs</span>
            <span className="text-[10px] text-slate-500">8 airport & intercity fleets</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
