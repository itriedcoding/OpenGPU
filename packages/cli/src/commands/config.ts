import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { loadConfig, saveConfig, setApiUrl, getConfigPath } from '../lib/config';
import { header, success, info, createTable, dim, bold } from '../lib/output';

export const configCommand = new Command('config')
  .description('Manage CLI configuration')
  .addCommand(
    new Command('list')
      .description('Show current configuration')
      .action(() => {
        const config = loadConfig();

        header('Current Configuration');

        const table = createTable();
        table.push(
          ['Config Path', dim(getConfigPath())],
          ['API URL', config.apiUrl],
          ['Token', config.token ? dim(config.token.slice(0, 8) + '...') : dim('(not set)')],
          ['User ID', config.userId || dim('(not set)')],
          ['Email', config.email || dim('(not set)')],
          ['Default Region', config.defaults.region],
          ['Default Duration', config.defaults.duration],
          ['Auto Renew', config.defaults.autoRenew ? 'Yes' : 'No']
        );
        console.log(table.toString());
      })
  )
  .addCommand(
    new Command('set')
      .description('Set a configuration value')
      .argument('<key>', 'Configuration key (e.g., apiUrl, defaults.region)')
      .argument('<value>', 'Value to set')
      .action((key, value) => {
        const config = loadConfig();

        if (key === 'apiUrl') {
          setApiUrl(value);
          success(`API URL set to ${chalk.cyan(value)}`);
          return;
        }

        const keys = key.split('.');
        let target: Record<string, unknown> = config as Record<string, unknown>;

        for (let i = 0; i < keys.length - 1; i++) {
          if (!target[keys[i]] || typeof target[keys[i]] !== 'object') {
            target[keys[i]] = {};
          }
          target = target[keys[i]] as Record<string, unknown>;
        }

        const lastKey = keys[keys.length - 1];
        const oldValue = target[lastKey];

        if (typeof oldValue === 'boolean') {
          target[lastKey] = value === 'true' || value === '1';
        } else if (typeof oldValue === 'number') {
          target[lastKey] = parseFloat(value);
          if (isNaN(target[lastKey] as number)) {
            target[lastKey] = value;
          }
        } else {
          target[lastKey] = value;
        }

        saveConfig(config);
        success(`${chalk.cyan(key)} set to ${chalk.green(String(target[lastKey]))}`);
        if (oldValue !== undefined && oldValue !== target[lastKey]) {
          info(`Previous value: ${dim(String(oldValue))}`);
        }
      })
  )
  .addCommand(
    new Command('get')
      .description('Get a configuration value')
      .argument('<key>', 'Configuration key')
      .action((key) => {
        const config = loadConfig();
        const keys = key.split('.');
        let value: unknown = config;

        for (const k of keys) {
          if (value && typeof value === 'object') {
            value = (value as Record<string, unknown>)[k];
          } else {
            value = undefined;
            break;
          }
        }

        if (value === undefined) {
          info(`${dim(key)}: ${dim('(not set)')}`);
        } else {
          console.log(`${key}: ${String(value)}`);
        }
      })
  )
  .addCommand(
    new Command('reset')
      .description('Reset configuration to defaults')
      .action(async () => {
        const inquirer = require('inquirer');
        const answer = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirmed',
            message: 'Reset all configuration to defaults?',
            default: false,
          },
        ]);

        if (!answer.confirmed) {
          info('Reset cancelled.');
          return;
        }

        const defaultConfig = {
          apiUrl: 'https://api.opengpu.io/v1',
          token: null,
          userId: null,
          email: null,
          nodeId: null,
          defaults: {
            region: 'us-east-1',
            duration: '1h',
            autoRenew: false,
          },
        };

        saveConfig(defaultConfig);
        success('Configuration reset to defaults.');
        info('You will need to run ' + chalk.cyan('opengpu login') + ' again.');
      })
  )
  .addCommand(
    new Command('path')
      .description('Show config file path')
      .action(() => {
        console.log(getConfigPath());
      })
  );
