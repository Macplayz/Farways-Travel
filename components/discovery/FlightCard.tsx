'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Plane, 
  ArrowRight, 
  Luggage, 
  CheckCircle2, 
  ShieldCheck, 
  Scale, 
  Leaf, 
  Clock,
  Info
} from 'lucide-react';
import { Flight } from '@/types/farways';
import { AirlineBadge } from './AirlineBadge';
import { useCompare } from '@/components/CompareTray';
import { SafeImage } from '@/components/ui/SafeImage';

interface FlightCardProps {
  flight: Flight;
  onOpenDetails?: (flight: Flight) => void;
}

export function FlightCard({ flight, onOpenDetails }: FlightCardProps) {
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();
  const isCompared = isInCompare(flight.id);

  const handleCompareToggle = () => {
    if (isCompared) {
      removeFromCompare(flight.id);
    } else {
      addToCompare({ type: 'flight', item: flight });
    }
  };

  return (
    <article className="bg-white border border-line rounded-2xl p-5 shadow-subtle hover:shadow-card transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Aircraft & Route Visual Banner */}
        {flight.imageUrl && (
          <div className="relative w-full h-32 rounded-xl overflow-hidden mb-3 border border-line bg-sky group/img">
            <SafeImage
              src={flight.imageUrl}
              alt={`${flight.airlineName} ${flight.aircraft}`}
              className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent pointer-events-none" />
            <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-[11px] font-bold pointer-events-none">
              <span className="flex items-center gap-1 backdrop-blur-md bg-ink/60 px-2 py-0.5 rounded border border-white/20">
                <Plane className="w-3 h-3 text-sky-deep" />
                {flight.originCity} ({flight.originCode}) → {flight.destinationCity} ({flight.destinationCode})
              </span>
              <span className="backdrop-blur-md bg-ink/60 px-2 py-0.5 rounded border border-white/20 font-mono text-[10px]">
                {flight.aircraft}
              </span>
            </div>
          </div>
        )}

        {/* Top Header: Airline Badge & Compare Action */}
        <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
          <AirlineBadge code={flight.airlineCode} name={flight.airlineName} />

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block px-2.5 py-1 rounded-md text-[11px] font-bold bg-sky text-ocean border border-sky-deep">
              {flight.aircraft}
            </span>

            {/* Compare Checkbox */}
            <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky text-ink text-xs font-bold border border-line shadow-sm cursor-pointer hover:bg-sky-deep/50 select-none">
              <input
                type="checkbox"
                checked={isCompared}
                onChange={handleCompareToggle}
                className="rounded border-line text-ocean focus:ring-ocean cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-ocean" />
                <span className="hidden sm:inline">Compare</span>
              </span>
            </label>
          </div>
        </div>

        {/* Flight Timing & Route Grid */}
        <div className="bg-sky/50 rounded-xl p-4 border border-line mb-4">
          <div className="flex items-center justify-between">
            {/* Origin */}
            <div className="text-left">
              <div className="text-xl sm:text-2xl font-extrabold text-ink font-mono tracking-tight">
                {flight.departureTime}
              </div>
              <div className="text-sm font-bold text-ocean">{flight.originCode}</div>
              <div className="text-[11px] text-slate truncate max-w-[120px]">
                {flight.originCity} • {flight.originTerminal}
              </div>
            </div>

            {/* Duration Visual Divider */}
            <div className="flex-1 px-4 flex flex-col items-center">
              <span className="text-xs font-semibold text-slate mb-1">
                {flight.durationFormatted}
              </span>
              <div className="w-full flex items-center gap-1">
                <div className="h-0.5 flex-1 bg-line-strong"></div>
                <div className="w-2 h-2 rounded-full bg-ocean shrink-0"></div>
                <div className="h-0.5 flex-1 bg-line-strong"></div>
              </div>
              <span className="text-[10px] font-bold text-green mt-1">
                Non-stop Route
              </span>
            </div>

            {/* Destination */}
            <div className="text-right">
              <div className="text-xl sm:text-2xl font-extrabold text-ink font-mono tracking-tight">
                {flight.arrivalTime}
              </div>
              <div className="text-sm font-bold text-ocean">{flight.destinationCode}</div>
              <div className="text-[11px] text-slate truncate max-w-[120px]">
                {flight.destinationCity} • {flight.destinationTerminal}
              </div>
            </div>
          </div>
        </div>

        {/* Flight Rules Strip: Baggage, Punctuality & Eco Score */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate pb-4 mb-4 border-b border-line">
          <div className="flex items-center gap-1.5">
            <Luggage className="w-4 h-4 text-ocean shrink-0" />
            <span>Cabin {flight.baggageAllowance.cabinKg}kg · Check-in {flight.baggageAllowance.checkInKg}kg</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-green shrink-0" />
            <span className="text-green font-medium">
              {flight.onTimePerformanceScore}% Punctuality
            </span>
          </div>

          <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1">
            <Leaf className="w-4 h-4 text-slate shrink-0" />
            <span>{flight.carbonFootprintKg} kg CO₂ / seat</span>
          </div>
        </div>

        {/* Upfront Itemized Price Breakdown (Radical Transparency - Requirement 4) */}
        <div className="p-3.5 rounded-xl bg-sky/70 border border-sky-deep mb-4">
          <div className="flex items-center justify-between text-[11px] font-bold text-ocean uppercase tracking-wider mb-2">
            <span>Upfront Itemized Fare</span>
            <span className="font-normal text-slate lowercase">per adult traveler</span>
          </div>

          <div className="space-y-1 text-xs text-slate">
            <div className="flex justify-between">
              <span>Base Airfare:</span>
              <span className="font-medium text-ink">₹{flight.base_price.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Aviation Taxes & Fees:</span>
              <span className="font-medium text-ink">₹{flight.tax.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-green font-medium">
              <span>Farways Platform Fee:</span>
              <span>₹{flight.platform_fee} (Zero Markup)</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 mt-1 border-t border-line text-sm font-bold text-ink">
              <span>Net Guaranteed Fare:</span>
              <span className="text-base text-ocean font-extrabold">
                ₹{flight.total_price.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <p className="text-[10px] text-slate-muted mt-1.5 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-green" />
            <span>Zero drip surcharges. Pre-selected baggage/insurance strictly prohibited.</span>
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onOpenDetails?.(flight)}
          className="btn-secondary py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Info className="w-4 h-4 text-ocean" />
          <span>Fare Rules & Details</span>
        </button>

        <Link
          href={`/checkout?type=flight&id=${flight.id}`}
          className="btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-2"
        >
          <span>Select Flight</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}
