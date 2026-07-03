import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getCatalog, getAssetIndex } from '@/lib/api/api';
import { getAssetReadme, getAssetSkill } from '@/lib/api/server';
import { AssetHeader } from '@/components/asset/AssetHeader';
import { SourceCard } from '@/components/asset/SourceCard';
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';
import { AssetCard } from '@/components/asset/AssetCard';

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
  
  const assetIndex = await getAssetIndex(category, id);
  if (!assetIndex) {
    notFound();
  }

  const catalog = getCatalog();

  // Lazy-load Markdown
  const readmeContent = assetIndex.content.hasReadme ? await getAssetReadme(category, id) : null;
  const skillContent = assetIndex.content.hasSkill ? await getAssetSkill(category, id) : null;

  // Resolve related assets
  const relatedAssets = (assetIndex.related || [])
    .map(relId => catalog.find(c => c.id === relId))
    .filter(Boolean) as typeof catalog;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8 min-h-screen">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href={`/categories/${category}`} className="hover:text-foreground transition-colors capitalize">
          {category}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-medium">{assetIndex.metadata.name}</span>
      </nav>

      {/* Main Asset Header */}
      <AssetHeader asset={assetIndex} />

      <div className="flex flex-col lg:flex-row gap-12 relative items-start">
        {/* Main Content Area */}
        <div className="flex-1 min-w-0 pb-16">
          
          {/* Overview Section */}
          <section id="overview" className="mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-6">Overview</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {assetIndex.metadata.description}
            </p>
          </section>

          {/* README Section */}
          {readmeContent && (
            <section className="mb-16">
              <MarkdownRenderer content={readmeContent} />
            </section>
          )}

          {/* SKILL Section */}
          {skillContent && (
            <section id="skill" className="mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-8 pb-2 border-b border-border">
                Skill Definition
              </h2>
              <div className="p-6 bg-card border border-border rounded-xl">
                <MarkdownRenderer content={skillContent} />
              </div>
            </section>
          )}

          {/* Dependencies Section */}
          {assetIndex.dependencies && assetIndex.dependencies.length > 0 && (
            <section id="dependencies" className="mb-16 pt-8 border-t border-border">
              <h2 className="text-2xl font-bold tracking-tight mb-6">Dependencies</h2>
              <div className="flex flex-wrap gap-3">
                {assetIndex.dependencies.map(dep => {
                  const depAsset = catalog.find(c => c.id === dep);
                  if (depAsset) {
                    return (
                      <Link key={dep} href={`/assets/${depAsset.category}/${dep}`} className="px-4 py-2 bg-muted hover:bg-accent border border-border rounded-lg text-sm font-medium transition-colors">
                        {depAsset.name}
                      </Link>
                    );
                  }
                  return (
                    <span key={dep} className="px-4 py-2 bg-muted border border-border rounded-lg text-sm font-medium text-muted-foreground">
                      {dep}
                    </span>
                  );
                })}
              </div>
            </section>
          )}

          {/* Related Assets Section */}
          {relatedAssets.length > 0 && (
            <section id="related" className="mb-16 pt-8 border-t border-border">
              <h2 className="text-2xl font-bold tracking-tight mb-6">Related Assets</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedAssets.map(rel => (
                  <AssetCard key={rel.id} asset={rel} />
                ))}
              </div>
            </section>
          )}

          {/* Source Information */}
          <section id="source">
            <SourceCard repo={assetIndex.repository} />
          </section>
        </div>

        {/* Right Sidebar: Table of Contents */}
        <aside className="hidden lg:block w-72 shrink-0 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 pb-8">
          <div className="mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">On this page</h3>
          </div>
          <nav className="flex flex-col gap-2 border-l-2 border-border/50 pl-4">
            <a href="#overview" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1">
              Overview
            </a>
            
            {/* Render dynamically computed TOC from index.json */}
            {assetIndex.toc.map((entry, idx) => (
              <a 
                key={`${entry.slug}-${idx}`} 
                href={`#${entry.slug}`} 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
                style={{ marginLeft: `${(entry.depth - 1) * 0.75}rem` }}
              >
                {entry.title}
              </a>
            ))}

            {skillContent && (
              <a href="#skill" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mt-2 py-1">
                Skill Definition
              </a>
            )}
            
            {assetIndex.dependencies?.length > 0 && (
              <a href="#dependencies" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mt-2 py-1">
                Dependencies
              </a>
            )}

            {relatedAssets.length > 0 && (
              <a href="#related" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1">
                Related Assets
              </a>
            )}

            <a href="#source" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mt-2 py-1">
              Source Information
            </a>
          </nav>
        </aside>
      </div>
    </div>
  );
}
