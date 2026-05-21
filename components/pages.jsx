"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Heart,
  Mail,
  PackageCheck,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import { categories, formatMoney, getRelatedProducts, getReviewSummary, products, testimonials } from "@/lib/products";
import { useCommerce } from "@/components/commerce-context";
import { TrustStrip } from "@/components/site-frame";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

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

export function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedCategories />
      <BestSellers />
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

function BestSellers() {
  const [filter, setFilter] = useState("All");
  const options = ["All", "Beauty", "Accessories", "Lifestyle", "Tech", "Plushies"];
  const shown = products
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
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setActive((value) => (value + 1) % testimonials.length), 4200);
    return () => window.clearInterval(timer);
  }, []);

  const testimonial = testimonials[active];

  return (
    <section className="section-wrap reviews-showcase">
      <SectionHeading eyebrow="Trust, built in" title="Customer reviews" copy="Verified buyer feedback with a calm premium presentation." />
      <div className="testimonial-shell">
        <AnimatePresence mode="wait">
          <motion.article
            key={testimonial.name}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.35 }}
            className="testimonial-card"
          >
            <img src={testimonial.image} alt="" />
            <div>
              <Stars rating={5} />
              <p>{testimonial.text}</p>
              <strong>{testimonial.name}</strong>
              <span>
                <BadgeCheck size={16} /> {testimonial.role}
              </span>
            </div>
          </motion.article>
        </AnimatePresence>
        <div className="testimonial-dots">
          {testimonials.map((item, index) => (
            <button
              className={index === active ? "is-active" : ""}
              type="button"
              aria-label={`Show review from ${item.name}`}
              key={item.name}
              onClick={() => setActive(index)}
            />
          ))}
        </div>
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
        {images.map((image) => (
          <a className="social-tile" href="https://www.instagram.com/" key={image} aria-label="Open BubbleBud social media">
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

  return (
    <section className="newsletter-section">
      <div>
        <p className="eyebrow">Join the BubbleBud Community</p>
        <h2>Soft launches, smarter picks, and private offers.</h2>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setDone(true);
        }}
      >
        <Mail size={20} />
        <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" />
        <button type="submit">Subscribe</button>
      </form>
      {done ? <p className="form-note">You are on the list.</p> : null}
    </section>
  );
}

export function ShopPage() {
  const { hydrated, wishlist } = useCommerce();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const [maxPrice, setMaxPrice] = useState(60);
  const [visible, setVisible] = useState(6);
  const [filterOpen, setFilterOpen] = useState(false);
  const [wishlistOnly, setWishlistOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialCategory = params.get("category");
    const initialSort = params.get("sort");
    const initialTag = params.get("tag");
    if (initialCategory) setCategory(initialCategory);
    if (initialSort === "rating") setSort("rating");
    if (initialSort === "new" || initialTag === "new") setSort("newest");
    if (params.get("wishlist")) setWishlistOnly(true);
    const timer = window.setTimeout(() => setLoading(false), 400);
    return () => window.clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    const searched = products.filter((product) => {
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
  }, [category, maxPrice, query, sort, wishlist, wishlistOnly]);

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
          {loading || !hydrated ? <SkeletonGrid /> : <ProductGrid products={filtered.slice(0, visible)} />}
          {!loading && visible < filtered.length ? (
            <button className="load-more-button" type="button" onClick={() => setVisible((value) => value + 4)}>
              Load more products
            </button>
          ) : null}
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
    <div className="filter-panel">
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
  const [image, setImage] = useState(product.image);
  const [quantity, setQuantity] = useState(1);
  const [variant, setVariant] = useState(product.variants[0]);
  const [tab, setTab] = useState("Description");

  useEffect(() => {
    addRecentlyViewed(product.id);
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

          <div className="option-group">
            <span>Variant</span>
            <div>
              {product.variants.map((item) => (
                <button className={variant === item ? "is-active" : ""} type="button" key={item} onClick={() => setVariant(item)}>
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="option-group">
            <span>Color</span>
            <div>
              {product.colors.map((item) => (
                <button type="button" key={item}>
                  {item}
                </button>
              ))}
            </div>
          </div>

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
            <button className="primary-button" type="button" onClick={() => addToCart(product, quantity, variant)}>
              Add to cart
            </button>
          </div>
          <button className="buy-now-button" type="button" onClick={() => addToCart(product, quantity, variant)}>
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
        <button type="button" onClick={() => addToCart(product, quantity, variant)}>
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
        `Available option: ${product.variants.join(", ")}`,
        `Color/finish: ${product.colors.join(", ")}`,
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
  const { deleteReview, getReviews, saveReview } = useCommerce();
  const [form, setForm] = useState({ id: "", name: "", title: "", body: "", rating: 5 });
  const reviews = getReviews(product);
  const summary = getReviewSummary(product, reviews.filter((review) => review.canEdit));

  const submitReview = (event) => {
    event.preventDefault();
    saveReview(product.id, form);
    setForm({ id: "", name: "", title: "", body: "", rating: 5 });
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
        <h3>{form.id ? "Edit your review" : "Give a star review"}</h3>
        <StarPicker value={form.rating} onChange={(rating) => setForm((value) => ({ ...value, rating }))} />
        <input value={form.name} onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))} placeholder="Name (optional)" />
        <input value={form.title} onChange={(event) => setForm((value) => ({ ...value, title: event.target.value }))} placeholder="Title (optional)" />
        <textarea value={form.body} onChange={(event) => setForm((value) => ({ ...value, body: event.target.value }))} placeholder="Review text (optional)" />
        <div className="review-form-actions">
          <button className="primary-button" type="submit">
            {form.id ? "Update review" : "Submit review"}
          </button>
          {form.id ? (
            <button className="secondary-button" type="button" onClick={() => setForm({ id: "", name: "", title: "", body: "", rating: 5 })}>
              Cancel edit
            </button>
          ) : null}
        </div>
      </form>
      <div className="review-list">
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
              {review.canEdit ? (
                <div className="review-actions">
                  <button type="button" onClick={() => setForm(review)}>
                    Edit
                  </button>
                  <button type="button" onClick={() => deleteReview(product.id, review.id)}>
                    Delete
                  </button>
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function AccountPage() {
  const { account, setAccount, wishlist } = useCommerce();
  const [tab, setTab] = useState("Login");
  const wishlistProducts = products.filter((product) => wishlist.includes(product.id));
  const accountTabs = account ? ["Order history", "Track order", "Wishlist", "Addresses"] : ["Login", "Register", "Forgot password"];

  useEffect(() => {
    if (account && ["Login", "Register", "Forgot password"].includes(tab)) {
      setTab("Order history");
    }
  }, [account, tab]);

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
            <AuthForm mode={tab} account={account} setAccount={setAccount} />
          ) : null}
          {tab === "Order history" ? <OrderHistory onTrack={() => setTab("Track order")} /> : null}
          {tab === "Track order" ? <TrackOrderPanel compact /> : null}
          {tab === "Wishlist" ? <ProductGrid products={wishlistProducts.length ? wishlistProducts : products.slice(0, 3)} /> : null}
          {tab === "Addresses" ? <AddressBook /> : null}
        </div>
      </div>
    </section>
  );
}

function AuthForm({ mode, account, setAccount }) {
  const [email, setEmail] = useState(account?.email || "");
  const title = mode === "Forgot password" ? "Reset password" : mode;

  return (
    <form
      className="auth-form"
      onSubmit={(event) => {
        event.preventDefault();
        setAccount({ email, name: email.split("@")[0] || "BubbleBud customer" });
      }}
    >
      <h2>{title}</h2>
      {mode === "Register" ? <input required placeholder="Full name" /> : null}
      <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" />
      {mode !== "Forgot password" ? <input required type="password" placeholder="Password" /> : null}
      <button className="primary-button" type="submit">
        {mode === "Forgot password" ? "Send reset link" : mode}
      </button>
      {account ? <p className="form-note">Signed in as {account.email}</p> : null}
    </form>
  );
}

function OrderHistory({ onTrack }) {
  return (
    <div className="order-list">
      {["BB-1042", "BB-1038"].map((order, index) => (
        <article key={order}>
          <div>
            <strong>{order}</strong>
            <span>{index ? "Delivered" : "In transit"}</span>
          </div>
          <p>{index ? "Portable Makeup Bag" : "Crochet Rose Flower Bouquet"}</p>
          <button type="button" onClick={onTrack}>Track order</button>
        </article>
      ))}
    </div>
  );
}

function AddressBook() {
  return (
    <div className="address-book">
      <h2>Saved addresses</h2>
      <article>
        <strong>Home</strong>
        <p>123 BubbleBud Lane, Austin, TX</p>
      </article>
      <button className="secondary-button" type="button">
        Add address
      </button>
    </div>
  );
}

export function TrackOrderPage() {
  return (
    <section className="track-page">
      <div className="page-hero compact">
        <p className="eyebrow">Track order</p>
        <h1>Clear updates from purchase to delivery.</h1>
      </div>
      <TrackOrderPanel />
    </section>
  );
}

function TrackOrderPanel({ compact = false }) {
  const [result, setResult] = useState(false);

  return (
    <div className={compact ? "track-panel is-compact" : "track-panel"}>
      <form
        className="track-form"
        onSubmit={(event) => {
          event.preventDefault();
          setResult(true);
        }}
      >
        <input required placeholder="Order number" />
        <input required type="email" placeholder="Email address" />
        <button className="primary-button" type="submit">
          Track order
        </button>
      </form>
      {result ? (
        <div className="tracking-card">
          {["Order confirmed", "Packed with care", "In transit", "Out for delivery"].map((step, index) => (
            <div className={index < 3 ? "is-done" : ""} key={step}>
              <span />
              <strong>{step}</strong>
              <small>{index < 3 ? "Complete" : "Estimated tomorrow"}</small>
            </div>
          ))}
        </div>
      ) : null}
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

    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
    setSent(true);
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
            Open email message
          </button>
          {sent ? <p className="form-note">Your email app should open with this message ready to send.</p> : null}
        </form>
      ) : null}
    </section>
  );
}

function ProductGrid({ products: list }) {
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
