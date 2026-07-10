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
      // Replace dashes with spaces and capitalize each word
      const title = id
        .split('-')
        .map(word => {
          if (word === 'ios') return 'iOS';
          if (word === 'mcp') return 'MCP';
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
        
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
