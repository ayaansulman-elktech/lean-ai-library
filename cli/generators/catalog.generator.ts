import fs from 'fs';
import path from 'path';
import { Generator, GeneratorContext } from './base';

export class CatalogGenerator implements Generator {
  name = 'catalog';

  async generate(ctx: GeneratorContext): Promise<void> {
    const catalogPath = path.join(ctx.outputDir, 'catalog.json');
    
    const items = ctx.assets.map(asset => {
      // Find a cover image if any
      const coverImage = asset.assets.find(img => img.src.includes('cover')) || asset.assets[0];
      
      return {
        id: asset.id,
        name: asset.name,
        type: asset.type,
        category: asset.category,
        shortDescription: asset.shortDescription,
        cover: coverImage ? `/generated/content/${asset.category}/${asset.id}/assets/${path.basename(coverImage.src)}` : null
      };
    });

    const output = {
      schemaVersion: '1.0.0',
      generatedAt: new Date().toISOString(),
      items
    };

    await fs.promises.mkdir(path.dirname(catalogPath), { recursive: true });
    await fs.promises.writeFile(catalogPath, JSON.stringify(output, null, 2), 'utf-8');
  }
}
