'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { ToastItem, ToastType } from '@/types/farways';

interface ToastContextType {
  toast: {
    success: (message: string, title?: string, durationMs?: number) => void;
    error: (message: string, title?: string, durationMs?: number) => void;
    info: (message: string, title?: string, durationMs?: number) => void;
    warning: (message: string, title?: string, durationMs?: number) => void;
  };
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastCountRef = useRef(0);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, title?: string, durationMs = 4000) => {
      const id = `toast-${Date.now()}-${++toastCountRef.current}`;
      const newItem: ToastItem = { id, type, message, title, durationMs };

      setToasts((prev) => [...prev, newItem]);

      if (durationMs > 0) {
        setTimeout(() => {
          removeToast(id);
        }, durationMs);
      }
    },
    [removeToast]
  );

  const toastMethods = {
    success: (message: string, title?: string, durationMs?: number) =>
      addToast('success', message, title ?? 'Success', durationMs),
    error: (message: string, title?: string, durationMs?: number) =>
      addToast('error', message, title ?? 'Notice', durationMs),
    info: (message: string, title?: string, durationMs?: number) =>
      addToast('info', message, title ?? 'Information', durationMs),
    warning: (message: string, title?: string, durationMs?: number) =>
      addToast('warning', message, title ?? 'Heads up', durationMs),
  };

  return (
    <ToastContext.Provider value={{ toast: toastMethods, removeToast }}>
      {children}

      {/* Floating System Status Toast Region (Nielsen Heuristic: Visibility of System Status) */}
      <div
        aria-live="polite"
        role="region"
        aria-label="System Notifications"
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            role="status"
            className="pointer-events-auto bg-white border border-line rounded-xl p-4 shadow-modal transition-all transform duration-200 ease-out flex items-start gap-3 animate-calm"
          >
            {/* Visual Icon with high-contrast token alignment */}
            <div className="shrink-0 mt-0.5">
              {item.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green" />}
              {item.type === 'error' && <AlertCircle className="w-5 h-5 text-ink" />}
              {item.type === 'info' && <Info className="w-5 h-5 text-ocean" />}
              {item.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
            </div>

            {/* Message Body */}
            <div className="flex-1 min-w-0 pr-1">
              {item.title && (
                <h4 className="text-sm font-bold text-ink leading-snug tracking-tight">
                  {item.title}
                </h4>
              )}
              <p className="text-xs text-slate mt-0.5 leading-relaxed break-words">
                {item.message}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => removeToast(item.id)}
              className="shrink-0 p-1 text-slate hover:text-ink rounded-md hover:bg-sky transition-colors cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
}
