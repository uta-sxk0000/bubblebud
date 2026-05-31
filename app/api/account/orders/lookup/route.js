import { createAdminSupabase } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/server";
import { jsonError } from "@/lib/validation";

export async function GET(request) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Log in to view orders.", 401);

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");
  const paypalOrderId = searchParams.get("paypal_order_id");

  if (!sessionId && !paypalOrderId) {
    return jsonError("A Stripe session or PayPal order id is required.", 422);
  }

  const supabase = createAdminSupabase();
  let query = supabase
    .from("orders")
    .select("id,order_number,status,payment_status")
    .eq("user_id", user.id)
    .limit(1);

  query = sessionId ? query.eq("stripe_session_id", sessionId) : query.eq("paypal_order_id", paypalOrderId);

  const { data, error } = await query.maybeSingle();
  if (error) return jsonError(error.message, 500);

  return Response.json({ order: data || null });
}
