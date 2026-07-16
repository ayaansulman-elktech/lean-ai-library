import { Command } from 'commander';
import chalk from 'chalk';
import { applyFeeds, inspectFeeds } from '../core/feed-import';

export const feedCommand = new Command('feed').description('Import versioned library feed files');

feedCommand.command('import')
  .argument('<path>', 'An exported JSON file or a directory containing JSON feeds')
  .option('--dry-run', 'Validate and report changes without writing')
  .description('Add or update articles without deleting other articles or local overrides')
  .action(async (input: string, options: { dryRun?: boolean }) => {
    const summary = inspectFeeds(input);
    if (!options.dryRun) await applyFeeds(summary);
    console.log(chalk.green(`${options.dryRun ? 'Dry run: ' : ''}${summary.files.length} JSON feeds; ${summary.added} added, ${summary.updated} updated, ${summary.unchanged} unchanged; 0 deleted.`));
  });
