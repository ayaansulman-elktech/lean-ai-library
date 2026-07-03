import { Hero } from '@/components/home/Hero';
import { SearchBar } from '@/components/search/SearchBar';
import { CategorySection } from '@/components/home/CategorySection';
import { getCatalog, getCategories, CatalogItem } from '@/lib/api/api';

export default function Home() {
  const catalog = getCatalog();
  const categories = getCategories();

  // Group assets by category to render the sections
  const assetsByCategory = categories.reduce((acc, category) => {
    acc[category.id] = catalog.filter(asset => asset.category === category.id);
    return acc;
  }, {} as Record<string, CatalogItem[]>);

  // We can also have a Featured section if requested, but for now we'll just render the category sections.
  // The user specifically asked for "Featured Assets" (Latest 6 assets)
  const featuredAssets = [...catalog].slice(0, 6); // Normally we'd sort by date or featured flag

  return (
    <div className="min-h-screen pb-24">
      <Hero />
      <SearchBar />
      
      {featuredAssets.length > 0 && (
        <CategorySection 
          title="Featured Assets" 
          categoryId="all" 
          assets={featuredAssets} 
        />
      )}

      {categories.map(category => (
        <CategorySection 
          key={category.id}
          title={category.title}
          categoryId={category.id}
          assets={assetsByCategory[category.id]}
        />
      ))}
    </div>
  );
}
