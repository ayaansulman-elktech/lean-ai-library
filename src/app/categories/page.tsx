import Link from 'next/link';
import { ArrowRight, Folder } from 'lucide-react';
import { getCategories } from '@/lib/api/api';

export default function CategoriesPage() {
  const categories = getCategories();

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 min-h-screen">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Categories</h1>
        <p className="text-xl text-muted-foreground">
          Browse all asset categories in the Lean AI Library.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link 
            key={category.id} 
            href={`/categories/${category.id}`}
            className="group p-6 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all flex flex-col"
          >
            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <Folder className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-2 group-hover:text-primary transition-colors">
              {category.title}
            </h2>
            <div className="flex items-center text-muted-foreground mt-auto">
              <span className="font-medium">{category.count} assets</span>
              <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
