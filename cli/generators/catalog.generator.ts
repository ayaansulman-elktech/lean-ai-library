import fs from 'fs';
import path from 'path';
import { Generator, GeneratorContext } from './base';

export class CatalogGenerator implements Generator {
  name = 'CatalogGenerator';
  async generate(ctx: GeneratorContext): Promise<void> {
    fs.mkdirSync(ctx.outputDir, { recursive: true });
    fs.writeFileSync(path.join(ctx.outputDir, 'catalog.json'), JSON.stringify({ schemaVersion: '1.0.0', items: ctx.assets }, null, 2));
  }
}
