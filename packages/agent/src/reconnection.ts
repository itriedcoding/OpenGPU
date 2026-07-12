import logger from './logger';

export class ReconnectionManager {
  private baseDelay: number;
  private maxDelay: number;
  private maxRetries: number;
  private currentRetries: number = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private onReconnect: () => Promise<void>;
  private onGiveUp: () => void;
  private isConnected: boolean = true;

  constructor(
    onReconnect: () => Promise<void>,
    onGiveUp: () => void,
    baseDelay = 1000,
    maxDelay = 60000,
    maxRetries = Infinity
  ) {
    this.baseDelay = baseDelay;
    this.maxDelay = maxDelay;
    this.maxRetries = maxRetries;
    this.onReconnect = onReconnect;
    this.onGiveUp = onGiveUp;
  }

  markDisconnected(): void {
    this.isConnected = false;
    this.scheduleReconnect();
  }

  markConnected(): void {
    this.isConnected = true;
    this.currentRetries = 0;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }

    if (this.currentRetries >= this.maxRetries) {
      logger.error('Max reconnection attempts reached, giving up');
      this.onGiveUp();
      return;
    }

    const delay = this.getDelay();
    this.currentRetries++;

    logger.info('Scheduling reconnection', {
      attempt: this.currentRetries,
      delayMs: delay,
    });

    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      try {
        await this.onReconnect();
        this.markConnected();
        logger.info('Reconnection successful');
      } catch (err) {
        logger.error('Reconnection failed', { attempt: this.currentRetries, error: err });
        this.scheduleReconnect();
      }
    }, delay);
  }

  private getDelay(): number {
    const jitter = Math.random() * 0.3 + 0.85;
    const delay = this.baseDelay * Math.pow(2, Math.min(this.currentRetries, 20));
    return Math.min(delay, this.maxDelay) * jitter;
  }

  stop(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  getRetries(): number {
    return this.currentRetries;
  }

  getIsConnected(): boolean {
    return this.isConnected;
  }
}
