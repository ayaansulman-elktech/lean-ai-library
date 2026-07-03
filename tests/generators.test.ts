import { describe, it, expect, beforeAll } from 'vitest';
import path from 'path';
import fs from 'fs';
import { AssetDiscovery } from '../cli/core/discovery';
import { ExtractionPipeline } from '../cli/core/pipeline';
import { CatalogGenerator } from '../cli/generators/catalog.generator';
import { CategoriesGenerator } from '../cli/generators/categories.generator';
import { SearchGenerator } from '../cli/generators/search.generator';
import { ManifestGenerator } from '../cli/generators/manifest.generator';
import { ContentGenerator } from '../cli/generators/content.generator';

describe('Generators', () => {
  const repoDir = path.resolve(__dirname, 'fixtures/test-repo');
  const outputDir = path.resolve(__dirname, '../generated-test');
  
  let assets: any[] = [];
  let ctx: any;

  beforeAll(async () => {
    // 1. Discover
    const discovery = new AssetDiscovery();
    const dirs = await discovery.discover(repoDir);
    
    // 2. Extract
    const pipeline = new ExtractionPipeline();
    for (const dir of dirs) {
      const asset = await pipeline.process({ repoDir, assetDir: dir });
      assets.push(asset);
    }
    
    // 3. Setup context
    ctx = {
      assets,
      outputDir,
      sourceDir: repoDir,
      stats: { assetsCopied: 0 }
    };
  });

  it('should generate catalog.json', async () => {
    const gen = new CatalogGenerator();
    await gen.generate(ctx);
    
    const content = JSON.parse(fs.readFileSync(path.join(outputDir, 'catalog.json'), 'utf-8'));
    expect(content.schemaVersion).toBe('1.0.0');
    expect(content.items).toHaveLength(1);
    expect(content.items[0].id).toBe('test-agent');
    expect(content.items[0].name).toBe('Test Agent');
    expect(content.items[0].category).toBe('agents');
  });

  it('should generate categories.json', async () => {
    const gen = new CategoriesGenerator();
    await gen.generate(ctx);
    
    const content = JSON.parse(fs.readFileSync(path.join(outputDir, 'categories.json'), 'utf-8'));
    expect(content.items).toHaveLength(1);
    expect(content.items[0].id).toBe('agents');
    expect(content.items[0].count).toBe(1);
  });

  it('should generate search.json', async () => {
    const gen = new SearchGenerator();
    await gen.generate(ctx);
    
    const content = JSON.parse(fs.readFileSync(path.join(outputDir, 'search.json'), 'utf-8'));
    expect(content.items[0].id).toBe('test-agent');
    expect(content.items[0].keywords).toEqual(['test', 'agent']);
  });

  it('should generate content for the asset', async () => {
    const gen = new ContentGenerator();
    await gen.generate(ctx);
    
    const contentDir = path.join(outputDir, 'content/agents/test-agent');
    expect(fs.existsSync(contentDir)).toBe(true);
    expect(fs.existsSync(path.join(contentDir, 'index.json'))).toBe(true);
    expect(fs.existsSync(path.join(contentDir, 'README.md'))).toBe(true);
    
    const indexData = JSON.parse(fs.readFileSync(path.join(contentDir, 'index.json'), 'utf-8'));
    expect(indexData.metadata.id).toBe('test-agent');
    expect(indexData.toc.length).toBeGreaterThan(0);
  });
});
