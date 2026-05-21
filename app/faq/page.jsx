import { PolicyPage } from "@/components/policy-page";

export const metadata = { title: "FAQ" };

export default function Page() {
  return (
    <PolicyPage
      eyebrow="FAQ"
      title="Questions customers ask before checkout."
      sections={[
        ["How fast do orders ship?", "Most orders are packed within 1-3 business days after successful payment. Tracking is added when the order ships."],
        ["Are payments secure?", "Yes. BubbleBud uses Stripe Checkout for cards and supported wallets. BubbleBud never stores card numbers."],
        ["Can I leave a review?", "Yes, after you log in and your order is marked delivered. Reviews are limited to verified purchases."],
        ["How do I contact support?", "Use the contact page or email sytnix479@gmail.com with your order number."],
      ]}
    />
  );
}
