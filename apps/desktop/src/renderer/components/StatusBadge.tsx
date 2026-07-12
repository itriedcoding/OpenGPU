import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  running: { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', label: 'Running' },
  active: { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', label: 'Active' },
  online: { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', label: 'Online' },
  available: { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', label: 'Available' },
  idle: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', label: 'Idle' },
  pending: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', label: 'Pending' },
  stopped: { color: '#71717a', bg: 'rgba(113, 113, 122, 0.1)', label: 'Stopped' },
  offline: { color: '#71717a', bg: 'rgba(113, 113, 122, 0.1)', label: 'Offline' },
  error: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', label: 'Error' },
  failed: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', label: 'Failed' },
  completed: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', label: 'Completed' },
  cancelled: { color: '#71717a', bg: 'rgba(113, 113, 122, 0.1)', label: 'Cancelled' },
};

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = statusConfig[status] || { color: '#71717a', bg: 'rgba(113, 113, 122, 0.1)', label: status };

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: size === 'sm' ? '3px 8px' : '5px 12px',
    borderRadius: '6px',
    backgroundColor: config.bg,
    color: config.color,
    fontSize: size === 'sm' ? '11px' : '13px',
    fontWeight: '500',
    lineHeight: 1,
    whiteSpace: 'nowrap',
  };

  const dotStyle: React.CSSProperties = {
    width: size === 'sm' ? '5px' : '6px',
    height: size === 'sm' ? '5px' : '6px',
    borderRadius: '50%',
    backgroundColor: config.color,
    flexShrink: 0,
  };

  return (
    <span style={baseStyle}>
      <span style={dotStyle} />
      {config.label}
    </span>
  );
}
