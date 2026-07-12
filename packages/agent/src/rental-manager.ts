import { RentalJob, GPUInfo } from './types';
import {
  createContainer,
  startContainer,
  stopContainer,
  removeContainer,
  getContainerLogs,
  containerExists,
  ensureImage,
} from './docker';
import { validateRentalSecurity } from './security';
import logger from './logger';

const activeRentals: Map<string, RentalJob> = new Map();
const rentalHealthChecks: Map<string, NodeJS.Timeout> = new Map();

export async function startRental(job: RentalJob, gpus: GPUInfo[]): Promise<RentalJob> {
  logger.info('Starting rental', { rentalId: job.rentalId, image: job.image, gpuCount: job.gpuCount });

  const securityCheck = validateRentalSecurity(job);
  if (!securityCheck.valid) {
    job.status = 'error';
    job.error = `Security check failed: ${securityCheck.reason}`;
    logger.error('Rental failed security check', { rentalId: job.rentalId, reason: securityCheck.reason });
    return job;
  }

  try {
    job.status = 'starting';
    activeRentals.set(job.rentalId, job);

    await ensureImage(job.image);

    const container = await createContainer(job, job.gpuIndices);
    job.containerId = container.id;

    await startContainer(container.id);
    job.status = 'running';
    job.startTime = new Date();

    startHealthCheck(job.rentalId, container.id);

    logger.info('Rental started successfully', {
      rentalId: job.rentalId,
      containerId: container.id,
      startTime: job.startTime,
    });

    return job;
  } catch (err: any) {
    job.status = 'error';
    job.error = err.message || 'Unknown error';
    logger.error('Failed to start rental', { rentalId: job.rentalId, error: err });

    if (job.containerId) {
      try {
        await removeContainer(job.containerId);
      } catch {
        // ignore cleanup errors
      }
    }

    return job;
  }
}

export async function stopRental(rentalId: string, timeoutSec = 30): Promise<RentalJob | null> {
  const job = activeRentals.get(rentalId);
  if (!job) {
    logger.warn('Rental not found for stop', { rentalId });
    return null;
  }

  logger.info('Stopping rental', { rentalId, containerId: job.containerId });

  stopHealthCheck(rentalId);
  job.status = 'stopping';

  try {
    if (job.containerId) {
      const exists = await containerExists(job.containerId);
      if (exists) {
        await stopContainer(job.containerId, timeoutSec);
        await removeContainer(job.containerId);
      }
    }

    job.status = 'stopped';
    job.endTime = new Date();
    activeRentals.delete(rentalId);

    logger.info('Rental stopped', { rentalId, duration: job.endTime.getTime() - (job.startTime?.getTime() || 0) });

    return job;
  } catch (err: any) {
    job.status = 'error';
    job.error = err.message || 'Failed to stop';
    logger.error('Failed to stop rental', { rentalId, error: err });
    return job;
  }
}

function startHealthCheck(rentalId: string, containerId: string): void {
  const interval = setInterval(async () => {
    try {
      const exists = await containerExists(containerId);
      if (!exists) {
        logger.warn('Rental container disappeared', { rentalId, containerId });
        const job = activeRentals.get(rentalId);
        if (job) {
          job.status = 'error';
          job.error = 'Container exited unexpectedly';
          job.endTime = new Date();
        }
        stopHealthCheck(rentalId);
        activeRentals.delete(rentalId);
      }
    } catch (err) {
      logger.error('Health check failed', { rentalId, error: err });
    }
  }, 15000);

  rentalHealthChecks.set(rentalId, interval);
}

function stopHealthCheck(rentalId: string): void {
  const interval = rentalHealthChecks.get(rentalId);
  if (interval) {
    clearInterval(interval);
    rentalHealthChecks.delete(rentalId);
  }
}

export function getActiveRentals(): RentalJob[] {
  return Array.from(activeRentals.values());
}

export function getActiveRentalCount(): number {
  return activeRentals.size;
}

export function getRental(rentalId: string): RentalJob | undefined {
  return activeRentals.get(rentalId);
}

export async function getRentalLogs(rentalId: string, tail = 100): Promise<string | null> {
  const job = activeRentals.get(rentalId);
  if (!job?.containerId) return null;

  try {
    return await getContainerLogs(job.containerId, tail);
  } catch (err) {
    logger.error('Failed to get rental logs', { rentalId, error: err });
    return null;
  }
}

export async function stopAllRentals(): Promise<void> {
  const rentalIds = Array.from(activeRentals.keys());
  logger.info('Stopping all active rentals', { count: rentalIds.length });

  for (const rentalId of rentalIds) {
    await stopRental(rentalId, 10);
  }
}

export function isGpuAvailable(gpuIndex: number): boolean {
  for (const job of activeRentals.values()) {
    if (job.gpuIndices.includes(gpuIndex) && job.status === 'running') {
      return false;
    }
  }
  return true;
}

export function getAvailableGpuIndices(gpus: GPUInfo[]): number[] {
  return gpus.filter((gpu) => isGpuAvailable(gpu.index)).map((gpu) => gpu.index);
}
