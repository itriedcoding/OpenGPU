import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { getApiClient, MetricsData, Rental } from '../lib/api';
import { isAuthenticated } from '../lib/config';
import {
  createSpinner,
  header,
  error,
  info,
  createTable,
  formatPrice,
  bold,
  dim,
} from '../lib/output';

export const metricsCommand = new Command('metrics')
  .description('Show GPU metrics for active rentals')
  .option('-r, --rental <rentalId>', 'Rental ID to show metrics for')
  .option('-p, --period <period>', 'Time period (1h, 6h, 24h, 7d)', '1h')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    if (!isAuthenticated()) {
      error('Not logged in. Run ' + chalk.cyan('opengpu login') + ' first.');
      process.exit(1);
    }

    const api = getApiClient();
    let rentalId = options.rental;

    if (!rentalId) {
      const spinner = createSpinner('Fetching active rentals...');
      spinner.start();

      const rentalResult = await api.listRentals();
      spinner.stop();

      if (!rentalResult.success) {
        error(rentalResult.error || 'Failed to fetch rentals');
        process.exit(1);
      }

      const rentals = (rentalResult.data || []) as Rental[];
      const activeRentals = rentals.filter((r) => r.status === 'active');

      if (activeRentals.length === 0) {
        info('No active rentals to show metrics for.');
        info('Run ' + chalk.cyan('opengpu rent') + ' to rent a GPU.');
        return;
      }

      if (activeRentals.length === 1) {
        rentalId = activeRentals[0].id;
      } else {
        const choices = activeRentals.map((rental) => ({
          name: `${rental.id.slice(0, 8)} - ${rental.gpuModel} (${formatPrice(rental.cost)}/hr)`,
          value: rental.id,
          short: rental.id.slice(0, 8),
        }));

        const answer = await inquirer.prompt([
          {
            type: 'list',
            name: 'rentalId',
            message: 'Select rental to view metrics:',
            choices,
          },
        ]);
        rentalId = answer.rentalId;
      }
    }

    const spinner = createSpinner('Fetching metrics...');
    spinner.start();

    const result = await api.getMetrics(rentalId, options.period);
    spinner.stop();

    if (!result.success) {
      error(result.error || 'Failed to fetch metrics');
      process.exit(1);
    }

    const metrics = (result.data || []) as MetricsData[];

    if (options.json) {
      console.log(JSON.stringify(metrics, null, 2));
      return;
    }

    if (metrics.length === 0) {
      info('No metrics data available for this rental.');
      return;
    }

    header(`GPU Metrics (Period: ${options.period})`);

    const latest = metrics[metrics.length - 1];

    const overviewTable = createTable();
    overviewTable.push(
      ['GPU Utilization', `${bold(String(latest.gpuUtilization))}%`],
      ['Memory Utilization', `${bold(String(latest.memoryUtilization))}%`],
      ['Temperature', `${bold(String(latest.temperature))}°C`],
      ['Power Draw', `${bold(String(latest.powerDraw))}W`],
      ['Fan Speed', `${bold(String(latest.fanSpeed))}%`],
      ['Network In', `${bold(String(latest.networkIn))} MB/s`],
      ['Network Out', `${bold(String(latest.networkOut))} MB/s`]
    );
    console.log(overviewTable.toString());

    if (metrics.length > 1) {
      header('History');

      const historyTable = createTable({
        head: ['Time', 'GPU %', 'Mem %', 'Temp °C', 'Power W'],
      });

      const displayMetrics = metrics.slice(-10);
      for (const m of displayMetrics) {
        const time = new Date(m.timestamp).toLocaleTimeString();
        historyTable.push([
          dim(time),
          `${m.gpuUtilization}%`,
          `${m.memoryUtilization}%`,
          `${m.temperature}°C`,
          `${m.powerDraw}W`,
        ]);
      }
      console.log(historyTable.toString());
    }

    const avgGpu = metrics.reduce((sum, m) => sum + m.gpuUtilization, 0) / metrics.length;
    const avgMem = metrics.reduce((sum, m) => sum + m.memoryUtilization, 0) / metrics.length;
    const avgTemp = metrics.reduce((sum, m) => sum + m.temperature, 0) / metrics.length;
    const avgPower = metrics.reduce((sum, m) => sum + m.powerDraw, 0) / metrics.length;

    info(
      `Averages: GPU ${bold(`${avgGpu.toFixed(1)}%`)} | Mem ${bold(`${avgMem.toFixed(1)}%`)} | Temp ${bold(`${avgTemp.toFixed(1)}°C`)} | Power ${bold(`${avgPower.toFixed(0)}W`)}`
    );
  });
