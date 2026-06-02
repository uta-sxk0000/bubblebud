import { createStripe } from "@/lib/stripe";

function normalizeStripeAddress(address = {}) {
  return {
    line1: address.line1 || address.line_1 || "",
    line2: address.line2 || address.line_2 || undefined,
    city: address.city || "",
    state: address.state || "",
    postal_code: address.postalCode || address.postal_code || "",
    country: address.country || "US",
  };
}

export function hasCompleteTaxAddress(address = {}) {
  return Boolean(address.line1?.trim() && address.city?.trim() && address.state?.trim() && address.postalCode?.trim());
}

export async function calculateStripeTax({ currency = "usd", items, shippingAddress, shippingCents = 0 }) {
  if (!hasCompleteTaxAddress(shippingAddress)) {
    return {
      taxCents: 0,
      totalCents: items.reduce((sum, item) => sum + Number(item.total_cents || 0), 0) + shippingCents,
      calculationId: null,
    };
  }

  const stripe = createStripe();
  const calculation = await stripe.tax.calculations.create({
    currency,
    customer_details: {
      address: normalizeStripeAddress(shippingAddress),
      address_source: "shipping",
    },
    line_items: items.map((item, index) => ({
      amount: item.total_cents,
      reference: `${item.product_id}-${item.variant || "default"}-${index}`,
      quantity: item.quantity,
      tax_behavior: "exclusive",
    })),
    ...(shippingCents > 0
      ? {
          shipping_cost: {
            amount: shippingCents,
            tax_behavior: "exclusive",
          },
        }
      : {}),
  });

  return {
    taxCents: calculation.tax_amount_exclusive || 0,
    totalCents:
      calculation.amount_total ||
      items.reduce((sum, item) => sum + Number(item.total_cents || 0), 0) + shippingCents + (calculation.tax_amount_exclusive || 0),
    calculationId: calculation.id,
  };
}
