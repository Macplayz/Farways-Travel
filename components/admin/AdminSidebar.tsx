'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Plane,
  TrainFront,
  Car,
  Compass,
  ArrowLeft,
  LogOut,
  Database,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase/client';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    description: 'System metrics & overview',
  },
  {
    name: 'Stays',
    href: '/admin/stays',
    icon: Building2,
    description: 'Hotels, resorts & homestays',
  },
  {
    name: 'Flights',
    href: '/admin/flights',
    icon: Plane,
    description: 'Air routes & flight inventory',
  },
  {
    name: 'Trains',
    href: '/admin/trains',
    icon: TrainFront,
    description: 'Indian Railways & Vande Bharat',
  },
  {
    name: 'Cabs',
    href: '/admin/cabs',
    icon: Car,
    description: 'Transfers & intercity fleets',
  },
];

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const isDbConfigured = isSupabaseConfigured();

  const isRouteActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top: Brand & Close button */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <Link
              href="/admin"
              onClick={onClose}
              className="flex items-center gap-3 group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-ocean to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-ocean/20">
                <Compass className="w-5 h-5 transition-transform group-hover:rotate-45 duration-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black tracking-tight text-white">Farways</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-ocean/30 text-cyan-300 border border-ocean/40">
                    Ops
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-400 block leading-tight">
                  Inventory Management
                </span>
              </div>
            </Link>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden transition-colors cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Real-time DB Status Badge */}
          <div className="mt-4 px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-slate-300">
                {isDbConfigured ? 'Supabase Live DB' : 'Local Fallback'}
              </span>
            </div>
            <Database className="w-3.5 h-3.5 text-slate-500" />
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto" aria-label="Admin Navigation">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Operations & Live Inventory
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isRouteActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  active
                    ? 'bg-gradient-to-r from-ocean to-ocean-dark text-white shadow-md shadow-ocean/25 border border-ocean-light/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    active ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-cyan-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="truncate">{item.name}</span>
                    {active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-sm" />
                    )}
                  </div>
                  <span
                    className={`text-[11px] truncate block ${
                      active ? 'text-cyan-100/90' : 'text-slate-400'
                    }`}
                  >
                    {item.description}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom: Admin User profile & Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 space-y-3">
          {/* Admin User Card */}
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900 border border-slate-800">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-ocean text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
              {user?.fullName?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                <span>{user?.fullName || 'Farways Admin'}</span>
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {user?.email || 'admin@farways.com'}
              </div>
            </div>
          </div>

          {/* Quick exit & Logout */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/"
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Public Site</span>
            </Link>

            <button
              onClick={() => signOut()}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-950/30 hover:bg-rose-950/50 border border-rose-900/30 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
