import { Asset } from '../../src/lib/types/asset';

export interface GeneratorContext {
  assets: Asset[];
  outputDir: string;
  sourceDir: string;
  repoInfo: {
    branch: string;
    commit: string;
    url: string;
  };
  stats: {
    assetsCopied: number;
  };
}

export interface Generator {
  name: string;
  generate(ctx: GeneratorContext): Promise<void>;
}
