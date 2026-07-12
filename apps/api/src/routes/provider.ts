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

    const [nodes, totalRentals, activeRentals, completedRentals] =
      await Promise.all([
        prisma.gpuNode.findMany({
          where: { providerId },
          include: {
            metrics: { orderBy: { createdAt: "desc" }, take: 1 },
            _count: { select: { rentals: true } },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.rental.count({ where: { gpuNode: { providerId } } }),
        prisma.rental.count({ where: { gpuNode: { providerId }, status: "active" } }),
        prisma.rental.findMany({
          where: { gpuNode: { providerId }, status: "completed" },
          select: { totalCost: true, createdAt: true },
        }),
      ]);

    const totalEarnings = completedRentals.reduce((sum, r) => sum + (r.totalCost || 0), 0);
    const activeNodeCount = nodes.filter((n) => n.status === "available" || n.online).length;

    const now = new Date();
    const thisMonthRentals = completedRentals.filter((r) => {
      const d = new Date(r.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const thisMonth = thisMonthRentals.reduce((sum, r) => sum + (r.totalCost || 0), 0);

    const monthlyEarnings = Array(12).fill(0);
    completedRentals.forEach((r) => {
      const d = new Date(r.createdAt);
      const month = d.getMonth();
      if (d.getFullYear() === now.getFullYear()) {
        monthlyEarnings[month] += r.totalCost || 0;
      }
    });

    const avgUptime = nodes.length > 0
      ? nodes.reduce((sum, n) => {
          const latestMetric = n.metrics[0];
          return sum + (latestMetric ? 100 : (n.online ? 99.9 : 0));
        }, 0) / nodes.length
      : 0;

    const formattedNodes = nodes.map((n) => ({
      id: n.id,
      name: n.name,
      gpu: n.model,
      vram: n.vram,
      status: n.online ? (n.status === "rented" ? "rented" : "online") : "offline",
      uptime: n.online ? "99.9" : "0",
      earnings: 0,
      location: n.location,
    }));

    res.json({
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      activeNodes: activeNodeCount,
      avgUptime: Math.round(avgUptime * 100) / 100,
      thisMonth: Math.round(thisMonth * 100) / 100,
      nodes: formattedNodes,
      monthlyEarnings: monthlyEarnings.map((e) => Math.round(e * 100) / 100),
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
