import { notFound } from "next/navigation";
import { ProductPage } from "@/components/pages";
import { getStorefrontProductBySlug } from "@/lib/catalog";
import { products } from "@/lib/products";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getStorefrontProductBySlug(slug);
  if (!product) return {};

  return {
    title: product.title,
    description: product.description,
    openGraph: {
      title: `${product.title} | BubbleBud`,
      description: product.description,
      images: [product.image],
    },
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const product = await getStorefrontProductBySlug(slug);
  if (!product) notFound();
  return <ProductPage product={product} />;
}
