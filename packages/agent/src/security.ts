import { RentalJob } from './types';
import { stopRental } from './rental-manager';
import logger from './logger';

interface SecurityViolation {
  rentalId: string;
  type: 'resource_abuse' | 'network_abuse' | 'unauthorized_access' | 'crypto_mining' | 'excessive_memory';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: Date;
}

const violationHistory: Map<string, SecurityViolation[]> = new Map();
const MAX_VIOLATIONS_PER_RENTAL = 3;
const MAX_VIOLATIONS_GLOBAL = 10;
let totalViolations = 0;

export function validateRentalSecurity(job: RentalJob): { valid: boolean; reason?: string } {
  if (!job.rentalId) {
    return { valid: false, reason: 'Missing rental ID' };
  }
  if (!job.image) {
    return { valid: false, reason: 'Missing Docker image' };
  }
  if (job.gpuCount <= 0) {
    return { valid: false, reason: 'Invalid GPU count' };
  }
  if (job.gpuIndices.length !== job.gpuCount) {
    return { valid: false, reason: 'GPU indices count mismatch' };
  }

  const allowedImages = [
    'nvidia/cuda:',
    'pytorch/pytorch:',
    'tensorflow/tensorflow:',
    'opengpu/',
    'ubuntu:',
    'continuumio/',
  ];
  const imageMatch = allowedImages.some((prefix) => job.image.startsWith(prefix));
  if (!imageMatch) {
    logger.warn('Untrusted image detected', { rentalId: job.rentalId, image: job.image });
  }

  return { valid: true };
}

export function reportViolation(rentalId: string, type: SecurityViolation['type'], severity: SecurityViolation['severity'], description: string): void {
  const violation: SecurityViolation = {
    rentalId,
    type,
    severity,
    description,
    timestamp: new Date(),
  };

  const violations = violationHistory.get(rentalId) || [];
  violations.push(violation);
  violationHistory.set(rentalId, violations);
  totalViolations++;

  logger.warn('Security violation reported', {
    rentalId,
    type,
    severity,
    description,
    totalViolations,
  });

  if (severity === 'critical' || violations.length >= MAX_VIOLATIONS_PER_RENTAL || totalViolations >= MAX_VIOLATIONS_GLOBAL) {
    logger.error('Auto-stopping rental due to security violations', { rentalId });
    stopRental(rentalId).catch((err) => {
      logger.error('Failed to stop rental after violation', { rentalId, error: err });
    });
  }
}

export function checkResourceAbuse(rentalId: string, metrics: { cpuUsage: number; memoryUsage: number }): void {
  if (metrics.cpuUsage > 95) {
    reportViolation(rentalId, 'resource_abuse', 'medium', `CPU usage at ${metrics.cpuUsage.toFixed(1)}%`);
  }
  if (metrics.memoryUsage > 95) {
    reportViolation(rentalId, 'excessive_memory', 'medium', `Memory usage at ${metrics.memoryUsage.toFixed(1)}%`);
  }
}

export function checkSuspiciousProcess(rentalId: string, processName: string): void {
  const suspiciousPatterns = [
    /xmrig/i,
    /minerd/i,
    /cpuminer/i,
    /ethminer/i,
    /nicehash/i,
    /cryptonight/i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(processName)) {
      reportViolation(rentalId, 'crypto_mining', 'critical', `Suspicious process detected: ${processName}`);
      return;
    }
  }
}

export function getViolationHistory(rentalId?: string): SecurityViolation[] {
  if (rentalId) {
    return violationHistory.get(rentalId) || [];
  }
  return Array.from(violationHistory.values()).flat();
}

export function cleanupViolationHistory(maxAge: number = 24 * 60 * 60 * 1000): void {
  const cutoff = Date.now() - maxAge;
  for (const [rentalId, violations] of violationHistory.entries()) {
    const recent = violations.filter((v) => v.timestamp.getTime() > cutoff);
    if (recent.length === 0) {
      violationHistory.delete(rentalId);
    } else {
      violationHistory.set(rentalId, recent);
    }
  }
}
