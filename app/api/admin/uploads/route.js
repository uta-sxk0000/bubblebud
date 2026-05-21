import { createAdminSupabase, requireAdmin } from "@/lib/supabase/admin";
import { jsonError } from "@/lib/validation";

export async function POST(request) {
  try {
    await requireAdmin();
    const formData = await request.formData();
    const file = formData.get("file");
    const productId = formData.get("productId") || "general";

    if (!file || typeof file === "string") {
      return jsonError("A product image file is required.", 422);
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${productId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const supabase = createAdminSupabase();
    const { error } = await supabase.storage.from("product-images").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

    if (error) return jsonError(error.message, 500);

    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return Response.json({ url: data.publicUrl, path });
  } catch (error) {
    return jsonError(error.message, error.status || 500);
  }
}
