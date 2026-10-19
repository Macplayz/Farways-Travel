'use client';

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  X, 
  RotateCcw, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import { Booking } from '@/types/farways';

interface CancelModalProps {
  booking: Booking | null;
  onClose: () => void;
  onConfirmCancel: (booking: Booking) => Promise<void>;
}

export function CancelModal({ booking, onClose, onConfirmCancel }: CancelModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!booking) return null;

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirmCancel(booking);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-calm"
    >
      <div className="bg-white border border-line rounded-2xl shadow-modal w-full max-w-md overflow-hidden p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate hover:text-ink hover:bg-sky transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4 border border-red-200">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green border border-green-200 mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Zero-Penalty Refund Policy</span>
        </div>

        <h3 id="cancel-modal-title" className="text-xl font-bold text-ink">
          Cancel Reservation {booking.confirmation_code}?
        </h3>

        <p className="text-xs text-slate mt-1.5 leading-relaxed">
          Unlike legacy OTAs that deduct 30–50% hidden cancellation fees, Farways guarantees an instant 
          100% refund of your full paid fare with zero platform retention.
        </p>

        {/* Cancellation Details Summary Box */}
        <div className="mt-4 p-3.5 rounded-xl bg-sky border border-line text-xs space-y-1.5">
          <div className="font-bold text-ink truncate">{booking.title}</div>
          <div className="text-slate truncate">{booking.subtitle}</div>
          <div className="pt-2 border-t border-line flex justify-between items-baseline font-bold">
            <span className="text-slate-muted">Full Refund Amount:</span>
            <span className="text-sm text-green font-extrabold">
              ₹{Number(booking.total_amount).toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[10px] text-slate-muted pt-1">
            * 100% credited back to your original source account within 3 bank days.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleConfirm}
            className="w-full py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer shadow-sm"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Zero-Penalty Refund...</span>
              </>
            ) : (
              <span>Confirm Cancellation & Full Refund</span>
            )}
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={onClose}
            className="btn-secondary py-2 text-xs font-medium"
          >
            Keep Reservation
          </button>
        </div>
      </div>
    </div>
  );
}
