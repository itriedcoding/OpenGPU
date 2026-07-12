import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface OpenGPUConfig {
  apiUrl: string;
  token: string | null;
  userId: string | null;
  email: string | null;
  nodeId: string | null;
  defaults: {
    region: string;
    duration: string;
    autoRenew: boolean;
  };
}

const DEFAULT_CONFIG: OpenGPUConfig = {
  apiUrl: 'https://api.opengpu.io/v1',
  token: null,
  userId: null,
  email: null,
  nodeId: null,
  defaults: {
    region: 'us-east-1',
    duration: '1h',
    autoRenew: false,
  },
};

const CONFIG_DIR = path.join(os.homedir(), '.opengpu');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export function getConfigDir(): string {
  return CONFIG_DIR;
}

export function getConfigPath(): string {
  return CONFIG_FILE;
}

export function ensureConfigDir(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  }
}

export function loadConfig(): OpenGPUConfig {
  ensureConfigDir();

  if (!fs.existsSync(CONFIG_FILE)) {
    saveConfig(DEFAULT_CONFIG);
    return { ...DEFAULT_CONFIG };
  }

  try {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
    const saved = JSON.parse(raw);
    return { ...DEFAULT_CONFIG, ...saved };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveConfig(config: OpenGPUConfig): void {
  ensureConfigDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), {
    encoding: 'utf-8',
    mode: 0o600,
  });
}

export function updateConfig(updates: Partial<OpenGPUConfig>): OpenGPUConfig {
  const config = loadConfig();
  const updated = { ...config, ...updates };
  saveConfig(updated);
  return updated;
}

export function clearCredentials(): void {
  const config = loadConfig();
  config.token = null;
  config.userId = null;
  config.email = null;
  saveConfig(config);
}

export function getToken(): string | null {
  const config = loadConfig();
  return config.token;
}

export function isAuthenticated(): boolean {
  const config = loadConfig();
  return config.token !== null && config.token.length > 0;
}

export function getApiUrl(): string {
  const config = loadConfig();
  return config.apiUrl;
}

export function setApiUrl(url: string): void {
  updateConfig({ apiUrl: url });
}
