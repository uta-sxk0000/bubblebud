import { orderConfirmationHtml, sendTransactionalEmail } from "@/lib/email";

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
