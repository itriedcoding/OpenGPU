const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  gpu: {
    detect: () => ipcRenderer.invoke('gpu:detect'),
    metrics: (gpuId?: number) => ipcRenderer.invoke('gpu:metrics', gpuId),
    startAgent: (config?: any) => ipcRenderer.invoke('gpu:start-agent', config),
    stopAgent: () => ipcRenderer.invoke('gpu:stop-agent'),
    agentStatus: () => ipcRenderer.invoke('gpu:agent-status'),
  },
  auth: {
    login: (credentials: { email: string; password: string }) => ipcRenderer.invoke('auth:login', credentials),
    logout: () => ipcRenderer.invoke('auth:logout'),
    check: () => ipcRenderer.invoke('auth:check'),
    setToken: (token: string) => ipcRenderer.invoke('auth:set-token', token),
  },
  app: {
    version: () => ipcRenderer.invoke('app:version'),
    platform: () => ipcRenderer.invoke('app:platform'),
    setApiUrl: (url: string) => ipcRenderer.invoke('app:set-api-url', url),
    getApiUrl: () => ipcRenderer.invoke('app:get-api-url'),
    openExternal: (url: string) => ipcRenderer.invoke('app:open-external', url),
    openFolder: (path: string) => ipcRenderer.invoke('app:open-folder', path),
    getPath: (name: string) => ipcRenderer.invoke('app:get-path', name),
    checkForUpdates: () => ipcRenderer.invoke('app:check-for-updates'),
  },
  system: {
    gpuInfo: () => ipcRenderer.invoke('system:gpu-info'),
  },
  on: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (_event, ...args) => callback(...args));
  },
  off: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.removeListener(channel, callback);
  },
  send: (channel: string, ...args: any[]) => {
    ipcRenderer.send(channel, ...args);
  },
});
