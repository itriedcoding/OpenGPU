# Getting Started with OpenGPU

This guide will help you get up and running with OpenGPU quickly.

## Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- Git

## Installation

### CLI Installation

The OpenGPU CLI is the primary way to interact with the platform.

```bash
# Install globally via npm
npm install -g @opengpu/cli

# Verify installation
opengpu --version
```

### Docker Installation

If you prefer Docker:

```bash
# Pull the latest CLI image
docker pull opengpu/cli:latest

# Run the CLI
docker run -it opengpu/cli login
```

### Binary Installation

Download pre-built binaries from the [Releases](https://github.com/opengpu/opengpu/releases) page.

## Quick Start

### 1. Create an Account

```bash
# Open the registration page
opengpu register

# Or visit https://app.opengpu.io/register
```

### 2. Login

```bash
# Login with your credentials
opengpu login

# Or use an API token
opengpu login --token YOUR_API_TOKEN
```

### 3. Find a GPU

```bash
# List available GPUs
opengpu list-gpus

# Filter by model
opengpu list-gpus --model "RTX 4090"

# Filter by price
opengpu list-gpus --max-price 1.00

# Filter by region
opengpu list-gpus --region us-east-1
```

### 4. Rent a GPU

```bash
# Interactive rental
opengpu rent

# Quick rental with options
opengpu rent --gpu GPU_ID --duration 1h
```

### 5. Connect to Your GPU

```bash
# Check rental status and connection info
opengpu status

# SSH into your GPU
ssh -i ~/.opengpu/ssh_key root@HOSTNAME -p PORT
```

### 6. Monitor Usage

```bash
# View real-time metrics
opengpu metrics

# Check billing
opengpu status
```

## Configuration

### View Current Configuration

```bash
opengpu config list
```

### Set Configuration Values

```bash
# Set default region
opengpu config set defaults.region us-east-1

# Set custom API URL
opengpu config set apiUrl https://api.opengpu.io/v1

# Enable auto-renew
opengpu config set defaults.autoRenew true
```

### Configuration File Location

```bash
# Show config file path
opengpu config path

# Default: ~/.opengpu/config.json
```

## Provider Setup

If you want to share your GPUs and earn money:

### 1. Install the Agent

```bash
# Install the agent package
npm install -g @opengpu/agent

# Or use Docker
docker pull opengpu/agent:latest
```

### 2. Configure the Agent

```bash
# Initialize the agent
opengpu-agent init

# Login with your provider account
opengpu-agent login
```

### 3. Start Sharing

```bash
# Start sharing your GPUs
opengpu-agent start

# Check node status
opengpu nodes list
```

## Common Tasks

### Check Balance

```bash
opengpu status
```

### Stop a Rental

```bash
# Stop a specific rental
opengpu stop --rental RENTAL_ID

# Stop all rentals
opengpu stop --all
```

### View Metrics

```bash
# View metrics for active rental
opengpu metrics

# View historical metrics
opengpu metrics --period 24h
```

### Logout

```bash
opengpu logout
```

## Troubleshooting

### Authentication Issues

```bash
# Clear stored credentials
opengpu logout

# Login again
opengpu login
```

### Connection Issues

```bash
# Check API status
curl https://api.opengpu.io/health

# Use verbose mode
opengpu status --verbose
```

### Permission Issues

```bash
# Fix SSH key permissions
chmod 600 ~/.opengpu/ssh_key
```

## Next Steps

- Read the [Architecture Guide](./architecture.md)
- Explore the [API Documentation](./api.md)
- Join our [Discord Community](https://discord.gg/opengpu)
- Contribute to the [Project](../CONTRIBUTING.md)

## Support

If you encounter any issues:

1. Check the [FAQ](./faq.md)
2. Search [existing issues](https://github.com/opengpu/opengpu/issues)
3. Ask in [Discord](https://discord.gg/opengpu)
4. Open a [GitHub issue](https://github.com/opengpu/opengpu/issues/new)
