import { z } from "zod";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/server";
import { jsonError } from "@/lib/validation";

const addressSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().min(1).max(60).default("Home"),
  fullName: z.string().min(1).max(120),
  line1: z.string().min(1).max(160),
  line2: z.string().max(160).optional().default(""),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(80),
  postalCode: z.string().min(1).max(20),
  country: z.string().min(2).max(2).default("US"),
  phone: z.string().max(40).optional().default(""),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("Log in to view addresses.", 401);

  const supabase = createAdminSupabase();
  const { data, error } = await supabase.from("addresses").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  if (error) return jsonError(error.message, 500);
  return Response.json({ addresses: data || [] });
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Log in to save addresses.", 401);

  let payload;
  try {
    payload = addressSchema.parse(await request.json());
  } catch (error) {
    return jsonError(error.message, 422);
  }

  const supabase = createAdminSupabase();
  const row = {
    id: payload.id,
    user_id: user.id,
    label: payload.label,
    full_name: payload.fullName,
    line1: payload.line1,
    line2: payload.line2 || null,
    city: payload.city,
    state: payload.state,
    postal_code: payload.postalCode,
    country: payload.country,
    phone: payload.phone || null,
  };
  const { data, error } = await supabase.from("addresses").upsert(row).select("*").single();
  if (error) return jsonError(error.message, 500);
  return Response.json({ address: data });
}

export async function DELETE(request) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Log in to delete addresses.", 401);

  const { id } = z.object({ id: z.string().uuid() }).parse(await request.json());
  const supabase = createAdminSupabase();
  const { error } = await supabase.from("addresses").delete().eq("id", id).eq("user_id", user.id);
  if (error) return jsonError(error.message, 500);
  return Response.json({ ok: true });
}
