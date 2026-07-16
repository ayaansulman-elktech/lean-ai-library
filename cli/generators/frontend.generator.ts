import fs from 'fs';
import path from 'path';
import { Generator, GeneratorContext } from './base';
import { FeedFileNode, mergeArticle, readArticleRecord } from '../core/catalog';

export class FrontendGenerator implements Generator {
  name = 'FrontendGenerator';

  async generate(_ctx: GeneratorContext): Promise<void> {
    const root = process.cwd();
    const dataDir = path.join(root, 'data');
    const detailsDir = path.join(dataDir, 'articles');
    const articlesDir = path.join(root, 'content', 'articles');
    const categoriesDir = path.join(root, 'content', 'categories');
    fs.mkdirSync(detailsDir, { recursive: true });
    const categories = fs.existsSync(categoriesDir) ? fs.readdirSync(categoriesDir).filter((file) => file.endsWith('.json')).map((file) => ({
      slug: path.basename(file, '.json'), ...JSON.parse(fs.readFileSync(path.join(categoriesDir, file), 'utf8'))
    })) : [];
    const articles: Record<string, unknown>[] = [];
    const activeIds = new Set<string>();
    if (fs.existsSync(articlesDir)) for (const id of fs.readdirSync(articlesDir).sort()) {
      const dir = path.join(articlesDir, id);
      if (id.startsWith('.') || !fs.statSync(dir).isDirectory()) continue;
      const record = readArticleRecord(root, id);
      if (!record) continue;
      const merged = addLegacyLocalFiles(mergeArticle(record), dir, id);
      const fileTree = record.factoryData.fileTree || fallbackFileTree(record.factoryData, merged);
      const detail = { ...merged, fileTree };
      const { readme: _readme, skill: _skill, fileTree: _tree, ...catalogItem } = detail as typeof detail & { readme?: unknown; skill?: unknown };
      articles.push(catalogItem);
      activeIds.add(id);
      fs.writeFileSync(path.join(detailsDir, `${id}.json`), `${JSON.stringify(detail, null, 2)}\n`);
    }
    for (const file of fs.readdirSync(detailsDir).filter((item) => item.endsWith('.json'))) if (!activeIds.has(path.basename(file, '.json'))) fs.unlinkSync(path.join(detailsDir, file));
    articles.sort((a, b) => String(a.slug).localeCompare(String(b.slug)));
    categories.sort((a, b) => String(a.slug).localeCompare(String(b.slug)));
    fs.writeFileSync(path.join(dataDir, 'articles.json'), `${JSON.stringify(articles, null, 2)}\n`);
    fs.writeFileSync(path.join(dataDir, 'categories.json'), `${JSON.stringify(categories, null, 2)}\n`);
  }
}

function addLegacyLocalFiles(article: any, dir: string, id: string): any {
  const files = fs.readdirSync(dir).filter((file) => !file.startsWith('.') && !['block.json', 'article.json'].includes(file));
  if (!article.contentPath) {
    const content = files.find((file) => /^content\.(pdf|md)$/i.test(file));
    if (content) article.contentPath = path.posix.join('content', 'articles', id, content);
  }
  if (!article.coverPreviewPath) {
    const cover = files.find((file) => /^(thumbnail|cover-preview)\.(png|jpe?g|webp|gif)$/i.test(file));
    if (cover) article.coverPreviewPath = path.posix.join('content', 'articles', id, cover);
  }
  if (article.coverPreviewPath) article.coverPath = article.coverPreviewPath;
  return article;
}

function fallbackFileTree(factoryData: any, article: any): FeedFileNode[] {
  const nodes: FeedFileNode[] = [];
  if (factoryData.readme) nodes.push({ name: 'README.md', type: 'file', path: 'README.md', content: factoryData.readme });
  if (factoryData.skill) nodes.push({ name: 'SKILL.md', type: 'file', path: 'SKILL.md', content: factoryData.skill });
  if (!nodes.length) {
    const manifest = { ...article };
    delete manifest.fileTree;
    nodes.push({ name: 'block.json', type: 'file', path: 'block.json', content: JSON.stringify(manifest, null, 2) });
  }
  return nodes;
}
