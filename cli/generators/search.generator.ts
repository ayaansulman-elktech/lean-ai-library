import fs from 'fs';
import path from 'path';
import { Generator, GeneratorContext } from './base';

export class SearchGenerator implements Generator {
  name = 'search';

  async generate(ctx: GeneratorContext): Promise<void> {
    const searchPath = path.join(ctx.outputDir, 'search.json');
    
    const items = ctx.assets.map(asset => {
      return {
        id: asset.id,
        name: asset.name,
        type: asset.type,
        category: asset.category,
        keywords: asset.keywords,
        description: asset.description, // Can be used for search, but not the full README
        githubPath: asset.githubPath
      };
    });

    const output = {
      schemaVersion: '1.0.0',
      generatedAt: new Date().toISOString(),
      items
    };

    await fs.promises.writeFile(searchPath, JSON.stringify(output, null, 2), 'utf-8');
  }
}
