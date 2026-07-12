import { Command } from 'commander';
import chalk from 'chalk';
import { getApiClient, GpuInfo } from '../lib/api';
import { isAuthenticated } from '../lib/config';
import {
  createSpinner,
  header,
  error,
  info,
  createTable,
  formatPrice,
  formatMemory,
  statusColor,
  bold,
  dim,
} from '../lib/output';

export const listGpusCommand = new Command('list-gpus')
  .description('List available GPUs for rent')
  .option('-m, --model <model>', 'Filter by GPU model (e.g., RTX 4090, A100)')
  .option('--min-memory <gb>', 'Minimum GPU memory in GB', parseInt)
  .option('--max-price <price>', 'Maximum price per hour', parseFloat)
  .option('-r, --region <region>', 'Filter by region')
  .option('-a, --available-only', 'Show only available GPUs')
  .option('--all', 'Show all GPUs including rented/offline')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    if (!isAuthenticated()) {
      error('Not logged in. Run ' + chalk.cyan('opengpu login') + ' first.');
      process.exit(1);
    }

    const api = getApiClient();

    const spinner = createSpinner('Fetching available GPUs...');
    spinner.start();

    const result = await api.listGpus({
      model: options.model,
      minMemory: options.minMemory,
      maxPrice: options.maxPrice,
      region: options.region,
      available: options.availableOnly ? true : undefined,
    });

    spinner.stop();

    if (!result.success) {
      error(result.error || 'Failed to fetch GPUs');
      process.exit(1);
    }

    let gpus = (result.data || []) as GpuInfo[];

    if (!options.all && !options.availableOnly) {
      gpus = gpus.filter((g) => g.availability === 'available');
    }

    if (gpus.length === 0) {
      info('No GPUs found matching your criteria.');
      info('Try adjusting your filters or run ' + chalk.cyan('opengpu list-gpus --all'));
      return;
    }

    if (options.json) {
      console.log(JSON.stringify(gpus, null, 2));
      return;
    }

    header(`Available GPUs (${gpus.length})`);

    const table = createTable({
      head: ['ID', 'Model', 'Memory', 'Price/hr', 'Price/day', 'Region', 'Status'],
    });

    for (const gpu of gpus) {
      table.push([
        chalk.dim(gpu.id.slice(0, 8)),
        bold(`${gpu.brand} ${gpu.model}`),
        formatMemory(gpu.memory),
        formatPrice(gpu.pricePerHour),
        formatPrice(gpu.pricePerDay),
        gpu.region,
        statusColor(gpu.availability),
      ]);
    }

    console.log(table.toString());

    if (gpus.length > 0) {
      const cheapest = gpus
        .filter((g) => g.availability === 'available')
        .sort((a, b) => a.pricePerHour - b.pricePerHour)[0];

      if (cheapest) {
        info(
          `Cheapest available: ${bold(`${cheapest.brand} ${cheapest.model}`)} at ${formatPrice(cheapest.pricePerHour)}/hr`
        );
      }

      info('Run ' + chalk.cyan('opengpu rent') + ' to rent a GPU.');
    }
  });
