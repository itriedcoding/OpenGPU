import { NetworkMetrics } from './types';
import logger from './logger';

interface BandwidthAllocation {
  rentalId: string;
  maxRxBytes: number;
  maxTxBytes: number;
  rxUsed: number;
  txUsed: number;
}

const allocations: Map<string, BandwidthAllocation> = new Map();
let globalRxBytes = 0;
let globalTxBytes = 0;

export function setBandwidthLimit(rentalId: string, maxBandwidthBps: number): void {
  allocations.set(rentalId, {
    rentalId,
    maxRxBytes: maxBandwidthBps,
    maxTxBytes: maxBandwidthBps,
    rxUsed: 0,
    txUsed: 0,
  });
  logger.info('Bandwidth limit set', { rentalId, maxBandwidthBps });
}

export function removeBandwidthLimit(rentalId: string): void {
  allocations.delete(rentalId);
  logger.info('Bandwidth limit removed', { rentalId });
}

export function updateBandwidthUsage(rentalId: string, rxBytes: number, txBytes: number): void {
  const alloc = allocations.get(rentalId);
  if (alloc) {
    alloc.rxUsed += rxBytes;
    alloc.txUsed += txBytes;
  }
  globalRxBytes += rxBytes;
  globalTxBytes += txBytes;
}

export function checkBandwidthLimit(rentalId: string): { allowed: boolean; reason?: string } {
  const alloc = allocations.get(rentalId);
  if (!alloc) {
    return { allowed: true };
  }

  if (alloc.maxRxBytes > 0 && alloc.rxUsed >= alloc.maxRxBytes) {
    return { allowed: false, reason: 'Rx bandwidth limit exceeded' };
  }
  if (alloc.maxTxBytes > 0 && alloc.txUsed >= alloc.maxTxBytes) {
    return { allowed: false, reason: 'Tx bandwidth limit exceeded' };
  }

  return { allowed: true };
}

export function getNetworkStats(): { globalRxBytes: number; globalTxBytes: number; allocations: BandwidthAllocation[] } {
  return {
    globalRxBytes,
    globalTxBytes,
    allocations: Array.from(allocations.values()),
  };
}

export function resetBandwidthCounters(): void {
  for (const alloc of allocations.values()) {
    alloc.rxUsed = 0;
    alloc.txUsed = 0;
  }
}

export async function applyTrafficRules(metrics: NetworkMetrics): Promise<void> {
  logger.debug('Traffic rules applied', {
    rxRate: metrics.rxRate,
    txRate: metrics.txRate,
    activeAllocations: allocations.size,
  });
}
