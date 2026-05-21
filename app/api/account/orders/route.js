import { createAdminSupabase } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/server";
import { jsonError } from "@/lib/validation";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("Log in to view orders.", 401);

  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return jsonError(error.message, 500);
  return Response.json({ orders: data || [] });
}
