import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { getApiClient, GpuInfo } from '../lib/api';
import { isAuthenticated } from '../lib/config';
import {
  createSpinner,
  header,
  error,
  success,
  info,
  createTable,
  formatPrice,
  formatMemory,
  confirmAction,
  bold,
} from '../lib/output';

const DURATION_OPTIONS = [
  { name: '1 Hour', value: '1h' },
  { name: '6 Hours', value: '6h' },
  { name: '12 Hours', value: '12h' },
  { name: '1 Day', value: '1d' },
  { name: '3 Days', value: '3d' },
  { name: '7 Days', value: '7d' },
  { name: '30 Days', value: '30d' },
];

export const rentCommand = new Command('rent')
  .description('Rent a GPU from the marketplace')
  .option('-g, --gpu <gpuId>', 'GPU ID to rent directly')
  .option('-d, --duration <duration>', 'Rental duration (e.g., 1h, 1d, 7d)')
  .option('--yes', 'Skip confirmation prompt')
  .action(async (options) => {
    if (!isAuthenticated()) {
      error('Not logged in. Run ' + chalk.cyan('opengpu login') + ' first.');
      process.exit(1);
    }

    const api = getApiClient();

    let selectedGpu: GpuInfo | null = null;
    let selectedDuration = options.duration;

    if (options.gpu) {
      const spinner = createSpinner('Fetching GPU info...');
      spinner.start();
      const result = await api.getGpu(options.gpu);
      spinner.stop();

      if (!result.success || !result.data) {
        error(result.error || 'GPU not found');
        process.exit(1);
      }
      selectedGpu = result.data as GpuInfo;
    } else {
      const spinner = createSpinner('Fetching available GPUs...');
      spinner.start();
      const result = await api.listGpus({ available: true });
      spinner.stop();

      if (!result.success) {
        error(result.error || 'Failed to fetch GPUs');
        process.exit(1);
      }

      const gpus = (result.data || []) as GpuInfo[];

      if (gpus.length === 0) {
        error('No GPUs available for rent.');
        process.exit(1);
      }

      const gpuChoices = gpus.map((gpu) => ({
        name: `${gpu.brand} ${gpu.model} - ${formatMemory(gpu.memory)} - ${formatPrice(gpu.pricePerHour)}/hr (${gpu.region})`,
        value: gpu.id,
        short: `${gpu.brand} ${gpu.model}`,
      }));

      const gpuAnswer = await inquirer.prompt([
        {
          type: 'list',
          name: 'gpuId',
          message: 'Select a GPU to rent:',
          choices: gpuChoices,
          pageSize: 15,
        },
      ]);

      selectedGpu = gpus.find((g) => g.id === gpuAnswer.gpuId) || null;
    }

    if (!selectedGpu) {
      error('No GPU selected.');
      process.exit(1);
    }

    if (!selectedDuration) {
      const durationAnswer = await inquirer.prompt([
        {
          type: 'list',
          name: 'duration',
          message: 'Select rental duration:',
          choices: DURATION_OPTIONS,
        },
      ]);
      selectedDuration = durationAnswer.duration;
    }

    const durationOption = DURATION_OPTIONS.find((d) => d.value === selectedDuration);
    const durationLabel = durationOption?.name || selectedDuration;

    header('Rental Summary');

    const summaryTable = createTable();
    summaryTable.push(
      ['GPU', bold(`${selectedGpu.brand} ${selectedGpu.model}`)],
      ['Memory', formatMemory(selectedGpu.memory)],
      ['Region', selectedGpu.region],
      ['Duration', durationLabel],
      ['Price/Hour', formatPrice(selectedGpu.pricePerHour)],
      ['Estimated Total', formatPrice(selectedGpu.pricePerHour * getDurationHours(selectedDuration))]
    );
    console.log(summaryTable.toString());

    if (!options.yes) {
      const confirmed = await confirmAction('Proceed with rental?');
      if (!confirmed) {
        info('Rental cancelled.');
        return;
      }
    }

    const spinner = createSpinner('Creating rental...');
    spinner.start();

    const result = await api.rentGpu(selectedGpu.id, selectedDuration);
    spinner.stop();

    if (result.success && result.data) {
      const rental = result.data as { id: string; connectionInfo: { host: string; port: number; sshKey: string } };

      header('Rental Created Successfully');
      success(`Rental ID: ${chalk.cyan(rental.id)}`);

      if (rental.connectionInfo) {
        info('Connection details:');
        console.log(`  ${bold('Host:')} ${chalk.cyan(rental.connectionInfo.host)}`);
        console.log(`  ${bold('Port:')} ${chalk.cyan(String(rental.connectionInfo.port))}`);
        console.log(`  ${bold('SSH Key:')} ${chalk.dim(rental.connectionInfo.sshKey)}`);
        console.log('');
        info(
          `Connect with: ${chalk.cyan(`ssh -i ${rental.connectionInfo.sshKey} root@${rental.connectionInfo.host} -p ${rental.connectionInfo.port}`)}`
        );
      }

      info('Run ' + chalk.cyan('opengpu status') + ' to monitor your rental.');
    } else {
      error(result.error || 'Failed to create rental');
      process.exit(1);
    }
  });

function getDurationHours(duration: string): number {
  const num = parseInt(duration);
  if (duration.endsWith('h')) return num;
  if (duration.endsWith('d')) return num * 24;
  return 1;
}
