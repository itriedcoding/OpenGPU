import { HeartbeatData, NodeStatus } from './types';
import logger from './logger';

export class HeartbeatManager {
  private interval: NodeJS.Timeout | null = null;
  private intervalMs: number;
  private nodeId: string;
  private getStatus: () => Promise<NodeStatus>;
  private onHeartbeat: (data: HeartbeatData) => Promise<void>;
  private consecutiveFailures: number = 0;
  private maxBackoff: number = 60000;
  private baseBackoff: number = 1000;

  constructor(
    nodeId: string,
    intervalMs: number,
    getStatus: () => Promise<NodeStatus>,
    onHeartbeat: (data: HeartbeatData) => Promise<void>
  ) {
    this.nodeId = nodeId;
    this.intervalMs = intervalMs;
    this.getStatus = getStatus;
    this.onHeartbeat = onHeartbeat;
  }

  start(): void {
    if (this.interval) {
      logger.warn('Heartbeat already running');
      return;
    }

    logger.info('Starting heartbeat manager', { intervalMs: this.intervalMs });
    this.scheduleNext();
  }

  stop(): void {
    if (this.interval) {
      clearTimeout(this.interval);
      this.interval = null;
      logger.info('Heartbeat manager stopped');
    }
  }

  private scheduleNext(): void {
    const backoff = this.getBackoffDelay();
    this.interval = setTimeout(() => this.sendHeartbeat(), backoff);
  }

  private getBackoffDelay(): number {
    if (this.consecutiveFailures === 0) {
      return this.intervalMs;
    }
    const delay = this.baseBackoff * Math.pow(2, Math.min(this.consecutiveFailures - 1, 10));
    return Math.min(delay, this.maxBackoff);
  }

  private async sendHeartbeat(): Promise<void> {
    try {
      const status = await this.getStatus();

      const heartbeat: HeartbeatData = {
        nodeId: this.nodeId,
        status: status.status,
        gpuCount: status.gpus.length,
        activeRentals: status.activeRentals,
        maxRentals: status.maxRentals,
        timestamp: new Date(),
      };

      await this.onHeartbeat(heartbeat);
      this.consecutiveFailures = 0;
      logger.debug('Heartbeat sent', { nodeId: this.nodeId, status: heartbeat.status });
    } catch (err) {
      this.consecutiveFailures++;
      logger.error('Heartbeat failed', {
        nodeId: this.nodeId,
        failures: this.consecutiveFailures,
        error: err,
      });
    } finally {
      this.scheduleNext();
    }
  }

  getConsecutiveFailures(): number {
    return this.consecutiveFailures;
  }
}
