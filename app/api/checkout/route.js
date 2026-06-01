import { checkoutSchema, jsonError } from "@/lib/validation";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/server";
import { createStripe } from "@/lib/stripe";
import { calculateShipping } from "@/lib/commerce";
import { getSiteUrl } from "@/lib/env";
import { createPayPalOrder } from "@/lib/paypal";
import { products as seedProducts } from "@/lib/products";
import { rateLimit } from "@/lib/rate-limit";

function absoluteImageUrl(image) {
  if (!image) return undefined;
  try {
    return [new URL(image, getSiteUrl()).toString()];
  } catch {
    return undefined;
  }
}

function seedProductRow(product) {
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    description: product.description,
    category: product.category,
    price_cents: Math.round(product.price * 100),
    compare_at_cents: product.compareAt ? Math.round(product.compareAt * 100) : null,
    sku: `BB-${product.id.toUpperCase()}`,
    inventory_quantity: product.badge === "Low Stock" ? 4 : 25,
    stock_status: product.badge === "Low Stock" ? "low_stock" : "in_stock",
    images: product.gallery,
    variants: product.variants.map((variant, index) => ({ name: variant, color: product.colors[index] || product.colors[0] || variant })),
    tags: product.tags,
    featured: ["New", "New Arrival", "Trending"].includes(product.badge),
    best_seller: product.badge === "Best Seller",
    active: true,
    details: product.details,
    care: product.care,
    shipping: product.shipping,
  };
}

async function saveAccountCheckoutAddress(supabase, user, payload) {
  if (!user?.id || payload.checkoutMode !== "account" || !payload.shippingAddress?.line1) return;

  const address = payload.shippingAddress;
  const fullName = payload.customer?.name || user.user_metadata?.full_name || user.email?.split("@")[0] || "BubbleBud customer";
  const phone = payload.customer?.phone || null;

  const { data: existing } = await supabase
    .from("addresses")
    .select("id")
    .eq("user_id", user.id)
    .eq("line1", address.line1)
    .eq("postal_code", address.postalCode)
    .maybeSingle();

  const row = {
    ...(existing?.id ? { id: existing.id } : {}),
    user_id: user.id,
    label: existing?.id ? "Checkout" : "Checkout",
    full_name: fullName,
    line1: address.line1,
    line2: address.line2 || null,
    city: address.city,
    state: address.state,
    postal_code: address.postalCode,
    country: address.country || "US",
    phone,
  };

  await supabase.from("addresses").upsert(row);
}

export async function POST(request) {
  try {
    rateLimit(request, { key: "checkout", limit: 8, windowMs: 60_000 });
  } catch (error) {
    return jsonError(error.message, error.status || 429);
  }

  let payload;
  try {
    payload = checkoutSchema.parse(await request.json());
  } catch (error) {
    return jsonError(error.message, 422);
  }

  const user = await getCurrentUser();
  const isAccountCheckout = payload.checkoutMode === "account";
  const customerEmail = isAccountCheckout ? user?.email || payload.customer?.email : "";
  const checkoutEmail = customerEmail || `checkout-${crypto.randomUUID()}@bubblebud.app`;
  const emptyAddress = { line1: "", line2: "", city: "", state: "", postalCode: "", country: "US" };
  const supabase = createAdminSupabase();

  const productIds = [...new Set(payload.items.map((item) => item.productId))];
  const { data: products, error: productError } = await supabase
    .from("products")
    .select("id,title,sku,price_cents,sale_price_cents,inventory_quantity,stock_status,images,active")
    .in("id", productIds)
    .eq("active", true);

  if (productError) return jsonError(productError.message, 500);

  const availableProducts = products || [];
  const foundIds = new Set(availableProducts.map((product) => product.id));
  const missingSeedRows = productIds
    .filter((id) => !foundIds.has(id))
    .map((id) => seedProducts.find((product) => product.id === id))
    .filter(Boolean)
    .map(seedProductRow);

  if (missingSeedRows.length) {
    const { error: seedError } = await supabase.from("products").upsert(missingSeedRows, { onConflict: "id" });
    if (seedError) return jsonError(seedError.message, 500);
    availableProducts.push(...missingSeedRows);
  }

  const productMap = new Map(availableProducts.map((product) => [product.id, product]));
  const intentItems = [];
  const stripeLineItems = [];

  for (const item of payload.items) {
    const product = productMap.get(item.productId);
    if (!product) return jsonError("One or more cart items are no longer available.", 409);
    if (product.inventory_quantity < item.quantity || product.stock_status === "out_of_stock") {
      return jsonError(`${product.title} does not have enough stock.`, 409);
    }

    const unitAmount = product.sale_price_cents || product.price_cents;
    const totalCents = unitAmount * item.quantity;

    intentItems.push({
      product_id: product.id,
      product_title: product.title,
      sku: product.sku,
      variant: item.variant || "Default",
      quantity: item.quantity,
      unit_price_cents: unitAmount,
      total_cents: totalCents,
    });

    stripeLineItems.push({
      quantity: item.quantity,
      price_data: {
        currency: "usd",
        unit_amount: unitAmount,
        product_data: {
          name: product.title,
          images: absoluteImageUrl(product.images?.[0]),
          metadata: {
            product_id: product.id,
            sku: product.sku || "",
          },
        },
      },
    });
  }

  const subtotalCents = intentItems.reduce((sum, item) => sum + item.total_cents, 0);
  const shippingCents = calculateShipping(subtotalCents);
  const discountCents = 0;
  const taxCents = 0;
  const totalCents = subtotalCents - discountCents + taxCents + shippingCents;

  const { data: checkoutIntent, error: intentError } = await supabase
    .from("checkout_intents")
    .insert({
      user_id: isAccountCheckout ? user?.id || null : null,
      provider: payload.provider,
      customer_email: checkoutEmail,
      customer_name: payload.customer?.name || "Guest checkout",
      customer_phone: payload.customer?.phone || null,
      shipping_address: payload.shippingAddress || emptyAddress,
      billing_address: payload.billingAddress || payload.shippingAddress || emptyAddress,
      items: intentItems,
      subtotal_cents: subtotalCents,
      discount_cents: discountCents,
      tax_cents: taxCents,
      shipping_cents: shippingCents,
      total_cents: totalCents,
      currency: "usd",
    })
    .select("*")
    .single();

  if (intentError) return jsonError(intentError.message, 500);

  await saveAccountCheckoutAddress(supabase, user, payload);

  if (shippingCents > 0) {
    stripeLineItems.push({
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: shippingCents,
        product_data: { name: "Standard shipping" },
      },
    });
  }

  if (payload.provider === "paypal") {
    const paypalOrder = await createPayPalOrder({
      checkoutIntentId: checkoutIntent.id,
      items: intentItems,
      subtotalCents,
      shippingCents,
      totalCents,
      currency: "usd",
    });
    const approveUrl = paypalOrder.links?.find((link) => link.rel === "approve")?.href;
    if (!approveUrl) return jsonError("PayPal did not return an approval URL.", 502);

    await supabase
      .from("checkout_intents")
      .update({ provider_order_id: paypalOrder.id, updated_at: new Date().toISOString() })
      .eq("id", checkoutIntent.id);

    return Response.json({ provider: "paypal", url: approveUrl, checkoutIntentId: checkoutIntent.id });
  }

  const stripe = createStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    ...(customerEmail ? { customer_email: customerEmail } : {}),
    line_items: stripeLineItems,
    allow_promotion_codes: true,
    billing_address_collection: "required",
    shipping_address_collection: {
      allowed_countries: ["US"],
    },
    metadata: {
      checkout_intent_id: checkoutIntent.id,
      user_id: isAccountCheckout ? user?.id || "" : "",
      guest_email: user ? "" : customerEmail,
    },
    success_url: `${getSiteUrl()}/order-success?provider=stripe&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${getSiteUrl()}/order-failed?provider=stripe&checkout=${checkoutIntent.id}`,
  });

  await supabase
    .from("checkout_intents")
    .update({ provider_session_id: session.id, updated_at: new Date().toISOString() })
    .eq("id", checkoutIntent.id);

  return Response.json({ provider: "stripe", url: session.url, checkoutIntentId: checkoutIntent.id });
}
