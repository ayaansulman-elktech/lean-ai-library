'use client';

import { useState, useRef, useEffect } from 'react';

interface CoverImageProps {
  id: string;
  name: string;
  fallbackSrc?: string | null;
}

function formatName(str: string) {
  if (!str) return str;
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function CoverOverlay({ name, id }: { name: string, id: string }) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const isApple = name.toLowerCase().includes('apple') || id.toLowerCase().includes('apple');
  const logoSrc = isApple ? `${basePath}/covers/Apple Logo.png` : `${basePath}/covers/Lean ai logo.png`;

  return (
    <div className="absolute inset-0 flex flex-col justify-center px-[31px] text-black">
      <img src={logoSrc} alt="Logo" className="mb-[11px] h-[18px] w-fit object-contain object-left" />
      <h3 className="text-[24px] font-bold leading-[1.1] tracking-[0] pr-4 line-clamp-3">{formatName(name)}</h3>
    </div>
  );
}

export function CoverImage({ name, fallbackSrc, id }: CoverImageProps) {
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Catch SSR hydration missed errors
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      if (imgRef.current.naturalWidth === 0) {
        setError(true);
      }
    }
  }, [fallbackSrc]);

  // Treat literal 'null'/'undefined' strings as empty
  const isInvalidSrc = !fallbackSrc || fallbackSrc === 'null' || fallbackSrc === 'undefined';

  if (error || isInvalidSrc) {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    return (
      <div className="relative h-full w-full transition-all duration-200 group-hover/cover:brightness-[0.62]">
        <img 
          src={`${basePath}/covers/default_thumbnail.png`} 
          alt="Default Cover" 
          className="absolute inset-0 h-full w-full object-cover" 
        />
        <CoverOverlay name={name} id={id} />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full transition-all duration-200 group-hover/cover:brightness-[0.62]">
      <img
        ref={imgRef}
        src={fallbackSrc}
        alt={name}
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        onError={() => setError(true)}
      />
    </div>
  );
}
