import React, { useState, useEffect } from 'react';
import GpuMetrics from '../components/GpuMetrics';
import StatusBadge from '../components/StatusBadge';

interface GpuNode {
  id: string;
  name: string;
  model: string;
  memory: number;
  status: 'running' | 'stopped' | 'error';
  pricePerHour: number;
  totalEarnings: number;
  totalHours: number;
  gpuId: number;
}

export default function MyGpus() {
  const [nodes, setNodes] = useState<GpuNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentRunning, setAgentRunning] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [startingNode, setStartingNode] = useState<string | null>(null);

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const result = await window.electronAPI.gpu.detect();
        if (result.success && result.gpus.length > 0) {
          const detectedNodes: GpuNode[] = result.gpus.map((gpu: any, index: number) => ({
            id: `node-${gpu.id}`,
            name: `Node ${index + 1}`,
            model: gpu.name,
            memory: gpu.memoryTotal,
            status: 'stopped' as const,
            pricePerHour: 0.30 + (gpu.memoryTotal / 10000) * 0.2,
            totalEarnings: Math.random() * 100,
            totalHours: Math.floor(Math.random() * 200),
            gpuId: gpu.id,
          }));
          setNodes(detectedNodes);
        }

        const agentStatus = await window.electronAPI.gpu.agentStatus();
        setAgentRunning(agentStatus.running);
      } catch (err) {
        console.error('Failed to fetch GPU nodes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNodes();
  }, []);

  const handleStartNode = async (node: GpuNode) => {
    setStartingNode(node.id);
    try {
      const result = await window.electronAPI.gpu.startAgent({
        gpuId: node.gpuId,
        port: 8888 + node.gpuId,
      });

      if (result.success) {
        setNodes((prev) =>
          prev.map((n) => (n.id === node.id ? { ...n, status: 'running' as const } : n))
        );
        setAgentRunning(true);
      }
    } catch (err) {
      console.error('Failed to start node:', err);
    } finally {
      setStartingNode(null);
    }
  };

  const handleStopNode = async (node: GpuNode) => {
    try {
      await window.electronAPI.gpu.stopAgent();
      setNodes((prev) =>
        prev.map((n) => (n.id === node.id ? { ...n, status: 'stopped' as const } : n))
      );
      setAgentRunning(false);
    } catch (err) {
      console.error('Failed to stop node:', err);
    }
  };

  const formatMemory = (mb: number) => {
    if (mb >= 1024) return `${(mb / 1024).toFixed(0)}GB`;
    return `${mb}MB`;
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner} />
        <p>Detecting GPUs...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My GPU Nodes</h1>
          <p style={styles.subtitle}>Manage your GPU sharing nodes</p>
        </div>
        <div style={styles.headerActions}>
          <div style={styles.agentStatus}>
            <div style={{ ...styles.agentDot, backgroundColor: agentRunning ? '#22c55e' : '#71717a' }} />
            <span style={styles.agentStatusText}>
              Agent {agentRunning ? 'Running' : 'Stopped'}
            </span>
          </div>
        </div>
      </div>

      {nodes.length === 0 ? (
        <div style={styles.emptyState}>
          <span style={{ fontSize: '48px' }}>🖥️</span>
          <h2 style={styles.emptyTitle}>No GPU nodes detected</h2>
          <p style={styles.emptyText}>
            Install NVIDIA drivers and nvidia-smi to detect your GPUs
          </p>
        </div>
      ) : (
        <div style={styles.grid}>
          {nodes.map((node) => (
            <div
              key={node.id}
              style={{
                ...styles.nodeCard,
                ...(selectedNode === node.id ? styles.nodeCardSelected : {}),
              }}
              onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
            >
              <div style={styles.nodeHeader}>
                <div>
                  <h3 style={styles.nodeName}>{node.name}</h3>
                  <span style={styles.nodeModel}>{node.model}</span>
                </div>
                <StatusBadge status={node.status === 'running' ? 'running' : node.status === 'error' ? 'error' : 'stopped'} />
              </div>

              <div style={styles.nodeStats}>
                <div style={styles.nodeStat}>
                  <span style={styles.nodeStatLabel}>Memory</span>
                  <span style={styles.nodeStatValue}>{formatMemory(node.memory)}</span>
                </div>
                <div style={styles.nodeStat}>
                  <span style={styles.nodeStatLabel}>Rate</span>
                  <span style={styles.nodeStatValue}>${node.pricePerHour.toFixed(2)}/hr</span>
                </div>
                <div style={styles.nodeStat}>
                  <span style={styles.nodeStatLabel}>Earnings</span>
                  <span style={styles.nodeStatValue}>${node.totalEarnings.toFixed(2)}</span>
                </div>
                <div style={styles.nodeStat}>
                  <span style={styles.nodeStatLabel}>Hours</span>
                  <span style={styles.nodeStatValue}>{node.totalHours}h</span>
                </div>
              </div>

              {selectedNode === node.id && (
                <div style={styles.metricsSection}>
                  <GpuMetrics gpuId={node.gpuId} />
                </div>
              )}

              <div style={styles.nodeActions}>
                {node.status === 'running' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStopNode(node);
                    }}
                    style={styles.stopButton}
                  >
                    Stop Sharing
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartNode(node);
                    }}
                    disabled={startingNode === node.id}
                    style={styles.startButton}
                  >
                    {startingNode === node.id ? 'Starting...' : 'Start Sharing'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '28px',
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
  headerActions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  agentStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    borderRadius: '8px',
    backgroundColor: '#14141e',
    border: '1px solid #27272a',
  },
  agentDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  agentStatusText: {
    fontSize: '13px',
    color: '#a1a1aa',
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
    maxWidth: '400px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '16px',
  },
  nodeCard: {
    backgroundColor: '#14141e',
    borderRadius: '12px',
    border: '1px solid #27272a',
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    cursor: 'pointer',
    transition: 'border-color 0.15s ease',
  },
  nodeCardSelected: {
    borderColor: '#7c3aed',
  },
  nodeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nodeName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#e4e4e7',
    margin: '0 0 3px 0',
  },
  nodeModel: {
    fontSize: '12px',
    color: '#71717a',
  },
  nodeStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
  },
  nodeStat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  nodeStatLabel: {
    fontSize: '11px',
    color: '#71717a',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  nodeStatValue: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#e4e4e7',
  },
  metricsSection: {
    animation: 'slideUp 0.2s ease',
  },
  nodeActions: {
    display: 'flex',
    gap: '10px',
  },
  startButton: {
    flex: 1,
    padding: '10px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.15s ease',
  },
  stopButton: {
    flex: 1,
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
};
