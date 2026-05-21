import Stripe from "stripe";
import { requiredEnv } from "@/lib/env";

export function createStripe() {
  return new Stripe(requiredEnv("STRIPE_SECRET_KEY"), {
    apiVersion: "2025-10-29.clover",
  });
}
