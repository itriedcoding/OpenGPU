import { exec, execFile } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const execFileAsync = promisify(execFile);

export interface GpuInfo {
  id: number;
  name: string;
  vendor: 'nvidia' | 'amd' | 'intel' | 'unknown';
  driverVersion: string;
  memoryTotal: number;
  memoryUsed: number;
  memoryFree: number;
  utilization: number;
  temperature: number;
  powerDraw: number;
  powerLimit: number;
  clockSpeed: number;
  uuid: string;
  pciBus: string;
  vbiosVersion: string;
  computeCapability: string;
  maxClockSpeed: number;
  memoryClockSpeed: number;
}

export interface GpuMetrics {
  gpuId: number;
  utilization: number;
  memoryUsed: number;
  memoryTotal: number;
  temperature: number;
  powerDraw: number;
  fanSpeed: number;
  clockSpeed: number;
  memoryClockSpeed: number;
  timestamp: number;
  processes: GpuProcess[];
}

export interface GpuProcess {
  pid: number;
  processName: string;
  memoryUsed: number;
  gpuInstanceId: number;
}

async function runNvidiaSmi(args: string[]): Promise<string> {
  try {
    const nvidiaSmiPath = process.platform === 'win32'
      ? '"C:\\Program Files\\NVIDIA Corporation\\NVSMI\\nvidia-smi.exe"'
      : 'nvidia-smi';

    const { stdout } = await execAsync(`${nvidiaSmiPath} ${args.join(' ')}`, {
      timeout: 10000,
      encoding: 'utf-8',
    });
    return stdout;
  } catch (error: any) {
    throw new Error(`nvidia-smi failed: ${error.message}`);
  }
}

function parseNvidiaSmi(output: string): GpuInfo[] {
  const gpus: GpuInfo[] = [];
  const lines = output.trim().split('\n');

  const gpuSections = output.split(/\n(?=\|)/);

  let currentGpu: Partial<GpuInfo> | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.includes('MiB') && trimmed.includes('/')) {
      const memMatch = trimmed.match(/(\d+)MiB\s*\/\s*(\d+)MiB/);
      if (memMatch && currentGpu) {
        currentGpu.memoryUsed = parseInt(memMatch[1]);
        currentGpu.memoryTotal = parseInt(memMatch[2]);
        currentGpu.memoryFree = currentGpu.memoryTotal - currentGpu.memoryUsed;
      }
    }

    if (trimmed.includes('%')) {
      const utilMatch = trimmed.match(/(\d+)\s*%/);
      if (utilMatch && currentGpu) {
        if (currentGpu.utilization === undefined) {
          currentGpu.utilization = parseInt(utilMatch[1]);
        }
      }
    }

    if (trimmed.includes('W') && trimmed.includes('/')) {
      const powerMatch = trimmed.match(/(\d+)\s*W\s*\/\s*(\d+)\s*W/);
      if (powerMatch && currentGpu) {
        currentGpu.powerDraw = parseInt(powerMatch[1]);
        currentGpu.powerLimit = parseInt(powerMatch[2]);
      }
    }

    if (trimmed.match(/\d+\s*C$/)) {
      const tempMatch = trimmed.match(/(\d+)\s*C/);
      if (tempMatch && currentGpu) {
        currentGpu.temperature = parseInt(tempMatch[1]);
      }
    }
  }

  return gpus;
}

export async function detectGPUs(): Promise<GpuInfo[]> {
  try {
    const queryFlags = [
      '--query-gpu=index,name,driver_version,memory.total,memory.used,memory.free,',
      'utilization.gpu,temperature.gpu,power.draw,power.limit,clocks.current.graphics,',
      'uuid,pci.bus_info,gpu_bus_id,vbios_version,compute_cap,clocks.max.graphics,',
      'clocks.max.memory',
      '--format=csv,noheader,nounits',
    ];

    const output = await runNvidiaSmi(queryFlags);
    const lines = output.trim().split('\n').filter((l) => l.trim());

    const gpus: GpuInfo[] = lines.map((line) => {
      const parts = line.split(',').map((p) => p.trim());
      return {
        id: parseInt(parts[0]) || 0,
        name: parts[1] || 'Unknown GPU',
        vendor: detectVendor(parts[1]),
        driverVersion: parts[2] || 'unknown',
        memoryTotal: parseInt(parts[3]) || 0,
        memoryUsed: parseInt(parts[4]) || 0,
        memoryFree: parseInt(parts[5]) || 0,
        utilization: parseInt(parts[6]) || 0,
        temperature: parseInt(parts[7]) || 0,
        powerDraw: parseFloat(parts[8]) || 0,
        powerLimit: parseFloat(parts[9]) || 0,
        clockSpeed: parseInt(parts[10]) || 0,
        uuid: parts[11] || '',
        pciBus: parts[12] || '',
        vbiosVersion: parts[14] || '',
        computeCapability: parts[15] || '',
        maxClockSpeed: parseInt(parts[16]) || 0,
        memoryClockSpeed: parseInt(parts[17]) || 0,
      };
    });

    return gpus;
  } catch (error) {
    console.error('GPU detection failed:', error);
    return [];
  }
}

function detectVendor(name: string): GpuInfo['vendor'] {
  const lower = name.toLowerCase();
  if (lower.includes('nvidia') || lower.includes('geforce') || lower.includes('quadro') || lower.includes('tesla')) {
    return 'nvidia';
  }
  if (lower.includes('amd') || lower.includes('radeon') || lower.includes('rx ')) {
    return 'amd';
  }
  if (lower.includes('intel') || lower.includes('iris') || lower.includes('uhd')) {
    return 'intel';
  }
  return 'unknown';
}

export async function getGpuMetrics(gpuId: number): Promise<GpuMetrics | null> {
  try {
    const output = await runNvidiaSmi([
      `--id=${gpuId}`,
      '--query-gpu=utilization.gpu,memory.used,memory.total,temperature.gpu,power.draw,fan.speed,clocks.current.graphics,clocks.current.memory',
      '--format=csv,noheader,nounits`,
    ]);

    const parts = output.trim().split(',').map((p) => p.trim());

    let processes: GpuProcess[] = [];
    try {
      const procOutput = await runNvidiaSmi([
        `--id=${gpuId}`,
        '--query-compute-apps=pid,process_name,used_memory,gpu_instance_id',
        '--format=csv,noheader,nounits',
      ]);

      processes = procOutput.trim().split('\n').filter((l) => l.trim()).map((line) => {
        const p = line.split(',').map((s) => s.trim());
        return {
          pid: parseInt(p[0]) || 0,
          processName: p[1] || 'unknown',
          memoryUsed: parseInt(p[2]) || 0,
          gpuInstanceId: parseInt(p[3]) || 0,
        };
      });
    } catch {
      processes = [];
    }

    return {
      gpuId,
      utilization: parseInt(parts[0]) || 0,
      memoryUsed: parseInt(parts[1]) || 0,
      memoryTotal: parseInt(parts[2]) || 0,
      temperature: parseInt(parts[3]) || 0,
      powerDraw: parseFloat(parts[4]) || 0,
      fanSpeed: parseInt(parts[5]) || 0,
      clockSpeed: parseInt(parts[6]) || 0,
      memoryClockSpeed: parseInt(parts[7]) || 0,
      timestamp: Date.now(),
      processes,
    };
  } catch (error) {
    console.error(`Failed to get metrics for GPU ${gpuId}:`, error);
    return null;
  }
}

export function isNvidiaSmiAvailable(): boolean {
  return new Promise((resolve) => {
    const cmd = process.platform === 'win32'
      ? '"C:\\Program Files\\NVIDIA Corporation\\NVSMI\\nvidia-smi.exe" --version'
      : 'nvidia-smi --version';

    exec(cmd, { timeout: 5000 }, (error) => {
      resolve(!error);
    });
  });
}
