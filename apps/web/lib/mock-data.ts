export interface Gpu {
  id: string;
  name: string;
  model: string;
  brand: "NVIDIA" | "AMD" | "Intel";
  vram: number;
  vramType: string;
  pricePerHour: number;
  pricePerMonth: number;
  provider: {
    id: string;
    name: string;
    rating: number;
    totalRentals: number;
    avatar: string;
  };
  location: string;
  availability: "available" | "limited" | "unavailable";
  performance: {
    fp32: number;
    fp16: number;
    tf32: number;
  };
  specs: {
    cores: number;
    boostClock: string;
    tdp: string;
    interface: string;
    cooling: string;
    networkSpeed: string;
  };
  description: string;
  tags: string[];
  image: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "user" | "provider" | "admin";
}

export interface Rental {
  id: string;
  gpuId: string;
  gpuName: string;
  status: "active" | "completed" | "cancelled";
  startDate: string;
  endDate: string | null;
  totalCost: number;
  hoursUsed: number;
}

export const mockGpus: Gpu[] = [
  {
    id: "rtx-4090-1",
    name: "NVIDIA RTX 4090",
    model: "RTX 4090",
    brand: "NVIDIA",
    vram: 24,
    vramType: "GDDR6X",
    pricePerHour: 0.75,
    pricePerMonth: 450,
    provider: { id: "p1", name: "CloudGPU Pro", rating: 4.9, totalRentals: 1240, avatar: "C" },
    location: "US East (Virginia)",
    availability: "available",
    performance: { fp32: 82.6, fp16: 165.2, tf32: 82.6 },
    specs: { cores: 16384, boostClock: "2.52 GHz", tdp: "450W", interface: "PCIe 4.0 x16", cooling: "Air Cooled", networkSpeed: "10 Gbps" },
    description: "Flagship gaming and AI GPU with 24GB GDDR6X memory. Excellent for deep learning training, inference, and rendering workloads.",
    tags: ["AI", "ML", "Rendering", "Gaming"],
    image: "/gpus/rtx4090.png",
  },
  {
    id: "a100-1",
    name: "NVIDIA A100 80GB",
    model: "A100",
    brand: "NVIDIA",
    vram: 80,
    vramType: "HBM2e",
    pricePerHour: 2.50,
    pricePerMonth: 1500,
    provider: { id: "p2", name: "DataCenter Hub", rating: 4.8, totalRentals: 890, avatar: "D" },
    location: "US West (Oregon)",
    availability: "available",
    performance: { fp32: 19.5, fp16: 312, tf32: 156 },
    specs: { cores: 6912, boostClock: "1.41 GHz", tdp: "400W", interface: "PCIe 4.0 x16", cooling: "Passive", networkSpeed: "25 Gbps" },
    description: "Data center GPU optimized for AI training, HPC, and data analytics. Features 80GB HBM2e memory and NVLink support.",
    tags: ["AI Training", "HPC", "Data Analytics"],
    image: "/gpus/a100.png",
  },
  {
    id: "h100-1",
    name: "NVIDIA H100 SXM",
    model: "H100",
    brand: "NVIDIA",
    vram: 80,
    vramType: "HBM3",
    pricePerHour: 4.50,
    pricePerMonth: 2700,
    provider: { id: "p3", name: "NexusCompute", rating: 5.0, totalRentals: 420, avatar: "N" },
    location: "EU West (Frankfurt)",
    availability: "limited",
    performance: { fp32: 51.2, fp16: 989, tf32: 989 },
    specs: { cores: 16896, boostClock: "1.98 GHz", tdp: "700W", interface: "SXM5", cooling: "Passive + Heatsink", networkSpeed: "40 Gbps" },
    description: "The most powerful data center GPU. Built on the Hopper architecture with Transformer Engine for LLM training and inference.",
    tags: ["LLM", "AI Training", "HPC", "Enterprise"],
    image: "/gpus/h100.png",
  },
  {
    id: "rtx-3090-1",
    name: "NVIDIA RTX 3090",
    model: "RTX 3090",
    brand: "NVIDIA",
    vram: 24,
    vramType: "GDDR6X",
    pricePerHour: 0.45,
    pricePerMonth: 270,
    provider: { id: "p4", name: "GPULand", rating: 4.7, totalRentals: 2100, avatar: "G" },
    location: "US Central (Dallas)",
    availability: "available",
    performance: { fp32: 35.6, fp16: 71.2, tf32: 35.6 },
    specs: { cores: 10496, boostClock: "1.70 GHz", tdp: "350W", interface: "PCIe 4.0 x16", cooling: "Air Cooled", networkSpeed: "10 Gbps" },
    description: "Previous generation flagship with excellent price-to-performance for AI inference and creative workloads.",
    tags: ["AI Inference", "Rendering", "Creative"],
    image: "/gpus/rtx3090.png",
  },
  {
    id: "a10-1",
    name: "NVIDIA A10",
    model: "A10",
    brand: "NVIDIA",
    vram: 24,
    vramType: "GDDR6",
    pricePerHour: 0.80,
    pricePerMonth: 480,
    provider: { id: "p2", name: "DataCenter Hub", rating: 4.8, totalRentals: 650, avatar: "D" },
    location: "Asia Pacific (Tokyo)",
    availability: "available",
    performance: { fp32: 31.2, fp16: 62.4, tf32: 31.2 },
    specs: { cores: 9216, boostClock: "1.70 GHz", tdp: "150W", interface: "PCIe 4.0 x16", cooling: "Passive", networkSpeed: "25 Gbps" },
    description: "Versatile data center GPU for inference, graphics, and video processing. Low power consumption with high efficiency.",
    tags: ["Inference", "Graphics", "Video"],
    image: "/gpus/a10.png",
  },
  {
    id: "mi300x-1",
    name: "AMD MI300X",
    model: "MI300X",
    brand: "AMD",
    vram: 192,
    vramType: "HBM3",
    pricePerHour: 3.80,
    pricePerMonth: 2280,
    provider: { id: "p5", name: "AMD Cloud", rating: 4.6, totalRentals: 310, avatar: "A" },
    location: "US East (Virginia)",
    availability: "limited",
    performance: { fp32: 163.4, fp16: 1307, tf32: 1307 },
    specs: { cores: 30464, boostClock: "2.10 GHz", tdp: "750W", interface: "PCIe 5.0 x16", cooling: "Passive + Liquid", networkSpeed: "40 Gbps" },
    description: "AMD's flagship AI accelerator with 192GB HBM3 memory. Ideal for large language model training and HPC workloads.",
    tags: ["LLM", "HPC", "AMD", "Enterprise"],
    image: "/gpus/mi300x.png",
  },
  {
    id: "rtx-4080-1",
    name: "NVIDIA RTX 4080",
    model: "RTX 4080",
    brand: "NVIDIA",
    vram: 16,
    vramType: "GDDR6X",
    pricePerHour: 0.55,
    pricePerMonth: 330,
    provider: { id: "p1", name: "CloudGPU Pro", rating: 4.9, totalRentals: 980, avatar: "C" },
    location: "EU Central (Amsterdam)",
    availability: "available",
    performance: { fp32: 48.7, fp16: 97.4, tf32: 48.7 },
    specs: { cores: 9728, boostClock: "2.51 GHz", tdp: "320W", interface: "PCIe 4.0 x16", cooling: "Air Cooled", networkSpeed: "10 Gbps" },
    description: "High-performance GPU for AI inference and content creation. Excellent balance of price and performance.",
    tags: ["AI Inference", "Creative", "Gaming"],
    image: "/gpus/rtx4080.png",
  },
  {
    id: "a100-40g-1",
    name: "NVIDIA A100 40GB",
    model: "A100",
    brand: "NVIDIA",
    vram: 40,
    vramType: "HBM2e",
    pricePerHour: 1.80,
    pricePerMonth: 1080,
    provider: { id: "p3", name: "NexusCompute", rating: 5.0, totalRentals: 720, avatar: "N" },
    location: "US East (Virginia)",
    availability: "available",
    performance: { fp32: 19.5, fp16: 312, tf32: 156 },
    specs: { cores: 6912, boostClock: "1.41 GHz", tdp: "400W", interface: "PCIe 4.0 x16", cooling: "Passive", networkSpeed: "25 Gbps" },
    description: "Cost-effective data center GPU with 40GB HBM2e memory. Perfect for medium-scale AI training and HPC.",
    tags: ["AI Training", "HPC", "Cost-Effective"],
    image: "/gpus/a100-40g.png",
  },
  {
    id: "rtx-4070ti-1",
    name: "NVIDIA RTX 4070 Ti",
    model: "RTX 4070 Ti",
    brand: "NVIDIA",
    vram: 12,
    vramType: "GDDR6X",
    pricePerHour: 0.35,
    pricePerMonth: 210,
    provider: { id: "p4", name: "GPULand", rating: 4.7, totalRentals: 1850, avatar: "G" },
    location: "US West (Oregon)",
    availability: "available",
    performance: { fp32: 40.1, fp16: 80.2, tf32: 40.1 },
    specs: { cores: 7680, boostClock: "2.61 GHz", tdp: "285W", interface: "PCIe 4.0 x16", cooling: "Air Cooled", networkSpeed: "10 Gbps" },
    description: "Budget-friendly GPU for AI inference, gaming, and creative workloads. Great entry point for developers.",
    tags: ["Budget", "AI Inference", "Gaming"],
    image: "/gpus/rtx4070ti.png",
  },
  {
    id: "mi250-1",
    name: "AMD MI250",
    model: "MI250",
    brand: "AMD",
    vram: 128,
    vramType: "HBM2e",
    pricePerHour: 2.20,
    pricePerMonth: 1320,
    provider: { id: "p5", name: "AMD Cloud", rating: 4.6, totalRentals: 280, avatar: "A" },
    location: "Asia Pacific (Singapore)",
    availability: "available",
    performance: { fp32: 45.3, fp16: 362.4, tf32: 181.2 },
    specs: { cores: 13312, boostClock: "1.70 GHz", tdp: "560W", interface: "PCIe 4.0 x16", cooling: "Passive + Liquid", networkSpeed: "25 Gbps" },
    description: "High-performance AMD GPU for HPC and AI workloads. Features 128GB HBM2e memory for large models.",
    tags: ["HPC", "AMD", "AI Training"],
    image: "/gpus/mi250.png",
  },
  {
    id: "rtx-a6000-1",
    name: "NVIDIA RTX A6000",
    model: "RTX A6000",
    brand: "NVIDIA",
    vram: 48,
    vramType: "GDDR6",
    pricePerHour: 1.20,
    pricePerMonth: 720,
    provider: { id: "p2", name: "DataCenter Hub", rating: 4.8, totalRentals: 540, avatar: "D" },
    location: "EU West (London)",
    availability: "limited",
    performance: { fp32: 38.7, fp16: 77.4, tf32: 38.7 },
    specs: { cores: 10752, boostClock: "2.40 GHz", tdp: "300W", interface: "PCIe 4.0 x16", cooling: "Passive", networkSpeed: "25 Gbps" },
    description: "Professional workstation GPU with 48GB memory. Ideal for large dataset training, rendering, and simulation.",
    tags: ["Professional", "Rendering", "Simulation"],
    image: "/gpus/rtxa6000.png",
  },
  {
    id: "l4-1",
    name: "NVIDIA L4",
    model: "L4",
    brand: "NVIDIA",
    vram: 24,
    vramType: "GDDR6",
    pricePerHour: 0.70,
    pricePerMonth: 420,
    provider: { id: "p3", name: "NexusCompute", rating: 5.0, totalRentals: 390, avatar: "N" },
    location: "US Central (Dallas)",
    availability: "available",
    performance: { fp32: 30.0, fp16: 120, tf32: 60 },
    specs: { cores: 7424, boostClock: "2.04 GHz", tdp: "72W", interface: "PCIe 4.0 x16", cooling: "Passive", networkSpeed: "25 Gbps" },
    description: "Energy-efficient GPU optimized for video processing, AI inference, and graphics virtualization. Ultra-low power.",
    tags: ["Video", "Energy Efficient", "Inference"],
    image: "/gpus/l4.png",
  },
];

export const mockRentals: Rental[] = [
  { id: "r1", gpuId: "rtx-4090-1", gpuName: "NVIDIA RTX 4090", status: "active", startDate: "2024-01-15T10:00:00Z", endDate: null, totalCost: 3.75, hoursUsed: 5 },
  { id: "r2", gpuId: "a100-1", gpuName: "NVIDIA A100 80GB", status: "completed", startDate: "2024-01-10T08:00:00Z", endDate: "2024-01-12T16:00:00Z", totalCost: 150, hoursUsed: 60 },
  { id: "r3", gpuId: "rtx-3090-1", gpuName: "NVIDIA RTX 3090", status: "completed", startDate: "2024-01-05T14:00:00Z", endDate: "2024-01-06T14:00:00Z", totalCost: 10.8, hoursUsed: 24 },
];
