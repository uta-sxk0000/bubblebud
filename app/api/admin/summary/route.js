import { createAdminSupabase, requireAdmin } from "@/lib/supabase/admin";
import { jsonError } from "@/lib/validation";

export async function GET() {
  try {
    await requireAdmin();
    const supabase = createAdminSupabase();
    const [{ data: orders }, { data: products }, { data: reviews }, { data: customers }] = await Promise.all([
      supabase.from("orders").select("total_cents,status,payment_status,created_at").order("created_at", { ascending: false }).limit(100),
      supabase.from("products").select("id,title,inventory_quantity,stock_status,active").order("inventory_quantity", { ascending: true }).limit(20),
      supabase.from("reviews").select("id,rating,visible,created_at").order("created_at", { ascending: false }).limit(20),
      supabase.from("profiles").select("id,email,created_at").order("created_at", { ascending: false }).limit(20),
    ]);

    const paidOrders = (orders || []).filter((order) => order.payment_status === "paid");
    const revenueCents = paidOrders.reduce((sum, order) => sum + Number(order.total_cents || 0), 0);

    return Response.json({
      metrics: {
        revenueCents,
        orders: orders?.length || 0,
        customers: customers?.length || 0,
        pendingReviews: (reviews || []).filter((review) => !review.visible).length,
      },
      recentOrders: orders || [],
      lowStock: (products || []).filter((product) => product.inventory_quantity <= 5),
      recentReviews: reviews || [],
      customers: customers || [],
    });
  } catch (error) {
    return jsonError(error.message, error.status || 500);
  }
}
