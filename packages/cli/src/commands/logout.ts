import { Command } from 'commander';
import chalk from 'chalk';
import { clearCredentials, loadConfig, saveConfig } from '../lib/config';
import { success, info, confirmAction } from '../lib/output';

export const logoutCommand = new Command('logout')
  .description('Clear stored credentials and log out')
  .option('-f, --force', 'Skip confirmation prompt')
  .action(async (options) => {
    const config = loadConfig();

    if (!config.token) {
      info('Not currently logged in.');
      return;
    }

    if (!options.force) {
      const confirmed = await confirmAction(
        `Log out from ${chalk.cyan(config.email || 'unknown')}?`
      );
      if (!confirmed) {
        info('Logout cancelled.');
        return;
      }
    }

    clearCredentials();
    success('Logged out successfully.');
    info('Credentials have been removed from ' + chalk.dim('~/.opengpu/config.json'));
  });
