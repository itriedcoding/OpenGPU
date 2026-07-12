export interface Gpu {
  id: string;
  name: string;
  model: string;
  brand: "NVIDIA" | "AMD" | "Intel";
  vram: number;
  vramType: string;
  pricePerHour: number;
  pricePerMonth: number;
  provider: {
    id: string;
    name: string;
    rating: number;
    totalRentals: number;
    avatar: string;
  };
  location: string;
  country: string;
  availability: "available" | "limited" | "unavailable" | "rented" | "offline";
  performance: {
    fp32: number;
    fp16: number;
    tf32: number;
  };
  specs: {
    cores: number;
    boostClock: string;
    tdp: string;
    interface: string;
    cooling: string;
    networkSpeed: string;
    memory: number;
    storage: number;
  };
  description: string;
  tags: string[];
  status: string;
  online: boolean;
  latency?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "user" | "provider" | "admin";
  createdAt: string;
}

export interface Rental {
  id: string;
  gpuNodeId: string;
  gpuName: string;
  status: "active" | "completed" | "cancelled" | "expired";
  startedAt: string;
  expiresAt: string | null;
  stoppedAt: string | null;
  totalHours: number;
  totalCost: number;
  billingCycle: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface ProviderStats {
  totalEarnings: number;
  activeNodes: number;
  avgUptime: number;
  thisMonth: number;
  nodes: ProviderNode[];
  monthlyEarnings: number[];
}

export interface ProviderNode {
  id: string;
  name: string;
  gpu: string;
  status: string;
  uptime: string;
  earnings: number;
  vram: number;
  location: string;
}

export interface PlatformStats {
  totalGpus: number;
  totalProviders: number;
  uptime: number;
  totalRentals: number;
}
