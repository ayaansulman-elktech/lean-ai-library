import fs from 'fs';
import path from 'path';
import { Generator, GeneratorContext } from './base';

export class CategoriesGenerator implements Generator {
  name = 'CategoriesGenerator';
  async generate(ctx: GeneratorContext): Promise<void> {
    const counts = new Map<string, number>();
    for (const asset of ctx.assets) counts.set(asset.category, (counts.get(asset.category) || 0) + 1);
    const items = [...counts].map(([id, count]) => ({ id, name: id, count }));
    fs.mkdirSync(ctx.outputDir, { recursive: true });
    fs.writeFileSync(path.join(ctx.outputDir, 'categories.json'), JSON.stringify({ schemaVersion: '1.0.0', items }, null, 2));
  }
}
