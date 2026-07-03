import fs from 'fs';
import path from 'path';
import simpleGit from 'simple-git';
import { Generator, GeneratorContext } from './base';

export class ManifestGenerator implements Generator {
  name = 'manifest';

  async generate(ctx: GeneratorContext): Promise<void> {
    const manifestPath = path.join(ctx.outputDir, 'manifest.json');
    
    let branch = 'unknown';
    let commit = 'unknown';

    try {
      const git = simpleGit(ctx.sourceDir);
      branch = (await git.branchLocal()).current;
      commit = await git.revparse(['HEAD']);
    } catch (e) {
      // Ignored if not a git repo
    }

    const uniqueCategories = new Set(ctx.assets.map(a => a.category)).size;

    const output = {
      schemaVersion: '1.0.0',
      generatorVersion: '0.1.0',
      generatedAt: new Date().toISOString(),
      repository: 'https://github.com/shaz-ik/lean-ai-factory', // Can be dynamic if needed
      branch,
      commit,
      assetCount: ctx.assets.length,
      categoryCount: uniqueCategories
    };

    await fs.promises.writeFile(manifestPath, JSON.stringify(output, null, 2), 'utf-8');
  }
}
