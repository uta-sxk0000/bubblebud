import { TrackOrderPage } from "@/components/pages";

export const metadata = {
  title: "Track Order",
  description: "Track your BubbleBud order status with an order number and email address.",
};

export default async function Page({ searchParams }) {
  const params = await searchParams;

  return <TrackOrderPage initialQuery={{
    orderNumber: params?.orderNumber || params?.order || "",
    email: params?.email || "",
  }} />;
}
