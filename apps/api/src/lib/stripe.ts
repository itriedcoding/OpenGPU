import Stripe from "stripe";

const apiKey = process.env.STRIPE_SECRET_KEY;

// Only initialize Stripe if a real key is provided
const stripe = apiKey && apiKey !== "sk_test_placeholder"
  ? new Stripe(apiKey, { apiVersion: "2024-06-20" as any })
  : null;

export function getStripe(): Stripe {
  if (!stripe) {
    throw new Error("Stripe is not configured. Set STRIPE_SECRET_KEY environment variable.");
  }
  return stripe;
}

export default stripe;
