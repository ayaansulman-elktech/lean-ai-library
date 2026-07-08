'use client';

import { useState } from 'react';
import { Apple } from 'lucide-react';

interface CoverImageProps {
  id: string;
  name: string;
  fallbackSrc?: string | null;
}

function CoverOverlay({ name }: { name: string }) {
  return (
    <div className="absolute inset-0 flex flex-col justify-center px-[31px] text-black">
      <Apple className="mb-[11px] h-[18px] w-[18px]" fill="currentColor" />
      <h3 className="text-[24px] font-bold leading-[1.1] tracking-[0] pr-4 line-clamp-3">{name}</h3>
    </div>
  );
}

export function CoverImage({ name, fallbackSrc }: CoverImageProps) {
  const [error, setError] = useState(false);

  const colors = ['bg-[#dfeeff]', 'bg-[#ffe4e1]', 'bg-[#e0ffff]', 'bg-[#fffacd]', 'bg-[#e6e6fa]', 'bg-[#f0fff0]'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const bgColor = colors[Math.abs(hash) % colors.length];

  if (error || !fallbackSrc) {
    return (
      <div className={`relative h-full w-full ${bgColor} transition-all duration-200 group-hover/cover:brightness-[0.62]`}>
        <CoverOverlay name={name} />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full transition-all duration-200 group-hover/cover:brightness-[0.62]">
      <img
        src={fallbackSrc}
        alt={name}
        className="h-full w-full object-cover"
        loading="lazy"
        onError={() => setError(true)}
      />
      <CoverOverlay name={name} />
    </div>
  );
}
