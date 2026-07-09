import { cn } from '@/lib/utils';
import { Asset } from '@/lib/types/asset';

interface AssetBadgeProps {
  type: Asset['type'];
  className?: string;
}

export function AssetBadge({ type, className }: AssetBadgeProps) {
  const variants: Record<Asset['type'], string> = {
    agent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    library: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    model: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    application: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    pipeline: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300 border-pink-200 dark:border-pink-800',
    other: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
    pdf: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
    md: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    folder: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    fileorother: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
  };

  const labels: Record<Asset['type'], string> = {
    agent: 'Agent',
    library: 'Library',
    model: 'Model',
    application: 'App',
    pipeline: 'Pipeline',
    other: 'Other',
    pdf: 'PDF',
    md: 'Document',
    folder: 'Folder',
    fileorother: 'File',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variants[type] || variants.other,
        className
      )}
    >
      {labels[type] || labels.other}
    </span>
  );
}
