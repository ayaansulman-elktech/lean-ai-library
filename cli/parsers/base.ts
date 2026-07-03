import { Asset } from '../../src/lib/types/asset';

export interface ParserContext {
  repoDir: string;
  assetDir: string;
}

export interface Parser {
  name: string;
  parse(ctx: ParserContext): Promise<Partial<Asset>>;
}
