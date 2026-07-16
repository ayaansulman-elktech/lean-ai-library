import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { Command } from 'commander';
import chalk from 'chalk';
import { mergeArticle, readArticleRecord } from '../core/catalog';

export const catalogValidateCommand = new Command('validate')
  .description('Validate canonical article records, required metadata, and attachments')
  .action(() => {
    const count = validateCatalog(process.cwd());
    console.log(chalk.green(`Validated ${count} article records.`));
  });

export const catalogTestCommand = new Command('test')
  .description('Run the library test suite')
  .action(() => {
    execSync('npm test -- --run', { cwd: process.cwd(), stdio: 'inherit' });
  });

export const catalogDoctorCommand = new Command('doctor')
  .description('Check local catalog and generated frontend data health')
  .action(() => {
    const root = process.cwd();
    const count = validateCatalog(root);
    for (const relative of ['data/articles.json', 'data/categories.json', 'assets/app.js']) {
      if (!fs.existsSync(path.join(root, relative))) throw new Error(`Missing required frontend file: ${relative}`);
    }
    console.log(chalk.green(`Catalog is healthy: ${count} records and required frontend files are present.`));
  });

export function validateCatalog(root: string): number {
  const articlesDir = path.join(root, 'content', 'articles');
  if (!fs.existsSync(articlesDir)) throw new Error('content/articles does not exist.');
  const errors: string[] = [];
  let count = 0;
  for (const id of fs.readdirSync(articlesDir).sort()) {
    const dir = path.join(articlesDir, id);
    if (!fs.statSync(dir).isDirectory()) continue;
    const record = readArticleRecord(root, id);
    if (!record) continue;
    count++;
    const merged = mergeArticle(record) as Record<string, unknown>;
    for (const field of ['id', 'type', 'category', 'name', 'shortDescription', 'description']) {
      if (typeof merged[field] !== 'string' || !(merged[field] as string).trim()) errors.push(`${id}: missing ${field}`);
    }
    if (typeof merged.shortDescription === 'string' && merged.shortDescription.length > 42) errors.push(`${id}: shortDescription exceeds 42 characters`);
    if (typeof merged.description === 'string' && merged.description.length > 260) errors.push(`${id}: description exceeds 260 characters`);
    if (!Array.isArray(merged.keywords)) errors.push(`${id}: keywords must be an array`);
    for (const [kind, relative] of Object.entries(record.attachments)) {
      if (relative && !fs.existsSync(path.resolve(root, relative))) errors.push(`${id}: missing ${kind} attachment ${relative}`);
    }
  }
  if (errors.length) throw new Error(`Catalog validation failed:\n- ${errors.join('\n- ')}`);
  return count;
}
