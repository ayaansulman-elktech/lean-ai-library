import { notFound } from 'next/navigation';
import { getCatalog, getAssetIndex } from '@/lib/api/api';
import { getAssetReadme, getAssetSkill } from '@/lib/api/server';
import { AssetViewer } from '@/components/asset/AssetViewer';
import { AssetSidebar } from '@/components/asset/AssetSidebar';

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

  const readmeContent = assetIndex.content.hasReadme ? await getAssetReadme(category, id) : null;
  const skillContent = assetIndex.content.hasSkill ? await getAssetSkill(category, id) : null;

  return (
    <div className="min-h-screen w-full px-[28px] pt-[23px] pb-7">
      <div className="grid min-h-[1016px] grid-cols-1 gap-9 xl:grid-cols-[minmax(0,1fr)_500px]">
        <AssetViewer
          category={category}
          assetName={assetIndex.metadata.name}
          fileTree={assetIndex.fileTree}
          readmeContent={readmeContent}
          skillContent={skillContent}
        />

        <AssetSidebar asset={assetIndex} />
      </div>
    </div>
  );
}
