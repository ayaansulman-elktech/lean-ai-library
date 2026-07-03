import fs from 'fs';
import path from 'path';
import glob from 'glob-promise';
import { Parser, ParserContext } from './base';
import { Asset, Image } from '../../src/lib/types/asset';

export class ImageParser implements Parser {
  name = 'image';

  async parse(ctx: ParserContext): Promise<Partial<Asset>> {
    const assetsDir = path.join(ctx.assetDir, 'assets');
    let imagePaths: string[] = [];

    if (fs.existsSync(assetsDir)) {
      imagePaths = await glob('**/*.{png,jpg,jpeg,svg,webp,gif}', { cwd: assetsDir });
    } else {
      // Sometimes images are just in the root of the asset
      imagePaths = await glob('*.{png,jpg,jpeg,svg,webp,gif}', { cwd: ctx.assetDir });
    }

    if (imagePaths.length === 0) {
      return { assets: [] };
    }

    const images: Image[] = imagePaths.map(p => {
      return {
        src: fs.existsSync(assetsDir) ? path.join('assets', p).replace(/\\/g, '/') : p.replace(/\\/g, '/'),
        alt: path.basename(p, path.extname(p))
      };
    });

    return {
      assets: images
    };
  }
}
