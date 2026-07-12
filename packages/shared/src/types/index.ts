export enum UserRole {
  User = "user",
  Provider = "provider",
  Admin = "admin",
}

export enum NodeStatus {
  Online = "online",
  Offline = "offline",
  Busy = "busy",
  Maintenance = "maintenance",
}

export enum RentalStatus {
  Pending = "pending",
  Active = "active",
  Completed = "completed",
  Cancelled = "cancelled",
  Failed = "failed",
}

export enum PaymentStatus {
  Pending = "pending",
  Succeeded = "succeeded",
  Failed = "failed",
  Refunded = "refunded",
}

export enum JobStatus {
  Pending = "pending",
  Running = "running",
  Completed = "completed",
  Failed = "failed",
  Cancelled = "cancelled",
}

export enum PayoutStatus {
  Pending = "pending",
  Processing = "processing",
  Completed = "completed",
  Failed = "failed",
}

export enum GpuModel {
  RTX_4090 = "RTX_4090",
  RTX_4080 = "RTX_4080",
  RTX_4070_TI = "RTX_4070_TI",
  RTX_3090 = "RTX_3090",
  RTX_3080 = "RTX_3080",
  RTX_3070 = "RTX_3070",
  A100_80GB = "A100_80GB",
  A100_40GB = "A100_40GB",
  A6000 = "A6000",
  H100 = "H100",
  V100_32GB = "V100_32GB",
  V100_16GB = "V100_16GB",
  L40S = "L40S",
  A40 = "A40",
}

export enum WebSocketEvents {
  NodeStatusChanged = "node:status_changed",
  NodeMetricsUpdate = "node:metrics_update",
  RentalStatusChanged = "rental:status_changed",
  RentalLog = "rental:log",
  JobStatusChanged = "job:status_changed",
  JobOutput = "job:output",
  PaymentCompleted = "payment:completed",
  ChatMessage = "chat:message",
  Notification = "notification",
}

export interface GpuSpec {
  model: GpuModel;
  manufacturer: string;
  memory: number;
  memoryType: string;
  cudaCores: number;
  tensorCores: number;
  tdp: number;
  benchmark: GpuBenchmark;
}

export interface GpuBenchmark {
  fp32: number;
  fp16: number;
  tensor: number;
}

export interface GpuNode {
  id: string;
  ownerId: string;
  name: string;
  status: NodeStatus;
  location: NodeLocation;
  specs: NodeSpecs;
  pricing: NodePricing;
  stats: NodeStats;
  createdAt: Date;
  updatedAt: Date;
}

export interface NodeLocation {
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
}

export interface NodeSpecs {
  gpus: GpuSpec[];
  cpu: string;
  ram: number;
  storage: number;
  storageType: string;
  networkSpeed: number;
  os: string;
}

export interface NodePricing {
  perHour: number;
  perGpuPerHour: number;
  currency: string;
  minimumMinutes: number;
}

export interface NodeStats {
  totalRentals: number;
  totalEarnings: number;
  uptime: number;
  averageRating: number;
  totalReviews: number;
}

export interface NodeMetrics {
  nodeId: string;
  gpuUtilization: number;
  memoryUtilization: number;
  temperature: number;
  powerDraw: number;
  timestamp: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Rental {
  id: string;
  userId: string;
  nodeId: string;
  status: RentalStatus;
  gpuCount: number;
  gpuModel: GpuModel;
  startTime: Date | null;
  endTime: Date | null;
  estimatedCost: number;
  actualCost: number;
  containerId: string | null;
  sshCredentials: SshCredentials | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SshCredentials {
  host: string;
  port: number;
  username: string;
  password: string | null;
  privateKey: string | null;
}

export interface Payment {
  id: string;
  userId: string;
  rentalId: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripePaymentId: string | null;
  stripeAccountId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProviderPayout {
  id: string;
  providerId: string;
  amount: number;
  currency: string;
  periodStart: Date;
  periodEnd: Date;
  status: PayoutStatus;
  stripeTransferId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiKey {
  id: string;
  userId: string;
  key: string;
  name: string;
  permissions: ApiKeyPermission[];
  createdAt: Date;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
}

export enum ApiKeyPermission {
  Read = "read",
  Write = "write",
  Admin = "admin",
}

export interface Job {
  id: string;
  rentalId: string;
  userId: string;
  status: JobStatus;
  command: string;
  containerId: string | null;
  image: string;
  environment: Record<string, string>;
  exitCode: number | null;
  output: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthPayload {
  userId: string;
  email: string;
  role: UserRole;
  token: string;
  expiresAt: Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  message: string;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  statusCode: number;
}

export interface ResponseMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface NodeFilter extends PaginationQuery {
  status?: NodeStatus;
  gpuModel?: GpuModel;
  minPrice?: number;
  maxPrice?: number;
  country?: string;
  minMemory?: number;
  available?: boolean;
}

export interface RentalFilter extends PaginationQuery {
  status?: RentalStatus;
  userId?: string;
  nodeId?: string;
  gpuModel?: GpuModel;
}
