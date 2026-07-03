import fs from 'fs';
import path from 'path';
import { Generator, GeneratorContext } from './base';

export class ContentGenerator implements Generator {
  name = 'content';

  async generate(ctx: GeneratorContext): Promise<void> {
    for (const asset of ctx.assets) {
      try {
        const assetDir = path.join(ctx.outputDir, 'content', asset.category, asset.id);
        await fs.promises.mkdir(assetDir, { recursive: true });

        // Generate standardized metadata.json for this asset
        const metadataPath = path.join(assetDir, 'metadata.json');
        await fs.promises.writeFile(metadataPath, JSON.stringify(asset, null, 2), 'utf-8');

        // Write README.md if it exists
        if (asset.readme) {
          const readmePath = path.join(assetDir, 'README.md');
          await fs.promises.writeFile(readmePath, asset.readme, 'utf-8');
        }

        // Write SKILL.md if it exists
        if (asset.skill) {
          const skillPath = path.join(assetDir, 'SKILL.md');
          await fs.promises.writeFile(skillPath, asset.skill, 'utf-8');
        }

      } catch (error) {
        console.warn(`\n⚠ ${asset.name}`);
        console.warn(`  Failed to generate content: ${(error as Error).message}`);
        console.warn(`  Continuing...`);
      }
    }
  }
}
