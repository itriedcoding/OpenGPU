import { GpuModel, GpuSpec } from "../types";

export const API_VERSION = "v1";
export const MAX_UPLOAD_SIZE = 100 * 1024 * 1024;
export const JWT_EXPIRY = "7d";
export const JWT_REFRESH_EXPIRY = "30d";
export const API_KEY_LENGTH = 48;
export const MAX_API_KEYS_PER_USER = 10;

export const RATE_LIMITS = {
  general: { windowMs: 60_000, max: 100 },
  auth: { windowMs: 60_000, max: 10 },
  upload: { windowMs: 60_000, max: 20 },
  rental: { windowMs: 60_000, max: 30 },
  apiKey: { windowMs: 60_000, max: 5 },
} as const;

export const SUPPORTED_OS = [
  "ubuntu-22.04",
  "ubuntu-20.04",
  "debian-12",
  "debian-11",
  "centos-9",
  "rocky-linux-9",
  "windows-server-2022",
] as const;

export const SUPPORTED_CONTAINERS = [
  "nvidia/cuda:12.4.0-base-ubuntu22.04",
  "nvidia/cuda:12.4.0-devel-ubuntu22.04",
  "nvidia/cuda:12.4.0-runtime-ubuntu22.04",
  "nvidia/cuda:12.2.0-base-ubuntu20.04",
  "pytorch/pytorch:2.3.0-cuda12.1-cudnn8-runtime",
  "tensorflow/tensorflow:2.16.1-gpu",
  "jupyter/tensorflow-notebook:latest",
] as const;

export const GPU_SPECS: Record<GpuModel, GpuSpec> = {
  [GpuModel.RTX_4090]: {
    model: GpuModel.RTX_4090,
    manufacturer: "NVIDIA",
    memory: 24,
    memoryType: "GDDR6X",
    cudaCores: 16384,
    tensorCores: 512,
    tdp: 450,
    benchmark: { fp32: 82.6, fp16: 82.6, tensor: 165.2 },
  },
  [GpuModel.RTX_4080]: {
    model: GpuModel.RTX_4080,
    manufacturer: "NVIDIA",
    memory: 16,
    memoryType: "GDDR6X",
    cudaCores: 9728,
    tensorCores: 304,
    tdp: 320,
    benchmark: { fp32: 48.7, fp16: 48.7, tensor: 97.5 },
  },
  [GpuModel.RTX_4070_TI]: {
    model: GpuModel.RTX_4070_TI,
    manufacturer: "NVIDIA",
    memory: 12,
    memoryType: "GDDR6X",
    cudaCores: 7680,
    tensorCores: 240,
    tdp: 285,
    benchmark: { fp32: 40.1, fp16: 40.1, tensor: 80.2 },
  },
  [GpuModel.RTX_3090]: {
    model: GpuModel.RTX_3090,
    manufacturer: "NVIDIA",
    memory: 24,
    memoryType: "GDDR6X",
    cudaCores: 10496,
    tensorCores: 328,
    tdp: 350,
    benchmark: { fp32: 35.6, fp16: 35.6, tensor: 71.2 },
  },
  [GpuModel.RTX_3080]: {
    model: GpuModel.RTX_3080,
    manufacturer: "NVIDIA",
    memory: 10,
    memoryType: "GDDR6X",
    cudaCores: 8704,
    tensorCores: 272,
    tdp: 320,
    benchmark: { fp32: 29.8, fp16: 29.8, tensor: 59.5 },
  },
  [GpuModel.RTX_3070]: {
    model: GpuModel.RTX_3070,
    manufacturer: "NVIDIA",
    memory: 8,
    memoryType: "GDDR6",
    cudaCores: 5888,
    tensorCores: 184,
    tdp: 220,
    benchmark: { fp32: 20.3, fp16: 20.3, tensor: 40.6 },
  },
  [GpuModel.A100_80GB]: {
    model: GpuModel.A100_80GB,
    manufacturer: "NVIDIA",
    memory: 80,
    memoryType: "HBM2e",
    cudaCores: 6912,
    tensorCores: 432,
    tdp: 400,
    benchmark: { fp32: 19.5, fp16: 312.0, tensor: 624.0 },
  },
  [GpuModel.A100_40GB]: {
    model: GpuModel.A100_40GB,
    manufacturer: "NVIDIA",
    memory: 40,
    memoryType: "HBM2e",
    cudaCores: 6912,
    tensorCores: 432,
    tdp: 400,
    benchmark: { fp32: 19.5, fp16: 312.0, tensor: 624.0 },
  },
  [GpuModel.A6000]: {
    model: GpuModel.A6000,
    manufacturer: "NVIDIA",
    memory: 48,
    memoryType: "GDDR6",
    cudaCores: 10752,
    tensorCores: 336,
    tdp: 300,
    benchmark: { fp32: 38.7, fp16: 38.7, tensor: 77.5 },
  },
  [GpuModel.H100]: {
    model: GpuModel.H100,
    manufacturer: "NVIDIA",
    memory: 80,
    memoryType: "HBM3",
    cudaCores: 16896,
    tensorCores: 528,
    tdp: 700,
    benchmark: { fp32: 51.2, fp16: 989.4, tensor: 1978.9 },
  },
  [GpuModel.V100_32GB]: {
    model: GpuModel.V100_32GB,
    manufacturer: "NVIDIA",
    memory: 32,
    memoryType: "HBM2",
    cudaCores: 5120,
    tensorCores: 640,
    tdp: 300,
    benchmark: { fp32: 15.7, fp16: 125.0, tensor: 250.0 },
  },
  [GpuModel.V100_16GB]: {
    model: GpuModel.V100_16GB,
    manufacturer: "NVIDIA",
    memory: 16,
    memoryType: "HBM2",
    cudaCores: 5120,
    tensorCores: 640,
    tdp: 300,
    benchmark: { fp32: 15.7, fp16: 125.0, tensor: 250.0 },
  },
  [GpuModel.L40S]: {
    model: GpuModel.L40S,
    manufacturer: "NVIDIA",
    memory: 48,
    memoryType: "GDDR6",
    cudaCores: 18176,
    tensorCores: 568,
    tdp: 350,
    benchmark: { fp32: 36.2, fp16: 362.0, tensor: 724.0 },
  },
  [GpuModel.A40]: {
    model: GpuModel.A40,
    manufacturer: "NVIDIA",
    memory: 48,
    memoryType: "GDDR6",
    cudaCores: 10752,
    tensorCores: 336,
    tdp: 300,
    benchmark: { fp32: 37.4, fp16: 37.4, tensor: 74.8 },
  },
};

export const PRICING_DEFAULTS: Record<GpuModel, { perGpuPerHour: number }> = {
  [GpuModel.RTX_4090]: { perGpuPerHour: 1.5 },
  [GpuModel.RTX_4080]: { perGpuPerHour: 1.0 },
  [GpuModel.RTX_4070_TI]: { perGpuPerHour: 0.8 },
  [GpuModel.RTX_3090]: { perGpuPerHour: 0.9 },
  [GpuModel.RTX_3080]: { perGpuPerHour: 0.7 },
  [GpuModel.RTX_3070]: { perGpuPerHour: 0.5 },
  [GpuModel.A100_80GB]: { perGpuPerHour: 3.5 },
  [GpuModel.A100_40GB]: { perGpuPerHour: 2.8 },
  [GpuModel.A6000]: { perGpuPerHour: 1.8 },
  [GpuModel.H100]: { perGpuPerHour: 8.0 },
  [GpuModel.V100_32GB]: { perGpuPerHour: 1.2 },
  [GpuModel.V100_16GB]: { perGpuPerHour: 0.8 },
  [GpuModel.L40S]: { perGpuPerHour: 2.0 },
  [GpuModel.A40]: { perGpuPerHour: 1.5 },
};

export const MIN_RENTAL_MINUTES = 10;
export const MAX_RENTAL_HOURS = 720;
export const CONTAINER_STARTUP_TIMEOUT = 120;
export const SSH_CONNECTION_TIMEOUT = 30;
