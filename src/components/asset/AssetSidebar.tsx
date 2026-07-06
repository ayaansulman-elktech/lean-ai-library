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
    <aside className="flex w-full flex-col pt-9 xl:w-[500px]">
      <div className="h-[281px] w-full overflow-hidden rounded-[5px] bg-[#dfeeff]">
        <CoverImage id={asset.metadata.id} name={asset.metadata.name} fallbackSrc={asset.assets?.cover} />
      </div>

      <div className="pt-[35px]">
        <h1 className="text-[92px] font-bold leading-[0.94] tracking-[0] text-black">
          {asset.metadata.name || 'Big title'}
        </h1>
        <p className="mt-[49px] max-w-[486px] text-[24px] font-normal leading-[1.56] tracking-[0] text-[#161616]">
          {asset.metadata.description}
        </p>
      </div>

      <button
        type="button"
        onClick={handleDownload}
        className="mt-[34px] h-[44px] w-[173px] rounded-[13px] bg-[#007aff] text-[26px] font-normal leading-none text-white transition-colors hover:bg-[#006ee6]"
      >
        download
      </button>

      <div className="mt-[46px] flex h-[78px] w-full items-center justify-between rounded-[14px] bg-[#1f1f1f] px-[41px] text-white">
        <code className="font-mono text-[16px] leading-none tracking-[0] text-white">
          {npxCommand}
        </code>
        <button
          type="button"
          onClick={copyToClipboard}
          className="text-white transition-opacity hover:opacity-70"
          title="Copy command"
        >
          <Copy className="h-[22px] w-[22px]" strokeWidth={1.9} />
        </button>
      </div>

      <div className="mt-[76px] flex flex-col gap-[6px] text-[12px] leading-none tracking-[0] text-black">
        <span>version: {asset.metadata.version || '1.9'}</span>
        <span>last updated: {formatDate(asset.metadata.lastUpdated)}</span>
      </div>
    </aside>
  );
}
