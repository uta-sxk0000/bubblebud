import { z } from "zod";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/server";
import { jsonError, reviewSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  if (!productId) return jsonError("productId is required.", 422);

  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from("reviews")
    .select("id,product_id,rating,title,body,verified_purchase,created_at,profiles(full_name,email)")
    .eq("product_id", productId)
    .eq("visible", true)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) return jsonError(error.message, 500);

  return Response.json({
    reviews: (data || []).map((review) => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      body: review.body,
      verified: review.verified_purchase,
      date: review.created_at,
      name: review.profiles?.full_name || review.profiles?.email?.split("@")[0] || "BubbleBud customer",
    })),
  });
}

export async function POST(request) {
  try {
    rateLimit(request, { key: "reviews", limit: 10, windowMs: 60_000 });
  } catch (error) {
    return jsonError(error.message, error.status || 429);
  }

  const user = await getCurrentUser();
  if (!user) return jsonError("Log in before leaving a review.", 401);

  let payload;
  try {
    payload = reviewSchema.parse(await request.json());
  } catch (error) {
    return jsonError(error.message, 422);
  }

  const supabase = createAdminSupabase();
  const orderQuery = supabase
    .from("orders")
    .select("id,status,payment_status,order_items!inner(product_id)")
    .eq("user_id", user.id)
    .eq("status", "delivered")
    .eq("payment_status", "paid")
    .eq("order_items.product_id", payload.productId);

  const { data: orders, error: orderError } = payload.orderId
    ? await orderQuery.eq("id", payload.orderId)
    : await orderQuery.limit(1);

  if (orderError) return jsonError(orderError.message, 500);
  if (!orders?.length) {
    return jsonError("Reviews are available after a delivered verified purchase.", 403);
  }

  const { data: existingReview, error: existingError } = await supabase
    .from("reviews")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", payload.productId)
    .maybeSingle();

  if (existingError) return jsonError(existingError.message, 500);
  if (existingReview) return jsonError("You have already reviewed this product.", 409);

  const reviewPayload = {
    user_id: user.id,
    product_id: payload.productId,
    order_id: orders[0].id,
    rating: payload.rating,
    title: payload.title,
    body: payload.body,
    verified_purchase: true,
    visible: true,
    status: "approved",
  };

  const { data, error } = await supabase
    .from("reviews")
    .insert(reviewPayload)
    .select("*")
    .single();

  if (error) return jsonError(error.message, 500);
  return Response.json({ review: data });
}

export async function DELETE(request) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Log in before deleting a review.", 401);

  const { reviewId } = z.object({ reviewId: z.string().uuid() }).parse(await request.json());
  const supabase = createAdminSupabase();
  const { error } = await supabase.from("reviews").delete().eq("id", reviewId).eq("user_id", user.id);

  if (error) return jsonError(error.message, 500);
  return Response.json({ ok: true });
}
