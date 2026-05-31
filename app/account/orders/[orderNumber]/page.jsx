import Link from "next/link";
import { notFound } from "next/navigation";
import { PackageCheck, ShieldAlert } from "lucide-react";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/server";
import { moneyFromCents } from "@/lib/commerce";

export const metadata = {
  title: "Order Details",
  description: "View your BubbleBud order details.",
};

export default async function Page({ params }) {
  const user = await getCurrentUser();
  const { orderNumber } = await params;

  if (!user) {
    return (
      <section className="account-page result-page">
        <ShieldAlert size={42} />
        <p className="eyebrow">Account required</p>
        <h1>Log in to view this order.</h1>
        <div className="hero-actions">
          <Link className="primary-button" href="/login">Log in</Link>
          <Link className="secondary-button" href="/track-order">Track as guest</Link>
        </div>
      </section>
    );
  }

  const supabase = createAdminSupabase();
  const { data: order, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", user.id)
    .eq("order_number", decodeURIComponent(orderNumber))
    .maybeSingle();

  if (error || !order) notFound();

  return (
    <section className="account-page order-detail-page">
      <div className="page-hero compact">
        <p className="eyebrow">Order details</p>
        <h1>{order.order_number}</h1>
      </div>
      <article className="account-panel order-detail-card">
        <PackageCheck size={34} />
        <div className="order-detail-grid">
          <div>
            <span>Status</span>
            <strong>{order.status}</strong>
          </div>
          <div>
            <span>Payment</span>
            <strong>{order.payment_status}</strong>
          </div>
          <div>
            <span>Total</span>
            <strong>{moneyFromCents(order.total_cents)}</strong>
          </div>
          <div>
            <span>Tracking</span>
            <strong>{order.tracking_number || "Pending"}</strong>
          </div>
        </div>
        <div className="order-detail-items">
          {(order.order_items || []).map((item) => (
            <div className="admin-row" key={item.id}>
              <span>{item.product_title}</span>
              <span>{item.quantity}x</span>
              <span>{moneyFromCents(item.total_cents)}</span>
            </div>
          ))}
        </div>
        {order.tracking_url ? <Link className="primary-button" href={order.tracking_url}>Track shipment</Link> : null}
        <div className="hero-actions">
          <Link className="secondary-button" href="/account/orders">All orders</Link>
          <Link className="secondary-button" href="/shop">Continue shopping</Link>
        </div>
      </article>
    </section>
  );
}
