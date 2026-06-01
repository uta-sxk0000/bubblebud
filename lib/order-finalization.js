import { orderConfirmationHtml, sendTransactionalEmail } from "@/lib/email";

function normalizeOrderAddress(address = {}) {
  const nested = address.address || {};

  return {
    line1: address.line1 || address.line_1 || nested.line1 || nested.address_line_1 || "",
    line2: address.line2 || address.line_2 || nested.line2 || nested.address_line_2 || "",
    city: address.city || nested.city || nested.admin_area_2 || "",
    state: address.state || nested.state || nested.admin_area_1 || "",
    postalCode: address.postalCode || address.postal_code || nested.postal_code || "",
    country: address.country || nested.country || nested.country_code || "US",
  };
}

async function saveOrderAddress(supabase, order) {
  if (!order?.user_id || !order?.billing_address?.saveAddress) return;

  const address = normalizeOrderAddress(order.shipping_address);
  if (!address.line1 || !address.city || !address.state || !address.postalCode) return;

  const { data: existing } = await supabase
    .from("addresses")
    .select("id")
    .eq("user_id", order.user_id)
    .eq("line1", address.line1)
    .eq("postal_code", address.postalCode)
    .maybeSingle();

  await supabase.from("addresses").update({ is_default: false }).eq("user_id", order.user_id);

  await supabase.from("addresses").upsert({
    ...(existing?.id ? { id: existing.id } : {}),
    user_id: order.user_id,
    label: "Default shipping",
    full_name: order.customer_name || "BubbleBud customer",
    line1: address.line1,
    line2: address.line2 || null,
    city: address.city,
    state: address.state,
    postal_code: address.postalCode,
    country: address.country || "US",
    phone: order.customer_phone || null,
    is_default: true,
  });
}

export async function finalizeCheckoutIntent({
  supabase,
  checkoutIntentId,
  provider,
  paymentId,
  providerOrderId = null,
  providerSessionId = null,
  stripePaymentIntentId = null,
}) {
  const { data: orderId, error } = await supabase.rpc("create_order_from_checkout_intent", {
    checkout_intent_id: checkoutIntentId,
    provider_name: provider,
    provider_payment_id: paymentId,
    provider_order_id: providerOrderId,
    provider_session_id: providerSessionId,
    stripe_payment_intent: stripePaymentIntentId,
  });

  if (error) throw error;

  const { data: order, error: orderError } = await supabase.from("orders").select("*").eq("id", orderId).single();
  if (orderError) throw orderError;

  const { data: items, error: itemError } = await supabase.from("order_items").select("*").eq("order_id", orderId);
  if (itemError) throw itemError;

  await saveOrderAddress(supabase, order);

  if (order?.customer_email) {
    await sendTransactionalEmail({
      to: order.customer_email,
      subject: `BubbleBud order ${order.order_number} confirmed`,
      html: orderConfirmationHtml(order, items || []),
      idempotencyKey: `order-confirmation-${order.id}`,
    });
  }

  return { order, items: items || [] };
}
