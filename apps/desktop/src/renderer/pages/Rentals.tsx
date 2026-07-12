import React, { useState, useEffect } from 'react';
import RentalCard from '../components/RentalCard';

interface Rental {
  id: string;
  gpuName: string;
  gpuModel: string;
  status: string;
  startedAt: string;
  endsAt: string;
  costPerHour: number;
  totalCost: number;
  provider: string;
}

export default function Rentals() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  useEffect(() => {
    const mockRentals: Rental[] = [
      {
        id: 'r1',
        gpuName: 'NVIDIA RTX 4090',
        gpuModel: 'RTX 4090',
        status: 'running',
        startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        endsAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        costPerHour: 0.45,
        totalCost: 3.60,
        provider: 'GPUFarm-Pro',
      },
      {
        id: 'r2',
        gpuName: 'NVIDIA A100 80GB',
        gpuModel: 'A100',
        status: 'running',
        startedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        endsAt: new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString(),
        costPerHour: 1.20,
        totalCost: 1.20,
        provider: 'CloudGPU',
      },
      {
        id: 'r3',
        gpuName: 'NVIDIA RTX 3090',
        gpuModel: 'RTX 3090',
        status: 'completed',
        startedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        endsAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        costPerHour: 0.30,
        totalCost: 7.20,
        provider: 'GPUBurst',
      },
    ];

    setTimeout(() => {
      setRentals(mockRentals);
      setLoading(false);
    }, 500);
  }, []);

  const handleStop = async (rentalId: string) => {
    setRentals((prev) =>
      prev.map((r) => (r.id === rentalId ? { ...r, status: 'stopping' } : r))
    );
    setTimeout(() => {
      setRentals((prev) =>
        prev.map((r) => (r.id === rentalId ? { ...r, status: 'completed' } : r))
      );
    }, 1000);
  };

  const handleExtend = (rentalId: string) => {
    alert(`Extend rental ${rentalId}`);
  };

  const filteredRentals = rentals.filter((r) => {
    if (activeTab === 'active') return r.status === 'running' || r.status === 'stopping';
    return r.status === 'completed' || r.status === 'cancelled';
  });

  const activeRentals = rentals.filter((r) => r.status === 'running');
  const totalSpent = activeRentals.reduce((sum, r) => sum + r.totalCost, 0);
  const totalHourlyRate = activeRentals.reduce((sum, r) => sum + r.costPerHour, 0);

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner} />
        <p>Loading rentals...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Rentals</h1>
          <p style={styles.subtitle}>Manage your active GPU rentals</p>
        </div>
      </div>

      <div style={styles.summaryCards}>
        <div style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Active Rentals</span>
          <span style={styles.summaryValue}>{activeRentals.length}</span>
        </div>
        <div style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Hourly Cost</span>
          <span style={styles.summaryValue}>${totalHourlyRate.toFixed(2)}</span>
        </div>
        <div style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Current Total</span>
          <span style={styles.summaryValue}>${totalSpent.toFixed(2)}</span>
        </div>
      </div>

      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab('active')}
          style={{
            ...styles.tab,
            ...(activeTab === 'active' ? styles.tabActive : {}),
          }}
        >
          Active ({rentals.filter((r) => r.status === 'running').length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          style={{
            ...styles.tab,
            ...(activeTab === 'completed' ? styles.tabActive : {}),
          }}
        >
          Completed ({rentals.filter((r) => r.status === 'completed').length})
        </button>
      </div>

      {filteredRentals.length === 0 ? (
        <div style={styles.emptyState}>
          <span style={{ fontSize: '48px' }}>📋</span>
          <h2 style={styles.emptyTitle}>No {activeTab} rentals</h2>
          <p style={styles.emptyText}>
            {activeTab === 'active'
              ? 'Browse the marketplace to rent a GPU'
              : 'Your completed rentals will appear here'}
          </p>
        </div>
      ) : (
        <div style={styles.rentalGrid}>
          {filteredRentals.map((rental) => (
            <RentalCard
              key={rental.id}
              rental={rental}
              onStop={rental.status === 'running' ? handleStop : undefined}
              onExtend={rental.status === 'running' ? handleExtend : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#e4e4e7',
    margin: '0 0 6px 0',
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
  summaryCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '24px',
  },
  summaryCard: {
    backgroundColor: '#14141e',
    borderRadius: '10px',
    border: '1px solid #27272a',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  summaryLabel: {
    fontSize: '12px',
    color: '#71717a',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  summaryValue: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#e4e4e7',
  },
  tabs: {
    display: 'flex',
    gap: '4px',
    marginBottom: '20px',
    backgroundColor: '#14141e',
    borderRadius: '10px',
    padding: '4px',
    border: '1px solid #27272a',
  },
  tab: {
    flex: 1,
    padding: '8px 16px',
    borderRadius: '7px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#71717a',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  tabActive: {
    backgroundColor: '#1a1a24',
    color: '#e4e4e7',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '60px 20px',
    textAlign: 'center',
    backgroundColor: '#14141e',
    borderRadius: '12px',
    border: '1px solid #27272a',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#e4e4e7',
    margin: 0,
  },
  emptyText: {
    fontSize: '14px',
    color: '#71717a',
    margin: 0,
  },
  rentalGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
};
