import fetch from 'node-fetch';
import { loadConfig, getToken, getApiUrl } from './config';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  balance: number;
  credits: number;
  createdAt: string;
}

export interface GpuInfo {
  id: string;
  model: string;
  brand: string;
  memory: number;
  memoryType: string;
  cores: number;
  pricePerHour: number;
  pricePerDay: number;
  availability: 'available' | 'rented' | 'offline';
  region: string;
  providerId: string;
  providerName: string;
  specs: {
    tflops: number;
    bandwidth: number;
    tdp: number;
  };
}

export interface Rental {
  id: string;
  gpuId: string;
  gpuModel: string;
  status: 'active' | 'stopped' | 'expired';
  startTime: string;
  endTime: string | null;
  duration: string;
  cost: number;
  connectionInfo: {
    host: string;
    port: number;
    sshKey: string;
  };
}

export interface NodeInfo {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'sharing';
  gpuCount: number;
  gpuModels: string[];
  totalMemory: number;
  uptime: number;
  earnings: number;
  region: string;
}

export interface MetricsData {
  timestamp: string;
  gpuUtilization: number;
  memoryUtilization: number;
  temperature: number;
  powerDraw: number;
  fanSpeed: number;
  networkIn: number;
  networkOut: number;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = getApiUrl();
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'opengpu-cli/0.1.0',
    };

    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: unknown
  ): Promise<ApiResponse<T>> {
    try {
      const options: import('node-fetch').RequestInit = {
        method,
        headers: this.getHeaders(),
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, options);
      const data = (await response.json()) as ApiResponse<T>;

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: UserInfo }>> {
    return this.request('POST', '/auth/login', { email, password });
  }

  async loginWithToken(token: string): Promise<ApiResponse<UserInfo>> {
    const oldToken = getToken();
    const config = loadConfig();
    config.token = token;
    require('./config').saveConfig(config);

    const result = await this.request<UserInfo>('/auth/me');
    if (!result.success) {
      config.token = oldToken;
      require('./config').saveConfig(config);
    }
    return result;
  }

  async getUserInfo(): Promise<ApiResponse<UserInfo>> {
    return this.request('GET', '/auth/me');
  }

  async listGpus(filters?: {
    model?: string;
    minMemory?: number;
    maxPrice?: number;
    region?: string;
    available?: boolean;
  }): Promise<ApiResponse<GpuInfo[]>> {
    const params = new URLSearchParams();
    if (filters?.model) params.append('model', filters.model);
    if (filters?.minMemory) params.append('minMemory', String(filters.minMemory));
    if (filters?.maxPrice) params.append('maxPrice', String(filters.maxPrice));
    if (filters?.region) params.append('region', filters.region);
    if (filters?.available !== undefined) params.append('available', String(filters.available));

    const query = params.toString();
    return this.request('GET', `/gpus${query ? `?${query}` : ''}`);
  }

  async getGpu(gpuId: string): Promise<ApiResponse<GpuInfo>> {
    return this.request('GET', `/gpus/${gpuId}`);
  }

  async rentGpu(gpuId: string, duration: string): Promise<ApiResponse<Rental>> {
    return this.request('POST', '/rentals', { gpuId, duration });
  }

  async listRentals(): Promise<ApiResponse<Rental[]>> {
    return this.request('GET', '/rentals');
  }

  async getRental(rentalId: string): Promise<ApiResponse<Rental>> {
    return this.request('GET', `/rentals/${rentalId}`);
  }

  async stopRental(rentalId: string): Promise<ApiResponse<Rental>> {
    return this.request('POST', `/rentals/${rentalId}/stop`);
  }

  async listNodes(): Promise<ApiResponse<NodeInfo[]>> {
    return this.request('GET', '/nodes');
  }

  async getNode(nodeId: string): Promise<ApiResponse<NodeInfo>> {
    return this.request('GET', `/nodes/${nodeId}`);
  }

  async startSharing(nodeId: string): Promise<ApiResponse<NodeInfo>> {
    return this.request('POST', `/nodes/${nodeId}/start`);
  }

  async stopSharing(nodeId: string): Promise<ApiResponse<NodeInfo>> {
    return this.request('POST', `/nodes/${nodeId}/stop`);
  }

  async getMetrics(rentalId: string, period?: string): Promise<ApiResponse<MetricsData[]>> {
    const query = period ? `?period=${period}` : '';
    return this.request('GET', `/rentals/${rentalId}/metrics${query}`);
  }

  async getConfig(): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request('GET', '/config');
  }

  async updateConfig(updates: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request('PUT', '/config', updates);
  }
}

let client: ApiClient | null = null;

export function getApiClient(): ApiClient {
  if (!client) {
    client = new ApiClient();
  }
  return client;
}

export function resetApiClient(): void {
  client = null;
}
