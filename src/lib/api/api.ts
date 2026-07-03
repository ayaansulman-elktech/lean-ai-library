import catalogJson from '../../../generated/catalog.json';
import categoriesJson from '../../../generated/categories.json';
import manifestJson from '../../../generated/manifest.json';
import searchJson from '../../../generated/search.json';
import { Asset } from '../types/asset';

// We can type these based on the structure we generated in Milestone 3
export interface CatalogItem {
  id: string;
  name: string;
  type: Asset['type'];
  category: string;
  shortDescription: string;
  cover: string | null;
}

export interface CategoryItem {
  id: string;
  title: string;
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
  return categoriesJson.items || [];
}

export function getManifest(): ManifestData {
  // @ts-ignore
  return manifestJson as ManifestData;
}

export function getSearchIndex(): SearchItem[] {
  // @ts-ignore
  return searchJson.items || [];
}
