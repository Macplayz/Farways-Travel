'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Bot, 
  Sparkles, 
  X, 
  Send, 
  MessageSquare, 
  ShieldCheck, 
  Building2, 
  TrainFront, 
  Plane, 
  Car, 
  Ticket, 
  ChevronRight, 
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  HelpCircle
} from 'lucide-react';
import { MOCK_STAYS, MOCK_FLIGHTS, MOCK_TRAINS, MOCK_CABS } from '@/lib/data/mockData';
import { useAuth } from '@/lib/auth/AuthContext';
import { SafeImage } from '@/components/ui/SafeImage';
import { useCurrency } from '@/lib/context/CurrencyContext';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  recommendations?: Array<{
    id: string;
    title: string;
    subtitle: string;
    price: number;
    taxIncluded: boolean;
    image?: string;
    href: string;
    rating?: number;
    badge?: string;
  }>;
}

const QUICK_PROMPTS = [
  'Compare Mumbai 5-star stays',
  'Show fastest train to Goa',
  'Explain Farways Zero-Markup policy',
  'Check my booking status',
  'Find airport cabs with zero surge',
];

export function AiSupportWidget() {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Hello${user ? ` ${user.fullName.split(' ')[0]}` : ''}! I am your Farways AI Travel Concierge. I have live access to our 24 Stays, 8 Flight routes, 8 Indian Railway trains, and 8 Airport transfers. Every price I quote is 100% tax-included with zero surprise fees. How may I assist your journey?`,
      timestamp: 'Just now',
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || inputVal).trim();
    if (!query) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = generateAiResponse(query);
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 450);
  };

  const generateAiResponse = (query: string): Message => {
    const lower = query.toLowerCase();
    const time = 'Just now';

    // 1. Mumbai 5-Star Stays
    if (lower.includes('mumbai') && (lower.includes('hotel') || lower.includes('stay') || lower.includes('5-star') || lower.includes('compare'))) {
      const mumbai5Stars = MOCK_STAYS.filter((s) => s.city === 'Mumbai' && s.starCategory === 5).slice(0, 3);
      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: `Here is a transparent comparison of Mumbai's premier 5-star properties. Unlike standard OTAs that hide the 18% luxury GST until passenger step 3, these figures are guaranteed 100% final totals:`,
        timestamp: time,
        recommendations: mumbai5Stars.map((stay) => ({
          id: stay.id,
          title: stay.name,
          subtitle: `${stay.location} · ${stay.roomType}`,
          price: stay.total_price,
          taxIncluded: true,
          image: stay.thumbnail,
          href: `/?tab=stays&search=${encodeURIComponent(stay.name)}`,
          rating: stay.rating,
          badge: stay.featuredBadge,
        })),
      };
    }

    // 2. Fastest Train to Goa
    if ((lower.includes('fastest') || lower.includes('train')) && lower.includes('goa')) {
      const vandeBharat = MOCK_TRAINS.find((t) => t.trainNumber === '22229') || MOCK_TRAINS[0];
      const tejas = MOCK_TRAINS.find((t) => t.trainNumber === '22119') || MOCK_TRAINS[1];

      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: `The fastest connection is the **Mumbai CSMT to Madgaon Vande Bharat Express (Train #22229)**, completing the scenic Konkan route in **7h 45m** (vs 11+ hours on standard express trains) with a 98% on-time record. 
        
• Chair Car (CC): ${formatPrice(1960)} all-inclusive (High-tea + Dinner included)
• Executive Class (EC): ${formatPrice(3752)} all-inclusive
• Second fastest: Tejas Express (#22119) at 8h 30m.`,
        timestamp: time,
        recommendations: [
          {
            id: vandeBharat.id,
            title: vandeBharat.trainName,
            subtitle: `${vandeBharat.originCode} → ${vandeBharat.destinationCode} · ${vandeBharat.durationFormatted}`,
            price: vandeBharat.total_price,
            taxIncluded: true,
            image: vandeBharat.imageUrl,
            href: `/?tab=trains&search=Vande+Bharat`,
            badge: 'Fastest 7h 45m',
          },
          {
            id: tejas.id,
            title: tejas.trainName,
            subtitle: `${tejas.originCode} → ${tejas.destinationCode} · ${tejas.durationFormatted}`,
            price: tejas.total_price,
            taxIncluded: true,
            image: tejas.imageUrl,
            href: `/?tab=trains&search=Tejas`,
            badge: 'Smart Coach',
          },
        ],
      };
    }

    // 3. Explain Farways Zero-Markup Policy / Dark Patterns
    if (lower.includes('zero-markup') || lower.includes('markup') || lower.includes('dark pattern') || lower.includes('policy') || lower.includes('fees')) {
      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: `**Farways Customer Transparency Charter:**

1. **Zero Drip Pricing**: Commercial OTAs show low base rates and append 25-35% in hidden "convenience fees" at checkout. Farways shows the 100% all-inclusive net total upfront on every card.
2. **Zero Fake Scarcity**: We strictly prohibit false scarcity countdowns ("Only 1 room left!", "14 people looking now").
3. **Zero Pre-Checked Traps**: Add-ons like travel insurance and airport check-ins are strictly opt-in (un-checked by default).
4. **100% Free Cancellation**: Full refunds within the stated policy window with zero cancellation retention fee.`,
        timestamp: time,
      };
    }

    // 4. Check Booking Status
    if (lower.includes('booking') || lower.includes('my trip') || lower.includes('status') || lower.includes('reservation')) {
      let bookingsCount = 0;
      let lastBookingCode = '';

      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('farways_bookings') || '[]';
          const list = JSON.parse(raw);
          bookingsCount = list.length;
          if (bookingsCount > 0) {
            lastBookingCode = list[0].confirmation_code;
          }
        } catch {
          // Safe ignore
        }
      }

      if (bookingsCount > 0) {
        return {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: `You have **${bookingsCount} active booking(s)** registered in your Farways session. Your most recent reservation confirmation code is **${lastBookingCode}**. You can view itemized vouchers, print PDF e-tickets, or execute a 0-penalty cancellation in your dashboard.`,
          timestamp: time,
          recommendations: [
            {
              id: 'rec-dash',
              title: 'Open Traveler Dashboard',
              subtitle: 'View live vouchers, receipts, and refund controls',
              price: 0,
              taxIncluded: true,
              image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80',
              href: '/dashboard',
              badge: 'Active Bookings',
            },
          ],
        };
      }

      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: `You do not have any active bookings in this session yet. Explore our Stays, Flights, Trains, or Cabs tabs to experience guaranteed transparent pricing with zero surprise charges at checkout!`,
        timestamp: time,
      };
    }

    // 5. Cabs / Airport Transfers
    if (lower.includes('cab') || lower.includes('taxi') || lower.includes('airport') || lower.includes('transfer')) {
      const airportCabs = MOCK_CABS.filter((c) => c.category === 'Airport Transfer').slice(0, 2);
      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: `All Farways airport transfers feature **Guaranteed Zero-Surge Pricing** with airport parking and highway tolls included upfront:`,
        timestamp: time,
        recommendations: airportCabs.map((cab) => ({
          id: cab.id,
          title: `${cab.vehicleModel} (${cab.vehicleType})`,
          subtitle: `${cab.routeOrigin} → ${cab.routeDestination} · Tolls Included`,
          price: cab.total_price,
          taxIncluded: true,
          image: cab.imageUrl,
          href: `/?tab=cabs`,
          badge: cab.fuelType === 'Electric' ? 'EV Zero Emission' : 'Fixed Fare',
        })),
      };
    }

    // 6. Default Fallback
    return {
      id: `ai-${Date.now()}`,
      sender: 'assistant',
      text: `I understood: "${query}". As your Farways Concierge, I can assist you with hotel recommendations in Mumbai, Delhi, and Goa, fastest Vande Bharat express routes, airline flight fares, or toll-included cab transfers. What would you like to explore?`,
      timestamp: time,
    };
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `msg-reset-${Date.now()}`,
        sender: 'assistant',
        text: 'Chat history cleared. How can I assist you with transparent travel bookings today?',
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <aside aria-label="AI Travel Concierge Floating Launcher" className="fixed bottom-4 right-4 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`h-10 px-3.5 rounded-full font-bold text-xs shadow-modal transition-all duration-200 cursor-pointer flex items-center gap-2 ${
            isOpen
              ? 'bg-ink text-white hover:bg-slate-800'
              : 'bg-ocean hover:bg-ocean-dark text-white shadow-md hover:scale-105 ring-2 ring-ocean/20'
          }`}
          aria-expanded={isOpen}
          aria-label="Open Farways AI Travel Concierge"
        >
          {isOpen ? (
            <X className="w-3.5 h-3.5 text-white" />
          ) : (
            <div className="relative">
              <Bot className="w-3.5 h-3.5 text-white" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-green animate-ping" />
            </div>
          )}
          <span className="font-extrabold tracking-tight">
            {isOpen ? 'Close' : 'AI Concierge'}
          </span>
        </button>
      </aside>

      {/* Expandable Chat Drawer */}
      {isOpen && (
        <aside 
          aria-label="Farways AI Travel Concierge"
          className="fixed bottom-4 right-4 z-50 w-[calc(100vw-32px)] sm:w-80 max-w-[320px] bg-white rounded-2xl border border-line shadow-modal flex flex-col overflow-hidden animate-scale-in max-h-[75vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-ink via-ocean-dark to-ocean text-white p-3 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-sky-deep" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-extrabold tracking-tight">
                    Farways AI Concierge
                  </h3>
                  <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
                </div>
                <p className="text-[9px] text-sky/80">
                  Zero Hidden Fees · Real-time Catalog
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                className="p-1 rounded-md hover:bg-white/10 text-sky hover:text-white transition-colors cursor-pointer"
                title="Reset Conversation"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md hover:bg-white/10 text-sky hover:text-white transition-colors cursor-pointer"
                title="Close Window"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="bg-sky/60 border-b border-line px-2.5 py-1.5 shrink-0 flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
            <Sparkles className="w-3 h-3 text-ocean shrink-0" />
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(prompt)}
                className="px-2 py-0.5 rounded-full bg-white border border-line hover:border-ocean text-[10px] font-semibold text-slate hover:text-ink whitespace-nowrap transition-all cursor-pointer shadow-2xs"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Message Stream */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[90%] rounded-xl p-2.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-ocean text-white rounded-br-xs shadow-xs'
                      : 'bg-white text-ink border border-line rounded-bl-xs shadow-subtle'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Recommendation Cards */}
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="mt-2 space-y-1.5 pt-1.5 border-t border-line/60">
                      {msg.recommendations.map((rec) => (
                        <Link
                          key={rec.id}
                          href={rec.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg border border-line hover:border-ocean bg-sky/30 hover:bg-white transition-all group block"
                        >
                          <div className="w-10 h-10 rounded-md overflow-hidden shrink-0 bg-slate-100">
                            <SafeImage
                              src={rec.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80'}
                              alt={rec.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[11px] font-bold text-ink truncate group-hover:text-ocean">
                                {rec.title}
                              </span>
                              {rec.badge && (
                                <span className="text-[8px] font-extrabold px-1 py-0.2 rounded bg-sky-deep text-ocean shrink-0">
                                  {rec.badge}
                                </span>
                              )}
                            </div>
                            <div className="text-[9px] text-slate truncate">
                              {rec.subtitle}
                            </div>
                            {rec.price > 0 && (
                              <div className="text-[11px] font-black text-ink mt-0.5">
                                {formatPrice(rec.price)}{' '}
                                <span className="text-[8px] font-normal text-slate">
                                  (Net Total)
                                </span>
                              </div>
                            )}
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate group-hover:text-ocean shrink-0 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <span className="text-[9px] text-slate-muted mt-0.5 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-slate bg-white border border-line rounded-xl px-2.5 py-1.5 text-xs w-fit animate-calm">
                <span className="w-1.5 h-1.5 rounded-full bg-ocean animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-ocean animate-bounce [animation-delay:0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-ocean animate-bounce [animation-delay:0.3s]" />
                <span className="text-[10px] font-medium text-slate pl-1">
                  Searching transparent inventory...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-2.5 bg-white border-t border-line shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-1.5"
            >
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Ask about hotels, trains, flight prices..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-line bg-sky/30 text-xs text-ink placeholder:text-slate-muted focus:border-ocean focus:outline-none focus:bg-white transition-colors"
              />
              <button
                type="submit"
                disabled={!inputVal.trim()}
                className="btn-primary p-1.5 rounded-lg text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Send Message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <div className="flex items-center justify-between text-[9px] text-slate-muted pt-1.5 px-0.5">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-green" />
                <span>Anti-Drip Guard</span>
              </span>
              <span>Verified Fares · 24/7</span>
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
