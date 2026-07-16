import fs from 'fs';
import path from 'path';
import { Generator, GeneratorContext } from './base';

export class ManifestGenerator implements Generator {
  name = 'ManifestGenerator';
  async generate(ctx: GeneratorContext): Promise<void> {
    fs.mkdirSync(ctx.outputDir, { recursive: true });
    fs.writeFileSync(path.join(ctx.outputDir, 'manifest.json'), JSON.stringify({ schemaVersion: '1.0.0', assetCount: ctx.assets.length }, null, 2));
  }
}
