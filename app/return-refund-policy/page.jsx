import { PolicyPage } from "@/components/policy-page";

export const metadata = { title: "Return and Refund Policy" };

export default function Page() {
  return (
    <PolicyPage
      eyebrow="Returns"
      title="Simple support for returns, cancellations, and refunds."
      sections={[
        ["Return Window", "Customers can contact BubbleBud within 30 days of delivery for return help."],
        ["Condition", "Items should be unused and returned with original packaging when possible."],
        ["Refunds", "Approved refunds are processed through the original payment method and reflected in order status."],
      ]}
    />
  );
}
