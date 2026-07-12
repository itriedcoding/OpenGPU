import { Router, Response } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate";
import { verifyToken, requireRole, AuthRequest } from "../middleware/auth";
import prisma from "../lib/prisma";
import paymentService from "../services/payment";

const router = Router();

router.use(verifyToken);
router.use(requireRole("provider", "admin"));

router.get("/dashboard", async (req: AuthRequest, res: Response) => {
  try {
    const providerId = req.user!.userId;

    const [totalNodes, activeNodes, totalRentals, activeRentals, totalEarnings, recentRentals] =
      await Promise.all([
        prisma.gpuNode.count({ where: { providerId } }),
        prisma.gpuNode.count({ where: { providerId, status: "rented" } }),
        prisma.rental.count({ where: { gpuNode: { providerId } } }),
        prisma.rental.count({ where: { gpuNode: { providerId }, status: "active" } }),
        prisma.rental.aggregate({
          where: { gpuNode: { providerId }, status: "completed" },
          _sum: { totalCost: true },
        }),
        prisma.rental.findMany({
          where: { gpuNode: { providerId } },
          include: { gpuNode: { select: { name: true, model: true } }, user: { select: { name: true, email: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
      ]);

    const earnings = totalEarnings._sum.totalCost || 0;

    res.json({
      stats: {
        totalNodes,
        activeNodes,
        offlineNodes: totalNodes - activeNodes,
        totalRentals,
        activeRentals,
        totalEarnings: Math.round(earnings * 100) / 100,
        estimatedPayout: Math.round(earnings * 0.8 * 100) / 100,
      },
      recentRentals,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/nodes", async (req: AuthRequest, res: Response) => {
  try {
    const nodes = await prisma.gpuNode.findMany({
      where: { providerId: req.user!.userId },
      include: {
        metrics: { orderBy: { createdAt: "desc" }, take: 1 },
        _count: { select: { rentals: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ nodes });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/payouts", async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await paymentService.getProviderPayouts(req.user!.userId, page, limit);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const withdrawSchema = z.object({
  amount: z.number().min(10),
  method: z.enum(["stripe", "paypal", "bank"]).optional(),
});

router.post("/payouts/withdraw", validate(withdrawSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { amount, method } = req.body;
    const payout = await paymentService.createProviderPayout(req.user!.userId, amount, method);
    res.status(201).json({ payout });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
