import { Asset } from '../../src/lib/types/asset';

export interface GeneratorContext {
  assets: Asset[];
  outputDir: string;
  sourceDir: string;
  stats: {
    assetsCopied: number;
  };
}

export interface Generator {
  name: string;
  generate(ctx: GeneratorContext): Promise<void>;
}
