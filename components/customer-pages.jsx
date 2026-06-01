"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BarChart3, Box, CheckCircle2, Heart, PackageCheck, ShieldAlert, Star, Users } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatMoney, products } from "@/lib/products";
import { AccountPage, ProductGrid } from "@/components/pages";
import { useCommerce } from "@/components/commerce-context";

let googlePlacesPromise;

function loadGooglePlaces() {
  if (typeof window === "undefined") return Promise.resolve(null);

  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) return Promise.resolve(null);
  if (window.google?.maps?.places) return Promise.resolve(window.google);

  if (!googlePlacesPromise) {
    googlePlacesPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector('script[data-bubblebud-google-places="true"]');

      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(window.google), { once: true });
        existingScript.addEventListener("error", reject, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.dataset.bubblebudGooglePlaces = "true";
      script.addEventListener("load", () => resolve(window.google), { once: true });
      script.addEventListener("error", reject, { once: true });
      document.head.appendChild(script);
    });
  }

  return googlePlacesPromise;
}

function normalizeAddress(address = {}) {
  return {
    line1: address.line1 || address.line_1 || "",
    line2: address.line2 || address.line_2 || "",
    city: address.city || "",
    state: address.state || "",
    postalCode: address.postalCode || address.postal_code || "",
    country: address.country || "US",
  };
}

function parseGoogleAddress(place) {
  const componentMap = {};

  (place.address_components || []).forEach((component) => {
    component.types.forEach((type) => {
      componentMap[type] = component;
    });
  });

  const street = [componentMap.street_number?.long_name, componentMap.route?.long_name].filter(Boolean).join(" ");

  return {
    line1: street || place.name || place.formatted_address || "",
    line2: "",
    city:
      componentMap.locality?.long_name ||
      componentMap.sublocality?.long_name ||
      componentMap.sublocality_level_1?.long_name ||
      componentMap.postal_town?.long_name ||
      "",
    state: componentMap.administrative_area_level_1?.short_name || "",
    postalCode: componentMap.postal_code?.long_name || "",
    country: componentMap.country?.short_name || "US",
  };
}

export function CartPage() {
  const { account, cart, checkoutError, checkoutLoading, removeFromCart, startCheckout, subtotal, updateCartQuantity } = useCommerce();
  const [provider, setProvider] = useState("stripe");
  const [checkoutMode, setCheckoutMode] = useState("guest");
  const [customer, setCustomer] = useState({ name: account?.name || "", email: account?.email || "", phone: "" });
  const [shippingAddress, setShippingAddress] = useState({ line1: "", line2: "", city: "", state: "", postalCode: "", country: "US" });
  const [billingAddress, setBillingAddress] = useState({ line1: "", line2: "", city: "", state: "", postalCode: "", country: "US" });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [sameBilling, setSameBilling] = useState(true);
  const [discountCode, setDiscountCode] = useState("");
  const shipping = subtotal > 50 || subtotal === 0 ? 0 : 5.95;
  const effectiveCustomer = { ...customer, email: account?.email || customer.email };
  const isAccountCheckout = checkoutMode === "account";

  useEffect(() => {
    if (account?.email) {
      setCustomer((current) => ({ ...current, name: current.name || account.name || "", email: account.email }));
    }
  }, [account]);

  useEffect(() => {
    if (!account) return;
    fetch("/api/account/addresses")
      .then((response) => (response.ok ? response.json() : { addresses: [] }))
      .then((data) => setSavedAddresses(data.addresses || []))
      .catch(() => setSavedAddresses([]));
  }, [account]);

  const updateCustomer = (field, value) => setCustomer((current) => ({ ...current, [field]: value }));
  const updateShipping = (field, value) => setShippingAddress((current) => ({ ...current, [field]: value }));
  const updateBilling = (field, value) => setBillingAddress((current) => ({ ...current, [field]: value }));
  const applyAddress = (address) => {
    setShippingAddress(normalizeAddress(address));
  };

  const submitCheckout = (event) => {
    event.preventDefault();
    startCheckout({
      provider,
      checkoutMode,
      customer: isAccountCheckout ? effectiveCustomer : undefined,
      shippingAddress: isAccountCheckout ? shippingAddress : undefined,
      billingAddress: isAccountCheckout ? sameBilling ? shippingAddress : billingAddress : undefined,
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
          <div className="payment-toggle" role="radiogroup" aria-label="Checkout type">
            <button className={checkoutMode === "guest" ? "is-active" : ""} type="button" onClick={() => setCheckoutMode("guest")}>
              Guest checkout
            </button>
            <button className={checkoutMode === "account" ? "is-active" : ""} type="button" onClick={() => setCheckoutMode("account")}>
              Create / use account
            </button>
          </div>
          <div className="payment-toggle" role="radiogroup" aria-label="Payment provider">
            <button className={provider === "stripe" ? "is-active" : ""} type="button" onClick={() => setProvider("stripe")}>
              Card / Wallet
            </button>
            <button className={provider === "paypal" ? "is-active" : ""} type="button" onClick={() => setProvider("paypal")}>
              PayPal
            </button>
          </div>
          {checkoutMode === "guest" ? (
            <div className="checkout-section">
              <h3>Guest checkout</h3>
              <p className="form-note">Continue directly to secure checkout. Stripe or PayPal will collect the email and shipping details needed for your order.</p>
            </div>
          ) : (
            <>
              <div className="checkout-section">
                <h3>Customer</h3>
                {!account ? <p className="form-note">For a permanent account, create one first. You can still save these details for checkout.</p> : null}
                {!account ? <Link className="secondary-button" href="/register">Create account</Link> : null}
                <label className="discount-field">
                  <span>Full name</span>
                  <input required={isAccountCheckout} autoComplete="name" value={customer.name} onChange={(event) => updateCustomer("name", event.target.value)} placeholder="Your name" />
                </label>
                <label className="discount-field">
                  <span>Email</span>
                  <input required={isAccountCheckout} type="email" autoComplete="email" value={effectiveCustomer.email} disabled={Boolean(account)} onChange={(event) => updateCustomer("email", event.target.value)} placeholder="you@example.com" />
                </label>
                <label className="discount-field">
                  <span>Phone optional</span>
                  <input type="tel" autoComplete="tel" value={customer.phone} onChange={(event) => updateCustomer("phone", event.target.value)} placeholder="(555) 123-4567" />
                </label>
                {account ? <p className="form-note">Checking out with your BubbleBud account.</p> : null}
              </div>
              <AddressFields title="Shipping address" address={shippingAddress} update={updateShipping} savedAddresses={savedAddresses} applyAddress={applyAddress} listId="shipping-addresses" />
              <label className="check-row">
                <input type="checkbox" checked={sameBilling} onChange={(event) => setSameBilling(event.target.checked)} />
                <span>Billing address is the same as shipping</span>
              </label>
              {!sameBilling ? <AddressFields title="Billing address" address={billingAddress} update={updateBilling} savedAddresses={savedAddresses} applyAddress={null} listId="billing-addresses" /> : null}
            </>
          )}
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
        </form>
      </div>
    </section>
  );
}

function AddressFields({ address, applyAddress, listId, savedAddresses = [], title, update }) {
  const [placesReady, setPlacesReady] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [autocompleteService, setAutocompleteService] = useState(null);
  const [placesService, setPlacesService] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const suppressedPredictionInput = useRef("");
  const predictionRequestId = useRef(0);

  useEffect(() => {
    let mounted = true;

    loadGooglePlaces()
      .then((google) => {
        if (!mounted || !google?.maps?.places) return;

        setPlacesReady(true);
        setAutocompleteService(new google.maps.places.AutocompleteService());
        setPlacesService(new google.maps.places.PlacesService(document.createElement("div")));
        setSessionToken(new google.maps.places.AutocompleteSessionToken());
      })
      .catch(() => {
        if (mounted) setPlacesReady(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const input = address.line1.trim();

    if (!autocompleteService || !sessionToken || input.length < 3 || input === suppressedPredictionInput.current) {
      setPredictions([]);
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      const requestId = predictionRequestId.current + 1;
      predictionRequestId.current = requestId;

      autocompleteService.getPlacePredictions({ input, types: ["address"], sessionToken }, (results, status) => {
        if (requestId !== predictionRequestId.current || input === suppressedPredictionInput.current) {
          setPredictions([]);
          return;
        }

        if (status === window.google.maps.places.PlacesServiceStatus.OK && results?.length) {
          setPredictions(results.slice(0, 6));
          return;
        }

        setPredictions([]);
      });
    }, 220);

    return () => window.clearTimeout(timeout);
  }, [address.line1, autocompleteService, sessionToken]);

  const fillAddress = (nextAddress) => {
    const normalized = normalizeAddress(nextAddress);
    suppressedPredictionInput.current = normalized.line1.trim();
    predictionRequestId.current += 1;
    setPredictions([]);

    if (applyAddress) {
      applyAddress(normalized);
      return;
    }

    Object.entries(normalized).forEach(([field, value]) => update(field, value));
  };

  const selectPrediction = (prediction) => {
    if (!placesService || !sessionToken) return;

    placesService.getDetails(
      {
        placeId: prediction.place_id,
        fields: ["address_components", "formatted_address", "name"],
        sessionToken,
      },
      (place, status) => {
        if (status !== window.google.maps.places.PlacesServiceStatus.OK || !place) return;

        fillAddress(parseGoogleAddress(place));
        setPredictions([]);
        setSessionToken(new window.google.maps.places.AutocompleteSessionToken());
      }
    );
  };

  return (
    <div className="checkout-section">
      <h3>{title}</h3>
      {savedAddresses.length ? (
        <div className="address-suggestions">
          {savedAddresses.map((saved) => (
            <button type="button" key={saved.id} onClick={() => fillAddress(saved)}>
              {saved.label}: {saved.line1 || saved.line_1}, {saved.city}, {saved.state}
            </button>
          ))}
        </div>
      ) : null}
      <label className="discount-field">
        <span>Address</span>
        <input
          required
          autoComplete="street-address"
          list={listId}
          value={address.line1}
          onChange={(event) => {
            suppressedPredictionInput.current = "";
            update("line1", event.target.value);
          }}
          placeholder="Street address"
        />
        <datalist id={listId}>
          {savedAddresses.map((saved) => <option key={saved.id} value={saved.line1 || saved.line_1 || ""} />)}
        </datalist>
      </label>
      {placesReady && predictions.length ? (
        <div className="address-autocomplete" role="listbox" aria-label={`${title} address suggestions`}>
          {predictions.map((prediction) => (
            <button type="button" key={prediction.place_id} onClick={() => selectPrediction(prediction)}>
              <strong>{prediction.structured_formatting?.main_text || prediction.description}</strong>
              <span>{prediction.structured_formatting?.secondary_text || prediction.description}</span>
            </button>
          ))}
        </div>
      ) : null}
      <label className="discount-field">
        <span>Apartment, suite, etc.</span>
        <input autoComplete="address-line2" value={address.line2} onChange={(event) => update("line2", event.target.value)} placeholder="Optional" />
      </label>
      <div className="form-grid compact-grid">
        <label className="discount-field">
          <span>City</span>
          <input required autoComplete="address-level2" value={address.city} onChange={(event) => update("city", event.target.value)} placeholder="City" />
        </label>
        <label className="discount-field">
          <span>State</span>
          <input required autoComplete="address-level1" value={address.state} onChange={(event) => update("state", event.target.value)} placeholder="State" />
        </label>
      </div>
      <div className="form-grid compact-grid">
        <label className="discount-field">
          <span>ZIP code</span>
          <input required autoComplete="postal-code" value={address.postalCode} onChange={(event) => update("postalCode", event.target.value)} placeholder="ZIP" />
        </label>
        <label className="discount-field">
          <span>Country</span>
          <input required autoComplete="country" maxLength={2} value={address.country} onChange={(event) => update("country", event.target.value.toUpperCase())} />
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
  const { account, clearCart } = useCommerce();
  const [paypalState, setPaypalState] = useState({ loading: false, message: "" });
  const [orderLink, setOrderLink] = useState("/account/orders");

  useEffect(() => {
    if (status === "success") clearCart();
  }, [status, clearCart]);

  useEffect(() => {
    if (status !== "success" || !account) return;

    const sessionId = params.get("session_id");
    const paypalOrderId = params.get("token");
    const search = new URLSearchParams();

    if (sessionId) search.set("session_id", sessionId);
    if (paypalOrderId) search.set("paypal_order_id", paypalOrderId);
    if (!search.toString()) {
      setOrderLink("/account/orders");
      return;
    }

    fetch(`/api/account/orders/lookup?${search.toString()}`)
      .then((response) => (response.ok ? response.json() : { order: null }))
      .then((data) => {
        setOrderLink(data.order?.order_number ? `/account/orders/${encodeURIComponent(data.order.order_number)}` : "/account/orders");
      })
      .catch(() => setOrderLink("/account/orders"));
  }, [account, params, status]);

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
        {success && account ? <a className="primary-button" href={orderLink}>View Order</a> : null}
        {success && !account ? <a className="primary-button" href="/track-order">Track Order</a> : null}
        <a className="secondary-button" href="/shop">Continue Shopping</a>
        <a className="secondary-button" href="/">Back to Home</a>
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
