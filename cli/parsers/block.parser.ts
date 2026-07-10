import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { Parser, ParserContext } from './base';
import { Asset } from '../../src/lib/types/asset';

export class BlockParser implements Parser {
  name = 'block';

  async parse(ctx: ParserContext): Promise<Partial<Asset>> {
    const targetPath = path.join(ctx.assetDir, 'block.json');

    if (!fs.existsSync(targetPath)) {
      return {};
    }

    try {
      const content = await fs.promises.readFile(targetPath, 'utf-8');
      const data = JSON.parse(content);
      
      const assetPartial: Partial<Asset> = {};
      
      if (data.name) assetPartial.name = data.name;
      if (data.summary) assetPartial.shortDescription = data.summary;
      if (data.description) assetPartial.description = data.description;
      if (data.task) assetPartial.keywords = [data.task];
      if (data.version) assetPartial.version = data.version;

      return assetPartial;
    } catch (error) {
      console.warn(chalk.yellow(`Failed to parse block.json in ${ctx.assetDir}: ${(error as Error).message}`));
      return {};
    }
  }
}
