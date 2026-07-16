import { Command } from 'commander';
import chalk from 'chalk';
import { FrontendGenerator } from '../generators/frontend.generator';

export const generateCommand = new Command('build')
  .description('Generate static frontend JSON from local article records')
  .action(async () => {
    await new FrontendGenerator().generate({} as never);
    console.log(chalk.green('Generated data/articles.json, data/categories.json, and article detail files.'));
  });
