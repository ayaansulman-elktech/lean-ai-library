'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';
import { searchAssets } from '@/lib/search/fuse';
import { SearchItem } from '@/lib/api/api';
import { AssetBadge } from '../asset/AssetBadge';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [navigatingId, setNavigatingId] = useState<string | null>(null);
  const pathname = usePathname();

  // Close dialog and reset loading state when route changes
  useEffect(() => {
    onOpenChange(false);
    setNavigatingId(null);
  }, [pathname, onOpenChange]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(true);
      }
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [onOpenChange]);

  useEffect(() => {
    setResults(searchAssets(query));
  }, [query]);

  // If dialog is closed, ensure navigatingId is reset
  useEffect(() => {
    if (!open) setNavigatingId(null);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center pt-[10vh] px-4">
      <div 
        className="fixed inset-0" 
        onClick={() => onOpenChange(false)} 
        aria-hidden="true"
      />
      
      <div className="relative w-full max-w-3xl bg-card border border-border rounded-xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center px-4 py-4 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground mr-3" />
          <input 
            autoFocus
            type="text" 
            placeholder="Search assets..." 
            className="flex-1 bg-transparent border-none outline-none text-lg text-foreground placeholder:text-muted-foreground"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={navigatingId !== null}
          />
          <button 
            onClick={() => onOpenChange(false)}
            className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors disabled:opacity-50"
            disabled={navigatingId !== null}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {query.trim() === '' ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Type to start searching...
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No results found for "{query}"
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {results.map((item) => {
                const isNavigating = navigatingId === item.id;
                
                return (
                  <Link 
                    key={`${item.category}-${item.id}`} 
                    href={`/assets/${item.category}/${item.id}`}
                    onClick={() => setNavigatingId(item.id)}
                    className={`flex items-center justify-between gap-4 px-4 py-3 rounded-lg transition-colors group ${
                      isNavigating ? 'bg-accent/50 pointer-events-none' : 'hover:bg-accent'
                    }`}
                  >
                    <div className="flex-1 flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          {item.name}
                        </span>
                        <AssetBadge type={item.type} className="shrink-0" />
                      </div>
                      <span className="text-sm text-muted-foreground line-clamp-1">
                        {item.description}
                      </span>
                    </div>
                    {isNavigating && (
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
