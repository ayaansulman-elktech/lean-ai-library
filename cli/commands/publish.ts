import { Command } from 'commander';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { loadConfig } from '../core/config';
import { VercelAdapter } from '../deploy/vercel';

export const publishCommand = new Command('publish')
  .description('Build, validate, generate, and deploy the assets')
  .option('--provider <name>', 'Deployment provider (e.g., vercel, netlify)')
  .action(async (options) => {
    console.log(chalk.magenta.bold('\n🚀 Publishing Lean AI Library...\n'));

    let config;
    try {
      config = loadConfig();
    } catch (e: any) {
      console.error(chalk.red(`Configuration Error: ${e.message}`));
      process.exit(1);
    }

    const providerName = options.provider || config.deployment.provider || 'vercel';

    try {
      // Step 1: Build the catalog
      console.log(chalk.cyan('➤ Step 1: Generating Catalog...'));
      execSync('npm run cli build', { stdio: 'inherit', cwd: process.cwd() });
      console.log(chalk.green('✓ Catalog generated successfully\n'));

      // Step 2: Validate
      console.log(chalk.cyan('➤ Step 2: Validating...'));
      execSync('npm run cli validate', { stdio: 'inherit', cwd: process.cwd() });
      console.log(chalk.green('✓ Validation passed\n'));

      // Step 3: Test
      console.log(chalk.cyan('➤ Step 3: Running Tests...'));
      execSync('npm run cli test', { stdio: 'inherit', cwd: process.cwd() });
      console.log(chalk.green('✓ Tests passed\n'));

      // Step 4: Next Build
      console.log(chalk.cyan('➤ Step 4: Building Frontend (Next.js)...'));
      execSync('npm run build', { stdio: 'inherit', cwd: process.cwd() });
      console.log(chalk.green('✓ Frontend built successfully\n'));

      // Step 5: Deploy
      console.log(chalk.cyan(`➤ Step 5: Deploying to ${providerName}...`));
      if (providerName.toLowerCase() === 'vercel') {
        const vercel = new VercelAdapter();
        await vercel.deploy();
      } else {
        console.warn(chalk.yellow(`Warning: Provider '${providerName}' is not yet supported. Skipping deployment.`));
      }

      console.log(chalk.green.bold('\n🎉 Publish pipeline completed successfully!'));
      
    } catch (error: any) {
      console.error(chalk.red.bold('\n❌ Publish pipeline failed.'));
      if (error.message) {
        console.error(chalk.red(error.message));
      }
      process.exit(1);
    }
  });
