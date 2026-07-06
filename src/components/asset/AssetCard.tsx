import Link from 'next/link';
import { ArrowDown } from 'lucide-react';
import { CatalogItem } from '@/lib/api/api';

import { CoverImage } from './CoverImage';

interface AssetCardProps {
  asset: CatalogItem;
}

export function AssetCard({ asset }: AssetCardProps) {
  const href = `/assets/${asset.category}/${asset.id}`;

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

        <div className="flex h-[21px] w-full items-center justify-between">
          <p className="truncate pr-4 text-[18px] font-normal leading-none tracking-[0] text-[#242424]">
            {asset.shortDescription || 'lorem ipsum'}
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
