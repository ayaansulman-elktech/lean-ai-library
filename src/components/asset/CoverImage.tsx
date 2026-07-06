'use client';

import { useState } from 'react';
import { Apple } from 'lucide-react';

interface CoverImageProps {
  id: string;
  name: string;
  fallbackSrc?: string | null;
}

function CoverOverlay() {
  return (
    <div className="absolute inset-0 flex flex-col justify-center px-[31px] text-black">
      <Apple className="mb-[11px] h-[18px] w-[18px]" fill="currentColor" />
      <h3 className="text-[24px] font-bold leading-[0.9] tracking-[0]">Lorem</h3>
      <p className="text-[24px] font-normal leading-[0.96] tracking-[0]">Ipsum exfrasis</p>
    </div>
  );
}

export function CoverImage({ name, fallbackSrc }: CoverImageProps) {
  const [error, setError] = useState(false);
  const imgSrc = fallbackSrc || '/covers/tile-image.png';

  if (error) {
    return (
      <div className="relative h-full w-full bg-[#dfeeff] transition-all duration-200 group-hover/cover:brightness-[0.62]">
        <CoverOverlay />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full transition-all duration-200 group-hover/cover:brightness-[0.62]">
      <img
        src={imgSrc}
        alt={name}
        className="h-full w-full object-cover"
        loading="lazy"
        onError={() => setError(true)}
      />
      <CoverOverlay />
    </div>
  );
}
