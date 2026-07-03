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
    const readerOptions = { repo: config.source.repository };
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

      console.log(chalk.gray('Generating static content...'));
      
      const outputDir = path.resolve(process.cwd(), config.output.directory);
      
      // Compute repo info once
      let branch = config.source.branch || 'main';
      let commit = 'unknown';
      try {
        const simpleGit = (await import('simple-git')).default;
        const git = simpleGit(repoDir);
        branch = (await git.branchLocal()).current;
        commit = await git.revparse(['HEAD']);
      } catch (e) {}

      const ctx = {
        assets,
        outputDir,
        sourceDir: repoDir,
        repoInfo: {
          branch,
          commit,
          url: config.source.repository
        },
        stats: { assetsCopied: 0 }
      };

      const { CatalogGenerator } = await import('../generators/catalog.generator');
      const { CategoriesGenerator } = await import('../generators/categories.generator');
      const { SearchGenerator } = await import('../generators/search.generator');
      const { ManifestGenerator } = await import('../generators/manifest.generator');
      const { ContentGenerator } = await import('../generators/content.generator');
      const { AssetsGenerator } = await import('../generators/assets.generator');

      const generators = [
        new CatalogGenerator(),
        new CategoriesGenerator(),
        new SearchGenerator(),
        new ManifestGenerator(),
        new ContentGenerator(),
        new AssetsGenerator()
      ];

      const startGenTime = Date.now();
      for (const gen of generators) {
        await gen.generate(ctx);
      }
      const buildDuration = ((Date.now() - startGenTime) / 1000).toFixed(1);

      console.log(chalk.green(`✓ Generated catalog.json`));
      console.log(chalk.green(`✓ Generated categories.json`));
      console.log(chalk.green(`✓ Generated search.json`));
      console.log(chalk.green(`✓ Generated manifest.json`));
      console.log(chalk.green(`✓ Copied ${ctx.stats.assetsCopied} assets\n`));

      // Summary
      const counts: Record<string, number> = {};
      assets.forEach(a => {
        counts[a.type] = (counts[a.type] || 0) + 1;
      });

      const uniqueCategories = new Set(assets.map(a => a.category)).size;

      console.log(chalk.bold('Build Summary'));
      console.log(chalk.cyan(`Repository scanned`));
      console.log(`${chalk.yellow(assets.length)} assets`);
      console.log(`${chalk.yellow(uniqueCategories)} categories\n`);
      
      Object.entries(counts).forEach(([type, count]) => {
        console.log(`  ${type}: ${chalk.yellow(count)}`);
      });

      console.log(chalk.gray(`\nCompleted in ${buildDuration}s\n`));
      
    } catch (error) {
      console.error(chalk.red('\nBuild failed:'), error);
      process.exit(1);
    } finally {
      await reader.cleanup();
    }
  });
