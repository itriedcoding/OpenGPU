import React, { useState, useEffect } from 'react';

interface GpuMetricsProps {
  gpuId: number;
  compact?: boolean;
}

interface MetricsData {
  utilization: number;
  memoryUsed: number;
  memoryTotal: number;
  temperature: number;
  powerDraw: number;
  fanSpeed: number;
  clockSpeed: number;
  memoryClockSpeed: number;
}

export default function GpuMetrics({ gpuId, compact = false }: GpuMetricsProps) {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchMetrics = async () => {
      try {
        const result = await window.electronAPI.gpu.metrics(gpuId);
        if (result.success && result.metrics) {
          setMetrics(result.metrics);
        }
      } catch (err) {
        console.error('Failed to fetch GPU metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    interval = setInterval(fetchMetrics, 2000);

    return () => clearInterval(interval);
  }, [gpuId]);

  if (loading || !metrics) {
    return (
      <div style={compact ? compactStyles.container : styles.container}>
        <div style={styles.loading}>Loading metrics...</div>
      </div>
    );
  }

  const memoryPercent = metrics.memoryTotal > 0
    ? Math.round((metrics.memoryUsed / metrics.memoryTotal) * 100)
    : 0;

  const getUtilizationColor = (value: number) => {
    if (value >= 90) return '#ef4444';
    if (value >= 70) return '#f59e0b';
    return '#22c55e';
  };

  const getTemperatureColor = (temp: number) => {
    if (temp >= 85) return '#ef4444';
    if (temp >= 70) return '#f59e0b';
    return '#3b82f6';
  };

  if (compact) {
    return (
      <div style={compactStyles.container}>
        <div style={compactStyles.metric}>
          <div style={compactStyles.metricHeader}>
            <span style={compactStyles.metricLabel}>GPU</span>
            <span style={{ ...compactStyles.metricValue, color: getUtilizationColor(metrics.utilization) }}>
              {metrics.utilization}%
            </span>
          </div>
          <div style={compactStyles.barTrack}>
            <div
              style={{
                ...compactStyles.barFill,
                width: `${metrics.utilization}%`,
                backgroundColor: getUtilizationColor(metrics.utilization),
              }}
            />
          </div>
        </div>

        <div style={compactStyles.metric}>
          <div style={compactStyles.metricHeader}>
            <span style={compactStyles.metricLabel}>MEM</span>
            <span style={compactStyles.metricValue}>{memoryPercent}%</span>
          </div>
          <div style={compactStyles.barTrack}>
            <div
              style={{
                ...compactStyles.barFill,
                width: `${memoryPercent}%`,
                backgroundColor: '#7c3aed',
              }}
            />
          </div>
        </div>

        <div style={compactStyles.statsRow}>
          <div style={compactStyles.stat}>
            <span style={compactStyles.statValue} style={{ color: getTemperatureColor(metrics.temperature) }}>
              {metrics.temperature}°C
            </span>
          </div>
          <div style={compactStyles.stat}>
            <span style={compactStyles.statValue}>{metrics.powerDraw}W</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.gaugeSection}>
        <div style={styles.gaugeContainer}>
          <svg viewBox="0 0 120 120" style={styles.gauge}>
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#27272a"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke={getUtilizationColor(metrics.utilization)}
              strokeWidth="8"
              strokeDasharray={`${(metrics.utilization / 100) * 314} 314`}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
            <text x="60" y="55" textAnchor="middle" fill="#e4e4e7" fontSize="22" fontWeight="700">
              {metrics.utilization}%
            </text>
            <text x="60" y="72" textAnchor="middle" fill="#71717a" fontSize="10">
              GPU Utilization
            </text>
          </svg>
        </div>
      </div>

      <div style={styles.detailsGrid}>
        <div style={styles.detailCard}>
          <div style={styles.detailHeader}>
            <span style={styles.detailLabel}>Memory</span>
            <span style={styles.detailValue}>{memoryPercent}%</span>
          </div>
          <div style={styles.memoryBar}>
            <div
              style={{
                ...styles.memoryFill,
                width: `${memoryPercent}%`,
                backgroundColor: memoryPercent > 90 ? '#ef4444' : '#7c3aed',
              }}
            />
          </div>
          <span style={styles.detailSub}>{metrics.memoryUsed} / {metrics.memoryTotal} MB</span>
        </div>

        <div style={styles.detailCard}>
          <div style={styles.detailHeader}>
            <span style={styles.detailLabel}>Temperature</span>
            <span style={{ ...styles.detailValue, color: getTemperatureColor(metrics.temperature) }}>
              {metrics.temperature}°C
            </span>
          </div>
          <div style={styles.thermometer}>
            <div
              style={{
                ...styles.thermometerFill,
                width: `${Math.min(metrics.temperature, 100)}%`,
                backgroundColor: getTemperatureColor(metrics.temperature),
              }}
            />
          </div>
        </div>

        <div style={styles.detailCard}>
          <div style={styles.detailHeader}>
            <span style={styles.detailLabel}>Power</span>
            <span style={styles.detailValue}>{metrics.powerDraw}W</span>
          </div>
          <div style={styles.powerBar}>
            <div
              style={{
                ...styles.powerFill,
                width: `${Math.min((metrics.powerDraw / 350) * 100, 100)}%`,
              }}
            />
          </div>
        </div>

        <div style={styles.detailCard}>
          <div style={styles.detailHeader}>
            <span style={styles.detailLabel}>Fan Speed</span>
            <span style={styles.detailValue}>{metrics.fanSpeed}%</span>
          </div>
          <div style={styles.fanContainer}>
            <div
              style={{
                ...styles.fanIcon,
                animationDuration: `${Math.max(0.5, 3 - (metrics.fanSpeed / 100) * 2.5)}s`,
              }}
            >
              🌀
            </div>
          </div>
        </div>

        <div style={styles.detailCard}>
          <div style={styles.detailHeader}>
            <span style={styles.detailLabel}>Clock Speed</span>
            <span style={styles.detailValue}>{metrics.clockSpeed} MHz</span>
          </div>
        </div>

        <div style={styles.detailCard}>
          <div style={styles.detailHeader}>
            <span style={styles.detailLabel}>Memory Clock</span>
            <span style={styles.detailValue}>{metrics.memoryClockSpeed} MHz</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#14141e',
    borderRadius: '12px',
    border: '1px solid #27272a',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  loading: {
    padding: '40px',
    textAlign: 'center',
    color: '#71717a',
  },
  gaugeSection: {
    display: 'flex',
    justifyContent: 'center',
    padding: '8px 0',
  },
  gaugeContainer: {
    width: '120px',
    height: '120px',
  },
  gauge: {
    width: '100%',
    height: '100%',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  detailCard: {
    backgroundColor: '#1a1a24',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  detailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: '12px',
    color: '#71717a',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  detailValue: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#e4e4e7',
  },
  detailSub: {
    fontSize: '11px',
    color: '#71717a',
  },
  memoryBar: {
    height: '4px',
    backgroundColor: '#27272a',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  memoryFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.5s ease',
  },
  thermometer: {
    height: '4px',
    backgroundColor: '#27272a',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  thermometerFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.5s ease',
  },
  powerBar: {
    height: '4px',
    backgroundColor: '#27272a',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  powerFill: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: '2px',
    transition: 'width 0.5s ease',
  },
  fanContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '24px',
  },
  fanIcon: {
    fontSize: '20px',
    animation: 'spin 2s linear infinite',
  },
};

const compactStyles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#1a1a24',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  metric: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  metricHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: '11px',
    color: '#71717a',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  metricValue: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#e4e4e7',
  },
  barTrack: {
    height: '4px',
    backgroundColor: '#27272a',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.5s ease',
  },
  statsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '4px',
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  statValue: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#a1a1aa',
  },
};
