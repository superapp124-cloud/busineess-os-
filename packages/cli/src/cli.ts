#!/usr/bin/env node
import { Command } from 'commander';

// Project Commands
import { newCommand } from './commands/project/new';
import { doctorCommand } from './commands/project/doctor';

// Development Commands
import { lintCommand } from './commands/development/lint';
import { testCommand } from './commands/development/test';
import { inspectCommand } from './commands/development/inspect';
import { validateCommand } from './commands/development/validate';
import { graphCommand } from './commands/development/graph';
import { certifyCommand } from './commands/development/certify';

// Documentation Commands
import { docsCommand } from './commands/documentation/docs';

// Publishing Commands (Placeholders)
import { buildCommand, packCommand, signCommand, publishCommand } from './commands/publishing/placeholders';

const program = new Command();

program
  .name('chatr')
  .description('The official CLI for CHATR Intent OS')
  .version('1.0.0');

// Global Options
program.option('--json', 'Output machine-readable JSON');

// Project Group
program.addCommand(newCommand);
program.addCommand(doctorCommand);

// Development Group
program.addCommand(lintCommand);
program.addCommand(testCommand);
program.addCommand(inspectCommand);
program.addCommand(validateCommand);
program.addCommand(graphCommand);
program.addCommand(certifyCommand);

// Documentation Group
program.addCommand(docsCommand);

// Publishing Group
program.addCommand(buildCommand);
program.addCommand(packCommand);
program.addCommand(signCommand);
program.addCommand(publishCommand);

program.parse(process.argv);
