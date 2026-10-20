'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  Volume2, 
  X, 
  Radio
} from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

export interface VoiceCommandResult {
  rawText: string;
  mode?: 'stays' | 'flights' | 'trains' | 'cabs';
  city?: string;
  origin?: string;
  destination?: string;
  keyword?: string;
  category?: 'all' | 'Airport Transfer' | 'Outstation Intercity' | 'Electric';
  typeFilter?: 'all' | 'Vande Bharat' | 'Rajdhani' | 'Tejas' | 'Jan Shatabdi';
}

interface VoiceSearchButtonProps {
  onVoiceCommand: (result: VoiceCommandResult) => void;
  className?: string;
}

export interface IndianCityConfig {
  name: string;
  code: string;
  aliases: string[];
}

export const INDIAN_CITIES_REGISTRY: IndianCityConfig[] = [
  { name: 'Mumbai', code: 'BOM', aliases: ['mumbai', 'bombay', 'bom', 'csmt', 'bandra', 'thane', 'dadar'] },
  { name: 'Delhi NCR', code: 'DEL', aliases: ['delhi', 'new delhi', 'delhi ncr', 'gurgaon', 'gurugram', 'noida', 'del', 'ndls', 'nizamuddin'] },
  { name: 'Goa', code: 'GOI', aliases: ['goa', 'madgaon', 'margao', 'panaji', 'panjim', 'calangute', 'baga', 'vagator', 'anjuna', 'goi', 'gox', 'mao'] },
  { name: 'Pune', code: 'PNQ', aliases: ['pune', 'poona', 'hinjewadi', 'pnq'] },
  { name: 'Bengaluru', code: 'BLR', aliases: ['bengaluru', 'bangalore', 'blr'] },
  { name: 'Hyderabad', code: 'HYD', aliases: ['hyderabad', 'secunderabad', 'hyd'] },
  { name: 'Chennai', code: 'MAA', aliases: ['chennai', 'madras', 'maa'] },
  { name: 'Kolkata', code: 'CCU', aliases: ['kolkata', 'calcutta', 'ccu', 'howrah'] },
  { name: 'Jaipur', code: 'JAI', aliases: ['jaipur', 'jai'] },
  { name: 'Ahmedabad', code: 'AMD', aliases: ['ahmedabad', 'amd', 'adi'] },
  { name: 'Agra', code: 'AGC', aliases: ['agra', 'agc'] },
  { name: 'Varanasi', code: 'VNS', aliases: ['varanasi', 'banaras', 'kashi', 'vns', 'bsb'] },
  { name: 'Dehradun', code: 'DED', aliases: ['dehradun', 'ded'] },
  { name: 'Chandigarh', code: 'IXC', aliases: ['chandigarh', 'ixc'] },
  { name: 'Amritsar', code: 'ATQ', aliases: ['amritsar', 'atq'] },
  { name: 'Kochi', code: 'COK', aliases: ['kochi', 'cochin', 'cok'] },
  { name: 'Lucknow', code: 'LKO', aliases: ['lucknow', 'lko'] },
  { name: 'Surat', code: 'STV', aliases: ['surat', 'stv'] },
];

function findCity(str: string): IndianCityConfig | undefined {
  const normalized = str.toLowerCase();
  return INDIAN_CITIES_REGISTRY.find((city) =>
    city.aliases.some((alias) => {
      const regex = new RegExp(`(^|\\b)${alias}(\\b|$)`, 'i');
      return regex.test(normalized);
    })
  );
}

export const PRESET_VOICE_COMMANDS = [
  {
    label: '🚆 "Vande Bharat to Goa"',
    text: 'Vande Bharat train to Goa',
    mode: 'trains' as const,
    typeFilter: 'Vande Bharat' as const,
    destination: 'Goa',
    keyword: 'Vande Bharat',
    desc: 'Switches to Trains and filters 160 km/h Vande Bharat Express to Madgaon (Goa)',
  },
  {
    label: '🚆 "Rajdhani to Delhi"',
    text: 'Rajdhani express to Delhi',
    mode: 'trains' as const,
    typeFilter: 'Rajdhani' as const,
    destination: 'Delhi',
    keyword: 'Rajdhani',
    desc: 'Switches to Trains and filters premium Tejas Rajdhani Express sleeper to Delhi',
  },
  {
    label: '🚖 "Airport cab in Mumbai"',
    text: 'Airport cab in Mumbai',
    mode: 'cabs' as const,
    category: 'Airport Transfer' as const,
    city: 'Mumbai',
    keyword: 'Airport',
    desc: 'Switches to Cabs with upfront toll-included Airport Transfer fleet',
  },
  {
    label: '🚖 "Cab to Pune"',
    text: 'Outstation cab to Pune',
    mode: 'cabs' as const,
    category: 'Outstation Intercity' as const,
    keyword: 'Pune',
    desc: 'Switches to Cabs and filters Mumbai-Pune expressway outstation cabs',
  },
  {
    label: '✈️ "Flights from Mumbai to Delhi"',
    text: 'Flights from Mumbai to Delhi',
    mode: 'flights' as const,
    origin: 'BOM',
    destination: 'DEL',
    keyword: 'Delhi',
    desc: 'Switches to Flights on the BOM → DEL business route with honest upfront fare breakdown',
  },
  {
    label: '✈️ "Flights from Delhi to Goa"',
    text: 'Flights from Delhi to Goa',
    mode: 'flights' as const,
    origin: 'DEL',
    destination: 'GOI',
    keyword: 'Goa',
    desc: 'Switches to Flights to Dabolim (GOI) with no hidden drip fees',
  },
  {
    label: '🏨 "Show hotels in Goa"',
    text: 'Show hotels in Goa',
    mode: 'stays' as const,
    city: 'Goa',
    keyword: 'Goa',
    desc: 'Switches to Stays and filters verified beachfront resorts in Goa',
  },
  {
    label: '🏨 "5-star luxury stays in Mumbai"',
    text: '5-star luxury stays in Mumbai',
    mode: 'stays' as const,
    city: 'Mumbai',
    keyword: 'Taj',
    desc: 'Finds top-rated 5-star heritage properties in South Mumbai',
  },
];

export function parseVoiceInput(text: string): VoiceCommandResult {
  const lower = text.toLowerCase().trim();
  const result: VoiceCommandResult = { rawText: text };

  // 1. Explicit Train Brand & Keyword Detection
  const isVandeBharat = /\bvande\s+bharat\b/i.test(lower);
  const isRajdhani = /\brajdhani\b/i.test(lower);
  const isTejas = /\btejas\b/i.test(lower);
  const isShatabdi = /\b(?:jan\s+)?shatabdi\b/i.test(lower);
  const isGatimaan = /\bgatimaan\b/i.test(lower);
  const isGenericTrain = /\b(train|trains|rail|railway|irctc|express|sleeper)\b/i.test(lower);

  if (isVandeBharat || isRajdhani || isTejas || isShatabdi || isGatimaan || isGenericTrain) {
    result.mode = 'trains';
    if (isVandeBharat) {
      result.typeFilter = 'Vande Bharat';
      result.keyword = 'Vande Bharat';
    } else if (isRajdhani) {
      result.typeFilter = 'Rajdhani';
      result.keyword = 'Rajdhani';
    } else if (isTejas) {
      result.typeFilter = 'Tejas';
      result.keyword = 'Tejas';
    } else if (isShatabdi) {
      result.typeFilter = 'Jan Shatabdi';
      result.keyword = 'Shatabdi';
    } else if (isGatimaan) {
      result.keyword = 'Gatimaan';
    }
  }

  // 2. Explicit Cab Type & Keyword Detection
  const isAirportCab =
    /\bairport\s+(?:cab|taxi|transfer|car)\b/i.test(lower) ||
    /\b(?:cab|taxi|transfer)\s+(?:to|from)\s+airport\b/i.test(lower) ||
    (/\bairport\b/i.test(lower) && /\b(cab|taxi|transfer|ride)\b/i.test(lower));

  const isEvCab = /\b(electric|ev|green)\s+(?:cab|taxi|car|ride)\b/i.test(lower);
  const isOutstation =
    /\b(outstation|intercity|highway)\b/i.test(lower) ||
    /\b(?:cab|taxi)\s+(?:to|towards)\s+(?:pune|goa|agra|mumbai|delhi|jaipur)\b/i.test(lower);

  const isGenericCab = /\b(cab|cabs|taxi|taxis|car\s+rental)\b/i.test(lower);

  if (!result.mode && (isAirportCab || isEvCab || isOutstation || isGenericCab)) {
    result.mode = 'cabs';
  }

  if (result.mode === 'cabs') {
    if (isAirportCab) {
      result.category = 'Airport Transfer';
      result.keyword = 'Airport';
    } else if (isEvCab) {
      result.category = 'Electric';
      result.keyword = 'Electric';
    } else if (isOutstation) {
      result.category = 'Outstation Intercity';
    }
  }

  // 3. Stays and Flights Mode Detection (if not yet assigned)
  if (!result.mode) {
    if (/\b(hotel|hotels|stay|stays|resort|resorts|villa|villas|room|rooms|homestay|palace|heritage|5-star)\b/i.test(lower)) {
      result.mode = 'stays';
    } else if (/\b(flight|flights|fly|flying|plane|air|airline|airlines|indigo|air\s+india|vistara|spicejet)\b/i.test(lower)) {
      result.mode = 'flights';
    }
  }

  // 4. Dynamic Route Extraction: "(from) [City A] to [City B]"
  const routeRegex = /(?:from\s+)?([a-z\s]+?)\s+(?:to|towards|-|>)\s+([a-z\s]+)/i;
  const routeMatch = lower.match(routeRegex);

  if (routeMatch) {
    const rawOrigin = routeMatch[1].trim();
    const rawDest = routeMatch[2].trim();

    const originCity = findCity(rawOrigin);
    const destCity = findCity(rawDest);

    if (originCity && destCity) {
      result.origin = originCity.code;
      result.destination = destCity.code;
      result.city = destCity.name;

      if (!result.mode) {
        result.mode = 'flights';
      }
      if (!result.keyword) {
        result.keyword = destCity.name;
      }
      return result;
    } else if (destCity) {
      result.destination = destCity.code;
      result.city = destCity.name;
      if (!result.keyword) {
        result.keyword = destCity.name;
      }
    }
  }

  // 5. Single / Mentioned City Extraction across all Indian Cities
  for (const city of INDIAN_CITIES_REGISTRY) {
    const isPresent = city.aliases.some((alias) => {
      const rx = new RegExp(`(^|\\b)${alias}(\\b|$)`, 'i');
      return rx.test(lower);
    });

    if (isPresent) {
      if (!result.city) result.city = city.name;
      if (!result.destination) result.destination = city.code;

      if (result.mode === 'stays') {
        result.keyword = result.keyword || city.name;
      } else if (result.mode === 'trains') {
        result.destination = city.name;
        if (!result.keyword) result.keyword = city.name;
      } else if (result.mode === 'cabs') {
        if (!result.category) {
          result.category = 'Outstation Intercity';
        }
        if (!result.keyword || result.keyword === 'Airport') {
          result.keyword = result.keyword || city.name;
        }
      } else if (result.mode === 'flights') {
        result.destination = city.code;
        result.keyword = result.keyword || city.name;
      }
      break;
    }
  }

  // Default mode if route is detected without mode
  if (!result.mode) {
    if (result.origin && result.destination) {
      result.mode = 'flights';
    } else {
      result.mode = 'stays';
    }
  }

  return result;
}

export function VoiceSearchButton({ onVoiceCommand, className = '' }: VoiceSearchButtonProps) {
  const toast = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = 
        (window as any).SpeechRecognition || 
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        setIsSupported(true);
      }
    }

    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {}
    };
  }, []);

  const parseAndExecuteCommand = (text: string) => {
    const result = parseVoiceInput(text);

    // Optional audio confirmation via Web Speech Synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        const utter = new SpeechSynthesisUtterance(
          `Switching to ${result.mode || 'travel'} for ${result.destination || result.keyword || result.city || 'your search'}.`
        );
        utter.rate = 1.05;
        window.speechSynthesis.speak(utter);
      } catch {
        // Safe ignore
      }
    }

    toast.success(`Voice Recognized: "${text}"`, 'Voice Search Action');
    onVoiceCommand(result);
    setIsListening(false);
    setShowDemoModal(false);
  };

  const handleToggleVoice = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSupported) {
      toast.info('Microphone speech recognition is not supported in this browser. Opening voice intent simulator.', 'Voice Simulator');
      setShowDemoModal(true);
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (err) {
        console.warn('[VoiceSearch] Error stopping speech recognition:', err);
      }
      setIsListening(false);
      setInterimTranscript('');
      return;
    }

    try {
      // Re-instantiate SpeechRecognition on each start to ensure a fresh session in WebKit/Blink
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = 
        (window as any).SpeechRecognition || 
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setShowDemoModal(true);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setInterimTranscript('Listening... Speak now.');
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setInterimTranscript(currentTranscript);

        if (event.results[0]?.isFinal) {
          parseAndExecuteCommand(currentTranscript);
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        console.warn('[VoiceSearch] Speech recognition error:', event?.error);
        setIsListening(false);
        setInterimTranscript('');
        if (event?.error === 'not-allowed' || event?.error === 'service-not-allowed') {
          toast.info('Microphone access blocked. Opened interactive Voice Command Simulator.', 'Voice Simulator');
          setShowDemoModal(true);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('[VoiceSearch] Speech recognition failed to start:', err);
      setIsListening(false);
      setInterimTranscript('');
      toast.info('Microphone permission needed. Opening interactive simulator.', 'Voice Assistant');
      setShowDemoModal(true);
    }
  };

  const handlePresetSelect = (preset: typeof PRESET_VOICE_COMMANDS[0]) => {
    parseAndExecuteCommand(preset.text);
  };

  return (
    <>
      <div className={`relative inline-flex items-center ${className}`}>
        <button
          type="button"
          onClick={handleToggleVoice}
          className={`p-2 rounded-xl transition-all flex items-center justify-center cursor-pointer border ${
            isListening
              ? 'bg-red-500 text-white border-red-600 shadow-md animate-pulse ring-2 ring-red-300'
              : 'bg-sky hover:bg-sky-deep text-ocean border-line hover:border-ocean/30'
          }`}
          title={isListening ? 'Listening... click to stop' : 'Search by Voice or Test Simulator'}
          aria-label="Voice Search"
        >
          {isListening ? (
            <Radio className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Mic className="w-4 h-4 text-ocean" />
          )}
        </button>

        {/* Listening floating badge */}
        {isListening && (
          <div className="absolute right-0 top-11 z-30 bg-ink text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-modal flex items-center gap-2 whitespace-nowrap animate-fade-in border border-white/20">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
            <span>{interimTranscript || 'Listening...'}</span>
          </div>
        )}
      </div>

      {/* Interactive Voice Simulator & Demo Modal (Resolves sandbox/denied mic environments) */}
      {showDemoModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-md w-full border border-line shadow-modal p-6 space-y-4 animate-scale-in">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-deep text-ocean flex items-center justify-center font-bold">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-ink">
                    Farways Voice Command Center
                  </h3>
                  <p className="text-xs text-slate">
                    Native Web Speech API with expanded NLP intent parsing.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDemoModal(false)}
                className="p-1 rounded-lg hover:bg-sky text-slate hover:text-ink cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-sky/50 border border-sky-deep text-xs text-slate">
              <span className="font-bold text-ink block mb-0.5">Hands-Free Multi-Modal Search:</span>
              Spoken intent automatically switches modes (Hotels, Flights, Trains, Cabs) and applies target routes & filters across major Indian cities.
            </div>

            {/* Quick Test Voice Commands */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate block">
                Tap Any Command to Execute Live Spoken Intent:
              </label>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {PRESET_VOICE_COMMANDS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className="w-full text-left p-3 rounded-xl border border-line hover:border-ocean hover:bg-sky/40 transition-all cursor-pointer group"
                  >
                    <div className="text-xs font-bold text-ink group-hover:text-ocean flex items-center justify-between">
                      <span>{preset.label}</span>
                      <span className="text-[10px] uppercase font-bold text-slate bg-white px-2 py-0.5 rounded border border-line">
                        {preset.mode}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate mt-0.5">
                      {preset.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-line flex items-center justify-between text-xs text-slate">
              <span>Supports Chrome, Edge, Safari, & Firefox</span>
              <button
                type="button"
                onClick={() => setShowDemoModal(false)}
                className="btn-secondary py-1.5 px-3 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
