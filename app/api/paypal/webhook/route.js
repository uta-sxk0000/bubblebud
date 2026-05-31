import { createAdminSupabase } from "@/lib/supabase/admin";
import { finalizeCheckoutIntent } from "@/lib/order-finalization";
import { verifyPayPalWebhook } from "@/lib/paypal";

function captureDetails(resource) {
  const capture = resource?.purchase_units?.[0]?.payments?.captures?.[0] || resource;
  const purchaseUnit = resource?.purchase_units?.[0] || {};
  return {
    captureId: capture?.id,
    paypalOrderId: capture?.supplementary_data?.related_ids?.order_id || resource?.id || purchaseUnit?.payments?.captures?.[0]?.supplementary_data?.related_ids?.order_id,
    checkoutIntentId: capture?.custom_id || purchaseUnit?.custom_id,
    payer: resource?.payer,
    shipping: purchaseUnit?.shipping,
  };
}

export async function POST(request) {
  const rawBody = await request.text();
  let verified = false;

  try {
    verified = await verifyPayPalWebhook(request, rawBody);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  if (!verified) {
    return Response.json({ error: "PayPal webhook signature verification failed." }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const supabase = createAdminSupabase();

  try {
    if (event.event_type === "CHECKOUT.ORDER.APPROVED") {
      const checkoutIntentId = event.resource?.purchase_units?.[0]?.custom_id;
      if (checkoutIntentId) {
        await supabase
          .from("checkout_intents")
          .update({ provider_order_id: event.resource.id, status: "approved", updated_at: new Date().toISOString() })
          .eq("id", checkoutIntentId);
      }
    }

    if (event.event_type === "PAYMENT.CAPTURE.COMPLETED" || event.event_type === "CHECKOUT.ORDER.COMPLETED") {
      const { captureId, checkoutIntentId, payer, paypalOrderId, shipping } = captureDetails(event.resource);
      if (captureId && checkoutIntentId) {
        const payerName = [payer?.name?.given_name, payer?.name?.surname].filter(Boolean).join(" ");
        await supabase
          .from("checkout_intents")
          .update({
            customer_email: payer?.email_address || undefined,
            customer_name: payerName || shipping?.name?.full_name || "BubbleBud customer",
            ...(shipping ? { shipping_address: shipping } : {}),
            updated_at: new Date().toISOString(),
          })
          .eq("id", checkoutIntentId);

        await finalizeCheckoutIntent({
          supabase,
          checkoutIntentId,
          provider: "paypal",
          paymentId: captureId,
          providerOrderId: paypalOrderId,
        });
      }
    }

    if (event.event_type === "PAYMENT.CAPTURE.DENIED") {
      const { checkoutIntentId } = captureDetails(event.resource);
      if (checkoutIntentId) {
        await supabase
          .from("checkout_intents")
          .update({ status: "failed", updated_at: new Date().toISOString() })
          .eq("id", checkoutIntentId);
      }
    }

    if (event.event_type === "PAYMENT.CAPTURE.REFUNDED") {
      const captureId = event.resource?.supplementary_data?.related_ids?.capture_id;
      if (captureId) {
        await supabase
          .from("orders")
          .update({ status: "refunded", payment_status: "refunded", updated_at: new Date().toISOString() })
          .eq("payment_id", captureId);
      }
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ received: true });
}
