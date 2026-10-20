'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { 
  Compass, 
  Building2, 
  Plane, 
  TrainFront,
  Car, 
  Ticket, 
  User, 
  LogOut, 
  ChevronDown, 
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';

interface NavItem {
  id: string;
  name: string;
  href: string;
  tabKey?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'stays', name: 'Stays', href: '/?tab=stays', tabKey: 'stays', icon: Building2 },
  { id: 'flights', name: 'Flights', href: '/?tab=flights', tabKey: 'flights', icon: Plane },
  { id: 'trains', name: 'Trains', href: '/?tab=trains', tabKey: 'trains', icon: TrainFront },
  { id: 'cabs', name: 'Cabs', href: '/?tab=cabs', tabKey: 'cabs', icon: Car },
  { id: 'bookings', name: 'My Bookings', href: '/dashboard', icon: Ticket },
];

function NavLinksDesktop() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'stays';

  return (
    <nav className="hidden md:flex items-center gap-1 bg-sky/60 p-1 rounded-xl border border-line" aria-label="Main Travel Categories">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        let isActive = false;

        if (pathname === '/') {
          if (item.tabKey) {
            isActive = activeTab === item.tabKey;
          }
        } else if (item.href === '/dashboard') {
          isActive = pathname.startsWith('/dashboard') || pathname.startsWith('/bookings');
        }

        return (
          <Link
            key={item.id}
            href={item.href}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
              isActive
                ? 'bg-white text-ocean shadow-subtle border border-line'
                : 'text-slate hover:text-ink hover:bg-white/60'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function NavLinksMobile() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'stays';

  return (
    <div className="grid grid-cols-5 gap-1 items-center">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        let isActive = false;

        if (pathname === '/') {
          if (item.tabKey) {
            isActive = activeTab === item.tabKey;
          }
        } else if (item.href === '/dashboard') {
          isActive = pathname.startsWith('/dashboard') || pathname.startsWith('/bookings');
        }

        return (
          <Link
            key={item.id}
            href={item.href}
            className={`min-h-[48px] flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer ${
              isActive
                ? 'text-ocean font-bold bg-sky'
                : 'text-slate hover:text-ink'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-ocean' : 'text-slate'}`} />
            <span className="text-[11px] mt-0.5 leading-tight font-medium">{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}

export function Navbar() {
  const { user, openAuthModal, signOut } = useAuth();
  const pathname = usePathname();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when route changes
  useEffect(() => {
    setIsMobileNavOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* =========================================================================
          DESKTOP & TABLET STICKY TOP NAVIGATION
          ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-line shadow-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-3 sm:gap-4">
            
            {/* Brand Logo & Research Attribution */}
            <div className="flex items-center gap-3 sm:gap-6">
              <Link
                href="/"
                className="flex items-center gap-2.5 group focus-visible:ring-2 focus-visible:ring-ocean rounded-lg p-1"
                aria-label="Farways Home"
              >
                <div className="w-9 h-9 rounded-xl bg-ocean text-white flex items-center justify-center shadow-sm group-hover:bg-ocean-dark transition-colors">
                  <Compass className="w-5 h-5 transition-transform group-hover:rotate-45 duration-300" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-extrabold tracking-tight text-ink leading-tight">
                    Farways
                  </span>
                  <span className="text-[10px] font-semibold text-ocean tracking-wide uppercase">
                    Ethical Travel Platform
                  </span>
                </div>
              </Link>

              {/* Research Badge */}
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-sky text-ocean border border-sky-deep">
                <ShieldCheck className="w-3.5 h-3.5 text-green" />
                <span>Zero Dark Patterns</span>
              </div>
            </div>

            {/* Desktop Mode Switcher Navigation (Wrapped in Suspense for App Router searchParams) */}
            <Suspense fallback={
              <nav className="hidden md:flex items-center gap-1 bg-sky/60 p-1 rounded-xl border border-line">
                <div className="h-8 w-64 bg-slate/10 rounded animate-pulse" />
              </nav>
            }>
              <NavLinksDesktop />
            </Suspense>

            {/* Right Action Suite: Dynamic Auth State & Mobile Hamburger */}
            <div className="flex items-center gap-2 sm:gap-2.5">

              {/* Desktop Auth Controls */}
              <div className="hidden sm:flex items-center gap-2">
                {user ? (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-line bg-white hover:bg-sky transition-colors cursor-pointer text-left focus-visible:ring-2 focus-visible:ring-ocean"
                      aria-expanded={isUserMenuOpen}
                      aria-label="User Account Menu"
                    >
                      <div className="w-7 h-7 rounded-lg bg-sky-deep text-ocean font-bold text-xs flex items-center justify-center border border-ocean/20">
                        {user.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-ink leading-none">
                          {user.fullName.split(' ')[0]}
                        </div>
                        <div className="text-[10px] text-slate leading-tight truncate max-w-[100px]">
                          {user.phone ? `+91 ${user.phone}` : user.email}
                        </div>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-slate ml-0.5" />
                    </button>

                    {/* Dropdown Menu */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white border border-line rounded-xl shadow-modal p-2 z-50 animate-calm">
                        <div className="p-2 border-b border-line mb-1">
                          <div className="text-xs font-bold text-ink">{user.fullName}</div>
                          <div className="text-[11px] text-slate truncate">{user.email}</div>
                          {user.phone && (
                            <div className="text-[11px] text-slate">+91 {user.phone}</div>
                          )}
                        </div>

                        <Link
                          href="/dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate hover:text-ink hover:bg-sky rounded-lg transition-colors"
                        >
                          <Ticket className="w-4 h-4 text-ocean" />
                          <span>My Dashboard & Bookings</span>
                        </Link>

                        <div className="border-t border-line my-1"></div>

                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            signOut();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/login"
                      className="px-3.5 py-2 text-xs font-bold text-ink hover:text-ocean hover:bg-sky rounded-lg transition-colors cursor-pointer"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/login?tab=signup"
                      className="btn-primary text-xs font-bold px-3.5 py-2"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Hamburger Menu Button */}
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                className="md:hidden p-2 rounded-xl border border-line bg-sky/50 hover:bg-sky text-ink transition-colors cursor-pointer flex items-center justify-center focus-visible:ring-2 focus-visible:ring-ocean"
                aria-label={isMobileNavOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
                aria-expanded={isMobileNavOpen}
              >
                {isMobileNavOpen ? <X className="w-5 h-5 text-ocean" /> : <Menu className="w-5 h-5 text-ink" />}
              </button>
            </div>

          </div>
        </div>

        {/* Collapsible Mobile Navigation Drawer */}
        {isMobileNavOpen && (
          <div 
            className="md:hidden fixed inset-x-0 top-16 bottom-0 z-50 bg-ink/50 backdrop-blur-sm animate-fadeIn" 
            onClick={() => setIsMobileNavOpen(false)}
          >
            <div 
              className="bg-white border-b border-line shadow-modal p-4 space-y-4 max-h-[85vh] overflow-y-auto animate-calm"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Category Links */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate px-1">
                  Travel Modes
                </span>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setIsMobileNavOpen(false)}
                        className="flex items-center gap-2.5 p-3 rounded-xl border border-line bg-sky/30 hover:bg-sky text-ink font-bold text-xs transition-all"
                      >
                        <Icon className="w-4 h-4 text-ocean" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Auth / Account Section */}
              <div className="pt-3 border-t border-line space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate px-1">
                  Account & Access
                </span>
                {user ? (
                  <div className="p-3 rounded-xl bg-sky/50 border border-line space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-sky-deep text-ocean font-bold text-sm flex items-center justify-center border border-ocean/20">
                        {user.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-ink truncate">{user.fullName}</div>
                        <div className="text-[11px] text-slate truncate">{user.phone ? `+91 ${user.phone}` : user.email}</div>
                      </div>
                    </div>
                    <div className="pt-1 flex gap-2">
                      <Link
                        href="/dashboard"
                        onClick={() => setIsMobileNavOpen(false)}
                        className="flex-1 btn-secondary py-2 text-xs font-bold text-center"
                      >
                        My Bookings
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileNavOpen(false);
                          signOut();
                        }}
                        className="px-3 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/login"
                      onClick={() => setIsMobileNavOpen(false)}
                      className="btn-secondary py-2.5 text-xs font-bold text-center"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/login?tab=signup"
                      onClick={() => setIsMobileNavOpen(false)}
                      className="btn-primary py-2.5 text-xs font-bold text-center"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>

              {/* Commercial Trust & Transparency Policy */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Guaranteed Net Prices • Zero Dark Patterns • Radical Transparency</span>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          MOBILE-OPTIMIZED BOTTOM NAVIGATION BAR
          Meets WCAG 2.5.5 Target Size: All interactive touch targets >= 44x44px
          ========================================================================= */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-line shadow-modal px-2 py-1 safe-area-bottom"
      >
        <Suspense fallback={<div className="h-12 w-full animate-pulse bg-slate/10 rounded" />}>
          <NavLinksMobile />
        </Suspense>
      </nav>
    </>
  );
}
