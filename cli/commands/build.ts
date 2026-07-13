import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import { RepositoryReader } from '../core/reader';
import { AssetDiscovery } from '../core/discovery';
import { ExtractionPipeline } from '../core/pipeline';
import { Asset } from '../../src/lib/types/asset';
import { loadConfig } from '../core/config';

export const buildCommand = new Command('build')
  .description('Build the static JSON indexes and copy content from the repository')
  .action(async () => {
    console.log(chalk.blue.bold('\nLean AI Library Generator\n'));
    
    let config;
    try {
      config = loadConfig();
    } catch (e: any) {
      console.error(chalk.red(`Configuration Error: ${e.message}`));
      process.exit(1);
    }

    // Default to the repo in config
    const readerOptions = { 
      repo: config.source.repository,
      branch: config.source.branch
    };
    const reader = new RepositoryReader(readerOptions);
    let repoDir: string;

    try {
      console.log(chalk.gray('Preparing repository...'));
      repoDir = await reader.prepare();
      console.log(chalk.green(`✓ Repository ready at ${repoDir}\n`));
      
      console.log(chalk.gray('Scanning repository...'));
      const discovery = new AssetDiscovery();
      const candidateDirs = await discovery.discover(repoDir);
      console.log(chalk.green(`✓ Found ${candidateDirs.length} candidate assets\n`));
      
      console.log(chalk.gray('Parsing metadata...'));
      const pipeline = new ExtractionPipeline();
      const assets: Asset[] = [];

      let parsedReadme = 0;
      let parsedSkill = 0;
      let parsedPyproject = 0;
      let parsedPackage = 0;

      for (const dir of candidateDirs) {
        const asset = await pipeline.process({ repoDir, assetDir: dir });
        assets.push(asset);
        
        if (asset.readme) parsedReadme++;
        if (asset.skill) parsedSkill++;
      }
      
      const fs = await import('fs');
      candidateDirs.forEach(dir => {
        if (fs.existsSync(path.join(dir, 'pyproject.toml'))) parsedPyproject++;
        if (fs.existsSync(path.join(dir, 'package.json'))) parsedPackage++;
      });

      console.log(chalk.green(`✓ Parsed ${parsedReadme} README files`));
      console.log(chalk.green(`✓ Parsed ${parsedSkill} SKILL files`));
      console.log(chalk.green(`✓ Parsed ${parsedPyproject} pyproject.toml files`));
      console.log(chalk.green(`✓ Parsed ${parsedPackage} package.json files\n`));

      console.log(chalk.gray('Normalizing assets...'));
      console.log(chalk.green(`✓ Generated ${assets.length} Asset objects\n`));

      console.log(chalk.gray('Upserting assets to content/articles/...'));
      const contentDir = path.join(process.cwd(), 'content', 'articles');
      if (!fs.existsSync(contentDir)) fs.mkdirSync(contentDir, { recursive: true });

      const slugify = (val: string) => val.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^[-_]+|[-_]+$/g, '');

      let upsertedCount = 0;
      for (const asset of assets) {
        const slug = slugify(asset.id || asset.name);
        if (!slug) continue;

        const assetDir = path.join(contentDir, slug);
        if (!fs.existsSync(assetDir)) fs.mkdirSync(assetDir, { recursive: true });

        const blockPath = path.join(assetDir, 'block.json');
        const legacyPath = path.join(assetDir, 'article.json');

        let existing: any = {};
        if (fs.existsSync(blockPath)) {
          existing = JSON.parse(fs.readFileSync(blockPath, 'utf-8'));
        } else if (fs.existsSync(legacyPath)) {
          existing = { localOverrides: JSON.parse(fs.readFileSync(legacyPath, 'utf-8')) };
        }

        const newBlock = {
          factoryData: asset,
          localOverrides: existing.localOverrides || {}
        };

        fs.writeFileSync(blockPath, JSON.stringify(newBlock, null, 2));
        upsertedCount++;
      }
      
      console.log(chalk.green(`✓ Upserted ${upsertedCount} assets\n`));

      console.log(chalk.gray('Generating frontend indexes...'));
      
      const { IndexGenerator } = await import('../generators/index.generator');
      const indexGen = new IndexGenerator();
      const startGenTime = Date.now();
      await indexGen.generate({} as any);
      const buildDuration = ((Date.now() - startGenTime) / 1000).toFixed(1);

      console.log(chalk.green(`✓ Generated data/articles.json`));
      console.log(chalk.green(`✓ Generated data/categories.json\n`));

      const uniqueCategories = new Set(assets.map(a => a.category)).size;

      console.log(chalk.bold('Build Summary'));
      console.log(chalk.cyan(`Repository scanned`));
      console.log(`${chalk.yellow(assets.length)} assets`);
      console.log(`${chalk.yellow(uniqueCategories)} categories\n`);

      console.log(chalk.gray(`Completed in ${buildDuration}s\n`));
      
    } catch (error) {
      console.error(chalk.red('\nBuild failed:'), error);
      process.exit(1);
    } finally {
      await reader.cleanup();
    }
  });
