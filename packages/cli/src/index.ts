#!/usr/bin/env node

import { Command } from 'commander';
import { loginCommand } from './commands/login';
import { logoutCommand } from './commands/logout';
import { statusCommand } from './commands/status';
import { listGpusCommand } from './commands/list-gpus';
import { rentCommand } from './commands/rent';
import { stopCommand } from './commands/stop';
import { nodesCommand } from './commands/nodes';
import { metricsCommand } from './commands/metrics';
import { configCommand } from './commands/config';

const program = new Command();

program
  .name('opengpu')
  .description('OpenGPU CLI - Open Source GPU Cloud Marketplace')
  .version('0.1.0');

program.addCommand(loginCommand);
program.addCommand(logoutCommand);
program.addCommand(statusCommand);
program.addCommand(listGpusCommand);
program.addCommand(rentCommand);
program.addCommand(stopCommand);
program.addCommand(nodesCommand);
program.addCommand(metricsCommand);
program.addCommand(configCommand);

program.parse(process.argv);
