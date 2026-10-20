'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Building2, 
  Plane, 
  TrainFront, 
  Car, 
  Search, 
  SlidersHorizontal, 
  Sparkles, 
  RotateCcw, 
  ShieldCheck, 
  ArrowRight,
  Filter,
  Check,
  Zap,
  Clock,
  Coffee,
  MapPin,
  Leaf,
  Users,
  X
} from 'lucide-react';
import { Stay, Flight, Train, Cab } from '@/types/farways';
import { StayCard } from './StayCard';
import { FlightCard } from './FlightCard';
import { TrainCard } from './TrainCard';
import { CabCard } from './CabCard';
import { ItemDetailModal, DetailItem } from './ItemDetailModal';
import { HonestFareCalendar } from './HonestFareCalendar';
import { VoiceSearchButton, VoiceCommandResult } from '@/components/VoiceSearchButton';
import { useToast } from '@/components/ToastProvider';

interface DiscoveryEngineProps {
  initialStays: Stay[];
  initialFlights: Flight[];
  initialTrains: Train[];
  initialCabs: Cab[];
}

export function DiscoveryEngine({ initialStays, initialFlights, initialTrains, initialCabs }: DiscoveryEngineProps) {
  const toast = useToast();
  const searchParams = useSearchParams();
  const paramTab = searchParams.get('tab');

  // Tab State & Synchronize with query parameter ?tab=
  const [activeTab, setActiveTab] = useState<'stays' | 'flights' | 'trains' | 'cabs'>('stays');

  useEffect(() => {
    if (paramTab === 'stays' || paramTab === 'flights' || paramTab === 'trains' || paramTab === 'cabs') {
      setActiveTab(paramTab);
    }
  }, [paramTab]);

  // Modal State
  const [detailModalData, setDetailModalData] = useState<DetailItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const openDetails = (data: DetailItem) => {
    setDetailModalData(data);
    setIsDetailModalOpen(true);
  };

  // Honest 7-Day Fare Calendar & Dynamic Pricing (Part 10 - Requirement 1)
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });
  const [dateMultiplier, setDateMultiplier] = useState(1.0);

  // Smart "Zero-Fatigue" Quick Filters (Part 10 - Requirement 2)
  const [filterFreeCancel, setFilterFreeCancel] = useState(false);
  const [filterBreakfast, setFilterBreakfast] = useState(false);
  const [filterNearTransit, setFilterNearTransit] = useState(false);
  const [filterEco, setFilterEco] = useState(false);
  const [maxBudget, setMaxBudget] = useState<number>(0);

  const hasActiveQuickFilters = filterFreeCancel || filterBreakfast || filterNearTransit || filterEco || maxBudget > 0;

  const clearQuickFilters = () => {
    setFilterFreeCancel(false);
    setFilterBreakfast(false);
    setFilterNearTransit(false);
    setFilterEco(false);
    setMaxBudget(0);
  };

  // Stays Filters
  const [stayCity, setStayCity] = useState<'All' | 'Mumbai' | 'Delhi NCR' | 'Goa'>('All');
  const [staySearch, setStaySearch] = useState('');
  const [stayStar, setStayStar] = useState<number | 'all'>('all');
  const [stayGuests, setStayGuests] = useState<number | 'all'>('all');
  const [staySort, setStaySort] = useState<'recommended' | 'price_low' | 'price_high' | 'rating'>('recommended');
  const [priceMode, setPriceMode] = useState<'per_night' | 'total'>('per_night');
  const stayNights = 2; // Default travel stay nights for total computation

  // Flights Filters
  const [flightOrigin, setFlightOrigin] = useState<string>('all');
  const [flightDestination, setFlightDestination] = useState<string>('all');
  const [flightAirline, setFlightAirline] = useState<string>('all');
  const [flightSort, setFlightSort] = useState<'recommended' | 'price_low' | 'duration'>('recommended');

  // Trains Filters
  const [trainSearch, setTrainSearch] = useState('');
  const [trainOrigin, setTrainOrigin] = useState<string>('all');
  const [trainTypeFilter, setTrainTypeFilter] = useState<'all' | 'Vande Bharat' | 'Rajdhani' | 'Tejas' | 'Jan Shatabdi'>('all');
  const [trainSort, setTrainSort] = useState<'recommended' | 'price_low' | 'duration' | 'on_time'>('recommended');

  // Cabs Filters
  const [cabCategory, setCabCategory] = useState<'all' | 'Airport Transfer' | 'Outstation Intercity' | 'Electric'>('all');
  const [cabSearch, setCabSearch] = useState('');

  // Voice Command Handler (Part 10 - Requirement 4)
  const handleVoiceCommand = (cmd: VoiceCommandResult) => {
    if (cmd.mode) {
      setActiveTab(cmd.mode);
    }

    // Mode-specific filter switching
    if (cmd.mode === 'trains') {
      if (cmd.typeFilter) {
        setTrainTypeFilter(cmd.typeFilter);
      }
      if (cmd.origin) {
        setTrainOrigin(cmd.origin);
      }
      if (cmd.keyword) {
        setTrainSearch(cmd.keyword);
      } else if (cmd.destination) {
        setTrainSearch(cmd.destination);
      }
    } else if (cmd.mode === 'cabs') {
      if (cmd.category) {
        setCabCategory(cmd.category);
      }
      if (cmd.keyword) {
        setCabSearch(cmd.keyword);
      } else if (cmd.destination) {
        setCabSearch(cmd.destination);
      } else if (cmd.city) {
        setCabSearch(cmd.city);
      }
    } else if (cmd.mode === 'flights') {
      if (cmd.origin) {
        setFlightOrigin(cmd.origin);
      }
      if (cmd.destination) {
        setFlightDestination(cmd.destination);
      }
    } else if (cmd.mode === 'stays') {
      if (cmd.city) {
        setStayCity(cmd.city as any);
      }
      if (cmd.keyword && cmd.keyword !== cmd.city) {
        setStaySearch(cmd.keyword);
      }
    } else {
      // General fallbacks when mode was inferred or activeTab maintained
      if (cmd.city) {
        setStayCity(cmd.city as any);
      }
      if (cmd.origin) {
        setFlightOrigin(cmd.origin);
      }
      if (cmd.destination) {
        setFlightDestination(cmd.destination);
      }
      if (cmd.keyword) {
        if (activeTab === 'trains') setTrainSearch(cmd.keyword);
        else if (activeTab === 'cabs') setCabSearch(cmd.keyword);
        else if (activeTab === 'stays') setStaySearch(cmd.keyword);
      }
    }
  };

  // ==========================================
  // Filtered Stays Memo
  // ==========================================
  const filteredStays = useMemo(() => {
    return initialStays.map((stay) => {
      if (dateMultiplier === 1.0) return stay;
      return {
        ...stay,
        base_price: Math.round(stay.base_price * dateMultiplier),
        tax: Math.round(stay.tax * dateMultiplier),
        total_price: Math.round(stay.total_price * dateMultiplier),
      };
    }).filter((stay) => {
      if (stayCity !== 'All' && stay.city !== stayCity) return false;

      if (staySearch.trim()) {
        const query = staySearch.toLowerCase();
        const matchesName = stay.name.toLowerCase().includes(query);
        const matchesLocation = stay.location.toLowerCase().includes(query);
        const matchesTagline = stay.tagline.toLowerCase().includes(query);
        if (!matchesName && !matchesLocation && !matchesTagline) return false;
      }

      if (stayStar !== 'all' && stay.starCategory !== stayStar) return false;

      // Smart Quick Filters
      if (filterFreeCancel && stay.cancellationPolicy.type !== 'free_cancellation') {
        return false;
      }
      if (filterBreakfast && !stay.amenities.some((a) => /breakfast|dining|restaurant|butler/i.test(a))) {
        return false;
      }
      if (filterNearTransit && !/colaba|nariman|aerocity|connaught|juhu|airport|station|beach|gateway/i.test(stay.location + ' ' + stay.address + ' ' + (stay.nearbyAttractions?.join(' ') || ''))) {
        return false;
      }
      if (filterEco && stay.starCategory < 4 && !stay.amenities.some((a) => /spa|pool|garden|eco/i.test(a))) {
        return false;
      }
      if (maxBudget > 0 && stay.total_price > maxBudget) {
        return false;
      }

      // Guest Capacity Filter (Isolated to Stays Only)
      if (stayGuests !== 'all' && stay.maxGuests < stayGuests) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (staySort === 'price_low') return a.total_price - b.total_price;
      if (staySort === 'price_high') return b.total_price - a.total_price;
      if (staySort === 'rating') return b.rating - a.rating;
      return 0; // recommended
    });
  }, [initialStays, stayCity, staySearch, stayStar, stayGuests, staySort, dateMultiplier, filterFreeCancel, filterBreakfast, filterNearTransit, filterEco, maxBudget]);

  // ==========================================
  // Filtered Flights Memo
  // ==========================================
  const filteredFlights = useMemo(() => {
    return initialFlights.map((flight) => {
      if (dateMultiplier === 1.0) return flight;
      return {
        ...flight,
        base_price: Math.round(flight.base_price * dateMultiplier),
        tax: Math.round(flight.tax * dateMultiplier),
        total_price: Math.round(flight.total_price * dateMultiplier),
      };
    }).filter((flight) => {
      if (flightOrigin !== 'all' && flight.originCode !== flightOrigin) return false;
      if (flightDestination !== 'all' && flight.destinationCode !== flightDestination) return false;
      if (flightAirline !== 'all' && flight.airlineCode !== flightAirline) return false;

      // Smart Quick Filters
      if (filterFreeCancel && !flight.availableAddons?.some((a) => a.category === 'cancellation_waiver')) {
        return false;
      }
      if (filterBreakfast && !flight.availableAddons?.some((a) => a.category === 'meal')) {
        return false;
      }
      if (filterEco && !/neo|787|max/i.test(flight.aircraft)) {
        return false;
      }
      if (maxBudget > 0 && flight.total_price > maxBudget) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (flightSort === 'price_low') return a.total_price - b.total_price;
      if (flightSort === 'duration') return a.durationMinutes - b.durationMinutes;
      return 0; // recommended
    });
  }, [initialFlights, flightOrigin, flightDestination, flightAirline, flightSort, dateMultiplier, filterFreeCancel, filterBreakfast, filterEco, maxBudget]);

  // ==========================================
  // Filtered Trains Memo
  // ==========================================
  const filteredTrains = useMemo(() => {
    return initialTrains.map((train) => {
      if (dateMultiplier === 1.0) return train;
      return {
        ...train,
        base_price: Math.round(train.base_price * dateMultiplier),
        tax: Math.round(train.tax * dateMultiplier),
        total_price: Math.round(train.total_price * dateMultiplier),
      };
    }).filter((train) => {
      // Type Filter
      if (trainTypeFilter !== 'all') {
        if (!train.trainType.toLowerCase().includes(trainTypeFilter.toLowerCase())) {
          return false;
        }
      }

      // Origin Filter
      if (trainOrigin !== 'all') {
        const matchOrigin = train.originCity.toLowerCase().includes(trainOrigin.toLowerCase()) ||
          train.originCode.toLowerCase() === trainOrigin.toLowerCase();
        if (!matchOrigin) return false;
      }

      // Keyword Search
      if (trainSearch.trim()) {
        const q = trainSearch.toLowerCase();
        const matchNum = train.trainNumber.toLowerCase().includes(q);
        const matchName = train.trainName.toLowerCase().includes(q);
        const matchStations = train.originStation.toLowerCase().includes(q) || train.destinationStation.toLowerCase().includes(q);
        const matchCodes = train.originCode.toLowerCase().includes(q) || train.destinationCode.toLowerCase().includes(q);
        const matchCities = train.originCity.toLowerCase().includes(q) || train.destinationCity.toLowerCase().includes(q);
        if (!matchNum && !matchName && !matchStations && !matchCodes && !matchCities) {
          return false;
        }
      }

      // Smart Quick Filters
      if (filterFreeCancel && train.cancellationPolicy.clerkageFee > 65) {
        return false;
      }
      if (filterBreakfast && !train.cateringIncluded && !train.pantryAvailable) {
        return false;
      }
      if (filterEco && !/vande bharat|tejas/i.test(train.trainType)) {
        return false;
      }
      if (maxBudget > 0 && train.total_price > maxBudget) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (trainSort === 'price_low') return a.total_price - b.total_price;
      if (trainSort === 'duration') return a.durationMinutes - b.durationMinutes;
      if (trainSort === 'on_time') return b.onTimeScore - a.onTimeScore;
      return 0; // recommended
    });
  }, [initialTrains, trainTypeFilter, trainOrigin, trainSearch, trainSort, dateMultiplier, filterFreeCancel, filterBreakfast, filterEco, maxBudget]);

  // ==========================================
  // Filtered Cabs Memo
  // ==========================================
  const filteredCabs = useMemo(() => {
    return initialCabs.map((cab) => {
      if (dateMultiplier === 1.0) return cab;
      return {
        ...cab,
        base_price: Math.round(cab.base_price * dateMultiplier),
        tax: Math.round(cab.tax * dateMultiplier),
        total_price: Math.round(cab.total_price * dateMultiplier),
      };
    }).filter((cab) => {
      if (cabCategory === 'Electric' && cab.fuelType !== 'Electric') return false;
      if (cabCategory !== 'all' && cabCategory !== 'Electric' && cab.category !== cabCategory) return false;

      if (cabSearch.trim()) {
        const q = cabSearch.toLowerCase();
        const matchRoute = cab.routeOrigin.toLowerCase().includes(q) || cab.routeDestination.toLowerCase().includes(q);
        const matchModel = cab.vehicleModel.toLowerCase().includes(q);
        if (!matchRoute && !matchModel) return false;
      }

      // Smart Quick Filters: All Farways cabs include zero-penalty free cancellation
      if (filterNearTransit && cab.category !== 'Airport Transfer') {
        return false;
      }
      if (filterEco && cab.fuelType !== 'Electric' && cab.fuelType !== 'CNG') {
        return false;
      }
      if (maxBudget > 0 && cab.total_price > maxBudget) {
        return false;
      }

      return true;
    });
  }, [initialCabs, cabCategory, cabSearch, dateMultiplier, filterFreeCancel, filterNearTransit, filterEco, maxBudget]);

  const resetAllFilters = () => {
    setStayCity('All');
    setStaySearch('');
    setStayStar('all');
    setStaySort('recommended');
    setFlightOrigin('all');
    setFlightDestination('all');
    setFlightAirline('all');
    setFlightSort('recommended');
    setTrainSearch('');
    setTrainOrigin('all');
    setTrainTypeFilter('all');
    setTrainSort('recommended');
    setCabCategory('all');
    setCabSearch('');
    clearQuickFilters();
    setDateMultiplier(1.0);
  };

  return (
    <section className="w-full">
      {/* =========================================================================
          PRIMARY MODE DISCOVERY TABS (Stays, Flights, Trains, Cabs)
          ========================================================================= */}
      <div className="bg-white border border-line rounded-2xl p-2 sm:p-2.5 shadow-subtle mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
          {/* Stays Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('stays')}
            className={`py-3 sm:py-3.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'stays'
                ? 'bg-ocean text-white shadow-sm'
                : 'text-slate hover:text-ink hover:bg-sky'
            }`}
          >
            <Building2 className="w-4 h-4 sm:w-5 h-5" />
            <span>Stays & Hotels ({initialStays.length})</span>
          </button>

          {/* Flights Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('flights')}
            className={`py-3 sm:py-3.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'flights'
                ? 'bg-ocean text-white shadow-sm'
                : 'text-slate hover:text-ink hover:bg-sky'
            }`}
          >
            <Plane className="w-4 h-4 sm:w-5 h-5" />
            <span>Flights ({initialFlights.length})</span>
          </button>

          {/* Trains Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('trains')}
            className={`py-3 sm:py-3.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'trains'
                ? 'bg-ocean text-white shadow-sm'
                : 'text-slate hover:text-ink hover:bg-sky'
            }`}
          >
            <TrainFront className="w-4 h-4 sm:w-5 h-5" />
            <span>Trains ({initialTrains.length})</span>
          </button>

          {/* Cabs Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('cabs')}
            className={`py-3 sm:py-3.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'cabs'
                ? 'bg-ocean text-white shadow-sm'
                : 'text-slate hover:text-ink hover:bg-sky'
            }`}
          >
            <Car className="w-4 h-4 sm:w-5 h-5" />
            <span>Cabs ({initialCabs.length})</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          HONEST 7-DAY FARE CALENDAR & PRICE TREND STRIP (Requirement 1)
          100% Tax-Included Net Total across Stays, Flights, Trains, Cabs
          ========================================================================= */}
      <HonestFareCalendar
        activeTab={activeTab}
        selectedDate={selectedDate}
        onSelectDate={(dateStr, mult) => {
          setSelectedDate(dateStr);
          setDateMultiplier(mult);
          toast.info(
            `Travel date updated to ${dateStr}. Upfront net fares recalculated transparently.`,
            'Date & Fare Synced'
          );
        }}
        basePrice={
          activeTab === 'stays' ? 4500 :
          activeTab === 'flights' ? 3800 :
          activeTab === 'trains' ? 1400 : 1600
        }
      />

      {/* =========================================================================
          SMART "ZERO-FATIGUE" QUICK FILTER BAR & BUDGET SLIDER (Requirement 2)
          Filters strictly by 100% final tax-included price rather than base fare
          ========================================================================= */}
      <div className="bg-white border border-line rounded-2xl p-3.5 sm:p-4 shadow-subtle mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          {/* Quick Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate flex items-center gap-1.5 mr-1">
              <Filter className="w-3.5 h-3.5 text-ocean" />
              <span>Quick Priorities:</span>
            </span>

            {/* 1. Free Cancellation */}
            <button
              type="button"
              onClick={() => setFilterFreeCancel(!filterFreeCancel)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                filterFreeCancel
                  ? 'bg-emerald-50 text-green border-green shadow-xs ring-1 ring-green'
                  : 'bg-sky/40 text-slate border-line hover:text-ink hover:bg-sky'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-green" />
              <span>Free Cancellation</span>
            </button>

            {/* 2. Breakfast / Meals Included */}
            <button
              type="button"
              onClick={() => setFilterBreakfast(!filterBreakfast)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                filterBreakfast
                  ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs ring-1 ring-amber-300'
                  : 'bg-sky/40 text-slate border-line hover:text-ink hover:bg-sky'
              }`}
            >
              <Coffee className="w-3.5 h-3.5 text-amber-600" />
              <span>{activeTab === 'stays' ? 'Breakfast Included' : 'Meals & Dining'}</span>
            </button>

            {/* 3. Near Airport / Station */}
            <button
              type="button"
              onClick={() => setFilterNearTransit(!filterNearTransit)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                filterNearTransit
                  ? 'bg-sky-deep text-ocean border-ocean shadow-xs ring-1 ring-ocean'
                  : 'bg-sky/40 text-slate border-line hover:text-ink hover:bg-sky'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-ocean" />
              <span>Near Airport / Transit</span>
            </button>

            {/* 4. Eco / EV Certified */}
            <button
              type="button"
              onClick={() => setFilterEco(!filterEco)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                filterEco
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-400 shadow-xs ring-1 ring-emerald-400'
                  : 'bg-sky/40 text-slate border-line hover:text-ink hover:bg-sky'
              }`}
            >
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              <span>Eco / EV Certified</span>
            </button>

            {hasActiveQuickFilters && (
              <button
                type="button"
                onClick={clearQuickFilters}
                className="text-xs font-bold text-red-600 hover:text-red-700 ml-1.5 flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Budget Slider (Strictly Max Final Total Net Price) */}
          <div className="flex items-center gap-3 bg-sky/50 border border-line px-3 py-1.5 rounded-xl self-start lg:self-auto">
            <div className="text-left lg:text-right shrink-0">
              <span className="text-[10px] font-extrabold uppercase text-slate block leading-none">
                Max Total Net Budget
              </span>
              <span className="text-xs font-black text-ink">
                {maxBudget === 0 ? 'No Limit' : `Up to ₹${maxBudget.toLocaleString('en-IN')}`}
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={activeTab === 'stays' ? 35000 : activeTab === 'flights' ? 15000 : activeTab === 'trains' ? 4500 : 5000}
              step={500}
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
              className="w-28 sm:w-32 accent-ocean cursor-pointer"
              title="Filter strictly by final tax-included net price"
            />

            {maxBudget > 0 && (
              <button
                type="button"
                onClick={() => setMaxBudget(0)}
                className="text-[10px] font-bold text-slate hover:text-ink cursor-pointer px-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          1. STAYS DISCOVERY ENGINE & FILTERS
          ========================================================================= */}
      {activeTab === 'stays' && (
        <div className="space-y-6 animate-calm">
          {/* Filter Bar Card */}
          <div className="bg-white border border-line rounded-2xl p-5 shadow-subtle space-y-4">
            
            {/* Top Row: Search Input + Voice Search Button + City Pills */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={staySearch}
                  onChange={(e) => setStaySearch(e.target.value)}
                  placeholder="Search by hotel name, landmark, or area (e.g. Taj, Colaba, Juhu, Benaulim)..."
                  className="w-full pl-10 pr-20 py-2.5 rounded-xl border border-line bg-sky/30 text-xs sm:text-sm text-ink placeholder:text-slate-muted focus:border-ocean focus:outline-none focus:bg-white transition-all"
                />
                <div className="absolute right-2.5 top-1.5 flex items-center gap-1.5">
                  {staySearch && (
                    <button
                      onClick={() => setStaySearch('')}
                      className="text-xs text-slate hover:text-ink px-1 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                  <VoiceSearchButton onVoiceCommand={handleVoiceCommand} />
                </div>
              </div>

              {/* City Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
                {[
                  { label: 'All Cities', count: initialStays.length, val: 'All' },
                  { label: 'Mumbai', count: 8, val: 'Mumbai' },
                  { label: 'Delhi NCR', count: 8, val: 'Delhi NCR' },
                  { label: 'Goa', count: 8, val: 'Goa' },
                ].map((city) => (
                  <button
                    key={city.val}
                    type="button"
                    onClick={() => setStayCity(city.val as any)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                      stayCity === city.val
                        ? 'bg-sky-deep text-ocean border-ocean shadow-sm'
                        : 'bg-white text-slate border-line hover:text-ink hover:bg-sky'
                    }`}
                  >
                    <span>{city.label}</span>
                    <span className="ml-1.5 opacity-70">({city.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Row: Per-Night vs Total Price Toggle + Sort + Star Rating */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3 border-t border-line">
              <div className="flex items-center gap-3 bg-sky/60 p-1.5 rounded-xl border border-line">
                <span className="text-xs font-bold text-ink pl-1">Display Pricing:</span>
                <div className="flex items-center bg-white rounded-lg p-0.5 border border-line">
                  <button
                    type="button"
                    onClick={() => setPriceMode('per_night')}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      priceMode === 'per_night'
                        ? 'bg-ocean text-white shadow-sm'
                        : 'text-slate hover:text-ink'
                    }`}
                  >
                    Per Night
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriceMode('total')}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      priceMode === 'total'
                        ? 'bg-ocean text-white shadow-sm'
                        : 'text-slate hover:text-ink'
                    }`}
                  >
                    Total ({stayNights} Nights)
                  </button>
                </div>
              </div>

              {/* Star Rating, Travelers & Sort Filter Suite (Strictly Isolated to Stays) */}
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-ocean" />
                    <span>Travelers:</span>
                  </span>
                  <select
                    value={stayGuests}
                    onChange={(e) => setStayGuests(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="px-2.5 py-1.5 rounded-lg border border-line bg-white text-xs font-semibold text-ink focus:border-ocean focus:outline-none"
                    aria-label="Filter stays by traveler/guest capacity"
                  >
                    <option value="all">Any Guests</option>
                    <option value={1}>1 Guest</option>
                    <option value={2}>2 Guests</option>
                    <option value={3}>3 Guests</option>
                    <option value={4}>4+ Guests</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate">Category:</span>
                  <select
                    value={stayStar}
                    onChange={(e) => setStayStar(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="px-2.5 py-1.5 rounded-lg border border-line bg-white text-xs font-semibold text-ink focus:border-ocean focus:outline-none"
                  >
                    <option value="all">All Stars (3★ - 5★)</option>
                    <option value="5">5-Star Luxury Only</option>
                    <option value="4">4-Star Premium</option>
                    <option value="3">3-Star Boutique</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate">Sort by:</span>
                  <select
                    value={staySort}
                    onChange={(e) => setStaySort(e.target.value as any)}
                    className="px-2.5 py-1.5 rounded-lg border border-line bg-white text-xs font-semibold text-ink focus:border-ocean focus:outline-none"
                  >
                    <option value="recommended">Curated Quality</option>
                    <option value="price_low">Upfront Price: Low to High</option>
                    <option value="price_high">Upfront Price: High to Low</option>
                    <option value="rating">Guest Rating: High to Low</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Stays Grid */}
          {filteredStays.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStays.map((stay) => (
                <StayCard
                  key={stay.id}
                  stay={stay}
                  priceMode={priceMode}
                  stayNights={stayNights}
                  onOpenDetails={(s) => openDetails({ type: 'stay', item: s })}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-line rounded-2xl p-12 text-center shadow-subtle">
              <Building2 className="w-12 h-12 text-slate mx-auto mb-3" />
              <h3 className="text-base font-bold text-ink">No Stays Match Your Criteria</h3>
              <p className="text-xs text-slate mt-1 mb-4">
                We found zero properties matching your selected priority filters or budget ceiling.
              </p>
              <button onClick={resetAllFilters} className="btn-secondary text-xs">
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          2. FLIGHTS DISCOVERY ENGINE & FILTERS
          ========================================================================= */}
      {activeTab === 'flights' && (
        <div className="space-y-6 animate-calm">
          {/* Flight Filters Card */}
          <div className="bg-white border border-line rounded-2xl p-5 shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-line">
              <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                <Plane className="w-4 h-4 text-ocean" />
                <span>Airline Corridor Discovery</span>
              </span>
              <VoiceSearchButton onVoiceCommand={handleVoiceCommand} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate mb-1">Departure City</label>
                <select
                  value={flightOrigin}
                  onChange={(e) => setFlightOrigin(e.target.value)}
                  className="w-full p-2 rounded-xl border border-line bg-sky/30 text-xs font-semibold text-ink focus:border-ocean focus:outline-none"
                >
                  <option value="all">All Origins</option>
                  <option value="BOM">Mumbai (BOM)</option>
                  <option value="DEL">Delhi (DEL)</option>
                  <option value="GOI">Goa (GOI)</option>
                  <option value="BLR">Bengaluru (BLR)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate mb-1">Destination City</label>
                <select
                  value={flightDestination}
                  onChange={(e) => setFlightDestination(e.target.value)}
                  className="w-full p-2 rounded-xl border border-line bg-sky/30 text-xs font-semibold text-ink focus:border-ocean focus:outline-none"
                >
                  <option value="all">All Destinations</option>
                  <option value="DEL">Delhi (DEL)</option>
                  <option value="BOM">Mumbai (BOM)</option>
                  <option value="GOI">Goa (GOI)</option>
                  <option value="BLR">Bengaluru (BLR)</option>
                  <option value="DXB">Dubai (DXB)</option>
                  <option value="SIN">Singapore (SIN)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate mb-1">Airline Carrier</label>
                <select
                  value={flightAirline}
                  onChange={(e) => setFlightAirline(e.target.value)}
                  className="w-full p-2 rounded-xl border border-line bg-sky/30 text-xs font-semibold text-ink focus:border-ocean focus:outline-none"
                >
                  <option value="all">All Airlines (8 Carriers)</option>
                  <option value="6E">IndiGo (6E)</option>
                  <option value="AI">Air India (AI)</option>
                  <option value="QP">Akasa Air (QP)</option>
                  <option value="UK">Vistara (UK)</option>
                  <option value="EK">Emirates (EK)</option>
                  <option value="SQ">Singapore Airlines (SQ)</option>
                  <option value="QR">Qatar Airways (QR)</option>
                  <option value="SG">SpiceJet (SG)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate mb-1">Sort Results</label>
                <select
                  value={flightSort}
                  onChange={(e) => setFlightSort(e.target.value as any)}
                  className="w-full p-2 rounded-xl border border-line bg-sky/30 text-xs font-semibold text-ink focus:border-ocean focus:outline-none"
                >
                  <option value="recommended">Best Combination</option>
                  <option value="price_low">Upfront Total: Low to High</option>
                  <option value="duration">Fastest Flight Duration</option>
                </select>
              </div>
            </div>
          </div>

          {/* Flights Grid */}
          {filteredFlights.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFlights.map((flight) => (
                <FlightCard
                  key={flight.id}
                  flight={flight}
                  onOpenDetails={(f) => openDetails({ type: 'flight', item: f })}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-line rounded-2xl p-12 text-center shadow-subtle">
              <Plane className="w-12 h-12 text-slate mx-auto mb-3" />
              <h3 className="text-base font-bold text-ink">No Flights Available</h3>
              <p className="text-xs text-slate mt-1 mb-4">
                No flights match the selected route, priority filters, or budget limit.
              </p>
              <button onClick={resetAllFilters} className="btn-secondary text-xs">
                View All Available Flights
              </button>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          3. TRAINS DISCOVERY ENGINE & FILTERS
          8 realistic Indian Railways routes (Vande Bharat, Rajdhani, Tejas, etc.)
          ========================================================================= */}
      {activeTab === 'trains' && (
        <div className="space-y-6 animate-calm">
          {/* Train Filters Card */}
          <div className="bg-white border border-line rounded-2xl p-5 shadow-subtle space-y-4">
            
            {/* Top Row: Keyword Search + Voice Search + Quick Hub Pills */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={trainSearch}
                  onChange={(e) => setTrainSearch(e.target.value)}
                  placeholder="Search train name, number, or station (e.g. 22229, Vande Bharat, CSMT, NDLS, Agra)..."
                  className="w-full pl-10 pr-20 py-2.5 rounded-xl border border-line bg-sky/30 text-xs sm:text-sm text-ink placeholder:text-slate-muted focus:border-ocean focus:outline-none focus:bg-white transition-all"
                />
                <div className="absolute right-2.5 top-1.5 flex items-center gap-1.5">
                  {trainSearch && (
                    <button
                      onClick={() => setTrainSearch('')}
                      className="text-xs text-slate hover:text-ink px-1 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                  <VoiceSearchButton onVoiceCommand={handleVoiceCommand} />
                </div>
              </div>

              {/* Hub Origin Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
                {[
                  { label: 'All Railway Corridors', val: 'all' },
                  { label: 'Mumbai Hub', val: 'Mumbai' },
                  { label: 'Delhi Hub', val: 'Delhi' },
                  { label: 'Goa Hub', val: 'Goa' },
                ].map((hub) => (
                  <button
                    key={hub.val}
                    type="button"
                    onClick={() => setTrainOrigin(hub.val)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                      trainOrigin === hub.val
                        ? 'bg-sky-deep text-ocean border-ocean shadow-sm'
                        : 'bg-white text-slate border-line hover:text-ink hover:bg-sky'
                    }`}
                  >
                    <span>{hub.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Row: Train Type Pills & Sort Filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3 border-t border-line">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { label: 'All Train Types', val: 'all' },
                  { label: 'Vande Bharat', val: 'Vande Bharat' },
                  { label: 'Rajdhani', val: 'Rajdhani' },
                  { label: 'Tejas', val: 'Tejas' },
                  { label: 'Jan Shatabdi', val: 'Jan Shatabdi' },
                ].map((type) => (
                  <button
                    key={type.val}
                    type="button"
                    onClick={() => setTrainTypeFilter(type.val as any)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                      trainTypeFilter === type.val
                        ? 'bg-ocean text-white border-ocean shadow-sm'
                        : 'bg-white text-slate border-line hover:text-ink hover:bg-sky'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              {/* Sort Filter */}
              <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
                <span className="text-slate">Sort by:</span>
                <select
                  value={trainSort}
                  onChange={(e) => setTrainSort(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-lg border border-line bg-white text-xs font-semibold text-ink focus:border-ocean focus:outline-none"
                >
                  <option value="recommended">Curated On-Time</option>
                  <option value="price_low">Upfront Fare: Low to High</option>
                  <option value="duration">Fastest Journey Duration</option>
                  <option value="on_time">Highest On-Time Score</option>
                </select>
              </div>
            </div>
          </div>

          {/* Trains Grid */}
          {filteredTrains.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrains.map((train) => (
                <TrainCard
                  key={train.id}
                  train={train}
                  onOpenDetails={(t) => openDetails({ type: 'train', item: t })}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-line rounded-2xl p-12 text-center shadow-subtle">
              <TrainFront className="w-12 h-12 text-slate mx-auto mb-3" />
              <h3 className="text-base font-bold text-ink">No Trains Found</h3>
              <p className="text-xs text-slate mt-1 mb-4">
                No Indian Railway routes match your selected corridor, priority filters, or budget.
              </p>
              <button onClick={resetAllFilters} className="btn-secondary text-xs">
                View All 8 Trains
              </button>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          4. CABS DISCOVERY ENGINE & FILTERS
          ========================================================================= */}
      {activeTab === 'cabs' && (
        <div className="space-y-6 animate-calm">
          {/* Cabs Filter Card */}
          <div className="bg-white border border-line rounded-2xl p-5 shadow-subtle space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { label: 'All Transfers', count: initialCabs.length, val: 'all' },
                  { label: 'Airport Transfers', count: 5, val: 'Airport Transfer' },
                  { label: 'Outstation Intercity', count: 2, val: 'Outstation Intercity' },
                  { label: 'Electric EV', count: 1, val: 'Electric' },
                ].map((cat) => (
                  <button
                    key={cat.val}
                    type="button"
                    onClick={() => setCabCategory(cat.val as any)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                      cabCategory === cat.val
                        ? 'bg-sky-deep text-ocean border-ocean shadow-sm'
                        : 'bg-white text-slate border-line hover:text-ink hover:bg-sky'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className="ml-1.5 opacity-70">({cat.count})</span>
                  </button>
                ))}
              </div>

              {/* Keyword Search + Voice Search */}
              <div className="relative min-w-[260px]">
                <Search className="w-3.5 h-3.5 text-slate absolute left-3 top-3" />
                <input
                  type="text"
                  value={cabSearch}
                  onChange={(e) => setCabSearch(e.target.value)}
                  placeholder="Filter by airport or destination..."
                  className="w-full pl-9 pr-16 py-2 rounded-xl border border-line bg-sky/30 text-xs text-ink placeholder:text-slate-muted focus:border-ocean focus:outline-none focus:bg-white"
                />
                <div className="absolute right-2 top-1 flex items-center gap-1">
                  {cabSearch && (
                    <button
                      onClick={() => setCabSearch('')}
                      className="text-xs text-slate hover:text-ink px-1 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                  <VoiceSearchButton onVoiceCommand={handleVoiceCommand} />
                </div>
              </div>
            </div>

            {/* Inclusion Guarantee Strip */}
            <div className="pt-3 border-t border-line text-xs text-slate flex flex-wrap items-center gap-4">
              <span className="font-semibold text-ink flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-green" />
                <span>Zero Cash Surcharges:</span>
              </span>
              <span>Fastag bridge & expressway tolls included</span>
              <span>•</span>
              <span>Airport parking bays covered</span>
              <span>•</span>
              <span>Guaranteed AC ride</span>
            </div>
          </div>

          {/* Cabs Grid */}
          {filteredCabs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCabs.map((cab) => (
                <CabCard
                  key={cab.id}
                  cab={cab}
                  onOpenDetails={(c) => openDetails({ type: 'cab', item: c })}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-line rounded-2xl p-12 text-center shadow-subtle">
              <Car className="w-12 h-12 text-slate mx-auto mb-3" />
              <h3 className="text-base font-bold text-ink">No Cabs Available</h3>
              <p className="text-xs text-slate mt-1 mb-4">
                No transfer routes match your category, priority filters, or budget.
              </p>
              <button onClick={resetAllFilters} className="btn-secondary text-xs">
                View All Cab Transfers
              </button>
            </div>
          )}
        </div>
      )}

      {/* Item Detail Modal */}
      {detailModalData && (
        <ItemDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          data={detailModalData}
        />
      )}
    </section>
  );
}
