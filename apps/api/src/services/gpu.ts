import { v4 as uuidv4 } from "uuid";
import prisma from "../lib/prisma";

export class GpuService {
  async listGpus(filters: {
    model?: string;
    minMemory?: number;
    maxPrice?: number;
    location?: string;
    status?: string;
    available?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const {
      model,
      minMemory,
      maxPrice,
      location,
      status,
      available,
      page = 1,
      limit = 20,
      sortBy = "pricePerHour",
      sortOrder = "asc",
    } = filters;

    const where: any = {};
    if (model) where.model = { contains: model };
    if (minMemory) where.vram = { gte: minMemory };
    if (maxPrice) where.pricePerHour = { lte: maxPrice };
    if (location) where.location = { contains: location };
    if (status) where.status = status;
    if (available) {
      where.status = "available";
      where.online = true;
    }

    const [gpus, total] = await Promise.all([
      prisma.gpuNode.findMany({
        where,
        include: {
          provider: { select: { id: true, name: true } },
          _count: { select: { rentals: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.gpuNode.count({ where }),
    ]);

    return {
      gpus,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getGpu(id: string) {
    const gpu = await prisma.gpuNode.findUnique({
      where: { id },
      include: {
        provider: { select: { id: true, name: true } },
        metrics: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: { select: { rentals: true, jobs: true } },
      },
    });
    if (!gpu) throw new Error("GPU node not found");
    return gpu;
  }

  async registerGpu(
    providerId: string,
    data: {
      name: string;
      model: string;
      vram: number;
      memory: number;
      storage: number;
      cores?: number;
      clockSpeed?: number;
      pricePerHour: number;
      location: string;
      country: string;
      description?: string;
      ipAddress?: string;
      port?: number;
    }
  ) {
    const apiKey = `node_${uuidv4().replace(/-/g, "")}`;
    const gpu = await prisma.gpuNode.create({
      data: {
        ...data,
        providerId,
        apiKey,
        status: "available",
        online: true,
      },
    });
    return gpu;
  }

  async updateGpu(id: string, providerId: string, data: Record<string, any>) {
    const existing = await prisma.gpuNode.findUnique({ where: { id } });
    if (!existing) throw new Error("GPU node not found");
    if (existing.providerId !== providerId) throw new Error("Not authorized to update this node");

    const allowedFields = [
      "name", "description", "pricePerHour", "location", "country",
      "status", "online", "memory", "storage", "ipAddress", "port",
    ];
    const updateData: Record<string, any> = {};
    for (const field of allowedFields) {
      if (data[field] !== undefined) updateData[field] = data[field];
    }

    return prisma.gpuNode.update({ where: { id }, data: updateData });
  }

  async deleteGpu(id: string, providerId: string) {
    const existing = await prisma.gpuNode.findUnique({ where: { id } });
    if (!existing) throw new Error("GPU node not found");
    if (existing.providerId !== providerId) throw new Error("Not authorized to delete this node");

    const activeRentals = await prisma.rental.count({
      where: { gpuNodeId: id, status: "active" },
    });
    if (activeRentals > 0) throw new Error("Cannot delete node with active rentals");

    await prisma.nodeMetrics.deleteMany({ where: { gpuNodeId: id } });
    return prisma.gpuNode.delete({ where: { id } });
  }

  async getMetrics(id: string, hours: number = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    return prisma.nodeMetrics.findMany({
      where: {
        gpuNodeId: id,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async recordHeartbeat(id: string, metrics: {
    gpuUtilization?: number;
    memoryUtilization?: number;
    temperature?: number;
    powerUsage?: number;
    fanSpeed?: number;
    diskUsage?: number;
    cpuUsage?: number;
    networkIn?: number;
    networkOut?: number;
    agentVersion?: string;
  }) {
    const gpu = await prisma.gpuNode.findUnique({ where: { id } });
    if (!gpu) throw new Error("GPU node not found");

    await prisma.gpuNode.update({
      where: { id },
      data: {
        lastHeartbeat: new Date(),
        online: true,
        agentVersion: metrics.agentVersion || gpu.agentVersion,
      },
    });

    return prisma.nodeMetrics.create({
      data: {
        gpuNodeId: id,
        gpuUtilization: metrics.gpuUtilization,
        memoryUtilization: metrics.memoryUtilization,
        temperature: metrics.temperature,
        powerUsage: metrics.powerUsage,
        fanSpeed: metrics.fanSpeed,
        diskUsage: metrics.diskUsage,
        cpuUsage: metrics.cpuUsage,
        networkIn: metrics.networkIn,
        networkOut: metrics.networkOut,
      },
    });
  }

  async checkOfflineNodes() {
    const threshold = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes
    return prisma.gpuNode.updateMany({
      where: {
        online: true,
        lastHeartbeat: { lt: threshold },
      },
      data: { online: false },
    });
  }
}

export default new GpuService();
