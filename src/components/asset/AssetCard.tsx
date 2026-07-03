import Link from 'next/link';
import { Github } from 'lucide-react';
import { AssetBadge } from './AssetBadge';
import { CatalogItem } from '@/lib/api/api';

interface AssetCardProps {
  asset: CatalogItem;
}

export function AssetCard({ asset }: AssetCardProps) {
  // We use the generated hierarchy path for routing: /assets/[category]/[id]
  const href = `/assets/${asset.category}/${asset.id}`;

  return (
    <Link href={href} className="group block h-full">
      <article className="h-full flex flex-col rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 overflow-hidden relative">
        {asset.cover && (
          <div className="w-full h-40 bg-muted border-b overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={asset.cover} 
              alt={asset.name} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        )}
        
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <AssetBadge type={asset.type} />
            <Github className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          <h3 className="text-lg font-semibold leading-tight tracking-tight mb-2 group-hover:text-primary">
            {asset.name}
          </h3>
          
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
            {asset.shortDescription}
          </p>
          
        </div>
      </article>
    </Link>
  );
}
