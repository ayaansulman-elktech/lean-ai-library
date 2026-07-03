import { Code, Download, Tag } from 'lucide-react';
import { AssetIndex } from '@/lib/types/asset';
import { AssetBadge } from './AssetBadge';

interface AssetHeaderProps {
  asset: AssetIndex;
}

export function AssetHeader({ asset }: AssetHeaderProps) {
  const { metadata, assets, repository } = asset;
  
  return (
    <div className="mb-12 border-b border-border pb-10">
      {assets.cover && (
        <div className="w-full h-64 md:h-80 bg-muted rounded-2xl overflow-hidden mb-8 border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={`/generated/content/${metadata.category}/${metadata.id}/assets/${assets.cover}`}
            alt={metadata.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <AssetBadge type={metadata.type} />
            <span className="text-sm font-medium text-muted-foreground capitalize bg-secondary px-2.5 py-0.5 rounded-full">
              {metadata.category}
            </span>
            {metadata.version && (
              <span className="text-sm font-medium text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
                v{metadata.version}
              </span>
            )}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
            {metadata.name}
          </h1>
          
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mb-6">
            {metadata.description}
          </p>

          {metadata.keywords && metadata.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {metadata.keywords.map(k => (
                <span key={k} className="inline-flex items-center gap-1 text-xs font-medium bg-muted text-muted-foreground px-2 py-1 rounded-md border border-border">
                  <Tag className="w-3 h-3" />
                  {k}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 min-w-48">
          {repository?.url && (
            <a 
              href={`${repository.url}/tree/${repository.branch}/${repository.path}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Code className="w-4 h-4" />
              View Source
            </a>
          )}
          
          {/* Example generic download action */}
          <button 
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-secondary text-secondary-foreground font-medium rounded-lg hover:bg-secondary/80 transition-colors shadow-sm border border-border"
          >
            <Download className="w-4 h-4" />
            Clone
          </button>
        </div>
      </div>
    </div>
  );
}
