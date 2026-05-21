import { PolicyPage } from "@/components/policy-page";

export const metadata = { title: "Shipping Policy" };

export default function Page() {
  return (
    <PolicyPage
      eyebrow="Shipping"
      title="Shipping that stays clear from checkout to delivery."
      sections={[
        ["Processing", "Orders are normally processed within 1-3 business days after payment confirmation."],
        ["Rates", "Standard shipping is calculated at checkout. Free shipping is available when the cart qualifies."],
        ["Tracking", "Tracking numbers can be added in the admin dashboard and shown on the customer tracking page."],
      ]}
    />
  );
}
