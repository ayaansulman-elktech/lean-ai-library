import fs from 'fs';
import path from 'path';
import { FrontendGenerator } from '../generators/frontend.generator';
import { FeedArticle, readArticleRecord, readJson, validateFeed, writeArticleRecord } from './catalog';

export interface ImportSummary {
  files: string[];
  articles: Map<string, FeedArticle>;
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
  for (const file of files) {
    const feed = validateFeed(readJson(file));
    for (const article of feed.articles) {
      if (articles.has(article.id)) throw new Error(`Article id ${article.id} occurs in more than one selected JSON feed.`);
      articles.set(article.id, article);
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
  return { files, articles, added, updated, unchanged };
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
