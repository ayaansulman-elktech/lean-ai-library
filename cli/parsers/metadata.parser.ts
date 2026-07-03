import fs from 'fs';
import path from 'path';
import { Parser, ParserContext } from './base';
import { Asset } from '../../src/lib/types/asset';

export class MetadataParser implements Parser {
  name = 'metadata';

  async parse(ctx: ParserContext): Promise<Partial<Asset>> {
    const metadataPath = path.join(ctx.assetDir, 'metadata.json');
    if (!fs.existsSync(metadataPath)) {
      return {};
    }

    try {
      const content = await fs.promises.readFile(metadataPath, 'utf-8');
      const data = JSON.parse(content);
      return data as Partial<Asset>;
    } catch (error) {
      console.warn(`Failed to parse metadata.json in ${ctx.assetDir}`, error);
      return {};
    }
  }
}
