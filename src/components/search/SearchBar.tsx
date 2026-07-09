'use client';

import { Search, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { searchAssets } from '@/lib/search/fuse';
import { SearchItem } from '@/lib/api/api';

export function SearchBar({ centered }: { centered?: boolean } = {}) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<SearchItem[]>([]);
  const [navigatingId, setNavigatingId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    setResults(searchAssets(query));
  }, [query]);

  // Close dropdown when route changes
  useEffect(() => {
    setIsFocused(false);
    setNavigatingId(null);
    setQuery('');
  }, [pathname]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showDropdown = isFocused && query.length > 0;

  return (
    <div className={`mb-[54px] flex w-full relative ${centered ? 'justify-center' : 'justify-end'}`} ref={containerRef}>
      <div
        className="group flex h-[55.6px] w-full items-center rounded-full bg-[#e8e8e8] px-[18px] transition-colors focus-within:bg-[#dedede] hover:bg-[#dedede] sm:w-[375px]"
      >
        <Search className="h-[16px] w-[16px] text-[#a5a5a5] transition-colors group-hover:text-[#7a7a7a] mr-2 shrink-0" strokeWidth={2} />
        <input
          type="text"
          className="flex-1 bg-transparent border-none outline-none text-[14px] text-black placeholder:text-[#a5a5a5]"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
        />
      </div>

      {showDropdown && (
        <div className="absolute top-[55px] right-0 z-50 w-full sm:w-[386px] bg-white border border-[#e4e4e4] rounded-[16px] shadow-lg max-h-[400px] overflow-y-auto">
          {results.length === 0 ? (
            <div className="py-6 text-center text-[#7a7a7a] text-[14px]">
              No results found for "{query}"
            </div>
          ) : (
            <div className="flex flex-col py-2">
              {results.map((item) => {
                const isNavigating = navigatingId === item.id;

                return (
                  <Link
                    key={`${item.category}-${item.id}`}
                    href={`/assets/${item.category}/${item.id}`}
                    onClick={() => setNavigatingId(item.id)}
                    className={`flex items-center justify-between gap-4 px-4 py-3 hover:bg-[#f5f5f5] transition-colors ${isNavigating ? 'opacity-50 pointer-events-none' : ''
                      }`}
                  >
                    <span className="text-[14px] font-medium text-black truncate">
                      {item.name}
                    </span>
                    {isNavigating && (
                      <Loader2 className="w-4 h-4 animate-spin text-[#a5a5a5] shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
