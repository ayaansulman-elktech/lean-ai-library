import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Home } from 'lucide-react';
import { getCatalog, getCategories } from '@/lib/api/api';
import { AssetCard } from '@/components/asset/AssetCard';

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

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
    <div className="mx-auto min-h-screen max-w-[1535px] px-[180px] pb-[96px] pt-[23px]">
      <nav className="mb-[56px] flex flex-wrap items-center gap-x-8 gap-y-3 text-[14px] leading-none text-black">
        <Link href="/categories" className="inline-flex items-center gap-[17px] transition-colors hover:text-[#007aff]">
          <ArrowLeft className="h-[19px] w-[19px]" strokeWidth={2} />
          back to categories
        </Link>
      </nav>

      <header className="mb-[48px] border-b border-[#d9d9d9] pb-[35px]">
        <h1 className="mb-[18px] text-[48px] font-bold leading-none tracking-[0] text-black">
          {category.title}
        </h1>
        <p className="text-[22px] font-normal leading-none tracking-[0] text-black">
          {assets.length} {assets.length === 1 ? 'Asset' : 'Assets'}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-x-[54px] gap-y-[58px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {assets.map((asset) => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
      </div>
    </div>
  );
}
