import { headers } from "next/headers";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { createStripe } from "@/lib/stripe";
import { requiredEnv } from "@/lib/env";
import { finalizeCheckoutIntent } from "@/lib/order-finalization";

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

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const checkoutIntentId = session.metadata?.checkout_intent_id;

      if (checkoutIntentId) {
        const customerDetails = session.customer_details || {};
        const shippingDetails = session.shipping_details || null;
        const billingAddress = customerDetails.address
          ? { name: customerDetails.name || "", address: customerDetails.address }
          : null;
        const stripeTaxCents = session.total_details?.amount_tax || 0;
        const discountCents = session.total_details?.amount_discount || 0;
        const { data: currentIntent } = await supabase
          .from("checkout_intents")
          .select("billing_address,tax_cents,total_cents")
          .eq("id", checkoutIntentId)
          .maybeSingle();
        const saveAddress = currentIntent?.billing_address?.saveAddress;
        const taxCents = stripeTaxCents || currentIntent?.tax_cents || 0;
        const totalCents = session.amount_total || currentIntent?.total_cents || 0;

        await supabase
          .from("checkout_intents")
          .update({
            provider_session_id: session.id,
            customer_email: customerDetails.email || session.customer_email,
            customer_name: customerDetails.name || shippingDetails?.name || "BubbleBud customer",
            customer_phone: customerDetails.phone || null,
            ...(shippingDetails ? { shipping_address: shippingDetails } : {}),
            ...(billingAddress ? { billing_address: { ...billingAddress, ...(saveAddress !== undefined ? { saveAddress } : {}) } } : {}),
            discount_cents: discountCents,
            tax_cents: taxCents,
            ...(totalCents ? { total_cents: totalCents } : {}),
            updated_at: new Date().toISOString(),
          })
          .eq("id", checkoutIntentId);

        await finalizeCheckoutIntent({
          supabase,
          checkoutIntentId,
          provider: "stripe",
          paymentId: session.payment_intent || session.id,
          providerSessionId: session.id,
          stripePaymentIntentId: session.payment_intent,
        });
      }
    }

    if (event.type === "checkout.session.expired") {
      const checkoutIntentId = event.data.object.metadata?.checkout_intent_id;
      if (checkoutIntentId) {
        await supabase
          .from("checkout_intents")
          .update({ status: "expired", updated_at: new Date().toISOString() })
          .eq("id", checkoutIntentId)
          .eq("status", "created");
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
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ received: true });
}
