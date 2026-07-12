import { Router, Request, Response } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate";
import { verifyToken, AuthRequest } from "../middleware/auth";
import rentalService from "../services/rental";

const router = Router();

const startRentalSchema = z.object({
  gpuNodeId: z.string().uuid(),
  billingCycle: z.enum(["hourly", "daily", "monthly"]).optional(),
  durationHours: z.number().min(1).optional(),
});

const extendRentalSchema = z.object({
  additionalHours: z.number().min(1).max(720),
});

router.use(verifyToken);

router.post("/", validate(startRentalSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { gpuNodeId, billingCycle, durationHours } = req.body;
    const rental = await rentalService.startRental(req.user!.userId, gpuNodeId, {
      billingCycle,
      durationHours,
    });
    res.status(201).json({ rental });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const { status, page, limit } = req.query;
    const result = await rentalService.listUserRentals(req.user!.userId, {
      status: status as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const rental = await rentalService.getRental(req.params.id, req.user!.userId);
    res.json({ rental });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

router.post("/:id/stop", async (req: AuthRequest, res: Response) => {
  try {
    const rental = await rentalService.stopRental(req.params.id, req.user!.userId);
    res.json({ rental });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/:id/extend", validate(extendRentalSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { additionalHours } = req.body;
    const rental = await rentalService.extendRental(req.params.id, req.user!.userId, additionalHours);
    res.json({ rental });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/:id/logs", async (req: AuthRequest, res: Response) => {
  try {
    const logs = await rentalService.getRentalLogs(req.params.id, req.user!.userId);
    res.json({ logs });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
