import { Router, Response } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate";
import { verifyToken, requireRole, AuthRequest } from "../middleware/auth";
import prisma from "../lib/prisma";

const router = Router();

router.use(verifyToken);
router.use(requireRole("admin"));

router.get("/users", async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { name: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          _count: { select: { gpuNodes: true, rentals: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/stats", async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalUsers,
      totalProviders,
      totalNodes,
      activeNodes,
      totalRentals,
      activeRentals,
      totalRevenue,
      recentSignups,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "provider" } }),
      prisma.gpuNode.count(),
      prisma.gpuNode.count({ where: { status: "rented" } }),
      prisma.rental.count(),
      prisma.rental.count({ where: { status: "active" } }),
      prisma.payment.aggregate({ where: { status: "completed" }, _sum: { amount: true } }),
      prisma.user.count({
        where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      }),
    ]);

    res.json({
      stats: {
        totalUsers,
        totalProviders,
        totalNodes,
        activeNodes,
        offlineNodes: totalNodes - activeNodes,
        totalRentals,
        activeRentals,
        totalRevenue: Math.round((totalRevenue._sum.amount || 0) * 100) / 100,
        recentSignups,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const updateNodeStatusSchema = z.object({
  status: z.enum(["available", "rented", "maintenance", "offline"]),
});

router.put("/nodes/:id/status", validate(updateNodeStatusSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const node = await prisma.gpuNode.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json({ node });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
