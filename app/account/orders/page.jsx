import { AccountPage } from "@/components/pages";

export const metadata = {
  title: "Order History",
  description: "View your BubbleBud order history.",
};

export default function Page() {
  return <AccountPage initialTab="Order history" />;
}
