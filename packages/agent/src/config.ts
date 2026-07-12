import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { NodeConfig } from './types';
import logger from './logger';

const CONFIG_DIR = path.join(os.homedir(), '.opengpu');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

const DEFAULT_CONFIG: NodeConfig = {
  apiEndpoint: 'https://api.opengpu.network',
  apiKey: '',
  nodeName: `node-${os.hostname()}`,
  maxConcurrentRentals: 4,
  heartbeatInterval: 30000,
  metricsInterval: 5000,
  dataDirectory: path.join(CONFIG_DIR, 'data'),
  dockerRuntime: 'nvidia',
  networkInterface: 'eth0',
  enableVpn: false,
  logLevel: 'info',
};

export function loadConfig(): NodeConfig {
  dotenv.config();

  let fileConfig: Partial<NodeConfig> = {};
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
      fileConfig = JSON.parse(raw);
      logger.info('Loaded config from file', { path: CONFIG_FILE });
    } catch (err) {
      logger.warn('Failed to parse config file, using defaults', { error: err });
    }
  }

  const envConfig: Partial<NodeConfig> = {};
  if (process.env.OPENGPU_API_ENDPOINT) envConfig.apiEndpoint = process.env.OPENGPU_API_ENDPOINT;
  if (process.env.OPENGPU_API_KEY) envConfig.apiKey = process.env.OPENGPU_API_KEY;
  if (process.env.OPENGPU_NODE_NAME) envConfig.nodeName = process.env.OPENGPU_NODE_NAME;
  if (process.env.OPENGPU_MAX_RENTALS) envConfig.maxConcurrentRentals = parseInt(process.env.OPENGPU_MAX_RENTALS, 10);
  if (process.env.OPENGPU_HEARTBEAT_INTERVAL) envConfig.heartbeatInterval = parseInt(process.env.OPENGPU_HEARTBEAT_INTERVAL, 10);
  if (process.env.OPENGPU_METRICS_INTERVAL) envConfig.metricsInterval = parseInt(process.env.OPENGPU_METRICS_INTERVAL, 10);
  if (process.env.OPENGPU_DATA_DIR) envConfig.dataDirectory = process.env.OPENGPU_DATA_DIR;
  if (process.env.OPENGPU_DOCKER_RUNTIME) envConfig.dockerRuntime = process.env.OPENGPU_DOCKER_RUNTIME;
  if (process.env.OPENGPU_NETWORK_INTERFACE) envConfig.networkInterface = process.env.OPENGPU_NETWORK_INTERFACE;
  if (process.env.OPENGPU_ENABLE_VPN) envConfig.enableVpn = process.env.OPENGPU_ENABLE_VPN === 'true';
  if (process.env.OPENGPU_LOG_LEVEL) envConfig.logLevel = process.env.OPENGPU_LOG_LEVEL;

  const config: NodeConfig = {
    ...DEFAULT_CONFIG,
    ...fileConfig,
    ...envConfig,
  };

  validateConfig(config);

  if (!fs.existsSync(config.dataDirectory)) {
    fs.mkdirSync(config.dataDirectory, { recursive: true });
  }

  return config;
}

function validateConfig(config: NodeConfig): void {
  if (!config.apiKey) {
    throw new Error('API key is required. Set OPENGPU_API_KEY env var or add apiKey to config file.');
  }
  if (!config.apiEndpoint) {
    throw new Error('API endpoint is required.');
  }
  if (config.maxConcurrentRentals < 0) {
    throw new Error('maxConcurrentRentals must be non-negative.');
  }
  if (config.heartbeatInterval < 10000) {
    throw new Error('heartbeatInterval must be at least 10000ms.');
  }
  if (config.metricsInterval < 1000) {
    throw new Error('metricsInterval must be at least 1000ms.');
  }
}

export function saveConfig(config: NodeConfig): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  logger.info('Config saved', { path: CONFIG_FILE });
}

export { CONFIG_DIR, CONFIG_FILE };
