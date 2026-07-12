import { ipcMain, BrowserWindow, app, shell } from 'electron';
import { detectGPUs, getGpuMetrics, isNvidiaSmiAvailable, GpuInfo } from './gpu-detect';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

let agentProcess: any = null;
let metricsInterval: NodeJS.Timeout | null = null;

interface AppState {
  token: string | null;
  userId: string | null;
  apiUrl: string;
  agentRunning: boolean;
}

const state: AppState = {
  token: null,
  userId: null,
  apiUrl: 'https://api.opengpu.io',
  agentRunning: false,
};

function sendToRenderer(channel: string, ...args: any[]): void {
  const windows = BrowserWindow.getAllWindows();
  windows.forEach((win) => {
    if (!win.isDestroyed()) {
      win.webContents.send(channel, ...args);
    }
  });
}

export function setupIpcHandlers(mainWindow: BrowserWindow | null): void {
  ipcMain.handle('gpu:detect', async () => {
    try {
      const gpus = await detectGPUs();
      const hasNvidiaSmi = await isNvidiaSmiAvailable();
      return { success: true, gpus, hasNvidiaSmi };
    } catch (error: any) {
      return { success: false, error: error.message, gpus: [] };
    }
  });

  ipcMain.handle('gpu:metrics', async (_event, gpuId?: number) => {
    try {
      if (gpuId !== undefined) {
        const metrics = await getGpuMetrics(gpuId);
        return { success: true, metrics };
      }

      const gpus = await detectGPUs();
      const allMetrics = await Promise.all(
        gpus.map(async (gpu) => {
          const metrics = await getGpuMetrics(gpu.id);
          return metrics;
        })
      );

      return { success: true, metrics: allMetrics.filter(Boolean) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('gpu:start-agent', async (_event, config?: { gpuId?: number; port?: number; apiKey?: string }) => {
    try {
      if (agentProcess) {
        return { success: false, error: 'Agent is already running' };
      }

      const gpuId = config?.gpuId ?? 0;
      const port = config?.port ?? 8888;

      const agentScript = process.platform === 'win32'
        ? 'npx @opengpu/agent start'
        : 'npx @opengpu/agent start';

      agentProcess = spawn('npx', ['@opengpu/agent', 'start', '--gpu', String(gpuId), '--port', String(port)], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          OPENGPU_API_KEY: config?.apiKey || state.token || '',
          OPENGPU_API_URL: state.apiUrl,
        },
      });

      agentProcess.stdout?.on('data', (data: Buffer) => {
        const message = data.toString().trim();
        sendToRenderer('agent:log', { level: 'info', message });
        if (message.includes('Listening on')) {
          state.agentRunning = true;
          sendToRenderer('agent:status', { running: true, port });
        }
      });

      agentProcess.stderr?.on('data', (data: Buffer) => {
        sendToRenderer('agent:log', { level: 'error', message: data.toString().trim() });
      });

      agentProcess.on('exit', (code: number) => {
        agentProcess = null;
        state.agentRunning = false;
        sendToRenderer('agent:status', { running: false });
        sendToRenderer('agent:log', { level: 'info', message: `Agent exited with code ${code}` });
      });

      agentProcess.on('error', (error: Error) => {
        agentProcess = null;
        state.agentRunning = false;
        sendToRenderer('agent:status', { running: false });
        sendToRenderer('agent:log', { level: 'error', message: error.message });
      });

      return { success: true, message: 'Agent starting...' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('gpu:stop-agent', async () => {
    try {
      if (!agentProcess) {
        return { success: false, error: 'No agent running' };
      }

      agentProcess.kill('SIGTERM');
      agentProcess = null;
      state.agentRunning = false;

      if (metricsInterval) {
        clearInterval(metricsInterval);
        metricsInterval = null;
      }

      sendToRenderer('agent:status', { running: false });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('gpu:agent-status', () => {
    return { running: state.agentRunning };
  });

  ipcMain.handle('auth:login', async (_event, credentials: { email: string; password: string }) => {
    try {
      const response = await fetch(`${state.apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Login failed' }));
        return { success: false, error: error.message || 'Login failed' };
      }

      const data = await response.json();
      state.token = data.token;
      state.userId = data.user?.id;

      return { success: true, token: data.token, user: data.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('auth:logout', async () => {
    state.token = null;
    state.userId = null;
    return { success: true };
  });

  ipcMain.handle('auth:check', () => {
    return { token: state.token, userId: state.userId };
  });

  ipcMain.handle('auth:set-token', (_event, token: string) => {
    state.token = token;
    return { success: true };
  });

  ipcMain.handle('app:version', () => {
    return { version: app.getVersion(), name: app.getName() };
  });

  ipcMain.handle('app:platform', () => {
    return {
      platform: process.platform,
      arch: process.arch,
      release: process.getSystemVersion(),
    };
  });

  ipcMain.handle('app:set-api-url', (_event, url: string) => {
    state.apiUrl = url;
    return { success: true };
  });

  ipcMain.handle('app:get-api-url', () => {
    return { url: state.apiUrl };
  });

  ipcMain.handle('app:open-external', async (_event, url: string) => {
    await shell.openExternal(url);
    return { success: true };
  });

  ipcMain.handle('app:open-folder', async (_event, folderPath: string) => {
    await shell.openPath(folderPath);
    return { success: true };
  });

  ipcMain.handle('app:get-path', (_event, name: string) => {
    const pathMap: Record<string, string> = {
      home: app.getPath('home'),
      appData: app.getPath('appData'),
      userData: app.getPath('userData'),
      desktop: app.getPath('desktop'),
      documents: app.getPath('documents'),
      downloads: app.getPath('downloads'),
    };
    return { path: pathMap[name] || app.getPath('userData') };
  });

  ipcMain.handle('app:check-for-updates', async () => {
    try {
      const { autoUpdater } = await import('electron-updater');
      const result = await autoUpdater.checkForUpdates();
      return {
        success: true,
        updateInfo: result?.updateInfo
          ? {
              version: result.updateInfo.version,
              releaseDate: result.updateInfo.releaseDate,
              releaseNotes: result.updateInfo.releaseNotes,
            }
          : null,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('system:gpu-info', async () => {
    try {
      const info: Record<string, any> = {};

      if (process.platform === 'win32') {
        try {
          const { stdout } = await execAsync('wmic path win32_videocontroller get name,driverversion,adapterram /format:csv', { timeout: 10000 });
          info.raw = stdout;
        } catch { }
      } else if (process.platform === 'linux') {
        try {
          const { stdout } = await execAsync('lspci | grep -i vga', { timeout: 5000 });
          info.pciDevices = stdout.trim();
        } catch { }
      }

      return { success: true, info };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
}
