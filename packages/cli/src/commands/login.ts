import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { getApiClient } from '../lib/api';
import { updateConfig, loadConfig, saveConfig } from '../lib/config';
import { success, error, createSpinner, header, info } from '../lib/output';

export const loginCommand = new Command('login')
  .description('Authenticate with your OpenGPU account')
  .option('-t, --token <token>', 'Login with an API token directly')
  .option('--api-url <url>', 'Custom API URL')
  .action(async (options) => {
    try {
      if (options.apiUrl) {
        const config = loadConfig();
        config.apiUrl = options.apiUrl;
        saveConfig(config);
        info(`API URL set to ${chalk.cyan(options.apiUrl)}`);
      }

      if (options.token) {
        const spinner = createSpinner('Verifying token...');
        spinner.start();

        const api = getApiClient();
        const result = await api.loginWithToken(options.token);

        spinner.stop();

        if (result.success && result.data) {
          updateConfig({
            token: options.token,
            userId: result.data.id,
            email: result.data.email,
          });
          success(`Logged in as ${chalk.bold(result.data.email)}`);
          info(`Balance: ${chalk.green(`$${result.data.balance.toFixed(2)}`)}`);
        } else {
          error(result.error || 'Invalid token');
          process.exit(1);
        }
        return;
      }

      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'email',
          message: 'Email:',
          validate: (input: string) => {
            if (!input) return 'Email is required';
            if (!input.includes('@')) return 'Invalid email format';
            return true;
          },
        },
        {
          type: 'password',
          name: 'password',
          message: 'Password:',
          mask: '*',
          validate: (input: string) => {
            if (!input) return 'Password is required';
            return true;
          },
        },
      ]);

      const spinner = createSpinner('Authenticating...');
      spinner.start();

      const api = getApiClient();
      const result = await api.login(answers.email, answers.password);

      spinner.stop();

      if (result.success && result.data) {
        updateConfig({
          token: result.data.token,
          userId: result.data.user.id,
          email: result.data.user.email,
        });

        header('Login Successful');
        success(`Welcome back, ${chalk.bold(result.data.user.name || result.data.user.email)}!`);
        info(`User ID: ${chalk.cyan(result.data.user.id)}`);
        info(`Balance: ${chalk.green(`$${result.data.user.balance.toFixed(2)}`)}`);
        info(`Credits: ${chalk.green(result.data.user.credits.toString())}`);
      } else {
        error(result.error || 'Login failed');
        process.exit(1);
      }
    } catch (err) {
      error(err instanceof Error ? err.message : 'Login failed');
      process.exit(1);
    }
  });
