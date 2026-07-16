#!/usr/bin/env node

import { Command } from 'commander';
import { generateCommand } from './commands/generate';
import { staticPublishCommand } from './commands/publish-static';
import { catalogValidateCommand, catalogTestCommand, catalogDoctorCommand } from './commands/quality';
import { serveCommand } from './commands/serve';
import { feedCommand } from './commands/feed';
import { articleCommand } from './commands/article';

import { runInteractiveCli } from './interactive';
import { thumbnailsCommand } from './commands/thumbnails';
const program = new Command();

program
  .name('lean-library')
  .description('Generator CLI for the Lean AI Library platform')
  .version('1.0.0');

program.addCommand(generateCommand);
program.addCommand(staticPublishCommand);
program.addCommand(catalogValidateCommand);
program.addCommand(catalogTestCommand);
program.addCommand(catalogDoctorCommand);
program.addCommand(serveCommand);
program.addCommand(feedCommand);
program.addCommand(articleCommand);

program.addCommand(thumbnailsCommand);
async function main() {
  if (process.argv.length <= 2) await runInteractiveCli();
  else program.parse();
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
