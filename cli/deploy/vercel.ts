import { DeployAdapter } from './base';
import { execSync } from 'child_process';
import chalk from 'chalk';

export class VercelAdapter implements DeployAdapter {
  name = 'vercel';

  async deploy(): Promise<void> {
    console.log(chalk.blue('Deploying to Vercel...'));
    try {
      // Typically, deploying to vercel from CLI requires the vercel CLI
      // `npx vercel --prod --yes`
      execSync('npx vercel --prod --yes', { stdio: 'inherit', cwd: process.cwd() });
      console.log(chalk.green('✓ Successfully deployed to Vercel'));
    } catch (e: any) {
      console.error(chalk.red('Failed to deploy to Vercel. Make sure VERCEL_TOKEN is set or you are logged in.'));
      throw e;
    }
  }
}
