'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Volume2, 
  X, 
  HelpCircle, 
  CheckCircle2, 
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
}

interface VoiceSearchButtonProps {
  onVoiceCommand: (result: VoiceCommandResult) => void;
  className?: string;
}

const PRESET_VOICE_COMMANDS = [
  {
    label: '🏨 "Show hotels in Goa"',
    text: 'Show hotels in Goa',
    mode: 'stays' as const,
    city: 'Goa',
    keyword: 'Goa',
    desc: 'Switches to Stays and filters beachfront resorts in Goa',
  },
  {
    label: '✈️ "Flights from Mumbai to Delhi"',
    text: 'Flights from Mumbai to Delhi',
    mode: 'flights' as const,
    origin: 'BOM',
    destination: 'DEL',
    keyword: 'Delhi',
    desc: 'Switches to Flights on the BOM → DEL business route',
  },
  {
    label: '🚆 "Vande Bharat train to Goa"',
    text: 'Vande Bharat train to Goa',
    mode: 'trains' as const,
    keyword: 'Vande Bharat',
    desc: 'Switches to Trains and filters semi-high speed express',
  },
  {
    label: '🚖 "Airport cab in Mumbai"',
    text: 'Airport cab in Mumbai',
    mode: 'cabs' as const,
    keyword: 'Airport',
    desc: 'Switches to Cabs with upfront toll-included airport transfer',
  },
  {
    label: '🏨 "5-star luxury stays in Mumbai"',
    text: '5-star luxury stays in Mumbai',
    mode: 'stays' as const,
    city: 'Mumbai',
    keyword: 'Taj',
    desc: 'Finds top-rated 5-star heritage properties in Mumbai',
  },
];

export function VoiceSearchButton({ onVoiceCommand, className = '' }: VoiceSearchButtonProps) {
  const toast = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = 
        (window as any).SpeechRecognition || 
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        setIsSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-IN';

        recognition.onstart = () => {
          setIsListening(true);
          setInterimTranscript('Listening... Speak now.');
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setInterimTranscript(currentTranscript);

          if (event.results[0].isFinal) {
            parseAndExecuteCommand(currentTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('[VoiceSearch] Speech recognition error:', event.error);
          setIsListening(false);
          setInterimTranscript('');
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            toast.info('Microphone access blocked. Opened interactive Voice Command Simulator.', 'Voice Simulator');
            setShowDemoModal(true);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const parseAndExecuteCommand = (text: string) => {
    const lower = text.toLowerCase().trim();
    let result: VoiceCommandResult = { rawText: text };

    // Mode Detection
    if (lower.includes('hotel') || lower.includes('stay') || lower.includes('resort') || lower.includes('room')) {
      result.mode = 'stays';
    } else if (lower.includes('flight') || lower.includes('fly') || lower.includes('plane') || lower.includes('airline')) {
      result.mode = 'flights';
    } else if (lower.includes('train') || lower.includes('rail') || lower.includes('vande bharat') || lower.includes('rajdhani')) {
      result.mode = 'trains';
    } else if (lower.includes('cab') || lower.includes('taxi') || lower.includes('transfer') || lower.includes('car')) {
      result.mode = 'cabs';
    }

    // City & Location Detection
    if (lower.includes('goa')) {
      result.city = 'Goa';
      result.keyword = 'Goa';
    } else if (lower.includes('mumbai') || lower.includes('bombay')) {
      result.city = 'Mumbai';
      result.keyword = 'Mumbai';
    } else if (lower.includes('delhi') || lower.includes('gurgaon') || lower.includes('noida')) {
      result.city = 'Delhi NCR';
      result.keyword = 'Delhi';
    }

    // Route Detection for flights/cabs
    if (lower.includes('mumbai to delhi')) {
      result.mode = 'flights';
      result.origin = 'BOM';
      result.destination = 'DEL';
    } else if (lower.includes('delhi to goa')) {
      result.mode = 'flights';
      result.origin = 'DEL';
      result.destination = 'GOI';
    } else if (lower.includes('vande bharat')) {
      result.mode = 'trains';
      result.keyword = 'Vande Bharat';
    } else if (lower.includes('airport')) {
      result.keyword = 'Airport';
    }

    // Optional audio confirmation via Web Speech Synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        const utter = new SpeechSynthesisUtterance(
          `Found ${result.mode || 'options'} for ${result.keyword || result.city || 'your search'}.`
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

  const handleToggleVoice = () => {
    if (!isSupported) {
      setShowDemoModal(true);
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
      } catch (err) {
        // Already started or denied
        setShowDemoModal(true);
      }
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
                    Native Web Speech API with simulated voice execution.
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
              <span className="font-bold text-ink block mb-0.5">HCI Lab 8 Multimodal Accessibility:</span>
              Voice commands allow travelers with physical tremors or mobile driving scenarios to navigate modes without repetitive taps.
            </div>

            {/* Quick Test Voice Commands */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate block">
                Tap Any Command to Execute Live Voice Search:
              </label>

              <div className="space-y-2">
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
