import { z } from "zod";

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  variant: z.string().default("Default"),
  quantity: z.number().int().min(1).max(20),
});

export const checkoutSchema = z.object({
  items: z.array(cartItemSchema).min(1),
  provider: z.enum(["stripe", "paypal"]).default("stripe"),
  checkoutMode: z.enum(["guest", "account"]).default("guest"),
  customer: z.object({
    name: z.string().min(1).max(140),
    email: z.string().email(),
    phone: z.string().max(40).optional().default(""),
  }).optional(),
  shippingAddress: z.object({
    line1: z.string().min(1).max(160),
    line2: z.string().max(160).optional().default(""),
    city: z.string().min(1).max(100),
    state: z.string().min(1).max(80),
    postalCode: z.string().min(1).max(20),
    country: z.string().min(2).max(2).default("US"),
  }).optional(),
  billingAddress: z.object({
    line1: z.string().min(1).max(160),
    line2: z.string().max(160).optional().default(""),
    city: z.string().min(1).max(100),
    state: z.string().min(1).max(80),
    postalCode: z.string().min(1).max(20),
    country: z.string().min(2).max(2).default("US"),
  }).optional(),
  discountCode: z.string().max(40).optional(),
  saveAddress: z.boolean().optional().default(false),
}).superRefine((payload, context) => {
  if (!payload.customer?.name) {
    context.addIssue({ code: "custom", path: ["customer", "name"], message: "Name is required for checkout." });
  }
  if (!payload.customer?.email) {
    context.addIssue({ code: "custom", path: ["customer", "email"], message: "Email is required for checkout." });
  }
  if (!payload.shippingAddress) {
    context.addIssue({ code: "custom", path: ["shippingAddress"], message: "Shipping address is required for checkout." });
  }
  if (!payload.billingAddress) {
    context.addIssue({ code: "custom", path: ["billingAddress"], message: "Billing address is required for checkout." });
  }
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
