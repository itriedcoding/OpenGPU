import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const GPU_DATA = [
  { name: "CloudGPU Pro - RTX 4090 #1", model: "RTX 4090", vram: 24, memory: 64, storage: 1000, cores: 16384, clockSpeed: 2.52, pricePerHour: 0.75, location: "US East (Virginia)", country: "US", description: "Flagship gaming and AI GPU with 24GB GDDR6X memory. Excellent for deep learning training, inference, and rendering workloads." },
  { name: "DataCenter Hub - A100 80GB #1", model: "A100 80GB", vram: 80, memory: 128, storage: 2000, cores: 6912, clockSpeed: 1.41, pricePerHour: 2.50, location: "US West (Oregon)", country: "US", description: "Data center GPU optimized for AI training, HPC, and data analytics. Features 80GB HBM2e memory and NVLink support." },
  { name: "NexusCompute - H100 SXM #1", model: "H100 SXM", vram: 80, memory: 256, storage: 4000, cores: 16896, clockSpeed: 1.98, pricePerHour: 4.50, location: "EU West (Frankfurt)", country: "DE", description: "The most powerful data center GPU. Built on the Hopper architecture with Transformer Engine for LLM training and inference." },
  { name: "GPULand - RTX 3090 #1", model: "RTX 3090", vram: 24, memory: 64, storage: 1000, cores: 10496, clockSpeed: 1.70, pricePerHour: 0.45, location: "US Central (Dallas)", country: "US", description: "Previous generation flagship with excellent price-to-performance for AI inference and creative workloads." },
  { name: "DataCenter Hub - A10 #1", model: "A10", vram: 24, memory: 64, storage: 1000, cores: 9216, clockSpeed: 1.70, pricePerHour: 0.80, location: "Asia Pacific (Tokyo)", country: "JP", description: "Versatile data center GPU for inference, graphics, and video processing. Low power consumption with high efficiency." },
  { name: "AMD Cloud - MI300X #1", model: "MI300X", vram: 192, memory: 512, storage: 4000, cores: 30464, clockSpeed: 2.10, pricePerHour: 3.80, location: "US East (Virginia)", country: "US", description: "AMD's flagship AI accelerator with 192GB HBM3 memory. Ideal for large language model training and HPC workloads." },
  { name: "CloudGPU Pro - RTX 4080 #1", model: "RTX 4080", vram: 16, memory: 64, storage: 1000, cores: 9728, clockSpeed: 2.51, pricePerHour: 0.55, location: "EU Central (Amsterdam)", country: "NL", description: "High-performance GPU for AI inference and content creation. Excellent balance of price and performance." },
  { name: "NexusCompute - A100 40GB #1", model: "A100 40GB", vram: 40, memory: 128, storage: 2000, cores: 6912, clockSpeed: 1.41, pricePerHour: 1.80, location: "US East (Virginia)", country: "US", description: "Cost-effective data center GPU with 40GB HBM2e memory. Perfect for medium-scale AI training and HPC." },
  { name: "GPULand - RTX 4070 Ti #1", model: "RTX 4070 Ti", vram: 12, memory: 32, storage: 500, cores: 7680, clockSpeed: 2.61, pricePerHour: 0.35, location: "US West (Oregon)", country: "US", description: "Budget-friendly GPU for AI inference, gaming, and creative workloads. Great entry point for developers." },
  { name: "AMD Cloud - MI250 #1", model: "MI250", vram: 128, memory: 256, storage: 2000, cores: 13312, clockSpeed: 1.70, pricePerHour: 2.20, location: "Asia Pacific (Singapore)", country: "SG", description: "High-performance AMD GPU for HPC and AI workloads. Features 128GB HBM2e memory for large models." },
  { name: "DataCenter Hub - RTX A6000 #1", model: "RTX A6000", vram: 48, memory: 128, storage: 2000, cores: 10752, clockSpeed: 2.40, pricePerHour: 1.20, location: "EU West (London)", country: "GB", description: "Professional workstation GPU with 48GB memory. Ideal for large dataset training, rendering, and simulation." },
  { name: "NexusCompute - L4 #1", model: "L4", vram: 24, memory: 64, storage: 1000, cores: 7424, clockSpeed: 2.04, pricePerHour: 0.70, location: "US Central (Dallas)", country: "US", description: "Energy-efficient GPU optimized for video processing, AI inference, and graphics virtualization. Ultra-low power." },
];

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@opengpu.io" },
    update: {},
    create: {
      email: "admin@opengpu.io",
      password: adminPassword,
      name: "OpenGPU Admin",
      role: "admin",
    },
  });
  console.log(`Admin user: ${admin.email}`);

  // Create provider users
  const providerPassword = await bcrypt.hash("provider123!", 12);
  const providers = [];
  const providerNames = [
    { name: "CloudGPU Pro", email: "cloudgpu@example.com" },
    { name: "DataCenter Hub", email: "datacenter@example.com" },
    { name: "NexusCompute", email: "nexus@example.com" },
    { name: "GPULand", email: "gpuland@example.com" },
    { name: "AMD Cloud", email: "amdcloud@example.com" },
  ];

  for (const p of providerNames) {
    const user = await prisma.user.upsert({
      where: { email: p.email },
      update: {},
      create: {
        email: p.email,
        password: providerPassword,
        name: p.name,
        role: "provider",
      },
    });
    providers.push(user);
  }
  console.log(`Created ${providers.length} provider users`);

  // Create GPU nodes
  for (let i = 0; i < GPU_DATA.length; i++) {
    const gpu = GPU_DATA[i];
    const provider = providers[i % providers.length];
    const apiKey = `node_${Buffer.from(require("crypto").randomBytes(16)).toString("hex")}`;

    await prisma.gpuNode.create({
      data: {
        name: gpu.name,
        model: gpu.model,
        vram: gpu.vram,
        memory: gpu.memory,
        storage: gpu.storage,
        cores: gpu.cores,
        clockSpeed: gpu.clockSpeed,
        pricePerHour: gpu.pricePerHour,
        location: gpu.location,
        country: gpu.country,
        description: gpu.description,
        status: "available",
        online: true,
        apiKey,
        providerId: provider.id,
      },
    });
  }
  console.log(`Created ${GPU_DATA.length} GPU nodes`);

  // Create a demo user
  const demoPassword = await bcrypt.hash("demo1234!", 12);
  await prisma.user.upsert({
    where: { email: "demo@opengpu.io" },
    update: {},
    create: {
      email: "demo@opengpu.io",
      password: demoPassword,
      name: "Demo User",
      role: "user",
    },
  });
  console.log("Demo user: demo@opengpu.io / demo1234!");

  console.log("\nSeed complete!");
  console.log("\nTest accounts:");
  console.log("  Admin:     admin@opengpu.io / admin123!");
  console.log("  Provider:  cloudgpu@example.com / provider123!");
  console.log("  User:      demo@opengpu.io / demo1234!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
