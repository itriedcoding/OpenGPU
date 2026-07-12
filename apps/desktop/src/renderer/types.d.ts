export {};

declare global {
  interface Window {
    electronAPI: {
      gpu: {
        detect: () => Promise<{ success: boolean; gpus: any[]; hasNvidiaSmi: boolean }>;
        metrics: (gpuId?: number) => Promise<{ success: boolean; metrics: any }>;
        startAgent: (config?: { gpuId?: number; port?: number; apiKey?: string }) => Promise<{ success: boolean; error?: string; message?: string }>;
        stopAgent: () => Promise<{ success: boolean; error?: string }>;
        agentStatus: () => Promise<{ running: boolean }>;
      };
      auth: {
        login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; token?: string; user?: any; error?: string }>;
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
        checkForUpdates: () => Promise<{ success: boolean; updateInfo?: any; error?: string }>;
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
