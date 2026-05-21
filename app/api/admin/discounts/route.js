import { z } from "zod";
import { createAdminSupabase, requireAdmin } from "@/lib/supabase/admin";
import { jsonError } from "@/lib/validation";

const discountSchema = z.object({
  code: z.string().min(2).max(40),
  percentOff: z.number().int().min(1).max(100).optional(),
  amountOffCents: z.number().int().min(1).optional(),
  active: z.boolean().default(true),
});

export async function GET() {
  try {
    await requireAdmin();
    const supabase = createAdminSupabase();
    const { data, error } = await supabase.from("discounts").select("*").order("created_at", { ascending: false });
    if (error) return jsonError(error.message, 500);
    return Response.json({ discounts: data || [] });
  } catch (error) {
    return jsonError(error.message, error.status || 500);
  }
}

export async function POST(request) {
  try {
    await requireAdmin();
    const payload = discountSchema.parse(await request.json());
    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from("discounts")
      .upsert({
        code: payload.code.toUpperCase(),
        percent_off: payload.percentOff || null,
        amount_off_cents: payload.amountOffCents || null,
        active: payload.active,
      }, { onConflict: "code" })
      .select("*")
      .single();
    if (error) return jsonError(error.message, 500);
    return Response.json({ discount: data });
  } catch (error) {
    return jsonError(error.message, error.status || 422);
  }
}
