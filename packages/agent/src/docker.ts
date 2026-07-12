import Dockerode from 'dockerode';
import { DockerContainerConfig, RentalJob } from './types';
import logger from './logger';

let docker: Dockerode | null = null;

export function getDocker(): Dockerode {
  if (!docker) {
    docker = new Dockerode({ socketPath: '/var/run/docker.sock' });
  }
  return docker;
}

export async function checkDocker(): Promise<boolean> {
  try {
    const d = getDocker();
    await d.ping();
    return true;
  } catch (err) {
    logger.error('Docker is not available', { error: err });
    return false;
  }
}

export async function pullImage(image: string): Promise<void> {
  const d = getDocker();
  logger.info('Pulling Docker image', { image });

  return new Promise((resolve, reject) => {
    d.pull(image, (err: Error | null, stream: NodeJS.ReadableStream) => {
      if (err) {
        logger.error('Failed to pull image', { image, error: err });
        reject(err);
        return;
      }

      const dockerModem = d.modem;
      dockerModem.followProgress(
        stream,
        (err: Error | null | undefined, output: unknown[]) => {
          if (err) {
            logger.error('Image pull failed', { image, error: err });
            reject(err);
          } else {
            logger.info('Image pulled successfully', { image });
            resolve();
          }
        },
        (event: { status: string; progress?: string }) => {
          if (event.status === 'Downloading' || event.status === 'Pulling fs layer') {
            logger.debug('Pull progress', { image, status: event.status, progress: event.progress });
          }
        }
      );
    });
  });
}

export async function ensureImage(image: string): Promise<void> {
  const d = getDocker();
  try {
    await d.getImage(image).inspect();
    logger.debug('Image already exists', { image });
  } catch {
    await pullImage(image);
  }
}

export async function createContainer(
  job: RentalJob,
  gpuIndices: number[]
): Promise<Dockerode.Container> {
  const d = getDocker();
  const containerName = `opengpu-rental-${job.rentalId}`;

  const envVars = Object.entries(job.environment).map(([k, v]) => `${k}=${v}`);

  const config: DockerContainerConfig = {
    Image: job.image,
    Env: envVars,
    Labels: {
      'opengpu.rentalId': job.rentalId,
      'opengpu.nodeId': job.nodeId,
      'opengpu.userId': job.userId,
    },
    HostConfig: {
      DeviceRequests: [
        {
          Driver: 'nvidia',
          Count: gpuIndices.length,
          DeviceIDs: gpuIndices.map(String),
          Capabilities: [['gpu', 'compute', 'utility']],
        },
      ],
      Memory: job.memoryLimit > 0 ? job.memoryLimit : 0,
      NanoCpus: job.cpuLimit > 0 ? job.cpuLimit * 1e9 : 0,
      NetworkMode: 'bridge',
    },
  };

  logger.info('Creating container', {
    containerName,
    image: job.image,
    gpuIndices,
    memoryLimit: job.memoryLimit,
    cpuLimit: job.cpuLimit,
  });

  const container = await d.createContainer({
    name: containerName,
    ...config,
  });

  return container;
}

export async function startContainer(containerId: string): Promise<void> {
  const d = getDocker();
  const container = d.getContainer(containerId);
  await container.start();
  logger.info('Container started', { containerId });
}

export async function stopContainer(containerId: string, timeoutSec = 30): Promise<void> {
  const d = getDocker();
  const container = d.getContainer(containerId);
  try {
    await container.stop({ t: timeoutSec });
    logger.info('Container stopped', { containerId });
  } catch (err: any) {
    if (err.statusCode === 304) {
      logger.debug('Container already stopped', { containerId });
    } else {
      throw err;
    }
  }
}

export async function removeContainer(containerId: string, force = true): Promise<void> {
  const d = getDocker();
  const container = d.getContainer(containerId);
  try {
    await container.remove({ force, v: true });
    logger.info('Container removed', { containerId });
  } catch (err: any) {
    if (err.statusCode === 404) {
      logger.debug('Container not found', { containerId });
    } else {
      throw err;
    }
  }
}

export async function getContainerStats(containerId: string): Promise<Dockerode.ContainerStats> {
  const d = getDocker();
  const container = d.getContainer(containerId);
  return container.stats({ stream: false });
}

export async function listContainers(label?: string): Promise<Dockerode.ContainerInfo[]> {
  const d = getDocker();
  const filters: Record<string, string[]> = {};
  if (label) {
    filters.label = [label];
  }
  return d.listContainers({ all: true, filters });
}

export async function getContainerLogs(containerId: string, tail = 100): Promise<string> {
  const d = getDocker();
  const container = d.getContainer(containerId);
  const logs = await container.logs({
    stdout: true,
    stderr: true,
    tail,
    timestamps: false,
  });
  return logs.toString('utf-8');
}

export async function containerExists(containerId: string): Promise<boolean> {
  const d = getDocker();
  try {
    await d.getContainer(containerId).inspect();
    return true;
  } catch {
    return false;
  }
}

export async function cleanupRentalContainers(): Promise<void> {
  const d = getDocker();
  try {
    const containers = await d.listContainers({
      all: true,
      filters: { label: ['opengpu.rentalId'] },
    });

    for (const info of containers) {
      const container = d.getContainer(info.Id);
      try {
        await container.stop({ t: 10 });
      } catch {
        // ignore
      }
      try {
        await container.remove({ force: true, v: true });
      } catch {
        // ignore
      }
      logger.info('Cleaned up rental container', { containerId: info.Id });
    }
  } catch (err) {
    logger.error('Failed to cleanup rental containers', { error: err });
  }
}
