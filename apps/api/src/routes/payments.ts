import { Router, Response } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate";
import { verifyToken, AuthRequest } from "../middleware/auth";
import paymentService from "../services/payment";

const router = Router();

router.use(verifyToken);

const createIntentSchema = z.object({
  amount: z.number().min(1),
  currency: z.string().optional(),
  rentalId: z.string().uuid().optional(),
});

router.post("/create-intent", validate(createIntentSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { amount, currency, rentalId } = req.body;
    const metadata: Record<string, string> = {};
    if (rentalId) metadata.rentalId = rentalId;

    const result = await paymentService.createPaymentIntent(
      req.user!.userId,
      amount,
      currency,
      Object.keys(metadata).length > 0 ? metadata : undefined
    );
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

const confirmSchema = z.object({
  paymentIntentId: z.string().min(1),
});

router.post("/confirm", validate(confirmSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { paymentIntentId } = req.body;
    const payment = await paymentService.confirmPayment(paymentIntentId);
    res.json({ payment });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/history", async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await paymentService.getPaymentHistory(req.user!.userId, page, limit);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/webhook", async (req: AuthRequest, res: Response) => {
  try {
    const sig = req.headers["stripe-signature"] as string;
    if (!sig) {
      res.status(400).json({ error: "Missing stripe-signature header" });
      return;
    }

    // In production, verify webhook signature with stripe.webhooks.constructEvent
    await paymentService.handleWebhook(req.body);
    res.json({ received: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
