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
    <section className={`mb-[80px] ${isIosReady ? 'bg-[#efefed] rounded-[16px] py-[42px] px-[24px] -mx-[24px] sm:py-[64px] sm:px-[42px] sm:-mx-[42px]' : ''}`}>
      <div className="mb-[24px]">
        <h2 
          className="mb-[16px] font-bold text-black"
          style={{
            fontSize: '25.11px',
            letterSpacing: '0',
          }}
        >
          {title}
        </h2>
        {description && (
          <p 
            className="mb-[24px] text-black"
            style={{
              fontSize: '25.11px',
              fontWeight: 50,
              lineHeight: '1.5',
              letterSpacing: '0',
            }}
          >
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
          <Link href={`/categories/${categoryId}`} className="text-[#007aff] hover:underline text-[22px] font-medium">
            see all
          </Link>
        </div>
      )}
    </section>
  );
}
