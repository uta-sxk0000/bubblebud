import { z } from "zod";
import { createAdminSupabase, requireAdmin } from "@/lib/supabase/admin";
import { jsonError } from "@/lib/validation";

const productSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  priceCents: z.number().int().min(0),
  salePriceCents: z.number().int().min(0).nullable().optional(),
  compareAtCents: z.number().int().min(0).nullable().optional(),
  sku: z.string().min(1),
  inventoryQuantity: z.number().int().min(0),
  images: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  active: z.boolean().default(true),
});

export async function GET() {
  try {
    await requireAdmin();
    const supabase = createAdminSupabase();
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (error) return jsonError(error.message, 500);
    return Response.json({ products: data || [] });
  } catch (error) {
    return jsonError(error.message, error.status || 500);
  }
}

export async function POST(request) {
  try {
    await requireAdmin();
    const payload = productSchema.parse(await request.json());
    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from("products")
      .upsert({
        id: payload.id,
        slug: payload.slug,
        title: payload.title,
        description: payload.description,
        category: payload.category,
        price_cents: payload.priceCents,
        sale_price_cents: payload.salePriceCents || null,
        compare_at_cents: payload.compareAtCents || null,
        sku: payload.sku,
        inventory_quantity: payload.inventoryQuantity,
        stock_status: payload.inventoryQuantity === 0 ? "out_of_stock" : payload.inventoryQuantity <= 5 ? "low_stock" : "in_stock",
        images: payload.images,
        tags: payload.tags,
        active: payload.active,
      })
      .select("*")
      .single();

    if (error) return jsonError(error.message, 500);
    return Response.json({ product: data });
  } catch (error) {
    return jsonError(error.message, error.status || 422);
  }
}

export async function DELETE(request) {
  try {
    await requireAdmin();
    const { id } = z.object({ id: z.string().min(1) }).parse(await request.json());
    const supabase = createAdminSupabase();
    const { error } = await supabase.from("products").update({ active: false }).eq("id", id);
    if (error) return jsonError(error.message, 500);
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error.message, error.status || 422);
  }
}
