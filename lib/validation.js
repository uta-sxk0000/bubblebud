import { z } from "zod";

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  variant: z.string().default("Default"),
  quantity: z.number().int().min(1).max(20),
});

export const checkoutSchema = z.object({
  items: z.array(cartItemSchema).min(1),
  customerEmail: z.string().email().optional(),
  discountCode: z.string().max(40).optional(),
});

export const reviewSchema = z.object({
  productId: z.string().min(1),
  orderId: z.string().uuid().optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional().default(""),
  body: z.string().max(2000).optional().default(""),
});

export const contactSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  orderNumber: z.string().max(40).optional().default(""),
  subject: z.string().min(1).max(160),
  message: z.string().min(1).max(4000),
});

export function jsonError(message, status = 400) {
  return Response.json({ error: message }, { status });
}
