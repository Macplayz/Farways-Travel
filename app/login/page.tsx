'use client';

import React, { useState, useRef, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  RotateCcw,
  Scale,
  Award,
  ChevronRight,
  Shield
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useToast } from '@/components/ToastProvider';

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  city?: string;
  password?: string;
  signInPassword?: string;
  signUpPassword?: string;
  identifier?: string;
  form?: string;
}

interface FormTouched {
  fullName?: boolean;
  email?: boolean;
  phone?: boolean;
  city?: boolean;
  password?: boolean;
  signInPassword?: boolean;
  signUpPassword?: boolean;
  identifier?: boolean;
}

const INDIAN_CITIES = [
  'Mumbai',
  'Delhi NCR',
  'Goa',
  'Bengaluru',
  'Hyderabad',
  'Pune',
  'Chennai',
  'Kolkata',
  'Jaipur',
  'Ahmedabad',
];

function calculatePasswordStrength(pass: string): {
  score: number;
  label: string;
  color: string;
  feedback: string;
} {
  if (!pass) return { score: 0, label: '', color: 'bg-slate/20', feedback: '' };

  let score = 0;
  if (pass.length >= 8) score += 1;
  if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
  if (/\d/.test(pass)) score += 1;
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pass)) score += 1;

  if (score <= 1) {
    return {
      score: 1,
      label: 'Weak',
      color: 'bg-red-500',
      feedback: 'Use at least 8 characters with numbers and symbols',
    };
  }
  if (score === 2) {
    return {
      score: 2,
      label: 'Fair',
      color: 'bg-amber-500',
      feedback: 'Add uppercase letters or special characters to strengthen',
    };
  }
  if (score === 3) {
    return {
      score: 3,
      label: 'Good',
      color: 'bg-ocean',
      feedback: 'Good password. Add symbols for maximum security',
    };
  }
  return {
    score: 4,
    label: 'Strong',
    color: 'bg-green',
    feedback: 'Excellent! Your password meets strict security standards',
  };
}

function getSafeRedirectPath(raw: string | null): string {
  if (!raw) return '/dashboard';
  try {
    const decoded = decodeURIComponent(raw).trim();
    // Disallow external URLs, protocol-relative URLs (//) or script protocols
    if (decoded.startsWith('//') || decoded.includes('://') || decoded.startsWith('javascript:')) {
      return '/dashboard';
    }
    // Normalize relative paths (e.g. "checkout" -> "/checkout", "/checkout" -> "/checkout")
    return decoded.startsWith('/') ? decoded : `/${decoded}`;
  } catch {
    return '/dashboard';
  }
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'signup' ? 'signup' : 'signin';
  const rawRedirect = searchParams.get('redirect');
  const redirectUrl = getSafeRedirectPath(rawRedirect);

  const { user, signIn, signUp, demoLogin } = useAuth();
  const toast = useToast();

  const [mode, setMode] = useState<'signin' | 'signup'>(initialTab);

  // Sign In Form State
  const [identifier, setIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign Up Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState(INDIAN_CITIES[0]);
  const [signUpPassword, setSignUpPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false); // strictly false by default (neutral opt-in)

  // Validation & Touched State
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for accessible focus on error
  const identifierRef = useRef<HTMLInputElement>(null);
  const signInPasswordRef = useRef<HTMLInputElement>(null);
  const fullNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const signUpPasswordRef = useRef<HTMLInputElement>(null);

  const passwordStrength = calculatePasswordStrength(signUpPassword);

  // Field validation logic
  const validateField = (field: string, value: string): string | undefined => {
    const val = value.trim();

    if (field === 'identifier') {
      if (!val) return 'Please enter your email or 10-digit mobile number.';
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      const isPhone = /^[6-9]\d{9}$/.test(val);
      if (!isEmail && !isPhone) {
        return 'Enter a valid email address or 10-digit Indian mobile number.';
      }
    }

    if (field === 'signInPassword') {
      if (!val) return 'Please enter your password.';
      if (val.length < 6) return 'Password must be at least 6 characters.';
    }

    if (field === 'fullName') {
      if (!val) return 'Full Name is required as per government photo ID.';
      if (val.length < 2) return 'Please enter your complete legal name.';
    }

    if (field === 'email') {
      if (!val) return 'Email address is required.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        return 'Please enter a valid email address (e.g., traveler@example.com).';
      }
    }

    if (field === 'phone') {
      if (!val) return '10-digit Indian mobile number is required.';
      if (!/^[6-9]\d{9}$/.test(val)) {
        return 'Enter a valid 10-digit Indian mobile starting with 6, 7, 8, or 9.';
      }
    }

    if (field === 'signUpPassword') {
      if (!val) return 'Please create a secure password.';
      if (val.length < 8) return 'Password must be at least 8 characters long.';
    }

    return undefined;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    let val = '';
    if (field === 'identifier') val = identifier;
    else if (field === 'signInPassword') val = signInPassword;
    else if (field === 'fullName') val = fullName;
    else if (field === 'email') val = email;
    else if (field === 'phone') val = phone;
    else if (field === 'signUpPassword') val = signUpPassword;

    const err = validateField(field, val);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleChange = (field: string, val: string) => {
    if (field === 'identifier') setIdentifier(val);
    else if (field === 'signInPassword') setSignInPassword(val);
    else if (field === 'fullName') setFullName(val);
    else if (field === 'email') setEmail(val);
    else if (field === 'phone') setPhone(val);
    else if (field === 'signUpPassword') setSignUpPassword(val);

    if (touched[field as keyof FormTouched]) {
      const err = validateField(field, val);
      setErrors((prev) => ({ ...prev, [field]: err, form: undefined }));
    }
  };

  // Submit Sign In
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ identifier: true, signInPassword: true });

    const idErr = validateField('identifier', identifier);
    const passErr = validateField('signInPassword', signInPassword);

    if (idErr || passErr) {
      setErrors({ identifier: idErr, password: passErr });
      if (idErr) identifierRef.current?.focus();
      else if (passErr) signInPasswordRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const res = await signIn(identifier, signInPassword);
      if (res.success) {
        toast.success('Signed in successfully. Welcome back to Farways!');
        router.push(redirectUrl);
      } else {
        setErrors({ form: res.error || 'Invalid credentials. Please verify your details.' });
      }
    } catch {
      setErrors({ form: 'An unexpected connection error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Sign Up
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ fullName: true, email: true, phone: true, signUpPassword: true });

    const nameErr = validateField('fullName', fullName);
    const emailErr = validateField('email', email);
    const phoneErr = validateField('phone', phone);
    const passErr = validateField('signUpPassword', signUpPassword);

    if (nameErr || emailErr || phoneErr || passErr) {
      setErrors({ fullName: nameErr, email: emailErr, phone: phoneErr, password: passErr });
      if (nameErr) fullNameRef.current?.focus();
      else if (emailErr) emailRef.current?.focus();
      else if (phoneErr) phoneRef.current?.focus();
      else if (passErr) signUpPasswordRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const res = await signUp(fullName, email, signUpPassword, marketingOptIn, { phone, city });
      if (res.success) {
        toast.success('Account created and saved to database! 500 Welcome Points credited.');
        router.push(redirectUrl);
      } else {
        setErrors({ form: res.error || 'Registration failed. Please check your inputs.' });
      }
    } catch {
      setErrors({ form: 'An unexpected connection error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoSelect = (preset: 'evaluator' | 'arjun' | 'priya') => {
    demoLogin(preset);
    const names = {
      evaluator: 'Vikram Malhotra (Frequent Traveler)',
      arjun: 'Arjun Sharma (Verified Traveler)',
      priya: 'Priya Patel (Family Traveler)',
    };
    toast.success(`Logged in as ${names[preset]}`);
    router.push(redirectUrl);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-sky/30">
      {/* =========================================================================
          LEFT SIDE: FARWAYS TRUST & TRANSPARENCY MANIFESTO
          ========================================================================= */}
      <div className="lg:w-1/2 bg-gradient-to-br from-ink via-ocean-dark to-ocean text-white p-6 sm:p-10 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-ocean/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-sky/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-8">
          {/* Brand & Attribution Pill */}
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <span className="relative block h-11 w-36 overflow-hidden rounded-md bg-white">
                <Image
                  src="/farways-logo.png"
                  alt="Farways"
                  width={160}
                  height={160}
                  priority
                  className="h-full w-full object-cover object-center"
                />
              </span>
            </Link>

            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-white/15 text-white backdrop-blur-md border border-white/20 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-sky-deep" />
              <span>Next-Gen Transparent Travel Platform</span>
            </span>
          </div>

          {/* Manifesto Hero Statement */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
              The Ethical Travel Manifesto: <br className="hidden sm:inline" />
              <span className="text-sky-deep">Radical transparency by design.</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-100 max-w-xl leading-relaxed">
              Traditional travel aggregators employ deceptive dark patterns, hidden convenience fees, and fake countdown
              urgency timers. Farways eliminates them entirely.
            </p>
          </div>

          {/* 4 Pillars of Farways Integrity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2">
              <div className="flex items-center gap-2 text-sky-deep font-extrabold text-sm">
                <ShieldCheck className="w-5 h-5 text-green-300" />
                <span>Zero Hidden Fees</span>
              </div>
              <p className="text-xs text-slate-100 leading-relaxed">
                Every fare displayed is the exact amount deducted from your account. Zero convenience markups, zero drip
                pricing.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2">
              <div className="flex items-center gap-2 text-sky-deep font-extrabold text-sm">
                <Clock className="w-5 h-5 text-sky-deep" />
                <span>Live Price Lock</span>
              </div>
              <p className="text-xs text-slate-100 leading-relaxed">
                Continuous live inventory synchronization guarantees verified real-time fares so prices never jump during
                checkout.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2">
              <div className="flex items-center gap-2 text-sky-deep font-extrabold text-sm">
                <RotateCcw className="w-5 h-5 text-sky-deep" />
                <span>100% Refund Transparency</span>
              </div>
              <p className="text-xs text-slate-100 leading-relaxed">
                Direct itemized cancellation calculator. Plain-English terms with zero hidden administrative retention
                fees.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2">
              <div className="flex items-center gap-2 text-sky-deep font-extrabold text-sm">
                <Scale className="w-5 h-5 text-sky-deep" />
                <span>Zero Manipulative Urgency</span>
              </div>
              <p className="text-xs text-slate-100 leading-relaxed">
                Strictly zero fake countdown clocks, zero false scarcity alerts, and zero pre-checked add-on boxes.
              </p>
            </div>
          </div>

          {/* Testimonial Quote */}
          <div className="p-4 rounded-2xl bg-ink/40 border border-white/15 space-y-2">
            <p className="text-xs text-sky-deep italic leading-relaxed">
              &quot;Farways restored my faith in booking flights and hotels online. The price displayed on the very first
              screen was the exact total debited. Zero hidden convenience fees and completely stress-free.&quot;
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-200">
              <span className="font-bold">— Aditi Rao, Frequent Business Traveler, Mumbai</span>
              <span className="text-green-300 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Verified Traveler Review
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Trust Assurance */}
        <div className="relative z-10 pt-8 mt-8 border-t border-white/15 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-200">
          <div className="flex items-center gap-4">
            <span>✓ 256-bit TLS Encryption</span>
            <span>✓ Zero Dark Patterns</span>
            <span>✓ Supabase Verified</span>
          </div>
          <Link href="/" className="text-sky-deep hover:underline flex items-center gap-1">
            <span>Explore Discovery Search</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* =========================================================================
          RIGHT SIDE: INTERACTIVE AUTHENTICATION CARD
          ========================================================================= */}
      <div className="lg:w-1/2 p-4 sm:p-8 lg:p-12 flex items-center justify-center">
        <div className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 border border-line shadow-card space-y-6">
          {/* Header & Mode Switcher Pills */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-ocean uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-ocean" />
                <span>Secure Traveler Access</span>
              </span>
              <span className="text-xs font-medium text-slate">
                {mode === 'signin' ? 'New to Farways?' : 'Already have an account?'}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'signin' ? 'signup' : 'signin');
                    setErrors({});
                  }}
                  className="text-ocean font-bold hover:underline ml-1 cursor-pointer"
                >
                  {mode === 'signin' ? 'Create Account' : 'Sign In'}
                </button>
              </span>
            </div>

            {/* Tab Pill Switcher */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-sky border border-line">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrors({});
                }}
                className={`py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-white text-ink shadow-sm border border-line'
                    : 'text-slate hover:text-ink'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrors({});
                }}
                className={`py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-white text-ink shadow-sm border border-line'
                    : 'text-slate hover:text-ink'
                }`}
              >
                Create Account (+500 Pts)
              </button>
            </div>
          </div>

          {/* Form Alert */}
          {errors.form && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5 leading-relaxed"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* =========================================================================
              SIGN IN FORM
              ========================================================================= */}
          {mode === 'signin' && (
            <form onSubmit={handleSignInSubmit} className="space-y-4" noValidate>
              <div>
                <label
                  htmlFor="login-identifier"
                  className="block text-xs font-bold text-ink mb-1 flex items-center justify-between"
                >
                  <span>Email Address or Mobile Number</span>
                  <span className="text-[11px] font-normal text-slate">10-digit number or email</span>
                </label>
                <div className="relative">
                  <input
                    ref={identifierRef}
                    id="login-identifier"
                    type="text"
                    value={identifier}
                    onChange={(e) => handleChange('identifier', e.target.value)}
                    onBlur={() => handleBlur('identifier')}
                    aria-invalid={!!errors.identifier}
                    aria-describedby={errors.identifier ? 'login-identifier-error' : undefined}
                    placeholder="e.g. arjun.sharma@example.com or 9820123456"
                    className={`w-full px-3.5 py-2.5 pl-10 rounded-xl text-sm bg-white border ${
                      errors.identifier ? 'border-red-400 focus:border-red-500' : 'border-line focus:border-ocean'
                    } text-ink placeholder:text-slate-muted focus:outline-none transition-colors`}
                  />
                  <Mail className="w-4 h-4 text-slate absolute left-3.5 top-3.5" />
                </div>
                {errors.identifier && (
                  <p id="login-identifier-error" role="alert" className="text-xs text-red-600 mt-1">
                    {errors.identifier}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="login-password" className="text-xs font-bold text-ink">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => toast.info('Demo Mode: Enter your password or select a 1-Click Demo Login below.')}
                    className="text-[11px] text-ocean hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    ref={signInPasswordRef}
                    id="login-password"
                    type={showSignInPassword ? 'text' : 'password'}
                    value={signInPassword}
                    onChange={(e) => handleChange('signInPassword', e.target.value)}
                    onBlur={() => handleBlur('signInPassword')}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'login-password-error' : undefined}
                    placeholder="Enter your account password"
                    className={`w-full px-3.5 py-2.5 pl-10 pr-10 rounded-xl text-sm bg-white border ${
                      errors.password ? 'border-red-400 focus:border-red-500' : 'border-line focus:border-ocean'
                    } text-ink placeholder:text-slate-muted focus:outline-none transition-colors`}
                  />
                  <Lock className="w-4 h-4 text-slate absolute left-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword((prev) => !prev)}
                    className="p-1 text-slate hover:text-ink absolute right-3 top-2.5 cursor-pointer"
                    aria-label={showSignInPassword ? 'Hide password' : 'Show password'}
                  >
                    {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p id="login-password-error" role="alert" className="text-xs text-red-600 mt-1">
                    {errors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary py-3 text-sm font-bold flex items-center justify-center gap-2 mt-2 disabled:opacity-60 cursor-pointer"
              >
                <span>{isSubmitting ? 'Verifying Credentials...' : 'Sign In Securely'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* =========================================================================
              SIGN UP FORM (Full Registration)
              ========================================================================= */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-4" noValidate>
              {/* Full Name */}
              <div>
                <label
                  htmlFor="signup-name"
                  className="block text-xs font-bold text-ink mb-1 flex items-center justify-between"
                >
                  <span>Full Name</span>
                  <span className="text-[11px] font-normal text-slate">As on government photo ID</span>
                </label>
                <div className="relative">
                  <input
                    ref={fullNameRef}
                    id="signup-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    onBlur={() => handleBlur('fullName')}
                    aria-invalid={!!errors.fullName}
                    aria-describedby={errors.fullName ? 'signup-name-error' : undefined}
                    placeholder="e.g. Dr. Rajesh Kumar"
                    className={`w-full px-3.5 py-2.5 pl-10 rounded-xl text-sm bg-white border ${
                      errors.fullName ? 'border-red-400 focus:border-red-500' : 'border-line focus:border-ocean'
                    } text-ink placeholder:text-slate-muted focus:outline-none transition-colors`}
                  />
                  <User className="w-4 h-4 text-slate absolute left-3.5 top-3.5" />
                </div>
                {errors.fullName && (
                  <p id="signup-name-error" role="alert" className="text-xs text-red-600 mt-1">
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email & Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Email */}
                <div>
                  <label htmlFor="signup-email" className="block text-xs font-bold text-ink mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      ref={emailRef}
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'signup-email-error' : undefined}
                      placeholder="traveler@example.com"
                      className={`w-full px-3.5 py-2.5 pl-10 rounded-xl text-sm bg-white border ${
                        errors.email ? 'border-red-400 focus:border-red-500' : 'border-line focus:border-ocean'
                      } text-ink placeholder:text-slate-muted focus:outline-none transition-colors`}
                    />
                    <Mail className="w-4 h-4 text-slate absolute left-3.5 top-3.5" />
                  </div>
                  {errors.email && (
                    <p id="signup-email-error" role="alert" className="text-xs text-red-600 mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Mobile */}
                <div>
                  <label htmlFor="signup-phone" className="block text-xs font-bold text-ink mb-1">
                    10-Digit Mobile
                  </label>
                  <div className="relative">
                    <input
                      ref={phoneRef}
                      id="signup-phone"
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, ''))}
                      onBlur={() => handleBlur('phone')}
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? 'signup-phone-error' : undefined}
                      placeholder="9820123456"
                      className={`w-full px-3.5 py-2.5 pl-10 rounded-xl text-sm bg-white border ${
                        errors.phone ? 'border-red-400 focus:border-red-500' : 'border-line focus:border-ocean'
                      } text-ink placeholder:text-slate-muted focus:outline-none transition-colors`}
                    />
                    <Phone className="w-4 h-4 text-slate absolute left-3.5 top-3.5" />
                  </div>
                  {errors.phone && (
                    <p id="signup-phone-error" role="alert" className="text-xs text-red-600 mt-1">
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Home City Selector */}
              <div>
                <label htmlFor="signup-city" className="block text-xs font-bold text-ink mb-1">
                  Primary Home City / Origin Hub
                </label>
                <div className="relative">
                  <select
                    id="signup-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 pl-10 rounded-xl text-sm bg-white border border-line text-ink focus:border-ocean focus:outline-none transition-colors cursor-pointer"
                  >
                    {INDIAN_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <MapPin className="w-4 h-4 text-slate absolute left-3.5 top-3.5" />
                </div>
              </div>

              {/* Password & Strength Meter */}
              <div>
                <label htmlFor="signup-password" className="block text-xs font-bold text-ink mb-1">
                  Create Password (8+ characters)
                </label>
                <div className="relative">
                  <input
                    ref={signUpPasswordRef}
                    id="signup-password"
                    type={showSignUpPassword ? 'text' : 'password'}
                    value={signUpPassword}
                    onChange={(e) => handleChange('signUpPassword', e.target.value)}
                    onBlur={() => handleBlur('signUpPassword')}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'signup-password-error' : undefined}
                    placeholder="Create a strong, secure password"
                    className={`w-full px-3.5 py-2.5 pl-10 pr-10 rounded-xl text-sm bg-white border ${
                      errors.password ? 'border-red-400 focus:border-red-500' : 'border-line focus:border-ocean'
                    } text-ink placeholder:text-slate-muted focus:outline-none transition-colors`}
                  />
                  <Lock className="w-4 h-4 text-slate absolute left-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword((prev) => !prev)}
                    className="p-1 text-slate hover:text-ink absolute right-3 top-2.5 cursor-pointer"
                    aria-label={showSignUpPassword ? 'Hide password' : 'Show password'}
                  >
                    {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p id="signup-password-error" role="alert" className="text-xs text-red-600 mt-1">
                    {errors.password}
                  </p>
                )}

                {/* Password Strength Meter */}
                {signUpPassword && (
                  <div className="mt-2 space-y-1.5 animate-calm">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate">Password Strength:</span>
                      <span
                        className={`font-bold ${
                          passwordStrength.score >= 3
                            ? 'text-green'
                            : passwordStrength.score === 2
                            ? 'text-amber-600'
                            : 'text-red-600'
                        }`}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 h-1.5">
                      <div
                        className={`rounded-full ${
                          passwordStrength.score >= 1 ? passwordStrength.color : 'bg-slate/20'
                        } transition-colors duration-300`}
                      />
                      <div
                        className={`rounded-full ${
                          passwordStrength.score >= 2 ? passwordStrength.color : 'bg-slate/20'
                        } transition-colors duration-300`}
                      />
                      <div
                        className={`rounded-full ${
                          passwordStrength.score >= 3 ? passwordStrength.color : 'bg-slate/20'
                        } transition-colors duration-300`}
                      />
                      <div
                        className={`rounded-full ${
                          passwordStrength.score >= 4 ? passwordStrength.color : 'bg-slate/20'
                        } transition-colors duration-300`}
                      />
                    </div>
                    {passwordStrength.feedback && (
                      <p className="text-[10px] text-slate-muted">{passwordStrength.feedback}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Neutral Promotional Opt-in Checkbox (Requirement 2) */}
              <div className="p-3.5 rounded-xl bg-sky/50 border border-sky-deep">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={marketingOptIn}
                    onChange={(e) => setMarketingOptIn(e.target.checked)}
                    className="mt-0.5 rounded border-line text-ocean focus:ring-ocean cursor-pointer"
                  />
                  <div className="text-xs text-ink leading-snug">
                    <span className="font-bold block">Opt-in for fair-price travel alerts & quarterly discounts</span>
                    <span className="text-[11px] text-slate block mt-0.5">
                      Strictly UNCHECKED by default. Farways never subscribes you without deliberate, active consent.
                    </span>
                  </div>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary py-3 text-sm font-bold flex items-center justify-center gap-2 mt-2 disabled:opacity-60 cursor-pointer"
              >
                <span>{isSubmitting ? 'Creating Profile...' : 'Create Account & Claim 500 Pts'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* =========================================================================
              1-CLICK INSTANT DEMO LOGINS (Testing & Evaluation)
              ========================================================================= */}
          <div className="p-4 rounded-2xl bg-sky/60 border border-sky-deep space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-ocean" />
                <span>1-Click Instant Demo Logins</span>
              </span>
              <span className="text-[10px] text-green font-bold px-2 py-0.5 rounded bg-green-50 border border-green-200">
                Instant Access
              </span>
            </div>

            <p className="text-[11px] text-slate leading-relaxed">
              For testing and demonstration. Click any verified profile below to explore authenticated account features
              and real-time booking persistence immediately:
            </p>

            <div className="space-y-2">
              {/* Frequent Traveler */}
              <button
                type="button"
                onClick={() => handleDemoSelect('evaluator')}
                className="w-full p-2.5 rounded-xl bg-white border border-line hover:border-ocean hover:bg-sky text-left transition-all cursor-pointer flex items-center justify-between group shadow-subtle"
              >
                <div>
                  <div className="text-xs font-extrabold text-ink group-hover:text-ocean flex items-center gap-1.5">
                    <span>Vikram Malhotra (Frequent Traveler)</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-ocean text-white">Frequent Flyer</span>
                  </div>
                  <div className="text-[10px] text-slate mt-0.5">
                    vikram.malhotra@farways.in • Mumbai • 1,500 Reward Pts
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate group-hover:text-ocean transition-transform group-hover:translate-x-0.5" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Business Traveler */}
                <button
                  type="button"
                  onClick={() => handleDemoSelect('arjun')}
                  className="p-2.5 rounded-xl bg-white border border-line hover:border-ocean hover:bg-sky text-left transition-all cursor-pointer group shadow-subtle"
                >
                  <div className="text-xs font-extrabold text-ink group-hover:text-ocean">Arjun Sharma</div>
                  <div className="text-[10px] text-slate truncate">arjun.sharma@example.com</div>
                  <div className="text-[9px] text-ocean font-semibold mt-0.5">500 Pts • Mumbai</div>
                </button>

                {/* Family Traveler */}
                <button
                  type="button"
                  onClick={() => handleDemoSelect('priya')}
                  className="p-2.5 rounded-xl bg-white border border-line hover:border-ocean hover:bg-sky text-left transition-all cursor-pointer group shadow-subtle"
                >
                  <div className="text-xs font-extrabold text-ink group-hover:text-ocean">Priya Patel</div>
                  <div className="text-[10px] text-slate truncate">priya.patel@example.com</div>
                  <div className="text-[9px] text-ocean font-semibold mt-0.5">750 Pts • Delhi NCR</div>
                </button>
              </div>
            </div>
          </div>

          {/* Privacy Footnote */}
          <p className="text-[11px] text-slate-muted text-center leading-relaxed">
            By accessing Farways, you agree to our 100% Transparent Terms. We never sell your personal data or track you
            across external websites.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-white">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center p-6 text-center">
            <div className="w-8 h-8 border-4 border-ocean border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold text-slate">Loading Farways Authentication...</p>
          </div>
        }
      >
        <LoginContent />
      </Suspense>
    </main>
  );
}
