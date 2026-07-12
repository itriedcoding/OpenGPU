import React from 'react';
import StatusBadge from './StatusBadge';

interface RentalCardProps {
  rental: {
    id: string;
    gpuName: string;
    gpuModel: string;
    status: string;
    startedAt: string;
    endsAt: string;
    costPerHour: number;
    totalCost: number;
    provider: string;
  };
  onStop?: (id: string) => void;
  onExtend?: (id: string) => void;
}

export default function RentalCard({ rental, onStop, onExtend }: RentalCardProps) {
  const hoursRemaining = Math.max(0, Math.floor((new Date(rental.endsAt).getTime() - Date.now()) / (1000 * 60 * 60)));
  const totalHours = Math.floor((new Date(rental.endsAt).getTime() - new Date(rental.startedAt).getTime()) / (1000 * 60 * 60));

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.gpuInfo}>
          <h3 style={styles.gpuName}>{rental.gpuName}</h3>
          <span style={styles.gpuModel}>{rental.gpuModel}</span>
        </div>
        <StatusBadge status={rental.status} />
      </div>

      <div style={styles.metricsRow}>
        <div style={styles.metric}>
          <span style={styles.metricLabel}>Cost/hr</span>
          <span style={styles.metricValue}>${rental.costPerHour.toFixed(2)}</span>
        </div>
        <div style={styles.metric}>
          <span style={styles.metricLabel}>Total Cost</span>
          <span style={styles.metricValue}>${rental.totalCost.toFixed(2)}</span>
        </div>
        <div style={styles.metric}>
          <span style={styles.metricLabel}>Time Left</span>
          <span style={styles.metricValue}>{hoursRemaining}h / {totalHours}h</span>
        </div>
      </div>

      <div style={styles.timeBar}>
        <div
          style={{
            ...styles.timeFill,
            width: `${totalHours > 0 ? ((totalHours - hoursRemaining) / totalHours) * 100 : 0}%`,
          }}
        />
      </div>

      <div style={styles.footer}>
        <span style={styles.provider}>Provider: {rental.provider}</span>
        <div style={styles.actions}>
          {onExtend && rental.status === 'running' && (
            <button onClick={() => onExtend(rental.id)} style={styles.extendButton}>
              Extend
            </button>
          )}
          {onStop && rental.status === 'running' && (
            <button onClick={() => onStop(rental.id)} style={styles.stopButton}>
              Stop
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: '#14141e',
    borderRadius: '12px',
    border: '1px solid #27272a',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    transition: 'border-color 0.15s ease',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  gpuInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  gpuName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#e4e4e7',
    margin: 0,
  },
  gpuModel: {
    fontSize: '12px',
    color: '#71717a',
  },
  metricsRow: {
    display: 'flex',
    gap: '16px',
  },
  metric: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  metricLabel: {
    fontSize: '11px',
    color: '#71717a',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  metricValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#e4e4e7',
  },
  timeBar: {
    height: '4px',
    backgroundColor: '#27272a',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  timeFill: {
    height: '100%',
    backgroundColor: '#7c3aed',
    borderRadius: '2px',
    transition: 'width 0.5s ease',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  provider: {
    fontSize: '12px',
    color: '#71717a',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  extendButton: {
    padding: '6px 14px',
    borderRadius: '6px',
    border: '1px solid #27272a',
    backgroundColor: 'transparent',
    color: '#a1a1aa',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  stopButton: {
    padding: '6px 14px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
};
