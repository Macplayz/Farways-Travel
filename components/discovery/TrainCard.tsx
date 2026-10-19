'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  TrainFront, 
  Scale, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Utensils, 
  Wifi, 
  ArrowRight, 
  Info,
  Calendar,
  Zap
} from 'lucide-react';
import { Train, TrainCoachClass } from '@/types/farways';
import { useCompare } from '@/components/CompareTray';
import { SafeImage } from '@/components/ui/SafeImage';

interface TrainCardProps {
  train: Train;
  onOpenDetails?: (train: Train) => void;
}

export function TrainCard({ train, onOpenDetails }: TrainCardProps) {
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();
  const isCompared = isInCompare(train.id);

  // Allow user to toggle between coach classes on the card
  const [selectedClassCode, setSelectedClassCode] = useState<TrainCoachClass>(
    train.selectedClass || train.classes[0]?.classCode || 'CC'
  );

  const currentClass = train.classes.find((c) => c.classCode === selectedClassCode) || train.classes[0];
  
  // Dynamic fare calculations based on selected class
  const basePrice = currentClass ? currentClass.basePrice : train.base_price;
  const tax = currentClass ? currentClass.superfastGst : train.tax;
  const platformFee = 0; // Farways zero platform fee promise
  const totalPrice = basePrice + tax + platformFee;

  const handleCompareToggle = () => {
    if (isCompared) {
      removeFromCompare(train.id);
    } else {
      addToCompare({ type: 'train', item: train });
    }
  };

  const getStatusColor = (status: string) => {
    if (status.includes('AVAILABLE') || status.includes('AVL')) {
      return 'text-green bg-green-50 border-green-200';
    }
    if (status.includes('RAC')) {
      return 'text-amber-700 bg-amber-50 border-amber-200';
    }
    return 'text-red-700 bg-red-50 border-red-200';
  };

  return (
    <article className="bg-white border border-line rounded-2xl p-5 shadow-subtle hover:shadow-card transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Train & Scenic Route Visual Banner */}
        {train.imageUrl && (
          <div className="relative w-full h-32 rounded-xl overflow-hidden mb-3 border border-line bg-sky group/trainimg">
            <SafeImage
              src={train.imageUrl}
              alt={train.trainName}
              className="w-full h-full object-cover group-hover/trainimg:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent pointer-events-none" />
            <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-[11px] font-bold pointer-events-none">
              <span className="flex items-center gap-1 backdrop-blur-md bg-ink/60 px-2 py-0.5 rounded border border-white/20">
                <TrainFront className="w-3 h-3 text-sky-deep" />
                {train.originCity} ({train.originCode}) → {train.destinationCity} ({train.destinationCode})
              </span>
              <span className="backdrop-blur-md bg-ink/60 px-2 py-0.5 rounded border border-white/20 font-mono text-[10px]">
                {train.trainType}
              </span>
            </div>
          </div>
        )}

        {/* Top Header: Train Info & Compare Checkbox */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-line">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-sky text-ocean flex items-center justify-center shrink-0 border border-sky-deep group-hover:bg-ocean group-hover:text-white transition-colors duration-200">
              <TrainFront className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-bold text-ocean">
                  #{train.trainNumber}
                </span>
                <span className="text-base font-extrabold text-ink group-hover:text-ocean transition-colors">
                  {train.trainName}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-deep text-ocean border border-ocean/20">
                  {train.trainType}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-muted" />
                <span>Runs: {train.runsOnDays.join(', ')}</span>
                <span className="text-slate-muted">•</span>
                <span>{train.distanceKm} km</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* Punctuality Badge */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green border border-green-200">
              <Clock className="w-3.5 h-3.5" />
              <span>{train.onTimeScore}% On-Time</span>
            </div>

            {/* Compare Checkbox */}
            <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky text-ink text-xs font-bold border border-line cursor-pointer hover:bg-sky-deep transition-colors select-none">
              <input
                type="checkbox"
                checked={isCompared}
                onChange={handleCompareToggle}
                className="rounded border-line text-ocean focus:ring-ocean cursor-pointer"
              />
              <Scale className="w-3.5 h-3.5 text-ocean" />
              <span>Compare</span>
            </label>
          </div>
        </div>

        {/* Schedule & Route Strip */}
        <div className="py-4 my-2 grid grid-cols-3 items-center gap-2 bg-sky/40 p-4 rounded-xl border border-sky-deep/60">
          {/* Departure Station */}
          <div>
            <div className="font-mono text-xl font-extrabold text-ink leading-tight">
              {train.departureTime}
            </div>
            <div className="text-xs font-bold text-ocean mt-0.5">
              {train.originCode}
            </div>
            <div className="text-[11px] text-slate truncate" title={train.originStation}>
              {train.originStation}
            </div>
          </div>

          {/* Duration Indicator */}
          <div className="flex flex-col items-center justify-center">
            <span className="text-[11px] font-semibold text-slate mb-1">
              {train.durationFormatted}
            </span>
            <div className="w-full flex items-center gap-1.5 px-2">
              <div className="h-0.5 flex-1 bg-line relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-ocean" />
              </div>
            </div>
            <span className="text-[10px] text-green font-semibold mt-1">
              Direct Superfast
            </span>
          </div>

          {/* Arrival Station */}
          <div className="text-right">
            <div className="font-mono text-xl font-extrabold text-ink leading-tight">
              {train.arrivalTime}
            </div>
            <div className="text-xs font-bold text-ocean mt-0.5">
              {train.destinationCode}
            </div>
            <div className="text-[11px] text-slate truncate" title={train.destinationStation}>
              {train.destinationStation}
            </div>
          </div>
        </div>

        {/* Coach Class & Live Seat Availability Selector */}
        <div className="mb-4">
          <div className="text-xs font-bold text-ink mb-2 flex items-center justify-between">
            <span className="uppercase tracking-wider text-[11px] text-slate">
              Select Coach Class & Live IRCTC Quota:
            </span>
            <span className="text-[11px] text-green font-semibold flex items-center gap-1">
              <Zap className="w-3 h-3" /> Live Seat Status
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {train.classes.map((cls) => {
              const isSelected = cls.classCode === selectedClassCode;
              return (
                <button
                  key={cls.classCode}
                  type="button"
                  onClick={() => setSelectedClassCode(cls.classCode)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-ocean bg-ocean text-white shadow-sm ring-2 ring-ocean/20'
                      : 'border-line bg-white hover:border-ocean/50 hover:bg-sky/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-extrabold ${isSelected ? 'text-white' : 'text-ink'}`}>
                      {cls.classCode}
                    </span>
                    <span className={`text-xs font-bold ${isSelected ? 'text-sky-deep' : 'text-ocean'}`}>
                      ₹{cls.fare.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className={`text-[10px] truncate ${isSelected ? 'text-white/80' : 'text-slate'}`}>
                    {cls.className}
                  </div>
                  <div className="mt-1.5">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                        isSelected
                          ? 'bg-white/20 text-white border-white/30'
                          : getStatusColor(cls.status)
                      }`}
                    >
                      {cls.status}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Train Amenities & Policies Strip */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate pb-4 mb-4 border-b border-line">
          {train.cateringIncluded ? (
            <div className="flex items-center gap-1 text-green font-medium">
              <Utensils className="w-3.5 h-3.5" />
              <span>Complimentary Hot Meals Included</span>
            </div>
          ) : train.pantryAvailable ? (
            <div className="flex items-center gap-1 text-slate">
              <Utensils className="w-3.5 h-3.5" />
              <span>Pantry Car Available</span>
            </div>
          ) : null}

          <div className="flex items-center gap-1">
            <Wifi className="w-3.5 h-3.5 text-ocean" />
            <span>Infotainment Wi-Fi</span>
          </div>

          <div className="flex items-center gap-1 text-slate">
            <CheckCircle2 className="w-3.5 h-3.5 text-green" />
            <span>{train.cancellationPolicy.description}</span>
          </div>
        </div>

        {/* Upfront Itemized Price Breakdown (Radical Farways Transparency) */}
        <div className="p-3.5 rounded-xl bg-sky/70 border border-sky-deep mb-4">
          <div className="flex items-center justify-between text-[11px] font-bold text-ocean uppercase tracking-wider mb-2">
            <span>Upfront Itemized Fare Breakdown</span>
            <span className="font-normal text-slate lowercase">
              Class {selectedClassCode} · per traveler
            </span>
          </div>

          <div className="space-y-1 text-xs text-slate">
            <div className="flex justify-between">
              <span>Base IRCTC Fare:</span>
              <span className="font-medium text-ink">₹{basePrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Superfast & GST Surcharge:</span>
              <span className="font-medium text-ink">₹{tax.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-green font-semibold">
              <span>Farways Convenience Fee:</span>
              <span>₹0 (Zero Platform Markup)</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 mt-1 border-t border-line text-sm font-bold text-ink">
              <span>Net Guaranteed Total:</span>
              <span className="text-base text-ocean font-extrabold">
                ₹{totalPrice.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <p className="text-[10px] text-slate-muted mt-1.5 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-green shrink-0" />
            <span>Zero hidden IRCTC agent surcharges or payment gateway drip fees.</span>
          </p>
        </div>
      </div>

      {/* Action Suite: Details Modal Button & Direct Checkout Link */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
        <button
          type="button"
          onClick={() => onOpenDetails?.(train)}
          className="btn-secondary py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Info className="w-4 h-4 text-ocean" />
          <span>Fare Rules & Details</span>
        </button>

        <Link
          href={`/checkout?type=train&id=${train.id}&class=${selectedClassCode}`}
          className="btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
        >
          <span>Book Class {selectedClassCode}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}
