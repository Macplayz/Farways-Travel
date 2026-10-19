'use client';

import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  TrendingDown, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Info,
  Check
} from 'lucide-react';

interface HonestFareCalendarProps {
  activeTab: 'stays' | 'flights' | 'trains' | 'cabs';
  selectedDate: string;
  onSelectDate: (dateStr: string, priceMultiplier: number) => void;
  basePrice?: number;
}

interface DayFare {
  dateObj: Date;
  dateKey: string; // YYYY-MM-DD
  dayLabel: string; // Mon, Tue, etc.
  dateDisplay: string; // Oct 20
  netPrice: number; // Final tax-included price
  multiplier: number;
  isLowest: boolean;
  statusTag: string;
  tagColor: string;
}

export function HonestFareCalendar({
  activeTab,
  selectedDate,
  onSelectDate,
  basePrice = 4200,
}: HonestFareCalendarProps) {
  const [dayOffset, setDayOffset] = useState(0);

  // Generate 7 consecutive days starting from today + offset
  const days: DayFare[] = useMemo(() => {
    const list: DayFare[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Multiplier calculation depending on travel mode and day of week
    // Sunday = 0, Monday = 1, ..., Saturday = 6
    const dayMultipliers: Record<number, number> = {
      0: 1.15, // Sun: Weekend peak
      1: 0.94, // Mon: Lowest midweek
      2: 0.92, // Tue: Lowest midweek
      3: 0.95, // Wed: Moderate
      4: 0.98, // Thu: Moderate
      5: 1.18, // Fri: Weekend escape surge
      6: 1.20, // Sat: Peak Saturday
    };

    // Mode-specific base adjustment
    const modeBase = 
      activeTab === 'flights' ? Math.max(basePrice, 3800) :
      activeTab === 'trains' ? Math.max(basePrice, 1400) :
      activeTab === 'cabs' ? Math.max(basePrice, 1600) :
      Math.max(basePrice, 4500);

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + dayOffset + i);

      const dayOfWeek = d.getDay();
      const mult = dayMultipliers[dayOfWeek] || 1.0;
      const rawPrice = Math.round(modeBase * mult);
      
      // Farways Net Price includes GST (e.g. 12% or 18% built-in upfront)
      const taxIncluded = Math.round(rawPrice * 1.12);

      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayLabel = dayNames[dayOfWeek];
      const dateDisplay = `${monthNames[d.getMonth()]} ${d.getDate()}`;

      let statusTag = 'Standard';
      let tagColor = 'bg-sky text-slate';

      if (dayOfWeek === 1 || dayOfWeek === 2) {
        statusTag = 'Midweek Low';
        tagColor = 'bg-emerald-50 text-green border-emerald-200';
      } else if (dayOfWeek === 5) {
        statusTag = 'Friday Surge';
        tagColor = 'bg-amber-50 text-amber-700 border-amber-200';
      } else if (dayOfWeek === 6 || dayOfWeek === 0) {
        statusTag = 'Weekend Peak';
        tagColor = 'bg-amber-50 text-amber-800 border-amber-200';
      }

      list.push({
        dateObj: d,
        dateKey,
        dayLabel,
        dateDisplay,
        netPrice: taxIncluded,
        multiplier: mult,
        isLowest: false,
        statusTag,
        tagColor,
      });
    }

    // Determine the lowest price day in this 7-day strip
    let lowestIdx = 0;
    let minPrice = Infinity;
    list.forEach((item, idx) => {
      if (item.netPrice < minPrice) {
        minPrice = item.netPrice;
        lowestIdx = idx;
      }
    });

    if (list[lowestIdx]) {
      list[lowestIdx].isLowest = true;
      list[lowestIdx].statusTag = 'Lowest Fare';
      list[lowestIdx].tagColor = 'bg-green/15 text-green border-green/30 font-extrabold';
    }

    return list;
  }, [dayOffset, activeTab, basePrice]);

  const maxPrice = useMemo(() => {
    return Math.max(...days.map((d) => d.netPrice), 1);
  }, [days]);

  const handlePrev = () => {
    if (dayOffset >= 7) {
      setDayOffset((prev) => prev - 7);
    } else {
      setDayOffset(0);
    }
  };

  const handleNext = () => {
    setDayOffset((prev) => prev + 7);
  };

  return (
    <div className="bg-white border border-line rounded-2xl p-4 sm:p-5 shadow-subtle mb-6 animate-calm">
      {/* Calendar Strip Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-deep text-ocean flex items-center justify-center font-bold">
            <Calendar className="w-4 h-4 text-ocean" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-ink">
                Honest 7-Day Fare Calendar & Price Trends
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green/10 text-green border border-green/20">
                <ShieldCheck className="w-3 h-3" />
                <span>100% Tax-Included Net</span>
              </span>
            </div>
            <p className="text-[11px] text-slate mt-0.5">
              Unlike commercial OTAs that quote deceptive pre-tax base rates, every figure below is the exact final amount you pay.
            </p>
          </div>
        </div>

        {/* Date Navigator Arrows */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={handlePrev}
            disabled={dayOffset === 0}
            className="p-1.5 rounded-lg border border-line bg-white hover:bg-sky text-slate hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="Previous 7 Days"
            title="Previous 7 Days"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-slate px-1">
            {days[0]?.dateDisplay} — {days[days.length - 1]?.dateDisplay}
          </span>
          <button
            type="button"
            onClick={handleNext}
            className="p-1.5 rounded-lg border border-line bg-white hover:bg-sky text-slate hover:text-ink transition-colors cursor-pointer"
            aria-label="Next 7 Days"
            title="Next 7 Days"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 7-Day Date Cards Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 pt-3">
        {days.map((day) => {
          const isSelected = selectedDate === day.dateKey;
          // Calculate relative percentage height for the mini trend bar
          const barHeightPercent = Math.max(25, Math.round((day.netPrice / maxPrice) * 100));

          return (
            <button
              key={day.dateKey}
              type="button"
              onClick={() => onSelectDate(day.dateKey, day.multiplier)}
              className={`flex flex-col items-center justify-between p-2 sm:p-2.5 rounded-xl border text-center transition-all cursor-pointer relative group ${
                isSelected
                  ? 'bg-sky-deep/50 border-ocean shadow-sm ring-1 ring-ocean'
                  : day.isLowest
                  ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
                  : 'bg-white border-line hover:border-sky-deep hover:bg-sky/30'
              }`}
              aria-pressed={isSelected}
            >
              {/* Day & Date Header */}
              <div className="w-full">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate block leading-tight">
                  {day.dayLabel}
                </span>
                <span className="text-xs sm:text-sm font-black text-ink block mt-0.5">
                  {day.dateDisplay}
                </span>
              </div>

              {/* Mini Sparkline / Trend Bar Indicator */}
              <div className="w-full h-8 flex items-end justify-center my-1.5 px-2">
                <div 
                  className={`w-full max-w-[20px] rounded-t-sm transition-all duration-300 ${
                    day.isLowest 
                      ? 'bg-green' 
                      : isSelected 
                      ? 'bg-ocean' 
                      : 'bg-slate/20 group-hover:bg-slate/40'
                  }`}
                  style={{ height: `${barHeightPercent}%` }}
                />
              </div>

              {/* Transparent Price Figure */}
              <div className="w-full">
                <div className={`text-xs sm:text-sm font-black tracking-tight ${
                  day.isLowest ? 'text-green' : isSelected ? 'text-ocean' : 'text-ink'
                }`}>
                  ₹{day.netPrice.toLocaleString('en-IN')}
                </div>

                {/* Honest Tag */}
                <div className="mt-1">
                  <span className={`inline-block px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] border font-semibold whitespace-nowrap ${day.tagColor}`}>
                    {day.statusTag}
                  </span>
                </div>
              </div>

              {/* Selection Check Icon Badge */}
              {isSelected && (
                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-ocean text-white flex items-center justify-center shadow-xs">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Calendar Bottom Guarantee Footnote */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-muted pt-3 border-t border-line mt-3 gap-2">
        <div className="flex items-center gap-1.5">
          <TrendingDown className="w-3.5 h-3.5 text-green" />
          <span>Dates highlighted in green indicate historical 7-day lowest rate for this route.</span>
        </div>
        <div className="flex items-center gap-1.5 text-ink font-medium">
          <Sparkles className="w-3.5 h-3.5 text-ocean" />
          <span>Fare Lock Active: Rates locked for your active session with zero surge fluctuation.</span>
        </div>
      </div>
    </div>
  );
}
