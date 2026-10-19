/**
 * Farways - Honest, Transparent Travel Platform
 * IEEE HCI Research Project
 * 
 * TypeScript definitions eliminating dark patterns:
 * - Drip pricing eliminated via upfront breakdown: base_price, tax, platform_fee, total_price
 * - Fake urgency and countdown timers eliminated
 * - Confirmshaming and pre-selected defaults strictly typed as opt-in
 */

export type ItemType = 'stay' | 'flight' | 'train' | 'cab';

export type BookingStatus = 'confirmed' | 'cancelled' | 'pending';

/**
 * Common Price Breakdown structure used across all travel products.
 * Research principle: Radical Price Transparency (No hidden fees at checkout).
 */
export interface PriceBreakdown {
  basePrice: number;
  tax: number;
  platformFee: number;
  totalPrice: number;
  currency: string; // e.g., 'INR'
  perUnitLabel: string; // e.g., 'per night', 'per traveler', 'per trip'
}

/**
 * Opt-in Addon definition.
 * Research principle: Add-ons MUST NOT be pre-selected (anti-sneak-into-basket).
 */
export interface Addon {
  id: string;
  name: string;
  description: string;
  category: 'baggage' | 'insurance' | 'meal' | 'seat' | 'amenity' | 'cancellation_waiver';
  price: number;
  defaultSelected: false; // Strictly enforced: default must never be true
  transparentTerms: string; // Plain-English conditions without legal obfuscation
}

export interface RoomCategory {
  id: string;
  name: string;
  bedType: string;
  sizeSqFt: number;
  basePrice: number;
  tax: number;
  totalPrice: number;
  perks: string[];
  maxGuests: number;
}

/**
 * Stay (Hotel / Resort / Homestay)
 */
export interface Stay {
  id: string;
  name: string;
  tagline: string;
  city: 'Mumbai' | 'Delhi NCR' | 'Goa' | string;
  location: string;
  address: string;
  rating: number; // Authentic rating 1.0 - 5.0
  reviewCount: number; // Honest, verified review volume (no inflated testimonials)
  starCategory: 3 | 4 | 5;
  propertyType: 'Hotel' | 'Resort' | 'Boutique Stay' | 'Heritage Palace' | 'Serviced Apartment';
  images: string[];
  thumbnail: string;
  
  // Itemized Transparent Pricing
  base_price: number; // Per night base room rate
  tax: number; // 12% or 18% GST itemized upfront
  platform_fee: number; // Farways zero or nominal upfront platform fee (INR 0-150)
  total_price: number; // Guaranteed upfront final price (base_price + tax + platform_fee)
  
  roomType: string;
  bedType: string;
  maxGuests: number;
  amenities: string[];
  
  // Anti-Dark-Pattern guarantees
  cancellationPolicy: {
    type: 'free_cancellation' | 'partial_refund' | 'non_refundable';
    deadlineHoursBeforeCheckIn: number;
    description: string;
  };
  checkInTime: string;
  checkOutTime: string;
  nearbyAttractions?: string[];
  featuredBadge?: string; // Honest informative badge e.g. "Heritage Property", "Beachfront" (NO "Urgent Deal")

  // Superior Detail Attributes
  roomCategories?: RoomCategory[];
  walkScore?: number; // e.g. 94/100
  safetyScore?: number; // e.g. 96/100
  prosCons?: {
    pros: string[];
    cons: string[];
  };
  gallery?: string[]; // 3-4 distinct photos: Exterior, Bedroom, Pool/Dining, Bathroom
}


/**
 * Flight (Domestic & International Routes)
 */
export interface Flight {
  id: string;
  airlineName: 'IndiGo' | 'Air India' | 'Akasa Air' | 'Vistara' | 'Emirates' | 'Singapore Airlines' | 'Qatar Airways' | 'SpiceJet' | string;
  airlineCode: string; // e.g., 6E, AI, QP, UK, EK, SQ, QR, SG
  flightNumber: string; // e.g., '6E 5342'
  aircraft: string; // e.g., 'Airbus A321neo', 'Boeing 787-9 Dreamliner'
  logoUrl?: string;

  originCity: string;
  originAirport: string;
  originCode: string; // e.g., BOM, DEL, GOI, DXB, SIN, DOH
  originTerminal: string;

  destinationCity: string;
  destinationAirport: string;
  destinationCode: string;
  destinationTerminal: string;

  departureTime: string; // ISO 8601 or HH:mm format
  arrivalTime: string;
  durationMinutes: number;
  durationFormatted: string; // e.g., "2h 15m"
  stops: number; // 0 for Non-stop, 1 for 1 stop
  stopDetails?: string;

  cabinClass: 'Economy' | 'Premium Economy' | 'Business';
  baggageAllowance: {
    cabinKg: number;
    checkInKg: number;
  };

  // Itemized Transparent Pricing
  base_price: number;
  tax: number; // Air passenger duty, fuel surcharge, GST itemized upfront
  platform_fee: number;
  total_price: number; // Total transparent fare per adult

  availableAddons: Addon[]; // e.g. extra baggage, meal, carbon offset (strictly unselected by default)
  carbonFootprintKg?: number; // HCI eco-transparency indicator
  onTimePerformanceScore?: number; // e.g. 92% historical punctuality
  imageUrl?: string;
}

/**
 * Train Coach Classes (Indian Railways standard)
 */
export type TrainCoachClass = '1A' | '2A' | '3A' | 'EC' | 'CC' | 'SL' | '2S';

export interface TrainSeatAvailability {
  classCode: TrainCoachClass;
  className: string; // e.g. 'Executive Chair Car', 'AC Chair Car', 'AC 3-Tier'
  status: string; // e.g. 'AVAILABLE-42', 'RAC-8', 'AVAILABLE-114'
  fare: number;
  basePrice: number;
  superfastGst: number;
  seatsAvailable: number;
  confirmationProbability?: number; // e.g. 98%
}

/**
 * Train (Indian Railways Vande Bharat, Rajdhani, Tejas, etc.)
 */
export interface Train {
  id: string;
  trainNumber: string; // e.g. '22229'
  trainName: string; // e.g. 'CSMT - Madgaon Vande Bharat Express'
  trainType: 'Vande Bharat Express' | 'Tejas Rajdhani Express' | 'Gatimaan Express' | 'Tejas Express' | 'Jan Shatabdi' | 'Superfast Express';
  
  originStation: string;
  originCode: string; // e.g. 'CSMT', 'NDLS'
  originCity: string;
  
  destinationStation: string;
  destinationCode: string; // e.g. 'MAO', 'AGC'
  destinationCity: string;
  
  departureTime: string; // HH:mm
  arrivalTime: string;
  durationMinutes: number;
  durationFormatted: string; // e.g. '7h 45m'
  runsOnDays: string[]; // e.g. ['Mon', 'Tue', 'Wed', 'Fri', 'Sat', 'Sun']

  classes: TrainSeatAvailability[];
  selectedClass: TrainCoachClass;

  // Itemized Transparent Pricing
  base_price: number; // Base IRCTC fare
  tax: number; // Superfast + GST charge itemized upfront
  platform_fee: number; // Farways zero markup convenience fee (₹0)
  total_price: number;

  onTimeScore: number; // e.g. 96%
  cateringIncluded: boolean;
  pantryAvailable: boolean;
  amenities: string[];
  cancellationPolicy: {
    deadlineHours: number;
    description: string;
    clerkageFee: number;
  };
  distanceKm: number;
  imageUrl?: string;
}

/**
 * Cab (Airport Transfers & Intercity Transit)
 */
export interface Cab {
  id: string;
  vehicleModel: string; // e.g., 'Toyota Innova Crysta', 'Maruti Suzuki Ertiga', 'Hyundai Aura'
  vehicleType: 'Sedan' | 'SUV' | 'Prime Sedan' | 'Electric SUV' | 'Luxury Van';
  category: 'Airport Transfer' | 'Outstation Intercity' | 'Hourly Rental';
  capacityPassengers: number;
  capacityLuggage: number; // Standard suitcases
  fuelType: 'Electric' | 'CNG' | 'Petrol / Diesel';
  driverRating: number;
  operatorName: string;
  
  routeOrigin: string; // e.g., 'Mumbai Airport (BOM)'
  routeDestination: string; // e.g., 'South Mumbai (Colaba / Marine Drive)'
  distanceKm: number;
  estimatedDuration: string; // e.g., '45 mins'

  // Itemized Transparent Pricing
  base_price: number;
  tax: number;
  platform_fee: number; // Includes toll, parking, driver allowance (No surprise cash demands)
  total_price: number; // Guaranteed all-inclusive final price
  
  includesTolls: boolean;
  includesParking: boolean;
  waitingChargePerMin: number;
  freeWaitingMins: number;
  acAvailable: boolean;
  features: string[];
  imageUrl?: string;
}

/**
 * Booking record stored in database and user receipt
 */
export interface Booking {
  id: string;
  user_id: string; // UUID of authenticated or anonymous session
  item_type: ItemType;
  item_id: string;
  title: string;
  subtitle: string;
  
  // Itemized financial ledger
  base_amount: number;
  tax_amount: number;
  platform_fee: number;
  addons_json: SelectedAddon[] | null;
  total_amount: number;

  traveler_name: string;
  traveler_email: string;
  traveler_phone: string;
  special_requests?: string;

  confirmation_code: string; // e.g., 'FW-784920'
  status: BookingStatus;
  
  booking_dates?: {
    startDate: string;
    endDate?: string;
    departureTime?: string;
    pickupTime?: string;
  };
  
  created_at: string;
  updated_at?: string;
}

export interface SelectedAddon {
  id: string;
  name: string;
  price: number;
  quantity?: number;
}

/**
 * User Profile & Preferences (Supabase user_profiles schema)
 */
export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  city?: string;
  avatarUrl?: string;
  preferredCurrency: 'INR' | 'USD' | 'EUR' | 'GBP';
  highContrastMode?: boolean;
  largeTextMode?: boolean;
  marketingOptIn?: boolean;
  rewardPoints?: number;
  lastLoginAt?: string;
  savedTravelers?: Array<{
    id: string;
    fullName: string;
    email?: string;
    gender?: 'M' | 'F' | 'O';
    dateOfBirth?: string;
  }>;
  preferences?: {
    marketingOptIn: boolean; // Explicit opt-in only (no pre-checked boxes)
    transparentPriceDisplay: 'all_inclusive' | 'detailed_itemized';
    ecoFriendlyFilter: boolean;
  };
  createdAt: string;
}

/**
 * Raw Database Representation for public.user_profiles
 */
export interface DbUserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  city: string | null;
  preferred_currency: string;
  high_contrast_mode: boolean;
  large_text_mode: boolean;
  marketing_opt_in: boolean;
  reward_points: number;
  created_at: string;
  last_login_at: string;
}

/**
 * HCI Research Survey & Evaluation Metric Types
 */
export interface HCIEvaluationMetrics {
  dripPricingClarityRating: number; // 1-5 scale (Perceived honesty of pricing)
  perceivedCognitiveLoad: number; // NASA-TLX modified scale
  darkPatternResistanceConfidence: number; // User trust metric
  timeToDecisionMs: number;
  accidentalAddonRate: number; // Farways goal: 0%
}

/**
 * Toast Notification Model (Nielsen's Visibility of System Status heuristic)
 */
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  durationMs?: number;
}

/**
 * Session Recovery Draft Model (Lab 8 Non-destructive session recovery)
 */
export interface SessionDraft {
  id: string;
  url: string;
  timestamp: number;
  itemType?: ItemType;
  itemId?: string;
  title?: string;
  subtitle?: string;
  formData: Record<string, unknown>;
  stepName?: string;
}

