'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Car, 
  Users, 
  Luggage, 
  CheckCircle2, 
  ShieldCheck, 
  Star, 
  ArrowRight, 
  Zap, 
  MapPin, 
  Clock,
  Info
} from 'lucide-react';
import { Cab } from '@/types/farways';
import { SafeImage } from '@/components/ui/SafeImage';
import { useCurrency } from '@/lib/context/CurrencyContext';

interface CabCardProps {
  cab: Cab;
  onOpenDetails?: (cab: Cab) => void;
}

export function CabCard({ cab, onOpenDetails }: CabCardProps) {
  const { formatPrice } = useCurrency();
  const isElectric = cab.fuelType === 'Electric';

  return (
    <article className="bg-white border border-line rounded-2xl p-5 shadow-subtle hover:shadow-card transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Visual Vehicle Image Banner */}
        {cab.imageUrl && (
          <div className="relative h-36 w-full rounded-xl overflow-hidden bg-sky mb-4 border border-line">
            <SafeImage
              src={cab.imageUrl}
              alt={cab.vehicleModel}
              containerClassName="w-full h-full"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-ink/80 text-white text-[10px] font-bold backdrop-blur-sm">
              {cab.operatorName}
            </div>
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-white/90 text-ocean text-[10px] font-bold backdrop-blur-sm border border-line">
              {cab.capacityPassengers} Seats · {cab.capacityLuggage} Bags
            </div>
          </div>
        )}

        {/* Header: Vehicle Name & Category */}
        <div className="flex items-start justify-between pb-3 border-b border-line mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-sky text-ocean border border-sky-deep">
                {cab.category}
              </span>
              {isElectric && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-green-50 text-green border border-green-200">
                  <Zap className="w-3 h-3 text-green fill-current" />
                  <span>100% Electric</span>
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-ink leading-snug">
              {cab.vehicleModel}
            </h3>
            <div className="text-xs text-slate font-medium">
              {cab.vehicleType} • {cab.fuelType}
            </div>
          </div>

          {/* Driver Rating */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-sky border border-line text-xs font-bold text-ink">
            <Star className="w-3.5 h-3.5 fill-ocean text-ocean" />
            <span>{cab.driverRating.toFixed(2)}</span>
          </div>
        </div>

        {/* Route Details Box */}
        <div className="p-4 rounded-xl bg-sky/50 border border-line mb-4 text-xs space-y-2">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-ocean mt-1.5 shrink-0"></div>
            <div>
              <div className="text-[10px] text-slate-muted uppercase font-bold">Pickup Origin</div>
              <div className="font-semibold text-ink">{cab.routeOrigin}</div>
            </div>
          </div>

          <div className="pl-1 border-l-2 border-dashed border-ocean/30 ml-1 py-1">
            <div className="text-[11px] text-slate font-medium pl-3 flex items-center gap-2">
              <span>{cab.distanceKm} km</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-ocean" />
                <span>~{cab.estimatedDuration}</span>
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-green mt-1.5 shrink-0"></div>
            <div>
              <div className="text-[10px] text-slate-muted uppercase font-bold">Drop Destination</div>
              <div className="font-semibold text-ink">{cab.routeDestination}</div>
            </div>
          </div>
        </div>

        {/* Capacity & Standard Amenities */}
        <div className="flex items-center gap-4 text-xs text-slate pb-4 mb-4 border-b border-line">
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-ocean" />
            <span>{cab.capacityPassengers} Passengers</span>
          </div>
          <div className="flex items-center gap-1">
            <Luggage className="w-3.5 h-3.5 text-ocean" />
            <span>{cab.capacityLuggage} Suitcases</span>
          </div>
          <div className="flex items-center gap-1 text-green font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-green" />
            <span>AC Guaranteed</span>
          </div>
        </div>

        {/* Transparent Inclusions Chips */}
        <div className="space-y-1.5 mb-4">
          <div className="text-[11px] font-bold text-ink uppercase tracking-wider">
            Included in this fare:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {cab.includesTolls && (
              <span className="px-2 py-0.5 rounded bg-sky text-ocean text-[10px] font-semibold border border-sky-deep">
                ✓ Fastag Tolls Included
              </span>
            )}
            {cab.includesParking && (
              <span className="px-2 py-0.5 rounded bg-sky text-ocean text-[10px] font-semibold border border-sky-deep">
                ✓ Airport Parking Included
              </span>
            )}
            <span className="px-2 py-0.5 rounded bg-sky text-slate text-[10px] font-semibold border border-line">
              ✓ {cab.freeWaitingMins} mins Free Flight Buffer
            </span>
            <span className="px-2 py-0.5 rounded bg-sky text-slate text-[10px] font-semibold border border-line">
              ✓ Zero Cash Surcharges
            </span>
          </div>
        </div>

        {/* Upfront Itemized Price Breakdown (Radical Transparency - Requirement 4) */}
        <div className="p-3.5 rounded-xl bg-sky/70 border border-sky-deep mb-4">
          <div className="flex items-center justify-between text-[11px] font-bold text-ocean uppercase tracking-wider mb-2">
            <span>Guaranteed All-Inclusive Fare</span>
            <span className="font-normal text-slate lowercase">fixed route</span>
          </div>

          <div className="space-y-1 text-xs text-slate">
            <div className="flex justify-between">
              <span>Base Vehicle Fare:</span>
              <span className="font-medium text-ink">{formatPrice(cab.base_price)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (Taxes):</span>
              <span className="font-medium text-ink">{formatPrice(cab.tax)}</span>
            </div>
            <div className="flex justify-between text-green font-medium">
              <span>Tolls & Surcharges:</span>
              <span>Included Upfront</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 mt-1 border-t border-line text-sm font-bold text-ink">
              <span>Final Payable Fare:</span>
              <span className="text-base text-ocean font-extrabold">
                {formatPrice(cab.total_price)}
              </span>
            </div>
          </div>

          <p className="text-[10px] text-slate-muted mt-1.5 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-green" />
            <span>Driver will never ask for cash tolls or unexpected return fees.</span>
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onOpenDetails?.(cab)}
          className="btn-secondary py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Info className="w-4 h-4 text-ocean" />
          <span>Fare Rules & Details</span>
        </button>

        <Link
          href={`/checkout?type=cab&id=${cab.id}`}
          className="btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-2"
        >
          <span>Reserve Cab</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}
