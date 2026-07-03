import fs from 'fs';
import path from 'path';
import simpleGit from 'simple-git';
import { Generator, GeneratorContext } from './base';

export class ManifestGenerator implements Generator {
  name = 'manifest';

  async generate(ctx: GeneratorContext): Promise<void> {
    const manifestPath = path.join(ctx.outputDir, 'manifest.json');
    
    const uniqueCategories = new Set(ctx.assets.map(a => a.category)).size;

    const output = {
      schemaVersion: '1.0.0',
      generatorVersion: '0.1.0',
      generatedAt: new Date().toISOString(),
      repository: ctx.repoInfo.url,
      branch: ctx.repoInfo.branch,
      commit: ctx.repoInfo.commit,
      assetCount: ctx.assets.length,
      categoryCount: uniqueCategories
    };

    await fs.promises.writeFile(manifestPath, JSON.stringify(output, null, 2), 'utf-8');
  }
}
