import { products as seedProducts } from "@/lib/products";
import { getVariantOptions, normalizeVariantGroups } from "@/lib/products";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { hasServiceConfig } from "@/lib/env";

function centsToDollars(value) {
  return Number(value || 0) / 100;
}

export function normalizeProduct(row) {
  const gallery = row.images?.length ? row.images : ["/assets/hero-arrivals.png"];
  const price = row.sale_price_cents ? centsToDollars(row.sale_price_cents) : centsToDollars(row.price_cents);
  const compareAt = row.compare_at_cents ? centsToDollars(row.compare_at_cents) : undefined;
  const variantOptions = normalizeVariantGroups(row.variants || []);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    price,
    compareAt,
    badge: row.best_seller ? "Best Seller" : row.featured ? "Featured" : row.stock_status === "low_stock" ? "Low Stock" : "New",
    rating: Number(row.average_rating || 0),
    reviewCount: Number(row.review_count || 0),
    colors: variantOptions.flatMap((group) => group.options.map((option) => option.label)).slice(0, 6),
    variantOptions,
    variants: getVariantOptions({ variantOptions }),
    tags: row.tags || [],
    description: row.description,
    details: row.details || [],
    care: row.care || "Handle gently and keep clean between uses.",
    shipping: row.shipping || "Ships with tracking from BubbleBud fulfillment.",
    gallery,
    image: gallery[0],
    hoverImage: gallery[1] || gallery[0],
    url: `/products/${row.slug}`,
    sku: row.sku,
    inventoryQuantity: row.inventory_quantity,
    stockStatus: row.stock_status,
  };
}

export async function getStorefrontProducts() {
  if (!hasServiceConfig()) return seedProducts;

  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from("products")
    .select(
      `
        *,
        reviews:reviews(rating)
      `
    )
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error || !data?.length) return seedProducts;

  const databaseProducts = data.map((row) => {
    const visibleReviews = (row.reviews || []).filter(Boolean);
    const average =
      visibleReviews.length > 0
        ? visibleReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / visibleReviews.length
        : 0;
    return normalizeProduct({ ...row, average_rating: average, review_count: visibleReviews.length });
  });

  const merged = new Map(seedProducts.map((product) => [product.id, product]));
  for (const product of databaseProducts) {
    merged.set(product.id, product);
  }

  return Array.from(merged.values());
}

export async function getStorefrontProductBySlug(slug) {
  if (!hasServiceConfig()) {
    return seedProducts.find((product) => product.slug === slug);
  }

  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from("products")
    .select("*, reviews:reviews(rating)")
    .eq("active", true)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return seedProducts.find((product) => product.slug === slug);

  const visibleReviews = (data.reviews || []).filter(Boolean);
  const average =
    visibleReviews.length > 0
      ? visibleReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / visibleReviews.length
      : 0;

  return normalizeProduct({ ...data, average_rating: average, review_count: visibleReviews.length });
}
