-- ============================================================================
-- FARWAYS TRAVEL PLATFORM - COMMERCIAL PRODUCTION DATABASE SCHEMA & SEED
-- Transparent All-Inclusive Fares, Zero Drip Fees, Zero Clutter
-- IDEMPOTENT SCHEMA: Safe to run multiple times in Supabase SQL Editor
-- 6 Core Tables: stays, flights, trains, cabs, user_profiles, bookings
-- ============================================================================

-- 0. Enable UUID extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- 1. TABLE: STAYS (24 Hotels: 8 Mumbai, 8 Delhi NCR, 8 Goa)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.stays (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tagline TEXT,
    city TEXT NOT NULL,
    location TEXT NOT NULL,
    address TEXT NOT NULL,
    rating NUMERIC(3,2) NOT NULL CHECK (rating >= 1.0 AND rating <= 5.0),
    review_count INTEGER NOT NULL DEFAULT 0,
    star_category INTEGER NOT NULL CHECK (star_category IN (3, 4, 5)),
    property_type TEXT NOT NULL,
    thumbnail TEXT NOT NULL,
    gallery TEXT[] NOT NULL DEFAULT '{}',
    images TEXT[] NOT NULL DEFAULT '{}',
    
    -- Radical Price Transparency (No hidden drip fees)
    base_price NUMERIC(10,2) NOT NULL,
    tax NUMERIC(10,2) NOT NULL,
    platform_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total_price NUMERIC(10,2) NOT NULL,

    room_type TEXT NOT NULL,
    bed_type TEXT NOT NULL,
    max_guests INTEGER NOT NULL DEFAULT 2,
    amenities TEXT[] NOT NULL DEFAULT '{}',
    cancellation_policy JSONB NOT NULL DEFAULT '{"type":"free_cancellation","deadlineHoursBeforeCheckIn":24,"description":"Free cancellation"}'::jsonb,
    check_in_time TEXT NOT NULL DEFAULT '14:00',
    check_out_time TEXT NOT NULL DEFAULT '12:00',
    nearby_attractions TEXT[] NOT NULL DEFAULT '{}',
    featured_badge TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. TABLE: FLIGHTS (8 Strategic Routes: Domestic & International)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.flights (
    id TEXT PRIMARY KEY,
    airline_name TEXT NOT NULL,
    airline_code TEXT NOT NULL,
    flight_number TEXT NOT NULL,
    aircraft TEXT NOT NULL,
    image_url TEXT,
    
    origin_city TEXT NOT NULL,
    origin_airport TEXT NOT NULL,
    origin_code TEXT NOT NULL,
    origin_terminal TEXT NOT NULL,

    destination_city TEXT NOT NULL,
    destination_airport TEXT NOT NULL,
    destination_code TEXT NOT NULL,
    destination_terminal TEXT NOT NULL,

    departure_time TEXT NOT NULL,
    arrival_time TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    duration_formatted TEXT NOT NULL,
    stops INTEGER NOT NULL DEFAULT 0,
    stop_details TEXT,

    cabin_class TEXT NOT NULL DEFAULT 'Economy',
    baggage_cabin_kg INTEGER NOT NULL DEFAULT 7,
    baggage_checkin_kg INTEGER NOT NULL DEFAULT 15,

    -- Radical Price Transparency
    base_price NUMERIC(10,2) NOT NULL,
    tax NUMERIC(10,2) NOT NULL,
    platform_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total_price NUMERIC(10,2) NOT NULL,

    on_time_performance_score INTEGER DEFAULT 90,
    carbon_footprint_kg INTEGER,
    available_addons JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. TABLE: CABS (8 Airport Transfers & Intercity Routes)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cabs (
    id TEXT PRIMARY KEY,
    vehicle_model TEXT NOT NULL,
    vehicle_type TEXT NOT NULL,
    image_url TEXT,
    category TEXT NOT NULL,
    capacity_passengers INTEGER NOT NULL,
    capacity_luggage INTEGER NOT NULL,
    fuel_type TEXT NOT NULL,
    driver_rating NUMERIC(3,2) NOT NULL CHECK (driver_rating >= 1.0 AND driver_rating <= 5.0),
    operator_name TEXT NOT NULL,

    route_origin TEXT NOT NULL,
    route_destination TEXT NOT NULL,
    distance_km NUMERIC(6,1) NOT NULL,
    estimated_duration TEXT NOT NULL,

    -- Radical Price Transparency (Includes tolls, parking, and driver allowances)
    base_price NUMERIC(10,2) NOT NULL,
    tax NUMERIC(10,2) NOT NULL,
    platform_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total_price NUMERIC(10,2) NOT NULL,

    includes_tolls BOOLEAN NOT NULL DEFAULT true,
    includes_parking BOOLEAN NOT NULL DEFAULT true,
    waiting_charge_per_min NUMERIC(5,2) NOT NULL DEFAULT 2.50,
    free_waiting_mins INTEGER NOT NULL DEFAULT 45,
    ac_available BOOLEAN NOT NULL DEFAULT true,
    features TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. TABLE: TRAINS (8 Realistic Indian Railway Routes)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.trains (
    id TEXT PRIMARY KEY,
    train_number TEXT NOT NULL,
    train_name TEXT NOT NULL,
    train_type TEXT NOT NULL,
    image_url TEXT,
    
    origin_station TEXT NOT NULL,
    origin_code TEXT NOT NULL,
    origin_city TEXT NOT NULL,

    destination_station TEXT NOT NULL,
    destination_code TEXT NOT NULL,
    destination_city TEXT NOT NULL,

    departure_time TEXT NOT NULL,
    arrival_time TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    duration_formatted TEXT NOT NULL,
    runs_on_days TEXT[] NOT NULL DEFAULT '{}',

    classes JSONB NOT NULL DEFAULT '[]'::jsonb,
    selected_class TEXT NOT NULL DEFAULT 'CC',

    -- Radical Price Transparency
    base_price NUMERIC(10,2) NOT NULL,
    tax NUMERIC(10,2) NOT NULL,
    platform_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total_price NUMERIC(10,2) NOT NULL,

    on_time_score INTEGER DEFAULT 95,
    catering_included BOOLEAN NOT NULL DEFAULT true,
    pantry_available BOOLEAN NOT NULL DEFAULT true,
    amenities TEXT[] NOT NULL DEFAULT '{}',
    cancellation_policy JSONB NOT NULL DEFAULT '{"deadlineHours":4,"description":"Standard clerkage refund","clerkageFee":65}'::jsonb,
    distance_km INTEGER NOT NULL DEFAULT 500,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 5. TABLE: USER_PROFILES (Persistent User Profiles & Ethical Preferences)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    city TEXT,
    preferred_currency TEXT NOT NULL DEFAULT 'INR',
    high_contrast_mode BOOLEAN NOT NULL DEFAULT false,
    large_text_mode BOOLEAN NOT NULL DEFAULT false,
    marketing_opt_in BOOLEAN NOT NULL DEFAULT false,
    reward_points INTEGER NOT NULL DEFAULT 500,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 6. TABLE: BOOKINGS (Immutable, Transparent Financial Ledger)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('stay', 'flight', 'train', 'cab')),
    item_id TEXT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,

    base_amount NUMERIC(10,2) NOT NULL,
    tax_amount NUMERIC(10,2) NOT NULL,
    platform_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    addons_json JSONB DEFAULT '[]'::jsonb,
    total_amount NUMERIC(10,2) NOT NULL,

    traveler_name TEXT NOT NULL,
    traveler_email TEXT NOT NULL,
    traveler_phone TEXT NOT NULL,
    confirmation_code TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'pending')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- IDEMPOTENT INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_stays_city ON public.stays (city);
CREATE INDEX IF NOT EXISTS idx_stays_price ON public.stays (total_price);
CREATE INDEX IF NOT EXISTS idx_flights_route ON public.flights (origin_city, destination_city);
CREATE INDEX IF NOT EXISTS idx_flights_codes ON public.flights (origin_code, destination_code);
CREATE INDEX IF NOT EXISTS idx_trains_route ON public.trains (origin_code, destination_code);
CREATE INDEX IF NOT EXISTS idx_cabs_routes ON public.cabs (route_origin, route_destination);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON public.bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON public.bookings (traveler_email);
CREATE INDEX IF NOT EXISTS idx_bookings_code ON public.bookings (confirmation_code);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles (email);

-- ============================================================================
-- IDEMPOTENT ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.stays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 1. Public Read on Catalog Tables
DROP POLICY IF EXISTS "Allow public read on stays" ON public.stays;
CREATE POLICY "Allow public read on stays" ON public.stays FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read on flights" ON public.flights;
CREATE POLICY "Allow public read on flights" ON public.flights FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read on trains" ON public.trains;
CREATE POLICY "Allow public read on trains" ON public.trains FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read on cabs" ON public.cabs;
CREATE POLICY "Allow public read on cabs" ON public.cabs FOR SELECT USING (true);

-- 2. Authenticated and Anonymous Access for Bookings
DROP POLICY IF EXISTS "Allow anon and auth insert bookings" ON public.bookings;
CREATE POLICY "Allow anon and auth insert bookings" ON public.bookings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon and auth select bookings" ON public.bookings;
CREATE POLICY "Allow anon and auth select bookings" ON public.bookings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon and auth update bookings" ON public.bookings;
CREATE POLICY "Allow anon and auth update bookings" ON public.bookings FOR UPDATE USING (true);

-- 3. User Profiles Persistence Policies (Public/Auth Read, Insert, Update)
DROP POLICY IF EXISTS "Allow public read on user_profiles" ON public.user_profiles;
CREATE POLICY "Allow public read on user_profiles" ON public.user_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert on user_profiles" ON public.user_profiles;
CREATE POLICY "Allow public insert on user_profiles" ON public.user_profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on user_profiles" ON public.user_profiles;
CREATE POLICY "Allow public update on user_profiles" ON public.user_profiles FOR UPDATE USING (true);

-- ============================================================================
-- SEED DATA: 24 STAYS (8 Mumbai, 8 Delhi NCR, 8 Goa)
-- ============================================================================
INSERT INTO public.stays (
    id, name, tagline, city, location, address, rating, review_count, star_category, 
    property_type, thumbnail, gallery, images, base_price, tax, platform_fee, total_price, 
    room_type, bed_type, max_guests, amenities, cancellation_policy, check_in_time, check_out_time, 
    nearby_attractions, featured_badge
) VALUES
(
    'stay-mum-01',
    'The Taj Mahal Palace',
    'Iconic 1903 waterfront landmark overlooking the Gateway of India',
    'Mumbai',
    'Colaba, South Mumbai',
    'Apollo Bandar, Colaba, Mumbai, Maharashtra 400001',
    4.88, 4210, 5,
    'Heritage Palace',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80'],
    26000.00, 4680.00, 0.00, 30680.00,
    'Luxury Grande City View Room', '1 King Bed', 2,
    ARRAY['Harbor View Pool', 'Heritage Butler Service', 'Jiva Spa', 'Free Wi-Fi (100 Mbps)', '9 Award-winning Restaurants'],
    '{"type":"free_cancellation","deadlineHoursBeforeCheckIn":48,"description":"Full refund up to 48 hours before check-in. No hidden cancellation retention fee."}'::jsonb,
    '14:00', '12:00',
    ARRAY['Gateway of India (0.1 km)', 'Colaba Causeway (0.4 km)', 'Prince of Wales Museum (0.8 km)'],
    'Heritage Landmark'
),
(
    'stay-mum-02',
    'Trident, Nariman Point',
    'Panoramic views of Marine Drive and the Queen''s Necklace',
    'Mumbai',
    'Nariman Point, South Mumbai',
    'CR 2, Nariman Point, Mumbai, Maharashtra 400021',
    4.67, 3120, 5,
    'Hotel',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80'],
    15500.00, 2790.00, 0.00, 18290.00,
    'Premier Ocean View Room', '1 King Bed or 2 Twins', 2,
    ARRAY['Arabian Sea View', 'Outdoor Swimming Pool', '24-hour Fitness Center', 'Trident Spa', 'Valet Parking'],
    '{"type":"free_cancellation","deadlineHoursBeforeCheckIn":24,"description":"Cancel up to 24 hours prior to arrival with 100% refund credited within 3 bank days."}'::jsonb,
    '14:00', '12:00',
    ARRAY['Marine Drive Promenade (0.1 km)', 'NCPA Performing Arts (0.3 km)'],
    'Sea View Promenade'
),
(
    'stay-mum-03',
    'The Oberoi, Mumbai',
    'Refined modern elegance with floor-to-ceiling windows on the Arabian Sea',
    'Mumbai',
    'Nariman Point, South Mumbai',
    'Nariman Point, Mumbai, Maharashtra 400021',
    4.89, 1980, 5,
    'Hotel',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1200&q=80'],
    24000.00, 4320.00, 0.00, 28320.00,
    'Deluxe Ocean View Room', '1 King Bed', 2,
    ARRAY['Floor-to-Ceiling Windows', 'Oberoi Spa & Salon', 'Heated Outdoor Pool', 'Michelin-Caliber Dining'],
    '{"type":"free_cancellation","deadlineHoursBeforeCheckIn":48,"description":"Flexible cancellation until 48 hours prior to check-in."}'::jsonb,
    '14:00', '12:00',
    '{}',
    'Luxury Waterfront'
),
(
    'stay-mum-04',
    'JW Marriott Mumbai Juhu',
    'Beachfront tropical resort situated right along Juhu Beach',
    'Mumbai',
    'Juhu Tara Road, Juhu',
    'Juhu Tara Rd, Uditi Tarang Housing Colony, Juhu, Mumbai 400049',
    4.62, 3840, 5,
    'Resort',
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1200&q=80'],
    18500.00, 3330.00, 0.00, 21830.00,
    'Deluxe Resort View King', '1 King Bed', 3,
    ARRAY['Direct Juhu Beach Access', '3 Outdoor Saltwater Pools', 'Quan Spa', 'Award-Winning Lotus Cafe Buffet'],
    '{"type":"free_cancellation","deadlineHoursBeforeCheckIn":24,"description":"Free cancellation until 1 day before arrival."}'::jsonb,
    '15:00', '12:00',
    '{}',
    'Beachfront Resort'
),
(
    'stay-mum-05',
    'ITC Maratha, Mumbai',
    'Grand Maratha architecture tribute near Chhatrapati Shivaji Maharaj Airport',
    'Mumbai',
    'Sahar, Andheri East',
    'Sahar Village, Andheri East, Mumbai, Maharashtra 400099',
    4.71, 2650, 5,
    'Hotel',
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80'],
    13500.00, 2430.00, 0.00, 15930.00,
    'Executive Club Room', '1 King Bed', 2,
    ARRAY['Complimentary Airport Shuttle', 'Peshawri Dining', 'Kaya Kalp Spa', 'Lush Gazebo Gardens'],
    '{"type":"free_cancellation","deadlineHoursBeforeCheckIn":24,"description":"Zero penalty cancellation up to 24h before stay."}'::jsonb,
    '14:00', '12:00',
    '{}',
    'Airport Proximity'
),
(
    'stay-mum-06',
    'Grand Hyatt Mumbai Hotel & Residences',
    'Multi-dimensional lifestyle complex spread across 12 verdant acres',
    'Mumbai',
    'Santacruz East / BKC',
    'Bandra Kurla Complex Vicinity, Santacruz East, Mumbai 400055',
    4.54, 3410, 5,
    'Hotel',
    'https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=1200&q=80'],
    14200.00, 2556.00, 0.00, 16756.00,
    'Grand Courtyard King', '1 King Bed', 2,
    ARRAY['100+ Art Installations', 'Club Oasis Spa', 'Soma Indian Restaurant', 'Sunken Courtyard Pool'],
    '{"type":"free_cancellation","deadlineHoursBeforeCheckIn":24,"description":"Full refund if cancelled before 24 hours of arrival."}'::jsonb,
    '14:00', '12:00',
    '{}',
    'Art & Lifestyle'
),
(
    'stay-mum-07',
    'citizenM Mumbai Bandra West',
    'Smart luxury boutique stay with app-controlled mood lighting and XL king beds',
    'Mumbai',
    'Bandra West, Mumbai',
    'Off Linking Road, Bandra West, Mumbai, Maharashtra 400050',
    4.61, 1420, 4,
    'Boutique Stay',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80'],
    7800.00, 936.00, 0.00, 8736.00,
    'Smart Citizen XL King Room', '1 XL King Bed', 2,
    ARRAY['Ultra-fast Wi-Fi (300 Mbps)', 'MoodPad Room Controls', 'canteenM 24/7 Bar', 'Rain Shower'],
    '{"type":"free_cancellation","deadlineHoursBeforeCheckIn":24,"description":"Cancel up to 24 hours prior with instant credit reversal."}'::jsonb,
    '14:00', '11:00',
    '{}',
    'Modern Tech Boutique'
),
(
    'stay-mum-08',
    'Bloomrooms @ Link Road',
    'Crisp, signature yellow-and-white minimalist design focusing on restful sleep',
    'Mumbai',
    'Bandra / Khar West',
    'Linking Road, Khar West, Mumbai, Maharashtra 400052',
    4.41, 1890, 3,
    'Hotel',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80'],
    4900.00, 588.00, 0.00, 5488.00,
    'Standard Queen Cloud Bed', '1 Queen Bed', 2,
    ARRAY['Custom CloudBed Mattresses', 'Grohe High-pressure Rain Shower', 'Complimentary High-speed Wi-Fi', 'Fresh Breakfast Cafe'],
    '{"type":"free_cancellation","deadlineHoursBeforeCheckIn":24,"description":"Free cancellation up to 24 hours before check-in time."}'::jsonb,
    '14:00', '11:00',
    '{}',
    'Value & Cleanliness'
),
(
    'stay-del-01',
    'The Imperial, New Delhi',
    'Colonial 1930s heritage property on Janpath amidst 8 lush garden acres',
    'Delhi NCR',
    'Janpath, Connaught Place, New Delhi',
    'Janpath Lane, Connaught Place, New Delhi, Delhi 110001',
    4.86, 3890, 5,
    'Heritage Palace',
    'https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1200&q=80'],
    22000.00, 3960.00, 0.00, 25960.00,
    'Heritage Deco Room', '1 King Bed', 2,
    ARRAY['Historic Art Gallery Corridor', 'Imperial Spa & Outdoor Pool', 'San Gimignano Italian Dining', 'Palatial High Teas'],
    '{"type":"free_cancellation","deadlineHoursBeforeCheckIn":48,"description":"Cancel up to 48 hours prior with zero fees."}'::jsonb,
    '14:00', '12:00',
    '{}',
    'Heritage Landmark'
),
(
    'stay-del-02',
    'The Leela Palace New Delhi',
    'Modern palace inspired by Lutyens architectural grandeur in the Diplomatic Enclave',
    'Delhi NCR',
    'Chanakyapuri, New Delhi',
    'Diplomatic Enclave, Chanakyapuri, New Delhi 110023',
    4.91, 3240, 5,
    'Hotel',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=1200&q=80'],
    27500.00, 4950.00, 0.00, 32450.00,
    'Grand Deluxe King Palace View', '1 King Bed', 2,
    ARRAY['Rooftop Temperature-Controlled Pool', 'ESPA Spa', 'Le Cirque Rooftop Dining', 'Megu Japanese Restaurant'],
    '{"type":"free_cancellation","deadlineHoursBeforeCheckIn":48,"description":"Transparent cancellation with full refund up to 48 hours prior."}'::jsonb,
    '14:00', '12:00',
    '{}',
    'Rooftop Infinity Pool'
),
(
    'stay-del-03',
    'ITC Maurya, A Luxury Collection Hotel',
    'Home of the legendary Dal Bukhara in the Diplomatic Enclave',
    'Delhi NCR',
    'Sardar Patel Marg, Chanakyapuri',
    'Diplomatic Enclave, Sardar Patel Marg, New Delhi 110021',
    4.75, 4620, 5,
    'Hotel',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80'],
    17500.00, 3150.00, 0.00, 20650.00,
    'Executive Club Room', '1 King Bed', 2,
    ARRAY['World-Famous Bukhara Restaurant', 'LEED Platinum Certified Green Hotel', 'Kaya Kalp Spa', 'Outdoor Lagoon Pool'],
    '{"type":"free_cancellation","deadlineHoursBeforeCheckIn":24,"description":"Cancel free of charge until 24 hours prior to check-in."}'::jsonb,
    '14:00', '12:00',
    '{}',
    'LEED Platinum Eco'
),
(
    'stay-del-04',
    'Taj Palace, New Delhi',
    'Nestled in 6 acres of pristine greenery on Sardar Patel Marg',
    'Delhi NCR',
    'Chanakyapuri, New Delhi',
    '2 Sardar Patel Marg, Diplomatic Enclave, New Delhi 110021',
    4.78, 3950, 5,
    'Hotel',
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80'],
    16000.00, 2880.00, 0.00, 18880.00,
    'Superior Forest View King', '1 King Bed', 2,
    ARRAY['Orient Express French Restaurant', 'Jiva Spa & Heated Pool', 'Sprawling Gardens', 'Electric Vehicle Charging'],
    '{"type":"free_cancellation","deadlineHoursBeforeCheckIn":24,"description":"Full refund if cancelled at least 24 hours prior to check-in."}'::jsonb,
    '14:00', '12:00',
    '{}',
    'Garden Sanctuary'
),
(
    'stay-del-05',
    'The Lodhi, New Delhi',
    'Sanctuary of contemporary brutalist architecture with private plunge pools',
    'Delhi NCR',
    'Lodhi Road, Near Golf Course',
    'Lodhi Rd, Cフォー, Institutional Area, New Delhi 110003',
    4.83, 1680, 5,
    'Boutique Stay',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80'],
    25000.00, 4500.00, 0.00, 29500.00,
    'Lodhi Room with Private Balcony Plunge Pool', '1 King Bed', 2,
    ARRAY['Private Balcony Plunge Pool', 'Pilates Studio & Squash Courts', 'Turkish Hammam', 'Indian Accent Collaboration Dining'],
    '{"type":"free_cancellation","deadlineHoursBeforeCheckIn":48,"description":"Free cancellation until 48 hours prior to arrival."}'::jsonb,
    '14:00', '12:00',
    '{}',
    'Private Plunge Pool'
),
(
    'stay-del-06',
    'Radisson Blu Plaza Delhi Airport',
    'Quiet transit luxury 5 minutes from Terminal 3 with soundproof glazing',
    'Delhi NCR',
    'Mahipalpur, Near IGI Airport',
    'National Highway 8, Near IGI Airport, Mahipalpur, New Delhi 110037',
    4.51, 5210, 5,
    'Hotel',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1200&q=80'],
    9200.00, 1656.00, 0.00, 10856.00,
    'Superior Soundproof King', '1 King Bed', 2,
    ARRAY['Double-pane Soundproof Glazing', '24/7 Airport Shuttle', 'The Great Kabab Factory', 'R Spa with Hydrotherapy'],
    '{"type":"free_cancellation","deadlineHoursBeforeCheckIn":24,"description":"Zero fee cancellation up to 24 hours before stay."}'::jsonb,
    '14:00', '12:00',
    '{}',
    'Airport Soundproof'
),
(
    'stay-del-07',
    'The Claridges New Delhi',
    'Classic 1950s British colonial charm on Dr. APJ Abdul Kalam Road',
    'Delhi NCR',
    'Aurangzeb / Kalam Road, Lutyens Delhi',
    '12 Dr APJ Abdul Kalam Rd, Tees January Road Area, New Delhi 110011',
    4.65, 2190, 5,
    'Heritage Palace',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80'],
    13000.00, 2340.00, 0.00, 15340.00,
    'Deluxe Heritage Room', '1 King Bed', 2,
    ARRAY['Outdoor Cabana Pool', 'Dhaba Punjabi Iconic Cuisine', 'Sevilla Spanish Alfresco Restaurant', 'Bakery with Heritage Recipes'],
    '{"type":"free_cancellation","deadlineHoursBeforeCheckIn":24,"description":"Free cancellation up to 24 hours before arrival."}'::jsonb,
    '14:00', '12:00',
    '{}',
    'Alfresco Heritage'
),
(
    'stay-del-08',
    'Bloomrooms @ Janpath',
    'Bright ergonomic design 500 meters from Connaught Place Metro',
    'Delhi NCR',
    'Janpath, Connaught Place',
    '1 Janpath Lane, Connaught Place, New Delhi 110001',
    4.43, 2340, 3,
    'Hotel',
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=1200&q=80'],
    4500.00, 540.00, 0.00, 5040.00,
    'Value Queen Room', '1 Queen Bed', 2,
    ARRAY['Custom Ergonomic Mattress', 'High Pressure Power Showers', 'Janpath Metro Station Proximity', 'Free High Speed Wi-Fi'],
    '{"type":"free_cancellation","deadlineHoursBeforeCheckIn":24,"description":"Cancel with full refund up to 24 hours prior to check-in."}'::jsonb,
    '14:00', '11:00',
    '{}',
    'Metro Adjacent'
),
(
    'stay-goa-01',
    'Taj Exotica Resort & Spa, Goa',
    'Mediterranean-inspired haven across 56 manicured acres overlooking Benaulim Beach',
    'Goa',
    'Benaulim, South Goa',
    'Calwaddo, Benaulim, Goa 403716',
    4.9, 3670, 5,
    'Resort',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80'],
    24000.00, 4320.00, 0.00, 28320.00,
    'Premium Sea View Villa Room', '1 King Bed', 3,
    ARRAY['Private Beachfront Access', '9-Hole Executive Golf Course', 'Jiva Ayurvedic Spa', 'Olympic-size Swimming Pool'],
    '{"type":"free_cancellation","deadlineHoursBeforeCheckIn":48,"description":"Full refund on cancellation up to 48 hours prior to check-in date."}'::jsonb,
    '15:00', '12:00',
    '{}',
    'Private Benaulim Beach'
),
(
    'stay-goa-02',
    'W Goa',
    'Vibrant modern luxury perched beneath Chapora Fort overlooking Vagator Beach',
    'Goa',
    'Vagator Beach, North Goa',
    'Vagator Beach, Bardez, Goa 403509',
    4.72, 2940, 5,
    'Resort',
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80'],
    21500.00, 3870.00, 0.00, 25370.00,
    'Wonderful Garden View Room with Balcony', '1 King Bed', 2,
    ARRAY['Rock Pool Sunset Lounge', 'AWAY Spa with Vitality Pool', 'FIT Fitness Center', 'Direct Vagator Beach Access'],
    '{"type":"free_cancellation","deadlineHoursBeforeCheckIn":48,"description":"No cancellation penalties when cancelled 48h before check-in."}'::jsonb,
    '15:00', '12:00',
    '{}',
    'Sunset Rock Pool'
),
(
    'stay-goa-03',
    'The Leela Goa',
    'Portuguese-Goan palace set amidst 75 acres of lagoons and Mobor Beach',
    'Goa',
    'Cavelossim, Mobor Beach, South Goa',
    'Mobor, Cavelossim, Goa 403731',
    4.88, 3810, 5,
    'Resort',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1200&q=80'],
    23500.00, 4230.00, 0.00, 27730.00,
    'Lagoon Terrace King Room', '1 King Bed', 2,
    ARRAY['12-Hole Golf Course', 'Private Mobor Beach Pavilion', 'Freshwater Lagoons', 'Ayurvedic Spa Sanctuary'],
    '{"type":"free_cancellation","deadlineHoursBeforeCheckIn":48,"description":"100% refund credited within 3 bank days for cancellations up to 48 hours before arrival."}'::jsonb,
    '14:00', '12:00',
    '{}',
    'Lagoon & Beach Sanctuary'
),
(
    'stay-goa-04',
    'Alila Diwa Goa by Hyatt',
    'Eco-conscious sanctuary amidst emerald paddy fields with infinity edge pool',
    'Goa',
    'Majorda, South Goa',
    '48/10, Adao Waddo, Majorda, Goa 403713',
    4.76, 2210, 5,
    'Resort',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1200&q=80'],
    15000.00, 2700.00, 0.00, 17700.00,
    'Diwa Club Paddy View King', '1 King Bed', 2,
    ARRAY['Paddy Field Infinity Pool', 'Spa Alila Sustainable Wellness', 'Majorda Beach Shuttle', 'Mini Bar Included'],
    '{"type":"free_cancellation","deadlineHoursBeforeCheckIn":24,"description":"Cancel up to 24 hours prior to arrival with no penalty."}'::jsonb,
    '15:00', '12:00',
    '{}',
    'Paddy Field View'
),
(
    'stay-goa-05',
    'Ahilya By The Sea',
    'Discreet boutique haven of 9 rooms set in tree-shaded gardens on Dolphin Bay',
    'Goa',
    'Nerul, Dolphin Bay, North Goa',
    'Coco Beach, Nerul, Bardez, Goa 403109',
    4.93, 820, 5,
    'Boutique Stay',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=1200&q=80'],
    28000.00, 5040.00, 0.00, 33040.00,
    'Falcon Villa Sea View Suite', '1 Four-Poster King Bed', 2,
    ARRAY['2 Freshwater Infinity Pools', 'Dolphin Sightings from Deck', 'Private Chef Custom Menus', 'Balinese Banyan Tree Massage Pavilion'],
    '{"type":"free_cancellation","deadlineHoursBeforeCheckIn":72,"description":"Full refund for cancellations 72 hours before arrival."}'::jsonb,
    '14:00', '11:00',
    '{}',
    'Dolphin Bay Exclusive'
),
(
    'stay-goa-06',
    'ITC Grand Goa, A Luxury Collection Resort & Spa',
    'Indo-Portuguese architecture nestled amongst 45 acres along Arossim Beach',
    'Goa',
    'Arossim Beach, South Goa',
    'Arossim Beach Rd, Cansaulim, Goa 403712',
    4.79, 2750, 5,
    'Resort',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80'],
    19000.00, 3420.00, 0.00, 22420.00,
    'Garden View Room with Outdoor Shower', '1 King Bed', 2,
    ARRAY['Multi-level Swimming Pool with Waterslides', 'Direct Arossim Beach Access', 'Kaya Kalp Spa', 'Ottimo Italian Trattoria'],
    '{"type":"free_cancellation","deadlineHoursBeforeCheckIn":24,"description":"Cancel up to 24 hours prior with 100% refund."}'::jsonb,
    '15:00', '12:00',
    '{}',
    'Multi-level Lagoon Pool'
),
(
    'stay-goa-07',
    'The Postcard Moira',
    'Restored 214-year-old modernist mansion tucked in the historic village of Moira',
    'Goa',
    'Moira Village, North Goa',
    'House No 346, Moira, Bardez, Goa 403507',
    4.87, 650, 5,
    'Heritage Palace',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80'],
    16500.00, 2970.00, 0.00, 19470.00,
    'Moira Heritage Suite', '1 King Bed', 2,
    ARRAY['Anytime Check-in & Check-out (24h stay)', 'Artisanal Goan Tasting Menus', 'Tropical Courtyard Pool', 'Ayurvedic Consultations'],
    '{"type":"free_cancellation","deadlineHoursBeforeCheckIn":48,"description":"Transparent 48-hour free cancellation with zero retainers."}'::jsonb,
    'Flexible (Anytime)', 'Flexible (24h stay)',
    '{}',
    'Anytime 24h Check-in'
),
(
    'stay-goa-08',
    'Casa Britona',
    'Charming 300-year-old riverfront heritage home along Mandovi backwaters',
    'Goa',
    'Salvador do Mundo, Britona',
    'Near Church, Britona, Salvador do Mundo, Goa 403101',
    4.56, 940, 4,
    'Boutique Stay',
    'https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80'],
    6500.00, 780.00, 0.00, 7280.00,
    'Mandovi River View Suite', '1 Queen Bed', 2,
    ARRAY['Private Riverside Wooden Deck', 'Kayaking in Backwaters', 'Plunge Pool', 'Authentic Goan Saraswat Kitchen'],
    '{"type":"free_cancellation","deadlineHoursBeforeCheckIn":24,"description":"Cancel up to 24 hours prior with full refund."}'::jsonb,
    '14:00', '11:00',
    '{}',
    'Riverside Backwaters'
)
ON CONFLICT (id) DO UPDATE SET
  gallery = EXCLUDED.gallery,
  thumbnail = EXCLUDED.thumbnail,
  total_price = EXCLUDED.total_price;

-- ============================================================================
-- SEED DATA: 8 FLIGHTS (IndiGo, Air India, Akasa, Vistara, Emirates, Singapore Airlines, Qatar, SpiceJet)
-- ============================================================================
INSERT INTO public.flights (
    id, airline_name, airline_code, flight_number, aircraft, image_url,
    origin_city, origin_airport, origin_code, origin_terminal,
    destination_city, destination_airport, destination_code, destination_terminal,
    departure_time, arrival_time, duration_minutes, duration_formatted, stops, stop_details,
    cabin_class, baggage_cabin_kg, baggage_checkin_kg,
    base_price, tax, platform_fee, total_price,
    on_time_performance_score, carbon_footprint_kg, available_addons
) VALUES
(
    'flt-01', 'IndiGo', '6E', '6E 2045', 'Airbus A321neo', 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80',
    'Mumbai', 'Chhatrapati Shivaji Maharaj International', 'BOM', 'Terminal 2',
    'Delhi', 'Indira Gandhi International', 'DEL', 'Terminal 2',
    '06:00', '08:10', 130, '2h 10m', 0, NULL,
    'Economy', 7, 15,
    4400.00, 792.00, 0.00, 5192.00,
    94, 112,
    '[{"id":"addon-seat-6e","name":"Standard Window/Aisle Seat Selection","description":"Choose your preferred standard seat (strictly opt-in, never auto-selected)","category":"seat","price":250,"defaultSelected":false,"transparentTerms":"Refundable if flight is cancelled or rescheduled by carrier."},{"id":"addon-meal-6e","name":"Fresh Chef Sandwich & Beverage","description":"Choice of Paneer Tikka or Smoked Chicken sandwich with cold drink","category":"meal","price":350,"defaultSelected":false,"transparentTerms":"Freshly boarded on the morning of departure."},{"id":"addon-bag-6e","name":"Extra 5kg Check-in Baggage","description":"Additional 5 kg allowance beyond standard 15 kg","category":"baggage","price":1800,"defaultSelected":false,"transparentTerms":"Valid across your entire itinerary."}]'::jsonb
),
(
    'flt-02', 'Air India', 'AI', 'AI 888', 'Boeing 787-8 Dreamliner', 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=800&q=80',
    'Delhi', 'Indira Gandhi International', 'DEL', 'Terminal 3',
    'Mumbai', 'Chhatrapati Shivaji Maharaj International', 'BOM', 'Terminal 2',
    '09:30', '11:45', 135, '2h 15m', 0, NULL,
    'Economy', 7, 20,
    5100.00, 918.00, 0.00, 6018.00,
    89, 105,
    '[{"id":"addon-insurance-ai","name":"Comprehensive Trip Cancellation Shield","description":"Covers medical emergency cancellation and bag delay up to INR 25,000","category":"insurance","price":399,"defaultSelected":false,"transparentTerms":"Underwritten by Tata AIG. Zero automatic renewal or hidden deductibles."}]'::jsonb
),
(
    'flt-03', 'Akasa Air', 'QP', 'QP 1374', 'Boeing 737 MAX 8', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
    'Mumbai', 'Chhatrapati Shivaji Maharaj International', 'BOM', 'Terminal 1',
    'Goa', 'Dabolim Airport', 'GOI', 'Terminal 1',
    '11:15', '12:30', 75, '1h 15m', 0, NULL,
    'Economy', 7, 15,
    3200.00, 576.00, 0.00, 3776.00,
    92, 68,
    '[{"id":"addon-cafe-qp","name":"Cafe Akasa Gourmet Meal Box","description":"Multi-grain roll, artisanal cookie, and choice of pressed juice","category":"meal","price":380,"defaultSelected":false,"transparentTerms":"Curated by master culinary chefs."}]'::jsonb
),
(
    'flt-04', 'Vistara', 'UK', 'UK 819', 'Airbus A320neo', 'https://images.unsplash.com/photo-1520437358207-323b43b50729?auto=format&fit=crop&w=800&q=80',
    'Delhi', 'Indira Gandhi International', 'DEL', 'Terminal 3',
    'Goa', 'Dabolim Airport', 'GOI', 'Terminal 1',
    '13:40', '16:15', 155, '2h 35m', 0, NULL,
    'Economy', 7, 15,
    5800.00, 1044.00, 0.00, 6844.00,
    93, 124,
    '[{"id":"addon-legroom-uk","name":"Extra Legroom Emergency Exit Row","description":"Up to 34 inches seat pitch for superior comfort","category":"seat","price":800,"defaultSelected":false,"transparentTerms":"Must meet standard DGCA civil aviation safety requirements."}]'::jsonb
),
(
    'flt-05', 'Emirates', 'EK', 'EK 501', 'Boeing 777-300ER', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    'Mumbai', 'Chhatrapati Shivaji Maharaj International', 'BOM', 'Terminal 2',
    'Dubai', 'Dubai International', 'DXB', 'Terminal 3',
    '04:30', '06:30', 210, '3h 30m', 0, NULL,
    'Economy', 7, 30,
    18500.00, 3330.00, 0.00, 21830.00,
    96, 210,
    '[{"id":"addon-lounge-ek","name":"Emirates Business Lounge Pass DXB","description":"3 hours access to dining, showers, and quiet suites in Dubai Terminal 3","category":"amenity","price":4500,"defaultSelected":false,"transparentTerms":"Valid on day of arrival at DXB."}]'::jsonb
),
(
    'flt-06', 'Singapore Airlines', 'SQ', 'SQ 403', 'Airbus A350-900', 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80',
    'Delhi', 'Indira Gandhi International', 'DEL', 'Terminal 3',
    'Singapore', 'Singapore Changi Airport', 'SIN', 'Terminal 2',
    '21:55', '06:05', 340, '5h 40m', 0, NULL,
    'Economy', 7, 25,
    22000.00, 3960.00, 0.00, 25960.00,
    97, 285,
    '[{"id":"addon-carbon-sq","name":"Verified High-Integrity Carbon Offset","description":"Neutralize 285 kg of flight emissions via Gold Standard reforestation","category":"cancellation_waiver","price":420,"defaultSelected":false,"transparentTerms":"Third-party audited certification provided with confirmation email."}]'::jsonb
),
(
    'flt-07', 'Qatar Airways', 'QR', 'QR 557', 'Boeing 787-9 Dreamliner', 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80',
    'Mumbai', 'Chhatrapati Shivaji Maharaj International', 'BOM', 'Terminal 2',
    'Doha', 'Hamad International Airport', 'DOH', 'Terminal 1',
    '04:10', '05:30', 230, '3h 50m', 0, NULL,
    'Economy', 7, 30,
    19500.00, 3510.00, 0.00, 23010.00,
    95, 220,
    '[]'::jsonb
),
(
    'flt-08', 'SpiceJet', 'SG', 'SG 282', 'Boeing 737-800', 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=800&q=80',
    'Delhi', 'Indira Gandhi International', 'DEL', 'Terminal 1',
    'Mumbai', 'Chhatrapati Shivaji Maharaj International', 'BOM', 'Terminal 1',
    '17:20', '19:40', 140, '2h 20m', 0, NULL,
    'Economy', 7, 15,
    3900.00, 702.00, 0.00, 4602.00,
    84, 118,
    '[{"id":"addon-priority-sg","name":"SpiceMax Priority Check-in & Boarding","description":"Skip standard queues with dedicated counter & first baggage offloading","category":"amenity","price":499,"defaultSelected":false,"transparentTerms":"Valid at Delhi T1 and Mumbai T1."}]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  total_price = EXCLUDED.total_price;

-- ============================================================================
-- SEED DATA: 8 CABS (Toyota Innova Hycross, Mercedes E-Class, BYD e6, Maruti Dzire, Force Urbania)
-- ============================================================================
INSERT INTO public.cabs (
    id, vehicle_model, vehicle_type, image_url, category,
    capacity_passengers, capacity_luggage, fuel_type, driver_rating, operator_name,
    route_origin, route_destination, distance_km, estimated_duration,
    base_price, tax, platform_fee, total_price,
    includes_tolls, includes_parking, waiting_charge_per_min, free_waiting_mins, ac_available, features
) VALUES
(
    'cab-01', 'Hyundai Aura / Maruti Dzire', 'Sedan', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80', 'Airport Transfer',
    4, 2, 'CNG', 4.88, 'Farways Verified Fleet Mumbai',
    'Mumbai Airport (BOM T2)', 'South Mumbai (Colaba / Nariman Point / Fort)', 26.5, '45-60 mins',
    950.00, 48.00, 0.00, 998.00,
    true, true, 2.5, 45, true,
    ARRAY['Bandra-Worli Sea Link Toll Included', '45 min Airport Flight Delay Buffer', 'Clean Sanitized Cabin', 'No Cash Surcharges']
),
(
    'cab-02', 'Maruti Suzuki Ertiga XL6', 'SUV', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80', 'Airport Transfer',
    6, 4, 'CNG', 4.84, 'Farways Verified Fleet Mumbai',
    'Mumbai Airport (BOM T2)', 'Navi Mumbai (Vashi / Belapur / Kharghar)', 31, '50-65 mins',
    1350.00, 68.00, 0.00, 1418.00,
    true, true, 3, 45, true,
    ARRAY['Atal Setu / Eastern Freeway Toll Included', 'Spacious 6-Passenger Seating', 'Dual AC blowers', 'Child-Friendly Boot Space']
),
(
    'cab-03', 'Honda City / Maruti Ciaz', 'Prime Sedan', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80', 'Outstation Intercity',
    4, 3, 'Petrol / Diesel', 4.92, 'Farways Intercity Connect',
    'Mumbai (Bandra / Airport)', 'Pune (Hinjewadi / Shivaji Nagar / Koregaon Park)', 154, '3h 15m',
    3400.00, 170.00, 0.00, 3570.00,
    true, true, 3, 30, true,
    ARRAY['Mumbai-Pune Expressway Toll Included', 'Doorstep Pickup & Drop', 'Verified Highway Driver', 'Zero Return Fare Surcharge']
),
(
    'cab-04', 'Hyundai Aura Clean Sedan', 'Sedan', 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80', 'Airport Transfer',
    4, 2, 'CNG', 4.82, 'Farways Verified Fleet Delhi',
    'Delhi Airport (DEL T3)', 'Central Delhi (Connaught Place / Janpath)', 18.5, '35-45 mins',
    780.00, 39.00, 0.00, 819.00,
    true, true, 2.5, 45, true,
    ARRAY['Airport Parking & MCD Toll Included', 'Dedicated T3 Pickup Bay Meet', 'Real-time Flight Tracking', 'Guaranteed AC On']
),
(
    'cab-05', 'Tata Nexon EV / MG ZS EV', 'Electric SUV', 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80', 'Airport Transfer',
    4, 3, 'Electric', 4.95, 'Farways Green Fleet Delhi NCR',
    'Delhi Airport (DEL T3)', 'Cyber City & Golf Course Road (Gurgaon)', 16, '25-35 mins',
    890.00, 45.00, 0.00, 935.00,
    true, true, 2.5, 45, true,
    ARRAY['100% Zero Emission Transit', 'Whisper-quiet Electric Ride', 'Delhi-Gurgaon Expressway Tolls Covered', 'Eco-score Badge']
),
(
    'cab-06', 'Toyota Innova Crysta', 'Luxury Van', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80', 'Outstation Intercity',
    6, 5, 'Petrol / Diesel', 4.94, 'Farways Heritage Intercity',
    'Delhi NCR (Any address in Delhi / Noida / Gurgaon)', 'Agra (Taj Mahal / Fatehabad Road)', 215, '3h 30m',
    5200.00, 260.00, 0.00, 5460.00,
    true, true, 3.5, 60, true,
    ARRAY['Yamuna Expressway FastTag Tolls Included', 'UP State Border Tax Included', 'Captain Bucket Seats', 'Experienced Tour Driver']
),
(
    'cab-07', 'Toyota Innova Crysta', 'SUV', 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=800&q=80', 'Airport Transfer',
    6, 5, 'Petrol / Diesel', 4.89, 'Farways Coast Fleet Goa',
    'Goa Dabolim Airport (GOI)', 'North Goa (Calangute / Baga / Anjuna / Vagator)', 42, '1h 10m',
    1850.00, 93.00, 0.00, 1943.00,
    true, true, 3, 45, true,
    ARRAY['Zuari New Bridge Route', 'Airport Parking & All Bridge Tolls Included', 'Zero Bargaining / Pre-fixed Fair Fare', 'Luggage Assistance']
),
(
    'cab-08', 'Maruti Suzuki Dzire', 'Sedan', 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?auto=format&fit=crop&w=800&q=80', 'Airport Transfer',
    4, 2, 'Petrol / Diesel', 4.83, 'Farways Coast Fleet Goa',
    'Goa Mopa Airport (GOX)', 'Central & Coastal Goa (Panaji / Candolim)', 34, '55 mins',
    1450.00, 72.00, 0.00, 1522.00,
    true, true, 2.5, 45, true,
    ARRAY['Mopa Airport Toll Included', 'Panaji Bridge Crossings Included', 'Punctual AC Ride', 'Direct Beachfront Hotel Drop']
)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  total_price = EXCLUDED.total_price;

-- ============================================================================
-- SEED DATA: 8 TRAINS (Vande Bharat, Tejas Rajdhani, Gatimaan Express)
-- ============================================================================
INSERT INTO public.trains (
    id, train_number, train_name, train_type, image_url,
    origin_station, origin_code, origin_city,
    destination_station, destination_code, destination_city,
    departure_time, arrival_time, duration_minutes, duration_formatted, runs_on_days,
    classes, selected_class,
    base_price, tax, platform_fee, total_price,
    on_time_score, catering_included, pantry_available, amenities, cancellation_policy, distance_km
) VALUES
(
    'trn-01', '22229', 'Mumbai CSMT - Madgaon Vande Bharat Express', 'Vande Bharat Express', 'https://images.unsplash.com/photo-1532105956626-9569c03602f6?auto=format&fit=crop&w=800&q=80',
    'Chhatrapati Shivaji Maharaj Terminus', 'CSMT', 'Mumbai',
    'Madgaon Junction', 'MAO', 'Goa',
    '05:25', '13:10', 465, '7h 45m',
    ARRAY['Mon', 'Tue', 'Wed', 'Fri', 'Sat', 'Sun'],
    '[{"classCode":"CC","className":"AC Chair Car","status":"AVAILABLE-68","seatsAvailable":68,"fare":1815,"basePrice":1615,"superfastGst":200,"confirmationProbability":100},{"classCode":"EC","className":"Executive Chair Car","status":"AVAILABLE-24","seatsAvailable":24,"fare":3160,"basePrice":2820,"superfastGst":340,"confirmationProbability":100}]'::jsonb, 'CC',
    1615.00, 200.00, 0.00, 1815.00,
    96, true, true,
    ARRAY['180° Rotating Seats (EC)', 'Panoramic Sealed Windows', 'Free On-board Wi-Fi Infotainment', 'Bio-Vacuum Toilets', 'Hot Gourmet Breakfast & Lunch'],
    '{"deadlineHours":4,"description":"Full refund minus standard IRCTC clerkage fee (₹65) up to 4h before chart preparation.","clerkageFee":65}'::jsonb,
    586
),
(
    'trn-02', '12951', 'Mumbai Central - New Delhi Tejas Rajdhani Express', 'Tejas Rajdhani Express', 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80',
    'Mumbai Central', 'MMCT', 'Mumbai',
    'New Delhi Railway Station', 'NDLS', 'Delhi',
    '17:00', '08:32', 932, '15h 32m',
    ARRAY['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    '[{"classCode":"3A","className":"AC 3-Tier","status":"AVAILABLE-92","seatsAvailable":92,"fare":2165,"basePrice":1980,"superfastGst":185,"confirmationProbability":100},{"classCode":"2A","className":"AC 2-Tier","status":"AVAILABLE-34","seatsAvailable":34,"fare":2995,"basePrice":2750,"superfastGst":245,"confirmationProbability":100},{"classCode":"1A","className":"First AC (Coupe)","status":"AVAILABLE-8","seatsAvailable":8,"fare":4875,"basePrice":4490,"superfastGst":385,"confirmationProbability":100}]'::jsonb, '3A',
    1980.00, 185.00, 0.00, 2165.00,
    94, true, true,
    ARRAY['Automatic Plug Doors', 'Air-Conditioned Sleeper Coupes', 'Gourmet Multi-Course Dinner & Breakfast', 'Reading Lights & USB Ports', 'CCTV Security'],
    '{"deadlineHours":4,"description":"Zero penalty refund up to 4 hours before chart prep with immediate source reversal.","clerkageFee":65}'::jsonb,
    1384
),
(
    'trn-03', '12050', 'Hazrat Nizamuddin - Agra Cantt Gatimaan Express', 'Gatimaan Express', 'https://images.unsplash.com/photo-1515165562839-978bbcf18277?auto=format&fit=crop&w=800&q=80',
    'Hazrat Nizamuddin', 'NZM', 'Delhi',
    'Agra Cantt', 'AGC', 'Agra',
    '08:10', '09:50', 100, '1h 40m',
    ARRAY['Mon', 'Tue', 'Wed', 'Thu', 'Sat', 'Sun'],
    '[{"classCode":"CC","className":"AC Chair Car","status":"AVAILABLE-114","seatsAvailable":114,"fare":860,"basePrice":775,"superfastGst":85,"confirmationProbability":100},{"classCode":"EC","className":"Executive Chair Car","status":"AVAILABLE-18","seatsAvailable":18,"fare":1500,"basePrice":1360,"superfastGst":140,"confirmationProbability":100}]'::jsonb, 'CC',
    775.00, 85.00, 0.00, 860.00,
    98, true, true,
    ARRAY['160 km/h High-Speed Travel', 'Hostess Service on-board', 'Complimentary Continental & Indian Breakfast', 'Spacious Legroom'],
    '{"deadlineHours":4,"description":"Cancel up to 4 hours before departure with full refund.","clerkageFee":65}'::jsonb,
    188
),
(
    'trn-04', '82902', 'Ahmedabad - Mumbai Central Tejas Express', 'Tejas Express', 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
    'Ahmedabad Junction', 'ADI', 'Ahmedabad',
    'Mumbai Central', 'MMCT', 'Mumbai',
    '06:40', '13:05', 385, '6h 25m',
    ARRAY['Mon', 'Tue', 'Wed', 'Fri', 'Sat', 'Sun'],
    '[{"classCode":"CC","className":"AC Chair Car","status":"AVAILABLE-56","seatsAvailable":56,"fare":1280,"basePrice":1150,"superfastGst":130,"confirmationProbability":100},{"classCode":"EC","className":"Executive Chair Car","status":"AVAILABLE-22","seatsAvailable":22,"fare":2280,"basePrice":2050,"superfastGst":230,"confirmationProbability":100}]'::jsonb, 'CC',
    1150.00, 130.00, 0.00, 1280.00,
    95, true, true,
    ARRAY['Corporate IRCTC Lounge Access', 'LED Passenger Information Screens', 'On-board Infotainment', 'Modular Toilets'],
    '{"deadlineHours":4,"description":"Direct zero-markup cancellation refund.","clerkageFee":65}'::jsonb,
    493
),
(
    'trn-05', '22436', 'New Delhi - Varanasi Vande Bharat Express', 'Vande Bharat Express', 'https://images.unsplash.com/photo-1532105956626-9569c03602f6?auto=format&fit=crop&w=800&q=80',
    'New Delhi Railway Station', 'NDLS', 'Delhi',
    'Varanasi Junction', 'BSB', 'Varanasi',
    '06:00', '14:00', 480, '8h 00m',
    ARRAY['Tue', 'Wed', 'Fri', 'Sat', 'Sun'],
    '[{"classCode":"CC","className":"AC Chair Car","status":"RAC-6","seatsAvailable":6,"fare":1750,"basePrice":1565,"superfastGst":185,"confirmationProbability":92},{"classCode":"EC","className":"Executive Chair Car","status":"AVAILABLE-14","seatsAvailable":14,"fare":3310,"basePrice":2980,"superfastGst":330,"confirmationProbability":100}]'::jsonb, 'CC',
    1565.00, 185.00, 0.00, 1750.00,
    97, true, true,
    ARRAY['Direct High-Speed Connectivity', 'Hot Chef Meals', 'Touch-free Washroom Fittings', 'Individual Climate Controls'],
    '{"deadlineHours":4,"description":"Transparent refund credited within 3 bank days.","clerkageFee":65}'::jsonb,
    759
),
(
    'trn-06', '12051', 'Mumbai CSMT - Madgaon Jan Shatabdi Express', 'Jan Shatabdi', 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80',
    'Chhatrapati Shivaji Maharaj Terminus', 'CSMT', 'Mumbai',
    'Madgaon Junction', 'MAO', 'Goa',
    '05:10', '14:30', 560, '9h 20m',
    ARRAY['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    '[{"classCode":"CC","className":"AC Chair Car","status":"AVAILABLE-48","seatsAvailable":48,"fare":945,"basePrice":845,"superfastGst":100,"confirmationProbability":100},{"classCode":"2S","className":"Second Seating","status":"AVAILABLE-120","seatsAvailable":120,"fare":315,"basePrice":285,"superfastGst":30,"confirmationProbability":100}]'::jsonb, 'CC',
    845.00, 100.00, 0.00, 945.00,
    91, false, true,
    ARRAY['Scenic Konkan Railway Vista', 'Economical Fast Transit', 'On-board Pantry Snacks', 'Spacious Seating'],
    '{"deadlineHours":4,"description":"Full refund minus standard railway clerkage charge.","clerkageFee":65}'::jsonb,
    581
),
(
    'trn-07', '12953', 'Mumbai Central - Hazrat Nizamuddin August Kranti Rajdhani', 'Tejas Rajdhani Express', 'https://images.unsplash.com/photo-1515165562839-978bbcf18277?auto=format&fit=crop&w=800&q=80',
    'Mumbai Central', 'MMCT', 'Mumbai',
    'Hazrat Nizamuddin', 'NZM', 'Delhi',
    '17:10', '10:55', 1065, '17h 45m',
    ARRAY['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    '[{"classCode":"3A","className":"AC 3-Tier","status":"AVAILABLE-64","seatsAvailable":64,"fare":2095,"basePrice":1915,"superfastGst":180,"confirmationProbability":100},{"classCode":"2A","className":"AC 2-Tier","status":"RAC-8","seatsAvailable":8,"fare":2890,"basePrice":2650,"superfastGst":240,"confirmationProbability":95},{"classCode":"1A","className":"First AC (Coupe)","status":"AVAILABLE-12","seatsAvailable":12,"fare":4750,"basePrice":4370,"superfastGst":380,"confirmationProbability":100}]'::jsonb, '3A',
    1915.00, 180.00, 0.00, 2095.00,
    93, true, true,
    ARRAY['Overnight Superfast Express', 'Clean Linens & Sanitized Bedding', 'Complete Dining Service', 'Security Escort'],
    '{"deadlineHours":4,"description":"Zero penalty refund up to 4h before departure.","clerkageFee":65}'::jsonb,
    1377
),
(
    'trn-08', '20645', 'Madgaon (Goa) - Mangaluru Central Vande Bharat Express', 'Vande Bharat Express', 'https://images.unsplash.com/photo-1532105956626-9569c03602f6?auto=format&fit=crop&w=800&q=80',
    'Madgaon Junction', 'MAO', 'Goa',
    'Mangaluru Central', 'MAQ', 'Mangaluru',
    '18:10', '22:45', 275, '4h 35m',
    ARRAY['Mon', 'Tue', 'Wed', 'Fri', 'Sat', 'Sun'],
    '[{"classCode":"CC","className":"AC Chair Car","status":"AVAILABLE-88","seatsAvailable":88,"fare":1055,"basePrice":945,"superfastGst":110,"confirmationProbability":100},{"classCode":"EC","className":"Executive Chair Car","status":"AVAILABLE-32","seatsAvailable":32,"fare":1960,"basePrice":1760,"superfastGst":200,"confirmationProbability":100}]'::jsonb, 'CC',
    945.00, 110.00, 0.00, 1055.00,
    99, true, true,
    ARRAY['Scenic Konkan Coastal Track', 'Automatic Inter-car Doors', 'Hot Evening High-Tea & Dinner', 'Aerodynamic Nose Cone'],
    '{"deadlineHours":4,"description":"Cancel up to 4 hours prior with instant full refund.","clerkageFee":65}'::jsonb,
    319
)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  total_price = EXCLUDED.total_price;

-- ============================================================================
-- SEED DATA: USER PROFILES (Evaluator & Demo Personas)
-- ============================================================================
INSERT INTO public.user_profiles (
    id, email, full_name, phone, city, preferred_currency, high_contrast_mode, large_text_mode, marketing_opt_in, reward_points
) VALUES
('usr-eval-01', 'vikram.malhotra@farways.in', 'Vikram Malhotra (Frequent Traveler)', '9820198201', 'Mumbai', 'INR', false, false, false, 1500),
('usr-arjun-01', 'arjun.sharma@example.com', 'Arjun Sharma', '9820123456', 'Mumbai', 'INR', false, false, false, 500),
('usr-priya-02', 'priya.patel@example.com', 'Priya Patel', '9876543210', 'Delhi NCR', 'INR', false, false, false, 750)
ON CONFLICT (email) DO UPDATE SET
  reward_points = EXCLUDED.reward_points,
  city = EXCLUDED.city;
