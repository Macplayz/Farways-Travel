'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { X, ShieldCheck, Mail, Phone, Lock, User, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useToast } from '@/components/ToastProvider';

interface FormErrors {
  fullName?: string;
  identifier?: string;
  password?: string;
  form?: string;
}

interface FormTouched {
  fullName?: boolean;
  identifier?: boolean;
  password?: boolean;
}

export function AuthModal() {
  const { isAuthModalOpen, authModalMode, closeAuthModal, openAuthModal, signIn, signUp, demoLogin } = useAuth();
  const toast = useToast();

  const [mode, setMode] = useState<'signin' | 'signup'>(authModalMode);
  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  
  // Neutral Opt-in HCI principle: strictly false by default
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field DOM refs for auto-focus on invalid field
  const fullNameRef = useRef<HTMLInputElement>(null);
  const identifierRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Sync mode with context
  useEffect(() => {
    setMode(authModalMode);
    setErrors({});
    setTouched({});
  }, [authModalMode, isAuthModalOpen]);

  // Trap Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  // Auto-focus first input on open
  useEffect(() => {
    if (isAuthModalOpen) {
      setTimeout(() => {
        if (mode === 'signup' && fullNameRef.current) {
          fullNameRef.current.focus();
        } else if (identifierRef.current) {
          identifierRef.current.focus();
        }
      }, 50);
    }
  }, [isAuthModalOpen, mode]);

  // Strict Validation Logic
  const validateField = useCallback(
    (field: 'fullName' | 'identifier' | 'password', val: string): string | undefined => {
      const clean = val.trim();

      if (field === 'fullName' && mode === 'signup') {
        if (!clean) return 'Please enter your full name.';
        if (clean.length < 2) return 'Full name must be at least 2 characters.';
      }

      if (field === 'identifier') {
        if (!clean) return 'Please enter your email or 10-digit Indian mobile number.';
        
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean);
        const isIndianPhone = /^[6-9]\d{9}$/.test(clean);

        if (!isEmail && !isIndianPhone) {
          return 'Enter a valid email address or 10-digit mobile number (e.g. 9820123456).';
        }
      }

      if (field === 'password') {
        if (!val) return 'Please enter your password.';
        if (val.length < 8) return 'Password must be at least 8 characters long.';
      }

      return undefined;
    },
    [mode]
  );

  const handleBlur = (field: 'fullName' | 'identifier' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    let val = '';
    if (field === 'fullName') val = fullName;
    if (field === 'identifier') val = identifier;
    if (field === 'password') val = password;

    const error = validateField(field, val);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChange = (field: 'fullName' | 'identifier' | 'password', val: string) => {
    // Automatically .trim() leading/trailing whitespace where applicable
    if (field === 'fullName') {
      setFullName(val);
      if (touched.fullName) {
        setErrors((prev) => ({ ...prev, fullName: validateField('fullName', val) }));
      }
    } else if (field === 'identifier') {
      // Remove spaces inside identifier
      const clean = val.replace(/\s+/g, '');
      setIdentifier(clean);
      if (touched.identifier) {
        setErrors((prev) => ({ ...prev, identifier: validateField('identifier', clean) }));
      }
    } else if (field === 'password') {
      setPassword(val);
      if (touched.password) {
        setErrors((prev) => ({ ...prev, password: validateField('password', val) }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const fullNameError = mode === 'signup' ? validateField('fullName', fullName) : undefined;
    const identifierError = validateField('identifier', identifier);
    const passwordError = validateField('password', password);

    const newErrors: FormErrors = {
      fullName: fullNameError,
      identifier: identifierError,
      password: passwordError,
    };

    setErrors(newErrors);
    setTouched({ fullName: true, identifier: true, password: true });

    // Auto-focus the first invalid field on submit
    if (fullNameError && fullNameRef.current) {
      fullNameRef.current.focus();
      return;
    }
    if (identifierError && identifierRef.current) {
      identifierRef.current.focus();
      return;
    }
    if (passwordError && passwordRef.current) {
      passwordRef.current.focus();
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        const res = await signIn(identifier.trim(), password);
        if (!res.success) {
          setErrors({ form: res.error || 'Invalid credentials. Please verify your details.' });
          toast.error(res.error || 'Sign-in failed. Please check credentials.');
        } else {
          toast.success('Welcome back! You are now securely signed in.', 'Signed In');
        }
      } else {
        const res = await signUp(fullName.trim(), identifier.trim(), password, marketingOptIn);
        if (!res.success) {
          setErrors({ form: res.error || 'Sign up encountered an issue.' });
          toast.error(res.error || 'Could not complete registration.');
        } else {
          toast.success('Your Farways profile is ready!', 'Account Created');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthModalOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-calm overflow-y-auto hide-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      <div
        ref={modalRef}
        className="bg-white border border-line rounded-2xl shadow-modal w-full max-w-md overflow-hidden relative max-h-[92vh] flex flex-col hide-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-line flex items-start justify-between bg-sky/30">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky text-ocean border border-sky-deep mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-green" />
              <span>Ethical Account Security</span>
            </div>
            <h2 id="auth-modal-title" className="text-xl font-bold text-ink">
              {mode === 'signin' ? 'Sign in to Farways' : 'Create your Farways account'}
            </h2>
            <p className="text-xs text-slate mt-0.5">
              {mode === 'signin'
                ? 'Access your trips, verified invoices, and transparent itinerary.'
                : 'Zero marketing spam by default. Full control over your data.'}
            </p>
          </div>

          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-lg text-slate hover:text-ink hover:bg-sky transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex border-b border-line bg-sky/20">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              openAuthModal('signin');
            }}
            className={`flex-1 py-3 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
              mode === 'signin'
                ? 'border-ocean text-ocean bg-white'
                : 'border-transparent text-slate hover:text-ink'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              openAuthModal('signup');
            }}
            className={`flex-1 py-3 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
              mode === 'signup'
                ? 'border-ocean text-ocean bg-white'
                : 'border-transparent text-slate hover:text-ink'
            }`}
          >
            New Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4 overflow-y-auto hide-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {errors.form && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 leading-snug"
            >
              {errors.form}
            </div>
          )}

          {/* Full Name (Sign Up only) */}
          {mode === 'signup' && (
            <div>
              <label
                htmlFor="auth-fullname"
                className="block text-xs font-bold text-ink mb-1 flex items-center justify-between"
              >
                <span>Full Name</span>
                <span className="text-[11px] font-normal text-slate">As on government ID</span>
              </label>
              <div className="relative">
                <input
                  ref={fullNameRef}
                  id="auth-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  onBlur={() => handleBlur('fullName')}
                  aria-invalid={!!errors.fullName}
                  aria-describedby={errors.fullName ? 'auth-fullname-error' : undefined}
                  placeholder="e.g. Arjun Sharma"
                  className={`w-full px-3.5 py-2.5 pl-10 rounded-lg text-sm bg-white border ${
                    errors.fullName ? 'border-red-400 focus:border-red-500' : 'border-line focus:border-ocean'
                  } text-ink placeholder:text-slate-muted focus:outline-none transition-colors`}
                />
                <User className="w-4 h-4 text-slate absolute left-3.5 top-3" />
              </div>
              {errors.fullName && (
                <p id="auth-fullname-error" role="alert" className="text-xs text-red-600 mt-1">
                  {errors.fullName}
                </p>
              )}
            </div>
          )}

          {/* Email or Phone */}
          <div>
            <label
              htmlFor="auth-identifier"
              className="block text-xs font-bold text-ink mb-1 flex items-center justify-between"
            >
              <span>Email Address or Indian Mobile</span>
              <span className="text-[11px] font-normal text-slate">10-digit number or email</span>
            </label>
            <div className="relative">
              <input
                ref={identifierRef}
                id="auth-identifier"
                type="text"
                value={identifier}
                onChange={(e) => handleChange('identifier', e.target.value)}
                onBlur={() => handleBlur('identifier')}
                aria-invalid={!!errors.identifier}
                aria-describedby={errors.identifier ? 'auth-identifier-error' : undefined}
                placeholder="name@example.com or 9820123456"
                className={`w-full px-3.5 py-2.5 pl-10 rounded-lg text-sm bg-white border ${
                  errors.identifier ? 'border-red-400 focus:border-red-500' : 'border-line focus:border-ocean'
                } text-ink placeholder:text-slate-muted focus:outline-none transition-colors`}
              />
              <Mail className="w-4 h-4 text-slate absolute left-3.5 top-3" />
            </div>
            {errors.identifier && (
              <p id="auth-identifier-error" role="alert" className="text-xs text-red-600 mt-1">
                {errors.identifier}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="auth-password"
              className="block text-xs font-bold text-ink mb-1 flex items-center justify-between"
            >
              <span>Password</span>
              <span className="text-[11px] font-normal text-slate">Minimum 8 characters</span>
            </label>
            <div className="relative">
              <input
                ref={passwordRef}
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'auth-password-error' : undefined}
                placeholder="••••••••"
                className={`w-full px-3.5 py-2.5 pl-10 rounded-lg text-sm bg-white border ${
                  errors.password ? 'border-red-400 focus:border-red-500' : 'border-line focus:border-ocean'
                } text-ink placeholder:text-slate-muted focus:outline-none transition-colors`}
              />
              <Lock className="w-4 h-4 text-slate absolute left-3.5 top-3" />
            </div>
            {errors.password && (
              <p id="auth-password-error" role="alert" className="text-xs text-red-600 mt-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* Neutral Opt-In Checkbox (Strictly UNCHECKED by default) */}
          {mode === 'signup' && (
            <div className="pt-1">
              <label className="flex items-start gap-2.5 text-xs text-slate cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={marketingOptIn}
                  onChange={(e) => setMarketingOptIn(e.target.checked)}
                  className="mt-0.5 rounded border-line text-ocean focus:ring-ocean cursor-pointer"
                />
                <span className="leading-snug">
                  Opt-in for promotional fare alerts & low-price updates. 
                  <span className="text-slate-muted block text-[11px]">
                    (Neutral Opt-In: strictly unchecked by default. You can change this anytime.)
                  </span>
                </span>
              </label>
            </div>
          )}

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary py-3 text-sm font-bold flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
          >
            <span>{isSubmitting ? 'Verifying...' : mode === 'signin' ? 'Sign In Securely' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Sign-In Options */}
        <div className="p-4 bg-sky/40 border-t border-line space-y-2">
          <div className="relative flex items-center justify-center my-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-line" />
            </div>
            <span className="relative bg-sky/80 px-2.5 text-[10px] font-bold text-slate uppercase tracking-wider">
              Quick Sign-In
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-2">
            {/* Admin */}
            <button
              type="button"
              onClick={() => {
                demoLogin('admin');
                toast.success('Logged in as Farways Operations Admin');
              }}
              className="col-span-2 px-3 py-2 rounded-lg bg-gradient-to-r from-slate-900 to-ink text-white border border-slate-700 text-xs font-medium hover:border-ocean text-left transition-colors cursor-pointer flex items-center justify-between"
            >
              <div>
                <div className="font-extrabold text-white text-xs">Farways Operations Admin</div>
                <div className="text-[10px] text-slate-300">admin@farways.com • Full Live Inventory Access</div>
              </div>
              <span className="text-[9px] font-bold bg-ocean-light px-2 py-0.5 rounded text-ink">Admin</span>
            </button>

            {/* Vikram */}
            <button
              type="button"
              onClick={() => {
                demoLogin('evaluator');
                toast.success('Logged in as Vikram Malhotra');
              }}
              className="col-span-2 px-3 py-2 rounded-lg bg-white border border-line text-xs font-medium text-ink hover:border-ocean hover:bg-sky text-left transition-colors cursor-pointer flex items-center justify-between"
            >
              <div>
                <div className="font-extrabold text-ocean">Vikram Malhotra</div>
                <div className="text-[10px] text-slate">vikram.malhotra@farways.in · 1,500 Reward Pts</div>
              </div>
              <span className="text-[10px] font-bold bg-sky-deep px-2 py-0.5 rounded text-ocean border border-sky-deep">Frequent Flyer</span>
            </button>

            {/* Arjun */}
            <button
              type="button"
              onClick={() => {
                demoLogin('arjun');
                toast.success('Logged in as Arjun Sharma');
              }}
              className="px-3 py-2 rounded-lg bg-white border border-line text-xs font-medium text-ink hover:border-ocean hover:bg-sky text-left transition-colors cursor-pointer"
            >
              <div className="font-bold">Arjun Sharma</div>
              <div className="text-[10px] text-slate">arjun.sharma@example.com</div>
            </button>

            {/* Priya */}
            <button
              type="button"
              onClick={() => {
                demoLogin('priya');
                toast.success('Logged in as Priya Patel');
              }}
              className="px-3 py-2 rounded-lg bg-white border border-line text-xs font-medium text-ink hover:border-ocean hover:bg-sky text-left transition-colors cursor-pointer"
            >
              <div className="font-bold">Priya Patel</div>
              <div className="text-[10px] text-slate">priya.patel@example.com</div>
            </button>
          </div>

          <div className="pt-2 border-t border-line text-center">
            <Link
              href={mode === 'signup' ? '/login?tab=signup' : '/login'}
              onClick={() => closeAuthModal()}
              className="text-xs font-bold text-ocean hover:underline inline-flex items-center gap-1"
            >
              <span>Prefer full dedicated page? Open /login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
