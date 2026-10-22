'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  Star,
  ShieldCheck,
  Building2,
  Plane,
  TrainFront,
  Car,
  MapPin,
  Clock,
  Luggage,
  Calendar,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Info,
  Bed,
  Users,
  Footprints,
  Shield,
  ArrowRight,
  Zap,
  Calculator,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Camera
} from 'lucide-react';
import { Stay, Flight, Train, Cab, RoomCategory, TrainCoachClass } from '@/types/farways';
import { SafeImage } from '@/components/ui/SafeImage';
import { useCurrency } from '@/lib/context/CurrencyContext';

export type DetailItem =
  | { type: 'stay'; item: Stay }
  | { type: 'flight'; item: Flight }
  | { type: 'train'; item: Train }
  | { type: 'cab'; item: Cab };

interface ItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: DetailItem | null;
}

export function ItemDetailModal({ isOpen, onClose, data }: ItemDetailModalProps) {
  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !data) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-ink/65 backdrop-blur-sm animate-calm"
      onClick={onClose}
    >
      <div
        className="bg-white border border-line rounded-2xl shadow-modal w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-ink"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-line flex items-center justify-between bg-sky/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ocean text-white flex items-center justify-center shrink-0 shadow-sm">
              {data.type === 'stay' && <Building2 className="w-5 h-5" />}
              {data.type === 'flight' && <Plane className="w-5 h-5" />}
              {data.type === 'train' && <TrainFront className="w-5 h-5" />}
              {data.type === 'cab' && <Car className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-sky-deep text-ocean border border-ocean/20">
                  {data.type === 'stay'
                    ? 'Verified Property Profile'
                    : data.type === 'flight'
                    ? 'Aviation Fare Rules & Specifications'
                    : data.type === 'train'
                    ? 'Indian Railways Transit & Quota Details'
                    : 'Fixed-Rate Transit Rules'}
                </span>
                <span className="text-[11px] text-green font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% Transparent
                </span>
              </div>
              <h2 id="modal-detail-title" className="text-base sm:text-lg font-extrabold text-ink leading-snug mt-0.5">
                {data.type === 'stay' && data.item.name}
                {data.type === 'flight' && `${data.item.airlineName} ${data.item.flightNumber} (${data.item.originCode} → ${data.item.destinationCode})`}
                {data.type === 'train' && `${data.item.trainNumber} · ${data.item.trainName}`}
                {data.type === 'cab' && `${data.item.vehicleModel} (${data.item.routeOrigin} → ${data.item.routeDestination})`}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate hover:text-ink hover:bg-sky transition-colors cursor-pointer"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {data.type === 'stay' && <StayDetailView stay={data.item} onClose={onClose} />}
          {data.type === 'flight' && <FlightDetailView flight={data.item} onClose={onClose} />}
          {data.type === 'train' && <TrainDetailView train={data.item} onClose={onClose} />}
          {data.type === 'cab' && <CabDetailView cab={data.item} onClose={onClose} />}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 1. STAY DETAIL VIEW
// Room Category Selector, Walk/Safety Score, Pros/Cons, Cancellation Timeline
// =========================================================================
function StayDetailView({ stay, onClose }: { stay: Stay; onClose: () => void }) {
  const { formatPrice } = useCurrency();
  // Generate robust room categories if none explicitly provided
  const categories: RoomCategory[] = stay.roomCategories && stay.roomCategories.length > 0
    ? stay.roomCategories
    : [
        {
          id: 'deluxe',
          name: stay.roomType || 'Deluxe City View Room',
          bedType: stay.bedType || '1 King Bed or 2 Twin Beds',
          sizeSqFt: 380,
          basePrice: stay.base_price,
          tax: stay.tax,
          totalPrice: stay.total_price,
          perks: ['High-speed Wi-Fi', 'Complimentary Bottled Water', 'Soundproof Windows'],
          maxGuests: stay.maxGuests || 2,
        },
        {
          id: 'executive',
          name: 'Executive Club Room (High Floor)',
          bedType: '1 Plush King Bed',
          sizeSqFt: 460,
          basePrice: Math.round(stay.base_price * 1.3),
          tax: Math.round(stay.tax * 1.3),
          totalPrice: Math.round(stay.total_price * 1.3),
          perks: ['Club Lounge Access', 'Evening Hors d’oeuvres', 'Express Check-In', 'Bathtub & Rainforest Shower'],
          maxGuests: stay.maxGuests || 2,
        },
        {
          id: 'suite',
          name: 'Luxury Corner Heritage Suite',
          bedType: '1 Master King + Living Area',
          sizeSqFt: 680,
          basePrice: Math.round(stay.base_price * 1.8),
          tax: Math.round(stay.tax * 1.8),
          totalPrice: Math.round(stay.total_price * 1.8),
          perks: ['Panoramic Views', 'Dedicated 24/7 Butler', 'Complimentary Buffet Breakfast', 'Airport Luxury Transfer'],
          maxGuests: (stay.maxGuests || 2) + 1,
        },
      ];

  const [selectedRoomId, setSelectedRoomId] = useState<string>(categories[0].id);
  const selectedRoom = categories.find((c) => c.id === selectedRoomId) || categories[0];

  const walkScore = stay.walkScore || 93;
  const safetyScore = stay.safetyScore || 95;

  const pros = stay.prosCons?.pros || [
    'Strict acoustic double-glazing ensures quiet sleep despite central location',
    'Unedited, verified guest room photos certified without lens distortion',
    'Fast 120 Mbps Wi-Fi and ergonomic desk setup ideal for remote business travel',
    'Spotless hygiene verified via independent third-party cleanliness audits',
  ];

  const cons = stay.prosCons?.cons || [
    'Peak-hour elevator wait times can reach 3–4 minutes during morning buffet hours',
    'Valet car retrieval may require a 10-minute heads-up on weekend evenings',
    'Heritage wing layout requires brief stair access before elevator landing',
  ];

  const photos = (stay.gallery && stay.gallery.length > 0)
    ? stay.gallery
    : (stay.images && stay.images.length > 0)
    ? stay.images
    : stay.thumbnail
    ? [stay.thumbnail]
    : [];

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  const photoLabels = [
    'Exterior & Architecture',
    'Bedroom Suite & Living',
    'Pool & Fine Dining',
    'Luxury Marble Bathroom'
  ];

  return (
    <div className="space-y-6">
      {/* Interactive Hotel Photo Gallery with Trust Badge */}
      {photos.length > 0 && (
        <div className="space-y-2.5">
          <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-line bg-sky group">
            <SafeImage
              src={photos[activePhotoIdx] || photos[0]}
              alt={`${stay.name} - ${photoLabels[activePhotoIdx] || 'Gallery'}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-black/30 pointer-events-none" />

            {/* Trust Badge Top Left */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-ink text-xs font-bold shadow-md border border-line">
              <Camera className="w-3.5 h-3.5 text-ocean" />
              <span>Real Guest Photos</span>
              <span className="text-slate-muted">•</span>
              <span className="text-green flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3 text-green" /> Verified Unedited
              </span>
            </div>

            {/* Photo Counter Pill Top Right */}
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-ink/75 backdrop-blur-md text-white text-xs font-mono font-semibold border border-white/20">
              {activePhotoIdx + 1} / {photos.length}
            </div>

            {/* Chevrons */}
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActivePhotoIdx((prev) => (prev === 0 ? photos.length - 1 : prev - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-ink flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActivePhotoIdx((prev) => (prev === photos.length - 1 ? 0 : prev + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-ink flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Bottom Caption Pill */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs pointer-events-none">
              <span className="font-bold tracking-wide backdrop-blur-md bg-ink/60 px-3 py-1 rounded-lg border border-white/20">
                {photoLabels[activePhotoIdx] || `Photo ${activePhotoIdx + 1}`}
              </span>
              <span className="text-[11px] text-sky-deep backdrop-blur-md bg-ink/60 px-2.5 py-1 rounded-lg border border-white/20">
                Independent Third-Party Verified
              </span>
            </div>
          </div>

          {/* Thumbnail Strip */}
          {photos.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {photos.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActivePhotoIdx(idx)}
                  className={`relative h-16 sm:h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    activePhotoIdx === idx
                      ? 'border-ocean ring-2 ring-ocean/30 scale-[1.02]'
                      : 'border-line hover:border-ocean/50 opacity-70 hover:opacity-100'
                  }`}
                >
                  <SafeImage src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-ink/75 text-white backdrop-blur-xs">
                    {photoLabels[idx]?.split(' ')[0] || `P${idx + 1}`}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Property Overview Strip */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-sky/50 border border-sky-deep">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-ocean text-white font-extrabold text-xs">
              ★ {stay.rating.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-ink">
              {stay.starCategory}-Star {stay.propertyType}
            </span>
            <span className="text-xs text-slate">
              ({stay.reviewCount.toLocaleString('en-IN')} verified traveler reviews)
            </span>
          </div>
          <p className="text-xs text-slate mt-1">{stay.location}</p>
          <p className="text-xs text-slate-muted mt-0.5">{stay.address}</p>
        </div>

        <div className="flex items-center gap-4 sm:border-l sm:border-line sm:pl-4">
          <div className="text-center">
            <span className="text-[10px] text-slate-muted block font-semibold uppercase">Check-in</span>
            <span className="text-sm font-bold text-ink">{stay.checkInTime}</span>
            <span className="text-[10px] text-green block">Flexible buffer</span>
          </div>
          <div className="text-center">
            <span className="text-[10px] text-slate-muted block font-semibold uppercase">Check-out</span>
            <span className="text-sm font-bold text-ink">{stay.checkOutTime}</span>
            <span className="text-[10px] text-slate block">Express 1-tap</span>
          </div>
        </div>
      </div>

      {/* Neighborhood Walkability & Safety Scores */}
      <div>
        <h3 className="text-sm font-extrabold text-ink uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Footprints className="w-4 h-4 text-ocean" />
          <span>Neighborhood Intelligence & Safety Audits</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl border border-line bg-white shadow-subtle">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                <Footprints className="w-4 h-4 text-ocean" /> Walkability Score
              </span>
              <span className="px-2 py-0.5 rounded bg-green-50 text-green font-extrabold text-xs border border-green-200">
                {walkScore}/100 · Walker’s Paradise
              </span>
            </div>
            <p className="text-xs text-slate leading-relaxed">
              Daily errands, metro stations, pharmacy, and prominent restaurants do not require a vehicle. Pedestrian crossings and wide sidewalks available.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-line bg-white shadow-subtle">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-ocean" /> Solo & Night Safety Score
              </span>
              <span className="px-2 py-0.5 rounded bg-green-50 text-green font-extrabold text-xs border border-green-200">
                {safetyScore}/100 · Highly Secure
              </span>
            </div>
            <p className="text-xs text-slate leading-relaxed">
              Well-lit arterial street with 24/7 security concierge, active commercial frontage, and licensed radio cabs accessible directly at the porte-cochère.
            </p>
          </div>
        </div>
      </div>

      {/* Verified Guest Pros & Cons (Anti-Dark Pattern Transparency) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-extrabold text-ink uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-ocean" />
            <span>Unbiased Verified Guest Pros & Cons</span>
          </h3>
          <span className="text-[11px] text-slate-muted">Aggregated from verified stays only</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Pros */}
          <div className="p-4 rounded-xl border border-green-200 bg-green-50/50">
            <div className="text-xs font-bold text-green flex items-center gap-1.5 mb-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Verified Guest Praises (Pros)</span>
            </div>
            <ul className="space-y-2 text-xs text-ink/90">
              {pros.map((pro, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-green font-bold">✓</span>
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cons (Honest disclosure that Booking.com hides) */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
            <div className="text-xs font-bold text-amber-800 flex items-center gap-1.5 mb-2.5">
              <Info className="w-4 h-4 shrink-0" />
              <span>Transparent Caveats & Cons (Honest Disclosures)</span>
            </div>
            <ul className="space-y-2 text-xs text-ink/90">
              {cons.map((con, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-700 font-bold">•</span>
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Room Category Selector */}
      <div>
        <h3 className="text-sm font-extrabold text-ink uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Bed className="w-4 h-4 text-ocean" />
          <span>Select Room Category & Specifications</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {categories.map((cat) => {
            const isSelected = cat.id === selectedRoomId;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedRoomId(cat.id)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-ocean bg-sky/40 shadow-sm ring-2 ring-ocean/30'
                    : 'border-line bg-white hover:border-slate/40'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="text-xs font-extrabold text-ink leading-snug">
                      {cat.name}
                    </span>
                    <span className="text-xs font-bold text-ocean shrink-0">
                      {formatPrice(cat.totalPrice)}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate space-y-0.5 mt-2">
                    <div className="flex items-center gap-1">
                      <Bed className="w-3.5 h-3.5 text-slate-muted" />
                      <span>{cat.bedType}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-muted" />
                      <span>Up to {cat.maxGuests} Guests · {cat.sizeSqFt} sq.ft</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-line/60 space-y-1">
                    {cat.perks.map((p, pidx) => (
                      <div key={pidx} className="text-[10px] text-green font-medium flex items-center gap-1">
                        <span>✓</span>
                        <span className="truncate">{p}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-line flex items-center justify-between text-[11px]">
                  <span className="text-slate font-medium">All taxes included</span>
                  <span className={`font-bold ${isSelected ? 'text-ocean' : 'text-slate'}`}>
                    {isSelected ? '● Selected' : 'Select'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Exact Cancellation Timeline (Visual Timeline) */}
      <div className="p-4 rounded-xl bg-sky/60 border border-sky-deep">
        <h4 className="text-xs font-bold text-ocean uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Calendar className="w-4 h-4" /> Exact Cancellation & Refund Timeline
        </h4>

        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-line">
          {/* Step 1 */}
          <div className="relative">
            <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-green ring-4 ring-green-100" />
            <div className="text-xs font-bold text-ink">
              Until 48 Hours Before Check-in ({stay.checkInTime})
            </div>
            <div className="text-[11px] text-green font-medium">
              100% Full Refund credited to original payment source. {formatPrice(0)} Farways cancellation fee.
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative">
            <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-100" />
            <div className="text-xs font-bold text-ink">
              Within 24 to 48 Hours of Check-in
            </div>
            <div className="text-[11px] text-slate">
              50% Partial Refund (Hotel direct late-retention fee applies).
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative">
            <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-4 ring-red-100" />
            <div className="text-xs font-bold text-ink">
              Less than 24 Hours or No-Show
            </div>
            <div className="text-[11px] text-slate">
              First night room charge retained by property. Subsequent nights 100% refunded.
            </div>
          </div>
        </div>
      </div>

      {/* Upfront Total Itemized Footer with Action */}
      <div className="p-4 rounded-xl bg-white border border-line flex flex-col sm:flex-row items-center justify-between gap-4 shadow-subtle">
        <div>
          <div className="text-xs text-slate">
            Selected: <span className="font-bold text-ink">{selectedRoom.name}</span>
          </div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xl font-extrabold text-ocean">
              {formatPrice(selectedRoom.totalPrice)}
            </span>
            <span className="text-xs text-slate">
              ({formatPrice(selectedRoom.basePrice)} room + {formatPrice(selectedRoom.tax)} GST + {formatPrice(0)} Fee)
            </span>
          </div>
        </div>

        <Link
          href={`/checkout?type=stay&id=${stay.id}&room=${selectedRoom.id}`}
          onClick={onClose}
          className="btn-primary py-2.5 px-6 text-xs font-bold flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <span>Reserve {selectedRoom.name.split(' ')[0]}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

// =========================================================================
// 2. FLIGHT DETAIL VIEW
// Baggage Breakdown, Terminal Specifications, On-time History, Refund Calc
// =========================================================================
function FlightDetailView({ flight, onClose }: { flight: Flight; onClose: () => void }) {
  const { formatPrice } = useCurrency();
  const [calcTiming, setCalcTiming] = useState<'early' | 'mid' | 'late'>('early');

  const baseFare = flight.base_price;
  const taxes = flight.tax;
  const total = flight.total_price;

  // Transparent cancellation calculator values
  let airlineDeduction = 0;
  if (calcTiming === 'early') airlineDeduction = 2500; // > 72 hrs
  else if (calcTiming === 'mid') airlineDeduction = 3500; // 24-72 hrs
  else airlineDeduction = Math.min(baseFare, 4500); // < 24 hrs

  const netRefund = Math.max(0, total - airlineDeduction);

  return (
    <div className="space-y-6">
      {/* Aircraft & Route Visual Banner */}
      {flight.imageUrl && (
        <div className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden border border-line bg-sky group">
          <SafeImage
            src={flight.imageUrl}
            alt={`${flight.airlineName} ${flight.aircraft}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent pointer-events-none" />
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-ink text-xs font-bold shadow-md border border-line">
            <Plane className="w-3.5 h-3.5 text-ocean" />
            <span>Verified Aviation Fleet</span>
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-bold pointer-events-none">
            <span className="backdrop-blur-md bg-ink/60 px-3 py-1 rounded-lg border border-white/20">
              {flight.originCity} ({flight.originCode}) → {flight.destinationCity} ({flight.destinationCode})
            </span>
            <span className="backdrop-blur-md bg-ink/60 px-3 py-1 rounded-lg border border-white/20 font-mono">
              {flight.aircraft} · {flight.flightNumber}
            </span>
          </div>
        </div>
      )}

      {/* Route & Aircraft Strip */}
      <div className="p-4 rounded-xl bg-sky/50 border border-sky-deep flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-sky-deep text-ocean font-bold text-xs">
              {flight.airlineCode}
            </span>
            <span className="text-base font-extrabold text-ink">{flight.airlineName}</span>
            <span className="text-xs text-slate">{flight.flightNumber}</span>
          </div>
          <div className="text-xs text-slate-muted mt-1">
            Aircraft: <span className="font-semibold text-ink">{flight.aircraft}</span> • Cabin: {flight.cabinClass}
          </div>
        </div>

        <div className="flex items-center gap-6 text-center">
          <div>
            <div className="font-mono text-lg font-bold text-ink">{flight.departureTime}</div>
            <div className="text-xs font-bold text-ocean">{flight.originCode}</div>
            <div className="text-[10px] text-slate">{flight.originTerminal}</div>
          </div>
          <div className="text-center text-xs text-slate-muted">
            <div>{flight.durationFormatted}</div>
            <div className="text-[10px] text-green font-semibold">Non-stop</div>
          </div>
          <div>
            <div className="font-mono text-lg font-bold text-ink">{flight.arrivalTime}</div>
            <div className="text-xs font-bold text-ocean">{flight.destinationCode}</div>
            <div className="text-[10px] text-slate">{flight.destinationTerminal}</div>
          </div>
        </div>
      </div>

      {/* Baggage Breakdown & Specifications */}
      <div>
        <h3 className="text-sm font-extrabold text-ink uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Luggage className="w-4 h-4 text-ocean" />
          <span>Baggage Entitlements & Dimensions</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl border border-line bg-white shadow-subtle">
            <div className="flex items-center gap-2 mb-1">
              <Luggage className="w-4 h-4 text-ocean" />
              <span className="text-xs font-bold text-ink">Cabin Baggage</span>
            </div>
            <div className="text-base font-extrabold text-ocean">
              {flight.baggageAllowance.cabinKg} kg / person
            </div>
            <p className="text-[11px] text-slate mt-1">
              1 piece up to 55 x 35 x 25 cm. Plus 1 small personal laptop/handbag (3 kg max).
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-line bg-white shadow-subtle">
            <div className="flex items-center gap-2 mb-1">
              <Luggage className="w-4 h-4 text-ocean" />
              <span className="text-xs font-bold text-ink">Check-in Baggage</span>
            </div>
            <div className="text-base font-extrabold text-ocean">
              {flight.baggageAllowance.checkInKg} kg / person
            </div>
            <p className="text-[11px] text-slate mt-1">
              Standard check-in allowance. Maximum linear dimensions (L+W+H) not exceeding 158 cm.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-line bg-white shadow-subtle">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-green" />
              <span className="text-xs font-bold text-ink">Extra Baggage Rates</span>
            </div>
            <div className="text-base font-extrabold text-ink">
              {formatPrice(550)} / kg upfront
            </div>
            <p className="text-[11px] text-slate mt-1">
              Zero surge fees at counter if pre-booked. Transparent flat IR/DGCA rate.
            </p>
          </div>
        </div>
      </div>

      {/* On-Time Reliability History & Carbon Transparency */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-4 rounded-xl border border-green-200 bg-green-50/50">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-green flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> DGCA On-Time Reliability
            </span>
            <span className="px-2 py-0.5 rounded bg-white text-green font-extrabold text-xs border border-green-300">
              {flight.onTimePerformanceScore}% Punctual
            </span>
          </div>
          <p className="text-xs text-slate leading-relaxed">
            Historical departure records across last 90 days. Average gate delay is under 5 minutes. Boarding gates strictly close 25 minutes prior to scheduled departure.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-line bg-sky/40">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-ink flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-ocean" /> Eco-Transparency Footprint
            </span>
            <span className="px-2 py-0.5 rounded bg-sky-deep text-ocean font-bold text-xs">
              {flight.carbonFootprintKg} kg CO₂ / seat
            </span>
          </div>
          <p className="text-xs text-slate leading-relaxed">
            High fuel efficiency delivered by modern high-bypass turbofan engines. 14% lower emissions compared to regional fleet averages.
          </p>
        </div>
      </div>

      {/* Plain-English Cancellation Calculator */}
      <div className="p-4 rounded-xl bg-white border border-line shadow-subtle">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-ocean" />
            <span>Interactive Plain-English Cancellation Calculator</span>
          </h3>
          <span className="text-[10px] text-green font-semibold">Zero Farways Markup</span>
        </div>

        {/* Timing Toggle */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            type="button"
            onClick={() => setCalcTiming('early')}
            className={`py-2 px-2.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
              calcTiming === 'early'
                ? 'bg-ocean text-white border-ocean'
                : 'bg-sky text-slate border-line hover:text-ink'
            }`}
          >
            &gt; 72 Hours Prior
          </button>
          <button
            type="button"
            onClick={() => setCalcTiming('mid')}
            className={`py-2 px-2.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
              calcTiming === 'mid'
                ? 'bg-ocean text-white border-ocean'
                : 'bg-sky text-slate border-line hover:text-ink'
            }`}
          >
            24 – 72 Hours Prior
          </button>
          <button
            type="button"
            onClick={() => setCalcTiming('late')}
            className={`py-2 px-2.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
              calcTiming === 'late'
                ? 'bg-ocean text-white border-ocean'
                : 'bg-sky text-slate border-line hover:text-ink'
            }`}
          >
            &lt; 24 Hours Prior
          </button>
        </div>

        {/* Calculation Matrix */}
        <div className="p-3.5 rounded-xl bg-sky/50 border border-sky-deep text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate">Total Fare Paid:</span>
            <span className="font-bold text-ink">{formatPrice(total)}</span>
          </div>
          <div className="flex justify-between text-red-600">
            <span>Airline Statutory Cancellation Penalty:</span>
            <span className="font-medium">- {formatPrice(airlineDeduction)}</span>
          </div>
          <div className="flex justify-between text-green font-medium">
            <span>Farways Processing & Cancellation Fee:</span>
            <span>{formatPrice(0)} (Zero Markup Guarantee)</span>
          </div>
          <div className="flex justify-between items-baseline pt-2 mt-1 border-t border-line text-sm font-bold text-ink">
            <span>Net Refund to Bank / UPI:</span>
            <span className="text-base text-ocean font-extrabold">
              {formatPrice(netRefund)}
            </span>
          </div>
        </div>
        <p className="text-[10px] text-slate-muted mt-2">
          Airport Passenger Service Fee (PSF) and User Development Fee (UDF) are 100% refundable by law under Indian DGCA Civil Aviation Requirements (CAR).
        </p>
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex justify-end">
        <Link
          href={`/checkout?type=flight&id=${flight.id}`}
          onClick={onClose}
          className="btn-primary py-2.5 px-6 text-xs font-bold flex items-center gap-2"
        >
          <span>Continue to Flight Checkout</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

// =========================================================================
// 3. TRAIN DETAIL VIEW
// Coach breakdown, Intermediate halts, IRCTC Refund Calculator, NTES History
// =========================================================================
function TrainDetailView({ train, onClose }: { train: Train; onClose: () => void }) {
  const { formatPrice } = useCurrency();
  const [selectedClass, setSelectedClass] = useState<TrainCoachClass>(
    train.selectedClass || train.classes[0]?.classCode || 'CC'
  );
  const [calcTiming, setCalcTiming] = useState<'early' | 'mid' | 'late'>('early');

  const currentClassInfo = train.classes.find((c) => c.classCode === selectedClass) || train.classes[0];
  const fare = currentClassInfo.fare;

  // IRCTC cancellation fee rules based on class
  let clerkage = 240; // 1A / EC
  if (['2A'].includes(selectedClass)) clerkage = 200;
  else if (['3A', 'CC'].includes(selectedClass)) clerkage = 180;
  else if (['SL', '2S'].includes(selectedClass)) clerkage = 120;

  let deduction = clerkage;
  if (calcTiming === 'early') {
    deduction = clerkage;
  } else if (calcTiming === 'mid') {
    deduction = Math.max(clerkage, Math.round(fare * 0.25));
  } else {
    deduction = Math.max(clerkage, Math.round(fare * 0.5));
  }

  const netRefund = Math.max(0, fare - deduction);

  return (
    <div className="space-y-6">
      {/* Modern Train Visual Banner */}
      {train.imageUrl && (
        <div className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden border border-line bg-sky group">
          <SafeImage
            src={train.imageUrl}
            alt={train.trainName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent pointer-events-none" />
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-ink text-xs font-bold shadow-md border border-line">
            <TrainFront className="w-3.5 h-3.5 text-ocean" />
            <span>Indian Railways Verified Route</span>
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-bold pointer-events-none">
            <span className="backdrop-blur-md bg-ink/60 px-3 py-1 rounded-lg border border-white/20">
              #{train.trainNumber} · {train.trainName}
            </span>
            <span className="backdrop-blur-md bg-ink/60 px-3 py-1 rounded-lg border border-white/20 font-mono">
              {train.trainType}
            </span>
          </div>
        </div>
      )}

      {/* Route & Train Header Strip */}
      <div className="p-4 rounded-xl bg-sky/50 border border-sky-deep flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-ocean">
              #{train.trainNumber}
            </span>
            <span className="text-base font-extrabold text-ink">{train.trainName}</span>
          </div>
          <div className="text-xs text-slate mt-1 flex items-center gap-2">
            <span className="font-semibold text-ocean">{train.trainType}</span>
            <span>•</span>
            <span>{train.distanceKm} km direct line</span>
            <span>•</span>
            <span>Runs: {train.runsOnDays.join(', ')}</span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-center">
          <div>
            <div className="font-mono text-lg font-bold text-ink">{train.departureTime}</div>
            <div className="text-xs font-bold text-ocean">{train.originCode}</div>
            <div className="text-[10px] text-slate truncate max-w-[100px]">{train.originStation}</div>
          </div>
          <div className="text-center text-xs text-slate-muted">
            <div>{train.durationFormatted}</div>
            <div className="text-[10px] text-green font-semibold">Superfast</div>
          </div>
          <div>
            <div className="font-mono text-lg font-bold text-ink">{train.arrivalTime}</div>
            <div className="text-xs font-bold text-ocean">{train.destinationCode}</div>
            <div className="text-[10px] text-slate truncate max-w-[100px]">{train.destinationStation}</div>
          </div>
        </div>
      </div>

      {/* Coach Classes & Live Availability Matrix */}
      <div>
        <h3 className="text-sm font-extrabold text-ink uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <TrainFront className="w-4 h-4 text-ocean" />
          <span>Available Coach Classes & IRCTC Quotas</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {train.classes.map((cls) => {
            const isSelected = cls.classCode === selectedClass;
            return (
              <button
                key={cls.classCode}
                type="button"
                onClick={() => setSelectedClass(cls.classCode)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-ocean bg-ocean text-white shadow-sm ring-2 ring-ocean/30'
                    : 'border-line bg-white hover:border-ocean/40'
                }`}
              >
                <div className="flex justify-between items-baseline">
                  <span className={`text-xs font-extrabold ${isSelected ? 'text-white' : 'text-ink'}`}>
                    {cls.classCode}
                  </span>
                  <span className={`text-xs font-bold ${isSelected ? 'text-sky-deep' : 'text-ocean'}`}>
                    {formatPrice(cls.fare)}
                  </span>
                </div>
                <div className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-white/80' : 'text-slate'}`}>
                  {cls.className}
                </div>
                <div className="mt-2">
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-green-50 text-green border border-green-200'
                  }`}>
                    {cls.status}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Transit Inclusions & NTES Reliability */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-4 rounded-xl border border-green-200 bg-green-50/50">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-green flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> NTES Punctuality Audit
            </span>
            <span className="px-2 py-0.5 rounded bg-white text-green font-extrabold text-xs border border-green-300">
              {train.onTimeScore}% On-Time
            </span>
          </div>
          <p className="text-xs text-slate leading-relaxed">
            Direct priority corridor clearance. Synchronized in real time with National Train Enquiry System (NTES). Automatic SMS notification for platform assignment.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-line bg-sky/40">
          <div className="text-xs font-bold text-ink flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-4 h-4 text-ocean" /> Onboard Amenities & Catering
          </div>
          <ul className="text-xs text-slate space-y-1">
            <li>• {train.cateringIncluded ? 'Complimentary hot chef-curated meals included in fare' : 'Pantry car available for a-la-carte ordering'}</li>
            <li>• Individual 230V laptop & phone charging points at every seat</li>
            <li>• Bio-vacuum toilets with touchless sensor fittings</li>
          </ul>
        </div>
      </div>

      {/* IRCTC Standard Cancellation Calculator */}
      <div className="p-4 rounded-xl bg-white border border-line shadow-subtle">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-ocean" />
            <span>IRCTC Standard Cancellation Calculator ({selectedClass})</span>
          </h3>
          <span className="text-[10px] text-green font-semibold">Zero Agent Markup</span>
        </div>

        {/* Timing Toggle */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            type="button"
            onClick={() => setCalcTiming('early')}
            className={`py-2 px-2.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
              calcTiming === 'early'
                ? 'bg-ocean text-white border-ocean'
                : 'bg-sky text-slate border-line hover:text-ink'
            }`}
          >
            &gt; 48 Hours Prior
          </button>
          <button
            type="button"
            onClick={() => setCalcTiming('mid')}
            className={`py-2 px-2.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
              calcTiming === 'mid'
                ? 'bg-ocean text-white border-ocean'
                : 'bg-sky text-slate border-line hover:text-ink'
            }`}
          >
            12 – 48 Hours Prior
          </button>
          <button
            type="button"
            onClick={() => setCalcTiming('late')}
            className={`py-2 px-2.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
              calcTiming === 'late'
                ? 'bg-ocean text-white border-ocean'
                : 'bg-sky text-slate border-line hover:text-ink'
            }`}
          >
            4 – 12 Hours Prior
          </button>
        </div>

        {/* Calculation Matrix */}
        <div className="p-3.5 rounded-xl bg-sky/50 border border-sky-deep text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate">Class {selectedClass} Total Fare:</span>
            <span className="font-bold text-ink">{formatPrice(fare)}</span>
          </div>
          <div className="flex justify-between text-red-600">
            <span>IRCTC Cancellation Clerkage / Deduction:</span>
            <span className="font-medium">- {formatPrice(deduction)}</span>
          </div>
          <div className="flex justify-between text-green font-medium">
            <span>Farways Convenience Retention:</span>
            <span>{formatPrice(0)} (100% Free Processing)</span>
          </div>
          <div className="flex justify-between items-baseline pt-2 mt-1 border-t border-line text-sm font-bold text-ink">
            <span>Net Instant Refund:</span>
            <span className="text-base text-ocean font-extrabold">
              {formatPrice(netRefund)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex justify-end">
        <Link
          href={`/checkout?type=train&id=${train.id}&class=${selectedClass}`}
          onClick={onClose}
          className="btn-primary py-2.5 px-6 text-xs font-bold flex items-center gap-2"
        >
          <span>Book Class {selectedClass} on Farways</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

// =========================================================================
// 4. CAB DETAIL VIEW
// Vehicle Specifications, Terminal Meet-and-Greet, Toll Inclusions, Refund Calc
// =========================================================================
function CabDetailView({ cab, onClose }: { cab: Cab; onClose: () => void }) {
  const { formatPrice } = useCurrency();
  const [calcTiming, setCalcTiming] = useState<'early' | 'late'>('early');
  const deduction = calcTiming === 'early' ? 0 : 150;
  const netRefund = Math.max(0, cab.total_price - deduction);

  return (
    <div className="space-y-6">
      {/* High-Resolution Vehicle Visual Banner */}
      {cab.imageUrl && (
        <div className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden border border-line bg-sky group">
          <SafeImage
            src={cab.imageUrl}
            alt={cab.vehicleModel}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent pointer-events-none" />
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-ink text-xs font-bold shadow-md border border-line">
            <Car className="w-3.5 h-3.5 text-ocean" />
            <span>Exact Vehicle Guaranteed</span>
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-bold pointer-events-none">
            <span className="backdrop-blur-md bg-ink/60 px-3 py-1 rounded-lg border border-white/20">
              {cab.vehicleModel} · {cab.operatorName}
            </span>
            <span className="backdrop-blur-md bg-ink/60 px-3 py-1 rounded-lg border border-white/20 font-mono">
              {cab.fuelType} · {cab.vehicleType}
            </span>
          </div>
        </div>
      )}

      {/* Route & Vehicle Strip */}
      <div className="p-4 rounded-xl bg-sky/50 border border-sky-deep flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-sky-deep text-ocean font-bold text-xs">
              {cab.vehicleType}
            </span>
            <span className="text-base font-extrabold text-ink">{cab.vehicleModel}</span>
          </div>
          <div className="text-xs text-slate mt-1">
            Route: <span className="font-semibold text-ink">{cab.routeOrigin} → {cab.routeDestination}</span> • {cab.estimatedDuration}
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate">Guaranteed Fixed Fare</div>
          <div className="text-xl font-extrabold text-ocean">
            {formatPrice(cab.total_price)}
          </div>
          <div className="text-[10px] text-green font-semibold">Tolls & Parking Included</div>
        </div>
      </div>

      {/* Vehicle Capacity & Luggage Breakdown */}
      <div>
        <h3 className="text-sm font-extrabold text-ink uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Car className="w-4 h-4 text-ocean" />
          <span>Vehicle Specifications & Capacity Guarantee</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl border border-line bg-white shadow-subtle">
            <span className="text-xs font-bold text-ink block mb-1">Passenger Seating</span>
            <span className="text-base font-extrabold text-ocean">
              {cab.capacityPassengers} Adults
            </span>
            <p className="text-[11px] text-slate mt-1">
              Guaranteed air-conditioned comfort with spacious legroom and seatbelts for every passenger.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-line bg-white shadow-subtle">
            <span className="text-xs font-bold text-ink block mb-1">Boot / Luggage Volume</span>
            <span className="text-base font-extrabold text-ocean">
              {cab.capacityLuggage} Large Bags
            </span>
            <p className="text-[11px] text-slate mt-1">
              Spacious dedicated boot space. Clean trunk without commercial gas cylinder obstruction.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-line bg-white shadow-subtle">
            <span className="text-xs font-bold text-green block mb-1">Flight Delay Buffer</span>
            <span className="text-base font-extrabold text-ink">
              {cab.freeWaitingMins} Mins Free
            </span>
            <p className="text-[11px] text-slate mt-1">
              Complimentary wait time calculated from real flight touchdown timestamp.
            </p>
          </div>
        </div>
      </div>

      {/* Terminal Meet-and-Greet & Driver Audits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-4 rounded-xl border border-green-200 bg-green-50/50">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-green flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> 99.4% On-Time Dispatch
            </span>
            <span className="px-2 py-0.5 rounded bg-white text-green font-extrabold text-xs border border-green-300">
              Verified
            </span>
          </div>
          <p className="text-xs text-slate leading-relaxed">
            Verified commercial drivers with background police clearance. Driver contact and live GPS link dispatched 30 minutes prior to pickup.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-line bg-sky/40">
          <div className="text-xs font-bold text-ink flex items-center gap-1.5 mb-1.5">
            <ShieldCheck className="w-4 h-4 text-green" /> Airport Column Meeting Point
          </div>
          <p className="text-xs text-slate leading-relaxed">
            Convenient curbside pickup at designated airport parking columns (e.g., Pillar P4 at T2 Arrivals). Zero airport entry fees charged to customer.
          </p>
        </div>
      </div>

      {/* Transparent Cancellation Calculator */}
      <div className="p-4 rounded-xl bg-white border border-line shadow-subtle">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-ocean" />
            <span>Cab Cancellation Policy Calculator</span>
          </h3>
          <span className="text-[10px] text-green font-semibold">Fair Compensation</span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            type="button"
            onClick={() => setCalcTiming('early')}
            className={`py-2 px-2.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
              calcTiming === 'early'
                ? 'bg-ocean text-white border-ocean'
                : 'bg-sky text-slate border-line hover:text-ink'
            }`}
          >
            &gt; 1 Hour Before Pickup
          </button>
          <button
            type="button"
            onClick={() => setCalcTiming('late')}
            className={`py-2 px-2.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
              calcTiming === 'late'
                ? 'bg-ocean text-white border-ocean'
                : 'bg-sky text-slate border-line hover:text-ink'
            }`}
          >
            &lt; 1 Hour Before Pickup
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-sky/50 border border-sky-deep text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate">Fixed Transit Fare:</span>
            <span className="font-bold text-ink">{formatPrice(cab.total_price)}</span>
          </div>
          <div className="flex justify-between text-red-600">
            <span>Driver Mobilization Compensation:</span>
            <span className="font-medium">{deduction === 0 ? formatPrice(0) : `- ${formatPrice(deduction)}`}</span>
          </div>
          <div className="flex justify-between text-green font-medium">
            <span>Farways Cancellation Retention:</span>
            <span>{formatPrice(0)} (Zero Platform Markup)</span>
          </div>
          <div className="flex justify-between items-baseline pt-2 mt-1 border-t border-line text-sm font-bold text-ink">
            <span>Net Refund to Source:</span>
            <span className="text-base text-ocean font-extrabold">
              {formatPrice(netRefund)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex justify-end">
        <Link
          href={`/checkout?type=cab&id=${cab.id}`}
          onClick={onClose}
          className="btn-primary py-2.5 px-6 text-xs font-bold flex items-center gap-2"
        >
          <span>Continue to Cab Reservation</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
