'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  Calendar, 
  Lock, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useToast } from '@/components/ToastProvider';
import { useSessionGuard } from '@/components/SessionGuard';
import { farwaysDataService } from '@/lib/supabase/client';
import { ItemType, Stay, Flight, Train, Cab, Addon } from '@/types/farways';

interface TravelerAndPaymentFormProps {
  item: Stay | Flight | Train | Cab;
  itemType: ItemType;
  selectedAddons: Addon[];
  stayNights?: number;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  infantAge?: string;
  cardholderName?: string;
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
}

export function TravelerAndPaymentForm({
  item,
  itemType,
  selectedAddons,
  stayNights = 1,
}: TravelerAndPaymentFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const { saveDraft, getDraft } = useSessionGuard();

  // Traveler State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [passengerType, setPassengerType] = useState<'Adult' | 'Child' | 'Infant'>('Adult');
  const [infantAgeMonths, setInfantAgeMonths] = useState<string>('');

  // Payment State
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // Form Status
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field Refs for Auto-Focus & Smooth Scroll on error
  const fullNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const infantAgeRef = useRef<HTMLInputElement>(null);
  const cardholderNameRef = useRef<HTMLInputElement>(null);
  const cardNumberRef = useRef<HTMLInputElement>(null);
  const expiryRef = useRef<HTMLInputElement>(null);
  const cvvRef = useRef<HTMLInputElement>(null);

  // Restore draft if available from SessionGuard
  useEffect(() => {
    const draft = getDraft(`checkout_${itemType}_${item.id}`);
    if (draft && draft.formData) {
      if (draft.formData.fullName) setFullName(draft.formData.fullName as string);
      if (draft.formData.email) setEmail(draft.formData.email as string);
      if (draft.formData.phone) setPhone(draft.formData.phone as string);
      if (draft.formData.cardholderName) setCardholderName(draft.formData.cardholderName as string);
      // Silently restores state without intrusive toast notification spam
    }
  }, [getDraft, item.id, itemType]);

  // Synchronize traveler state when user profile is loaded from database/session
  useEffect(() => {
    if (user) {
      setFullName((prev) => (prev ? prev : user.fullName || ''));
      setEmail((prev) => (prev ? prev : user.email || ''));
      setPhone((prev) => (prev ? prev : user.phone || ''));
      setCardholderName((prev) => (prev ? prev : user.fullName || ''));
    }
  }, [user]);

  // Continuously preserve draft state in sessionStorage
  useEffect(() => {
    saveDraft(`checkout_${itemType}_${item.id}`, {
      fullName,
      email,
      phone,
      cardholderName,
      passengerType,
    }, {
      title: 'name' in item ? item.name : 'trainNumber' in item ? `${item.trainNumber} ${item.trainName}` : 'flightNumber' in item ? `${item.airlineName} ${item.flightNumber}` : 'vehicleModel' in item ? item.vehicleModel : 'Reservation',
      subtitle: `${itemType.toUpperCase()} Reservation`,
      stepName: 'Step 2: Traveler & Payment',
    });
  }, [fullName, email, phone, cardholderName, passengerType, item, itemType, saveDraft]);

  // Validation Logic
  const validateField = (field: string, val: string): string | undefined => {
    const clean = val.trim();

    if (field === 'fullName') {
      if (!clean) return 'Please enter the traveler full name.';
      if (!/^[a-zA-Z\s]{2,50}$/.test(clean)) {
        return 'Full name must contain alphabets only (2-50 characters) matching government ID.';
      }
    }

    if (field === 'email') {
      if (!clean) return 'Please enter an email address.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
        return 'Please enter a valid email address for receiving your ticket.';
      }
    }

    if (field === 'phone') {
      if (!clean) return 'Please enter a 10-digit mobile number.';
      if (!/^[6-9]\d{9}$/.test(clean)) {
        return 'Please enter a valid 10-digit Indian mobile number (e.g. 9820123456).';
      }
    }

    if (field === 'infantAge' && passengerType === 'Infant') {
      const months = parseInt(clean, 10);
      if (isNaN(months) || months < 0) return 'Please enter age in months.';
      if (months > 24) {
        return 'Infant ticket requires age under 24 months at departure. For travelers 2 years or older, please select Child or Adult ticket.';
      }
    }

    if (field === 'cardholderName') {
      if (!clean) return 'Please enter the cardholder name.';
      if (!/^[a-zA-Z\s]{2,50}$/.test(clean)) {
        return 'Cardholder name must contain alphabets only.';
      }
    }

    if (field === 'cardNumber') {
      const digits = val.replace(/\s+/g, '');
      if (!digits) return 'Please enter card number.';
      if (digits.length !== 16 || !/^\d{16}$/.test(digits)) {
        return 'Please enter a valid 16-digit card number.';
      }
    }

    if (field === 'expiry') {
      if (!clean) return 'Please enter expiry date.';
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(clean)) {
        return 'Enter expiry in MM/YY format (e.g. 10/28).';
      }
      const [m, y] = clean.split('/').map(Number);
      const yearFull = 2000 + y;
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      if (yearFull < currentYear || (yearFull === currentYear && m < currentMonth)) {
        return 'Card expiry date has already passed.';
      }
    }

    if (field === 'cvv') {
      if (!clean) return 'Please enter CVV.';
      if (!/^\d{3,4}$/.test(clean)) {
        return 'CVV must be 3 or 4 digits located on the card.';
      }
    }

    return undefined;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    let val = '';
    if (field === 'fullName') val = fullName;
    if (field === 'email') val = email;
    if (field === 'phone') val = phone;
    if (field === 'infantAge') val = infantAgeMonths;
    if (field === 'cardholderName') val = cardholderName;
    if (field === 'cardNumber') val = cardNumber;
    if (field === 'expiry') val = expiry;
    if (field === 'cvv') val = cvv;

    const error = validateField(field, val);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  // Card Number Auto-format: XXXX XXXX XXXX XXXX
  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
    if (touched.cardNumber) {
      setErrors((prev) => ({ ...prev, cardNumber: validateField('cardNumber', formatted) }));
    }
  };

  // Expiry Auto-format: MM/YY
  const handleExpiryChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    let formatted = raw;
    if (raw.length >= 3) {
      formatted = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setExpiry(formatted);
    if (touched.expiry) {
      setErrors((prev) => ({ ...prev, expiry: validateField('expiry', formatted) }));
    }
  };

  // 1-Click Fast-Fill Test Data for fast checkout demonstration
  const fillTestData = () => {
    setFullName('Arjun Sharma');
    setEmail('arjun.sharma@example.com');
    setPhone('9820123456');
    setPassengerType('Adult');
    setCardholderName('Arjun Sharma');
    setCardNumber('4532 8920 1234 5678');
    setExpiry('12/28');
    setCvv('784');
    setErrors({});
    toast.success('Sample traveler details autofilled.', 'Form Autofilled');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: FormErrors = {
      fullName: validateField('fullName', fullName),
      email: validateField('email', email),
      phone: validateField('phone', phone),
      infantAge: passengerType === 'Infant' ? validateField('infantAge', infantAgeMonths) : undefined,
      cardholderName: validateField('cardholderName', cardholderName),
      cardNumber: validateField('cardNumber', cardNumber),
      expiry: validateField('expiry', expiry),
      cvv: validateField('cvv', cvv),
    };

    setErrors(newErrors);
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      infantAge: true,
      cardholderName: true,
      cardNumber: true,
      expiry: true,
      cvv: true,
    });

    // Check if any error exists
    const errorKeys = Object.keys(newErrors) as (keyof FormErrors)[];
    const firstInvalidKey = errorKeys.find((k) => newErrors[k] !== undefined);

    if (firstInvalidKey) {
      toast.error('Please resolve the highlighted field errors to continue.', 'Validation Error');

      // Smoothly scroll and auto-focus the first invalid field
      const refMap: Record<string, React.RefObject<HTMLInputElement>> = {
        fullName: fullNameRef,
        email: emailRef,
        phone: phoneRef,
        infantAge: infantAgeRef,
        cardholderName: cardholderNameRef,
        cardNumber: cardNumberRef,
        expiry: expiryRef,
        cvv: cvvRef,
      };

      const targetRef = refMap[firstInvalidKey];
      if (targetRef && targetRef.current) {
        targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetRef.current.focus();
      }
      return;
    }

    // Valid Submission Workflow
    setIsSubmitting(true);

    try {
      const confirmationCode = `FW${Math.floor(100000 + Math.random() * 900000)}`;
      const multiplier = itemType === 'stay' ? stayNights : 1;
      const baseAmount = item.base_price * multiplier;
      const taxAmount = item.tax * multiplier;
      const platformFee = item.platform_fee * multiplier;
      const addonsTotal = selectedAddons.reduce((s, a) => s + a.price, 0);
      const totalAmount = baseAmount + taxAmount + platformFee + addonsTotal;

      const title = 'name' in item ? item.name : 'trainNumber' in item ? `${item.trainNumber} ${item.trainName}` : 'flightNumber' in item ? `${item.airlineName} ${item.flightNumber}` : 'vehicleModel' in item ? item.vehicleModel : 'Reservation';
      const subtitle = 'roomType' in item ? item.roomType : 'trainNumber' in item ? `${item.originCode} to ${item.destinationCode} (${item.trainType})` : 'originCode' in item ? `${item.originCode} to ${item.destinationCode}` : 'routeDestination' in item ? item.routeDestination : '';

      await farwaysDataService.createBooking({
        user_id: user?.id || 'anon-traveler',
        item_type: itemType,
        item_id: item.id,
        title,
        subtitle,
        base_amount: baseAmount,
        tax_amount: taxAmount,
        platform_fee: platformFee,
        addons_json: selectedAddons.map((a) => ({ id: a.id, name: a.name, price: a.price })),
        total_amount: totalAmount,
        traveler_name: fullName.trim(),
        traveler_email: email.trim(),
        traveler_phone: phone.trim(),
        confirmation_code: confirmationCode,
        status: 'confirmed',
      });

      toast.success(
        `Your reservation is confirmed! Reference: ${confirmationCode}`,
        'Booking Secured'
      );

      // Redirect to dashboard with confirmation query
      router.push(`/dashboard?booked=${confirmationCode}`);
    } catch (err: unknown) {
      console.error('[Farways Checkout Error]', err);
      toast.error('Booking failed. Please retry or contact Farways support.');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* 1-Click Express Autofill Bar */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-sky border border-line text-xs">
        <span className="font-bold text-ink flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-ocean" />
          <span>Express Autofill (Demo / Testing)</span>
        </span>
        <button
          type="button"
          onClick={fillTestData}
          className="btn-secondary py-1 px-2.5 text-[11px] font-bold"
        >
          1-Click Quick Fill
        </button>
      </div>

      {/* =========================================================================
          SECTION 1: TRAVELER INFORMATION
          ========================================================================= */}
      <div className="bg-white border border-line rounded-2xl p-5 sm:p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <div>
            <h3 className="text-base font-bold text-ink">Primary Traveler Details</h3>
            <p className="text-xs text-slate">Exact details matching your government identity proof.</p>
          </div>
          <span className="text-[11px] font-semibold text-ocean bg-sky px-2.5 py-1 rounded-md border border-sky-deep">
            Step 1 of 2
          </span>
        </div>

        {/* Full Name */}
        <div>
          <label htmlFor="traveler-fullname" className="block text-xs font-bold text-ink mb-1">
            Full Name (as on Govt ID / Passport) *
          </label>
          <div className="relative">
            <input
              ref={fullNameRef}
              id="traveler-fullname"
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (touched.fullName) {
                  setErrors((prev) => ({ ...prev, fullName: validateField('fullName', e.target.value) }));
                }
              }}
              onBlur={() => handleBlur('fullName')}
              aria-invalid={!!errors.fullName}
              aria-describedby={errors.fullName ? 'traveler-fullname-error' : undefined}
              placeholder="e.g. Arjun Sharma"
              className={`w-full px-3.5 py-2.5 pl-10 rounded-xl text-sm bg-white border ${
                errors.fullName ? 'border-red-400 focus:border-red-500' : 'border-line focus:border-ocean'
              } text-ink placeholder:text-slate-muted focus:outline-none transition-colors`}
            />
            <User className="w-4 h-4 text-slate absolute left-3.5 top-3" />
          </div>
          {errors.fullName && (
            <p id="traveler-fullname-error" role="alert" className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.fullName}</span>
            </p>
          )}
        </div>

        {/* Email & Phone Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Email */}
          <div>
            <label htmlFor="traveler-email" className="block text-xs font-bold text-ink mb-1">
              Email Address (for Ticket & GST Invoice) *
            </label>
            <div className="relative">
              <input
                ref={emailRef}
                id="traveler-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (touched.email) {
                    setErrors((prev) => ({ ...prev, email: validateField('email', e.target.value) }));
                  }
                }}
                onBlur={() => handleBlur('email')}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'traveler-email-error' : undefined}
                placeholder="name@example.com"
                className={`w-full px-3.5 py-2.5 pl-10 rounded-xl text-sm bg-white border ${
                  errors.email ? 'border-red-400 focus:border-red-500' : 'border-line focus:border-ocean'
                } text-ink placeholder:text-slate-muted focus:outline-none transition-colors`}
              />
              <Mail className="w-4 h-4 text-slate absolute left-3.5 top-3" />
            </div>
            {errors.email && (
              <p id="traveler-email-error" role="alert" className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="traveler-phone" className="block text-xs font-bold text-ink mb-1">
              Indian Mobile Number (SMS Alerts) *
            </label>
            <div className="relative">
              <input
                ref={phoneRef}
                id="traveler-phone"
                type="tel"
                value={phone}
                onChange={(e) => {
                  const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setPhone(clean);
                  if (touched.phone) {
                    setErrors((prev) => ({ ...prev, phone: validateField('phone', clean) }));
                  }
                }}
                onBlur={() => handleBlur('phone')}
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? 'traveler-phone-error' : undefined}
                placeholder="9820123456"
                className={`w-full px-3.5 py-2.5 pl-10 rounded-xl text-sm bg-white border ${
                  errors.phone ? 'border-red-400 focus:border-red-500' : 'border-line focus:border-ocean'
                } text-ink placeholder:text-slate-muted focus:outline-none transition-colors`}
              />
              <Phone className="w-4 h-4 text-slate absolute left-3.5 top-3" />
            </div>
            {errors.phone && (
              <p id="traveler-phone-error" role="alert" className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.phone}</span>
              </p>
            )}
          </div>
        </div>

        {/* Passenger Category & Infant Age Validation (Requirement 4) */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-ink mb-1.5">
            Passenger Category
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['Adult', 'Child', 'Infant'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setPassengerType(cat);
                  setErrors((prev) => ({ ...prev, infantAge: undefined }));
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  passengerType === cat
                    ? 'bg-sky-deep text-ocean border-ocean'
                    : 'bg-white text-slate border-line hover:bg-sky'
                }`}
              >
                {cat === 'Adult' ? 'Adult (12+ yrs)' : cat === 'Child' ? 'Child (2-11 yrs)' : 'Infant (<24 mos)'}
              </button>
            ))}
          </div>

          {/* Infant Age Input with Strict Inline Message if > 24 Months */}
          {passengerType === 'Infant' && (
            <div className="mt-3 p-3.5 rounded-xl bg-sky/60 border border-sky-deep">
              <label htmlFor="infant-age" className="block text-xs font-bold text-ink mb-1">
                Infant Age (in months at departure) *
              </label>
              <input
                ref={infantAgeRef}
                id="infant-age"
                type="number"
                min="0"
                max="36"
                value={infantAgeMonths}
                onChange={(e) => {
                  setInfantAgeMonths(e.target.value);
                  setErrors((prev) => ({ ...prev, infantAge: validateField('infantAge', e.target.value) }));
                }}
                onBlur={() => handleBlur('infantAge')}
                placeholder="e.g. 14"
                className="w-32 px-3 py-1.5 rounded-lg border border-line text-xs font-bold text-ink bg-white focus:outline-none focus:border-ocean"
              />
              {errors.infantAge && (
                <p id="infant-age-error" role="alert" className="text-xs text-red-600 font-semibold mt-1.5 flex items-start gap-1">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errors.infantAge}</span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: PAYMENT CREDENTIALS (CARD)
          ========================================================================= */}
      <div className="bg-white border border-line rounded-2xl p-5 sm:p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <div>
            <h3 className="text-base font-bold text-ink">Secure Card Payment</h3>
            <p className="text-xs text-slate">Encrypted via 256-bit TLS. Zero stored CVVs.</p>
          </div>
          <span className="text-[11px] font-semibold text-ocean bg-sky px-2.5 py-1 rounded-md border border-sky-deep">
            Step 2 of 2
          </span>
        </div>

        {/* Cardholder Name */}
        <div>
          <label htmlFor="cardholder-name" className="block text-xs font-bold text-ink mb-1">
            Name on Card *
          </label>
          <input
            ref={cardholderNameRef}
            id="cardholder-name"
            type="text"
            value={cardholderName}
            onChange={(e) => {
              setCardholderName(e.target.value);
              if (touched.cardholderName) {
                setErrors((prev) => ({ ...prev, cardholderName: validateField('cardholderName', e.target.value) }));
              }
            }}
            onBlur={() => handleBlur('cardholderName')}
            placeholder="e.g. Arjun Sharma"
            className={`w-full px-3.5 py-2.5 rounded-xl text-sm bg-white border ${
              errors.cardholderName ? 'border-red-400 focus:border-red-500' : 'border-line focus:border-ocean'
            } text-ink placeholder:text-slate-muted focus:outline-none transition-colors`}
          />
          {errors.cardholderName && (
            <p role="alert" className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.cardholderName}</span>
            </p>
          )}
        </div>

        {/* 16-Digit Card Number (Auto-formatted) */}
        <div>
          <label htmlFor="card-number" className="block text-xs font-bold text-ink mb-1">
            Card Number (16 Digits) *
          </label>
          <div className="relative">
            <input
              ref={cardNumberRef}
              id="card-number"
              type="text"
              value={cardNumber}
              onChange={(e) => handleCardNumberChange(e.target.value)}
              onBlur={() => handleBlur('cardNumber')}
              placeholder="XXXX XXXX XXXX XXXX"
              className={`w-full px-3.5 py-2.5 pl-10 rounded-xl text-sm font-mono bg-white border ${
                errors.cardNumber ? 'border-red-400 focus:border-red-500' : 'border-line focus:border-ocean'
              } text-ink placeholder:text-slate-muted focus:outline-none transition-colors`}
            />
            <CreditCard className="w-4 h-4 text-slate absolute left-3.5 top-3" />
          </div>
          {errors.cardNumber && (
            <p role="alert" className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.cardNumber}</span>
            </p>
          )}
        </div>

        {/* Expiry & CVV Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Expiry MM/YY */}
          <div>
            <label htmlFor="card-expiry" className="block text-xs font-bold text-ink mb-1">
              Expiry Date (MM/YY) *
            </label>
            <div className="relative">
              <input
                ref={expiryRef}
                id="card-expiry"
                type="text"
                value={expiry}
                onChange={(e) => handleExpiryChange(e.target.value)}
                onBlur={() => handleBlur('expiry')}
                placeholder="MM/YY"
                className={`w-full px-3.5 py-2.5 pl-10 rounded-xl text-sm font-mono bg-white border ${
                  errors.expiry ? 'border-red-400 focus:border-red-500' : 'border-line focus:border-ocean'
                } text-ink placeholder:text-slate-muted focus:outline-none transition-colors`}
              />
              <Calendar className="w-4 h-4 text-slate absolute left-3.5 top-3" />
            </div>
            {errors.expiry && (
              <p role="alert" className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.expiry}</span>
              </p>
            )}
          </div>

          {/* CVV */}
          <div>
            <label htmlFor="card-cvv" className="block text-xs font-bold text-ink mb-1">
              CVV (3 or 4 Digits) *
            </label>
            <div className="relative">
              <input
                ref={cvvRef}
                id="card-cvv"
                type="password"
                maxLength={4}
                value={cvv}
                onChange={(e) => {
                  const clean = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setCvv(clean);
                  if (touched.cvv) {
                    setErrors((prev) => ({ ...prev, cvv: validateField('cvv', clean) }));
                  }
                }}
                onBlur={() => handleBlur('cvv')}
                placeholder="•••"
                className={`w-full px-3.5 py-2.5 pl-10 rounded-xl text-sm font-mono bg-white border ${
                  errors.cvv ? 'border-red-400 focus:border-red-500' : 'border-line focus:border-ocean'
                } text-ink placeholder:text-slate-muted focus:outline-none transition-colors`}
              />
              <Lock className="w-4 h-4 text-slate absolute left-3.5 top-3" />
            </div>
            {errors.cvv && (
              <p role="alert" className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.cvv}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Primary Submit Action */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full btn-primary py-3.5 text-sm sm:text-base font-extrabold flex items-center justify-center gap-2 shadow-card cursor-pointer disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Securing Guaranteed Booking in Supabase...</span>
          </>
        ) : (
          <>
            <ShieldCheck className="w-5 h-5" />
            <span>Complete Booking with Zero Surcharges</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </form>
  );
}
