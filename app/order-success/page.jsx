import { Suspense } from "react";
import { OrderResultPage } from "@/components/customer-pages";

export const metadata = {
  title: "Order Confirmed",
  description: "Your BubbleBud order was confirmed.",
};

export default function Page() {
  return (
    <Suspense>
      <OrderResultPage status="success" />
    </Suspense>
  );
}
