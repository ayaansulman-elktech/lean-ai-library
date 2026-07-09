'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';
import { SearchDialog } from './SearchDialog';

export function SearchBar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mb-[54px] flex w-full justify-end">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group flex h-[45px] w-full items-center rounded-full bg-[#e8e8e8] px-[18px] text-left transition-colors hover:bg-[#dedede] sm:w-[386px]"
          aria-label="Open search"
        >
          <Search className="h-[16px] w-[16px] text-[#a5a5a5] transition-colors group-hover:text-[#7a7a7a]" strokeWidth={2} />
        </button>
      </div>

      <SearchDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
