import { PolicyPage } from "@/components/policy-page";

export const metadata = { title: "Privacy Policy" };

export default function Page() {
  return (
    <PolicyPage
      eyebrow="Privacy"
      title="Customer data is handled with care."
      sections={[
        ["Data Collected", "BubbleBud stores account details, order details, shipping addresses, and support messages needed to run the store."],
        ["Payments", "Payment details are processed by Stripe. BubbleBud does not store full card numbers."],
        ["Email", "Transactional emails are sent for account, order, shipping, and support activity."],
      ]}
    />
  );
}
