import Link from 'next/link';
import { AssetCard } from '../asset/AssetCard';
import { CatalogItem } from '@/lib/api/api';

interface CategorySectionProps {
  title: string;
  description?: string;
  categoryId: string;
  assets: CatalogItem[];
}

export function CategorySection({ title, description, categoryId, assets }: CategorySectionProps) {
  if (!assets || assets.length === 0) return null;

  const displayAssets = assets.slice(0, 8);
  const isIosReady = categoryId === 'ios-ready';

  return (
    <section className={`mb-[80px] ${isIosReady ? 'bg-[#efefed] rounded-[16px] p-[24px] sm:p-[42px]' : ''}`}>
      <div className="mb-[24px]">
        <h2 className="mb-[8px] text-[18px] font-bold leading-[1.2] tracking-[0] text-black">
          {title}
        </h2>
        {description && (
          <p className="text-[14px] font-normal leading-[1.45] tracking-[0] text-[#3c3c3c]">
            {description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-x-[54px] gap-y-[54px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayAssets.map(asset => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
      </div>

      {assets.length > 0 && (
        <div className="mt-[24px]">
          <Link href={`/categories/${categoryId}`} className="text-[#007aff] hover:underline text-[14px]">
            see all
          </Link>
        </div>
      )}
    </section>
  );
}
