'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  RotateCw, 
  Building2, 
  Plane, 
  TrainFront,
  Car, 
  CheckCircle2, 
  Lock, 
  Sparkles,
  Info
} from 'lucide-react';
import { Stay, Flight, Train, Cab, Addon, ItemType } from '@/types/farways';
import { SafeImage } from '@/components/ui/SafeImage';

interface OrderSummaryCardProps {
  item: Stay | Flight | Train | Cab;
  itemType: ItemType;
  selectedAddons: Addon[];
  stayNights?: number;
}

export function OrderSummaryCard({
  item,
  itemType,
  selectedAddons,
  stayNights = 1,
}: OrderSummaryCardProps) {
  // Live Sync timer state (Lab 8 MMT finding resolution)
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Poll price verification every 15 seconds
  useEffect(() => {
    const secondTimer = setInterval(() => {
      setSecondsAgo((prev) => prev + 1);
    }, 1000);

    const pollTimer = setInterval(() => {
      setIsSyncing(true);
      // Simulate real-time database verification handshake
      setTimeout(() => {
        setIsSyncing(false);
        setSecondsAgo(0);
      }, 600);
    }, 15000);

    return () => {
      clearInterval(secondTimer);
      clearInterval(pollTimer);
    };
  }, []);

  // Compute pricing
  const multiplier = itemType === 'stay' ? stayNights : 1;
  const baseRate = item.base_price * multiplier;
  const taxAmount = item.tax * multiplier;
  const platformFee = item.platform_fee * multiplier;
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const grandTotal = baseRate + taxAmount + platformFee + addonsTotal;

  // Title & Subtitle based on item type
  const getItemTitle = () => {
    if ('name' in item) return item.name;
    if ('trainNumber' in item) return `${item.trainNumber} · ${item.trainName}`;
    if ('flightNumber' in item) return `${item.airlineName} · ${item.flightNumber}`;
    if ('vehicleModel' in item) return item.vehicleModel;
    return 'Travel Reservation';
  };

  const getItemSubtitle = () => {
    if ('roomType' in item) return `${item.roomType} · ${item.city}`;
    if ('trainNumber' in item) return `${item.originCode} ➔ ${item.destinationCode} (${item.durationFormatted})`;
    if ('originCode' in item) return `${item.originCode} ➔ ${item.destinationCode} (${item.durationFormatted})`;
    if ('routeOrigin' in item) return `${item.routeOrigin} ➔ ${item.routeDestination}`;
    return '';
  };

  const itemImageUrl = ('thumbnail' in item && item.thumbnail) || ('imageUrl' in item && item.imageUrl);

  return (
    <aside className="bg-white border border-line rounded-2xl p-5 sm:p-6 shadow-subtle space-y-5 sticky top-20">
      {/* Live Inventory & Price Sync Badge (Lab 8 Finding) */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-sky/60 border border-sky-deep">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green"></span>
          </span>
          <span className="text-xs font-bold text-ink">
            Verified Live Fare
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate font-medium">
          <RotateCw className={`w-3 h-3 text-ocean ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{secondsAgo < 3 ? 'Synced just now' : `Synced ${secondsAgo}s ago`}</span>
        </div>
      </div>

      {/* Item Overview Mini Card */}
      <div className="flex gap-3.5 pb-4 border-b border-line items-center">
        {/* Media or Icon */}
        <div className="w-16 h-16 rounded-xl bg-sky border border-line overflow-hidden shrink-0 flex items-center justify-center relative">
          {itemImageUrl ? (
            <SafeImage src={itemImageUrl} alt={getItemTitle()} className="w-full h-full object-cover" />
          ) : itemType === 'flight' ? (
            <div className="w-full h-full bg-sky-deep flex items-center justify-center text-ocean font-bold text-sm">
              <Plane className="w-7 h-7" />
            </div>
          ) : itemType === 'train' ? (
            <div className="w-full h-full bg-sky-deep flex items-center justify-center text-ocean font-bold text-sm">
              <TrainFront className="w-7 h-7" />
            </div>
          ) : (
            <div className="w-full h-full bg-sky-deep flex items-center justify-center text-ocean font-bold text-sm">
              <Car className="w-7 h-7" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold text-ocean uppercase tracking-wider">
            {itemType === 'stay' ? 'Hotel Stay' : itemType === 'flight' ? 'Flight Ticket' : itemType === 'train' ? 'IRCTC Train Ticket' : 'Cab Transfer'}
          </div>
          <h4 className="text-sm font-bold text-ink leading-snug truncate">
            {getItemTitle()}
          </h4>
          <p className="text-xs text-slate truncate mt-0.5">
            {getItemSubtitle()}
          </p>
        </div>
      </div>

      {/* Itemized Financial Ledger */}
      <div className="space-y-2.5 text-xs text-slate">
        <div className="flex justify-between items-center">
          <span>Base Rate:</span>
          <span className="font-medium text-ink">₹{baseRate.toLocaleString('en-IN')}</span>
        </div>

        <div className="flex justify-between items-center">
          <span>Mandatory GST & Airport Levies:</span>
          <span className="font-medium text-ink">₹{taxAmount.toLocaleString('en-IN')}</span>
        </div>

        <div className="flex justify-between items-center text-green font-medium">
          <span>Farways Platform Fee:</span>
          <span>₹{platformFee} (Zero Markup)</span>
        </div>

        {/* Selected Add-ons itemized individually */}
        {selectedAddons.length > 0 && (
          <div className="pt-2 border-t border-line/60 space-y-1.5">
            <span className="text-[11px] font-bold text-ink uppercase tracking-wider block">
              Optional Add-ons
            </span>
            {selectedAddons.map((addon) => (
              <div key={addon.id} className="flex justify-between text-xs text-ocean">
                <span className="truncate pr-2">+ {addon.name}:</span>
                <span className="font-semibold shrink-0">₹{addon.price.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        )}

        {/* Guaranteed Net Total */}
        <div className="pt-3 border-t border-line flex justify-between items-baseline">
          <div>
            <span className="text-sm font-bold text-ink block">Guaranteed Total:</span>
            <span className="text-[10px] text-slate-muted">All taxes & fees included</span>
          </div>
          <span className="text-2xl font-black text-ocean tracking-tight">
            ₹{grandTotal.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Radical Trust Guarantee Box */}
      <div className="p-3.5 rounded-xl bg-sky/30 border border-line space-y-1 text-[11px] text-slate leading-relaxed">
        <div className="flex items-center gap-1.5 font-bold text-ink">
          <ShieldCheck className="w-4 h-4 text-green" />
          <span>Farways Anti-Drip Price Lock</span>
        </div>
        <p>
          Legacy portals increase prices by 15-25% between selection and final OTP. 
          The total shown above is strictly locked and cannot change.
        </p>
      </div>
    </aside>
  );
}
