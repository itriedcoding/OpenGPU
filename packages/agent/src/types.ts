export interface GPUInfo {
  index: number;
  name: string;
  uuid: string;
  memoryTotal: number;
  memoryFree: number;
  memoryUsed: number;
  temperature: number;
  utilization: number;
  powerDraw: number;
  powerLimit: number;
  cudaCores: number;
  driverVersion: string;
  cudaVersion: string;
  computeCapability: string;
}

export interface NodeConfig {
  apiEndpoint: string;
  apiKey: string;
  nodeName: string;
  maxConcurrentRentals: number;
  heartbeatInterval: number;
  metricsInterval: number;
  dataDirectory: string;
  dockerRuntime: string;
  networkInterface: string;
  enableVpn: boolean;
  logLevel: string;
}

export interface NodeStatus {
  nodeId: string;
  nodeName: string;
  status: 'online' | 'offline' | 'rented' | 'maintenance';
  gpus: GPUInfo[];
  activeRentals: number;
  maxRentals: number;
  uptime: number;
  lastHeartbeat: Date;
}

export interface Metrics {
  timestamp: Date;
  nodeId: string;
  gpus: GPUMetrics[];
  cpu: CPUMetrics;
  memory: MemoryMetrics;
  disk: DiskMetrics;
  network: NetworkMetrics;
}

export interface GPUMetrics {
  index: number;
  utilization: number;
  memoryUsed: number;
  memoryTotal: number;
  temperature: number;
  powerDraw: number;
}

export interface CPUMetrics {
  model: string;
  cores: number;
  usage: number;
  temperature: number;
}

export interface MemoryMetrics {
  total: number;
  used: number;
  free: number;
  usagePercent: number;
}

export interface DiskMetrics {
  total: number;
  used: number;
  free: number;
  readBytes: number;
  writeBytes: number;
}

export interface NetworkMetrics {
  interface: string;
  rxBytes: number;
  txBytes: number;
  rxRate: number;
  txRate: number;
}

export interface RentalJob {
  rentalId: string;
  nodeId: string;
  userId: string;
  image: string;
  gpuCount: number;
  gpuIndices: number[];
  memoryLimit: number;
  cpuLimit: number;
  networkLimit: number;
  environment: Record<string, string>;
  status: 'pending' | 'starting' | 'running' | 'stopping' | 'stopped' | 'error';
  containerId?: string;
  startTime?: Date;
  endTime?: Date;
  error?: string;
}

export interface DockerContainerConfig {
  Image: string;
  Cmd?: string[];
  Env?: string[];
  HostConfig: {
    DeviceRequests: Array<{
      Driver: string;
      Count: number;
      DeviceIDs: string[];
      Capabilities: string[][];
    }>;
    Memory: number;
    NanoCpus: number;
    NetworkMode: string;
    Binds?: string[];
    PortBindings?: Record<string, Array<{ HostPort: string }>>;
  };
  Labels: Record<string, string>;
}

export interface HeartbeatData {
  nodeId: string;
  status: string;
  gpuCount: number;
  activeRentals: number;
  maxRentals: number;
  timestamp: Date;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface RegistrationData {
  nodeId: string;
  nodeName: string;
  apiKey: string;
  gpus: GPUInfo[];
  systemInfo: SystemInfo;
}

export interface SystemInfo {
  hostname: string;
  platform: string;
  arch: string;
  cpuModel: string;
  cpuCores: number;
  totalMemory: number;
  osVersion: string;
  dockerVersion: string;
  nvidiaDriverVersion: string;
  cudaVersion: string;
}
