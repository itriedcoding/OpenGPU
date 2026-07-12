import React, { useState, useEffect } from 'react';
import StatusBadge from '../components/StatusBadge';

interface GpuListing {
  id: string;
  name: string;
  model: string;
  memory: number;
  pricePerHour: number;
  provider: string;
  rating: number;
  location: string;
  status: string;
  features: string[];
}

export default function Marketplace() {
  const [listings, setListings] = useState<GpuListing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState('all');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [rentalModal, setRentalModal] = useState<GpuListing | null>(null);
  const [rentalDuration, setRentalDuration] = useState(1);
  const [renting, setRenting] = useState(false);

  const gpuModels = ['all', 'RTX 4090', 'RTX 4080', 'RTX 3090', 'A100', 'H100', 'L40'];

  useEffect(() => {
    const mockListings: GpuListing[] = [
      {
        id: '1',
        name: 'NVIDIA RTX 4090',
        model: 'RTX 4090',
        memory: 24576,
        pricePerHour: 0.45,
        provider: 'GPUFarm-Pro',
        rating: 4.9,
        location: 'US-East',
        status: 'available',
        features: ['CUDA 12.2', '24GB GDDR6X', 'NVLink'],
      },
      {
        id: '2',
        name: 'NVIDIA A100 80GB',
        model: 'A100',
        memory: 81920,
        pricePerHour: 1.20,
        provider: 'CloudGPU',
        rating: 4.8,
        location: 'EU-West',
        status: 'available',
        features: ['CUDA 12.1', '80GB HBM2e', 'NVLink'],
      },
      {
        id: '3',
        name: 'NVIDIA H100',
        model: 'H100',
        memory: 81920,
        pricePerHour: 2.50,
        provider: 'AICompute',
        rating: 5.0,
        location: 'US-West',
        status: 'available',
        features: ['CUDA 12.3', '80GB HBM3', 'NVLink', 'Transformer Engine'],
      },
      {
        id: '4',
        name: 'NVIDIA RTX 3090',
        model: 'RTX 3090',
        memory: 24576,
        pricePerHour: 0.30,
        provider: 'GPUBurst',
        rating: 4.6,
        location: 'Asia-East',
        status: 'available',
        features: ['CUDA 11.8', '24GB GDDR6X'],
      },
      {
        id: '5',
        name: 'NVIDIA RTX 4080',
        model: 'RTX 4080',
        memory: 16384,
        pricePerHour: 0.35,
        provider: 'GPUFarm-Pro',
        rating: 4.7,
        location: 'US-East',
        status: 'busy',
        features: ['CUDA 12.2', '16GB GDDR6X'],
      },
      {
        id: '6',
        name: 'NVIDIA L40',
        model: 'L40',
        memory: 49152,
        pricePerHour: 0.90,
        provider: 'NeuralCloud',
        rating: 4.5,
        location: 'EU-Central',
        status: 'available',
        features: ['CUDA 12.1', '48GB GDDR6', 'RT Cores'],
      },
    ];

    setTimeout(() => {
      setListings(mockListings);
      setLoading(false);
    }, 500);
  }, []);

  const filteredListings = listings.filter((gpu) => {
    const matchesSearch = !searchQuery ||
      gpu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gpu.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gpu.provider.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesModel = selectedModel === 'all' || gpu.model === selectedModel;

    const matchesPrice = !maxPrice || gpu.pricePerHour <= parseFloat(maxPrice);

    return matchesSearch && matchesModel && matchesPrice;
  });

  const handleRent = async (listing: GpuListing) => {
    setRenting(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      setRentalModal(null);
      alert(`Rental started for ${listing.name} (${rentalDuration}h)`);
    } catch (err) {
      alert('Failed to start rental');
    } finally {
      setRenting(false);
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
        <p>Loading marketplace...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>GPU Marketplace</h1>
        <p style={styles.subtitle}>Browse and rent GPU power from providers worldwide</p>
      </div>

      <div style={styles.filters}>
        <input
          type="text"
          placeholder="Search GPUs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          style={styles.select}
        >
          {gpuModels.map((model) => (
            <option key={model} value={model}>
              {model === 'all' ? 'All Models' : model}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Max $/hr"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          style={styles.priceInput}
        />
      </div>

      <div style={styles.resultsInfo}>
        <span style={styles.resultsCount}>{filteredListings.length} GPUs available</span>
      </div>

      <div style={styles.grid}>
        {filteredListings.map((gpu) => (
          <div key={gpu.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h3 style={styles.gpuName}>{gpu.name}</h3>
                <span style={styles.provider}>{gpu.provider}</span>
              </div>
              <StatusBadge status={gpu.status === 'busy' ? 'idle' : gpu.status} />
            </div>

            <div style={styles.cardStats}>
              <div style={styles.stat}>
                <span style={styles.statLabel}>Memory</span>
                <span style={styles.statValue}>{formatMemory(gpu.memory)}</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statLabel}>Location</span>
                <span style={styles.statValue}>{gpu.location}</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statLabel}>Rating</span>
                <span style={styles.statValue}>⭐ {gpu.rating}</span>
              </div>
            </div>

            <div style={styles.features}>
              {gpu.features.map((feature) => (
                <span key={feature} style={styles.featureTag}>{feature}</span>
              ))}
            </div>

            <div style={styles.cardFooter}>
              <div style={styles.price}>
                <span style={styles.priceValue}>${gpu.pricePerHour.toFixed(2)}</span>
                <span style={styles.priceUnit}>/hour</span>
              </div>
              <button
                onClick={() => setRentalModal(gpu)}
                disabled={gpu.status === 'busy'}
                style={{
                  ...styles.rentButton,
                  ...(gpu.status === 'busy' ? styles.rentButtonDisabled : {}),
                }}
              >
                {gpu.status === 'busy' ? 'Unavailable' : 'Rent Now'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {rentalModal && (
        <div style={styles.modalOverlay} onClick={() => setRentalModal(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Rent GPU</h2>
            <p style={styles.modalSubtitle}>{rentalModal.name}</p>

            <div style={styles.modalInfo}>
              <div style={styles.modalInfoRow}>
                <span>Provider</span>
                <span>{rentalModal.provider}</span>
              </div>
              <div style={styles.modalInfoRow}>
                <span>Rate</span>
                <span>${rentalModal.pricePerHour.toFixed(2)}/hour</span>
              </div>
              <div style={styles.modalInfoRow}>
                <span>Memory</span>
                <span>{formatMemory(rentalModal.memory)}</span>
              </div>
            </div>

            <div style={styles.durationSection}>
              <label style={styles.durationLabel}>Duration (hours)</label>
              <div style={styles.durationButtons}>
                {[1, 2, 4, 8, 24, 72].map((h) => (
                  <button
                    key={h}
                    onClick={() => setRentalDuration(h)}
                    style={{
                      ...styles.durationButton,
                      ...(rentalDuration === h ? styles.durationButtonActive : {}),
                    }}
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.modalTotal}>
              <span>Total Cost</span>
              <span style={styles.totalValue}>
                ${(rentalModal.pricePerHour * rentalDuration).toFixed(2)}
              </span>
            </div>

            <div style={styles.modalActions}>
              <button onClick={() => setRentalModal(null)} style={styles.cancelButton}>
                Cancel
              </button>
              <button
                onClick={() => handleRent(rentalModal)}
                disabled={renting}
                style={styles.confirmButton}
              >
                {renting ? 'Starting...' : 'Confirm Rental'}
              </button>
            </div>
          </div>
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
  filters: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
  },
  searchInput: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #27272a',
    backgroundColor: '#14141e',
    color: '#e4e4e7',
    fontSize: '14px',
    outline: 'none',
  },
  select: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #27272a',
    backgroundColor: '#14141e',
    color: '#e4e4e7',
    fontSize: '14px',
    outline: 'none',
    minWidth: '140px',
  },
  priceInput: {
    width: '100px',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #27272a',
    backgroundColor: '#14141e',
    color: '#e4e4e7',
    fontSize: '14px',
    outline: 'none',
  },
  resultsInfo: {
    marginBottom: '16px',
  },
  resultsCount: {
    fontSize: '13px',
    color: '#71717a',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '16px',
  },
  card: {
    backgroundColor: '#14141e',
    borderRadius: '12px',
    border: '1px solid #27272a',
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    transition: 'border-color 0.15s ease',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  gpuName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#e4e4e7',
    margin: '0 0 3px 0',
  },
  provider: {
    fontSize: '12px',
    color: '#71717a',
  },
  cardStats: {
    display: 'flex',
    gap: '16px',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  statLabel: {
    fontSize: '11px',
    color: '#71717a',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  statValue: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#e4e4e7',
  },
  features: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  featureTag: {
    padding: '3px 8px',
    borderRadius: '4px',
    backgroundColor: '#1a1a24',
    color: '#a1a1aa',
    fontSize: '11px',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '4px',
    paddingTop: '14px',
    borderTop: '1px solid #27272a',
  },
  price: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '2px',
  },
  priceValue: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#e4e4e7',
  },
  priceUnit: {
    fontSize: '12px',
    color: '#71717a',
  },
  rentButton: {
    padding: '8px 18px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.15s ease',
  },
  rentButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    background: '#27272a',
    color: '#71717a',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#14141e',
    borderRadius: '16px',
    border: '1px solid #27272a',
    padding: '28px',
    width: '100%',
    maxWidth: '440px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#e4e4e7',
    margin: 0,
  },
  modalSubtitle: {
    fontSize: '14px',
    color: '#71717a',
    margin: '-10px 0 0 0',
  },
  modalInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '14px',
    borderRadius: '8px',
    backgroundColor: '#1a1a24',
  },
  modalInfoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
  },
  durationSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  durationLabel: {
    fontSize: '13px',
    color: '#a1a1aa',
    fontWeight: '500',
  },
  durationButtons: {
    display: 'flex',
    gap: '8px',
  },
  durationButton: {
    flex: 1,
    padding: '8px',
    borderRadius: '6px',
    border: '1px solid #27272a',
    backgroundColor: '#1a1a24',
    color: '#a1a1aa',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  durationButtonActive: {
    borderColor: '#7c3aed',
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    color: '#7c3aed',
  },
  modalTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px',
    borderRadius: '8px',
    backgroundColor: '#1a1a24',
    fontSize: '14px',
    color: '#a1a1aa',
  },
  totalValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#e4e4e7',
  },
  modalActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '4px',
  },
  cancelButton: {
    flex: 1,
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #27272a',
    backgroundColor: 'transparent',
    color: '#a1a1aa',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  confirmButton: {
    flex: 1,
    padding: '10px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
