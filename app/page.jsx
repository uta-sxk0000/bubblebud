import { HomePage } from "@/components/pages";
import { getStorefrontProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function Page() {
  const products = await getStorefrontProducts();
  return <HomePage products={products} />;
}
