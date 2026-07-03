export type AssetType =
  | 'agent'
  | 'library'
  | 'model'
  | 'prompt'
  | 'workflow'
  | 'dataset'
  | 'mcp-server'
  | 'tool'
  | 'pipeline'
  | 'application'
  | 'template'
  | 'other';

export interface Image {
  src: string;
  alt: string;
}

export interface Example {
  title: string;
  code: string;
  description?: string;
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  category: string;
  description: string;
  shortDescription: string;
  keywords: string[];
  version?: string;
  githubPath: string;
  readme?: string;
  skill?: string;
  assets: Image[];
  examples: Example[];
  dependencies: string[];
  related: string[];
}
