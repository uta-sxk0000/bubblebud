import { capturePayPalOrder } from "@/lib/paypal";
import { jsonError } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request) {
  try {
    rateLimit(request, { key: "paypal-capture", limit: 12, windowMs: 60_000 });
  } catch (error) {
    return jsonError(error.message, error.status || 429);
  }

  const { orderId } = await request.json();
  if (!orderId) return jsonError("PayPal orderId is required.", 422);

  try {
    const capture = await capturePayPalOrder(orderId);
    return Response.json({ capture });
  } catch (error) {
    return jsonError(error.message, 502);
  }
}
