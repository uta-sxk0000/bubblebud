import { createClient } from "@supabase/supabase-js";
import { products } from "../lib/products.js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRole) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(url, serviceRole, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const rows = products.map((product) => ({
  id: product.id,
  slug: product.slug,
  title: product.title,
  description: product.description,
  category: product.category,
  price_cents: Math.round(product.price * 100),
  compare_at_cents: product.compareAt ? Math.round(product.compareAt * 100) : null,
  sku: `BB-${product.id.toUpperCase()}`,
  inventory_quantity: product.badge === "Low Stock" ? 4 : 25,
  stock_status: product.badge === "Low Stock" ? "low_stock" : "in_stock",
  images: product.gallery,
  variants: product.variants.map((variant, index) => ({ name: variant, color: product.colors[index] || product.colors[0] || variant })),
  tags: product.tags,
  featured: ["New", "New Arrival", "Trending"].includes(product.badge),
  best_seller: product.badge === "Best Seller",
  active: true,
  details: product.details,
  care: product.care,
  shipping: product.shipping,
}));

const { error } = await supabase.from("products").upsert(rows, { onConflict: "id" });

if (error) {
  console.error(error);
  process.exit(1);
}

console.log(`Seeded ${rows.length} BubbleBud products.`);
