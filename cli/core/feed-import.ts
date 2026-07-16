import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import crypto from 'crypto';
import { FrontendGenerator } from '../generators/frontend.generator';
import { FeedArticle, readArticleRecord, readJson, validateFeed, writeArticleRecord } from './catalog';

export interface ImportSummary {
  files: string[];
  articles: Map<string, FeedArticle>;
  archives: Map<string, string>;
  added: number;
  updated: number;
  unchanged: number;
}

export function inspectFeeds(input: string, root = process.cwd()): ImportSummary {
  const resolved = path.resolve(input);
  if (!fs.existsSync(resolved)) throw new Error(`JSON path not found: ${resolved}`);
  const files = discoverJsonFeeds(resolved);
  if (!files.length) throw new Error(`No valid Library JSON feeds found in ${resolved}`);
  const articles = new Map<string, FeedArticle>();
  const archives = new Map<string, string>();
  for (const file of files) {
    const feed = validateFeed(readJson(file));
    for (const article of feed.articles) {
      if (articles.has(article.id)) throw new Error(`Article id ${article.id} occurs in more than one selected JSON feed.`);
      articles.set(article.id, article);
      const packageInfo = article.package as { format?: unknown; path?: unknown; sha256?: unknown } | undefined;
      if (packageInfo) {
        if (packageInfo.format !== 'zip' || typeof packageInfo.path !== 'string' || typeof packageInfo.sha256 !== 'string') {
          throw new Error('Article ' + article.id + ' has invalid package metadata.');
        }
        const archive = path.resolve(path.dirname(file), packageInfo.path);
        if (!fs.existsSync(archive) || !fs.statSync(archive).isFile()) throw new Error('Package archive not found for ' + article.id + ': ' + archive);
        const checksum = crypto.createHash('sha256').update(fs.readFileSync(archive)).digest('hex');
        if (checksum !== packageInfo.sha256.toLowerCase()) throw new Error('Package checksum does not match for ' + article.id + '.');
        archives.set(article.id, archive);
      }
    }
  }
  let added = 0;
  let updated = 0;
  let unchanged = 0;
  for (const [id, article] of articles) {
    const existing = readArticleRecord(root, id);
    if (!existing) added++;
    else if (JSON.stringify(existing.factoryData) === JSON.stringify(article)) unchanged++;
    else updated++;
  }
  return { files, articles, archives, added, updated, unchanged };
}

export async function applyFeeds(summary: ImportSummary, root = process.cwd()): Promise<void> {
  for (const [id, article] of summary.articles) {
    const existing = readArticleRecord(root, id);
    if (!existing) {
      writeArticleRecord(root, { schemaVersion: '1.0.0', id, factoryData: article, localOverrides: {}, attachments: { thumbnail: null, pdf: null } });
    } else if (JSON.stringify(existing.factoryData) !== JSON.stringify(article)) {
      writeArticleRecord(root, { ...existing, factoryData: article });
    }
  }
  if (summary.archives.size) {
    const packagesDir = path.join(root, 'cognitiveshift-cli', 'packages');
    fs.mkdirSync(packagesDir, { recursive: true });
    for (const [id, archive] of summary.archives) fs.copyFileSync(archive, path.join(packagesDir, id + '.zip'));
  }
  ensureFallbackPackages(root, new Set(summary.archives.keys()));
  await new FrontendGenerator().generate({} as never);
}

function discoverJsonFeeds(input: string): string[] {
  const candidates: string[] = [];
  const inspect = (file: string) => {
    if (path.extname(file).toLowerCase() !== '.json') return;
    try {
      const value = readJson(file) as { schemaVersion?: unknown; library?: unknown; articles?: unknown };
      if (value?.schemaVersion === '1.0.0' && value.library && Array.isArray(value.articles)) candidates.push(file);
    } catch {
      // Unrelated or malformed JSON files are not Library feeds.
    }
  };
  if (fs.statSync(input).isFile()) inspect(input);
  else {
    const walk = (directory: string) => {
      for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        if (entry.name.startsWith('.') || ['node_modules', '.git'].includes(entry.name)) continue;
        const target = path.join(directory, entry.name);
        if (entry.isDirectory()) walk(target);
        else if (entry.isFile()) inspect(target);
      }
    };
    walk(input);
  }
  return candidates.sort();
}


function ensureFallbackPackages(root: string, factoryPackages: Set<string>): void {
  const articlesDir = path.join(root, 'content', 'articles');
  const packagesDir = path.join(root, 'cognitiveshift-cli', 'packages');
  if (!fs.existsSync(articlesDir)) return;
  fs.mkdirSync(packagesDir, { recursive: true });
  for (const id of fs.readdirSync(articlesDir).sort()) {
    const directory = path.join(articlesDir, id);
    if (!fs.statSync(directory).isDirectory()) continue;
    const archive = path.join(packagesDir, id + '.zip');
    if (fs.existsSync(archive) && factoryPackages.has(id)) continue;
    if (fs.existsSync(archive)) fs.unlinkSync(archive);
    const record = readArticleRecord(root, id);
    if (!record) continue;
    const zip = new AdmZip();
    let entries = 0;
    const addTree = (nodes: any[]) => {
      for (const node of nodes || []) {
        if (node.type === 'directory') addTree(node.children || []);
        else if (typeof node.content === 'string') {
          zip.addFile(String(node.path).replaceAll('\\', '/'), Buffer.from(node.content));
          entries++;
        }
      }
    };
    addTree(record.factoryData.fileTree || []);
    for (const [kind, relative] of Object.entries(record.attachments) as [string, string | null][]) {
      if (!relative || kind !== 'pdf') continue;
      const source = path.resolve(root, relative);
      if (fs.existsSync(source) && fs.statSync(source).isFile()) {
        zip.addLocalFile(source, 'attachments', path.basename(source));
        entries++;
      }
    }
    zip.addFile('block.json', Buffer.from(JSON.stringify(record, null, 2) + '\n'));
    entries++;
    if (entries === 1) zip.addFile('README.md', Buffer.from('# ' + record.factoryData.name + '\n\n' + record.factoryData.description + '\n'));
    zip.writeZip(archive);
  }
}
