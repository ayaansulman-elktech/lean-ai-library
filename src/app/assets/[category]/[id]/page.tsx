import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
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
    <div className="h-[100dvh] w-full px-[40px] pt-6 pb-6 flex flex-col overflow-hidden">
      <nav className="shrink-0 mb-4 md:mb-6 flex items-center text-[14px] leading-none text-black">
        <Link href={`/categories/${category}`} className="inline-flex items-center gap-2 transition-colors hover:text-[#007aff]">
          <ArrowLeft className="h-4 w-4" />
          back to previous page
        </Link>
      </nav>

      <div className="flex-1 min-h-0 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_400px] xl:grid-cols-[minmax(0,1fr)_480px] lg:gap-[31px]">
        <AssetViewer
          category={category}
          assetName={assetIndex.metadata.name}
          fileTree={assetIndex.fileTree}
          readmeContent={readmeContent}
          skillContent={skillContent}
          repository={assetIndex.repository}
        />

        <AssetSidebar asset={assetIndex} />
      </div>
    </div>
  );
}
