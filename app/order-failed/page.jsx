import { Suspense } from "react";
import { OrderResultPage } from "@/components/customer-pages";

export const metadata = {
  title: "Checkout Not Completed",
  description: "Your BubbleBud payment was not completed.",
};

export default function Page() {
  return (
    <Suspense>
      <OrderResultPage status="failed" />
    </Suspense>
  );
}
