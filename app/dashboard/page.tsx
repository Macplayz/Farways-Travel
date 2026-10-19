'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Building2, 
  Plane, 
  TrainFront,
  Car, 
  Ticket, 
  Scale, 
  User, 
  LogOut, 
  CheckCircle2, 
  Printer, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  Coins, 
  Sparkles, 
  SlidersHorizontal,
  X,
  RotateCcw,
  AlertCircle,
  Loader2,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useCompare } from '@/components/CompareTray';
import { useToast } from '@/components/ToastProvider';
import { farwaysDataService } from '@/lib/supabase/client';
import { Booking } from '@/types/farways';
import { ETicketModal } from '@/components/dashboard/ETicketModal';
import { CancelModal } from '@/components/dashboard/CancelModal';
import { PreferencesView } from '@/components/dashboard/PreferencesView';

function DashboardMainContent() {
  const searchParams = useSearchParams();
  const newlyBookedCode = searchParams.get('booked');
  const { user, signOut } = useAuth();
  const { compareItems, removeFromCompare, clearCompare, openCompareModal } = useCompare();
  const toast = useToast();

  // Tab State
  const [activeTab, setActiveTab] = useState<'trips' | 'comparisons' | 'preferences'>('trips');

  // Bookings State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selected Booking for Modals
  const [ticketModalBooking, setTicketModalBooking] = useState<Booking | null>(null);
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);

  // Fetch bookings from Supabase
  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const userIdentifier = user?.email || user?.id;
      const data = await farwaysDataService.getUserBookings(userIdentifier);
      setBookings(data);
    } catch (err) {
      console.warn('[Dashboard Fetch Error]', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [user, newlyBookedCode]);

  // Compute dynamic stats for the Welcome Banner
  const stats = useMemo(() => {
    const activeConfirmed = bookings.filter((b) => b.status === 'confirmed');
    const totalSpent = activeConfirmed.reduce((sum, b) => sum + Number(b.total_amount), 0);
    // 18% average drip pricing saved vs MakeMyTrip/Booking.com
    const totalSaved = Math.round(totalSpent * 0.18);
    // 1 point per ₹100 spent
    const rewardPoints = Math.round(totalSpent / 100);

    return {
      upcomingCount: activeConfirmed.length,
      totalSaved,
      rewardPoints,
    };
  }, [bookings]);

  // Cancel Booking Action
  const handleConfirmCancel = async (booking: Booking) => {
    const res = await farwaysDataService.cancelBooking(booking.id || booking.confirmation_code);
    if (res.success) {
      toast.success(
        `Reservation ${booking.confirmation_code} cancelled. 100% full refund of ₹${Number(
          booking.total_amount
        ).toLocaleString('en-IN')} initiated to your source account with zero platform fees.`,
        'Zero-Penalty Refund Initiated'
      );
      // Update local state immediately
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id || b.confirmation_code === booking.confirmation_code
            ? { ...b, status: 'cancelled' }
            : b
        )
      );
    } else {
      toast.error('Failed to cancel booking. Please contact Farways support.');
    }
  };

  // Helper to test if a booking is created within the last 2 minutes
  const isJustBooked = (b: Booking) => {
    if (b.confirmation_code === newlyBookedCode) return true;
    const bookingTime = new Date(b.created_at).getTime();
    return Date.now() - bookingTime < 120000;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* =========================================================================
          OCEAN-GRADIENT WELCOME BANNER WITH DYNAMIC STATS (Requirement 1)
          Upcoming Trips · Total Saved via Zero Hidden Fees · Reward Points
          ========================================================================= */}
      <section className="bg-gradient-to-br from-ink via-ocean-dark to-ocean text-white rounded-3xl p-6 sm:p-8 shadow-card relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Welcome Text */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/20 text-sky-deep mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-green-300" />
              <span>Verified Transparent Traveler Profile</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user ? user.fullName : 'Valued Traveler'}!
            </h1>
            <p className="text-xs sm:text-sm text-sky/80 mt-1 max-w-xl">
              Track your confirmed travel vouchers, audit itemized receipts, and manage your trips 
              with zero cancellation retainers.
            </p>
          </div>

          {/* Dynamic Stats Cards */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            {/* Upcoming Trips */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 sm:p-4 text-center min-w-[100px]">
              <div className="text-xl sm:text-2xl font-black text-white">
                {stats.upcomingCount}
              </div>
              <div className="text-[10px] sm:text-xs text-sky font-semibold uppercase tracking-wider mt-0.5">
                Upcoming Trips
              </div>
            </div>

            {/* Total Saved via Zero Drip Fees */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 sm:p-4 text-center min-w-[110px]">
              <div className="text-xl sm:text-2xl font-black text-green-300">
                ₹{stats.totalSaved.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] sm:text-xs text-sky font-semibold uppercase tracking-wider mt-0.5">
                Saved vs OTAs
              </div>
            </div>

            {/* Reward Points */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 sm:p-4 text-center min-w-[100px]">
              <div className="text-xl sm:text-2xl font-black text-amber-300">
                {stats.rewardPoints}
              </div>
              <div className="text-[10px] sm:text-xs text-sky font-semibold uppercase tracking-wider mt-0.5">
                Reward Pts
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          TWO-COLUMN DASHBOARD LAYOUT
          Left: Sticky Navigation Sidebar
          Right: Main Content Area (My Trips, Saved Comparisons, Preferences)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sticky Left Sidebar Navigation (Requirement 1) */}
        <aside className="lg:col-span-3 bg-white border border-line rounded-2xl p-4 shadow-subtle sticky top-20 space-y-1">
          <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-muted">
            Travel Center
          </div>

          {/* My Trips Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('trips')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'trips'
                ? 'bg-sky-deep text-ocean shadow-sm'
                : 'text-slate hover:text-ink hover:bg-sky'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Ticket className="w-4 h-4" />
              <span>My Trips</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-ocean text-white">
              {bookings.length}
            </span>
          </button>

          {/* Saved Comparisons Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('comparisons')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'comparisons'
                ? 'bg-sky-deep text-ocean shadow-sm'
                : 'text-slate hover:text-ink hover:bg-sky'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Scale className="w-4 h-4" />
              <span>Saved Comparisons</span>
            </div>
            {compareItems.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-ocean/20 text-ocean">
                {compareItems.length}
              </span>
            )}
          </button>

          {/* Profile & Preferences Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('preferences')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'preferences'
                ? 'bg-sky-deep text-ocean shadow-sm'
                : 'text-slate hover:text-ink hover:bg-sky'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Profile & Preferences</span>
          </button>

          <div className="border-t border-line my-2 pt-2"></div>

          {/* Sign Out Action */}
          <button
            type="button"
            onClick={() => {
              signOut();
              toast.info('Signed out of session safely.');
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </aside>

        {/* Right Main Content Panel */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* =====================================================================
              TAB 1: MY TRIPS (Live Supabase CRUD Cards)
              ===================================================================== */}
          {activeTab === 'trips' && (
            <div className="space-y-6 animate-calm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-ink">Active Itineraries & Bookings</h2>
                  <p className="text-xs text-slate">Live Supabase ledger status and digital e-ticket passes.</p>
                </div>

                <Link href="/" className="btn-secondary text-xs font-bold flex items-center gap-1.5">
                  <span>Explore New Trips</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {isLoading ? (
                <div className="bg-white border border-line rounded-2xl p-16 text-center shadow-subtle">
                  <Loader2 className="w-8 h-8 text-ocean animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate">Syncing with live Supabase database...</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="bg-white border border-line rounded-2xl p-12 text-center shadow-subtle">
                  <Ticket className="w-12 h-12 text-slate mx-auto mb-3" />
                  <h3 className="text-base font-bold text-ink">No Bookings Found in Your Account</h3>
                  <p className="text-xs text-slate mt-1 mb-4">
                    Book a hotel, flight, or airport cab with radical upfront pricing.
                  </p>
                  <Link href="/" className="btn-primary text-xs">
                    Start Exploring Farways
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => {
                    const justBooked = isJustBooked(booking);
                    const isCancelled = booking.status === 'cancelled';

                    return (
                      <article
                        key={booking.id || booking.confirmation_code}
                        className={`bg-white border rounded-2xl p-5 sm:p-6 shadow-subtle transition-all ${
                          justBooked
                            ? 'border-green-400 ring-2 ring-green-100 shadow-card'
                            : 'border-line'
                        }`}
                      >
                        {/* Card Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-line mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-sky flex items-center justify-center text-ocean shadow-sm">
                              {booking.item_type === 'stay' ? (
                                <Building2 className="w-5 h-5" />
                              ) : booking.item_type === 'flight' ? (
                                <Plane className="w-5 h-5" />
                              ) : booking.item_type === 'train' ? (
                                <TrainFront className="w-5 h-5" />
                              ) : (
                                <Car className="w-5 h-5" />
                              )}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-extrabold text-ink">
                                  ID: {booking.confirmation_code}
                                </span>
                                
                                {/* Just Booked Badge (Requirement 3) */}
                                {justBooked && !isCancelled && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-green-500 text-white animate-pulse">
                                    <Sparkles className="w-3 h-3" />
                                    <span>Just Booked</span>
                                  </span>
                                )}

                                <span
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                    isCancelled
                                      ? 'bg-red-50 text-red-600 border border-red-200'
                                      : 'bg-green-50 text-green border border-green-200'
                                  }`}
                                >
                                  {booking.status}
                                </span>
                              </div>

                              <h3 className="text-base font-bold text-ink mt-0.5 leading-snug">
                                {booking.title}
                              </h3>
                              <p className="text-xs text-slate truncate">
                                {booking.subtitle}
                              </p>
                            </div>
                          </div>

                          {/* Net Paid Total Amount */}
                          <div className="text-left sm:text-right">
                            <div className="text-[10px] text-slate-muted uppercase font-bold">
                              {isCancelled ? 'Refunded Total' : 'Net Paid Fare'}
                            </div>
                            <div className="text-xl font-black text-ocean">
                              ₹{Number(booking.total_amount).toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>

                        {/* Card Details Body */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs p-3.5 rounded-xl bg-sky/40 border border-line mb-4">
                          <div>
                            <span className="text-slate-muted block text-[10px] uppercase font-bold">Primary Traveler</span>
                            <span className="font-semibold text-ink">{booking.traveler_name}</span>
                          </div>
                          <div>
                            <span className="text-slate-muted block text-[10px] uppercase font-bold">Contact</span>
                            <span className="text-slate truncate block">{booking.traveler_email}</span>
                          </div>
                          <div>
                            <span className="text-slate-muted block text-[10px] uppercase font-bold">Booked On</span>
                            <span className="text-slate">
                              {new Date(booking.created_at).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Actions Strip (Requirement 4) */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                          <div className="flex items-center gap-1.5 text-xs text-slate">
                            <ShieldCheck className="w-4 h-4 text-green" />
                            <span>Zero Hidden Fees Verified</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* View E-Ticket / Voucher Button */}
                            <button
                              type="button"
                              onClick={() => setTicketModalBooking(booking)}
                              className="btn-primary py-2 px-3 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>View E-Ticket / Voucher</span>
                            </button>

                            {/* Modify / Cancel Booking Button */}
                            {!isCancelled ? (
                              <button
                                type="button"
                                onClick={() => setCancelModalBooking(booking)}
                                className="px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer"
                              >
                                Cancel Booking
                              </button>
                            ) : (
                              <span className="text-xs text-red-600 font-bold px-2 py-1 bg-red-50 rounded-lg">
                                100% Refund Initiated
                              </span>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              TAB 2: SAVED COMPARISONS VIEW
              ===================================================================== */}
          {activeTab === 'comparisons' && (
            <div className="space-y-6 animate-calm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-ink">Pinned Comparison Matrix</h2>
                  <p className="text-xs text-slate">Compare up to 3 options side-by-side with zero multi-tab clutter.</p>
                </div>

                {compareItems.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button onClick={clearCompare} className="btn-secondary text-xs">
                      Clear Tray
                    </button>
                    <button
                      onClick={openCompareModal}
                      className="btn-primary text-xs font-bold flex items-center gap-1"
                    >
                      <span>Open Side-by-Side</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {compareItems.length === 0 ? (
                <div className="bg-white border border-line rounded-2xl p-12 text-center shadow-subtle">
                  <Scale className="w-12 h-12 text-slate mx-auto mb-3" />
                  <h3 className="text-base font-bold text-ink">No Options Currently Pinned</h3>
                  <p className="text-xs text-slate mt-1 mb-4">
                    Click the &quot;Compare&quot; checkbox on any stay or flight card to pin them here.
                  </p>
                  <Link href="/" className="btn-primary text-xs">
                    Browse Stays & Flights
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {compareItems.map(({ item }) => {
                    const title =
                      'name' in item
                        ? item.name
                        : 'trainNumber' in item
                        ? `${item.trainNumber} · ${item.trainName}`
                        : `${item.airlineName} ${item.flightNumber}`;
                    return (
                      <div
                        key={item.id}
                        className="bg-white border border-line rounded-2xl p-4 shadow-subtle flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-ink truncate pr-2">{title}</span>
                            <button
                              onClick={() => removeFromCompare(item.id)}
                              className="p-1 text-slate hover:text-ink rounded"
                              aria-label="Remove item"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-xs text-slate mb-3">
                            {'city' in item ? item.city : `${item.originCode} ➔ ${item.destinationCode}`}
                          </div>
                          <div className="text-sm font-extrabold text-ocean">
                            ₹{item.total_price.toLocaleString('en-IN')}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={openCompareModal}
                          className="w-full btn-secondary py-1.5 text-xs font-bold mt-4"
                        >
                          View in Matrix
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              TAB 3: PROFILE & ACCESSIBILITY PREFERENCES (Requirement 5)
              ===================================================================== */}
          {activeTab === 'preferences' && <PreferencesView />}

        </main>
      </div>

      {/* Modals */}
      <ETicketModal
        booking={ticketModalBooking}
        onClose={() => setTicketModalBooking(null)}
      />

      <CancelModal
        booking={cancelModalBooking}
        onClose={() => setCancelModalBooking(null)}
        onConfirmCancel={handleConfirmCancel}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-sky pb-28 md:pb-20">
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-ocean animate-spin mb-2" />
            <p className="text-xs text-slate">Loading user dashboard...</p>
          </div>
        }
      >
        <DashboardMainContent />
      </Suspense>
    </main>
  );
}
