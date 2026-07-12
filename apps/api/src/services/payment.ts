import prisma from "../lib/prisma";
import stripe from "../lib/stripe";

export class PaymentService {
  async createPaymentIntent(userId: string, amount: number, currency: string = "usd", metadata?: Record<string, string>) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      customer: customerId,
      metadata: { userId, ...metadata },
      automatic_payment_methods: { enabled: true },
    });

    const payment = await prisma.payment.create({
      data: {
        userId,
        amount,
        currency,
        stripePaymentIntentId: paymentIntent.id,
        status: "pending",
        metadata: JSON.stringify(metadata),
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentId: payment.id,
      paymentIntentId: paymentIntent.id,
    };
  }

  async confirmPayment(paymentIntentId: string) {
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntentId },
    });
    if (!payment) throw new Error("Payment not found");

    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (intent.status === "succeeded") {
      const updated = await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "completed" },
      });

      if (payment.rentalId) {
        await prisma.rental.update({
          where: { id: payment.rentalId },
          data: { totalCost: { increment: payment.amount } },
        });
      }

      return updated;
    }

    return payment;
  }

  async getPaymentHistory(userId: string, page: number = 1, limit: number = 20) {
    const where = { userId };
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          rental: { select: { id: true, gpuNode: { select: { name: true, model: true } } } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ]);

    return {
      payments,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async handleWebhook(event: any) {
    switch (event.type) {
      case "payment_intent.succeeded":
        await this.confirmPayment(event.data.object.id);
        break;
      case "payment_intent.payment_failed":
        await this.handleFailedPayment(event.data.object.id);
        break;
    }
  }

  private async handleFailedPayment(paymentIntentId: string) {
    await prisma.payment.updateMany({
      where: { stripePaymentIntentId: paymentIntentId },
      data: { status: "failed" },
    });
  }

  async createProviderPayout(userId: string, amount: number, method: string = "stripe") {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    const completedRentals = await prisma.rental.findMany({
      where: {
        gpuNode: { providerId: userId },
        status: "completed",
      },
      include: { gpuNode: true },
    });

    const totalEarnings = completedRentals.reduce((sum, r) => sum + r.totalCost * 0.8, 0);
    if (amount > totalEarnings) {
      throw new Error(`Insufficient balance. Available: $${totalEarnings.toFixed(2)}`);
    }

    const payout = await prisma.providerPayout.create({
      data: {
        userId,
        amount,
        method,
        status: "pending",
      },
    });

    return payout;
  }

  async getProviderPayouts(userId: string, page: number = 1, limit: number = 20) {
    const where = { userId };
    const [payouts, total] = await Promise.all([
      prisma.providerPayout.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.providerPayout.count({ where }),
    ]);

    return {
      payouts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}

export default new PaymentService();
