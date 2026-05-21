import { checkoutSchema, jsonError } from "@/lib/validation";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/server";
import { createStripe } from "@/lib/stripe";
import { calculateShipping, generateOrderNumber } from "@/lib/commerce";
import { getSiteUrl } from "@/lib/env";
import { rateLimit } from "@/lib/rate-limit";

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
  const customerEmail = user?.email || payload.customerEmail;
  if (!customerEmail) {
    return jsonError("Email is required for guest checkout.", 422);
  }

  const supabase = createAdminSupabase();
  const stripe = createStripe();

  const productIds = [...new Set(payload.items.map((item) => item.productId))];
  const { data: products, error: productError } = await supabase
    .from("products")
    .select("id,title,sku,price_cents,sale_price_cents,inventory_quantity,stock_status,images,active")
    .in("id", productIds)
    .eq("active", true);

  if (productError) return jsonError(productError.message, 500);

  const productMap = new Map((products || []).map((product) => [product.id, product]));
  const orderItems = [];
  const stripeLineItems = [];

  for (const item of payload.items) {
    const product = productMap.get(item.productId);
    if (!product) return jsonError("One or more cart items are no longer available.", 409);
    if (product.inventory_quantity < item.quantity || product.stock_status === "out_of_stock") {
      return jsonError(`${product.title} does not have enough stock.`, 409);
    }

    const unitAmount = product.sale_price_cents || product.price_cents;
    orderItems.push({
      product_id: product.id,
      product_title: product.title,
      sku: product.sku,
      variant: item.variant || "Default",
      quantity: item.quantity,
      unit_price_cents: unitAmount,
      total_cents: unitAmount * item.quantity,
    });
    stripeLineItems.push({
      quantity: item.quantity,
      price_data: {
        currency: "usd",
        unit_amount: unitAmount,
        product_data: {
          name: product.title,
          images: product.images?.[0] ? [new URL(product.images[0], getSiteUrl()).toString()] : undefined,
          metadata: {
            product_id: product.id,
            sku: product.sku,
          },
        },
      },
    });
  }

  const subtotalCents = orderItems.reduce((sum, item) => sum + item.total_cents, 0);
  const shippingCents = calculateShipping(subtotalCents);
  const totalCents = subtotalCents + shippingCents;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: generateOrderNumber(),
      user_id: user?.id || null,
      customer_email: customerEmail,
      status: "pending",
      payment_status: "pending",
      subtotal_cents: subtotalCents,
      shipping_cents: shippingCents,
      total_cents: totalCents,
      currency: "usd",
      shipping_method: shippingCents === 0 ? "Free standard shipping" : "Standard shipping",
    })
    .select("*")
    .single();

  if (orderError) return jsonError(orderError.message, 500);

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems.map((item) => ({ ...item, order_id: order.id })));

  if (itemsError) return jsonError(itemsError.message, 500);

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

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: customerEmail,
    line_items: stripeLineItems,
    allow_promotion_codes: true,
    billing_address_collection: "required",
    shipping_address_collection: {
      allowed_countries: ["US"],
    },
    metadata: {
      order_id: order.id,
      order_number: order.order_number,
      user_id: user?.id || "",
    },
    success_url: `${getSiteUrl()}/order-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${getSiteUrl()}/order-failed?order=${order.order_number}`,
  });

  await supabase.from("orders").update({ stripe_session_id: session.id }).eq("id", order.id);

  return Response.json({ url: session.url, orderNumber: order.order_number });
}
