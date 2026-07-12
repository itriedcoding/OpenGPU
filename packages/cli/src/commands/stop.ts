import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { getApiClient, Rental } from '../lib/api';
import { isAuthenticated } from '../lib/config';
import {
  createSpinner,
  header,
  error,
  success,
  info,
  createTable,
  formatPrice,
  confirmAction,
  bold,
  dim,
} from '../lib/output';

export const stopCommand = new Command('stop')
  .description('Stop an active GPU rental')
  .option('-r, --rental <rentalId>', 'Rental ID to stop (or partial ID)')
  .option('-a, --all', 'Stop all active rentals')
  .option('-f, --force', 'Skip confirmation prompt')
  .action(async (options) => {
    if (!isAuthenticated()) {
      error('Not logged in. Run ' + chalk.cyan('opengpu login') + ' first.');
      process.exit(1);
    }

    const api = getApiClient();

    if (options.all) {
      const spinner = createSpinner('Fetching active rentals...');
      spinner.start();
      const result = await api.listRentals();
      spinner.stop();

      if (!result.success) {
        error(result.error || 'Failed to fetch rentals');
        process.exit(1);
      }

      const rentals = (result.data || []) as Rental[];
      const activeRentals = rentals.filter((r) => r.status === 'active');

      if (activeRentals.length === 0) {
        info('No active rentals to stop.');
        return;
      }

      header(`Active Rentals (${activeRentals.length})`);

      const table = createTable({
        head: ['ID', 'GPU', 'Duration', 'Cost'],
      });

      for (const rental of activeRentals) {
        table.push([
          dim(rental.id.slice(0, 8)),
          bold(rental.gpuModel),
          rental.duration,
          formatPrice(rental.cost),
        ]);
      }
      console.log(table.toString());

      if (!options.force) {
        const confirmed = await confirmAction(
          `Stop all ${activeRentals.length} active rental(s)?`
        );
        if (!confirmed) {
          info('Operation cancelled.');
          return;
        }
      }

      const stopSpinner = createSpinner('Stopping rentals...');
      stopSpinner.start();

      let stopped = 0;
      let failed = 0;

      for (const rental of activeRentals) {
        const stopResult = await api.stopRental(rental.id);
        if (stopResult.success) {
          stopped++;
        } else {
          failed++;
          error(`Failed to stop rental ${rental.id.slice(0, 8)}: ${stopResult.error}`);
        }
      }

      stopSpinner.stop();
      success(`Stopped ${stopped} rental(s)${failed > 0 ? ` (${failed} failed)` : ''}`);
      return;
    }

    if (options.rental) {
      const spinner = createSpinner('Stopping rental...');
      spinner.start();

      const result = await api.stopRental(options.rental);
      spinner.stop();

      if (result.success) {
        success(`Rental ${chalk.cyan(options.rental)} stopped successfully.`);
      } else {
        error(result.error || 'Failed to stop rental');
        process.exit(1);
      }
      return;
    }

    const spinner = createSpinner('Fetching active rentals...');
    spinner.start();
    const result = await api.listRentals();
    spinner.stop();

    if (!result.success) {
      error(result.error || 'Failed to fetch rentals');
      process.exit(1);
    }

    const rentals = (result.data || []) as Rental[];
    const activeRentals = rentals.filter((r) => r.status === 'active');

    if (activeRentals.length === 0) {
      info('No active rentals to stop.');
      return;
    }

    const choices = activeRentals.map((rental) => ({
      name: `${rental.id.slice(0, 8)} - ${rental.gpuModel} (${formatPrice(rental.cost)}/hr)`,
      value: rental.id,
      short: rental.id.slice(0, 8),
    }));

    choices.push({
      name: chalk.red('Cancel'),
      value: '',
      short: 'Cancel',
    });

    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'rentalId',
        message: 'Select rental to stop:',
        choices,
      },
    ]);

    if (!answer.rentalId) {
      info('Operation cancelled.');
      return;
    }

    if (!options.force) {
      const confirmed = await confirmAction('Stop this rental?');
      if (!confirmed) {
        info('Operation cancelled.');
        return;
      }
    }

    const stopSpinner = createSpinner('Stopping rental...');
    stopSpinner.start();

    const stopResult = await api.stopRental(answer.rentalId);
    stopSpinner.stop();

    if (stopResult.success) {
      success(`Rental ${chalk.cyan(answer.rentalId.slice(0, 8))} stopped successfully.`);
    } else {
      error(stopResult.error || 'Failed to stop rental');
      process.exit(1);
    }
  });
