import fs from 'fs';
import path from 'path';
import { Generator, GeneratorContext } from './base';

export class SearchGenerator implements Generator {
  name = 'SearchGenerator';
  async generate(ctx: GeneratorContext): Promise<void> {
    const items = ctx.assets.map(({ id, name, type, category, keywords, description, githubPath }) => ({ id, name, type, category, keywords, description, githubPath }));
    fs.mkdirSync(ctx.outputDir, { recursive: true });
    fs.writeFileSync(path.join(ctx.outputDir, 'search.json'), JSON.stringify({ schemaVersion: '1.0.0', items }, null, 2));
  }
}
