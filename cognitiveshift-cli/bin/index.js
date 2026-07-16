#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import AdmZip from 'adm-zip';
import chalk from 'chalk';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packagesDir = path.join(packageRoot, 'packages');

export function parseArguments(argv) {
  const options = { id: '', output: '', force: false, dryRun: false, list: false, help: false };
  for (let index = 0; index < argv.length; index++) {
    const value = argv[index];
    if (value === '--force') options.force = true;
    else if (value === '--dry-run') options.dryRun = true;
    else if (value === '--list') options.list = true;
    else if (value === '--help' || value === '-h') options.help = true;
    else if (value === '--output' || value === '-o') {
      options.output = argv[++index] || '';
      if (!options.output) throw new Error(`${value} requires a directory.`);
    } else if (value.startsWith('-')) throw new Error(`Unknown option: ${value}`);
    else if (!options.id) options.id = value;
    else throw new Error(`Unexpected argument: ${value}`);
  }
  return options;
}

export function availableArticles(directory = packagesDir) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory)
    .filter((name) => name.toLowerCase().endsWith('.zip'))
    .map((name) => path.basename(name, '.zip'))
    .sort();
}

function usage() {
  console.log(`CognitiveShift installer

Usage:
  npx cognitiveshift <article-id> [options]
  npx cognitiveshift --list

Options:
  -o, --output <directory>  Destination (default: ./<article-id>)
      --dry-run             Show files without writing
      --force               Replace conflicting files
  -h, --help                Show this help

Examples:
  npx cognitiveshift iris
  npx cognitiveshift iris --output ./models/iris
  npx cognitiveshift iris --output . --dry-run`);
}

export function safeRelativePath(name) {
  const normalized = name.replaceAll('\\', '/').replace(/^\.\//, '');
  if (!normalized || normalized.startsWith('/') || /^[a-z]:/i.test(normalized)) throw new Error(`Unsafe archive path: ${name}`);
  const parts = normalized.split('/').filter(Boolean);
  if (parts.includes('..')) throw new Error(`Unsafe archive path: ${name}`);
  return parts.join(path.sep);
}

export function installArticle(options, directory = packagesDir, cwd = process.cwd()) {
  if (!/^[a-z0-9][a-z0-9_-]*$/.test(options.id)) throw new Error('Article ID must use lowercase letters, numbers, hyphens, or underscores.');
  const archive = path.join(directory, `${options.id}.zip`);
  if (!fs.existsSync(archive)) throw new Error(`Article "${options.id}" is not available. Run "npx cognitiveshift --list" to see available IDs.`);
  const destination = path.resolve(cwd, options.output || options.id);
  const zip = new AdmZip(archive);
  const entries = zip.getEntries().map((entry) => ({ entry, relative: safeRelativePath(entry.entryName) }));
  const conflicts = entries
    .filter(({ entry }) => !entry.isDirectory)
    .map(({ relative }) => path.join(destination, relative))
    .filter((target) => fs.existsSync(target));
  if (conflicts.length && !options.force) {
    const preview = conflicts.slice(0, 5).map((file) => path.relative(cwd, file)).join(', ');
    throw new Error(`${conflicts.length} file conflict(s): ${preview}${conflicts.length > 5 ? ', ...' : ''}. Use --force to replace them or choose --output.`);
  }
  if (options.dryRun) return { destination, files: entries.filter(({ entry }) => !entry.isDirectory).map(({ relative }) => relative), conflicts };
  for (const { entry, relative } of entries) {
    const target = path.join(destination, relative);
    if (entry.isDirectory) fs.mkdirSync(target, { recursive: true });
    else {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, entry.getData());
    }
  }
  return { destination, files: entries.filter(({ entry }) => !entry.isDirectory).map(({ relative }) => relative), conflicts };
}

async function main() {
  try {
    const options = parseArguments(process.argv.slice(2));
    if (options.help) return usage();
    if (options.list) {
      const articles = availableArticles();
      console.log(articles.length ? articles.join('\n') : 'No article packages are bundled in this release.');
      return;
    }
    if (!options.id) {
      usage();
      process.exitCode = 1;
      return;
    }
    console.log(chalk.cyan(`Installing CognitiveShift article: ${options.id}`));
    const result = installArticle(options);
    if (options.dryRun) console.log(chalk.yellow(`Dry run: ${result.files.length} files would be written to ${result.destination}`));
    else console.log(chalk.green(`Ã¢Å“â€œ Installed ${result.files.length} files into ${result.destination}`));
  } catch (error) {
    console.error(chalk.red(`Ã¢Å“â€” ${error.message}`));
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
