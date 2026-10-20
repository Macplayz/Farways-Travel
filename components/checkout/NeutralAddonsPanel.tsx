'use client';

import React from 'react';
import { 
  ShieldCheck, 
  Check, 
  HelpCircle, 
  FileText, 
  Sparkles, 
  Info,
  CheckCircle2
} from 'lucide-react';
import { Addon, ItemType } from '@/types/farways';

interface NeutralAddonsPanelProps {
  itemType: ItemType;
  selectedAddons: Addon[];
  onToggleAddon: (addon: Addon) => void;
}

// Optional Travel Addons (Strictly Opt-In)
const CORE_ADDONS: Addon[] = [
  {
    id: 'addon-insurance-trip',
    name: 'Travel & Medical Safety Shield',
    description: 'Comprehensive medical emergency cover up to ₹50,000, trip disruption, and lost baggage compensation.',
    category: 'insurance',
    price: 150,
    defaultSelected: false,
    transparentTerms: 'Underwritten by ICICI Lombard. Zero hidden deductibles; immediate claim assistance via Farways hotline.',
  },
  {
    id: 'addon-zero-cancellation',
    name: 'Zero-Cancellation Protection',
    description: 'Cancel your booking anytime up to 2 hours before check-in/departure for a 100% full refund.',
    category: 'cancellation_waiver',
    price: 299,
    defaultSelected: false,
    transparentTerms: 'Refund credited directly to source account within 3 bank days without airline/hotel retention penalties.',
  },
  {
    id: 'addon-priority-assist',
    name: 'Airport Priority Assistance & Concierge',
    description: 'Skip terminal queues with dedicated check-in counter support and priority baggage handling.',
    category: 'amenity',
    price: 199,
    defaultSelected: false,
    transparentTerms: 'Available across Mumbai (BOM), Delhi (DEL), and Goa (GOI/GOX) terminals.',
  },
];

export function NeutralAddonsPanel({
  itemType,
  selectedAddons,
  onToggleAddon,
}: NeutralAddonsPanelProps) {
  const isSelected = (id: string) => selectedAddons.some((a) => a.id === id);

  return (
    <div className="bg-white border border-line rounded-2xl p-5 sm:p-6 shadow-subtle space-y-4">
      {/* Header with Neutral Opt-in HCI Principle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-line">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky text-ocean border border-sky-deep mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-green" />
            <span>Zero-Pressure Add-Ons · Strictly Opt-In</span>
          </div>
          <h3 className="text-base font-bold text-ink">
            Optional Trip Enhancements
          </h3>
          <p className="text-xs text-slate">
            Select only what you need. Zero items are pre-selected in your basket.
          </p>
        </div>

        <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-green-50 text-green border border-green-200 self-start sm:self-auto">
          100% Unchecked by Default
        </span>
      </div>

      {/* Addons List */}
      <div className="space-y-3">
        {CORE_ADDONS.map((addon) => {
          const checked = isSelected(addon.id);

          return (
            <label
              key={addon.id}
              className={`flex items-start gap-3.5 p-4 rounded-xl border transition-all cursor-pointer select-none ${
                checked
                  ? 'bg-sky/60 border-ocean shadow-sm'
                  : 'bg-white border-line hover:border-sky-deep hover:bg-sky/20'
              }`}
            >
              {/* Checkbox */}
              <div className="pt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleAddon(addon)}
                  className="w-4 h-4 rounded border-line text-ocean focus:ring-ocean cursor-pointer"
                />
              </div>

              {/* Addon Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-ink">
                    {addon.name}
                  </span>
                  <span className="text-sm font-extrabold text-ocean shrink-0">
                    +₹{addon.price.toLocaleString('en-IN')}
                  </span>
                </div>

                <p className="text-xs text-slate mt-1 leading-relaxed">
                  {addon.description}
                </p>

                {/* Plain-English Transparent Terms */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-muted mt-2 pt-2 border-t border-line/60">
                  <Info className="w-3.5 h-3.5 text-ocean shrink-0" />
                  <span className="italic truncate">{addon.transparentTerms}</span>
                </div>

                {/* Explicit Microcopy (User Requirement 3) */}
                <div className="mt-2 text-xs font-medium text-gray-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  <span>Optional · Unchecked by default for your control</span>
                </div>
              </div>
            </label>
          );
        })}
      </div>

      {/* Neutral Choice Affirmation */}
      <div className="p-3 rounded-xl bg-sky/40 border border-line flex items-center justify-between text-xs text-slate">
        <span className="flex items-center gap-1.5 text-ink font-medium">
          <CheckCircle2 className="w-4 h-4 text-green" />
          <span>You can decline all add-ons with zero confirmshaming.</span>
        </span>
        <span className="font-bold text-ocean">
          {selectedAddons.length} Selected (+₹
          {selectedAddons.reduce((sum, a) => sum + a.price, 0).toLocaleString('en-IN')})
        </span>
      </div>
    </div>
  );
}
