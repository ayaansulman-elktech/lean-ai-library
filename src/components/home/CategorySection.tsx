import { AssetCard } from '../asset/AssetCard';
import { CatalogItem } from '@/lib/api/api';

interface CategorySectionProps {
  title: string;
  description?: string;
  categoryId: string;
  assets: CatalogItem[];
}

export function CategorySection({ title, description, assets }: CategorySectionProps) {
  if (!assets || assets.length === 0) return null;

  return (
    <section className="mb-[80px]">
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
        {assets.map(asset => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
      </div>
    </section>
  );
}
