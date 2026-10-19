'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Database, 
  Server, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Copy, 
  Check, 
  ShieldCheck, 
  Layers, 
  Wifi, 
  X, 
  FileCode,
  Sparkles,
  Plane,
  Building2,
  TrainFront,
  Car,
  Users,
  Ticket
} from 'lucide-react';
import { farwaysDataService } from '@/lib/supabase/client';
import { useToast } from '@/components/ToastProvider';

interface DatabaseStats {
  isLive: boolean;
  latencyMs: number;
  urlMasked: string;
  rowCounts: {
    stays: number;
    flights: number;
    trains: number;
    cabs: number;
    user_profiles: number;
    bookings: number;
  };
  error?: string;
}

interface DatabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DatabaseStatusModal({ isOpen, onClose }: DatabaseStatusModalProps) {
  const toast = useToast();
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);

  const fetchStats = useCallback(async () => {
    setIsPinging(true);
    try {
      const res = await farwaysDataService.pingDatabase();
      setStats(res);
    } catch (err) {
      console.error('[DB Modal] Ping error:', err);
    } finally {
      setIsPinging(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [isOpen, fetchStats]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleManualPing = async () => {
    await fetchStats();
    toast.success('Database latency and table row counts refreshed.', 'Live DB Ping Complete');
  };

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      const res = await farwaysDataService.seedRemoteDatabase();
      if (res.success) {
        toast.success(
          `Upserted ${res.counts.stays} Stays, ${res.counts.flights} Flights, ${res.counts.trains} Trains, ${res.counts.cabs} Cabs, and ${res.counts.user_profiles} User Profiles.`,
          'Remote Database Seeded'
        );
        await fetchStats();
      } else {
        toast.error(res.error || 'Failed to seed remote database.');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Database seeding error occurred.');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleCopySchemaNotice = () => {
    const notice = `-- Farways PostgreSQL Database Schema (Idempotent DDL & Seeds)
-- File location: supabase/schema.sql
-- All 6 Core Tables:
-- 1. stays (24 Hotels & Resorts)
-- 2. flights (8 Airline Routes)
-- 3. trains (8 Indian Railways Express Routes)
-- 4. cabs (8 Airport & Outstation Transfers)
-- 5. user_profiles (Registered Users & Accessibility Prefs)
-- 6. bookings (Confirmed Reservations & Cancellation Audit)

-- To execute: Open your Supabase Dashboard -> SQL Editor -> New Query -> Paste contents of supabase/schema.sql -> Run.`;

    if (navigator?.clipboard) {
      navigator.clipboard.writeText(notice);
      setCopiedSchema(true);
      toast.success('SQL schema instructions copied to clipboard. Ready to paste in Supabase SQL Editor.', 'Copied');
      setTimeout(() => setCopiedSchema(false), 2500);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="db-modal-title"
    >
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full border border-line shadow-modal overflow-hidden max-h-[92vh] flex flex-col animate-scale-in"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-ink via-ocean-dark to-ocean text-white p-6 relative shrink-0">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/20 text-sky-deep">
                <Database className="w-3.5 h-3.5 text-green-300" />
                <span>HCI Usability Lab 8 · Live PostgreSQL Connectivity</span>
              </div>
              <h2 id="db-modal-title" className="text-xl font-extrabold tracking-tight">
                Database Status & Inspector
              </h2>
              <p className="text-xs text-sky/80">
                End-to-end Supabase PostgreSQL synchronization, latency benchmarking, and auto-seeding.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="Close Database Inspector"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Status & Latency Banner */}
          <div className="p-4 rounded-2xl border border-line bg-sky/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                stats?.isLive ? 'bg-green/10 text-green border border-green/20' : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {stats?.isLive ? <Wifi className="w-5 h-5 animate-pulse" /> : <Server className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-ink">
                    {stats?.isLive ? 'Supabase PostgreSQL Cloud' : 'Local In-Memory Driver'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    stats?.isLive ? 'bg-green/15 text-green' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {stats?.isLive ? 'Live Active' : 'Fallback Ready'}
                  </span>
                </div>
                <div className="text-xs text-slate font-mono mt-0.5">
                  Endpoint: {stats?.urlMasked || 'Local Memory Session'}
                </div>
              </div>
            </div>

            {/* Latency Metric */}
            <div className="bg-white border border-line rounded-xl p-2.5 sm:text-right shrink-0">
              <div className="text-[10px] uppercase font-bold text-slate tracking-wider">
                Round-Trip Latency
              </div>
              <div className="text-lg font-black text-ink flex items-center sm:justify-end gap-1">
                <Activity className="w-4 h-4 text-ocean" />
                <span>{stats ? `${stats.latencyMs} ms` : '—'}</span>
              </div>
            </div>
          </div>

          {/* 6-Core Tables Live Row Counts */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-ink flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-ocean" />
                <span>Core Tables & Live Inventory Counts (6 Core Entities)</span>
              </h3>
              <span className="text-[11px] text-slate">
                Auto-syncs on checkout & auth
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* 1. Stays */}
              <div className="p-3 rounded-xl border border-line bg-white hover:border-sky-deep transition-all shadow-subtle">
                <div className="flex items-center justify-between text-slate mb-1">
                  <span className="text-xs font-semibold flex items-center gap-1 text-ink">
                    <Building2 className="w-3.5 h-3.5 text-ocean" />
                    <span>stays</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-muted">table</span>
                </div>
                <div className="text-xl font-black text-ink">
                  {stats?.rowCounts.stays ?? '—'}
                </div>
                <div className="text-[10px] text-slate mt-0.5">
                  Hotels across Mumbai, Delhi, Goa
                </div>
              </div>

              {/* 2. Flights */}
              <div className="p-3 rounded-xl border border-line bg-white hover:border-sky-deep transition-all shadow-subtle">
                <div className="flex items-center justify-between text-slate mb-1">
                  <span className="text-xs font-semibold flex items-center gap-1 text-ink">
                    <Plane className="w-3.5 h-3.5 text-ocean" />
                    <span>flights</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-muted">table</span>
                </div>
                <div className="text-xl font-black text-ink">
                  {stats?.rowCounts.flights ?? '—'}
                </div>
                <div className="text-[10px] text-slate mt-0.5">
                  Domestic & International routes
                </div>
              </div>

              {/* 3. Trains */}
              <div className="p-3 rounded-xl border border-line bg-white hover:border-sky-deep transition-all shadow-subtle">
                <div className="flex items-center justify-between text-slate mb-1">
                  <span className="text-xs font-semibold flex items-center gap-1 text-ink">
                    <TrainFront className="w-3.5 h-3.5 text-ocean" />
                    <span>trains</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-muted">table</span>
                </div>
                <div className="text-xl font-black text-ink">
                  {stats?.rowCounts.trains ?? '—'}
                </div>
                <div className="text-[10px] text-slate mt-0.5">
                  Vande Bharat & Rajdhani express
                </div>
              </div>

              {/* 4. Cabs */}
              <div className="p-3 rounded-xl border border-line bg-white hover:border-sky-deep transition-all shadow-subtle">
                <div className="flex items-center justify-between text-slate mb-1">
                  <span className="text-xs font-semibold flex items-center gap-1 text-ink">
                    <Car className="w-3.5 h-3.5 text-ocean" />
                    <span>cabs</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-muted">table</span>
                </div>
                <div className="text-xl font-black text-ink">
                  {stats?.rowCounts.cabs ?? '—'}
                </div>
                <div className="text-[10px] text-slate mt-0.5">
                  Airport transfers & outstations
                </div>
              </div>

              {/* 5. User Profiles */}
              <div className="p-3 rounded-xl border border-line bg-white hover:border-sky-deep transition-all shadow-subtle">
                <div className="flex items-center justify-between text-slate mb-1">
                  <span className="text-xs font-semibold flex items-center gap-1 text-ink">
                    <Users className="w-3.5 h-3.5 text-ocean" />
                    <span>user_profiles</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-muted">table</span>
                </div>
                <div className="text-xl font-black text-ink">
                  {stats?.rowCounts.user_profiles ?? '—'}
                </div>
                <div className="text-[10px] text-slate mt-0.5">
                  Travelers & accessibility prefs
                </div>
              </div>

              {/* 6. Bookings */}
              <div className="p-3 rounded-xl border border-line bg-white hover:border-sky-deep transition-all shadow-subtle">
                <div className="flex items-center justify-between text-slate mb-1">
                  <span className="text-xs font-semibold flex items-center gap-1 text-ink">
                    <Ticket className="w-3.5 h-3.5 text-ocean" />
                    <span>bookings</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-muted">table</span>
                </div>
                <div className="text-xl font-black text-ink">
                  {stats?.rowCounts.bookings ?? '—'}
                </div>
                <div className="text-[10px] text-slate mt-0.5">
                  Itemized confirmed reservations
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Operations Suite */}
          <div className="pt-2 border-t border-line space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-ink">
              Evaluation & Maintenance Operations
            </h4>

            <div className="flex flex-wrap gap-2.5">
              {/* Button 1: Test Live DB Ping */}
              <button
                type="button"
                onClick={handleManualPing}
                disabled={isPinging}
                className="btn-primary py-2 px-3.5 text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                <span>{isPinging ? 'Pinging PostgreSQL...' : 'Test Live Database Ping'}</span>
              </button>

              {/* Button 2: 1-Click Auto-Seed Remote DB */}
              <button
                type="button"
                onClick={handleSeedDatabase}
                disabled={isSeeding}
                className="btn-secondary py-2 px-3.5 text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 text-ocean ${isSeeding ? 'animate-spin' : ''}`} />
                <span>{isSeeding ? 'Upserting Schema & Seed Data...' : '1-Click Auto-Seed Remote DB'}</span>
              </button>

              {/* Button 3: Copy Idempotent SQL Schema Notice */}
              <button
                type="button"
                onClick={handleCopySchemaNotice}
                className="px-3.5 py-2 rounded-xl border border-line bg-white hover:bg-sky text-ink text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
              >
                {copiedSchema ? <Check className="w-3.5 h-3.5 text-green" /> : <Copy className="w-3.5 h-3.5 text-slate" />}
                <span>{copiedSchema ? 'SQL Guide Copied!' : 'Copy SQL Schema Notice'}</span>
              </button>
            </div>
          </div>

          {/* HCI Usability & Nielsen Heuristic Callout */}
          <div className="p-4 rounded-2xl bg-sky/50 border border-sky-deep text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-ink">
              <ShieldCheck className="w-4 h-4 text-green" />
              <span>Nielsen Heuristic #1: Visibility of System Status</span>
            </div>
            <p className="text-slate leading-relaxed">
              Unlike commercial travel portals that hide API failovers, Farways provides real-time latency auditing, 
              live database verification, and transparent data state. Whether connected to live PostgreSQL or running in 
              offline demonstration mode, every user transaction is persisted deterministically.
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-sky/40 border-t border-line px-6 py-3 shrink-0 flex items-center justify-between text-xs text-slate">
          <span>Schema: <code className="font-mono text-ink">supabase/schema.sql</code> (100% Idempotent)</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-line bg-white hover:bg-sky font-bold text-ink transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
}

/**
 * Clean Database Status Pill for the Navbar / Header.
 * Displays live PostgreSQL connectivity and latency indicator.
 */
export function DatabaseStatusPill() {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState<DatabaseStats | null>(null);

  useEffect(() => {
    // Initial quick ping
    farwaysDataService.pingDatabase().then((res) => setStats(res)).catch(() => {});
  }, []);

  const isLive = stats?.isLive ?? farwaysDataService.isConfigured();

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer bg-white hover:bg-sky focus-visible:ring-2 focus-visible:ring-ocean"
        style={{
          borderColor: isLive ? '#86EFAC' : '#E2EBF4',
        }}
        title="Click to open Live Database Status & PostgreSQL Inspector"
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${
          isLive ? 'bg-green animate-pulse' : 'bg-amber-500'
        }`} />
        <span className="text-ink font-bold">
          {isLive ? 'Live Supabase' : 'Local DB'}
        </span>
        {stats && (
          <span className="text-[10px] text-slate font-mono border-l border-line pl-1.5">
            {stats.latencyMs}ms
          </span>
        )}
      </button>

      <DatabaseStatusModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
