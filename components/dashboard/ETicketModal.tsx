'use client';

import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  ShieldCheck, 
  QrCode, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  Building2, 
  Plane, 
  Car,
  Compass
} from 'lucide-react';
import { Booking } from '@/types/farways';

interface ETicketModalProps {
  booking: Booking | null;
  onClose: () => void;
}

export function ETicketModal({ booking, onClose }: ETicketModalProps) {
  if (!booking) return null;

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const formattedDate = new Date(booking.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ticket-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-ink/70 backdrop-blur-sm animate-calm"
    >
      <div className="bg-white border border-line rounded-2xl shadow-modal w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-line flex items-center justify-between bg-sky/30 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-ocean text-white flex items-center justify-center shadow-sm">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 id="ticket-modal-title" className="text-base font-bold text-ink">
                Verified Electronic Travel Voucher
              </h3>
              <p className="text-xs text-slate">
                Official Farways Travel Document · Confirmation Code: {booking.confirmation_code}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn-primary py-1.5 px-3 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate hover:text-ink hover:bg-sky transition-colors cursor-pointer"
              aria-label="Close voucher"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Ticket Body */}
        <div id="printable-voucher" className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          
          {/* Top Farways Document Brand Header */}
          <div className="flex items-start justify-between pb-6 border-b-2 border-dashed border-line">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-ink tracking-tight">Farways</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-deep text-ocean border border-sky-deep uppercase">
                  Confirmed Voucher
                </span>
              </div>
              <p className="text-xs text-slate mt-0.5">
                Ethical Travel Booking Platform · Zero Hidden Fees Guaranteed
              </p>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-slate-muted uppercase font-bold tracking-wider">
                Booking Reference
              </div>
              <div className="text-xl font-mono font-extrabold text-ocean">
                {booking.confirmation_code}
              </div>
              <div className="text-[11px] text-slate mt-0.5">
                Issued: {formattedDate}
              </div>
            </div>
          </div>

          {/* QR Code and Quick Inspection Pass */}
          <div className="p-4 rounded-xl bg-sky/50 border border-line flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-bold text-ocean uppercase tracking-wider block">
                Digital Boarding Pass / Check-in Pass
              </span>
              <div className="text-base font-bold text-ink">
                {booking.title}
              </div>
              <div className="text-xs text-slate">
                {booking.subtitle}
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs text-green font-semibold pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Direct with Carrier/Property</span>
              </div>
            </div>

            {/* QR Code Visual Component */}
            <div className="w-24 h-24 rounded-xl bg-white border border-line p-2 shrink-0 flex flex-col items-center justify-center shadow-subtle">
              <QrCode className="w-16 h-16 text-ink" />
              <span className="text-[8px] font-mono text-slate-muted tracking-widest mt-0.5">
                {booking.confirmation_code}
              </span>
            </div>
          </div>

          {/* Traveler Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs p-4 rounded-xl border border-line bg-white">
            <div>
              <span className="text-slate-muted block text-[10px] uppercase font-bold">Primary Traveler</span>
              <span className="font-bold text-ink text-sm">{booking.traveler_name}</span>
            </div>
            <div>
              <span className="text-slate-muted block text-[10px] uppercase font-bold">Registered Email</span>
              <span className="font-semibold text-slate truncate block">{booking.traveler_email}</span>
            </div>
            <div>
              <span className="text-slate-muted block text-[10px] uppercase font-bold">Emergency Mobile</span>
              <span className="font-semibold text-slate">+91 {booking.traveler_phone}</span>
            </div>
          </div>

          {/* Selected Add-ons (if any) */}
          {booking.addons_json && Array.isArray(booking.addons_json) && booking.addons_json.length > 0 && (
            <div className="p-4 rounded-xl bg-sky/30 border border-line space-y-2 text-xs">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                Confirmed Optional Enhancements
              </span>
              <div className="space-y-1 text-slate">
                {booking.addons_json.map((addon: any) => (
                  <div key={addon.id} className="flex justify-between">
                    <span>✓ {addon.name}</span>
                    <span className="font-medium text-ink">₹{Number(addon.price).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transparent Itemized Financial Receipt */}
          <div className="p-4 rounded-xl bg-sky/70 border border-sky-deep space-y-2 text-xs text-slate">
            <span className="text-[10px] font-bold text-ocean uppercase tracking-wider block mb-1">
              Final Itemized Payment Receipt
            </span>
            <div className="flex justify-between">
              <span>Base Fare / Room Rate:</span>
              <span className="font-medium text-ink">₹{Number(bBaseAmount(booking)).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Mandatory GST / Airport Levies:</span>
              <span className="font-medium text-ink">₹{Number(bTaxAmount(booking)).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-green font-medium">
              <span>Platform Markup / Surcharge:</span>
              <span>₹0.00 (Zero Markup Guaranteed)</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-line font-bold text-ink text-sm">
              <span>Total Paid Amount:</span>
              <span className="text-lg font-black text-ocean">
                ₹{Number(booking.total_amount).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Plain-English Cancellation Terms */}
          <div className="p-3.5 rounded-xl bg-white border border-line text-[11px] text-slate space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-ink">
              <ShieldCheck className="w-4 h-4 text-green" />
              <span>Farways Zero-Penalty Refund Guarantee</span>
            </div>
            <p>
              If your plans change, cancellations completed through your dashboard are processed with a 100% full refund
              initiated immediately to your source payment method with zero platform cancellation retention fees.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-line bg-sky/20 flex items-center justify-between text-xs text-slate print:hidden">
          <span>Present this digital QR pass upon arrival or boarding.</span>
          <button
            onClick={onClose}
            className="btn-secondary py-1.5 px-3 text-xs"
          >
            Close Voucher
          </button>
        </div>
      </div>
    </div>
  );
}

function bBaseAmount(b: Booking): number {
  return b.base_amount || (b.total_amount * 0.85);
}

function bTaxAmount(b: Booking): number {
  return b.tax_amount || (b.total_amount * 0.15);
}
