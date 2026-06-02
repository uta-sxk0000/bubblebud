"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  Download,
  ExternalLink,
  Heart,
  Home,
  Mail,
  MapPin,
  MessageCircle,
  PackageCheck,
  ReceiptText,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import { categories, formatMoney, formatVariantSelection, getRelatedProducts, getReviewSummary, getVariantGroups, products } from "@/lib/products";
import { moneyFromCents } from "@/lib/commerce";
import { useCommerce } from "@/components/commerce-context";
import { TrustStrip } from "@/components/site-frame";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const trackingSteps = [
  { key: "pending", label: "Pending", icon: ClipboardCheck },
  { key: "paid", label: "Paid", icon: CircleDollarSign },
  { key: "processing", label: "Processing", icon: PackageCheck },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Home },
];

const detailIntroByCategory = {
  Accessories:
    "Designed for daily carry, this piece keeps essentials protected while staying light, polished, and easy to pack.",
  Beauty:
    "Built for routines on the move, this bag keeps small beauty items organized without taking over your tote or suitcase.",
  Lifestyle:
    "Created as a thoughtful gift or room accent, this piece adds lasting charm without the upkeep of fresh decor.",
  Tech:
    "Made for desks, bedside tables, and small spaces, this item adds useful function with a soft BubbleBud finish.",
  "Home Essentials":
    "A compact home accent made to feel giftable, cozy, and simple to place in everyday rooms.",
  Plushies:
    "A soft collectible plush made for gifting, display, and cozy everyday comfort.",
};

export function HomePage({ products: catalog = products }) {
  return (
    <>
      <HeroSection />
      <FeaturedCategories />
      <BestSellers products={catalog} />
      <PromoBanner />
      <TestimonialSection />
      <WhyChoose />
      <SocialGallery />
      <NewsletterSection />
    </>
  );
}

function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-bg">
        <img src="/assets/hero-arrivals.png" alt="BubbleBud lifestyle essentials" />
      </div>
      <motion.div
        className="hero-copy"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <p className="eyebrow">Modern essentials, softly premium</p>
        <h1>Elevate Your Everyday Essentials</h1>
        <p>Minimal. Premium. Designed for modern living.</p>
        <div className="hero-actions">
          <Link className="primary-button" href="/shop">
            Shop now
          </Link>
          <Link className="glass-button" href="/shop#categories">
            Explore collection
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

function FeaturedCategories() {
  return (
    <section className="section-wrap" id="categories">
      <SectionHeading eyebrow="Shop by mood" title="Featured categories" copy="Clear paths into the products customers want most." />
      <div className="category-grid">
        {categories.map((category, index) => (
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} transition={{ delay: index * 0.06 }} key={category.name}>
            <Link className="category-card" href={`/shop?category=${encodeURIComponent(category.name)}`}>
              <img src={category.image} alt="" loading="lazy" />
              <span>{category.name}</span>
              <small>{category.copy}</small>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function BestSellers({ products: catalog }) {
  const [filter, setFilter] = useState("All");
  const options = ["All", "Beauty", "Accessories", "Lifestyle", "Tech", "Plushies"];
  const shown = catalog
    .filter((product) => filter === "All" || product.category === filter)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);

  return (
    <section className="section-wrap">
      <SectionHeading eyebrow="Customer favorites" title="Best sellers" copy="Premium product cards with quick actions and smooth hover states." />
      <div className="segmented-control" aria-label="Filter best sellers">
        {options.map((option) => (
          <button className={filter === option ? "is-active" : ""} type="button" key={option} onClick={() => setFilter(option)}>
            {option}
          </button>
        ))}
      </div>
      <ProductGrid products={shown} />
    </section>
  );
}

function PromoBanner() {
  return (
    <section className="promo-banner">
      <div>
        <p className="eyebrow">Summer Collection 2026</p>
        <h2>Designed for comfort, style, and clean daily routines.</h2>
        <p>Fresh essentials, soft textures, and gift-ready details without the clutter.</p>
        <Link className="primary-button" href="/shop?sort=new">
          Shop the drop
        </Link>
      </div>
      <img src="/assets/promo-plush.jpg" alt="BubbleBud promotional lifestyle product" loading="lazy" />
    </section>
  );
}

function TestimonialSection() {
  return (
    <section className="section-wrap reviews-showcase">
      <SectionHeading eyebrow="Trust, built in" title="Verified reviews only" copy="BubbleBud only accepts public reviews from logged-in customers with delivered orders." />
      <div className="testimonial-shell">
        <article className="testimonial-card">
          <img src="/assets/product-laptop-14.jpg" alt="" />
          <div>
            <Stars rating={5} />
            <p>Reviews unlock after purchase, delivery, and account verification.</p>
            <strong>Verified purchase policy</strong>
            <span>
              <BadgeCheck size={16} /> One review per customer per product
            </span>
          </div>
        </article>
      </div>
    </section>
  );
}

function WhyChoose() {
  const items = [
    [Truck, "Fast Shipping", "Tracked delivery and clean customer updates."],
    [ShieldCheck, "Secure Payments", "Checkout UI designed around trust."],
    [Sparkles, "Premium Quality", "Curated products with polished details."],
    [PackageCheck, "Easy Returns", "Simple support flow for confident shopping."],
    [UserRound, "24/7 Support", "Floating chat and order help where customers need it."],
  ];

  return (
    <section className="section-wrap">
      <SectionHeading eyebrow="Why BubbleBud" title="Modern shopping confidence" copy="Trust indicators that help customers move from browsing to buying." />
      <div className="why-grid">
        {items.map(([Icon, title, copy]) => (
          <article className="why-card" key={title}>
            <Icon size={24} />
            <h3>{title}</h3>
            <p>{copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function SocialGallery() {
  const images = [
    "/assets/social-tiktok.png",
    "/assets/product-purple-bouquet.jpg",
    "/assets/product-laptop-14.jpg",
    "/assets/product-night-light.jpg",
    "/assets/product-makeup-9.jpg",
    "/assets/collection-flowers.png",
  ];

  return (
    <section className="section-wrap">
      <SectionHeading eyebrow="Social proof" title="Seen in real routines" copy="Lifestyle content with subtle motion and high-quality product focus." />
      <div className="social-grid">
        {images.map((image, index) => (
          <a className="social-tile" href={index === 0 ? "https://www.tiktok.com/@_bubblebud_" : "https://www.instagram.com/_bubblebud/"} target="_blank" rel="noreferrer" key={image} aria-label="Open BubbleBud social media">
            <img src={image} alt="" loading="lazy" />
            <span>Follow</span>
          </a>
        ))}
      </div>
    </section>
  );
}

function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <section className="newsletter-section">
      <div>
        <p className="eyebrow">Join the BubbleBud Community</p>
        <h2>Soft launches, smarter picks, and private offers.</h2>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setMessage("");
          fetch("/api/newsletter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          })
            .then(async (response) => {
              const data = await response.json();
              if (!response.ok) throw new Error(data.error || "Subscription failed.");
              setDone(true);
            })
            .catch((error) => setMessage(error.message));
        }}
      >
        <Mail size={20} />
        <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" />
        <button type="submit">Subscribe</button>
      </form>
      {done ? <p className="form-note">You are on the list.</p> : null}
      {message ? <p className="form-error">{message}</p> : null}
    </section>
  );
}

export function ShopPage({ products: catalog = products }) {
  const searchParams = useSearchParams();
  const { hydrated, wishlist } = useCommerce();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const [maxPrice, setMaxPrice] = useState(60);
  const [filterOpen, setFilterOpen] = useState(false);
  const [wishlistOnly, setWishlistOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialCategory = searchParams.get("category");
    const initialSort = searchParams.get("sort");
    const initialTag = searchParams.get("tag");
    setCategory(initialCategory || "All");
    setSort(initialSort === "rating" ? "rating" : initialSort === "new" || initialTag === "new" ? "newest" : "featured");
    setWishlistOnly(Boolean(searchParams.get("wishlist")));
    const timer = window.setTimeout(() => setLoading(false), 400);
    return () => window.clearTimeout(timer);
  }, [searchParams]);

  const filtered = useMemo(() => {
    const searched = catalog.filter((product) => {
      const haystack = `${product.title} ${product.category} ${product.tags.join(" ")}`.toLowerCase();
      const matchesSearch = haystack.includes(query.toLowerCase());
      const matchesCategory = category === "All" || product.category === category;
      const matchesPrice = product.price <= maxPrice;
      const matchesWishlist = !wishlistOnly || wishlist.includes(product.id);
      return matchesSearch && matchesCategory && matchesPrice && matchesWishlist;
    });

    return searched.sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "newest") return Number(b.badge === "New") - Number(a.badge === "New");
      return Number(Boolean(b.compareAt)) - Number(Boolean(a.compareAt));
    });
  }, [catalog, category, maxPrice, query, sort, wishlist, wishlistOnly]);

  const filterPanel = (
    <FilterPanel
      category={category}
      maxPrice={maxPrice}
      query={query}
      setCategory={setCategory}
      setMaxPrice={setMaxPrice}
      setQuery={setQuery}
      setWishlistOnly={setWishlistOnly}
      wishlistOnly={wishlistOnly}
    />
  );

  return (
    <section className="shop-page">
      <div className="shop-hero">
        <p className="eyebrow">Shop BubbleBud</p>
        <h1>Premium essentials, sorted for fast shopping.</h1>
        <TrustStrip />
      </div>

      <div className="shop-toolbar">
        <button className="filter-toggle" type="button" onClick={() => setFilterOpen(true)}>
          <SlidersHorizontal size={18} /> Filters
        </button>
        <label>
          <span>Sort</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="featured">Featured</option>
            <option value="rating">Top rated</option>
            <option value="newest">New arrivals</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
        </label>
      </div>

      <div className="shop-layout">
        <aside className="filter-sidebar">{filterPanel}</aside>
        <div>
          <div className="shop-count">
            <span>{filtered.length} products</span>
            <span>Free shipping over $50</span>
          </div>
          {loading || !hydrated ? <SkeletonGrid /> : <ProductGrid products={filtered} />}
        </div>
      </div>

      <AnimatePresence>
        {filterOpen ? (
          <motion.div className="drawer-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.aside className="mobile-filter-drawer" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}>
              <div className="dialog-top">
                <h2>Filters</h2>
                <button className="icon-action" type="button" onClick={() => setFilterOpen(false)} aria-label="Close filters">
                  <X size={21} />
                </button>
              </div>
              {filterPanel}
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

function FilterPanel({ category, maxPrice, query, setCategory, setMaxPrice, setQuery, setWishlistOnly, wishlistOnly }) {
  return (
    <div className="filter-panel" id="categories">
      <label className="search-filter">
        <Search size={18} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" />
      </label>
      <div>
        <h3>Category</h3>
        {["All", ...categories.map((item) => item.name)].map((item) => (
          <button className={category === item ? "is-active" : ""} type="button" key={item} onClick={() => setCategory(item)}>
            {item}
          </button>
        ))}
      </div>
      <label className="range-filter">
        <span>Price up to {formatMoney(maxPrice)}</span>
        <input type="range" min="8" max="60" value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} />
      </label>
      <label className="check-row">
        <input type="checkbox" checked={wishlistOnly} onChange={(event) => setWishlistOnly(event.target.checked)} />
        Show wishlist only
      </label>
    </div>
  );
}

export function ProductPage({ product }) {
  const { addRecentlyViewed, addToCart, recent } = useCommerce();
  const variantGroups = getVariantGroups(product);
  const initialVariantSelection = () => Object.fromEntries(variantGroups.map((group) => [group.name, group.options[0]]));
  const [image, setImage] = useState(product.image);
  const [quantity, setQuantity] = useState(1);
  const [variantSelection, setVariantSelection] = useState(initialVariantSelection);
  const [tab, setTab] = useState("Description");
  const selectedVariant = formatVariantSelection(variantSelection);

  useEffect(() => {
    addRecentlyViewed(product.id);
  }, [product.id]);

  useEffect(() => {
    setVariantSelection(initialVariantSelection());
  }, [product.id]);

  const related = getRelatedProducts(product, 4);
  const recentlyViewed = products.filter((item) => item.id !== product.id && recent.includes(item.id)).slice(0, 4);

  return (
    <section className="product-page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/shop">Shop</Link>
        <span>/</span>
        <span>{product.title}</span>
      </nav>

      <div className="product-detail-layout">
        <div className="product-gallery">
          <div className="thumb-list">
            {product.gallery.map((item, index) => (
              <button className={image === item ? "is-active" : ""} type="button" key={item} onClick={() => setImage(item)}>
                <img src={item} alt={`${product.title} thumbnail ${index + 1}`} />
              </button>
            ))}
          </div>
          <div className="main-product-image">
            <img src={image} alt={product.title} />
          </div>
        </div>

        <div className="product-buy-box">
          <p className="eyebrow">{product.category}</p>
          <h1>{product.title}</h1>
          <div className="rating-line">
            <Stars rating={product.rating} />
            <span>{product.rating.toFixed(1)} ({product.reviewCount} reviews)</span>
          </div>
          <div className="price-row large">
            <strong>{formatMoney(product.price)}</strong>
            {product.compareAt ? <span>{formatMoney(product.compareAt)}</span> : null}
          </div>
          <p>{product.description}</p>

          {variantGroups.map((group) => (
            <div className="option-group" key={group.name}>
              <span>{group.name}</span>
              <div>
                {group.options.map((item) => (
                  <button
                    className={variantSelection[group.name] === item ? "is-active" : ""}
                    type="button"
                    key={item}
                    onClick={() => setVariantSelection((current) => ({ ...current, [group.name]: item }))}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="purchase-row">
            <div className="quantity-stepper">
              <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity">
                -
              </button>
              <span>{quantity}</span>
              <button type="button" onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity">
                +
              </button>
            </div>
            <button className="primary-button" type="button" onClick={() => addToCart(product, quantity, selectedVariant)}>
              Add to cart
            </button>
          </div>
          <button className="buy-now-button" type="button" onClick={() => addToCart(product, quantity, selectedVariant)}>
            Buy now
          </button>
          <TrustStrip />
          <ProductDetailNotes product={product} />
        </div>
      </div>

      <ProductTabs product={product} active={tab} setActive={setTab} />
      <ReviewPanel product={product} />
      <ProductRail title="AI-powered recommendations" copy="Smart picks based on category, rating, and browsing intent." products={related} />
      {recentlyViewed.length ? <ProductRail title="Recently viewed" copy="Products you looked at during this session." products={recentlyViewed} /> : null}

      <div className="mobile-purchase-bar">
        <span>{formatMoney(product.price)}</span>
        <button type="button" onClick={() => addToCart(product, quantity, selectedVariant)}>
          Add to cart
        </button>
      </div>
    </section>
  );
}

function ProductDetailNotes({ product }) {
  return (
    <div className="product-detail-notes">
      <article>
        <span>Material feel</span>
        <strong>{detailIntroByCategory[product.category] || "Premium everyday quality with thoughtful BubbleBud details."}</strong>
      </article>
      <article>
        <span>Best for</span>
        <strong>{product.tags.slice(0, 4).join(", ")}</strong>
      </article>
      <article>
        <span>Ships with</span>
        <strong>Tracking, careful packaging, and customer support.</strong>
      </article>
    </div>
  );
}

function ProductTabs({ product, active, setActive }) {
  const tabContent = {
    Description: {
      title: "Product overview",
      copy: `${product.description} ${detailIntroByCategory[product.category] || ""}`,
      list: product.details,
    },
    Details: {
      title: "Detailed product notes",
      copy:
        "Every BubbleBud product page is written to help customers understand size, use, feel, and everyday purpose before they add to cart.",
      list: [
        ...product.details,
        `Category: ${product.category}`,
        ...(getVariantGroups(product).length
          ? getVariantGroups(product).map((group) => `${group.name}: ${group.options.join(", ")}`)
          : ["Options: No selection needed"]),
      ],
    },
    Shipping: {
      title: "Shipping information",
      copy: product.shipping,
      list: ["Ships with order tracking", "Packed to protect the product shape", "Free shipping available on orders over $50"],
    },
    Care: {
      title: "Care instructions",
      copy: product.care,
      list: ["Handle gently", "Store in a clean, dry place", "Contact BubbleBud support if anything arrives damaged"],
    },
  };
  const current = tabContent[active];

  return (
    <section className="product-tabs">
      <div className="tab-list">
        {Object.keys(tabContent).map((item) => (
          <button className={active === item ? "is-active" : ""} type="button" key={item} onClick={() => setActive(item)}>
            {item}
          </button>
        ))}
      </div>
      <motion.div className="product-tab-panel" key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h2>{current.title}</h2>
        <p>{current.copy}</p>
        <ul>
          {current.list.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </motion.div>
    </section>
  );
}

function ReviewPanel({ product }) {
  const { account } = useCommerce();
  const [form, setForm] = useState({ title: "", body: "", rating: 5 });
  const [reviews, setReviews] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    setLoading(true);
    const response = await fetch(`/api/reviews?productId=${encodeURIComponent(product.id)}`);
    const data = response.ok ? await response.json() : { reviews: [] };
    setReviews(data.reviews || []);
    setLoading(false);
  };

  useEffect(() => {
    loadReviews();
  }, [product.id]);

  const summary = getReviewSummary({ rating: 0, reviewCount: 0, reviews }, []);

  const submitReview = (event) => {
    event.preventDefault();
    setMessage("");
    fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, ...form }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Review could not be saved.");
        setMessage("Review saved as a verified purchase review.");
        setForm({ title: "", body: "", rating: 5 });
        loadReviews();
      })
      .catch((error) => setMessage(error.message));
  };

  return (
    <section className="review-panel">
      <div className="review-summary">
        <p className="eyebrow">Customer reviews</p>
        <h2>{summary.average.toFixed(1)} average rating</h2>
        <Stars rating={summary.average} />
        <span>{summary.count} total reviews</span>
      </div>
      <form className="review-form" onSubmit={submitReview}>
        <h3>Leave a verified review</h3>
        {!account ? (
          <p className="form-note">
            <Link href="/login">Log in</Link> after your delivered purchase to review this product.
          </p>
        ) : null}
        <StarPicker value={form.rating} onChange={(rating) => setForm((value) => ({ ...value, rating }))} />
        <input value={form.title} onChange={(event) => setForm((value) => ({ ...value, title: event.target.value }))} placeholder="Title (optional)" />
        <textarea value={form.body} onChange={(event) => setForm((value) => ({ ...value, body: event.target.value }))} placeholder="Review text (optional)" />
        <div className="review-form-actions">
          <button className="primary-button" type="submit" disabled={!account}>
            Submit verified review
          </button>
        </div>
        {message ? <p className={message.includes("saved") ? "form-note" : "form-error"}>{message}</p> : null}
      </form>
      <div className="review-list">
        {loading ? <p className="form-note">Loading verified reviews...</p> : null}
        {!loading && !reviews.length ? <p className="form-note">No verified purchase reviews yet.</p> : null}
        {reviews.map((review) => (
          <article className="review-card" key={review.id}>
            <div className="review-card-top">
              <Stars rating={review.rating} />
              {review.verified ? (
                <span>
                  <BadgeCheck size={15} /> Verified buyer
                </span>
              ) : null}
            </div>
            {review.title ? <h3>{review.title}</h3> : null}
            {review.body ? <p>{review.body}</p> : null}
            <div className="review-card-footer">
              <strong>{review.name}</strong>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function AccountPage({ initialTab = "Login" }) {
  const { account, signOut, wishlist } = useCommerce();
  const [tab, setTab] = useState(initialTab);
  const [orders, setOrders] = useState([]);
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState(null);
  const wishlistProducts = products.filter((product) => wishlist.includes(product.id));
  const accountTabs = account ? ["Order history", "Track order", "Wishlist", "Addresses"] : ["Login", "Register", "Forgot password"];

  useEffect(() => {
    if (account && ["Login", "Register", "Forgot password"].includes(tab)) {
      setTab("Order history");
    }
  }, [account, tab]);

  useEffect(() => {
    if (!account) return;
    fetch("/api/account/orders")
      .then((response) => (response.ok ? response.json() : { orders: [] }))
      .then((data) => setOrders(data.orders || []))
      .catch(() => setOrders([]));
  }, [account]);

  return (
    <section className="account-page">
      <div className="page-hero compact">
        <p className="eyebrow">Account</p>
        <h1>Your BubbleBud space</h1>
      </div>
      <div className="account-grid">
        <aside className="account-tabs">
          {account ? (
            <div className="account-mini-card">
              <strong>{account.name}</strong>
              <span>{account.email}</span>
              <button className="text-button" type="button" onClick={signOut}>
                Log out
              </button>
            </div>
          ) : null}
          {accountTabs.map((item) => (
            <button className={tab === item ? "is-active" : ""} type="button" key={item} onClick={() => setTab(item)}>
              {item}
            </button>
          ))}
        </aside>
        <div className="account-panel">
          {tab === "Login" || tab === "Register" || tab === "Forgot password" ? (
            <AuthForm mode={tab} account={account} />
          ) : null}
          {tab === "Order history" ? <OrderHistory orders={orders} onTrack={(order) => {
            setSelectedTrackingOrder(order);
            setTab("Track order");
          }} /> : null}
          {tab === "Track order" ? <TrackOrderPanel compact initialOrder={selectedTrackingOrder} /> : null}
          {tab === "Wishlist" ? <ProductGrid products={wishlistProducts.length ? wishlistProducts : products.slice(0, 3)} /> : null}
          {tab === "Addresses" ? <AddressBook /> : null}
        </div>
      </div>
    </section>
  );
}

function AuthForm({ mode, account }) {
  const { authEnabled, resetPassword, signIn, signInWithProvider, signUp } = useCommerce();
  const [email, setEmail] = useState(account?.email || "");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const title = mode === "Forgot password" ? "Reset password" : mode;

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      if (mode === "Register") {
        await signUp({ email, password, name });
        setMessage("Check your email to verify your BubbleBud account.");
      } else if (mode === "Forgot password") {
        await resetPassword(email);
        setMessage("Password reset email sent.");
      } else {
        await signIn({ email, password });
        setMessage("Logged in.");
      }
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <form className="auth-form" onSubmit={submit}>
      <h2>{title}</h2>
      {!authEnabled ? <p className="form-error">Connect Supabase environment variables to enable real accounts.</p> : null}
      {mode === "Register" ? <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" /> : null}
      <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" />
      {mode !== "Forgot password" ? <input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" /> : null}
      <button className="primary-button" type="submit" disabled={!authEnabled}>
        {mode === "Forgot password" ? "Send reset link" : mode}
      </button>
      {mode !== "Forgot password" ? (
        <div className="auth-provider-row">
          <button className="secondary-button" type="button" disabled={!authEnabled} onClick={() => signInWithProvider("google")}>
            Continue with Google
          </button>
        </div>
      ) : null}
      {message ? <p className={message.includes("sent") || message.includes("Check") || message.includes("Logged") ? "form-note" : "form-error"}>{message}</p> : null}
      {account ? <p className="form-note">Signed in as {account.email}</p> : null}
    </form>
  );
}

function OrderHistory({ orders, onTrack }) {
  if (!orders.length) {
    return (
      <div className="empty-state inline">
        <PackageCheck size={32} />
        <h3>No orders yet.</h3>
        <p>Paid Stripe orders will appear here after checkout.</p>
      </div>
    );
  }

  return (
    <div className="order-list">
      {orders.map((order) => (
        <article key={order.id}>
          <div>
            <strong>{order.order_number}</strong>
            <span>{order.status}</span>
          </div>
          <p>{order.order_items?.map((item) => `${item.quantity}x ${item.product_title}`).join(", ")}</p>
          <button type="button" onClick={() => onTrack(order)}>Track order</button>
        </article>
      ))}
    </div>
  );
}

function AddressBook() {
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState({
    label: "Home",
    fullName: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
    phone: "",
  });
  const [message, setMessage] = useState("");

  const loadAddresses = () => {
    fetch("/api/account/addresses")
      .then((response) => (response.ok ? response.json() : { addresses: [] }))
      .then((data) => setAddresses(data.addresses || []))
      .catch(() => setAddresses([]));
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const saveAddress = (event) => {
    event.preventDefault();
    setMessage("");
    fetch("/api/account/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Address could not be saved.");
        setMessage("Address saved.");
        setForm({ label: "Home", fullName: "", line1: "", line2: "", city: "", state: "", postalCode: "", country: "US", phone: "" });
        loadAddresses();
      })
      .catch((error) => setMessage(error.message));
  };

  return (
    <div className="address-book">
      <h2>Saved addresses</h2>
      {addresses.map((address) => (
        <article key={address.id}>
          <strong>{address.label}</strong>
          <p>{address.full_name} - {address.line1}, {address.city}, {address.state} {address.postal_code}</p>
        </article>
      ))}
      <form className="auth-form" onSubmit={saveAddress}>
        <input required value={form.fullName} onChange={(event) => setForm((value) => ({ ...value, fullName: event.target.value }))} placeholder="Full name" />
        <input required value={form.line1} onChange={(event) => setForm((value) => ({ ...value, line1: event.target.value }))} placeholder="Address line 1" />
        <input value={form.line2} onChange={(event) => setForm((value) => ({ ...value, line2: event.target.value }))} placeholder="Address line 2" />
        <input required value={form.city} onChange={(event) => setForm((value) => ({ ...value, city: event.target.value }))} placeholder="City" />
        <input required value={form.state} onChange={(event) => setForm((value) => ({ ...value, state: event.target.value }))} placeholder="State" />
        <input required value={form.postalCode} onChange={(event) => setForm((value) => ({ ...value, postalCode: event.target.value }))} placeholder="ZIP code" />
        <button className="primary-button" type="submit">Save address</button>
        {message ? <p className={message.includes("saved") ? "form-note" : "form-error"}>{message}</p> : null}
      </form>
    </div>
  );
}

export function TrackOrderPage({ initialQuery = {} }) {
  return (
    <section className="track-page">
      <div className="page-hero compact">
        <p className="eyebrow">Track order</p>
        <h1>Premium order tracking, from checkout to doorstep.</h1>
      </div>
      <TrackOrderPanel initialQuery={initialQuery} />
    </section>
  );
}

function getOrderStage(order) {
  if (!order) return "pending";
  const status = String(order.status || "").toLowerCase();
  if (trackingSteps.some((step) => step.key === status)) return status;
  if (order.payment_status === "paid") return "paid";
  return "pending";
}

function formatDateTime(value, fallback = "Pending") {
  if (!value) return fallback;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDateOnly(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getEstimatedDelivery(order) {
  const created = order?.created_at ? new Date(order.created_at) : new Date();
  const days = order?.shipping_cents === 0 ? 5 : 4;
  const eta = new Date(created);
  eta.setDate(created.getDate() + days);
  return order?.status === "delivered" ? "Delivered" : formatDateOnly(eta);
}

function getCarrier(order) {
  const source = `${order?.tracking_url || ""} ${order?.tracking_number || ""}`.toLowerCase();
  if (source.includes("ups") || /^1z/i.test(order?.tracking_number || "")) return "UPS";
  if (source.includes("fedex")) return "FedEx";
  if (source.includes("dhl")) return "DHL";
  if (source.includes("usps") || /^\d{20,34}$/.test(order?.tracking_number || "")) return "USPS";
  return "BubbleBud";
}

function orderItemImage(item) {
  return item?.products?.images?.[0] || products.find((product) => product.id === item.product_id)?.image || "/images/hero-plush.jpg";
}

function formatAddress(address = {}) {
  const line1 = address.line1 || address.line_1 || "";
  const line2 = address.line2 || address.line_2 || "";
  const cityState = [address.city, address.state].filter(Boolean).join(", ");
  const cityStateZip = [cityState, address.postalCode || address.postal_code].filter(Boolean).join(" ");
  return [line1, line2, cityStateZip, address.country].filter(Boolean);
}

function buildTimeline(order) {
  const stage = getOrderStage(order);
  const currentIndex = trackingSteps.findIndex((step) => step.key === stage);
  const shippedOrDelivered = currentIndex >= trackingSteps.findIndex((step) => step.key === "shipped");
  const delivered = stage === "delivered";

  return [
    ["Order Placed", order?.created_at, "We received your BubbleBud order and reserved your items.", true],
    ["Payment Confirmed", order?.paid_at || order?.created_at, "Your payment was securely verified.", order?.payment_status === "paid"],
    ["Order Processing", currentIndex >= 2 ? order?.updated_at || order?.created_at : null, "Your order is being prepared by the BubbleBud team.", currentIndex >= 2],
    ["Package Packed", shippedOrDelivered ? order?.updated_at : null, "Items are packed and ready for carrier handoff.", shippedOrDelivered],
    ["Shipped", shippedOrDelivered ? order?.updated_at : null, "Your package is moving through the carrier network.", shippedOrDelivered],
    ["Out for Delivery", delivered ? order?.updated_at : null, "The carrier has the package out for final delivery.", delivered],
    ["Delivered", delivered ? order?.updated_at : null, "Delivered. We hope it feels as good as it looks.", delivered],
  ];
}

function downloadReceipt(order) {
  if (!order || typeof window === "undefined") return;

  const lines = [
    "BubbleBud Receipt",
    `Order: ${order.order_number}`,
    `Date: ${formatDateTime(order.created_at)}`,
    `Customer: ${order.customer_name}`,
    `Email: ${order.customer_email}`,
    "",
    ...(order.order_items || []).map((item) => `${item.quantity}x ${item.product_title} (${item.variant}) - ${moneyFromCents(item.total_cents)}`),
    "",
    `Subtotal: ${moneyFromCents(order.subtotal_cents)}`,
    `Shipping: ${moneyFromCents(order.shipping_cents)}`,
    `Tax: ${moneyFromCents(order.tax_cents)}`,
    `Total: ${moneyFromCents(order.total_cents)}`,
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${order.order_number}-receipt.txt`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function TrackOrderPanel({ compact = false, initialOrder = null, initialQuery = {} }) {
  const { account } = useCommerce();
  const [form, setForm] = useState({ orderNumber: "", email: "" });
  const [result, setResult] = useState(initialOrder);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const statusKey = getOrderStage(result);
  const currentStepIndex = Math.max(0, trackingSteps.findIndex((step) => step.key === statusKey));
  const progress = trackingSteps.length > 1 ? (currentStepIndex / (trackingSteps.length - 1)) * 100 : 0;
  const timeline = result ? buildTimeline(result) : [];

  const fetchTracking = async (nextForm, quiet = false) => {
    if (!nextForm.orderNumber || !nextForm.email) return;
    if (!quiet) {
      setLoading(true);
      setMessage("");
    }

    try {
      const response = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextForm),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Order not found.");
      setResult(data.order);
      setMessage("");
    } catch (error) {
      if (!quiet) {
        setResult(null);
        setMessage(error.message);
      }
    } finally {
      if (!quiet) setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialOrder) return;
    const nextForm = {
      orderNumber: initialOrder.order_number || "",
      email: initialOrder.customer_email || account?.email || "",
    };
    setResult(initialOrder);
    setForm(nextForm);
  }, [account?.email, initialOrder]);

  useEffect(() => {
    const orderNumber = initialQuery.orderNumber || "";
    const email = initialQuery.email || account?.email || "";
    if (!orderNumber) return;

    const nextForm = { orderNumber, email };
    setForm(nextForm);
    if (email) fetchTracking(nextForm, true);
  }, [account?.email, initialQuery.email, initialQuery.orderNumber]);

  useEffect(() => {
    if (!result || !form.orderNumber || !form.email) return undefined;
    const interval = window.setInterval(() => fetchTracking(form, true), 30000);
    return () => window.clearInterval(interval);
  }, [form, result]);

  return (
    <div className={compact ? "track-panel is-compact" : "track-panel"}>
      <form
        className="track-form"
        onSubmit={(event) => {
          event.preventDefault();
          fetchTracking(form);
        }}
      >
        <input required value={form.orderNumber} onChange={(event) => setForm((value) => ({ ...value, orderNumber: event.target.value }))} placeholder="Order number" />
        <input required type="email" value={form.email} onChange={(event) => setForm((value) => ({ ...value, email: event.target.value }))} placeholder="Email address" />
        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? "Finding order..." : "Track order"}
        </button>
      </form>
      {message ? <p className="form-error">{message}</p> : null}
      {loading && !result ? <TrackingSkeleton /> : null}
      {result ? (
        <article className={`premium-tracking-card status-${statusKey}`}>
          {statusKey === "delivered" ? <DeliveredConfetti /> : null}
          <div className="tracking-hero-card">
            <div>
              <p className="eyebrow">Order {result.order_number}</p>
              <h2>{statusKey === "delivered" ? "Delivered with care." : "Your order is moving."}</h2>
              <p>Placed {formatDateTime(result.created_at)} for {result.customer_name || "BubbleBud customer"}.</p>
            </div>
            <div className="tracking-badge-stack">
              <span className="status-pill paid"><ShieldCheck size={15} /> Payment {result.payment_status}</span>
              <span className={`status-pill ${statusKey}`}><Truck size={15} /> {statusKey}</span>
            </div>
          </div>

          <div className="progress-card">
            <div className="progress-line" aria-hidden="true">
              <span style={{ width: `${progress}%` }} />
            </div>
            <div className="progress-steps" aria-label="Order progress">
              {trackingSteps.map((step, index) => {
                const Icon = step.icon;
                const state = index < currentStepIndex ? "is-complete" : index === currentStepIndex ? "is-current" : "is-future";
                return (
                  <div className={`progress-step ${state}`} key={step.key}>
                    <div><Icon size={22} /></div>
                    <strong>{step.label}</strong>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="tracking-info-grid">
            <section className="delivery-card">
              <div className="carrier-logo">{getCarrier(result)}</div>
              <div>
                <span>Estimated delivery</span>
                <strong>{getEstimatedDelivery(result)}</strong>
                <p>{result.shipping_method || "Standard shipping"} - {result.tracking_number || "Tracking number pending"}</p>
              </div>
              <div className="confidence-meter">
                <span style={{ width: statusKey === "delivered" ? "100%" : statusKey === "shipped" ? "82%" : "64%" }} />
              </div>
              <small>{statusKey === "delivered" ? "Delivery complete" : statusKey === "shipped" ? "High delivery confidence" : "On schedule after carrier handoff"}</small>
            </section>

            <section className="shipping-info-card">
              <h3>Shipping information</h3>
              <p><strong>{result.customer_name}</strong></p>
              {formatAddress(result.shipping_address).map((line) => <p key={line}>{line}</p>)}
              <p>{result.customer_phone || "Phone not provided"}</p>
              <p>{result.customer_email}</p>
            </section>
          </div>

          <section className="shipment-timeline">
            <h3>Shipment timeline</h3>
            {timeline.map(([label, timestamp, description, complete]) => (
              <div className={complete ? "is-complete" : ""} key={label}>
                <span>{complete ? <CheckCircle2 size={16} /> : <CalendarDays size={16} />}</span>
                <div>
                  <strong>{label}</strong>
                  <small>{formatDateTime(timestamp)}</small>
                  <p>{description}</p>
                </div>
              </div>
            ))}
          </section>

          <section className="tracking-products">
            <h3>Product summary</h3>
            {(result.order_items || []).map((item) => (
              <div className="tracking-product-card" key={item.id}>
                <img src={orderItemImage(item)} alt="" />
                <div>
                  <strong>{item.product_title}</strong>
                  <span>{item.variant || "Default"} - Qty {item.quantity}</span>
                </div>
                <div>
                  <span>Subtotal</span>
                  <strong>{moneyFromCents(item.total_cents)}</strong>
                </div>
              </div>
            ))}
            <div className="tracking-order-totals">
              <div><span>Subtotal</span><strong>{moneyFromCents(result.subtotal_cents)}</strong></div>
              <div><span>Shipping</span><strong>{moneyFromCents(result.shipping_cents)}</strong></div>
              <div><span>Tax</span><strong>{moneyFromCents(result.tax_cents)}</strong></div>
              {result.discount_cents ? <div><span>Discount</span><strong>-{moneyFromCents(result.discount_cents)}</strong></div> : null}
              <div className="tracking-total-row"><span>Total paid</span><strong>{moneyFromCents(result.total_cents)}</strong></div>
            </div>
          </section>

          <div className="tracking-actions">
            <Link className="primary-button" href="/shop">Continue Shopping</Link>
            <Link className="secondary-button" href={`/contact?order=${encodeURIComponent(result.order_number)}`}><MessageCircle size={16} /> Contact Support</Link>
            <button className="secondary-button" type="button" onClick={() => downloadReceipt(result)}><Download size={16} /> Download Receipt</button>
            {result.tracking_url ? (
              <a className="secondary-button" href={result.tracking_url} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Track Carrier Shipment</a>
            ) : (
              <button className="secondary-button" type="button" disabled><ExternalLink size={16} /> Carrier Pending</button>
            )}
          </div>
        </article>
      ) : !loading ? (
        <div className="tracking-empty-state">
          <ReceiptText size={34} />
          <h3>Enter your order number and email.</h3>
          <p>Guests can track with the same email used at checkout. Logged-in customers can open tracking directly from order history.</p>
        </div>
      ) : null}
    </div>
  );
}

function TrackingSkeleton() {
  return (
    <div className="tracking-skeleton" aria-label="Loading order tracking">
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}

function DeliveredConfetti() {
  return (
    <div className="delivered-confetti" aria-hidden="true">
      {Array.from({ length: 14 }).map((_, index) => <span key={index} />)}
    </div>
  );
}

export function InfoPage({ contact = false, contactEmail = "sytnix479@gmail.com", copy, details = [], eyebrow, image, stats = [], title }) {
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState({
    email: "",
    name: "",
    order: "",
    subject: "",
    text: "",
  });

  const updateMessage = (field, value) => {
    setMessage((current) => ({ ...current, [field]: value }));
  };

  const sendEmailMessage = (event) => {
    event.preventDefault();
    const subject = encodeURIComponent(message.subject || "BubbleBud customer message");
    const body = encodeURIComponent(
      [
        `Name: ${message.name}`,
        `Customer email: ${message.email}`,
        message.order ? `Order number: ${message.order}` : "",
        "",
        message.text,
      ]
        .filter(Boolean)
        .join("\n")
    );

    fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: message.name,
        email: message.email,
        orderNumber: message.order,
        subject: message.subject || "BubbleBud customer message",
        message: message.text,
      }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Message could not be sent.");
        setSent(true);
      })
      .catch(() => {
        window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
        setSent(true);
      });
  };

  return (
    <section className="info-page">
      <div className="info-copy">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{copy}</p>
        <TrustStrip />
      </div>
      <img src={image} alt="" />
      {stats.length ? (
        <div className="info-stats">
          {stats.map(([value, label]) => (
            <article key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </article>
          ))}
        </div>
      ) : null}
      {details.length ? (
        <div className="info-detail-grid">
          {details.map(([heading, body]) => (
            <article key={heading}>
              <h2>{heading}</h2>
              <p>{body}</p>
            </article>
          ))}
        </div>
      ) : null}
      {contact ? (
        <form
          className="contact-form"
          onSubmit={sendEmailMessage}
        >
          <div className="contact-direct-card">
            <Mail size={20} />
            <div>
              <strong>Direct email support</strong>
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
            </div>
          </div>
          <input required value={message.name} onChange={(event) => updateMessage("name", event.target.value)} placeholder="Name" />
          <input required type="email" value={message.email} onChange={(event) => updateMessage("email", event.target.value)} placeholder="Your email" />
          <input value={message.order} onChange={(event) => updateMessage("order", event.target.value)} placeholder="Order number (optional)" />
          <input required value={message.subject} onChange={(event) => updateMessage("subject", event.target.value)} placeholder="Subject" />
          <textarea required value={message.text} onChange={(event) => updateMessage("text", event.target.value)} placeholder="Write your message" />
          <button className="primary-button" type="submit">
            Send message
          </button>
          {sent ? <p className="form-note">Message sent. If email delivery is not configured yet, your email app will open as backup.</p> : null}
        </form>
      ) : null}
    </section>
  );
}

export function ProductGrid({ products: list }) {
  if (!list.length) {
    return (
      <div className="empty-state inline">
        <Search size={32} />
        <h3>No products found.</h3>
        <p>Try another search or filter combination.</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {list.map((product) => (
        <ProductCard product={product} key={product.id} />
      ))}
    </div>
  );
}

function ProductCard({ product }) {
  const { addToCart, isWishlisted, setQuickViewProduct, toggleWishlist } = useCommerce();

  return (
    <motion.article className="product-card" whileHover={{ y: -6 }} transition={{ duration: 0.2 }}>
      <div className="product-media">
        <Link href={product.url}>
          <img className="primary-image" src={product.image} alt={product.title} loading="lazy" />
          <img className="hover-image" src={product.hoverImage} alt="" loading="lazy" />
        </Link>
        <span className="product-badge">{product.badge}</span>
        <button className={`wishlist-button ${isWishlisted(product.id) ? "is-active" : ""}`} type="button" onClick={() => toggleWishlist(product.id)} aria-label="Toggle wishlist">
          <Heart size={18} />
        </button>
        <button className="quick-view-button" type="button" onClick={() => setQuickViewProduct(product)}>
          Quick view
        </button>
      </div>
      <div className="product-card-body">
        <Link href={product.url}>
          <h3>{product.title}</h3>
        </Link>
        <div className="rating-line compact">
          <Stars rating={product.rating} />
          <span>{product.rating.toFixed(1)}</span>
        </div>
        <div className="product-card-bottom">
          <div className="price-row">
            <strong>{formatMoney(product.price)}</strong>
            {product.compareAt ? <span>{formatMoney(product.compareAt)}</span> : null}
          </div>
          <button type="button" onClick={() => addToCart(product)}>
            Add
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function ProductRail({ title, copy, products: list }) {
  return (
    <section className="section-wrap tight">
      <SectionHeading eyebrow="Curated for you" title={title} copy={copy} />
      <ProductGrid products={list} />
    </section>
  );
}

function SectionHeading({ copy, eyebrow, title }) {
  return (
    <div className="section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p>{copy}</p>
    </div>
  );
}

function Stars({ rating }) {
  const rounded = Math.round(rating);
  return (
    <span className="stars" aria-label={`${Number(rating).toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((index) => (
        <Star className={index <= rounded ? "is-filled" : ""} size={16} key={index} />
      ))}
    </span>
  );
}

function StarPicker({ onChange, value }) {
  return (
    <div className="star-picker" role="radiogroup" aria-label="Review rating">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button className={rating <= value ? "is-active" : ""} type="button" role="radio" aria-checked={rating === value} key={rating} onClick={() => onChange(rating)}>
          <Star size={24} />
        </button>
      ))}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="product-grid">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div className="skeleton-card" key={item}>
          <span />
          <b />
          <b />
        </div>
      ))}
    </div>
  );
}
