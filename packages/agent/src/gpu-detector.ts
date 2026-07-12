import { execSync } from 'child_process';
import { GPUInfo } from './types';
import logger from './logger';

const GPU_CUDA_CORES: Record<string, number> = {
  'NVIDIA A100 80GB': 6912,
  'NVIDIA A100 40GB': 6912,
  'NVIDIA A100': 6912,
  'NVIDIA H100': 16896,
  'NVIDIA H100 80GB': 16896,
  'NVIDIA H100 SXM5': 16896,
  'NVIDIA H200': 14592,
  'NVIDIA L40S': 18176,
  'NVIDIA L40': 18176,
  'NVIDIA L4': 7424,
  'NVIDIA A10': 9216,
  'NVIDIA A30': 3584,
  'NVIDIA A16': 5120,
  'NVIDIA RTX 4090': 16384,
  'NVIDIA RTX 4080': 9728,
  'NVIDIA RTX 4070 Ti': 7680,
  'NVIDIA RTX 3090 Ti': 10752,
  'NVIDIA RTX 3090': 10496,
  'NVIDIA RTX 3080 Ti': 10240,
  'NVIDIA RTX 3080': 8704,
  'NVIDIA RTX 3070 Ti': 6144,
  'NVIDIA RTX 3070': 5888,
  'NVIDIA RTX 3060 Ti': 4864,
  'NVIDIA RTX 3060': 3584,
  'NVIDIA RTX A6000': 10752,
  'NVIDIA RTX A5000': 8192,
  'NVIDIA RTX A4000': 6144,
  'NVIDIA RTX A2000': 3328,
  'NVIDIA Tesla V100-SXM2-32GB': 5120,
  'NVIDIA Tesla V100-SXM2-16GB': 5120,
  'NVIDIA Tesla V100-PCIE-32GB': 5120,
  'NVIDIA Tesla V100-PCIE-16GB': 5120,
  'NVIDIA Tesla T4': 2560,
  'NVIDIA Tesla P100-SXM2-16GB': 3584,
  'NVIDIA Tesla P100-PCIE-16GB': 3584,
  'NVIDIA Tesla P100-SXM2-12GB': 3584,
  'NVIDIA Tesla P100-PCIE-12GB': 3584,
  'NVIDIA Quadro RTX 8000': 4352,
  'NVIDIA Quadro RTX 6000': 4352,
  'NVIDIA Quadro RTX 5000': 3072,
  'NVIDIA Quadro RTX 4000': 2304,
  'NVIDIA Quadro P6000': 3840,
  'NVIDIA Quadro P5000': 2560,
  'NVIDIA Quadro P4000': 1792,
  'NVIDIA Quadro M6000': 3072,
  'NVIDIA Quadro M5000': 2048,
};

function getCudaCores(gpuName: string): number {
  const normalizedName = gpuName.trim();
  if (GPU_CUDA_CORES[normalizedName]) {
    return GPU_CUDA_CORES[normalizedName];
  }

  for (const [key, cores] of Object.entries(GPU_CUDA_CORES)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return cores;
    }
  }

  logger.warn('Unknown GPU model, defaulting to 0 CUDA cores', { gpuName: normalizedName });
  return 0;
}

function runCommand(cmd: string): string {
  try {
    return execSync(cmd, { encoding: 'utf-8', timeout: 10000 }).trim();
  } catch (err) {
    logger.error('Failed to execute command', { cmd, error: err });
    throw err;
  }
}

export function detectGPUs(): GPUInfo[] {
  const gpus: GPUInfo[] = [];

  try {
    const output = runCommand(
      'nvidia-smi --query-gpu=index,name,uuid,memory.total,memory.free,temperature.gpu,utilization.gpu,power.draw,power.limit --format=csv,noheader,nounits'
    );

    if (!output) {
      logger.warn('nvidia-smi returned empty output');
      return gpus;
    }

    const lines = output.split('\n').filter((line) => line.trim());

    for (const line of lines) {
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length < 9) {
        logger.warn('Unexpected nvidia-smi output format', { line });
        continue;
      }

      const [index, name, uuid, memTotal, memFree, temp, util, power, powerLimit] = parts;

      const memoryTotal = parseInt(memTotal, 10);
      const memoryFree = parseInt(memFree, 10);

      gpus.push({
        index: parseInt(index, 10),
        name,
        uuid,
        memoryTotal,
        memoryFree,
        memoryUsed: memoryTotal - memoryFree,
        temperature: parseFloat(temp),
        utilization: parseFloat(util),
        powerDraw: parseFloat(power),
        powerLimit: parseFloat(powerLimit),
        cudaCores: getCudaCores(name),
        driverVersion: '',
        cudaVersion: '',
        computeCapability: '',
      });
    }

    logger.info(`Detected ${gpus.length} GPU(s)`, {
      gpus: gpus.map((g) => ({ index: g.index, name: g.name, memory: g.memoryTotal })),
    });
  } catch (err) {
    logger.error('GPU detection failed', { error: err });
  }

  return gpus;
}

export function getDriverVersion(): string {
  try {
    const output = runCommand('nvidia-smi --query-gpu=driver_version --format=csv,noheader');
    return output.split('\n')[0]?.trim() || 'unknown';
  } catch {
    return 'unknown';
  }
}

export function getCudaVersion(): string {
  try {
    const output = runCommand('nvidia-smi');
    const match = output.match(/CUDA Version:\s*([\d.]+)/);
    return match?.[1] || 'unknown';
  } catch {
    return 'unknown';
  }
}

export function getComputeCapability(gpuIndex: number): string {
  try {
    const output = runCommand(`nvidia-smi -i ${gpuIndex} --query-gpu=compute_cap --format=csv,noheader`);
    return output.split('\n')[0]?.trim() || 'unknown';
  } catch {
    return 'unknown';
  }
}

export function refreshGPUs(gpus: GPUInfo[]): GPUInfo[] {
  try {
    const output = runCommand(
      'nvidia-smi --query-gpu=index,memory.free,temperature.gpu,utilization.gpu,power.draw --format=csv,noheader,nounits'
    );

    if (!output) return gpus;

    const lines = output.split('\n').filter((line) => line.trim());
    const updatedGpus = [...gpus];

    for (const line of lines) {
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length < 5) continue;

      const [indexStr, memFree, temp, util, power] = parts;
      const index = parseInt(indexStr, 10);
      const gpu = updatedGpus.find((g) => g.index === index);

      if (gpu) {
        const memoryFree = parseInt(memFree, 10);
        gpu.memoryFree = memoryFree;
        gpu.memoryUsed = gpu.memoryTotal - memoryFree;
        gpu.temperature = parseFloat(temp);
        gpu.utilization = parseFloat(util);
        gpu.powerDraw = parseFloat(power);
      }
    }

    return updatedGpus;
  } catch (err) {
    logger.error('Failed to refresh GPU stats', { error: err });
    return gpus;
  }
}
