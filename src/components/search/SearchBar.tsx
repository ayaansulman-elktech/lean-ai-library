'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';
import { SearchDialog } from './SearchDialog';

export function SearchBar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="w-full max-w-2xl mx-auto px-6 mb-16">
        <button 
          onClick={() => setOpen(true)}
          className="w-full relative flex items-center gap-3 px-6 py-4 bg-card hover:bg-accent border border-border rounded-2xl shadow-sm text-left transition-all duration-200 hover:shadow-md group"
        >
          <Search className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="text-lg text-muted-foreground group-hover:text-primary transition-colors">
            Search agents, models, libraries...
          </span>
          <div className="absolute right-4 flex items-center gap-1">
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted rounded border border-border">
              <span className="text-sm">⌘</span>K
            </kbd>
          </div>
        </button>
      </div>
      
      <SearchDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
