'use client';

import React, { useState, useEffect } from 'react';
import { Compass } from 'lucide-react';

export const DEFAULT_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80';

export interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  containerClassName?: string;
}

export function SafeImage({
  src,
  alt,
  fallbackSrc = DEFAULT_FALLBACK_IMAGE,
  className = '',
  containerClassName = '',
  ...props
}: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(src || fallbackSrc);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [hasFallbackError, setHasFallbackError] = useState<boolean>(false);

  // Synchronize when src changes
  useEffect(() => {
    setCurrentSrc(src || fallbackSrc);
    setIsLoading(true);
    setHasError(false);
    setHasFallbackError(false);
  }, [src, fallbackSrc]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
    } else {
      setHasFallbackError(true);
      setIsLoading(false);
    }
  };

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {/* Shimmer / Skeleton Loading State (Nielsen Visibility of System Status) */}
      {isLoading && !hasFallbackError && (
        <div className="absolute inset-0 z-10 bg-slate/10 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-white/40 flex items-center justify-center text-slate-muted">
            <Compass className="w-4 h-4 animate-spin" />
          </div>
        </div>
      )}

      {/* Extreme Fallback: Clean SVG Canvas with Farways Compass Branding */}
      {hasFallbackError ? (
        <div className="w-full h-full min-h-[140px] bg-gradient-to-br from-sky to-sky-deep flex flex-col items-center justify-center text-slate p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-white shadow-subtle flex items-center justify-center text-ocean mb-2">
            <Compass className="w-5 h-5 text-ocean" />
          </div>
          <span className="text-xs font-bold text-ink">Farways Verified Experience</span>
          <span className="text-[10px] text-slate-muted mt-0.5">{alt}</span>
        </div>
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={currentSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          } ${className}`}
          loading="lazy"
          decoding="async"
          {...props}
        />
      )}
    </div>
  );
}
