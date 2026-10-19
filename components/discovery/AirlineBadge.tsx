import React from 'react';

interface AirlineBadgeProps {
  code: string;
  name: string;
}

export function AirlineBadge({ code, name }: AirlineBadgeProps) {
  // Brand color tokens tailored for airline recognition without visual clutter
  const getAirlineStyles = (c: string) => {
    switch (c) {
      case '6E':
        return {
          bg: 'bg-[#001b94]',
          text: 'text-white',
          border: 'border-[#001b94]',
          accent: 'IndiGo Blue',
        };
      case 'AI':
        return {
          bg: 'bg-[#E31B23]',
          text: 'text-white',
          border: 'border-[#E31B23]',
          accent: 'Air India Crimson',
        };
      case 'QP':
        return {
          bg: 'bg-[#FF5A00]',
          text: 'text-white',
          border: 'border-[#FF5A00]',
          accent: 'Akasa Sunrise',
        };
      case 'UK':
        return {
          bg: 'bg-[#581145]',
          text: 'text-white',
          border: 'border-[#581145]',
          accent: 'Vistara Aubergine',
        };
      case 'EK':
        return {
          bg: 'bg-[#D71921]',
          text: 'text-white',
          border: 'border-[#D71921]',
          accent: 'Emirates Red',
        };
      case 'SQ':
        return {
          bg: 'bg-[#00266B]',
          text: 'text-amber-300',
          border: 'border-[#00266B]',
          accent: 'Singapore Gold',
        };
      case 'QR':
        return {
          bg: 'bg-[#5C0632]',
          text: 'text-white',
          border: 'border-[#5C0632]',
          accent: 'Qatar Burgundy',
        };
      case 'SG':
        return {
          bg: 'bg-[#F32424]',
          text: 'text-white',
          border: 'border-[#F32424]',
          accent: 'SpiceJet Red',
        };
      default:
        return {
          bg: 'bg-ocean',
          text: 'text-white',
          border: 'border-ocean',
          accent: 'Standard',
        };
    }
  };

  const style = getAirlineStyles(code);

  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-9 h-9 rounded-xl ${style.bg} ${style.text} flex items-center justify-center font-extrabold text-xs tracking-wider shadow-sm shrink-0 border ${style.border}`}
        title={`${name} (${code})`}
      >
        {code}
      </div>
      <div>
        <div className="text-sm font-bold text-ink leading-tight">{name}</div>
        <div className="text-[10px] text-slate font-medium">Carrier Code {code}</div>
      </div>
    </div>
  );
}
