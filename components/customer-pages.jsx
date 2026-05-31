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
  const [provider, setProvider] = useState("stripe");
  const [customer, setCustomer] = useState({ name: account?.name || "", email: account?.email || "", phone: "" });
  const [shippingAddress, setShippingAddress] = useState({ line1: "", line2: "", city: "", state: "", postalCode: "", country: "US" });
  const [billingAddress, setBillingAddress] = useState({ line1: "", line2: "", city: "", state: "", postalCode: "", country: "US" });
  const [sameBilling, setSameBilling] = useState(true);
  const [discountCode, setDiscountCode] = useState("");
  const shipping = subtotal > 50 || subtotal === 0 ? 0 : 5.95;
  const effectiveCustomer = { ...customer, email: account?.email || customer.email };

  useEffect(() => {
    if (account?.email) {
      setCustomer((current) => ({ ...current, name: current.name || account.name || "", email: account.email }));
    }
  }, [account]);

  const updateCustomer = (field, value) => setCustomer((current) => ({ ...current, [field]: value }));
  const updateShipping = (field, value) => setShippingAddress((current) => ({ ...current, [field]: value }));
  const updateBilling = (field, value) => setBillingAddress((current) => ({ ...current, [field]: value }));

  const submitCheckout = (event) => {
    event.preventDefault();
    startCheckout({
      provider,
      customer: effectiveCustomer,
      shippingAddress,
      billingAddress: sameBilling ? shippingAddress : billingAddress,
      discountCode,
    });
  };

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
        <form className="checkout-card" onSubmit={submitCheckout}>
          <h2>Secure checkout</h2>
          <div className="payment-toggle" role="radiogroup" aria-label="Payment provider">
            <button className={provider === "stripe" ? "is-active" : ""} type="button" onClick={() => setProvider("stripe")}>
              Card / Wallet
            </button>
            <button className={provider === "paypal" ? "is-active" : ""} type="button" onClick={() => setProvider("paypal")}>
              PayPal
            </button>
          </div>
          <div className="checkout-section">
            <h3>Customer</h3>
            <label className="discount-field">
              <span>Full name</span>
              <input required value={customer.name} onChange={(event) => updateCustomer("name", event.target.value)} placeholder="Your name" />
            </label>
            <label className="discount-field">
              <span>Email</span>
              <input required type="email" value={effectiveCustomer.email} disabled={Boolean(account)} onChange={(event) => updateCustomer("email", event.target.value)} placeholder="you@example.com" />
            </label>
            <label className="discount-field">
              <span>Phone</span>
              <input required type="tel" value={customer.phone} onChange={(event) => updateCustomer("phone", event.target.value)} placeholder="(555) 123-4567" />
            </label>
            {account ? <p className="form-note">Checking out with your BubbleBud account.</p> : <p className="form-note">Guest checkout creates an order tied to this email.</p>}
          </div>
          <AddressFields title="Shipping address" address={shippingAddress} update={updateShipping} />
          <label className="check-row">
            <input type="checkbox" checked={sameBilling} onChange={(event) => setSameBilling(event.target.checked)} />
            <span>Billing address is the same as shipping</span>
          </label>
          {!sameBilling ? <AddressFields title="Billing address" address={billingAddress} update={updateBilling} /> : null}
          <label className="discount-field">
            <span>Discount code</span>
            <input value={discountCode} onChange={(event) => setDiscountCode(event.target.value)} placeholder="Optional" />
          </label>
          <dl>
            <div><dt>Subtotal</dt><dd>{formatMoney(subtotal)}</dd></div>
            <div><dt>Shipping</dt><dd>{shipping ? formatMoney(shipping) : "Free"}</dd></div>
            <div><dt>Tax</dt><dd>Calculated at checkout</dd></div>
            <div className="total-row"><dt>Total today</dt><dd>{formatMoney(subtotal + shipping)}</dd></div>
          </dl>
          {checkoutError ? <p className="form-error">{checkoutError}</p> : null}
          <button className="primary-button" type="submit" disabled={!cart.length || checkoutLoading}>
            {checkoutLoading ? "Opening secure payment..." : provider === "paypal" ? "Pay with PayPal" : "Pay by card or wallet"}
          </button>
          <div className="wallet-row">
            <span>Cards</span>
            <span>Apple Pay</span>
            <span>Google Pay</span>
            <span>PayPal</span>
          </div>
        </form>
      </div>
    </section>
  );
}

function AddressFields({ address, title, update }) {
  return (
    <div className="checkout-section">
      <h3>{title}</h3>
      <label className="discount-field">
        <span>Address</span>
        <input required value={address.line1} onChange={(event) => update("line1", event.target.value)} placeholder="Street address" />
      </label>
      <label className="discount-field">
        <span>Apartment, suite, etc.</span>
        <input value={address.line2} onChange={(event) => update("line2", event.target.value)} placeholder="Optional" />
      </label>
      <div className="form-grid compact-grid">
        <label className="discount-field">
          <span>City</span>
          <input required value={address.city} onChange={(event) => update("city", event.target.value)} placeholder="City" />
        </label>
        <label className="discount-field">
          <span>State</span>
          <input required value={address.state} onChange={(event) => update("state", event.target.value)} placeholder="State" />
        </label>
      </div>
      <div className="form-grid compact-grid">
        <label className="discount-field">
          <span>ZIP code</span>
          <input required value={address.postalCode} onChange={(event) => update("postalCode", event.target.value)} placeholder="ZIP" />
        </label>
        <label className="discount-field">
          <span>Country</span>
          <input required maxLength={2} value={address.country} onChange={(event) => update("country", event.target.value.toUpperCase())} />
        </label>
      </div>
    </div>
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
  const [paypalState, setPaypalState] = useState({ loading: false, message: "" });

  useEffect(() => {
    if (status === "success") clearCart();
  }, [status, clearCart]);

  useEffect(() => {
    const provider = params.get("provider");
    const token = params.get("token");
    if (status !== "success" || provider !== "paypal" || !token) return;

    setPaypalState({ loading: true, message: "Capturing PayPal payment..." });
    fetch("/api/paypal/capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: token }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "PayPal capture failed.");
        setPaypalState({ loading: false, message: "PayPal confirmed the payment. Your order email will arrive after webhook verification." });
      })
      .catch((error) => setPaypalState({ loading: false, message: error.message }));
  }, [params, status]);

  const success = status === "success";
  const provider = params.get("provider") || "stripe";

  return (
    <section className="account-page result-page">
      {success ? <CheckCircle2 size={44} /> : <ShieldAlert size={44} />}
      <p className="eyebrow">{success ? "Payment received" : "Checkout interrupted"}</p>
      <h1>{success ? "Your BubbleBud order is confirmed." : "Your order was not completed."}</h1>
      <p>
        {success
          ? `${provider === "paypal" ? "PayPal" : "Stripe"} is processing the payment. Your order is created only after the verified webhook confirms payment.`
          : "No payment was captured. You can return to your cart and try again."}
      </p>
      {params.get("session_id") ? <p className="form-note">Stripe session: {params.get("session_id")}</p> : null}
      {params.get("token") ? <p className="form-note">PayPal order: {params.get("token")}</p> : null}
      {paypalState.message ? <p className={paypalState.message.includes("failed") ? "form-error" : "form-note"}>{paypalState.message}</p> : null}
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

  const { metrics, lowStock, customers } = state.data;
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
        <OrderManager />
        <AdminList title="Low stock" rows={lowStock.map((product) => [product.title, product.stock_status, `${product.inventory_quantity} left`])} />
        <ReviewManager />
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

function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");

  const loadOrders = () => {
    fetch("/api/admin/orders")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Orders could not be loaded.");
        setOrders(data.orders || []);
      })
      .catch((error) => setMessage(error.message));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateOrder = (id, field, value) => {
    setOrders((rows) => rows.map((order) => (order.id === id ? { ...order, [field]: value } : order)));
  };

  const saveOrder = (order) => {
    setMessage("");
    fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: order.id,
        status: order.status,
        trackingNumber: order.tracking_number || "",
        trackingUrl: order.tracking_url || "",
      }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Order could not be updated.");
        setMessage(`Order ${data.order.order_number} updated.`);
      })
      .catch((error) => setMessage(error.message));
  };

  return (
    <article className="account-panel admin-list">
      <h2>Orders</h2>
      {message ? <p className={message.includes("updated") ? "form-note" : "form-error"}>{message}</p> : null}
      {orders.length ? orders.slice(0, 8).map((order) => (
        <div className="admin-control-row" key={order.id}>
          <div>
            <strong>{order.order_number}</strong>
            <small>{order.customer_email} - ${(order.total_cents / 100).toFixed(2)} - {order.payment_status}</small>
          </div>
          <select value={order.status} onChange={(event) => updateOrder(order.id, "status", event.target.value)}>
            {["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"].map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <input value={order.tracking_number || ""} onChange={(event) => updateOrder(order.id, "tracking_number", event.target.value)} placeholder="Tracking number" />
          <input value={order.tracking_url || ""} onChange={(event) => updateOrder(order.id, "tracking_url", event.target.value)} placeholder="Tracking URL" />
          <button className="secondary-button" type="button" onClick={() => saveOrder(order)}>Save</button>
        </div>
      )) : <p className="form-note">No orders yet.</p>}
    </article>
  );
}

function ReviewManager() {
  const [reviews, setReviews] = useState([]);
  const [message, setMessage] = useState("");

  const loadReviews = () => {
    fetch("/api/admin/reviews")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Reviews could not be loaded.");
        setReviews(data.reviews || []);
      })
      .catch((error) => setMessage(error.message));
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const moderate = (reviewId, action) => {
    setMessage("");
    fetch("/api/admin/reviews", {
      method: action === "delete" ? "DELETE" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(action === "delete" ? { reviewId } : { reviewId, visible: action === "show" }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Review could not be updated.");
        setMessage("Review updated.");
        setReviews((rows) => rows.map((review) => (review.id === reviewId ? data.review : review)));
      })
      .catch((error) => setMessage(error.message));
  };

  return (
    <article className="account-panel admin-list">
      <h2>Reviews</h2>
      {message ? <p className={message.includes("updated") ? "form-note" : "form-error"}>{message}</p> : null}
      {reviews.length ? reviews.slice(0, 8).map((review) => (
        <div className="admin-control-row" key={review.id}>
          <div>
            <strong>{review.products?.title || "Product"} - {review.rating} stars</strong>
            <small>{review.profiles?.email || "Customer"} - {review.status || (review.visible ? "approved" : "hidden")}</small>
          </div>
          <p>{review.body || review.title || "Star-only review"}</p>
          <div className="admin-button-row">
            <button className="secondary-button" type="button" onClick={() => moderate(review.id, review.visible ? "hide" : "show")}>
              {review.visible ? "Hide" : "Approve"}
            </button>
            <button className="secondary-button" type="button" onClick={() => moderate(review.id, "delete")}>Delete</button>
          </div>
        </div>
      )) : <p className="form-note">No reviews yet.</p>}
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
