import si from 'systeminformation';
import { Metrics, GPUMetrics, CPUMetrics, MemoryMetrics, DiskMetrics, NetworkMetrics } from './types';
import { refreshGPUs } from './gpu-detector';
import logger from './logger';

let previousNetworkStats: { rxBytes: number; txBytes: number; timestamp: number } | null = null;
let previousDiskStats: { readBytes: number; writeBytes: number; timestamp: number } | null = null;

export async function collectMetrics(nodeId: string, gpus: import('./types').GPUInfo[], networkInterface: string): Promise<Metrics> {
  const timestamp = new Date();

  const [gpuMetrics, cpuMetrics, memMetrics, diskMetrics, netMetrics] = await Promise.all([
    collectGPUMetrics(gpus),
    collectCPUMetrics(),
    collectMemoryMetrics(),
    collectDiskMetrics(),
    collectNetworkMetrics(networkInterface),
  ]);

  return {
    timestamp,
    nodeId,
    gpus: gpuMetrics,
    cpu: cpuMetrics,
    memory: memMetrics,
    disk: diskMetrics,
    network: netMetrics,
  };
}

async function collectGPUMetrics(gpus: import('./types').GPUInfo[]): Promise<GPUMetrics[]> {
  const refreshed = refreshGPUs(gpus);
  return refreshed.map((gpu) => ({
    index: gpu.index,
    utilization: gpu.utilization,
    memoryUsed: gpu.memoryUsed,
    memoryTotal: gpu.memoryTotal,
    temperature: gpu.temperature,
    powerDraw: gpu.powerDraw,
  }));
}

async function collectCPUMetrics(): Promise<CPUMetrics> {
  try {
    const [load, cpuInfo, temp] = await Promise.all([
      si.currentLoad(),
      si.cpu(),
      si.cpuTemperature(),
    ]);

    return {
      model: cpuInfo.brand || cpuInfo.manufacturer || 'unknown',
      cores: cpuInfo.cores,
      usage: load.currentLoad,
      temperature: temp.main || 0,
    };
  } catch (err) {
    logger.error('Failed to collect CPU metrics', { error: err });
    return { model: 'unknown', cores: 0, usage: 0, temperature: 0 };
  }
}

async function collectMemoryMetrics(): Promise<MemoryMetrics> {
  try {
    const mem = await si.mem();
    return {
      total: mem.total,
      used: mem.used,
      free: mem.free,
      usagePercent: (mem.used / mem.total) * 100,
    };
  } catch (err) {
    logger.error('Failed to collect memory metrics', { error: err });
    return { total: 0, used: 0, free: 0, usagePercent: 0 };
  }
}

async function collectDiskMetrics(): Promise<DiskMetrics> {
  try {
    const [fsSize, diskIO] = await Promise.all([
      si.fsSize(),
      si.diskIO(),
    ]);

    const mainFs = fsSize.find((fs) => fs.mount === '/') || fsSize[0] || { size: 0, used: 0, available: 0 };
    const now = Date.now();

    let readBytes = diskIO.readBytes || 0;
    let writeBytes = diskIO.writeBytes || 0;

    if (previousDiskStats) {
      const elapsed = (now - previousDiskStats.timestamp) / 1000;
      if (elapsed > 0) {
        readBytes = Math.max(0, readBytes - previousDiskStats.readBytes);
        writeBytes = Math.max(0, writeBytes - previousDiskStats.writeBytes);
      }
    }

    previousDiskStats = { readBytes: diskIO.readBytes || 0, writeBytes: diskIO.writeBytes || 0, timestamp: now };

    return {
      total: mainFs.size,
      used: mainFs.used,
      free: mainFs.available,
      readBytes,
      writeBytes,
    };
  } catch (err) {
    logger.error('Failed to collect disk metrics', { error: err });
    return { total: 0, used: 0, free: 0, readBytes: 0, writeBytes: 0 };
  }
}

async function collectNetworkMetrics(iface: string): Promise<NetworkMetrics> {
  try {
    const stats = await si.networkStats(iface);
    const primary = stats.find((s) => s.iface === iface) || stats[0] || { iface: 'unknown', rx_bytes: 0, tx_bytes: 0 };
    const now = Date.now();

    let rxRate = 0;
    let txRate = 0;

    if (previousNetworkStats) {
      const elapsed = (now - previousNetworkStats.timestamp) / 1000;
      if (elapsed > 0) {
        rxRate = Math.max(0, (primary.rx_bytes - previousNetworkStats.rxBytes) / elapsed);
        txRate = Math.max(0, (primary.tx_bytes - previousNetworkStats.txBytes) / elapsed);
      }
    }

    previousNetworkStats = { rxBytes: primary.rx_bytes, txBytes: primary.tx_bytes, timestamp: now };

    return {
      interface: primary.iface,
      rxBytes: primary.rx_bytes,
      txBytes: primary.tx_bytes,
      rxRate,
      txRate,
    };
  } catch (err) {
    logger.error('Failed to collect network metrics', { error: err });
    return { interface: iface, rxBytes: 0, txBytes: 0, rxRate: 0, txRate: 0 };
  }
}
