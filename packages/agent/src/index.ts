#!/usr/bin/env node

import { machineIdSync } from 'node-machine-id';
import { loadConfig } from './config';
import { detectGPUs, getDriverVersion, getCudaVersion } from './gpu-detector';
import { collectMetrics } from './metrics';
import { HeartbeatManager } from './heartbeat';
import { getActiveRentalCount, startRental, stopRental, stopAllRentals, getAvailableGpuIndices } from './rental-manager';
import { checkDocker, cleanupRentalContainers } from './docker';
import { sendMetrics } from './metrics';
import { initApiClient, registerNode, sendHeartbeat, getRentalJob, reportRentalStatus, deregisterNode, fetchSystemInfo } from './api-client';
import { ReconnectionManager } from './reconnection';
import { Metrics, GPUInfo, RentalJob, NodeStatus } from './types';
import logger from './logger';

const METRICS_BUFFER_MAX = 720;
const metricsBuffer: Metrics[] = [];

let nodeId = '';
let gpus: GPUInfo[] = [];
let config = loadConfig();
let heartbeatManager: HeartbeatManager | null = null;
let metricsInterval: NodeJS.Timeout | null = null;
let rentalPollInterval: NodeJS.Timeout | null = null;
let reconnectionManager: ReconnectionManager | null = null;
let running = false;

function generateNodeId(): string {
  try {
    return machineIdSync();
  } catch {
    return `node-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  }
}

async function getNodeStatus(): Promise<NodeStatus> {
  return {
    nodeId,
    nodeName: config.nodeName,
    status: running ? 'online' : 'offline',
    gpus,
    activeRentals: getActiveRentalCount(),
    maxRentals: config.maxConcurrentRentals,
    uptime: process.uptime(),
    lastHeartbeat: new Date(),
  };
}

async function handleHeartbeat(data: import('./types').HeartbeatData): Promise<void> {
  await sendHeartbeat(data);
}

async function sendMetricsWithBuffer(metrics: Metrics): Promise<void> {
  try {
    await sendMetrics(nodeId, metrics);
    if (metricsBuffer.length > 0) {
      logger.info('Sending buffered metrics', { count: metricsBuffer.length });
      for (const buffered of [...metricsBuffer]) {
        await sendMetrics(nodeId, buffered);
        metricsBuffer.shift();
      }
    }
  } catch (err) {
    metricsBuffer.push(metrics);
    if (metricsBuffer.length > METRICS_BUFFER_MAX) {
      metricsBuffer.shift();
      logger.warn('Metrics buffer overflow, discarding oldest entry');
    }
    logger.debug('Metrics buffered', { bufferSize: metricsBuffer.length });
  }
}

async function collectAndSendMetrics(): Promise<void> {
  if (!running) return;

  try {
    const metrics = await collectMetrics(nodeId, gpus, config.networkInterface);
    await sendMetricsWithBuffer(metrics);
  } catch (err) {
    logger.error('Metrics collection failed', { error: err });
  }
}

async function pollForRentals(): Promise<void> {
  if (!running) return;
  if (getActiveRentalCount() >= config.maxConcurrentRentals) return;

  try {
    const response = await getRentalJob(nodeId);
    if (response.success && response.data) {
      const job = response.data;
      job.nodeId = nodeId;

      const availableGpus = getAvailableGpuIndices(gpus);
      if (job.gpuCount > availableGpus.length) {
        logger.warn('Not enough GPUs available for rental', {
          rentalId: job.rentalId,
          requested: job.gpuCount,
          available: availableGpus.length,
        });
        return;
      }

      job.gpuIndices = availableGpus.slice(0, job.gpuCount);
      const result = await startRental(job, gpus);
      await reportRentalStatus(result);
    }
  } catch (err) {
    logger.error('Rental polling failed', { error: err });
  }
}

async function handleShutdown(signal: string): Promise<void> {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  running = false;

  if (metricsInterval) {
    clearInterval(metricsInterval);
    metricsInterval = null;
  }

  if (rentalPollInterval) {
    clearInterval(rentalPollInterval);
    rentalPollInterval = null;
  }

  if (heartbeatManager) {
    heartbeatManager.stop();
  }

  if (reconnectionManager) {
    reconnectionManager.stop();
  }

  await stopAllRentals();

  try {
    await deregisterNode(nodeId);
  } catch {
    // ignore deregistration errors during shutdown
  }

  logger.info('Agent shutdown complete');
  process.exit(0);
}

async function initialize(): Promise<void> {
  logger.info('Initializing OpenGPU Agent...');

  const dockerAvailable = await checkDocker();
  if (!dockerAvailable) {
    logger.error('Docker is not available. Please install Docker and nvidia-docker2.');
    process.exit(1);
  }

  gpus = detectGPUs();
  if (gpus.length === 0) {
    logger.warn('No NVIDIA GPUs detected. Agent will run in limited mode.');
  }

  nodeId = generateNodeId();
  logger.info('Node ID', { nodeId });

  const driverVersion = getDriverVersion();
  const cudaVersion = getCudaVersion();
  gpus.forEach((gpu) => {
    gpu.driverVersion = driverVersion;
    gpu.cudaVersion = cudaVersion;
  });

  initApiClient(config);

  const systemInfo = await fetchSystemInfo();
  systemInfo.nvidiaDriverVersion = driverVersion;
  systemInfo.cudaVersion = cudaVersion;

  const registration = await registerNode({
    nodeId,
    nodeName: config.nodeName,
    apiKey: config.apiKey,
    gpus,
    systemInfo,
  });

  if (!registration.success) {
    logger.error('Failed to register node', { error: registration.error });
    process.exit(1);
  }

  logger.info('Node registered successfully', { nodeId: registration.data?.nodeId });

  await cleanupRentalContainers();

  heartbeatManager = new HeartbeatManager(nodeId, config.heartbeatInterval, getNodeStatus, handleHeartbeat);

  reconnectionManager = new ReconnectionManager(
    async () => {
      logger.info('Reconnected to API');
    },
    () => {
      logger.error('Lost connection to API permanently');
      running = false;
    }
  );
}

async function start(): Promise<void> {
  await initialize();

  running = true;

  heartbeatManager!.start();

  metricsInterval = setInterval(collectAndSendMetrics, config.metricsInterval);

  rentalPollInterval = setInterval(pollForRentals, 10000);

  logger.info('OpenGPU Agent started', {
    nodeId,
    nodeName: config.nodeName,
    gpuCount: gpus.length,
    maxRentals: config.maxConcurrentRentals,
    heartbeatInterval: config.heartbeatInterval,
    metricsInterval: config.metricsInterval,
  });

  if (gpus.length > 0) {
    logger.info('Detected GPUs:', {});
    for (const gpu of gpus) {
      logger.info(`  GPU ${gpu.index}: ${gpu.name} (${gpu.memoryTotal} MiB, ${gpu.cudaCores} CUDA cores)`);
    }
  }
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { error: err });
  handleShutdown('uncaughtException');
});
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason });
});

start().catch((err) => {
  logger.error('Failed to start agent', { error: err });
  process.exit(1);
});
