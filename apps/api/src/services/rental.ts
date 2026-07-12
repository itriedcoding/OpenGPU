import prisma from "../lib/prisma";

export class RentalService {
  async startRental(userId: string, gpuNodeId: string, options: {
    billingCycle?: string;
    durationHours?: number;
  } = {}) {
    const gpu = await prisma.gpuNode.findUnique({ where: { id: gpuNodeId } });
    if (!gpu) throw new Error("GPU node not found");
    if (gpu.status !== "available") throw new Error("GPU node is not available");
    if (!gpu.online) throw new Error("GPU node is offline");

    const existingRental = await prisma.rental.findFirst({
      where: { userId, gpuNodeId, status: "active" },
    });
    if (existingRental) throw new Error("You already have an active rental for this node");

    const expiresAt = options.durationHours
      ? new Date(Date.now() + options.durationHours * 60 * 60 * 1000)
      : null;

    const [rental] = await prisma.$transaction([
      prisma.rental.create({
        data: {
          userId,
          gpuNodeId,
          billingCycle: options.billingCycle || "hourly",
          expiresAt,
          status: "active",
        },
        include: {
          gpuNode: { select: { name: true, model: true, pricePerHour: true } },
        },
      }),
      prisma.gpuNode.update({
        where: { id: gpuNodeId },
        data: { status: "rented" },
      }),
    ]);

    return rental;
  }

  async listUserRentals(userId: string, filters: { status?: string; page?: number; limit?: number } = {}) {
    const { status, page = 1, limit = 20 } = filters;
    const where: any = { userId };
    if (status) where.status = status;

    const [rentals, total] = await Promise.all([
      prisma.rental.findMany({
        where,
        include: {
          gpuNode: {
            select: { id: true, name: true, model: true, vram: true, pricePerHour: true, location: true },
          },
          _count: { select: { payments: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.rental.count({ where }),
    ]);

    return {
      rentals,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getRental(id: string, userId: string) {
    const rental = await prisma.rental.findUnique({
      where: { id },
      include: {
        gpuNode: {
          include: {
            provider: { select: { id: true, name: true } },
            metrics: { orderBy: { createdAt: "desc" }, take: 5 },
          },
        },
        payments: { orderBy: { createdAt: "desc" }, take: 10 },
        jobs: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });
    if (!rental) throw new Error("Rental not found");
    if (rental.userId !== userId) throw new Error("Not authorized");
    return rental;
  }

  async stopRental(id: string, userId: string) {
    const rental = await prisma.rental.findUnique({
      where: { id },
      include: { gpuNode: true },
    });
    if (!rental) throw new Error("Rental not found");
    if (rental.userId !== userId) throw new Error("Not authorized");
    if (rental.status !== "active") throw new Error("Rental is not active");

    const now = new Date();
    const hours = (now.getTime() - rental.startedAt.getTime()) / (1000 * 60 * 60);
    const totalCost = hours * rental.gpuNode.pricePerHour;

    const [updated] = await prisma.$transaction([
      prisma.rental.update({
        where: { id },
        data: {
          status: "completed",
          stoppedAt: now,
          totalHours: Math.round(hours * 100) / 100,
          totalCost: Math.round(totalCost * 100) / 100,
        },
      }),
      prisma.gpuNode.update({
        where: { id: rental.gpuNodeId },
        data: { status: "available" },
      }),
    ]);

    return updated;
  }

  async extendRental(id: string, userId: string, additionalHours: number) {
    const rental = await prisma.rental.findUnique({ where: { id } });
    if (!rental) throw new Error("Rental not found");
    if (rental.userId !== userId) throw new Error("Not authorized");
    if (rental.status !== "active") throw new Error("Rental is not active");

    const currentExpiry = rental.expiresAt || new Date();
    const newExpiry = new Date(currentExpiry.getTime() + additionalHours * 60 * 60 * 1000);

    return prisma.rental.update({
      where: { id },
      data: { expiresAt: newExpiry },
    });
  }

  async getRentalLogs(id: string, userId: string) {
    const rental = await prisma.rental.findUnique({
      where: { id },
      include: { gpuNode: true },
    });
    if (!rental) throw new Error("Rental not found");
    if (rental.userId !== userId) throw new Error("Not authorized");

    const jobs = await prisma.job.findMany({
      where: { rentalId: id },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return jobs;
  }

  async calculateCost(rentalId: string) {
    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
      include: { gpuNode: { select: { pricePerHour: true } } },
    });
    if (!rental) throw new Error("Rental not found");

    const now = new Date();
    const endTime = rental.stoppedAt || now;
    const hours = (endTime.getTime() - rental.startedAt.getTime()) / (1000 * 60 * 60);
    const cost = hours * rental.gpuNode.pricePerHour;

    return {
      hours: Math.round(hours * 100) / 100,
      rate: rental.gpuNode.pricePerHour,
      totalCost: Math.round(cost * 100) / 100,
    };
  }

  async cleanupExpiredRentals() {
    const expired = await prisma.rental.findMany({
      where: {
        status: "active",
        expiresAt: { lt: new Date() },
      },
    });

    for (const rental of expired) {
      await this.stopRental(rental.id, rental.userId);
    }

    return expired.length;
  }
}

export default new RentalService();
