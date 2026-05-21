"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BarChart3, Box, CheckCircle2, Heart, PackageCheck, ShieldAlert, Star, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatMoney, products } from "@/lib/products";
import { AccountPage, ProductGrid } from "@/components/pages";
import { useCommerce } from "@/components/commerce-context";

export function CartPage() {
  const { account, cart, checkoutError, checkoutLoading, removeFromCart, startCheckout, subtotal, updateCartQuantity } = useCommerce();
  const [email, setEmail] = useState("");
  const shipping = subtotal > 50 || subtotal === 0 ? 0 : 5.95;

  return (
    <section className="cart-page account-page">
      <div className="page-hero compact">
        <p className="eyebrow">Cart</p>
        <h1>Review your order before secure checkout.</h1>
      </div>
      <div className="cart-page-grid">
        <div className="cart-lines page-lines">
          {cart.length ? (
            cart.map((item) => (
              <div className="cart-line" key={item.key}>
                <img src={item.product.image} alt="" />
                <div>
                  <strong>{item.product.title}</strong>
                  <small>{item.variant}</small>
                  <div className="quantity-stepper">
                    <button type="button" onClick={() => updateCartQuantity(item.key, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => updateCartQuantity(item.key, item.quantity + 1)}>+</button>
                  </div>
                </div>
                <div className="cart-line-side">
                  <span>{formatMoney(item.product.price * item.quantity)}</span>
                  <button type="button" onClick={() => removeFromCart(item.key)}>Remove</button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state inline">
              <Box size={34} />
              <h3>Your cart is empty.</h3>
              <p>Browse products and add items before checkout.</p>
              <Link className="primary-button" href="/shop">Shop products</Link>
            </div>
          )}
        </div>
        <aside className="checkout-card">
          <h2>Secure checkout</h2>
          {!account ? (
            <label className="discount-field">
              <span>Email</span>
              <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
            </label>
          ) : (
            <p className="form-note">Checking out as {account.email}</p>
          )}
          <dl>
            <div><dt>Subtotal</dt><dd>{formatMoney(subtotal)}</dd></div>
            <div><dt>Shipping</dt><dd>{shipping ? formatMoney(shipping) : "Free"}</dd></div>
            <div><dt>Tax</dt><dd>Calculated in Stripe</dd></div>
            <div className="total-row"><dt>Total today</dt><dd>{formatMoney(subtotal + shipping)}</dd></div>
          </dl>
          {checkoutError ? <p className="form-error">{checkoutError}</p> : null}
          <button className="primary-button" type="button" disabled={!cart.length || checkoutLoading || (!account && !email)} onClick={() => startCheckout({ email })}>
            {checkoutLoading ? "Opening Stripe..." : "Pay securely"}
          </button>
          <div className="wallet-row">
            <span>Cards</span>
            <span>Apple Pay</span>
            <span>Google Pay</span>
            <span>PayPal</span>
          </div>
        </aside>
      </div>
    </section>
  );
}

export function AuthRoutePage({ mode }) {
  return <AccountPage initialTab={mode} />;
}

export function WishlistPage() {
  const { account, wishlist } = useCommerce();
  const list = useMemo(() => products.filter((product) => wishlist.includes(product.id)), [wishlist]);

  return (
    <section className="shop-page">
      <div className="shop-hero">
        <p className="eyebrow">Wishlist</p>
        <h1>Your saved BubbleBud products.</h1>
        {!account ? <p className="form-note">Log in to sync your wishlist across devices.</p> : null}
      </div>
      <ProductGrid products={list} />
    </section>
  );
}

export function OrderResultPage({ status }) {
  const params = useSearchParams();
  const { clearCart } = useCommerce();

  useEffect(() => {
    if (status === "success") clearCart();
  }, [status, clearCart]);

  const success = status === "success";

  return (
    <section className="account-page result-page">
      {success ? <CheckCircle2 size={44} /> : <ShieldAlert size={44} />}
      <p className="eyebrow">{success ? "Payment received" : "Checkout interrupted"}</p>
      <h1>{success ? "Your BubbleBud order is confirmed." : "Your order was not completed."}</h1>
      <p>
        {success
          ? "Stripe has confirmed the payment. Your order will appear in your account and a confirmation email will be sent after webhook processing."
          : "No payment was captured. You can return to your cart and try again."}
      </p>
      {params.get("session_id") ? <p className="form-note">Stripe session: {params.get("session_id")}</p> : null}
      <div className="hero-actions">
        <Link className="primary-button" href="/account">View account</Link>
        <Link className="secondary-button" href="/shop">Continue shopping</Link>
      </div>
    </section>
  );
}

export function AdminDashboard() {
  const [state, setState] = useState({ loading: true, error: "", data: null });

  useEffect(() => {
    fetch("/api/admin/summary")
      .then(async (response) => {
        const text = await response.text();
        const data = text ? JSON.parse(text) : {};
        if (!response.ok) throw new Error(data.error || "Admin access failed.");
        setState({ loading: false, error: "", data });
      })
      .catch((error) => setState({ loading: false, error: error.message, data: null }));
  }, []);

  if (state.loading) {
    return <section className="account-page"><p className="form-note">Loading admin dashboard...</p></section>;
  }

  if (state.error) {
    return (
      <section className="account-page result-page">
        <ShieldAlert size={42} />
        <h1>Admin access required.</h1>
        <p>{state.error}</p>
        <Link className="primary-button" href="/login">Log in</Link>
      </section>
    );
  }

  const { metrics, lowStock, recentOrders, recentReviews, customers } = state.data;
  const cards = [
    [BarChart3, "Revenue", `$${(metrics.revenueCents / 100).toFixed(2)}`],
    [PackageCheck, "Orders", metrics.orders],
    [Users, "Customers", metrics.customers],
    [Star, "Hidden reviews", metrics.pendingReviews],
  ];

  return (
    <section className="admin-page account-page">
      <div className="page-hero compact">
        <p className="eyebrow">Owner dashboard</p>
        <h1>Manage BubbleBud operations.</h1>
      </div>
      <div className="admin-metric-grid">
        {cards.map(([Icon, label, value]) => (
          <article className="why-card" key={label}>
            <Icon size={22} />
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
      <div className="admin-grid">
        <ProductManager />
        <AdminList title="Recent orders" rows={recentOrders.map((order) => [order.status, order.payment_status, `$${(order.total_cents / 100).toFixed(2)}`])} />
        <AdminList title="Low stock" rows={lowStock.map((product) => [product.title, product.stock_status, `${product.inventory_quantity} left`])} />
        <AdminList title="Recent reviews" rows={recentReviews.map((review) => [`${review.rating} stars`, review.visible ? "Visible" : "Hidden", new Date(review.created_at).toLocaleDateString()])} />
        <AdminList title="Customers" rows={customers.map((customer) => [customer.email, "", new Date(customer.created_at).toLocaleDateString()])} />
      </div>
    </section>
  );
}

function ProductManager() {
  const [form, setForm] = useState({
    id: "",
    slug: "",
    title: "",
    description: "",
    category: "Accessories",
    priceCents: 0,
    sku: "",
    inventoryQuantity: 10,
    images: "",
    tags: "",
    active: true,
  });
  const [message, setMessage] = useState("");

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const save = (event) => {
    event.preventDefault();
    setMessage("");
    fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        priceCents: Number(form.priceCents),
        inventoryQuantity: Number(form.inventoryQuantity),
        images: form.images.split("\n").map((item) => item.trim()).filter(Boolean),
        tags: form.tags.split(",").map((item) => item.trim()).filter(Boolean),
      }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Product could not be saved.");
        setMessage("Product saved.");
      })
      .catch((error) => setMessage(error.message));
  };

  return (
    <article className="account-panel admin-list">
      <h2>Add or edit product</h2>
      <form className="auth-form" onSubmit={save}>
        <input required value={form.id} onChange={(event) => update("id", event.target.value)} placeholder="Product ID" />
        <input required value={form.slug} onChange={(event) => update("slug", event.target.value)} placeholder="URL slug" />
        <input required value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="Product name" />
        <textarea required value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="Description" />
        <input required value={form.category} onChange={(event) => update("category", event.target.value)} placeholder="Category" />
        <input required type="number" value={form.priceCents} onChange={(event) => update("priceCents", event.target.value)} placeholder="Price in cents" />
        <input required value={form.sku} onChange={(event) => update("sku", event.target.value)} placeholder="SKU" />
        <input required type="number" value={form.inventoryQuantity} onChange={(event) => update("inventoryQuantity", event.target.value)} placeholder="Inventory quantity" />
        <textarea value={form.images} onChange={(event) => update("images", event.target.value)} placeholder="Image URLs, one per line" />
        <input value={form.tags} onChange={(event) => update("tags", event.target.value)} placeholder="Tags, comma separated" />
        <button className="primary-button" type="submit">Save product</button>
        {message ? <p className={message.includes("saved") ? "form-note" : "form-error"}>{message}</p> : null}
      </form>
    </article>
  );
}

function AdminList({ rows, title }) {
  return (
    <article className="account-panel admin-list">
      <h2>{title}</h2>
      {rows.length ? rows.map((row, index) => (
        <div className="admin-row" key={`${title}-${index}`}>
          {row.map((cell, cellIndex) => <span key={cellIndex}>{cell}</span>)}
        </div>
      )) : <p className="form-note">No records yet.</p>}
    </article>
  );
}
