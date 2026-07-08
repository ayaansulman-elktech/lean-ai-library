import Link from 'next/link';
import { ArrowDown } from 'lucide-react';
import { CatalogItem } from '@/lib/api/api';

import { CoverImage } from './CoverImage';

interface AssetCardProps {
  asset: CatalogItem;
}

export function AssetCard({ asset }: AssetCardProps) {
  const href = `/assets/${asset.category}/${asset.id}`;
  
  const rawDesc = asset.shortDescription || 'lorem ipsum';
  // explicitly shorten the text string to satisfy the user request for a shorter description
  const displayDesc = rawDesc.length > 45 ? rawDesc.substring(0, 45).trim() + '...' : rawDesc;

  return (
    <Link href={href} className="block w-full max-w-[350px] cursor-pointer">
      <article className="flex flex-col gap-[18px]">
        <div className="group/cover h-[197px] w-full overflow-hidden rounded-[10px] bg-[#dfeeff]">
          <CoverImage
            id={asset.id}
            name={asset.name}
            fallbackSrc={asset.cover}
          />
        </div>

        <div className="flex h-[21px] w-full items-center justify-between gap-4">
          <p className="flex-1 min-w-0 truncate text-[18px] font-normal leading-none tracking-[0] text-[#242424]">
            {displayDesc}
          </p>

          <span className="group/download flex h-[21px] w-[21px] shrink-0 items-center justify-center rounded-full bg-[#e9e9e9] transition-colors hover:bg-[#007aff]">
            <ArrowDown
              className="h-[13px] w-[13px] text-white transition-colors"
              strokeWidth={3}
            />
          </span>
        </div>
      </article>
    </Link>
  );
}
