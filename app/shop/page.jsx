import { ShopPage } from "@/components/pages";
import { getStorefrontProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop",
  description: "Shop BubbleBud best sellers, new arrivals, beauty essentials, accessories, gifts, and home finds.",
};

export default async function Page() {
  const products = await getStorefrontProducts();
  return <ShopPage products={products} />;
}
