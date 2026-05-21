import { headers } from "next/headers";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { createStripe } from "@/lib/stripe";
import { requiredEnv } from "@/lib/env";
import { orderConfirmationHtml, sendTransactionalEmail } from "@/lib/email";

export async function POST(request) {
  const stripe = createStripe();
  const signature = (await headers()).get("stripe-signature");
  const rawBody = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, requiredEnv("STRIPE_WEBHOOK_SECRET"));
  } catch (error) {
    return new Response(`Webhook signature verification failed: ${error.message}`, { status: 400 });
  }

  const supabase = createAdminSupabase();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.order_id;

    if (orderId) {
      const shipping = session.shipping_details || {};
      const billing = session.customer_details || {};

      const { data: order } = await supabase
        .from("orders")
        .update({
          status: "paid",
          payment_status: "paid",
          stripe_payment_intent_id: session.payment_intent,
          customer_email: session.customer_details?.email || session.customer_email,
          customer_name: session.customer_details?.name,
          shipping_address: shipping.address ? shipping : null,
          billing_address: billing.address ? billing : null,
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .select("*")
        .single();

      const { data: items } = await supabase.from("order_items").select("*").eq("order_id", orderId);
      if (items?.length) {
        await supabase.rpc(
          "decrement_inventory",
          {
            items: items.map((item) => ({
              product_id: item.product_id,
              quantity: item.quantity,
            })),
          }
        );
      }

      if (order?.customer_email) {
        await sendTransactionalEmail({
          to: order.customer_email,
          subject: `BubbleBud order ${order.order_number} confirmed`,
          html: orderConfirmationHtml(order, items || []),
          idempotencyKey: `order-confirmation-${order.id}`,
        });
      }
    }
  }

  if (event.type === "checkout.session.expired") {
    const orderId = event.data.object.metadata?.order_id;
    if (orderId) {
      await supabase
        .from("orders")
        .update({ status: "cancelled", payment_status: "failed", updated_at: new Date().toISOString() })
        .eq("id", orderId)
        .eq("payment_status", "pending");
    }
  }

  if (event.type === "charge.refunded") {
    const paymentIntent = event.data.object.payment_intent;
    if (paymentIntent) {
      await supabase
        .from("orders")
        .update({ status: "refunded", payment_status: "refunded", updated_at: new Date().toISOString() })
        .eq("stripe_payment_intent_id", paymentIntent);
    }
  }

  return Response.json({ received: true });
}
