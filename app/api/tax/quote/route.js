import { calculateShipping } from "@/lib/commerce";
import { hasServiceConfig } from "@/lib/env";
import { getAllowedVariantValues, getVariantGroups, products as seedProducts } from "@/lib/products";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { calculateStripeTax } from "@/lib/tax";
import { cartItemSchema, jsonError } from "@/lib/validation";
import { z } from "zod";

const taxQuoteSchema = z.object({
  items: z.array(cartItemSchema).min(1),
  shippingAddress: z.object({
    line1: z.string().min(1).max(160),
    line2: z.string().max(160).optional().default(""),
    city: z.string().min(1).max(100),
    state: z.string().min(1).max(80),
    postalCode: z.string().min(1).max(20),
    country: z.string().min(2).max(2).default("US"),
  }),
});

function seedProductRow(product) {
  return {
    id: product.id,
    title: product.title,
    sku: `BB-${product.id.toUpperCase()}`,
    price_cents: Math.round(product.price * 100),
    sale_price_cents: null,
    inventory_quantity: product.badge === "Low Stock" ? 4 : 25,
    stock_status: product.badge === "Low Stock" ? "low_stock" : "in_stock",
    variants: getVariantGroups(product),
    active: true,
  };
}

export async function POST(request) {
  let payload;

  try {
    payload = taxQuoteSchema.parse(await request.json());
  } catch {
    return jsonError("Please complete your shipping address to calculate tax.", 422);
  }

  const productIds = [...new Set(payload.items.map((item) => item.productId))];
  let availableProducts = [];

  if (hasServiceConfig()) {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from("products")
      .select("id,title,sku,price_cents,sale_price_cents,inventory_quantity,stock_status,variants,active")
      .in("id", productIds)
      .eq("active", true);

    if (error) return jsonError("Tax quote could not load products.", 500);
    availableProducts = data || [];
  }

  const foundIds = new Set(availableProducts.map((product) => product.id));
  availableProducts.push(
    ...productIds
      .filter((id) => !foundIds.has(id))
      .map((id) => seedProducts.find((product) => product.id === id))
      .filter(Boolean)
      .map(seedProductRow)
  );

  const productMap = new Map(availableProducts.map((product) => [product.id, product]));
  const taxItems = [];

  for (const item of payload.items) {
    const product = productMap.get(item.productId);
    if (!product) return jsonError("One or more cart items are no longer available.", 409);

    const selectedVariant = item.variant || "Default";
    const allowedVariants = getAllowedVariantValues(product);
    if (allowedVariants.size && !allowedVariants.has(selectedVariant)) {
      return jsonError(`${selectedVariant} is not available for ${product.title}.`, 409);
    }

    const unitAmount = product.sale_price_cents || product.price_cents;
    taxItems.push({
      product_id: product.id,
      variant: selectedVariant,
      quantity: item.quantity,
      total_cents: unitAmount * item.quantity,
    });
  }

  const subtotalCents = taxItems.reduce((sum, item) => sum + item.total_cents, 0);
  const shippingCents = calculateShipping(subtotalCents);

  try {
    const tax = await calculateStripeTax({
      items: taxItems,
      shippingAddress: payload.shippingAddress,
      shippingCents,
      currency: "usd",
    });

    return Response.json({
      subtotalCents,
      shippingCents,
      discountCents: 0,
      taxCents: tax.taxCents,
      totalCents: subtotalCents + shippingCents + tax.taxCents,
      taxCalculationId: tax.calculationId,
    });
  } catch (error) {
    console.error("Stripe Tax quote failed", error);
    return jsonError("Tax could not be calculated for this address. Please check the address and try again.", 502);
  }
}
