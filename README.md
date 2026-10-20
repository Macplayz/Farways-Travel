<div align="center">

# Farways | Ethical Travel Booking Platform

**An IEEE HCI Research Platform benchmarking commercial OTA (Online Travel Agency) usability by eliminating dark patterns, drip pricing, and visual clutter.**

[![Next.js](https://img.shields.io/badge/Next.js-14_(App_Router)-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_%26_Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployment-black?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

</div>

---

## 📌 The Mission (HCI Context)

Commercial Online Travel Agencies (OTAs) such as **MakeMyTrip**, **Booking.com**, and **Expedia** routinely employ manipulative design heuristics—commonly termed **dark patterns**—to maximize cart conversion and inflate checkout totals. These tactics induce cognitive fatigue through drip pricing (withholding taxes, convenience fees, and carrier surcharges until checkout), pre-selected ancillary add-ons, artificial countdown timers, and ambiguous cancellation policies.

**Farways** is an experimental human-computer interaction (HCI) research artifact designed to benchmark user trust, decision latency, and post-booking confidence against conventional commercial OTAs. Built on radical transparency and cognitive clarity, Farways enforces **four core design pillars**:

* 🛡️ **Zero Drip Pricing:** 100% upfront itemization. The price displayed on discovery cards is the exact, all-inclusive figure charged at checkout (GST, airport charges, and platform fees included).
* ⚖️ **Neutral Opt-Ins:** Zero pre-checked baggage, travel insurance, or charity donation checkboxes. Every ancillary selection defaults to unselected with equal visual weighting.
* 🧘 **Zero Manufactured Urgency:** Complete absence of fabricated scarcity indicators, artificial countdown clocks, or simulated viewer counts ("*18 people looking at this room!*").
* 📄 **Transparent Cancellation:** Plain-English cancellation guarantees with bold, color-coded penalty schedules and exact calendar cut-off deadlines.

---

## 🚀 Key Features & Innovations

### 1. Multi-Modal Unified Travel Discovery
A single cohesive discovery engine handling cross-vertical travel across India:
- **Stays:** Curated luxury and boutique hotels in Mumbai, Delhi, Bengaluru, and Goa with verified room sizes, real unedited guest photos, and transparent amenities.
- **Flights:** Non-stop and 1-stop domestic routes with transparent baggage allowances and DGCA passenger fee guarantees.
- **Trains:** Real-time Indian Railways schedule integration (including flagship Vande Bharat Express and Rajdhani routes) with dynamic coach selection (CC, EC, 3A, 2A, 1A) and zero truncation.
- **Cabs:** Fixed-fare airport transfers and intercity sedans/SUVs/EVs with highway tolls, state taxes, and airport parking prepaid upfront.

### 2. Honest 7-Day Fare Calendar
Unlike industry-standard fare charts that advertise low base fares only to double upon date selection, Farways' 7-day selector calculates the **true net price** across adjacent days, preventing base-fare bait-and-switch.

### 3. Native Multilingual Voice Search
Powered by the browser's native **Web Speech API** paired with an intelligent NLP parser:
- Recognizes spoken natural queries (e.g., *"Find luxury hotel in Mumbai under 12000"* or *"Book Vande Bharat train from Mumbai to Goa"*).
- Automatically extracts destination cities, price ceilings, star ratings, and transport modes with continuous hands-free voice feedback.

### 4. Compact AI Travel Concierge
A lightweight, non-intrusive assistant pinned to the screen corner (`bottom-4 right-4`):
- Provides context-aware recommendations for stays, trains, and flights.
- Directly accesses user booking state from local storage and Supabase to surface reservation codes, e-ticket lookups, and instant cancellation policies.

### 5. Comprehensive Admin Operations Portal
A protected management interface (`/admin`) offering full CRUD capabilities across live Supabase inventory:
- Direct creation, status modification, and pricing management for all four verticals.
- Real-time schema synchronization with PostgreSQL Row Level Security (RLS).

---

## 🛠️ Tech Stack & Architecture

```
farways/
├── app/                        # Next.js 14 App Router routes
│   ├── (auth)/login/           # Supabase Auth with 1-Click Academic Evaluator mode
│   ├── checkout/               # Zero-friction checkout with Neutral Addons
│   ├── dashboard/              # Traveler reservations & PDF E-Ticket generation
│   ├── layout.tsx              # Root layout with Inter font typography
│   └── page.tsx                # Hero banner & Multi-modal Discovery Engine
├── components/
│   ├── checkout/               # NeutralAddonsPanel, OrderSummaryCard, FareBreakdown
│   ├── discovery/              # DiscoveryEngine, StayCard, FlightCard, TrainCard, CabCard
│   ├── ui/                     # Accessible UI components (SafeImage, Toast, Modal)
│   ├── AiSupportWidget.tsx     # Compact AI Travel Concierge
│   ├── CompareTray.tsx         # Side-by-side transparent matrix comparator
│   ├── Navbar.tsx              # Navigation & auth session controllers
│   └── VoiceSearchButton.tsx   # Web Speech API & NLP intent parser
├── lib/
│   ├── auth/AuthContext.tsx    # Supabase session provider & state manager
│   ├── data/mockData.ts        # Seed mock dataset for multi-modal travel
│   └── supabase/client.ts      # Resilient browser & SSR Supabase client
└── supabase/
    └── schema.sql              # Unified 6-table idempotent PostgreSQL DDL & RLS
```

### Unified Database Schema (Supabase / PostgreSQL)
The database structure consolidates multi-modal travel into 6 interconnected tables:
1. `stays`: Room categories, base rates, GST, rating, and verified guest amenities.
2. `flights`: Carrier codes, flight numbers, cabin classes, departure/arrival schedules, and DGCA fees.
3. `trains`: Train numbers, class tariffs, seat availability, and punctuality scores.
4. `cabs`: Vehicle categories, fuel types (Electric/CNG/Diesel), driver ratings, and toll inclusive pricing.
5. `user_profiles`: User role management (`traveler`, `evaluator`, `admin`) and preferences.
6. `bookings`: Confirmation codes, PNRs, traveler lists, itemized invoices, and cancellation audit trails.

---

## 💻 Getting Started (Local Development)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/Macplayz/Farways-Travel.git
cd Farways-Travel
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Populate the keys with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-publishable-key
```

### 3. 1-Click Database Seeding

1. Open your project on [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to the **SQL Editor** on the left menu.
3. Open [`supabase/schema.sql`](./supabase/schema.sql), copy the entire SQL script, paste it into the editor, and click **Run**.
4. The idempotent script will:
   - Create all 6 tables with proper constraints and primary keys.
   - Configure Row Level Security (RLS) policies allowing transparent reads and authenticated writes.
   - Automatically seed realistic Indian travel inventory across Mumbai, Delhi, Goa, and Bengaluru.

### 4. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎓 IEEE Evaluator Guide

For academic peer-reviewers and HCI evaluators evaluating usability benchmarks:

1. **1-Click Demo Evaluator Login:**
   - Navigate to [`/login`](http://localhost:3000/login).
   - Click the prominent **"🎓 One-Click Demo Evaluator Login"** button.
   - Instantly authenticate as **Prof. Arvind Sharma (Senior HCI Evaluator)** with preset reservations and profile data without needing manual email confirmations.
2. **Transparent Checkout Testing:**
   - Select any Stay, Flight, Train, or Cab from the home discovery feed.
   - Click **Book Now** or **Reserve** to enter [`/checkout`](http://localhost:3000/checkout).
   - Observe that the base fare, taxes, and final total match down to the exact rupee with zero hidden checkout-step increments.
   - Test the **Neutral Addons Panel**: Notice all travel protections and extra baggage are unchecked by default.
3. **E-Ticket & Instant Refund Simulation:**
   - Complete a booking with the test payment details.
   - Navigate to [`/dashboard`](http://localhost:3000/dashboard) to view the generated reservation, view itemized tax invoices, print verified PDF e-tickets, or execute zero-penalty instant cancellations.

---

<div align="center">
  <sub>Farways Travel Platform · Engineered for IEEE HCI Usability Research · Built with Next.js & Supabase</sub>
</div>
