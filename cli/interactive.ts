import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { createInterface } from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import chalk from 'chalk';
import { articleDirectory, mergeArticle, readArticleRecord, writeArticleRecord } from './core/catalog';
import { applyFeeds, inspectFeeds } from './core/feed-import';
import { FrontendGenerator } from './generators/frontend.generator';
import { validateCatalog } from './commands/quality';

const editableFields = ['name', 'shortDescription', 'description', 'keywords', 'type', 'category'] as const;

export async function runInteractiveCli(): Promise<void> {
  const rl = createInterface({ input, output });
  console.log(chalk.cyan.bold('\nWelcome to Lean AI Library\n'));
  try {
    while (true) {
      console.log('1. Add or update JSON files');
      console.log('2. Edit an existing article');
      console.log('3. Build frontend data');
      console.log('4. Validate the Library');
      console.log('5. Start the Library');
      console.log('6. Exit');
      const choice = (await rl.question('\nSelect an option: ')).trim();
      try {
        if (choice === '1') await importFlow(rl);
        else if (choice === '2') await editFlow(rl);
        else if (choice === '3') {
          await new FrontendGenerator().generate({} as never);
          console.log(chalk.green('\nFrontend data generated.\n'));
        } else if (choice === '4') {
          console.log(chalk.green(`\nValidated ${validateCatalog(process.cwd())} article records.\n`));
        } else if (choice === '5') {
          console.log(chalk.cyan('\nStarting http://127.0.0.1:4173 — press Ctrl+C to stop.\n'));
          rl.close();
          execSync('npm start', { cwd: process.cwd(), stdio: 'inherit' });
          return;
        } else if (choice === '6') return;
        else console.log(chalk.yellow('\nPlease select a number from 1 to 6.\n'));
      } catch (error: any) {
        console.error(chalk.red(`\n${error.message || error}\n`));
      }
    }
  } finally {
    rl.close();
  }
}

async function importFlow(rl: ReturnType<typeof createInterface>): Promise<void> {
  const location = stripQuotes((await rl.question('\nEnter the JSON file or folder location: ')).trim());
  const summary = inspectFeeds(location);
  console.log(`\n${summary.files.length} feed files found`);
  console.log(`${summary.added} new articles`);
  console.log(`${summary.updated} existing articles will be updated`);
  console.log(`${summary.unchanged} unchanged`);
  console.log('0 articles will be deleted');
  if (!(await confirm(rl, '\nImport these changes? (y/N): '))) {
    console.log(chalk.yellow('\nImport cancelled.\n'));
    return;
  }
  await applyFeeds(summary);
  console.log(chalk.green('\nJSON files imported and frontend data updated.\n'));
}

async function editFlow(rl: ReturnType<typeof createInterface>): Promise<void> {
  console.log('\nThe ID is the value after ?id= in the article URL. Example: article.html?id=vinet → vinet.');
  const id = (await rl.question('Enter the article ID: ')).trim();
  const original = readArticleRecord(process.cwd(), id);
  if (!original) throw new Error(`Article not found: ${id}`);
  const record = structuredClone(original);
  let pendingThumbnail: string | null | undefined;
  let pendingPdf: string | null | undefined;
  while (true) {
    const article = mergeArticle(record);
    console.log(chalk.cyan(`\nEditing ${article.name} (${id})`));
    console.log(`Name: ${article.name}`);
    console.log(`Short description: ${article.shortDescription}`);
    console.log('1. Change name');
    console.log('2. Change short description');
    console.log('3. Change description');
    console.log('4. Change keywords');
    console.log('5. Change type');
    console.log('6. Change category');
    console.log('7. Add or replace thumbnail');
    console.log('8. Add or replace PDF');
    console.log('9. Remove thumbnail');
    console.log('10. Remove PDF');
    console.log('11. Reset a field to its imported value');
    console.log('12. Save and finish');
    console.log('13. Cancel');
    const choice = (await rl.question('\nSelect a change: ')).trim();
    if (['1', '2', '3', '4', '5', '6'].includes(choice)) {
      const field = editableFields[Number(choice) - 1];
      const value = await rl.question(`Enter ${field}: `);
      (record.localOverrides as any)[field] = field === 'keywords' ? value.split(',').map((item) => item.trim()).filter(Boolean) : value.trim();
    } else if (choice === '7') {
      pendingThumbnail = validateAttachment(stripQuotes(await rl.question('Enter thumbnail path: ')), ['.png', '.jpg', '.jpeg', '.webp', '.gif']);
    } else if (choice === '8') {
      pendingPdf = validateAttachment(stripQuotes(await rl.question('Enter PDF path: ')), ['.pdf']);
    } else if (choice === '9') pendingThumbnail = null;
    else if (choice === '10') pendingPdf = null;
    else if (choice === '11') {
      console.log(`Resettable fields: ${editableFields.join(', ')}`);
      const field = (await rl.question('Enter field to reset: ')).trim() as typeof editableFields[number];
      if (!editableFields.includes(field)) console.log(chalk.yellow('Unknown field.'));
      else delete (record.localOverrides as any)[field];
    } else if (choice === '12') {
      if (!(await confirm(rl, 'Save these changes? (y/N): '))) continue;
      applyAttachment(record, 'thumbnail', pendingThumbnail, ['.png', '.jpg', '.jpeg', '.webp', '.gif']);
      applyAttachment(record, 'pdf', pendingPdf, ['.pdf']);
      writeArticleRecord(process.cwd(), record);
      await new FrontendGenerator().generate({} as never);
      console.log(chalk.green('\nArticle updated and frontend data regenerated.\n'));
      return;
    } else if (choice === '13') {
      console.log(chalk.yellow('\nEdit cancelled; no changes were saved.\n'));
      return;
    } else console.log(chalk.yellow('Please select a number from 1 to 13.'));
  }
}

function validateAttachment(value: string, allowed: string[]): string {
  const file = path.resolve(value);
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) throw new Error(`File not found: ${file}`);
  if (!allowed.includes(path.extname(file).toLowerCase())) throw new Error(`Unsupported file type: ${path.extname(file)}`);
  return file;
}

function applyAttachment(record: NonNullable<ReturnType<typeof readArticleRecord>>, kind: 'thumbnail' | 'pdf', pending: string | null | undefined, allowed: string[]): void {
  if (pending === undefined) return;
  const old = record.attachments[kind];
  if (old) {
    const oldPath = path.resolve(process.cwd(), old);
    if (oldPath.startsWith(path.resolve(articleDirectory(process.cwd(), record.id))) && fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }
  if (pending === null) {
    record.attachments[kind] = null;
    return;
  }
  const ext = path.extname(pending).toLowerCase();
  if (!allowed.includes(ext)) throw new Error(`Unsupported ${kind} type: ${ext}`);
  const name = kind === 'pdf' ? `content${ext}` : `thumbnail${ext}`;
  const dir = articleDirectory(process.cwd(), record.id);
  fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(pending, path.join(dir, name));
  record.attachments[kind] = path.posix.join('content', 'articles', record.id, name);
}

async function confirm(rl: ReturnType<typeof createInterface>, message: string): Promise<boolean> {
  return ['y', 'yes'].includes((await rl.question(message)).trim().toLowerCase());
}

function stripQuotes(value: string): string {
  return value.trim().replace(/^['"]|['"]$/g, '');
}
