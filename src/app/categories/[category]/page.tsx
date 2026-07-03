import { notFound } from 'next/navigation';
import { getCatalog, getCategories } from '@/lib/api/api';
import { AssetCard } from '@/components/asset/AssetCard';

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

// Generate static params for SSG
export function generateStaticParams() {
  const categories = getCategories();
  return categories.map((cat) => ({
    category: cat.id,
  }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: categoryId } = await params;
  
  const categories = getCategories();
  const category = categories.find(c => c.id === categoryId);
  
  if (!category) {
    notFound();
  }

  const catalog = getCatalog();
  const assets = catalog.filter(a => a.category === categoryId);

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 min-h-screen">
      <div className="mb-12 border-b border-border pb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          {category.title}
        </h1>
        <p className="text-xl text-muted-foreground">
          {assets.length} {assets.length === 1 ? 'Asset' : 'Assets'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {assets.map((asset) => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
      </div>
    </div>
  );
}
