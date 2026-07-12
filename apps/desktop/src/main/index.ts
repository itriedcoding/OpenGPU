import { app, BrowserWindow, Menu, Tray, nativeImage, ipcMain, shell, protocol } from 'electron';
import * as path from 'path';
import { setupIpcHandlers } from './ipc-handlers';
import { detectGPUs } from './gpu-detect';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

const DEV_MODE = !app.isPackaged;
const RENDERER_URL = DEV_MODE ? 'http://localhost:5173' : `file://${path.join(__dirname, '../renderer/index.html')}`;
const PRELOAD_PATH = path.join(__dirname, 'preload.js');

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'OpenGPU',
    icon: path.join(__dirname, '../../resources/icon.png'),
    backgroundColor: '#0a0a0f',
    webPreferences: {
      preload: PRELOAD_PATH,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    show: false,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    trafficLightPosition: { x: 16, y: 16 },
  });

  mainWindow.loadURL(RENDERER_URL);

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (DEV_MODE) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  buildMenu();
}

function buildMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        { label: 'Settings', accelerator: 'CmdOrCtrl+,', click: () => mainWindow?.webContents.send('navigate', '/settings') },
        { type: 'separator' },
        process.platform === 'darwin' ? { role: 'hide' } : { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { role: 'close' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        { label: 'OpenGPU Website', click: () => shell.openExternal('https://opengpu.io') },
        { label: 'Documentation', click: () => shell.openExternal('https://docs.opengpu.io') },
        { label: 'Report Issue', click: () => shell.openExternal('https://github.com/opengpu/opengpu/issues') },
        { type: 'separator' },
        { label: `Version ${app.getVersion()}`, enabled: false },
      ],
    },
  ];

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    });
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function createTray(): void {
  const iconPath = path.join(__dirname, '../../resources/icon.png');
  const icon = nativeImage.createFromPath(iconPath);

  tray = new Tray(icon.resize({ width: 16, height: 16 }));
  tray.setToolTip('OpenGPU');

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show OpenGPU', click: () => mainWindow?.show() },
    { type: 'separator' },
    { label: 'GPU Status', enabled: false },
    { type: 'separator' },
    { label: 'Quit', click: () => { isQuitting = true; app.quit(); } },
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });
}

function registerDeepLink(): void {
  if (process.platform === 'win32') {
    const args = process.argv.slice(1);
    if (args.length > 0) {
      handleDeepLink(args[0]);
    }
  }

  app.on('open-url', (event, url) => {
    event.preventDefault();
    handleDeepLink(url);
  });

  app.setAsDefaultProtocolClient('opengpu');
}

function handleDeepLink(url: string): void {
  if (url.startsWith('opengpu://')) {
    const parsed = new URL(url);
    const route = parsed.pathname;
    mainWindow?.webContents.send('deep-link', route);
    mainWindow?.show();
  }
}

function registerSchemes(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'opengpu',
      privileges: {
        secure: true,
        supportFetchAPI: true,
        corsEnabled: true,
      },
    },
  ]);
}

app.whenReady().then(() => {
  registerSchemes();
  createWindow();
  createTray();
  registerDeepLink();
  setupIpcHandlers(mainWindow);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      mainWindow?.show();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('second-instance', (_event, commandLine) => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
    if (commandLine.length > 1) {
      handleDeepLink(commandLine[commandLine.length - 1]);
    }
  }
});

export { mainWindow };
