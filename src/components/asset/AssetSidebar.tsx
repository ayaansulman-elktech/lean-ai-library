'use client';

import { Copy } from 'lucide-react';
import { AssetIndex } from '@/lib/types/asset';
import { CoverImage } from './CoverImage';

interface AssetSidebarProps {
  asset: AssetIndex;
}

function formatDate(value?: string) {
  if (!value) return '06/12/09';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
}

export function AssetSidebar({ asset }: AssetSidebarProps) {
  const npxCommand = asset.metadata.id ? `npx- cognitiveshift ${asset.metadata.id}` : 'npx- cognitiveshift knowledge';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(npxCommand);
  };

  const handleDownload = () => {
    const repoUrl = asset.repository?.url;
    if (repoUrl) {
      const zipUrl = `${repoUrl.replace(/\.git$/, '')}/archive/refs/heads/${asset.repository.branch || 'main'}.zip`;
      window.open(zipUrl, '_blank');
    }
  };

  return (
    <aside className="flex h-full w-full flex-col lg:w-[400px] xl:w-[480px]">
      <div className="shrink-0 aspect-video md:h-[270px] md:aspect-auto w-full overflow-hidden rounded-[8px] bg-[#dfeeff]">
        <CoverImage id={asset.metadata.id} name={asset.metadata.name} fallbackSrc={asset.assets?.cover} />
      </div>

      <div className="shrink-0 pt-6 md:pt-[24px]">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] xl:text-[76px] font-bold leading-[1] md:leading-[0.94] tracking-[-0.02em] text-black break-normal">
          {asset.metadata.name || 'Big title'}
        </h1>
      </div>
      
      <div className="shrink-0 mt-4 md:mt-[24px]">
        <p className="w-full text-lg sm:text-xl xl:text-[20px] font-normal leading-[1.5] xl:leading-[1.5] tracking-[0] text-[#161616]">
          {asset.metadata.description?.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')}
        </p>
      </div>

      <div className="shrink-0 pt-6 md:pt-[32px]">
        <button
          type="button"
          onClick={handleDownload}
          className="h-[44px] w-full sm:w-[150px] rounded-[13px] bg-[#007aff] text-xl md:text-[20px] font-medium leading-none text-white transition-colors hover:bg-[#006ee6]"
        >
          download
        </button>

        <div className="mt-4 md:mt-[24px] flex h-[60px] md:h-[68px] w-full items-center justify-between rounded-[14px] bg-[#1f1f1f] px-6 md:px-[24px] text-white">
          <code className="font-mono text-sm md:text-[14px] leading-none tracking-[0] text-white break-all pr-4">
            {npxCommand}
          </code>
          <button
            type="button"
            onClick={copyToClipboard}
            className="text-white transition-opacity hover:opacity-70 shrink-0"
            title="Copy command"
          >
            <Copy className="h-5 w-5 md:h-[20px] md:w-[20px]" strokeWidth={1.9} />
          </button>
        </div>

        <div className="mt-4 md:mt-[24px] flex flex-col gap-[6px] text-[12px] leading-none tracking-[0] text-black">
          <span>version: {asset.metadata.version || '1.9'}</span>
          <span>last updated: {formatDate(asset.metadata.lastUpdated)}</span>
        </div>
      </div>
    </aside>
  );
}
