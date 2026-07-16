import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { Command } from 'commander';
import chalk from 'chalk';
import { articleDirectory, createRecord, readArticleRecord, readJson, writeArticleRecord } from '../core/catalog';
import { FrontendGenerator } from '../generators/frontend.generator';

const editableFields = ['name', 'shortDescription', 'description', 'keywords', 'type', 'category'] as const;
export const articleCommand = new Command('article').description('Add, edit, attach files to, or remove library articles');

articleCommand.command('add').requiredOption('--file <path>').action(async ({ file }: { file: string }) => {
  const data = readJson(path.resolve(file)) as Record<string, unknown>;
  const id = String(data.id || '');
  if (!/^[a-z0-9][a-z0-9_-]*$/.test(id)) throw new Error('Article JSON requires a stable lowercase id.');
  if (readArticleRecord(process.cwd(), id)) throw new Error(`Article already exists: ${id}`);
  for (const field of ['type', 'category', 'name', 'shortDescription', 'description', 'keywords']) if (!(field in data)) throw new Error(`Article JSON is missing ${field}.`);
  writeArticleRecord(process.cwd(), createRecord(id, data));
  await generate();
  console.log(chalk.green(`Added ${id}.`));
});

articleCommand.command('edit').argument('<id>')
  .option('--name <value>').option('--short-description <value>').option('--description <value>')
  .option('--keywords <csv>').option('--type <value>').option('--category <value>')
  .option('--reset <field...>').option('--editor')
  .action(async (id: string, options: Record<string, unknown>) => {
    const record = requireRecord(id);
    const overrides = { ...record.localOverrides } as Record<string, unknown>;
    const values: Record<string, unknown> = {
      name: options.name, shortDescription: options.shortDescription, description: options.description,
      keywords: typeof options.keywords === 'string' ? options.keywords.split(',').map((item) => item.trim()).filter(Boolean) : undefined,
      type: options.type, category: options.category
    };
    if (typeof values.shortDescription === 'string' && values.shortDescription.length > 42) throw new Error('Short description must be 42 characters or fewer.');
    if (typeof values.description === 'string' && values.description.length > 260) throw new Error('Description must be 260 characters or fewer.');
    for (const [key, value] of Object.entries(values)) if (value !== undefined) overrides[key] = value;
    for (const field of (options.reset as string[] | undefined) || []) {
      if (!editableFields.includes(field as typeof editableFields[number])) throw new Error(`Cannot reset unknown field: ${field}`);
      delete overrides[field];
    }
    if (options.editor) overridesFromEditor(id, overrides);
    else { record.localOverrides = overrides; writeArticleRecord(process.cwd(), record); }
    await generate();
    console.log(chalk.green(`Updated ${id}.`));
  });

articleCommand.command('attach').argument('<id>').option('--thumbnail <path>').option('--pdf <path>')
  .action(async (id: string, options: { thumbnail?: string; pdf?: string }) => {
    if (!options.thumbnail && !options.pdf) throw new Error('Provide --thumbnail or --pdf.');
    const record = requireRecord(id);
    const dir = articleDirectory(process.cwd(), id);
    fs.mkdirSync(dir, { recursive: true });
    if (options.thumbnail) record.attachments.thumbnail = copyAttachment(options.thumbnail, dir, id, 'thumbnail', ['.png', '.jpg', '.jpeg', '.webp', '.gif']);
    if (options.pdf) record.attachments.pdf = copyAttachment(options.pdf, dir, id, 'content', ['.pdf']);
    writeArticleRecord(process.cwd(), record);
    await generate();
    console.log(chalk.green(`Attached files to ${id}.`));
  });

articleCommand.command('detach').argument('<id>').option('--thumbnail').option('--pdf')
  .action(async (id: string, options: { thumbnail?: boolean; pdf?: boolean }) => {
    if (!options.thumbnail && !options.pdf) throw new Error('Provide --thumbnail or --pdf.');
    const record = requireRecord(id);
    for (const kind of ['thumbnail', 'pdf'] as const) {
      if (!options[kind] || !record.attachments[kind]) continue;
      const target = path.resolve(process.cwd(), record.attachments[kind]!);
      const articleRoot = path.resolve(articleDirectory(process.cwd(), id));
      if (target.startsWith(articleRoot) && fs.existsSync(target)) fs.unlinkSync(target);
      record.attachments[kind] = null;
    }
    writeArticleRecord(process.cwd(), record);
    await generate();
    console.log(chalk.green(`Detached files from ${id}.`));
  });

articleCommand.command('remove').argument('<id>').requiredOption('--yes').action(async (id: string) => {
  requireRecord(id);
  fs.rmSync(articleDirectory(process.cwd(), id), { recursive: true });
  await generate();
  console.log(chalk.green(`Removed ${id}.`));
});

function requireRecord(id: string) {
  const record = readArticleRecord(process.cwd(), id);
  if (!record) throw new Error(`Article not found: ${id}`);
  return record;
}

function copyAttachment(sourceValue: string, dir: string, id: string, basename: string, allowed: string[]): string {
  const source = path.resolve(sourceValue);
  if (!fs.existsSync(source) || !fs.statSync(source).isFile()) throw new Error(`Attachment not found: ${source}`);
  const ext = path.extname(source).toLowerCase();
  if (!allowed.includes(ext)) throw new Error(`Unsupported attachment type: ${ext || '(none)'}`);
  const filename = `${basename}${ext}`;
  fs.copyFileSync(source, path.join(dir, filename));
  return path.posix.join('content', 'articles', id, filename);
}

function overridesFromEditor(id: string, initial: Record<string, unknown>): void {
  const dir = articleDirectory(process.cwd(), id);
  const temporary = path.join(dir, '.local-overrides.edit.json');
  fs.writeFileSync(temporary, `${JSON.stringify(initial, null, 2)}\n`);
  const editor = process.env.EDITOR || process.env.VISUAL || (process.platform === 'win32' ? 'notepad' : 'vi');
  const result = spawnSync(editor, [temporary], { stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0) throw new Error(`Editor exited with status ${result.status}.`);
  const updated = JSON.parse(fs.readFileSync(temporary, 'utf8'));
  fs.unlinkSync(temporary);
  if (!updated || Array.isArray(updated) || typeof updated !== 'object') throw new Error('Overrides must be a JSON object.');
  const record = requireRecord(id);
  record.localOverrides = updated;
  writeArticleRecord(process.cwd(), record);
}

async function generate(): Promise<void> { await new FrontendGenerator().generate({} as never); }
