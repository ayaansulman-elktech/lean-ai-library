import { Command } from 'commander';
import chalk from 'chalk';
import { execSync } from 'child_process';

export const serveCommand = new Command('serve')
  .description('Serve the generated site locally')
  .action(() => {
    console.log(chalk.blue('Starting local dev server...'));
    try {
      execSync('npm run dev', { stdio: 'inherit', cwd: process.cwd() });
    } catch (e: any) {
      console.error(chalk.red('Failed to start dev server'), e.message);
    }
  });
