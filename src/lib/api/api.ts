import catalogJson from '../../../generated/catalog.json';
import categoriesJson from '../../../generated/categories.json';
import manifestJson from '../../../generated/manifest.json';
import searchJson from '../../../generated/search.json';
import { Asset, AssetIndex } from '../types/asset';

// We can type these based on the structure we generated in Milestone 3
export interface CatalogItem {
  id: string;
  name: string;
  type: Asset['type'];
  category: string;
  shortDescription: string;
  description: string;
  keywords: string[];
  cover: string | null;
}

export interface CategoryItem {
  id: string;
  title: string;
  description?: string;
  count: number;
}

export interface ManifestData {
  schemaVersion: string;
  generatorVersion: string;
  generatedAt: string;
  repository: string;
  branch: string;
  commit: string;
  assetCount: number;
  categoryCount: number;
}

export interface SearchItem {
  id: string;
  name: string;
  type: Asset['type'];
  category: string;
  keywords: string[];
  description: string;
  githubPath: string;
}

export function getCatalog(): CatalogItem[] {
  // @ts-ignore - Assuming standard generated JSON structure
  return catalogJson.items || [];
}

export function getCategories(): CategoryItem[] {
  // @ts-ignore
  const dynamicCategories: CategoryItem[] = categoriesJson.items || [];
  
  const PREDEFINED_CATEGORIES = [
    { id: 'model-library', title: 'Model Library', description: 'Explore various AI models and architectures.' },
    { id: 'ai-farm', title: 'Ai Farm', description: 'Tools and resources for training and running AI.' },
    { id: 'code-library', title: 'Code Library', description: 'Reusable code snippets and modules.' },
    { id: 'corpus-knowledge', title: 'Corpus Knowledge', description: 'Datasets and structured knowledge bases.' },
    { id: 'skills-library', title: 'Skills Library', description: 'Specific agent skills and capabilities.' },
    { id: 'mcp-library', title: 'MCP Library', description: 'Machine Control Protocols and integrations.' },
  ];

  // Merge them, prioritizing predefined, but keeping their dynamic counts
  return PREDEFINED_CATEGORIES.map(predefined => {
    const dynamic = dynamicCategories.find(d => d.id === predefined.id);
    return {
      ...predefined,
      count: dynamic ? dynamic.count : 0
    };
  });
}

export function getManifest(): ManifestData {
  // @ts-ignore
  return manifestJson as ManifestData;
}

export function getSearchIndex(): SearchItem[] {
  // @ts-ignore
  return searchJson.items || [];
}

// Milestone 5: Dynamic imports for lazy-loading asset details
export async function getAssetIndex(category: string, id: string): Promise<AssetIndex | null> {
  try {
    // Dynamic import to avoid bundling all indexes
    const indexData = await import(`../../../generated/content/${category}/${id}/index.json`);
    return indexData.default || indexData;
  } catch (e) {
    return null;
  }
}


