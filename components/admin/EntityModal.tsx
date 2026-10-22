'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Sparkles, AlertCircle } from 'lucide-react';

export type FieldType =
  | 'text'
  | 'number'
  | 'textarea'
  | 'select'
  | 'boolean'
  | 'array';

export interface FieldOption {
  label: string;
  value: string | number;
}

export interface FieldSchema {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: FieldOption[];
  required?: boolean;
  helperText?: string;
  defaultValue?: any;
  min?: number;
  max?: number;
  step?: number;
  colSpan?: 1 | 2;
}

export interface EntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  schema: FieldSchema[];
  initialData?: Record<string, any> | null;
  onSubmit: (formData: Record<string, any>) => Promise<void> | void;
  isSubmitting?: boolean;
  mode: 'create' | 'edit';
}

export function EntityModal({
  isOpen,
  onClose,
  title,
  subtitle,
  schema,
  initialData,
  onSubmit,
  isSubmitting = false,
  mode,
}: EntityModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data whenever modal opens or initialData/schema changes
  useEffect(() => {
    if (!isOpen) return;

    const initial: Record<string, any> = {};

    schema.forEach((field) => {
      if (initialData && initialData[field.name] !== undefined) {
        const val = initialData[field.name];
        if (field.type === 'array') {
          // Convert array to comma-separated string for editing
          if (Array.isArray(val)) {
            initial[field.name] = val.join(', ');
          } else if (typeof val === 'string') {
            initial[field.name] = val;
          } else {
            initial[field.name] = '';
          }
        } else if (field.type === 'boolean') {
          initial[field.name] = Boolean(val);
        } else {
          initial[field.name] = val;
        }
      } else {
        // Defaults for create mode
        if (field.defaultValue !== undefined) {
          initial[field.name] = field.defaultValue;
        } else if (field.type === 'boolean') {
          initial[field.name] = false;
        } else if (field.type === 'number') {
          initial[field.name] = 0;
        } else {
          initial[field.name] = '';
        }
      }
    });

    // Auto-generate an ID if create mode and 'id' is in initialData or missing
    if (mode === 'create' && !initial.id) {
      const prefix = schema[0]?.name.split('_')[0] || 'item';
      initial.id = `${prefix}-${Date.now().toString(36)}`;
    }

    setFormData(initial);
    setErrors({});
  }, [isOpen, initialData, schema, mode]);

  // Handle auto-calculation of total_price if base_price and tax change
  const handleChange = (name: string, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // If base_price or tax changes, automatically sync total_price
      if (name === 'base_price' || name === 'tax' || name === 'platform_fee') {
        const base = Number(name === 'base_price' ? value : prev.base_price) || 0;
        const tax = Number(name === 'tax' ? value : prev.tax) || 0;
        const fee = Number(name === 'platform_fee' ? value : prev.platform_fee) || 0;
        if ('total_price' in prev || schema.some((f) => f.name === 'total_price')) {
          updated.total_price = base + tax + fee;
        }
      }

      return updated;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validate required fields
    const newErrors: Record<string, string> = {};
    schema.forEach((field) => {
      if (field.required) {
        const val = formData[field.name];
        if (val === undefined || val === null || (typeof val === 'string' && !val.trim())) {
          newErrors[field.name] = `${field.label} is required`;
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Format payload types before submitting
    const payload: Record<string, any> = { ...formData };

    schema.forEach((field) => {
      if (field.type === 'number') {
        payload[field.name] = Number(payload[field.name]) || 0;
      } else if (field.type === 'boolean') {
        payload[field.name] = Boolean(payload[field.name]);
      } else if (field.type === 'array') {
        const raw = payload[field.name];
        if (Array.isArray(raw)) {
          payload[field.name] = raw;
        } else if (typeof raw === 'string') {
          payload[field.name] = raw
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        } else {
          payload[field.name] = [];
        }
      }
    });

    // Ensure total_price is computed accurately for transparency
    if (payload.base_price !== undefined && payload.tax !== undefined) {
      const base = Number(payload.base_price) || 0;
      const tax = Number(payload.tax) || 0;
      const fee = Number(payload.platform_fee) || 0;
      payload.total_price = base + tax + fee;
    }

    await onSubmit(payload);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="entity-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                {mode === 'create' ? 'Create New' : 'Update Record'}
              </span>
              <h2 id="entity-modal-title" className="text-base sm:text-lg font-bold text-white tracking-tight">
                {title}
              </h2>
            </div>
            {subtitle && (
              <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
            )}
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[calc(85vh-140px)] overflow-y-auto space-y-4">
            {/* Form grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {schema.map((field) => {
                const isFullWidth = field.colSpan === 2 || field.type === 'textarea' || field.type === 'array';
                const hasError = !!errors[field.name];

                return (
                  <div
                    key={field.name}
                    className={isFullWidth ? 'sm:col-span-2' : 'sm:col-span-1'}
                  >
                    <label
                      htmlFor={`field-${field.name}`}
                      className="block text-xs font-bold text-slate-300 mb-1.5"
                    >
                      <span>{field.label}</span>
                      {field.required && (
                        <span className="text-rose-400 ml-1">*</span>
                      )}
                    </label>

                    {/* Field input switch based on field.type */}
                    {field.type === 'text' && (
                      <input
                        id={`field-${field.name}`}
                        type="text"
                        value={formData[field.name] ?? ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border ${
                          hasError ? 'border-rose-500' : 'border-slate-800'
                        } text-slate-100 placeholder:text-slate-600 text-xs focus:outline-none focus:border-cyan-500 transition-colors`}
                      />
                    )}

                    {field.type === 'number' && (
                      <input
                        id={`field-${field.name}`}
                        type="number"
                        min={field.min}
                        max={field.max}
                        step={field.step ?? 'any'}
                        value={formData[field.name] ?? 0}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border ${
                          hasError ? 'border-rose-500' : 'border-slate-800'
                        } text-slate-100 text-xs focus:outline-none focus:border-cyan-500 transition-colors`}
                      />
                    )}

                    {field.type === 'textarea' && (
                      <textarea
                        id={`field-${field.name}`}
                        rows={3}
                        value={formData[field.name] ?? ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border ${
                          hasError ? 'border-rose-500' : 'border-slate-800'
                        } text-slate-100 placeholder:text-slate-600 text-xs focus:outline-none focus:border-cyan-500 transition-colors`}
                      />
                    )}

                    {field.type === 'select' && (
                      <select
                        id={`field-${field.name}`}
                        value={formData[field.name] ?? ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border ${
                          hasError ? 'border-rose-500' : 'border-slate-800'
                        } text-slate-100 text-xs focus:outline-none focus:border-cyan-500 cursor-pointer`}
                      >
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}

                    {field.type === 'boolean' && (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-xs text-slate-300 font-medium">
                          {field.placeholder || `Enable ${field.label}`}
                        </span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={Boolean(formData[field.name])}
                          onClick={() => handleChange(field.name, !formData[field.name])}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            formData[field.name] ? 'bg-cyan-500' : 'bg-slate-800'
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              formData[field.name] ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    )}

                    {field.type === 'array' && (
                      <div className="space-y-1">
                        <textarea
                          id={`field-${field.name}`}
                          rows={2}
                          value={formData[field.name] ?? ''}
                          onChange={(e) => handleChange(field.name, e.target.value)}
                          placeholder={field.placeholder || 'Comma-separated values, e.g. WiFi, Pool, Spa'}
                          className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border ${
                            hasError ? 'border-rose-500' : 'border-slate-800'
                          } text-slate-100 placeholder:text-slate-600 text-xs focus:outline-none focus:border-cyan-500 transition-colors`}
                        />
                        <span className="text-[11px] text-slate-500 block">
                          Enter items separated by commas (parsed automatically into array).
                        </span>
                      </div>
                    )}

                    {field.helperText && (
                      <p className="text-[11px] text-slate-500 mt-1">
                        {field.helperText}
                      </p>
                    )}

                    {hasError && (
                      <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors[field.name]}</span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Radical Price Transparency Fare Preview Box */}
            {formData.base_price !== undefined && formData.tax !== undefined && (
              <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-800/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-cyan-300">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold">Farways Upfront Total Guarantee:</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-white">
                    ₹{(
                      Number(formData.base_price || 0) +
                      Number(formData.tax || 0) +
                      Number(formData.platform_fee || 0)
                    ).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    (Base: ₹{formData.base_price || 0} + Tax: ₹{formData.tax || 0})
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 disabled:opacity-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-ocean to-cyan-600 hover:from-ocean-dark hover:to-cyan-700 text-white text-xs font-bold shadow-md shadow-ocean/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <span>{mode === 'create' ? 'Create Record' : 'Save Changes'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
