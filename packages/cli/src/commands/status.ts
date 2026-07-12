import { Command } from 'commander';
import chalk from 'chalk';
import { getApiClient, UserInfo, Rental } from '../lib/api';
import { isAuthenticated, loadConfig } from '../lib/config';
import {
  createSpinner,
  header,
  error,
  success,
  info,
  createTable,
  formatPrice,
  formatDuration,
  statusColor,
  bold,
} from '../lib/output';

export const statusCommand = new Command('status')
  .description('Show current account status and active rentals')
  .action(async () => {
    if (!isAuthenticated()) {
      error('Not logged in. Run ' + chalk.cyan('opengpu login') + ' first.');
      process.exit(1);
    }

    const api = getApiClient();

    const userSpinner = createSpinner('Fetching account info...');
    userSpinner.start();

    const userResult = await api.getUserInfo();
    userSpinner.stop();

    if (!userResult.success) {
      error(userResult.error || 'Failed to fetch account info');
      process.exit(1);
    }

    const user = userResult.data as UserInfo;

    header('Account Status');

    const accountTable = createTable();
    accountTable.push(
      ['Email', chalk.cyan(user.email)],
      ['User ID', chalk.dim(user.id)],
      ['Balance', formatPrice(user.balance)],
      ['Credits', chalk.yellow(user.credits.toString())],
      ['Member Since', chalk.dim(new Date(user.createdAt).toLocaleDateString())]
    );
    console.log(accountTable.toString());

    const rentalSpinner = createSpinner('Fetching active rentals...');
    rentalSpinner.start();

    const rentalResult = await api.listRentals();
    rentalSpinner.stop();

    if (!rentalResult.success) {
      error(rentalResult.error || 'Failed to fetch rentals');
      return;
    }

    const rentals = (rentalResult.data || []) as Rental[];
    const activeRentals = rentals.filter((r) => r.status === 'active');

    if (activeRentals.length === 0) {
      info('No active GPU rentals.');
      info('Run ' + chalk.cyan('opengpu list-gpus') + ' to see available GPUs.');
      return;
    }

    header(`Active Rentals (${activeRentals.length})`);

    const rentalTable = createTable({
      head: ['ID', 'GPU', 'Status', 'Duration', 'Cost', 'Connected'],
    });

    for (const rental of activeRentals) {
      rentalTable.push([
        chalk.dim(rental.id.slice(0, 8)),
        bold(rental.gpuModel),
        statusColor(rental.status),
        rental.duration,
        formatPrice(rental.cost),
        rental.connectionInfo
          ? chalk.green(`${rental.connectionInfo.host}:${rental.connectionInfo.port}`)
          : chalk.dim('N/A'),
      ]);
    }

    console.log(rentalTable.toString());

    if (activeRentals.length > 0) {
      const totalCost = activeRentals.reduce((sum, r) => sum + r.cost, 0);
      info(
        `Total hourly cost: ${formatPrice(totalCost)} | Run ${chalk.cyan('opengpu metrics')} for details`
      );
    }
  });
