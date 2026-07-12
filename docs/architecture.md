# OpenGPU Architecture

This document describes the high-level architecture of the OpenGPU platform.

## Overview

OpenGPU is a decentralized GPU marketplace that connects GPU providers with consumers. The platform consists of several core components working together to enable secure, efficient GPU sharing.

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

## Components

### 1. API Server (`packages/api`)

The central backend service that handles all business logic.

**Responsibilities:**
- User authentication and authorization
- GPU listing and matching
- Rental management
- Payment processing
- Node coordination
- Metrics aggregation

**Technology Stack:**
- Runtime: Node.js
- Framework: Express.js
- Database: PostgreSQL (SQLite for development)
- Cache: Redis (optional)
- Auth: JWT + OAuth2

### 2. Web UI (`packages/web`)

The web-based user interface for managing GPUs and rentals.

**Features:**
- Dashboard with rental overview
- GPU marketplace browser
- Real-time metrics visualization
- Account management
- Billing history

**Technology Stack:**
- Framework: React 18
- State Management: Zustand
- Styling: Tailwind CSS
- Charts: Recharts

### 3. CLI Tool (`packages/cli`)

Command-line interface for developers and automation.

**Commands:**
- `login` / `logout` - Authentication
- `list-gpus` - Browse available GPUs
- `rent` - Rent a GPU
- `stop` - Stop a rental
- `status` - View account status
- `metrics` - Monitor GPU usage
- `nodes` - Manage provider nodes

**Technology Stack:**
- Runtime: Node.js
- Framework: Commander.js
- Prompts: Inquirer.js

### 4. Agent (`packages/agent`)

Software that runs on GPU provider machines.

**Responsibilities:**
- Hardware detection and reporting
- Resource sharing management
- Health monitoring
- Communication with API server

**Technology Stack:**
- Runtime: Node.js
- System Info: systeminformation
- GPU Detection: nvidia-smi / rocm-smi

## Data Flow

### GPU Rental Flow

```
┌────────┐     ┌─────┐     ┌─────┐     ┌───────┐
│Consumer│────▶│ API │────▶│Agent│────▶│  GPU  │
└────────┘     └─────┘     └─────┘     └───────┘
    │              │           │
    │              │           │
    ▼              ▼           ▼
┌────────┐     ┌─────┐     ┌─────┐
│ Payment│     │ DB  │     │ SSH │
└────────┘     └─────┘     └─────┘
```

1. **Consumer requests GPU** - Via CLI or Web UI
2. **API validates request** - Checks authentication and balance
3. **API matches GPU** - Finds available GPU matching criteria
4. **API processes payment** - Charges consumer's account
5. **API notifies Agent** - Tells agent to prepare GPU
6. **Agent configures GPU** - Sets up SSH access and environment
7. **Agent returns credentials** - SSH host, port, and key
8. **Consumer connects** - SSH into the rented GPU

### Provider Registration Flow

```
┌────────┐     ┌─────┐     ┌─────┐
│Provider│────▶│ API │────▶│Node │
└────────┘     └─────┘     └─────┘
    │              │           │
    │              │           │
    ▼              ▼           ▼
┌────────┐     ┌─────┐     ┌─────┐
│ Agent  │     │ DB  │     │GPU  │
└────────┘     └─────┘     └─────┘
```

1. **Provider installs Agent** - On GPU machine
2. **Agent detects hardware** - Scans for GPUs
3. **Agent registers with API** - Sends hardware info
4. **Provider sets pricing** - Configures hourly rates
5. **API lists GPUs** - Makes them available for rent
6. **Agent monitors health** - Reports status periodically

## Security Model

### Authentication

- **JWT Tokens** - Short-lived access tokens
- **API Keys** - For programmatic access
- **OAuth2** - For third-party integrations

### Authorization

- **Role-Based Access Control (RBAC)**
  - Consumer: Can rent GPUs
  - Provider: Can share GPUs
  - Admin: Platform management

### Data Protection

- **Encryption in Transit** - TLS 1.3
- **Encryption at Rest** - AES-256
- **SSH Keys** - Generated per rental
- **Network Isolation** - Each rental gets isolated network

### GPU Isolation

- **Container-based** - Each rental in isolated container
- **Resource Limits** - CPU, memory, and GPU quotas
- **No Cross-Access** - Rentals cannot access each other

## Scalability

### Horizontal Scaling

- **API Servers** - Stateless, can scale horizontally
- **Workers** - Background job processing scales independently
- **Load Balancing** - Distribute traffic across instances

### Database

- **Read Replicas** - For query distribution
- **Connection Pooling** - Efficient connection management
- **Sharding** - For large-scale deployments

### GPU Network

- **Geographic Distribution** - Nodes worldwide
- **Smart Routing** - Match consumers to nearest GPUs
- **Load Balancing** - Distribute rentals across providers

## Monitoring & Observability

### Metrics

- **System Metrics** - CPU, memory, disk, network
- **GPU Metrics** - Utilization, temperature, power
- **Business Metrics** - Rentals, revenue, usage

### Logging

- **Structured Logging** - JSON format
- **Centralized** - Aggregated logs
- **Correlation IDs** - Track requests across services

### Tracing

- **Distributed Tracing** - Track requests end-to-end
- **Performance Profiling** - Identify bottlenecks

## Development

### Local Development

```bash
# Clone the repository
git clone https://github.com/opengpu/opengpu.git
cd opengpu

# Install dependencies
npm install

# Start development servers
npm run dev
```

### Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

### Deployment

```bash
# Build all packages
npm run build

# Deploy with Docker
docker-compose up -d
```

## Further Reading

- [API Documentation](./api.md)
- [Agent Setup Guide](./agent-setup.md)
- [CLI Usage Guide](./cli-usage.md)
- [Contributing Guidelines](../CONTRIBUTING.md)
