import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GpuMetrics from '../components/GpuMetrics';
import StatusBadge from '../components/StatusBadge';

interface DashboardStats {
  activeRentals: number;
  totalEarnings: number;
  gpuNodes: number;
  totalUsage: number;
}

interface Activity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    activeRentals: 0,
    totalEarnings: 0,
    gpuNodes: 0,
    totalUsage: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [gpus, setGpus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const gpuResult = await window.electronAPI.gpu.detect();
        if (gpuResult.success) {
          setGpus(gpuResult.gpus);
        }

        setStats({
          activeRentals: 2,
          totalEarnings: 127.50,
          gpuNodes: gpuResult.gpus?.length || 0,
          totalUsage: 45,
        });

        setActivities([
          { id: '1', type: 'rental', message: 'Rental #1234 started on RTX 4090', timestamp: '2 minutes ago' },
          { id: '2', type: 'payment', message: 'Payment received: $12.50', timestamp: '15 minutes ago' },
          { id: '3', type: 'gpu', message: 'GPU node "node-01" went online', timestamp: '1 hour ago' },
          { id: '4', type: 'rental', message: 'Rental #1233 completed', timestamp: '3 hours ago' },
          { id: '5', type: 'system', message: 'System update available', timestamp: '5 hours ago' },
        ]);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const quickActions = [
    { label: 'Browse Marketplace', path: '/marketplace', icon: '🛒', color: '#7c3aed' },
    { label: 'My GPUs', path: '/my-gpus', icon: '🖥️', color: '#3b82f6' },
    { label: 'View Rentals', path: '/rentals', icon: '📋', color: '#22c55e' },
    { label: 'Settings', path: '/settings', icon: '⚙️', color: '#f59e0b' },
  ];

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner} />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Welcome back, {userName}</h1>
          <p style={styles.subtitle}>Here's what's happening with your GPUs</p>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: 'rgba(124, 58, 237, 0.1)' }}>
            <span style={{ fontSize: '20px' }}>⚡</span>
          </div>
          <div style={styles.statInfo}>
            <span style={styles.statValue}>{stats.activeRentals}</span>
            <span style={styles.statLabel}>Active Rentals</span>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
            <span style={{ fontSize: '20px' }}>💰</span>
          </div>
          <div style={styles.statInfo}>
            <span style={styles.statValue}>${stats.totalEarnings.toFixed(2)}</span>
            <span style={styles.statLabel}>Total Earnings</span>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
            <span style={{ fontSize: '20px' }}>🖥️</span>
          </div>
          <div style={styles.statInfo}>
            <span style={styles.statValue}>{stats.gpuNodes}</span>
            <span style={styles.statLabel}>GPU Nodes</span>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
            <span style={{ fontSize: '20px' }}>📊</span>
          </div>
          <div style={styles.statInfo}>
            <span style={styles.statValue}>{stats.totalUsage}%</span>
            <span style={styles.statLabel}>Total Usage</span>
          </div>
        </div>
      </div>

      <div style={styles.contentGrid}>
        <div style={styles.leftColumn}>
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Detected GPUs</h2>
            {gpus.length === 0 ? (
              <div style={styles.emptyState}>
                <span style={{ fontSize: '32px' }}>🔍</span>
                <p>No NVIDIA GPUs detected</p>
                <p style={{ fontSize: '12px', color: '#71717a' }}>Install nvidia-smi and ensure GPU drivers are up to date</p>
              </div>
            ) : (
              <div style={styles.gpuList}>
                {gpus.map((gpu) => (
                  <div key={gpu.id} style={styles.gpuCard}>
                    <div style={styles.gpuHeader}>
                      <div>
                        <h3 style={styles.gpuName}>{gpu.name}</h3>
                        <span style={styles.gpuId}>GPU {gpu.id}</span>
                      </div>
                      <StatusBadge status={gpu.utilization > 0 ? 'running' : 'idle'} />
                    </div>
                    <GpuMetrics gpuId={gpu.id} compact />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Quick Actions</h2>
            <div style={styles.actionsGrid}>
              {quickActions.map((action) => (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  style={styles.actionCard}
                >
                  <span style={styles.actionIcon}>{action.icon}</span>
                  <span style={styles.actionLabel}>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={styles.rightColumn}>
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Recent Activity</h2>
            <div style={styles.activityList}>
              {activities.map((activity) => (
                <div key={activity.id} style={styles.activityItem}>
                  <div style={styles.activityDot} />
                  <div style={styles.activityContent}>
                    <p style={styles.activityMessage}>{activity.message}</p>
                    <span style={styles.activityTime}>{activity.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '28px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#e4e4e7',
    margin: '0 0 6px 0',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: '14px',
    color: '#71717a',
    margin: 0,
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    height: '60vh',
    color: '#71717a',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #27272a',
    borderTopColor: '#7c3aed',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '28px',
  },
  statCard: {
    backgroundColor: '#14141e',
    borderRadius: '12px',
    border: '1px solid #27272a',
    padding: '18px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  statIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  statValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#e4e4e7',
  },
  statLabel: {
    fontSize: '12px',
    color: '#71717a',
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '20px',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  section: {
    backgroundColor: '#14141e',
    borderRadius: '12px',
    border: '1px solid #27272a',
    padding: '20px',
  },
  sectionTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#e4e4e7',
    margin: '0 0 16px 0',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '32px',
    textAlign: 'center',
    color: '#a1a1aa',
  },
  gpuList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  gpuCard: {
    backgroundColor: '#1a1a24',
    borderRadius: '10px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  gpuHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gpuName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#e4e4e7',
    margin: 0,
  },
  gpuId: {
    fontSize: '12px',
    color: '#71717a',
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
  },
  actionCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px',
    borderRadius: '10px',
    border: '1px solid #27272a',
    backgroundColor: '#1a1a24',
    color: '#e4e4e7',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    textAlign: 'left',
  },
  actionIcon: {
    fontSize: '20px',
  },
  actionLabel: {
    flex: 1,
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  activityItem: {
    display: 'flex',
    gap: '10px',
  },
  activityDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#7c3aed',
    marginTop: '5px',
    flexShrink: 0,
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    fontSize: '13px',
    color: '#e4e4e7',
    margin: '0 0 3px 0',
    lineHeight: 1.4,
  },
  activityTime: {
    fontSize: '11px',
    color: '#71717a',
  },
};
