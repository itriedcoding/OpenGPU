# OpenGPU Agent Setup Guide

This guide will help you set up and run the OpenGPU Agent to share your GPUs and earn money.

## Prerequisites

### Hardware Requirements

- NVIDIA GPU (RTX 3060 or newer recommended)
- AMD GPU (RX 6000 series or newer)
- 16GB+ system RAM
- Stable internet connection (10+ Mbps)
- 50GB+ free disk space

### Software Requirements

- Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- Docker (recommended) or Node.js 18+
- NVIDIA drivers 525+ or AMD ROCm 5.4+
- NVIDIA Container Toolkit (for Docker)

## Installation

### Option 1: Docker (Recommended)

Docker provides the best isolation and easiest setup.

#### 1. Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Add your user to the docker group
sudo usermod -aG docker $USER

# Log out and back in for group changes to take effect
```

#### 2. Install NVIDIA Container Toolkit (for NVIDIA GPUs)

```bash
# Add NVIDIA package repository
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/libnvidia-container/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/libnvidia-container/$distribution/libnvidia-container.list | \
  sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

# Install the toolkit
sudo apt-get update
sudo apt-get install -y nvidia-container-toolkit

# Restart Docker
sudo systemctl restart docker
```

#### 3. Run the Agent

```bash
# Pull the latest agent image
docker pull opengpu/agent:latest

# Run the agent
docker run -d \
  --name opengpu-agent \
  --restart unless-stopped \
  --gpus all \
  -p 4000:4000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e API_URL=https://api.opengpu.io/v1 \
  -e AGENT_TOKEN=YOUR_AGENT_TOKEN \
  opengpu/agent:latest
```

### Option 2: Native Installation

#### 1. Install Dependencies

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install build tools
sudo apt-get install -y build-essential python3
```

#### 2. Install the Agent

```bash
# Install the agent globally
npm install -g @opengpu/agent
```

#### 3. Configure the Agent

```bash
# Initialize the agent
opengpu-agent init

# This will:
# - Detect your GPUs
# - Generate configuration
# - Create authentication keys
```

#### 4. Login and Start

```bash
# Login with your provider account
opengpu-agent login

# Start the agent
opengpu-agent start

# Or run in foreground (for debugging)
opengpu-agent start --foreground
```

## Configuration

### Agent Configuration File

Location: `~/.opengpu/agent.json`

```json
{
  "apiUrl": "https://api.opengpu.io/v1",
  "nodeId": "node_abc123",
  "name": "My GPU Server",
  "region": "us-east-1",
  "pricing": {
    "RTX 4090": 0.75,
    "A100": 2.50
  },
  "limits": {
    "maxConcurrentRentals": 2,
    "minAvailability": 80
  },
  "monitoring": {
    "heartbeatInterval": 30000,
    "metricsInterval": 10000
  }
}
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `API_URL` | API server URL | `https://api.opengpu.io/v1` |
| `AGENT_TOKEN` | Authentication token | - |
| `AGENT_PORT` | Agent port | `4000` |
| `NODE_NAME` | Display name | hostname |
| `REGION` | Deployment region | `us-east-1` |

### Setting Prices

```bash
# Set price for a specific GPU model
opengpu-agent config set pricing.RTX\ 4090 0.75

# Set price for all GPUs
opengpu-agent config set pricing.default 0.50

# View current pricing
opengpu-agent config list
```

## Managing the Agent

### Check Status

```bash
# View agent status
opengpu-agent status

# View connected GPUs
opengpu-agent gpus

# View active rentals
opengpu-agent rentals
```

### View Logs

```bash
# Docker logs
docker logs -f opengpu-agent

# Native installation logs
journalctl -u opengpu-agent -f
```

### Restart the Agent

```bash
# Docker
docker restart opengpu-agent

# Native
sudo systemctl restart opengpu-agent
```

### Stop the Agent

```bash
# Docker
docker stop opengpu-agent

# Native
sudo systemctl stop opengpu-agent
```

## GPU Configuration

### NVIDIA GPUs

Ensure NVIDIA drivers are installed:

```bash
# Check driver version
nvidia-smi

# Install drivers (Ubuntu)
sudo apt-get install nvidia-driver-535
```

### AMD GPUs

Ensure ROCm is installed:

```bash
# Check ROCm installation
rocm-smi

# Install ROCm (Ubuntu)
sudo apt-get install rocm-5.4.0
```

### Multiple GPU Types

The agent supports mixed GPU setups:

```bash
# List detected GPUs
opengpu-agent gpus --verbose

# Example output:
# GPU 0: NVIDIA RTX 4090 (24GB GDDR6X)
# GPU 1: NVIDIA RTX 4090 (24GB GDDR6X)
# GPU 2: AMD RX 7900 XT (20GB GDDR6)
```

## Monitoring

### Built-in Metrics

The agent exposes metrics on port 4000:

```bash
# Health check
curl http://localhost:4000/health

# Metrics endpoint
curl http://localhost:4000/metrics
```

### GPU Monitoring

Real-time GPU metrics are available:

```bash
# View live GPU stats
opengpu-agent monitor

# Example output:
# GPU 0: 45% util, 72°C, 350W, 18GB/24GB VRAM
# GPU 1: 82% util, 68°C, 400W, 22GB/24GB VRAM
```

### Logging

Configure log levels:

```bash
# Set debug logging
opengpu-agent config set logLevel debug

# Set info logging (default)
opengpu-agent config set logLevel info
```

## Security

### Firewall Configuration

Open only required ports:

```bash
# Allow agent port
sudo ufw allow 4000/tcp

# Allow SSH (if needed)
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable
```

### TLS/SSL

The agent uses TLS by default. For custom certificates:

```bash
# Set custom certificate paths
opengpu-agent config set tls.cert /path/to/cert.pem
opengpu-agent config set tls.key /path/to/key.pem
```

### Network Isolation

Each rental is isolated:
- Separate network namespace
- No cross-rental communication
- Firewall rules enforced

## Troubleshooting

### GPU Not Detected

```bash
# Check NVIDIA drivers
nvidia-smi

# Check permissions
sudo usermod -aG video $USER
sudo usermod -aG render $USER

# Restart agent
opengpu-agent restart
```

### Connection Issues

```bash
# Test API connectivity
curl https://api.opengpu.io/health

# Check agent logs
opengpu-agent logs --tail 100

# Verify token
opengpu-agent config get token
```

### Performance Issues

```bash
# Check system resources
htop

# Monitor GPU utilization
watch -n 1 nvidia-smi

# Check network speed
speedtest-cli
```

### Agent Won't Start

```bash
# Check port availability
netstat -tlnp | grep 4000

# Check configuration
opengpu-agent config validate

# Reset configuration
opengpu-agent config reset
```

## Earnings

### Payout Schedule

- Earnings are calculated daily
- Minimum payout: $10
- Payouts processed weekly
- Payment via PayPal, Stripe, or crypto

### View Earnings

```bash
# View current earnings
opengpu-agent earnings

# View earnings history
opengpu-agent earnings --history
```

### Tax Information

Providers are responsible for reporting income. Download earnings reports:

```bash
# Generate earnings report
opengpu-agent report --year 2024 --format csv
```

## Support

If you encounter issues:

1. Check the [FAQ](./faq.md)
2. Search [existing issues](https://github.com/opengpu/opengpu/issues)
3. Ask in [Discord](https://discord.gg/opengpu)
4. Open a [GitHub issue](https://github.com/opengpu/opengpu/issues/new)

## Next Steps

- [Architecture Overview](./architecture.md)
- [API Documentation](./api.md)
- [Contributing to OpenGPU](../CONTRIBUTING.md)
