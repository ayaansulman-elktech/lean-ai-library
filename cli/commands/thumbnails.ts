import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
import chalk from 'chalk';
import { articleDirectory, mergeArticle, readArticleRecord, writeArticleRecord } from '../core/catalog';
import { FrontendGenerator } from '../generators/frontend.generator';

const extensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);
const preferredFiles: Record<string, string> = {
  blocks: 'blocks-variation-1.png',
  template: '_template-variation-1.png',
  wireframing: 'wireframing-variation-1.png',
  'knowledge-wireframing': 'wireframing-2-variation-1.png',
  'mcp-wireframing': 'wireframing-3-variation-1.png',
  color_extraction: 'color_extraction-variation-1.png',
  color_matching: 'color_matching-variation-1.png',
  face_parsing: 'face_parsing-variation-1.png',
  ux_attention_pattern: 'ux_attention_pattern-variation-1.png',
  ux_position_mask: 'ux_position_mask-variation-1.png',
  vision_camera: 'vision_camera-variation-1.png'
};

export const thumbnailsCommand = new Command('thumbnails').description('Match and attach article thumbnails in one batch');

thumbnailsCommand.command('import')
  .argument('<directory>', 'Directory containing thumbnail images')
  .option('--dry-run', 'Report matches without copying files')
  .action(async (directory: string, options: { dryRun?: boolean }) => {
    const root = process.cwd();
    const sourceDir = path.resolve(directory);
    if (!fs.existsSync(sourceDir) || !fs.statSync(sourceDir).isDirectory()) throw new Error(`Thumbnail directory not found: ${sourceDir}`);
    const images = fs.readdirSync(sourceDir)
      .filter((name) => extensions.has(path.extname(name).toLowerCase()))
      .map((name) => ({ name, path: path.join(sourceDir, name), key: imageKey(name), rank: imageRank(name) }))
      .sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name));

    const records = fs.readdirSync(path.join(root, 'content', 'articles')).sort()
      .map((id) => readArticleRecord(root, id)).filter((record) => record !== null);
    let matched = 0;
    const unmatched: string[] = [];
    for (const record of records) {
      const article = mergeArticle(record!);
      const keys = articleKeys(article.id, article.name);
      const preferred = preferredFiles[article.id];
      const image = images.find((candidate) => candidate.name === preferred) || images.find((candidate) => keys.has(candidate.key));
      if (!image) {
        unmatched.push(article.id);
        continue;
      }
      matched++;
      console.log(`${article.id} <- ${image.name}`);
      if (options.dryRun) continue;
      const ext = path.extname(image.name).toLowerCase();
      const destinationDir = articleDirectory(root, article.id);
      fs.mkdirSync(destinationDir, { recursive: true });
      fs.copyFileSync(image.path, path.join(destinationDir, `thumbnail${ext}`));
      record!.attachments.thumbnail = path.posix.join('content', 'articles', article.id, `thumbnail${ext}`);
      writeArticleRecord(root, record!);
    }
    if (!options.dryRun) await new FrontendGenerator().generate({} as never);
    console.log(chalk.green(`${options.dryRun ? 'Dry run: ' : ''}${matched} matched; ${unmatched.length} kept their existing/default thumbnail.`));
    if (unmatched.length) console.log(chalk.gray(`Unmatched: ${unmatched.join(', ')}`));
  });

function articleKeys(id: string, name: string): Set<string> {
  const keys = new Set([normalize(id), normalize(name)]);
  for (const prefix of ['ios-', 'knowledge-', 'mcp-']) if (normalize(id).startsWith(prefix)) keys.add(normalize(id).slice(prefix.length));
  return keys;
}

function imageKey(filename: string): string {
  return normalize(path.basename(filename, path.extname(filename))
    .replace(/-from-json(?:-v\d+)?$/i, '')
    .replace(/-variation-\d+$/i, '')
    .replace(/-figma(?:-\d+)+$/i, '')
    .replace(/-\d+$/i, ''));
}

function imageRank(filename: string): number {
  if (/-from-json-v\d+/i.test(filename)) return 0;
  if (/-from-json/i.test(filename)) return 1;
  const variation = /-variation-(\d+)/i.exec(filename);
  return variation ? 10 + Number(variation[1]) : 5;
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[_\s]+/g, '-').replace(/[^a-z0-9-]+/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
}
