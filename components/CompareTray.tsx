'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { 
  Scale, 
  X, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Building2, 
  Plane, 
  Sparkles, 
  Info, 
  CheckCircle2, 
  AlertCircle, 
  TrainFront 
} from 'lucide-react';
import { Stay, Flight, Train } from '@/types/farways';
import { useToast } from '@/components/ToastProvider';
import { SafeImage } from '@/components/ui/SafeImage';
import Link from 'next/link';

export type CompareItem = 
  | { type: 'stay'; item: Stay }
  | { type: 'flight'; item: Flight }
  | { type: 'train'; item: Train };

interface CompareContextType {
  compareItems: CompareItem[];
  addToCompare: (item: CompareItem) => void;
  removeFromCompare: (id: string) => void;
  isInCompare: (id: string) => boolean;
  clearCompare: () => void;
  openCompareModal: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareItems, setCompareItems] = useState<CompareItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();

  const isInCompare = useCallback(
    (id: string) => compareItems.some((ci) => ci.item.id === id),
    [compareItems]
  );

  const addToCompare = useCallback(
    (newEntry: CompareItem) => {
      setCompareItems((prev) => {
        // Enforce max 3 items
        if (prev.length >= 3) {
          toast.warning('You can compare a maximum of 3 options side-by-side.', 'Comparison Limit');
          return prev;
        }

        // Check if mixing Stays and Flights
        if (prev.length > 0 && prev[0].type !== newEntry.type) {
          toast.info(
            `Currently comparing ${prev[0].type}s. Clear the tray to compare ${newEntry.type}s.`,
            'Category Mismatch'
          );
          return prev;
        }

        if (prev.some((ci) => ci.item.id === newEntry.item.id)) {
          return prev;
        }

        const itemName =
          'name' in newEntry.item
            ? newEntry.item.name
            : 'trainNumber' in newEntry.item
            ? `${newEntry.item.trainNumber} ${newEntry.item.trainName}`
            : newEntry.item.flightNumber;

        toast.success(
          `Added "${itemName}" to comparison.`,
          'Pinned for Comparison'
        );
        return [...prev, newEntry];
      });
    },
    [toast]
  );

  const removeFromCompare = useCallback((id: string) => {
    setCompareItems((prev) => prev.filter((ci) => ci.item.id !== id));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareItems([]);
  }, []);

  const openCompareModal = useCallback(() => {
    if (compareItems.length < 2) {
      toast.info('Please select at least 2 options to compare side-by-side.', 'Select Another');
      return;
    }
    setIsModalOpen(true);
  }, [compareItems, toast]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  return (
    <CompareContext.Provider
      value={{
        compareItems,
        addToCompare,
        removeFromCompare,
        isInCompare,
        clearCompare,
        openCompareModal,
      }}
    >
      {children}

      {/* Floating Bottom Compare Drawer (Contextual Inquiry Clutter Eliminator) */}
      {compareItems.length > 0 && (
        <aside
          role="region"
          aria-label="Comparison Tray"
          className="fixed bottom-16 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-4xl bg-white border border-ocean/30 rounded-2xl shadow-modal p-3.5 sm:p-4 animate-calm overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Left: Indicator & Count */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-ocean text-white flex items-center justify-center shrink-0 shadow-sm">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-ink">
                    Comparison Tray ({compareItems.length}/3)
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky text-ocean border border-sky-deep">
                    Side-by-Side
                  </span>
                </div>
                <p className="text-[11px] text-slate hidden sm:block">
                  Eliminates multi-tab browser sprawl with instant attribute matrix.
                </p>
              </div>
            </div>

            {/* Center: Selected Mini Chips (Clean scroll-free container) */}
            <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {compareItems.map((ci) => {
                const title =
                  'name' in ci.item
                    ? ci.item.name
                    : 'trainNumber' in ci.item
                    ? `${ci.item.trainNumber} ${ci.item.trainName}`
                    : `${ci.item.airlineName} ${ci.item.flightNumber}`;
                const price = ci.item.total_price;
                return (
                  <div
                    key={ci.item.id}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-sky border border-line text-xs shrink-0"
                  >
                    <span className="font-bold text-ink truncate max-w-[120px] sm:max-w-[160px]">{title}</span>
                    <span className="text-ocean font-semibold text-[11px]">₹{price.toLocaleString('en-IN')}</span>
                    <button
                      type="button"
                      onClick={() => removeFromCompare(ci.item.id)}
                      className="p-0.5 text-slate hover:text-ink rounded hover:bg-white cursor-pointer"
                      aria-label={`Remove ${title} from comparison`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
              <button
                type="button"
                onClick={clearCompare}
                className="text-xs font-medium text-slate hover:text-ink px-2 py-1.5 cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={openCompareModal}
                disabled={compareItems.length < 2}
                className="btn-primary py-2 px-3.5 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
              >
                <span>Compare Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Side-by-Side Comparison Modal with high z-index and viewport centering */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-ink/75 backdrop-blur-md animate-calm overflow-y-auto overscroll-contain"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-line rounded-3xl shadow-modal w-full max-w-5xl max-h-[94vh] sm:max-h-[90vh] flex flex-col overflow-hidden my-auto relative"
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-line flex items-center justify-between bg-sky/30 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-ocean text-white flex items-center justify-center shadow-xs">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-ink">
                    Side-by-Side Attribute Matrix
                  </h3>
                  <p className="text-xs text-slate">
                    Comprehensive, un-manipulated comparison across transparent costs and verified conditions
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate hover:text-ink hover:bg-sky transition-colors cursor-pointer"
                aria-label="Close comparison"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comparison Matrix Table Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 overscroll-contain [scrollbar-width:thin]">
              {compareItems[0]?.type === 'stay' ? (
                /* Stays Comparison Matrix */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(compareItems as { type: 'stay'; item: Stay }[]).map(({ item }) => (
                    <div
                      key={item.id}
                      className="border border-line rounded-xl p-4 bg-white shadow-subtle flex flex-col justify-between"
                    >
                      <div>
                        {/* Hotel Thumbnail & Name */}
                        <div className="relative h-36 rounded-lg overflow-hidden mb-3 bg-sky">
                          <SafeImage
                            src={item.thumbnail}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-ink/80 text-white text-[10px] font-bold">
                            {item.city}
                          </div>
                        </div>

                        <h4 className="text-base font-bold text-ink leading-snug mb-1">
                          {item.name}
                        </h4>
                        <div className="text-xs text-slate mb-3">
                          {item.location}
                        </div>

                        {/* Verified Rating & Reviews */}
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-line">
                          <span className="px-2 py-0.5 rounded bg-ocean text-white font-bold text-xs">
                            ★ {item.rating.toFixed(1)}
                          </span>
                          <span className="text-xs text-slate">
                            {item.reviewCount.toLocaleString('en-IN')} verified reviews
                          </span>
                        </div>

                        {/* Attribute Matrix Rows */}
                        <div className="space-y-3 text-xs">
                          <div>
                            <span className="text-slate-muted block text-[11px]">Room Type</span>
                            <span className="font-semibold text-ink">{item.roomType}</span>
                          </div>

                          <div>
                            <span className="text-slate-muted block text-[11px]">Bed & Capacity</span>
                            <span className="font-semibold text-ink">{item.bedType} (Max {item.maxGuests} Guests)</span>
                          </div>

                          <div>
                            <span className="text-slate-muted block text-[11px]">Cancellation Terms</span>
                            <span className="font-semibold text-green flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{item.cancellationPolicy.description}</span>
                            </span>
                          </div>

                          <div>
                            <span className="text-slate-muted block text-[11px]">Amenities</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.amenities.slice(0, 3).map((a) => (
                                <span
                                  key={a}
                                  className="px-2 py-0.5 rounded bg-sky text-slate text-[10px] border border-line"
                                >
                                  {a}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Radical Price Breakdown Matrix Box */}
                          <div className="p-3 rounded-xl bg-sky/70 border border-sky-deep mt-4">
                            <div className="text-[11px] font-bold text-ocean uppercase tracking-wider mb-2">
                              Upfront Price Breakdown
                            </div>
                            <div className="space-y-1 text-slate">
                              <div className="flex justify-between">
                                <span>Base Room Rate:</span>
                                <span>₹{item.base_price.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>GST (Taxes):</span>
                                <span>₹{item.tax.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="flex justify-between text-green font-medium">
                                <span>Platform Fee:</span>
                                <span>₹{item.platform_fee} (Zero Markup)</span>
                              </div>
                              <div className="flex justify-between pt-1.5 border-t border-line font-bold text-ink text-sm">
                                <span>Net Total:</span>
                                <span className="text-ocean">₹{item.total_price.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="pt-4 mt-4 border-t border-line">
                        <Link
                          href={`/checkout?type=stay&id=${item.id}`}
                          onClick={() => setIsModalOpen(false)}
                          className="w-full btn-primary py-2.5 text-xs font-bold text-center flex items-center justify-center gap-1.5"
                        >
                          <span>Select This Stay</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : compareItems[0]?.type === 'train' ? (
                /* Trains Comparison Matrix */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(compareItems as { type: 'train'; item: Train }[]).map(({ item }) => (
                    <div
                      key={item.id}
                      className="border border-line rounded-xl p-4 bg-white shadow-subtle flex flex-col justify-between"
                    >
                      <div>
                        {/* Train Name & Number */}
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-line">
                          <div>
                            <div className="text-base font-bold text-ink leading-snug">{item.trainName}</div>
                            <div className="text-xs text-slate">#{item.trainNumber} • {item.distanceKm} km</div>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-sky-deep text-ocean font-bold text-xs">
                            {item.trainType.split(' ')[0]}
                          </span>
                        </div>

                        {/* Route & Times */}
                        <div className="p-3 rounded-lg bg-sky mb-4">
                          <div className="flex justify-between items-baseline font-mono text-sm font-bold text-ink">
                            <div>
                              <div>{item.departureTime}</div>
                              <div className="text-xs text-slate">{item.originCode}</div>
                            </div>
                            <div className="text-xs text-slate-muted text-center font-sans">
                              <div>{item.durationFormatted}</div>
                              <div className="text-[10px] text-green font-medium">Direct</div>
                            </div>
                            <div className="text-right">
                              <div>{item.arrivalTime}</div>
                              <div className="text-xs text-slate">{item.destinationCode}</div>
                            </div>
                          </div>
                        </div>

                        {/* Matrix Rows */}
                        <div className="space-y-3 text-xs">
                          <div>
                            <span className="text-slate-muted block text-[11px] mb-1">Available Classes & Quota</span>
                            <div className="flex flex-wrap gap-1">
                              {item.classes.map((cls) => (
                                <span key={cls.classCode} className="px-2 py-0.5 rounded bg-sky border border-sky-deep text-ocean font-bold text-[10px]">
                                  {cls.classCode}: ₹{cls.fare.toLocaleString('en-IN')}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <span className="text-slate-muted block text-[11px]">Punctuality Record</span>
                            <span className="font-semibold text-green flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{item.onTimeScore}% NTES Verified On-Time</span>
                            </span>
                          </div>

                          <div>
                            <span className="text-slate-muted block text-[11px]">Catering & Onboard Service</span>
                            <span className="text-slate">
                              {item.cateringIncluded ? 'Complimentary chef-curated meals' : item.pantryAvailable ? 'Pantry car available' : 'Express standard transit'}
                            </span>
                          </div>

                          {/* Radical Transparent Fare Box */}
                          <div className="p-3 rounded-xl bg-sky/70 border border-sky-deep mt-4">
                            <div className="text-[11px] font-bold text-ocean uppercase tracking-wider mb-2">
                              Upfront IRCTC Fare Breakdown
                            </div>
                            <div className="space-y-1 text-slate">
                              <div className="flex justify-between">
                                <span>Base IRCTC Fare:</span>
                                <span>₹{item.base_price.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Superfast & GST:</span>
                                <span>₹{item.tax.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="flex justify-between text-green font-medium">
                                <span>Farways Platform Fee:</span>
                                <span>₹0 (Zero Markup)</span>
                              </div>
                              <div className="flex justify-between pt-1.5 border-t border-line font-bold text-ink text-sm">
                                <span>Net Total Fare:</span>
                                <span className="text-ocean">₹{item.total_price.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="pt-4 mt-4 border-t border-line">
                        <Link
                          href={`/checkout?type=train&id=${item.id}`}
                          onClick={() => setIsModalOpen(false)}
                          className="w-full btn-primary py-2.5 text-xs font-bold text-center flex items-center justify-center gap-1.5"
                        >
                          <span>Select This Train</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Flights Comparison Matrix */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(compareItems as { type: 'flight'; item: Flight }[]).map(({ item }) => (
                    <div
                      key={item.id}
                      className="border border-line rounded-xl p-4 bg-white shadow-subtle flex flex-col justify-between"
                    >
                      <div>
                        {/* Airline & Flight Number */}
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-line">
                          <div>
                            <div className="text-base font-bold text-ink">{item.airlineName}</div>
                            <div className="text-xs text-slate">{item.flightNumber} • {item.aircraft}</div>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-sky-deep text-ocean font-bold text-xs">
                            {item.airlineCode}
                          </span>
                        </div>

                        {/* Route & Times */}
                        <div className="p-3 rounded-lg bg-sky mb-4">
                          <div className="flex justify-between items-baseline font-mono text-sm font-bold text-ink">
                            <div>
                              <div>{item.departureTime}</div>
                              <div className="text-xs text-slate">{item.originCode}</div>
                            </div>
                            <div className="text-xs text-slate-muted text-center font-sans">
                              <div>{item.durationFormatted}</div>
                              <div className="text-[10px] text-green font-medium">Non-stop</div>
                            </div>
                            <div className="text-right">
                              <div>{item.arrivalTime}</div>
                              <div className="text-xs text-slate">{item.destinationCode}</div>
                            </div>
                          </div>
                        </div>

                        {/* Matrix Rows */}
                        <div className="space-y-3 text-xs">
                          <div>
                            <span className="text-slate-muted block text-[11px]">Baggage Allowance</span>
                            <span className="font-semibold text-ink">
                              Cabin: {item.baggageAllowance.cabinKg} kg • Check-in: {item.baggageAllowance.checkInKg} kg
                            </span>
                          </div>

                          <div>
                            <span className="text-slate-muted block text-[11px]">Punctuality Score</span>
                            <span className="font-semibold text-green flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{item.onTimePerformanceScore}% Historical On-Time</span>
                            </span>
                          </div>

                          <div>
                            <span className="text-slate-muted block text-[11px]">Carbon Emissions</span>
                            <span className="text-slate">{item.carbonFootprintKg} kg CO₂ / seat</span>
                          </div>

                          {/* Radical Price Breakdown Matrix Box */}
                          <div className="p-3 rounded-xl bg-sky/70 border border-sky-deep mt-4">
                            <div className="text-[11px] font-bold text-ocean uppercase tracking-wider mb-2">
                              Upfront Fare Breakdown
                            </div>
                            <div className="space-y-1 text-slate">
                              <div className="flex justify-between">
                                <span>Base Fare:</span>
                                <span>₹{item.base_price.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Aviation Taxes & Fees:</span>
                                <span>₹{item.tax.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="flex justify-between text-green font-medium">
                                <span>Platform Surcharge:</span>
                                <span>₹{item.platform_fee} (Zero Markup)</span>
                              </div>
                              <div className="flex justify-between pt-1.5 border-t border-line font-bold text-ink text-sm">
                                <span>Net Total Fare:</span>
                                <span className="text-ocean">₹{item.total_price.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="pt-4 mt-4 border-t border-line">
                        <Link
                          href={`/checkout?type=flight&id=${item.id}`}
                          onClick={() => setIsModalOpen(false)}
                          className="w-full btn-primary py-2.5 text-xs font-bold text-center flex items-center justify-center gap-1.5"
                        >
                          <span>Select This Flight</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-sky/30 border-t border-line flex items-center justify-between text-xs text-slate">
              <span className="flex items-center gap-1.5 text-ink font-medium">
                <ShieldCheck className="w-4 h-4 text-green" />
                <span>Farways Guarantee: Zero drip charges added on subsequent screens.</span>
              </span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn-secondary py-1.5 px-3 text-xs"
              >
                Close Matrix
              </button>
            </div>
          </div>
        </div>
      )}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}
