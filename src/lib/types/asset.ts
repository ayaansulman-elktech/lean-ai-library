export interface Image {
  src: string; // Relative to the asset output folder (e.g., 'assets/cover.png')
  alt?: string;
}

export interface TocEntry {
  depth: number;
  title: string;
  slug: string;
}

export interface RepositoryInfo {
  url?: string;
  branch?: string;
  path?: string;
  commit?: string;
}

export interface Asset {
  id: string;
  name: string;
  type: 'agent' | 'library' | 'model' | 'application' | 'pipeline' | 'other' | 'pdf' | 'md' | 'folder' | 'fileorother';
  category: string; // The folder name it belongs to
  version?: string;
  description: string;
  shortDescription: string;
  keywords: string[];
  githubPath: string; // Original path in the repo

  // Raw Content
  readme?: string;
  skill?: string;

  // Additional Meta
  assets: Image[];
  examples: string[];
  dependencies: string[];
  related: string[];
}

export interface FileTreeNode {
  name: string;
  type: 'file' | 'directory';
  path: string;
  children?: FileTreeNode[];
}

export interface AssetIndex {
  schemaVersion: string;
  metadata: {
    id: string;
    name: string;
    type: Asset['type'];
    category: string;
    version?: string;
    description: string;
    shortDescription: string;
    keywords: string[];
    lastUpdated?: string;
  };
  content: {
    hasReadme: boolean;
    hasSkill: boolean;
  };
  assets: {
    cover: string | null;
    images: string[];
  };
  examples: string[];
  dependencies: string[];
  related: string[];
  toc: TocEntry[];
  repository: RepositoryInfo;
  fileTree?: FileTreeNode[];
}
