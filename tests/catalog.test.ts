import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import { createRecord, mergeArticle, readArticleRecord, validateFeed, writeArticleRecord } from '../cli/core/catalog';

const temporary: string[] = [];
afterEach(() => temporary.splice(0).forEach((dir) => fs.rmSync(dir, { recursive: true, force: true })));

function root() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lean-library-'));
  temporary.push(dir);
  return dir;
}

const article = {
  id: 'language-model', type: 'folder', category: 'model-library', name: 'Language Model',
  shortDescription: 'Imported text', description: 'Description', keywords: ['llm'], fileTree: []
};

describe('catalog feeds and records', () => {
  it('validates a versioned grouped feed', () => {
    const feed = validateFeed({ schemaVersion: '1.0.0', library: { id: 'model-library', name: 'Models' }, articles: [article] });
    expect(feed.articles[0].id).toBe('language-model');
  });

  it('rejects duplicate stable ids', () => {
    expect(() => validateFeed({ schemaVersion: '1.0.0', library: { id: 'models', name: 'Models' }, articles: [article, article] }))
      .toThrow(/duplicates language-model/);
  });

  it('preserves overrides and attachments when factory data changes', () => {
    const dir = root();
    const record = createRecord(article.id, article);
    record.localOverrides.shortDescription = 'Curated text';
    record.attachments.thumbnail = 'content/articles/language-model/thumbnail.png';
    writeArticleRecord(dir, record);
    const imported = readArticleRecord(dir, article.id)!;
    imported.factoryData = { ...article, shortDescription: 'New imported text' };
    writeArticleRecord(dir, imported);
    const saved = readArticleRecord(dir, article.id)!;
    expect(mergeArticle(saved).shortDescription).toBe('Curated text');
    expect(saved.attachments.thumbnail).toContain('thumbnail.png');
  });
});
