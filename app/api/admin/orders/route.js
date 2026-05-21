import { z } from "zod";
import { createAdminSupabase, requireAdmin } from "@/lib/supabase/admin";
import { sendTransactionalEmail } from "@/lib/email";
import { jsonError } from "@/lib/validation";

const updateSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"]),
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().url().optional().or(z.literal("")),
});

export async function GET() {
  try {
    await requireAdmin();
    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) return jsonError(error.message, 500);
    return Response.json({ orders: data || [] });
  } catch (error) {
    return jsonError(error.message, error.status || 500);
  }
}

export async function PATCH(request) {
  try {
    await requireAdmin();
    const payload = updateSchema.parse(await request.json());
    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from("orders")
      .update({
        status: payload.status,
        tracking_number: payload.trackingNumber || null,
        tracking_url: payload.trackingUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payload.orderId)
      .select("*")
      .single();

    if (error) return jsonError(error.message, 500);

    if (["shipped", "delivered", "cancelled", "refunded"].includes(payload.status)) {
      await sendTransactionalEmail({
        to: data.customer_email,
        subject: `BubbleBud order ${data.order_number} is ${payload.status}`,
        html: `<p>Your order <strong>${data.order_number}</strong> status is now <strong>${payload.status}</strong>.</p>${
          payload.trackingUrl ? `<p><a href="${payload.trackingUrl}">Track your package</a></p>` : ""
        }`,
        idempotencyKey: `order-status-${data.id}-${payload.status}`,
      });
    }

    return Response.json({ order: data });
  } catch (error) {
    return jsonError(error.message, error.status || 422);
  }
}
