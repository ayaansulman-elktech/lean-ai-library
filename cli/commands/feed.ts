import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
import chalk from 'chalk';
import { readArticleRecord, readJson, validateFeed, writeArticleRecord } from '../core/catalog';
import { FrontendGenerator } from '../generators/frontend.generator';

export const feedCommand = new Command('feed').description('Import versioned library feed files');

feedCommand.command('import')
  .argument('<path>', 'A generated block.json file or any parent directory containing feeds')
  .option('--dry-run', 'Validate and report changes without writing')
  .description('Add or update articles without deleting other articles or local overrides')
  .action(async (input: string, options: { dryRun?: boolean }) => {
    const root = process.cwd();
    const resolved = path.resolve(input);
    if (!fs.existsSync(resolved)) throw new Error(`Feed path not found: ${resolved}`);
    const files = discoverFeedFiles(resolved);
    if (!files.length) throw new Error(`No generated block.json feed files found in ${resolved}`);

    const pending = new Map<string, ReturnType<typeof validateFeed>['articles'][number]>();
    for (const file of files) {
      const feed = validateFeed(readJson(file));
      for (const article of feed.articles) {
        if (pending.has(article.id)) throw new Error(`Article id ${article.id} occurs in more than one imported feed.`);
        pending.set(article.id, article);
      }
    }

    let added = 0;
    let updated = 0;
    let unchanged = 0;
    for (const [id, article] of pending) {
      const existing = readArticleRecord(root, id);
      if (!existing) {
        added++;
        if (!options.dryRun) writeArticleRecord(root, {
          schemaVersion: '1.0.0', id, factoryData: article, localOverrides: {}, attachments: { thumbnail: null, pdf: null }
        });
      } else if (JSON.stringify(existing.factoryData) === JSON.stringify(article)) {
        unchanged++;
      } else {
        updated++;
        if (!options.dryRun) writeArticleRecord(root, { ...existing, factoryData: article });
      }
    }

    if (!options.dryRun) await new FrontendGenerator().generate({} as never);
    console.log(chalk.green(`${options.dryRun ? 'Dry run: ' : ''}${added} added, ${updated} updated, ${unchanged} unchanged; 0 deleted.`));
  });

function discoverFeedFiles(input: string): string[] {
  if (fs.statSync(input).isFile()) return [input];
  const files: string[] = [];
  const walk = (directory: string) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || ['node_modules', '.git'].includes(entry.name)) continue;
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(target);
      else if (entry.isFile() && (entry.name === 'block.json' || entry.name.endsWith('.block.json'))) {
        const value = readJson(target) as { schemaVersion?: unknown };
        if (value && value.schemaVersion === '1.0.0') files.push(target);
      }
    }
  };
  walk(input);
  return files.sort();
}
