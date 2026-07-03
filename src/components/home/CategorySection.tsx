import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AssetCard } from '../asset/AssetCard';
import { CatalogItem } from '@/lib/api/api';

interface CategorySectionProps {
  title: string;
  categoryId: string;
  assets: CatalogItem[];
}

export function CategorySection({ title, categoryId, assets }: CategorySectionProps) {
  if (!assets || assets.length === 0) return null;

  return (
    <section className="py-12 px-6 md:px-8 max-w-7xl mx-auto border-t border-border/50">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">{title}</h2>
        <Link 
          href={`/categories/${categoryId}`} 
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          View all <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {assets.slice(0, 4).map(asset => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
      </div>
    </section>
  );
}
