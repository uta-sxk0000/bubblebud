import { z } from "zod";
import { createAdminSupabase, requireAdmin } from "@/lib/supabase/admin";
import { jsonError } from "@/lib/validation";

export async function GET() {
  try {
    await requireAdmin();
    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from("reviews")
      .select("*, products(title), profiles(email,full_name)")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) return jsonError(error.message, 500);
    return Response.json({ reviews: data || [] });
  } catch (error) {
    return jsonError(error.message, error.status || 500);
  }
}

export async function PATCH(request) {
  try {
    await requireAdmin();
    const payload = z.object({ reviewId: z.string().uuid(), visible: z.boolean() }).parse(await request.json());
    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from("reviews")
      .update({ visible: payload.visible, status: payload.visible ? "approved" : "hidden", updated_at: new Date().toISOString() })
      .eq("id", payload.reviewId)
      .select("*")
      .single();
    if (error) return jsonError(error.message, 500);
    return Response.json({ review: data });
  } catch (error) {
    return jsonError(error.message, error.status || 422);
  }
}

export async function DELETE(request) {
  try {
    await requireAdmin();
    const payload = z.object({ reviewId: z.string().uuid() }).parse(await request.json());
    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from("reviews")
      .update({ visible: false, status: "deleted", updated_at: new Date().toISOString() })
      .eq("id", payload.reviewId)
      .select("*")
      .single();
    if (error) return jsonError(error.message, 500);
    return Response.json({ review: data });
  } catch (error) {
    return jsonError(error.message, error.status || 422);
  }
}
