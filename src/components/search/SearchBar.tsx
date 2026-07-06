'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';
import { SearchDialog } from './SearchDialog';

export function SearchBar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mb-[21px] flex w-full justify-end">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group flex h-[55px] w-full items-center rounded-full bg-[#e6e6e6] px-[22px] text-left transition-colors hover:bg-[#dedede] sm:w-[386px]"
          aria-label="Open search"
        >
          <Search className="h-[18px] w-[18px] text-[#a5a5a5] transition-colors group-hover:text-[#7a7a7a]" strokeWidth={2.5} />
        </button>
      </div>

      <SearchDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
