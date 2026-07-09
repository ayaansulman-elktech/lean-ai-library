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

      <div className="relative mx-auto w-full px-4 md:px-[180px]">
        <SearchBar />

        <div className="pt-0">
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
        <div className="pt-[60px]">
          <h2 className="text-[18px] font-bold tracking-[0] text-black mb-[16px]">Manifesto</h2>
          <p className="text-[14px] font-normal leading-[1.6] text-[#3c3c3c] mb-[16px]">
            The Cognitive Shift Project is an independent research initiative focused on cognitive AI architectures and formal representations of intelligence. It supports open, iterative research where ideas can be shared, criticized, improved, and evaluated without depending entirely on traditional institutional paths.
          </p>
          <a href="/manifesto" className="text-[#007aff] hover:underline text-[14px]">
            read our full manifesto
          </a>
        </div>
      </div>
    </div>
  );
}
