import chalk from 'chalk';
import ora, { Ora } from 'ora';
import Table from 'cli-table3';

export function success(message: string): void {
  console.log(chalk.green('✔') + ' ' + message);
}

export function error(message: string): void {
  console.log(chalk.red('✖') + ' ' + message);
}

export function warning(message: string): void {
  console.log(chalk.yellow('⚠') + ' ' + message);
}

export function info(message: string): void {
  console.log(chalk.blue('ℹ') + ' ' + message);
}

export function dim(message: string): string {
  return chalk.dim(message);
}

export function bold(message: string): string {
  return chalk.bold(message);
}

export function header(message: string): void {
  console.log('');
  console.log(chalk.bold.cyan('━'.repeat(50)));
  console.log(chalk.bold.cyan(message));
  console.log(chalk.bold.cyan('━'.repeat(50)));
  console.log('');
}

export function createSpinner(text: string): Ora {
  return ora({
    text,
    spinner: 'dots',
    color: 'cyan',
  });
}

export function createTable(options?: { head?: string[]; style?: Record<string, unknown> }): Table {
  return new Table({
    head: options?.head?.map((h) => chalk.cyan.bold(h)),
    style: {
      head: [],
      border: [],
      'padding-left': 1,
      'padding-right': 1,
      ...options?.style,
    },
    chars: {
      top: '─',
      'top-mid': '┬',
      'top-left': '┌',
      'top-right': '┐',
      bottom: '─',
      'bottom-mid': '┴',
      'bottom-left': '└',
      'bottom-right': '┘',
      left: '│',
      'left-mid': '├',
      mid: '─',
      'mid-mid': '┼',
      right: '│',
      'right-mid': '┤',
    },
  });
}

export function formatPrice(price: number): string {
  return chalk.green(`$${price.toFixed(2)}`);
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

export function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  let size = bytes;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export function formatMemory(gb: number): string {
  return `${gb} GB`;
}

export function statusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'available':
    case 'online':
    case 'active':
    case 'sharing':
      return chalk.green(status);
    case 'rented':
    case 'offline':
    case 'stopped':
      return chalk.red(status);
    case 'expired':
    case 'pending':
      return chalk.yellow(status);
    default:
      return status;
  }
}

export function confirmAction(message: string): Promise<boolean> {
  const inquirer = require('inquirer');
  return inquirer
    .prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message,
        default: false,
      },
    ])
    .then((answers: { confirmed: boolean }) => answers.confirmed);
}

export function clearLine(): void {
  process.stdout.write('\r\x1b[K');
}

export function newline(): void {
  console.log('');
}
