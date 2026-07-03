import fs from 'fs';
import path from 'path';
import { Generator, GeneratorContext } from './base';

export class CategoriesGenerator implements Generator {
  name = 'categories';

  async generate(ctx: GeneratorContext): Promise<void> {
    const categoriesPath = path.join(ctx.outputDir, 'categories.json');
    
    const counts = new Map<string, number>();
    
    for (const asset of ctx.assets) {
      const count = counts.get(asset.category) || 0;
      counts.set(asset.category, count + 1);
    }

    const items = Array.from(counts.entries()).map(([id, count]) => {
      // Capitalize for title
      const title = id.charAt(0).toUpperCase() + id.slice(1);
      return { id, title, count };
    });

    const output = {
      schemaVersion: '1.0.0',
      generatedAt: new Date().toISOString(),
      items
    };

    await fs.promises.writeFile(categoriesPath, JSON.stringify(output, null, 2), 'utf-8');
  }
}
