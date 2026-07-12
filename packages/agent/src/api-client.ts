import axios, { AxiosInstance, AxiosError } from 'axios';
import { NodeConfig, RegistrationData, HeartbeatData, Metrics, RentalJob, APIResponse, SystemInfo } from './types';
import logger from './logger';

let apiClient: AxiosInstance | null = null;

export function initApiClient(config: NodeConfig): AxiosInstance {
  apiClient = axios.create({
    baseURL: config.apiEndpoint,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': config.apiKey,
      'User-Agent': 'OpenGPU-Agent/1.0.0',
    },
  });

  apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response) {
        logger.error('API error', {
          status: error.response.status,
          url: error.config?.url,
          data: error.response.data,
        });
      } else if (error.request) {
        logger.error('API request failed', { url: error.config?.url, error: error.message });
      }
      throw error;
    }
  );

  return apiClient;
}

function getClient(): AxiosInstance {
  if (!apiClient) {
    throw new Error('API client not initialized. Call initApiClient first.');
  }
  return apiClient;
}

export async function registerNode(data: RegistrationData): Promise<APIResponse<{ nodeId: string }>> {
  try {
    const response = await getClient().post<APIResponse<{ nodeId: string }>>('/nodes/register', data);
    logger.info('Node registered successfully', { nodeId: data.nodeId });
    return response.data;
  } catch (err) {
    logger.error('Failed to register node', { error: err });
    throw err;
  }
}

export async function updateNodeStatus(nodeId: string, status: string, gpus: import('./types').GPUInfo[]): Promise<APIResponse> {
  try {
    const response = await getClient().put<APIResponse>(`/nodes/${nodeId}/status`, { status, gpus });
    return response.data;
  } catch (err) {
    logger.error('Failed to update node status', { nodeId, error: err });
    throw err;
  }
}

export async function sendHeartbeat(data: HeartbeatData): Promise<APIResponse> {
  try {
    const response = await getClient().post<APIResponse>('/nodes/heartbeat', data);
    return response.data;
  } catch (err) {
    logger.error('Failed to send heartbeat', { error: err });
    throw err;
  }
}

export async function sendMetrics(nodeId: string, metrics: Metrics): Promise<APIResponse> {
  try {
    const response = await getClient().post<APIResponse>(`/nodes/${nodeId}/metrics`, metrics);
    return response.data;
  } catch (err) {
    logger.error('Failed to send metrics', { nodeId, error: err });
    throw err;
  }
}

export async function reportRentalStatus(job: RentalJob): Promise<APIResponse> {
  try {
    const response = await getClient().post<APIResponse>(`/rentals/${job.rentalId}/status`, {
      rentalId: job.rentalId,
      nodeId: job.nodeId,
      status: job.status,
      containerId: job.containerId,
      startTime: job.startTime,
      endTime: job.endTime,
      error: job.error,
    });
    return response.data;
  } catch (err) {
    logger.error('Failed to report rental status', { rentalId: job.rentalId, error: err });
    throw err;
  }
}

export async function getRentalJob(nodeId: string): Promise<APIResponse<RentalJob>> {
  try {
    const response = await getClient().get<APIResponse<RentalJob>>(`/nodes/${nodeId}/next-rental`);
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return { success: false, error: 'No pending rentals' };
    }
    logger.error('Failed to get rental job', { nodeId, error: err });
    throw err;
  }
}

export async function fetchSystemInfo(): Promise<SystemInfo> {
  const os = await import('os');
  const si = await import('systeminformation');

  const [cpu, mem, osInfo, docker] = await Promise.all([
    si.cpu(),
    si.mem(),
    si.osInfo(),
    si.dockerInfo().catch(() => ({ ServerVersion: 'unknown' })),
  ]);

  return {
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    cpuModel: cpu.brand || cpu.manufacturer || 'unknown',
    cpuCores: cpu.cores,
    totalMemory: mem.total,
    osVersion: `${osInfo.distro} ${osInfo.release}`,
    dockerVersion: (docker as any).ServerVersion || 'unknown',
    nvidiaDriverVersion: '',
    cudaVersion: '',
  };
}

export async function deregisterNode(nodeId: string): Promise<APIResponse> {
  try {
    const response = await getClient().delete<APIResponse>(`/nodes/${nodeId}`);
    logger.info('Node deregistered', { nodeId });
    return response.data;
  } catch (err) {
    logger.error('Failed to deregister node', { nodeId, error: err });
    throw err;
  }
}
