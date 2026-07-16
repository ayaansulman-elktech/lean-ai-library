import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import AdmZip from 'adm-zip';
import { afterEach, describe, expect, it } from 'vitest';
import { inspectFeeds } from '../cli/core/feed-import';

const roots: string[] = [];
afterEach(() => roots.splice(0).forEach((root) => fs.rmSync(root, { recursive: true, force: true })));

describe('installable feed packages', () => {
  it('discovers and verifies a checksummed article archive', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lean-package-feed-'));
    roots.push(root);
    fs.mkdirSync(path.join(root, 'content', 'articles'), { recursive: true });
    const output = path.join(root, 'portable');
    const packages = path.join(output, 'packages');
    fs.mkdirSync(packages, { recursive: true });
    const archive = path.join(packages, 'demo.zip');
    const zip = new AdmZip();
    zip.addFile('README.md', Buffer.from('# Demo\n'));
    zip.writeZip(archive);
    const sha256 = crypto.createHash('sha256').update(fs.readFileSync(archive)).digest('hex');
    fs.writeFileSync(path.join(output, 'agents.json'), JSON.stringify({
      schemaVersion: '1.0.0',
      library: { id: 'agent-library', name: 'Agents' },
      articles: [{
        id: 'demo', type: 'agent', category: 'agent-library', name: 'Demo',
        shortDescription: 'Demo', description: 'Demo', keywords: [], fileTree: [],
        package: { format: 'zip', path: 'packages/demo.zip', sha256 }
      }]
    }));
    const summary = inspectFeeds(output, root);
    expect(summary.archives.get('demo')).toBe(archive);
  });
});
