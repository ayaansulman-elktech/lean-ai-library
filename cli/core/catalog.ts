import fs from 'fs';
import path from 'path';

export const SCHEMA_VERSION = '1.0.0';
export const ARTICLE_TYPES = ['agent', 'library', 'model', 'application', 'pipeline', 'other', 'pdf', 'md', 'folder', 'file'] as const;

export interface FeedFileNode {
  name: string;
  type: 'file' | 'directory';
  path: string;
  content?: string;
  children?: FeedFileNode[];
}

export interface FeedArticle {
  id: string;
  type: string;
  category: string;
  name: string;
  shortDescription: string;
  description: string;
  keywords: string[];
  sourcePath?: string;
  fileTree?: FeedFileNode[];
  version?: string;
  lastUpdated?: string;
  [key: string]: unknown;
}

export interface LibraryFeed {
  schemaVersion: string;
  library: { id: string; name: string; description?: string };
  articles: FeedArticle[];
}

export interface ArticleRecord {
  schemaVersion: string;
  id: string;
  factoryData: FeedArticle;
  localOverrides: Partial<FeedArticle>;
  attachments: { thumbnail: string | null; pdf: string | null };
}

const requiredStrings = ['id', 'type', 'category', 'name', 'shortDescription', 'description'] as const;

export function validateFeed(value: unknown): LibraryFeed {
  const feed = value as LibraryFeed;
  const errors: string[] = [];
  if (!feed || typeof feed !== 'object') throw new Error('Feed must be a JSON object.');
  if (feed.schemaVersion !== SCHEMA_VERSION) errors.push(`schemaVersion must be ${SCHEMA_VERSION}`);
  if (!feed.library || typeof feed.library.id !== 'string' || !feed.library.id.trim()) errors.push('library.id is required');
  if (!feed.library || typeof feed.library.name !== 'string' || !feed.library.name.trim()) errors.push('library.name is required');
  if (!Array.isArray(feed.articles)) errors.push('articles must be an array');

  const ids = new Set<string>();
  for (const [index, article] of (Array.isArray(feed.articles) ? feed.articles : []).entries()) {
    const label = `articles[${index}]`;
    for (const field of requiredStrings) {
      if (typeof article?.[field] !== 'string' || !(article[field] as string).trim()) errors.push(`${label}.${field} is required`);
    }
    if (article?.id && !/^[a-z0-9][a-z0-9_-]*$/.test(article.id)) errors.push(`${label}.id must use lowercase letters, numbers, hyphens, or underscores`);
    if (article?.id && ids.has(article.id)) errors.push(`${label}.id duplicates ${article.id}`);
    if (article?.id) ids.add(article.id);
    if (!Array.isArray(article?.keywords) || article.keywords.some((item) => typeof item !== 'string')) errors.push(`${label}.keywords must be an array of strings`);
    validateTree(article?.fileTree || [], `${label}.fileTree`, errors);
  }
  if (errors.length) throw new Error(`Invalid library feed:\n- ${errors.join('\n- ')}`);
  return feed;
}

function validateTree(nodes: FeedFileNode[], label: string, errors: string[]): void {
  if (!Array.isArray(nodes)) {
    errors.push(`${label} must be an array`);
    return;
  }
  for (const [index, node] of nodes.entries()) {
    const nodeLabel = `${label}[${index}]`;
    if (!node || typeof node.name !== 'string' || typeof node.path !== 'string') errors.push(`${nodeLabel} requires name and path`);
    if (node?.path && (path.isAbsolute(node.path) || node.path.split(/[\\/]/).includes('..'))) errors.push(`${nodeLabel}.path must be relative and cannot contain ..`);
    if (node?.type !== 'file' && node?.type !== 'directory') errors.push(`${nodeLabel}.type must be file or directory`);
    if (node?.type === 'directory') validateTree(node.children || [], `${nodeLabel}.children`, errors);
  }
}

export function articleDirectory(root: string, id: string): string {
  return path.join(root, 'content', 'articles', id);
}

export function readArticleRecord(root: string, id: string): ArticleRecord | null {
  const dir = articleDirectory(root, id);
  const blockPath = path.join(dir, 'block.json');
  const legacyPath = path.join(dir, 'article.json');
  if (fs.existsSync(blockPath)) {
    const raw = JSON.parse(fs.readFileSync(blockPath, 'utf8'));
    if (raw.factoryData) {
      return {
        schemaVersion: raw.schemaVersion || SCHEMA_VERSION,
        id: raw.id || id,
        factoryData: { id, ...raw.factoryData },
        localOverrides: raw.localOverrides || {},
        attachments: raw.attachments || inferAttachments(dir, id)
      };
    }
    return createRecord(id, { id, ...raw });
  }
  if (fs.existsSync(legacyPath)) return createRecord(id, { id, ...JSON.parse(fs.readFileSync(legacyPath, 'utf8')) });
  return null;
}

export function createRecord(id: string, data: Partial<FeedArticle>): ArticleRecord {
  return {
    schemaVersion: SCHEMA_VERSION,
    id,
    factoryData: data as FeedArticle,
    localOverrides: {},
    attachments: { thumbnail: null, pdf: null }
  };
}

export function writeArticleRecord(root: string, record: ArticleRecord): void {
  const dir = articleDirectory(root, record.id);
  fs.mkdirSync(dir, { recursive: true });
  const target = path.join(dir, 'block.json');
  const temporary = `${target}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(record, null, 2)}\n`);
  fs.renameSync(temporary, target);
}

export function mergeArticle(record: ArticleRecord): FeedArticle & { slug: string; contentPath: string; coverPath: string; coverPreviewPath: string } {
  const merged = { ...record.factoryData, ...record.localOverrides, id: record.id } as FeedArticle;
  return {
    ...merged,
    slug: record.id,
    contentPath: record.attachments.pdf || '',
    coverPath: record.attachments.thumbnail || 'assets/default_thumbnail.png',
    coverPreviewPath: record.attachments.thumbnail || ''
  };
}

function inferAttachments(dir: string, id: string): ArticleRecord['attachments'] {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
  const thumbnail = files.find((file) => /^(thumbnail|cover-preview|cover)\.(png|jpe?g|webp|gif)$/i.test(file));
  const pdf = files.find((file) => /^(content|article)\.pdf$/i.test(file));
  return {
    thumbnail: thumbnail ? path.posix.join('content', 'articles', id, thumbnail) : null,
    pdf: pdf ? path.posix.join('content', 'articles', id, pdf) : null
  };
}

export function readJson(filePath: string): unknown {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}
