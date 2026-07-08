import { Hero } from '@/components/home/Hero';
import { SearchBar } from '@/components/search/SearchBar';
import { CategorySection } from '@/components/home/CategorySection';
import { getCatalog, getCategories, CatalogItem } from '@/lib/api/api';

export default function Home() {
  const catalog = getCatalog();
  const categories = getCategories();

  const assetsByCategory = categories.reduce((acc, category) => {
    acc[category.id] = catalog.filter(asset => asset.category === category.id);
    return acc;
  }, {} as Record<string, CatalogItem[]>);

  return (
    <div className="w-full pb-[96px]">
      <Hero />

      <div className="relative mx-auto max-w-[1535px] px-[18px]">
        <SearchBar />

        <div className="pt-[11px]">
          {categories.map(category => (
            <CategorySection
              key={category.id}
              title={category.title}
              description={category.description}
              categoryId={category.id}
              assets={assetsByCategory[category.id]}
            />
          ))}
        </div>

        {/* Manifesto Section */}
        <div className="mt-20 pt-10 border-t border-[#d9d9d9]">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Manifesto</h2>
          <p className="text-[#333333] text-[16px] leading-[1.6] max-w-4xl mb-4">
            The Cognitive Shift Project is an independent research initiative focused on cognitive AI architectures and formal representations of intelligence. It supports open, iterative research where ideas can be shared, criticized, improved, and evaluated without depending entirely on traditional institutional paths.
          </p>
          <a href="/manifesto" className="text-[#007aff] hover:underline text-[16px]">
            Read the full manifesto
          </a>
        </div>
      </div>
    </div>
  );
}
