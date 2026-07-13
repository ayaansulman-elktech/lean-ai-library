import fs from 'fs';
import path from 'path';
import { Generator, GeneratorContext } from './base';
import { Asset } from '../../src/lib/types/asset';

export class IndexGenerator implements Generator {
  name = 'IndexGenerator';

  async generate(ctx: GeneratorContext): Promise<void> {
    const dataDir = path.join(process.cwd(), 'data');
    const contentDir = path.join(process.cwd(), 'content');
    const articlesDir = path.join(contentDir, 'articles');
    const categoriesDir = path.join(contentDir, 'categories');

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // 1. Read Categories
    const categories = [];
    if (fs.existsSync(categoriesDir)) {
      const catFiles = fs.readdirSync(categoriesDir).filter(f => f.endsWith('.json'));
      for (const file of catFiles) {
        const slug = path.basename(file, '.json');
        const content = JSON.parse(fs.readFileSync(path.join(categoriesDir, file), 'utf-8'));
        categories.push({ slug, ...content });
      }
    }

    // 2. Read Articles (from block.json or article.json)
    const articles = [];
    if (fs.existsSync(articlesDir)) {
      const dirs = fs.readdirSync(articlesDir).filter(d => !d.startsWith('.') && fs.statSync(path.join(articlesDir, d)).isDirectory());
      
      for (const slug of dirs) {
        const dir = path.join(articlesDir, slug);
        const blockPath = path.join(dir, 'block.json');
        const legacyPath = path.join(dir, 'article.json');

        let data: any = {};
        if (fs.existsSync(blockPath)) {
          data = JSON.parse(fs.readFileSync(blockPath, 'utf-8'));
        } else if (fs.existsSync(legacyPath)) {
          const legacy = JSON.parse(fs.readFileSync(legacyPath, 'utf-8'));
          data = { localOverrides: legacy };
        } else {
          continue; // No metadata
        }

        const factoryData = data.factoryData || {};
        const localOverrides = data.localOverrides || {};
        const merged = { ...factoryData, ...localOverrides };

        // Determine content and cover paths
        const findFile = (base: string, ignore: string[] = []) => {
          const files = fs.readdirSync(dir)
            .filter(f => !f.startsWith('.'))
            .filter(f => path.basename(f, path.extname(f)) === base)
            .filter(f => !ignore.includes(f));
          return files[0] ? path.posix.join('content', 'articles', slug, files[0]) : null;
        };

        const contentFile = findFile('content', ['cover-preview.png']);
        const coverFile = findFile('cover', ['cover-preview.png']);
        const coverPreview = findFile('cover-preview', []);

        articles.push({
          slug,
          ...merged,
          contentPath: contentFile || merged.contentPath || '',
          coverPath: coverFile || merged.coverPath || 'assets/library-card-cover.png',
          coverPreviewPath: coverPreview || merged.coverPreviewPath || ''
        });
      }
    }

    // Sort to match cognitive-shift
    articles.sort((a, b) => a.slug.localeCompare(b.slug));
    categories.sort((a, b) => a.slug.localeCompare(b.slug));

    // Write final JSONs
    fs.writeFileSync(path.join(dataDir, 'articles.json'), JSON.stringify(articles, null, 2));
    fs.writeFileSync(path.join(dataDir, 'categories.json'), JSON.stringify(categories, null, 2));
  }
}
