import { z } from "zod";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/server";
import { jsonError } from "@/lib/validation";

const schema = z.object({ productId: z.string().min(1) });

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ productIds: [] });

  const supabase = createAdminSupabase();
  const { data, error } = await supabase.from("wishlist_items").select("product_id").eq("user_id", user.id);

  if (error) return jsonError(error.message, 500);
  return Response.json({ productIds: (data || []).map((item) => item.product_id) });
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Log in to save wishlist items.", 401);

  const { productId } = schema.parse(await request.json());
  const supabase = createAdminSupabase();
  const { error } = await supabase.from("wishlist_items").upsert({ user_id: user.id, product_id: productId });

  if (error) return jsonError(error.message, 500);
  return Response.json({ ok: true });
}

export async function DELETE(request) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Log in to update wishlist items.", 401);

  const { productId } = schema.parse(await request.json());
  const supabase = createAdminSupabase();
  const { error } = await supabase.from("wishlist_items").delete().eq("user_id", user.id).eq("product_id", productId);

  if (error) return jsonError(error.message, 500);
  return Response.json({ ok: true });
}
