import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import MyGpus from './pages/MyGpus';
import Rentals from './pages/Rentals';
import Settings from './pages/Settings';
import Login from './pages/Login';

declare global {
  interface Window {
    electronAPI: {
      gpu: {
        detect: () => Promise<{ success: boolean; gpus: any[]; hasNvidiaSmi: boolean }>;
        metrics: (gpuId?: number) => Promise<{ success: boolean; metrics: any }>;
        startAgent: (config?: any) => Promise<{ success: boolean; error?: string }>;
        stopAgent: () => Promise<{ success: boolean; error?: string }>;
        agentStatus: () => Promise<{ running: boolean }>;
      };
      auth: {
        login: (credentials: { email: string; password: string }) => Promise<any>;
        logout: () => Promise<{ success: boolean }>;
        check: () => Promise<{ token: string | null; userId: string | null }>;
        setToken: (token: string) => Promise<{ success: boolean }>;
      };
      app: {
        version: () => Promise<{ version: string; name: string }>;
        platform: () => Promise<{ platform: string; arch: string; release: string }>;
        setApiUrl: (url: string) => Promise<{ success: boolean }>;
        getApiUrl: () => Promise<{ url: string }>;
        openExternal: (url: string) => Promise<{ success: boolean }>;
        openFolder: (path: string) => Promise<{ success: boolean }>;
        getPath: (name: string) => Promise<{ path: string }>;
        checkForUpdates: () => Promise<any>;
      };
      system: {
        gpuInfo: () => Promise<{ success: boolean; info: any }>;
      };
      on: (channel: string, callback: (...args: any[]) => void) => void;
      off: (channel: string, callback: (...args: any[]) => void) => void;
      send: (channel: string, ...args: any[]) => void;
    };
  }
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { token } = await window.electronAPI.auth.check();
        setIsAuthenticated(!!token);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div style={styles.loading}>
        <div style={styles.loadingSpinner} />
        <p style={styles.loadingText}>Loading OpenGPU...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div style={styles.app}>
      <Sidebar />
      <main style={styles.main}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/my-gpus" element={<MyGpus />} />
          <Route path="/rentals" element={<Rentals />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  app: {
    display: 'flex',
    height: '100vh',
    backgroundColor: '#0a0a0f',
    color: '#e4e4e7',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    overflow: 'hidden',
  },
  main: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#0a0a0f',
    color: '#e4e4e7',
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #27272a',
    borderTopColor: '#7c3aed',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    marginTop: '16px',
    fontSize: '14px',
    color: '#a1a1aa',
  },
};
