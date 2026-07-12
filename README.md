# OpenGPU

```
   ___                    ____   ____ _________
  / _ \ _ __   ___ _ __ |  _ \ / __ \__   __|
 | | | | '_ \ / _ \ '_ \| |_) | |  | | | |
 | |_| | |_) |  __/ | | |  __/| |__| | | |
  \___/| .__/ \___|_| |_|_|    \____/  |_|
       |_|
```

**Open Source GPU Cloud Marketplace**

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/opengpu/opengpu)
[![Version](https://img.shields.io/badge/version-0.1.0-blue)](https://github.com/opengpu/opengpu)

---

OpenGPU is an open-source platform that creates a decentralized marketplace for GPU computing power. Connect idle GPUs with those who need them, enabling affordable AI/ML training, rendering, and high-performance computing.

## Features

- **GPU Marketplace** - Rent GPUs on-demand or share your idle hardware
- **Fair Pricing** - Transparent, market-driven pricing with no hidden fees
- **Global Network** - Access GPUs worldwide across multiple regions
- **Real-time Metrics** - Monitor GPU utilization, temperature, and performance
- **Secure** - End-to-end encryption with secure SSH access
- **Open Source** - Fully transparent, auditable, and community-driven

## Quick Start

```bash
# Install the CLI
npm install -g @opengpu/cli

# Login to your account
opengpu login

# List available GPUs
opengpu list-gpus

# Rent a GPU
opengpu rent

# Check status
opengpu status
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        OpenGPU Platform                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   Web UI     │    │   CLI Tool   │    │  REST API    │       │
│  │  (React)     │    │ (Node.js)    │    │  (Express)   │       │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘       │
│         │                   │                    │                │
│         └───────────────────┼────────────────────┘                │
│                             │                                     │
│                    ┌────────▼────────┐                           │
│                    │   API Gateway   │                           │
│                    │   (Rate Limit)  │                           │
│                    └────────┬────────┘                           │
│                             │                                     │
│         ┌───────────────────┼───────────────────┐                │
│         │                   │                   │                 │
│  ┌──────▼───────┐    ┌──────▼───────┐    ┌──────▼───────┐       │
│  │  Auth Service │    │  GPU Service │    │  Billing     │       │
│  │  (JWT/OAuth)  │    │  (Matching)  │    │  (Stripe)    │       │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘       │
│         │                   │                    │                │
│         └───────────────────┼────────────────────┘                │
│                             │                                     │
│                    ┌────────▼────────┐                           │
│                    │    Database     │                           │
│                    │   (PostgreSQL)  │                           │
│                    └─────────────────┘                           │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                      GPU Provider Nodes                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   Node A     │    │   Node B     │    │   Node C     │       │
│  │  (4x A100)   │    │ (8x RTX4090)│    │  (2x H100)   │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Installation

### npm (Recommended)

```bash
npm install -g @opengpu/cli
```

### Docker

```bash
docker pull opengpu/cli:latest
docker run -it opengpu/cli login
```

### Binary

Download pre-built binaries from [Releases](https://github.com/opengpu/opengpu/releases).

## Configuration

Configuration is stored in `~/.opengpu/config.json`:

```bash
# View configuration
opengpu config list

# Set API URL
opengpu config set apiUrl https://api.opengpu.io/v1

# Set default region
opengpu config set defaults.region us-east-1
```

## API Documentation

Full API documentation is available at [docs.opengpu.io/api](https://docs.opengpu.io/api).

## Development

```bash
# Clone the repository
git clone https://github.com/opengpu/opengpu.git

# Install dependencies
cd opengpu
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build all packages
npm run build
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the GNU Affero General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

---

**Built with care by the OpenGPU community**
