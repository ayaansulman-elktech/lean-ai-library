import Fuse from 'fuse.js';
import { SearchItem, getSearchIndex } from '../api/api';

// Singleton instance to prevent re-initializing
let fuseInstance: Fuse<SearchItem> | null = null;

export function getFuse() {
  if (!fuseInstance) {
    const index = getSearchIndex();
    fuseInstance = new Fuse(index, {
      keys: ['name', 'description', 'keywords', 'category', 'type'],
      threshold: 0.3,
      includeScore: true,
      shouldSort: true,
    });
  }
  return fuseInstance;
}

export function searchAssets(query: string) {
  if (!query.trim()) return [];
  const fuse = getFuse();
  return fuse.search(query).map(result => result.item);
}
