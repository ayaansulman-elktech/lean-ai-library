import { notFound } from 'next/navigation';
import { getCatalog } from '@/lib/api/api';
import { AssetBadge } from '@/components/asset/AssetBadge';

interface AssetPageProps {
  params: Promise<{ category: string; id: string }>;
}

export function generateStaticParams() {
  const catalog = getCatalog();
  return catalog.map(asset => ({
    category: asset.category,
    id: asset.id
  }));
}

export default async function AssetPage({ params }: AssetPageProps) {
  const { category, id } = await params;
  
  const catalog = getCatalog();
  const asset = catalog.find(a => a.id === id && a.category === category);
  
  if (!asset) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 min-h-screen">
      {/* Header Section Scaffold */}
      <div className="mb-12 border-b border-border pb-8">
        <div className="flex items-center gap-3 mb-4">
          <AssetBadge type={asset.type} />
          <span className="text-sm font-medium text-muted-foreground capitalize">
            {asset.category}
          </span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
          {asset.name}
        </h1>
        
        <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
          {asset.shortDescription}
        </p>
      </div>

      {/* 
        Milestone 5 Scaffold 
        Here we will render Overview, README, SKILL, Dependencies, Examples, Related Assets 
      */}
      <div className="bg-muted/30 rounded-xl p-12 text-center border border-border border-dashed">
        <p className="text-muted-foreground text-lg">
          Detailed asset content will be implemented in Milestone 5.
        </p>
      </div>
    </div>
  );
}
