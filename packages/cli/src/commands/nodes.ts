import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { getApiClient, NodeInfo } from '../lib/api';
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
  formatDuration,
  statusColor,
  bold,
  dim,
} from '../lib/output';

export const nodesCommand = new Command('nodes')
  .description('Manage your provider nodes')
  .addCommand(
    new Command('list')
      .description('List your nodes')
      .option('--json', 'Output as JSON')
      .action(async (options) => {
        if (!isAuthenticated()) {
          error('Not logged in. Run ' + chalk.cyan('opengpu login') + ' first.');
          process.exit(1);
        }

        const api = getApiClient();
        const spinner = createSpinner('Fetching nodes...');
        spinner.start();

        const result = await api.listNodes();
        spinner.stop();

        if (!result.success) {
          error(result.error || 'Failed to fetch nodes');
          process.exit(1);
        }

        const nodes = (result.data || []) as NodeInfo[];

        if (options.json) {
          console.log(JSON.stringify(nodes, null, 2));
          return;
        }

        if (nodes.length === 0) {
          info('No nodes registered.');
          info('Run ' + chalk.cyan('opengpu nodes register') + ' to add a node.');
          return;
        }

        header(`Your Nodes (${nodes.length})`);

        const table = createTable({
          head: ['ID', 'Name', 'Status', 'GPUs', 'Memory', 'Uptime', 'Earnings'],
        });

        for (const node of nodes) {
          table.push([
            dim(node.id.slice(0, 8)),
            bold(node.name),
            statusColor(node.status),
            `${node.gpuCount}x ${node.gpuModels.join(', ')}`,
            formatMemory(node.totalMemory),
            formatDuration(node.uptime),
            formatPrice(node.earnings),
          ]);
        }

        console.log(table.toString());

        const totalEarnings = nodes.reduce((sum, n) => sum + n.earnings, 0);
        const totalGpus = nodes.reduce((sum, n) => sum + n.gpuCount, 0);
        info(`Total: ${totalGpus} GPU(s) | Earnings: ${formatPrice(totalEarnings)}`);
      })
  )
  .addCommand(
    new Command('start')
      .description('Start sharing a node')
      .argument('[nodeId]', 'Node ID (or partial ID)')
      .action(async (nodeId) => {
        if (!isAuthenticated()) {
          error('Not logged in. Run ' + chalk.cyan('opengpu login') + ' first.');
          process.exit(1);
        }

        const api = getApiClient();

        if (!nodeId) {
          const spinner = createSpinner('Fetching nodes...');
          spinner.start();
          const result = await api.listNodes();
          spinner.stop();

          if (!result.success) {
            error(result.error || 'Failed to fetch nodes');
            process.exit(1);
          }

          const nodes = (result.data || []) as NodeInfo[];
          if (nodes.length === 0) {
            error('No nodes found.');
            process.exit(1);
          }

          const choices = nodes.map((node) => ({
            name: `${node.name} (${node.id.slice(0, 8)}) - ${statusColor(node.status)}`,
            value: node.id,
          }));

          const answer = await inquirer.prompt([
            {
              type: 'list',
              name: 'nodeId',
              message: 'Select node to start:',
              choices,
            },
          ]);
          nodeId = answer.nodeId;
        }

        const spinner = createSpinner('Starting node...');
        spinner.start();

        const result = await api.startSharing(nodeId);
        spinner.stop();

        if (result.success) {
          success(`Node ${chalk.cyan(nodeId)} is now sharing.`);
          info('Your GPUs are now available for rental.');
        } else {
          error(result.error || 'Failed to start node');
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('stop')
      .description('Stop sharing a node')
      .argument('[nodeId]', 'Node ID (or partial ID)')
      .option('-a, --all', 'Stop all nodes')
      .action(async (nodeId, options) => {
        if (!isAuthenticated()) {
          error('Not logged in. Run ' + chalk.cyan('opengpu login') + ' first.');
          process.exit(1);
        }

        const api = getApiClient();

        if (options.all) {
          const spinner = createSpinner('Fetching nodes...');
          spinner.start();
          const result = await api.listNodes();
          spinner.stop();

          if (!result.success) {
            error(result.error || 'Failed to fetch nodes');
            process.exit(1);
          }

          const nodes = (result.data || []) as NodeInfo[];
          const onlineNodes = nodes.filter((n) => n.status === 'sharing' || n.status === 'online');

          if (onlineNodes.length === 0) {
            info('No active nodes to stop.');
            return;
          }

          const stopSpinner = createSpinner('Stopping nodes...');
          stopSpinner.start();

          let stopped = 0;
          for (const node of onlineNodes) {
            const stopResult = await api.stopSharing(node.id);
            if (stopResult.success) stopped++;
          }

          stopSpinner.stop();
          success(`Stopped ${stopped} node(s).`);
          return;
        }

        if (!nodeId) {
          const spinner = createSpinner('Fetching nodes...');
          spinner.start();
          const result = await api.listNodes();
          spinner.stop();

          if (!result.success) {
            error(result.error || 'Failed to fetch nodes');
            process.exit(1);
          }

          const nodes = (result.data || []) as NodeInfo[];
          const activeNodes = nodes.filter((n) => n.status === 'sharing' || n.status === 'online');

          if (activeNodes.length === 0) {
            info('No active nodes to stop.');
            return;
          }

          const choices = activeNodes.map((node) => ({
            name: `${node.name} (${node.id.slice(0, 8)})`,
            value: node.id,
          }));

          const answer = await inquirer.prompt([
            {
              type: 'list',
              name: 'nodeId',
              message: 'Select node to stop:',
              choices,
            },
          ]);
          nodeId = answer.nodeId;
        }

        const spinner = createSpinner('Stopping node...');
        spinner.start();

        const result = await api.stopSharing(nodeId);
        spinner.stop();

        if (result.success) {
          success(`Node ${chalk.cyan(nodeId)} stopped sharing.`);
        } else {
          error(result.error || 'Failed to stop node');
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('metrics')
      .description('View node metrics')
      .argument('[nodeId]', 'Node ID')
      .action(async (nodeId) => {
        if (!isAuthenticated()) {
          error('Not logged in. Run ' + chalk.cyan('opengpu login') + ' first.');
          process.exit(1);
        }

        const api = getApiClient();

        if (!nodeId) {
          const spinner = createSpinner('Fetching nodes...');
          spinner.start();
          const result = await api.listNodes();
          spinner.stop();

          if (!result.success) {
            error(result.error || 'Failed to fetch nodes');
            process.exit(1);
          }

          const nodes = (result.data || []) as NodeInfo[];
          if (nodes.length === 0) {
            error('No nodes found.');
            process.exit(1);
          }

          const choices = nodes.map((node) => ({
            name: `${node.name} (${node.id.slice(0, 8)})`,
            value: node.id,
          }));

          const answer = await inquirer.prompt([
            {
              type: 'list',
              name: 'nodeId',
              message: 'Select node:',
              choices,
            },
          ]);
          nodeId = answer.nodeId;
        }

        const spinner = createSpinner('Fetching metrics...');
        spinner.start();

        const nodeResult = await api.getNode(nodeId);
        spinner.stop();

        if (!nodeResult.success || !nodeResult.data) {
          error(nodeResult.error || 'Failed to fetch node');
          process.exit(1);
        }

        const node = nodeResult.data as NodeInfo;

        header(`Node Metrics: ${node.name}`);

        const table = createTable();
        table.push(
          ['Status', statusColor(node.status)],
          ['GPUs', `${node.gpuCount}x ${node.gpuModels.join(', ')}`],
          ['Total Memory', formatMemory(node.totalMemory)],
          ['Uptime', formatDuration(node.uptime)],
          ['Total Earnings', formatPrice(node.earnings)],
          ['Region', node.region]
        );
        console.log(table.toString());
      })
  );
