import { z } from "zod";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { jsonError } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  orderNumber: z.string().min(3),
  email: z.string().email(),
});

export async function POST(request) {
  try {
    rateLimit(request, { key: "track-order", limit: 12, windowMs: 60_000 });
  } catch (error) {
    return jsonError(error.message, error.status || 429);
  }

  let payload;
  try {
    payload = schema.parse(await request.json());
  } catch (error) {
    return jsonError(error.message, 422);
  }

  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from("orders")
    .select("order_number,status,payment_status,shipping_method,tracking_number,tracking_url,created_at,updated_at")
    .eq("order_number", payload.orderNumber)
    .eq("customer_email", payload.email)
    .maybeSingle();

  if (error) return jsonError(error.message, 500);
  if (!data) return jsonError("No matching order was found.", 404);

  return Response.json({ order: data });
}
