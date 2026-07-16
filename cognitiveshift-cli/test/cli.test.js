import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import AdmZip from 'adm-zip';
import { installArticle, parseArguments, safeRelativePath } from '../bin/index.js';

test('parses an article and installer options', () => {
  assert.deepEqual(parseArguments(['iris', '--output', './models', '--force', '--dry-run']), {
    id: 'iris', output: './models', force: true, dryRun: true, list: false, help: false
  });
});

test('installs an archive and protects conflicts', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cognitiveshift-cli-'));
  const packages = path.join(root, 'packages');
  const project = path.join(root, 'project');
  fs.mkdirSync(packages);
  fs.mkdirSync(project);
  const zip = new AdmZip();
  zip.addFile('README.md', Buffer.from('# Iris\n'));
  zip.addFile('src/model.py', Buffer.from('MODEL = True\n'));
  zip.writeZip(path.join(packages, 'iris.zip'));
  const options = { id: 'iris', output: '', force: false, dryRun: false };
  const result = installArticle(options, packages, project);
  assert.equal(result.files.length, 2);
  assert.equal(fs.readFileSync(path.join(project, 'iris', 'README.md'), 'utf8'), '# Iris\n');
  assert.throws(() => installArticle(options, packages, project), /file conflict/);
  fs.rmSync(root, { recursive: true, force: true });
});

test('rejects traversal paths', () => {
  assert.throws(() => safeRelativePath('../outside.txt'), /Unsafe archive path/);
  assert.throws(() => safeRelativePath('/absolute.txt'), /Unsafe archive path/);
});
