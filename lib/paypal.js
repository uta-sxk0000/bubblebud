import { getSiteUrl, requiredEnv } from "@/lib/env";

function paypalBaseUrl() {
  return process.env.PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}

async function paypalRequest(path, options = {}) {
  const response = await fetch(`${paypalBaseUrl()}${path}`, options);
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(data.message || data.error_description || "PayPal request failed.");
  }
  return data;
}

export async function getPayPalAccessToken() {
  const credentials = Buffer.from(`${requiredEnv("PAYPAL_CLIENT_ID")}:${requiredEnv("PAYPAL_CLIENT_SECRET")}`).toString("base64");
  const data = await paypalRequest("/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  return data.access_token;
}

export async function createPayPalOrder({ checkoutIntentId, items, subtotalCents, shippingCents, totalCents, currency = "USD" }) {
  const accessToken = await getPayPalAccessToken();
  return paypalRequest("/v2/checkout/orders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          custom_id: checkoutIntentId,
          invoice_id: `BB-${checkoutIntentId}`,
          amount: {
            currency_code: currency.toUpperCase(),
            value: (totalCents / 100).toFixed(2),
            breakdown: {
              item_total: {
                currency_code: currency.toUpperCase(),
                value: (subtotalCents / 100).toFixed(2),
              },
              shipping: {
                currency_code: currency.toUpperCase(),
                value: (shippingCents / 100).toFixed(2),
              },
            },
          },
          items: items.map((item) => ({
            name: item.variant && item.variant !== "Default" ? `${item.product_title} (${item.variant})` : item.product_title,
            sku: item.sku,
            quantity: String(item.quantity),
            unit_amount: {
              currency_code: currency.toUpperCase(),
              value: (item.unit_price_cents / 100).toFixed(2),
            },
          })),
        },
      ],
      application_context: {
        brand_name: "BubbleBud",
        landing_page: "LOGIN",
        user_action: "PAY_NOW",
        return_url: `${getSiteUrl()}/order-success?provider=paypal`,
        cancel_url: `${getSiteUrl()}/order-failed?provider=paypal`,
      },
    }),
  });
}

export async function capturePayPalOrder(orderId) {
  const accessToken = await getPayPalAccessToken();
  return paypalRequest(`/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
}

export async function verifyPayPalWebhook(request, rawBody) {
  const webhookId = requiredEnv("PAYPAL_WEBHOOK_ID");
  const accessToken = await getPayPalAccessToken();
  const verification = await paypalRequest("/v1/notifications/verify-webhook-signature", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      auth_algo: request.headers.get("paypal-auth-algo"),
      cert_url: request.headers.get("paypal-cert-url"),
      transmission_id: request.headers.get("paypal-transmission-id"),
      transmission_sig: request.headers.get("paypal-transmission-sig"),
      transmission_time: request.headers.get("paypal-transmission-time"),
      webhook_id: webhookId,
      webhook_event: JSON.parse(rawBody),
    }),
  });

  return verification.verification_status === "SUCCESS";
}
