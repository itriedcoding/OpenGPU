import { Router, Request, Response } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate";
import { verifyToken, optionalAuth, AuthRequest } from "../middleware/auth";
import { requireRole } from "../middleware/auth";
import gpuService from "../services/gpu";
import prisma from "../lib/prisma";

const router = Router();

const listGpusSchema = z.object({
  model: z.string().optional(),
  minMemory: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  location: z.string().optional(),
  status: z.string().optional(),
  available: z.coerce.boolean().optional(),
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

const registerGpuSchema = z.object({
  name: z.string().min(1),
  model: z.string().min(1),
  vram: z.number().min(1),
  memory: z.number().min(1),
  storage: z.number().min(1),
  cores: z.number().optional(),
  clockSpeed: z.number().optional(),
  pricePerHour: z.number().min(0.01),
  location: z.string().min(1),
  country: z.string().min(1),
  description: z.string().optional(),
  ipAddress: z.string().optional(),
  port: z.number().optional(),
});

const updateGpuSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  pricePerHour: z.number().min(0.01).optional(),
  location: z.string().optional(),
  country: z.string().optional(),
  status: z.enum(["available", "maintenance", "offline"]).optional(),
  memory: z.number().optional(),
  storage: z.number().optional(),
  ipAddress: z.string().optional(),
  port: z.number().optional(),
});

const heartbeatSchema = z.object({
  gpuUtilization: z.number().min(0).max(100).optional(),
  memoryUtilization: z.number().min(0).max(100).optional(),
  temperature: z.number().optional(),
  powerUsage: z.number().optional(),
  fanSpeed: z.number().min(0).max(100).optional(),
  diskUsage: z.number().min(0).max(100).optional(),
  cpuUsage: z.number().min(0).max(100).optional(),
  networkIn: z.number().optional(),
  networkOut: z.number().optional(),
  agentVersion: z.string().optional(),
});

router.get("/stats", async (_req: Request, res: Response) => {
  try {
    const [totalGpus, totalProviders, totalRentals] = await Promise.all([
      prisma.gpuNode.count(),
      prisma.user.count({ where: { role: "provider" } }),
      prisma.rental.count(),
    ]);
    res.json({ totalGpus, totalProviders, totalRentals, uptime: 99.9 });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", optionalAuth, validate(listGpusSchema, "query"), async (req: Request, res: Response) => {
  try {
    const result = await gpuService.listGpus(req.query as any);
    res.json({ nodes: result.gpus, pagination: result.pagination });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const gpu = await gpuService.getGpu(req.params.id);
    res.json({ gpu });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

router.post(
  "/",
  verifyToken,
  requireRole("provider", "admin"),
  validate(registerGpuSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const gpu = await gpuService.registerGpu(req.user!.userId, req.body);
      res.status(201).json({ gpu });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

router.put(
  "/:id",
  verifyToken,
  requireRole("provider", "admin"),
  validate(updateGpuSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const gpu = await gpuService.updateGpu(req.params.id, req.user!.userId, req.body);
      res.json({ gpu });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

router.delete(
  "/:id",
  verifyToken,
  requireRole("provider", "admin"),
  async (req: AuthRequest, res: Response) => {
    try {
      await gpuService.deleteGpu(req.params.id, req.user!.userId);
      res.json({ message: "GPU node deleted successfully" });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

router.get("/:id/metrics", async (req: Request, res: Response) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    const metrics = await gpuService.getMetrics(req.params.id, hours);
    res.json({ metrics });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/heartbeat", validate(heartbeatSchema), async (req: Request, res: Response) => {
  try {
    const apiKey = req.headers["x-api-key"] as string;
    if (!apiKey) {
      res.status(401).json({ error: "API key required" });
      return;
    }

    const authService = (await import("../services/auth")).default;
    const keyData = await authService.validateApiKey(apiKey);
    if (!keyData) {
      res.status(401).json({ error: "Invalid API key" });
      return;
    }

    const metrics = await gpuService.recordHeartbeat(req.params.id, req.body);
    res.json({ metrics });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
