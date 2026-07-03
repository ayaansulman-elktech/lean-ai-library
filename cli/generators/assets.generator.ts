import fs from 'fs';
import path from 'path';
import { Generator, GeneratorContext } from './base';

export class AssetsGenerator implements Generator {
  name = 'assets';

  async generate(ctx: GeneratorContext): Promise<void> {
    for (const asset of ctx.assets) {
      if (!asset.assets || asset.assets.length === 0) continue;

      try {
        const destAssetsDir = path.join(ctx.outputDir, 'content', asset.category, asset.id, 'assets');
        await fs.promises.mkdir(destAssetsDir, { recursive: true });

        // In the parser, image.src is a relative path from the asset directory in the repo
        // e.g. 'assets/cover.png' or 'diagram.svg'
        // Wait, the ParserContext doesn't have the repo's asset directory mapping for each asset.
        // We need to know where the asset originally lived. 
        // We stored `githubPath` which is the relative path from the repo root to the asset dir.
        
        const sourceAssetDir = path.join(ctx.sourceDir, asset.githubPath);

        for (const img of asset.assets) {
          const sourcePath = path.join(sourceAssetDir, img.src);
          // Destination is flattened to just the basename to make frontend predictable,
          // or we can keep the relative structure. Let's keep the basename for simplicity,
          // but update the image src in the metadata so it matches.
          // For now, let's just copy it to the assets folder using its original basename.
          const destPath = path.join(destAssetsDir, path.basename(img.src));

          if (fs.existsSync(sourcePath)) {
            await fs.promises.copyFile(sourcePath, destPath);
            ctx.stats.assetsCopied++;
          }
        }
      } catch (error) {
        console.warn(`\n⚠ ${asset.name}`);
        console.warn(`  Failed to copy assets: ${(error as Error).message}`);
        console.warn(`  Continuing...`);
      }
    }
  }
}
