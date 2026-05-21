import { PolicyPage } from "@/components/policy-page";

export const metadata = { title: "Terms of Service" };

export default function Page() {
  return (
    <PolicyPage
      eyebrow="Terms"
      title="Terms for shopping with BubbleBud."
      sections={[
        ["Store Use", "Customers agree to provide accurate checkout, account, and delivery information."],
        ["Orders", "Orders are accepted after payment confirmation and may be cancelled or refunded if stock becomes unavailable."],
        ["Support", "Questions about orders, returns, and product issues should be sent through the contact page."],
      ]}
    />
  );
}
