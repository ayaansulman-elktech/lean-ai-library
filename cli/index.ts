#!/usr/bin/env node

import { Command } from 'commander';
import { buildCommand } from './commands/build';
import { publishCommand } from './commands/publish';
import { validateCommand } from './commands/validate';

const program = new Command();

program
  .name('lean-library')
  .description('Generator CLI for the Lean AI Library platform')
  .version('1.0.0');

program.addCommand(buildCommand);
program.addCommand(publishCommand);
program.addCommand(validateCommand);

program.parse();
