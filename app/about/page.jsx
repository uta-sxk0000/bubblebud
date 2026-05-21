import { InfoPage } from "@/components/pages";

export const metadata = {
  title: "About",
  description: "Learn about BubbleBud and the premium everyday essentials behind the brand.",
};

export default function Page() {
  return (
    <InfoPage
      eyebrow="About BubbleBud"
      title="A softer, cleaner way to shop small essentials."
      copy="BubbleBud curates compact, useful, giftable products with a premium visual standard: tidy pages, real product photos, clear details, and a smooth checkout-style experience. The store is built for customers who want cute, practical items without cluttered browsing or confusing product pages."
      image="/assets/hero-arrivals.png"
      details={[
        ["Curated Product Mix", "Beauty bags, laptop sleeves, plushies, crochet bouquets, desk lights, and home accents selected for everyday usefulness."],
        ["Premium Shopping Feel", "A clean storefront, large visuals, clear pricing, strong product details, and fast cart actions help customers shop with confidence."],
        ["Customer-First Support", "BubbleBud keeps contact, order help, returns, and product questions easy to find so the brand feels trustworthy from first click."],
      ]}
      stats={[
        ["9+", "active products"],
        ["30 days", "return-friendly policy"],
        ["24/7", "message support UI"],
      ]}
    />
  );
}
