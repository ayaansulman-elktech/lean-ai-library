import { execSync } from 'child_process';
import { Command } from 'commander';
import chalk from 'chalk';
import { loadConfig } from '../core/config';
import { VercelAdapter } from '../deploy/vercel';
import { FrontendGenerator } from '../generators/frontend.generator';
import { validateCatalog } from './quality';

export const staticPublishCommand = new Command('publish')
  .description('Generate, validate, test, and deploy the static library')
  .option('--provider <name>', 'Deployment provider', 'vercel')
  .action(async (options: { provider?: string }) => {
    const config = loadConfig();
    const provider = options.provider || config.deployment.provider;
    await new FrontendGenerator().generate({} as never);
    console.log(chalk.green('Generated frontend data.'));
    console.log(chalk.green(`Validated ${validateCatalog(process.cwd())} article records.`));
    execSync('npm test -- --run', { cwd: process.cwd(), stdio: 'inherit' });
    if (provider.toLowerCase() !== 'vercel') throw new Error(`Unsupported deployment provider: ${provider}`);
    await new VercelAdapter().deploy();
  });
