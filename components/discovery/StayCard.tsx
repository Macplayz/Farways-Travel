'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Camera, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  Star, 
  Users, 
  Bed, 
  ShieldCheck, 
  Scale,
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Stay } from '@/types/farways';
import { useCompare } from '@/components/CompareTray';
import { SafeImage } from '@/components/ui/SafeImage';

interface StayCardProps {
  stay: Stay;
  priceMode: 'per_night' | 'total';
  stayNights: number;
  onOpenDetails?: (stay: Stay) => void;
}

export function StayCard({ stay, priceMode, stayNights, onOpenDetails }: StayCardProps) {
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();
  const isCompared = isInCompare(stay.id);

  const photos = useMemo(() => {
    if (stay.gallery && stay.gallery.length > 0) return stay.gallery;
    if (stay.images && stay.images.length > 0) return stay.images;
    return [stay.thumbnail];
  }, [stay]);

  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentPhotoIdx((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentPhotoIdx((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  const multiplier = priceMode === 'total' ? stayNights : 1;
  const displayedBase = stay.base_price * multiplier;
  const displayedTax = stay.tax * multiplier;
  const displayedPlatform = stay.platform_fee * multiplier;
  const displayedTotal = stay.total_price * multiplier;

  const handleCompareToggle = () => {
    if (isCompared) {
      removeFromCompare(stay.id);
    } else {
      addToCompare({ type: 'stay', item: stay });
    }
  };

  return (
    <article className="bg-white border border-line rounded-2xl overflow-hidden shadow-subtle hover:shadow-card transition-all duration-200 flex flex-col h-full group">
      <div className="flex-1 flex flex-col">
        {/* Visual Media Header with Mini Carousel */}
        <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-sky group/carousel shrink-0">
          <SafeImage
            src={photos[currentPhotoIdx]}
            alt={`${stay.name} - Verified Photo ${currentPhotoIdx + 1}`}
            containerClassName="w-full h-full"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />

          {/* Carousel Left/Right Controls */}
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevPhoto}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-ink/65 hover:bg-ink text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200 z-10 cursor-pointer shadow-sm"
                aria-label="Previous hotel photo"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextPhoto}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-ink/65 hover:bg-ink text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200 z-10 cursor-pointer shadow-sm"
                aria-label="Next hotel photo"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Photo Index Indicator */}
              <div className="absolute bottom-3 right-3 z-10">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-ink/80 text-white backdrop-blur-sm shadow-sm">
                  {currentPhotoIdx + 1}/{photos.length}
                </span>
              </div>
            </>
          )}

          {/* Top Left: City Badge */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-ink/85 backdrop-blur-sm text-white shadow-sm">
              {stay.city}
            </span>
            {stay.featuredBadge && (
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-ocean/90 backdrop-blur-sm text-white shadow-sm">
                {stay.featuredBadge}
              </span>
            )}
          </div>

          {/* Top Right: Compare Checkbox */}
          <div className="absolute top-3 right-3 z-10">
            <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-sm text-ink text-xs font-bold shadow-sm cursor-pointer hover:bg-white select-none border border-line">
              <input
                type="checkbox"
                checked={isCompared}
                onChange={handleCompareToggle}
                className="rounded border-line text-ocean focus:ring-ocean cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-ocean" />
                <span>Compare</span>
              </span>
            </label>
          </div>

          {/* Bottom Left: Real Guest Photos Verified Badge (Empathy Map Solution) */}
          <div className="absolute bottom-3 left-3 z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white/95 backdrop-blur-sm text-ink border border-line shadow-sm">
              <Camera className="w-3.5 h-3.5 text-ocean" />
              <span>Real Guest Photos (Verified Unedited)</span>
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Top Info Block */}
          <div>
            {/* Rating, Star Category & Review Count */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-ocean text-white text-xs font-extrabold">
                  <Star className="w-3 h-3 fill-current" />
                  <span>{stay.rating.toFixed(1)}</span>
                </div>
                <span className="text-xs font-bold text-ink">
                  {stay.starCategory}-Star {stay.propertyType}
                </span>
              </div>
              <span className="text-xs text-slate">
                {stay.reviewCount.toLocaleString('en-IN')} verified reviews
              </span>
            </div>

            {/* Hotel Name & Tagline */}
            <h3 className="text-lg font-bold text-ink leading-snug group-hover:text-ocean transition-colors">
              {stay.name}
            </h3>
            <p className="text-xs text-slate mt-0.5 line-clamp-1">
              {stay.tagline}
            </p>

            {/* Location Landmark */}
            <div className="flex items-center gap-1.5 text-xs text-slate mt-2">
              <MapPin className="w-3.5 h-3.5 text-ocean shrink-0" />
              <span className="truncate">{stay.location}</span>
            </div>

            {/* Room Type & Capacity */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-muted mt-3 pt-3 border-t border-line">
              <div className="flex items-center gap-1">
                <Bed className="w-3.5 h-3.5 text-slate" />
                <span>{stay.bedType}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate" />
                <span>Up to {stay.maxGuests} Guests</span>
              </div>
            </div>
          </div>

          {/* Cancellation Policy Plain-English Tag - Anchored with mt-auto */}
          <div className="mt-auto pt-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 w-full">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
              <span className="truncate">{stay.cancellationPolicy.description}</span>
            </div>
          </div>

          {/* Upfront Itemized Price Breakdown (Radical Transparency - Requirement 4) */}
          <div className="mt-3 p-3.5 rounded-xl bg-sky/70 border border-sky-deep">
            <div className="flex items-center justify-between text-[11px] font-bold text-ocean uppercase tracking-wider mb-2">
              <span>Upfront Itemized Breakdown</span>
              <span className="font-normal text-slate lowercase">
                {priceMode === 'total' ? `for ${stayNights} nights` : 'per night'}
              </span>
            </div>

            <div className="space-y-1 text-xs text-slate">
              <div className="flex justify-between">
                <span>Base Rate:</span>
                <span className="font-medium text-ink">₹{displayedBase.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (Taxes):</span>
                <span className="font-medium text-ink">₹{displayedTax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-green font-medium">
                <span>Platform Fee:</span>
                <span>₹{displayedPlatform} (Zero Markup)</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 mt-1 border-t border-line text-sm font-bold text-ink">
                <span>Guaranteed Total:</span>
                <span className="text-base text-ocean font-extrabold">
                  ₹{displayedTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-slate-muted mt-1.5 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-green" />
              <span>Guaranteed Final Total. Zero drip fees added at checkout.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="p-5 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onOpenDetails?.(stay)}
          className="btn-secondary py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Info className="w-4 h-4 text-ocean" />
          <span>View Details & Rooms</span>
        </button>

        <Link
          href={`/checkout?type=stay&id=${stay.id}`}
          className="btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-2"
        >
          <span>Reserve Room</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}
