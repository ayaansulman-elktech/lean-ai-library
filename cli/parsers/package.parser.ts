import fs from 'fs';
import path from 'path';
import { Parser, ParserContext } from './base';
import { Asset } from '../../src/lib/types/asset';

export class PackageParser implements Parser {
  name = 'package';

  async parse(ctx: ParserContext): Promise<Partial<Asset>> {
    const packagePath = path.join(ctx.assetDir, 'package.json');
    if (!fs.existsSync(packagePath)) {
      return {};
    }

    try {
      const content = await fs.promises.readFile(packagePath, 'utf-8');
      const data = JSON.parse(content);
      
      const partial: Partial<Asset> = {
        dependencies: []
      };

      if (data.name) partial.name = data.name;
      if (data.description) partial.description = data.description;
      if (data.version) partial.version = data.version;
      
      if (data.dependencies) {
        partial.dependencies?.push(...Object.keys(data.dependencies));
      }
      if (data.devDependencies) {
        partial.dependencies?.push(...Object.keys(data.devDependencies));
      }

      return partial;
    } catch (error) {
      console.warn(`Failed to parse package.json in ${ctx.assetDir}`, error);
      return {};
    }
  }
}
