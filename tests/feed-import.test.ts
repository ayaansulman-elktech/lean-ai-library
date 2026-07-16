import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import { inspectFeeds } from '../cli/core/feed-import';

const roots: string[] = [];
afterEach(() => roots.splice(0).forEach((root) => fs.rmSync(root, { recursive: true, force: true })));

function temporaryRoot(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lean-feed-'));
  roots.push(root);
  fs.mkdirSync(path.join(root, 'content', 'articles'), { recursive: true });
  return root;
}

describe('portable feed discovery', () => {
  it('finds arbitrarily named JSON feeds and ignores unrelated JSON', () => {
    const root = temporaryRoot();
    const feeds = path.join(root, 'moved-output', 'nested');
    fs.mkdirSync(feeds, { recursive: true });
    fs.writeFileSync(path.join(feeds, 'agents.json'), JSON.stringify({
      schemaVersion: '1.0.0',
      library: { id: 'agent-library', name: 'Agents' },
      articles: [{ id: 'demo-agent', type: 'agent', category: 'agent-library', name: 'Demo', shortDescription: 'Demo agent', description: 'Description', keywords: [], fileTree: [] }]
    }));
    fs.writeFileSync(path.join(feeds, 'unrelated.json'), JSON.stringify({ enabled: true }));
    const summary = inspectFeeds(path.join(root, 'moved-output'), root);
    expect(summary.files).toHaveLength(1);
    expect(summary.added).toBe(1);
    expect(summary.articles.has('demo-agent')).toBe(true);
  });
});
