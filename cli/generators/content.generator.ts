import fs from 'fs';
import path from 'path';
import { Generator, GeneratorContext } from './base';

export class ContentGenerator implements Generator {
  name = 'ContentGenerator';
  async generate(ctx: GeneratorContext): Promise<void> {
    for (const asset of ctx.assets) {
      const dir = path.join(ctx.outputDir, 'content', asset.category, asset.id);
      fs.mkdirSync(dir, { recursive: true });
      const toc = headings(asset.readme || asset.skill || '');
      fs.writeFileSync(path.join(dir, 'index.json'), JSON.stringify({ schemaVersion: '1.0.0', metadata: asset, toc }, null, 2));
      if (asset.readme) fs.writeFileSync(path.join(dir, 'README.md'), asset.readme);
      if (asset.skill) fs.writeFileSync(path.join(dir, 'SKILL.md'), asset.skill);
    }
  }
}

function headings(markdown: string) {
  return markdown.split(/\r?\n/).flatMap((line) => {
    const match = /^(#{1,6})\s+(.+)$/.exec(line);
    return match ? [{ depth: match[1].length, title: match[2], slug: match[2].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }] : [];
  });
}
