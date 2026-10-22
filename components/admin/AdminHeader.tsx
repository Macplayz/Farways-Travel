'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ExternalLink, ShieldCheck, Database, RefreshCw } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase/client';

interface AdminHeaderProps {
  onOpenSidebar: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function AdminHeader({ onOpenSidebar, onRefresh, isRefreshing }: AdminHeaderProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isDbConfigured = isSupabaseConfigured();

  const getPageTitle = () => {
    if (pathname === '/admin') return 'Operations Overview';
    if (pathname.includes('/admin/stays')) return 'Stays Inventory';
    if (pathname.includes('/admin/flights')) return 'Flights Inventory';
    if (pathname.includes('/admin/trains')) return 'Trains Inventory';
    if (pathname.includes('/admin/cabs')) return 'Cabs Inventory';
    return 'Admin Console';
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden transition-colors cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
              Farways Ops /
            </span>
            <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
              {getPageTitle()}
            </h1>
          </div>
        </div>
      </div>

      {/* Right: Actions & Status */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Sync</span>
          </button>
        )}

        {/* Database Status Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isDbConfigured ? 'Supabase Live' : 'Demo DB'}</span>
        </div>

        {/* Public Site Link */}
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-200 hover:text-white bg-slate-800/90 hover:bg-slate-800 border border-slate-700/60 transition-colors"
        >
          <span>Live Site</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </Link>

        {/* Admin Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-ocean to-cyan-500 text-white font-black text-xs flex items-center justify-center shadow-sm">
            {user?.fullName?.charAt(0).toUpperCase() || 'A'}
          </div>
        </div>
      </div>
    </header>
  );
}
