"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  Heart,
  Menu,
  Moon,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Sun,
  UserRound,
  X,
} from "lucide-react";
import { categories, formatMoney, products } from "@/lib/products";
import { useCommerce } from "@/components/commerce-context";

const navItems = [
  ["Home", "/"],
  ["Shop", "/shop"],
  ["Categories", "/shop?category=All#categories"],
  ["Best Sellers", "/shop?sort=rating"],
  ["New Arrivals", "/shop?tag=new"],
  ["About", "/about"],
  ["Contact", "/contact"],
];

export function SiteFrame({ children }) {
  const {
    cartCount,
    cartOpen,
    quickViewProduct,
    searchOpen,
    setCartOpen,
    setQuickViewProduct,
    setSearchOpen,
  } = useCommerce();

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main>{children}</main>
      <Footer />
      <MobileCartButton count={cartCount} onClick={() => setCartOpen(true)} />
      <ChatButton />
      <AnimatePresence>{searchOpen ? <SearchDialog onClose={() => setSearchOpen(false)} /> : null}</AnimatePresence>
      <AnimatePresence>{cartOpen ? <CartDrawer onClose={() => setCartOpen(false)} /> : null}</AnimatePresence>
      <AnimatePresence>
        {quickViewProduct ? <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} /> : null}
      </AnimatePresence>
    </>
  );
}

function AnnouncementBar() {
  return (
    <div className="announcement-bar" aria-label="Store announcement">
      <div className="announcement-track">
        <span>Free Shipping on Orders Over $50</span>
        <span>Secure Checkout With Stripe</span>
        <span>Easy Returns Within 30 Days</span>
      </div>
    </div>
  );
}

function Header() {
  const pathname = usePathname();
  const [solid] = useStateFromScroll();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cartCount, setCartOpen, setSearchOpen, theme, setTheme, wishlist } = useCommerce();

  return (
    <header className={`site-header ${solid ? "is-solid" : ""}`}>
      <Link className="brand-lockup" href="/" aria-label="BubbleBud home">
        <span className="brand-mark">B</span>
        <span>BubbleBud</span>
      </Link>

      <nav className="desktop-nav" aria-label="Primary navigation">
        {navItems.map(([label, href]) => (
          <Link className={pathname === href ? "is-active" : ""} href={href} key={label}>
            {label}
          </Link>
        ))}
      </nav>

      <div className="header-actions">
        <button className="icon-action" type="button" onClick={() => setSearchOpen(true)} aria-label="Open search">
          <Search size={19} />
        </button>
        <Link className="icon-action" href="/shop?wishlist=true" aria-label="Wishlist">
          <Heart size={19} />
          {wishlist.length ? <span>{wishlist.length}</span> : null}
        </Link>
        <Link className="icon-action" href="/account" aria-label="Account">
          <UserRound size={19} />
        </Link>
        <button
          className="icon-action"
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle color mode"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="icon-action" type="button" onClick={() => setCartOpen(true)} aria-label="Open cart">
          <ShoppingBag size={19} />
          <span>{cartCount}</span>
        </button>
        <button className="menu-button" type="button" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <Menu size={23} />
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen ? <MobileMenu onClose={() => setMobileOpen(false)} /> : null}
      </AnimatePresence>
    </header>
  );
}

function MobileMenu({ onClose }) {
  return (
    <motion.div className="mobile-menu-panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        className="mobile-menu-card"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
      >
        <div className="mobile-menu-top">
          <span>BubbleBud</span>
          <button className="icon-action" type="button" onClick={onClose} aria-label="Close menu">
            <X size={22} />
          </button>
        </div>
        <nav aria-label="Mobile navigation">
          {navItems.map(([label, href]) => (
            <Link href={href} key={label} onClick={onClose}>
              {label}
              <ArrowRight size={18} />
            </Link>
          ))}
        </nav>
      </motion.div>
    </motion.div>
  );
}

function SearchDialog({ onClose }) {
  const [query, setQuery] = useState("");
  const results = products
    .filter((product) => {
      const search = `${product.title} ${product.category} ${product.tags.join(" ")}`.toLowerCase();
      return search.includes(query.toLowerCase());
    })
    .slice(0, 6);

  return (
    <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.aside className="search-dialog" initial={{ y: -24 }} animate={{ y: 0 }} exit={{ y: -24 }}>
        <div className="dialog-top">
          <h2>Search BubbleBud</h2>
          <button className="icon-action" type="button" onClick={onClose} aria-label="Close search">
            <X size={21} />
          </button>
        </div>
        <label className="search-field">
          <Search size={19} />
          <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products, gifts, beauty..." />
        </label>
        <div className="search-results">
          {results.map((product) => (
            <Link href={product.url} className="search-result" key={product.id} onClick={onClose}>
              <img src={product.image} alt="" />
              <span>
                <strong>{product.title}</strong>
                <small>{product.category} - {formatMoney(product.price)}</small>
              </span>
            </Link>
          ))}
        </div>
      </motion.aside>
    </motion.div>
  );
}

function CartDrawer({ onClose }) {
  const {
    cart,
    clearCart,
    removeFromCart,
    subtotal,
    updateCartQuantity,
  } = useCommerce();
  const [discount, setDiscount] = useState("");
  const shipping = subtotal > 50 || subtotal === 0 ? 0 : 5.95;
  const total = Math.max(0, subtotal + shipping);

  return (
    <motion.div className="drawer-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.aside className="cart-drawer" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}>
        <div className="drawer-top">
          <div>
            <p className="eyebrow">Secure checkout</p>
            <h2>Your cart</h2>
          </div>
          <button className="icon-action" type="button" onClick={onClose} aria-label="Close cart">
            <X size={22} />
          </button>
        </div>

        {cart.length ? (
          <div className="cart-lines">
            {cart.map((item) => (
              <div className="cart-line" key={item.key}>
                <img src={item.product.image} alt="" />
                <div>
                  <strong>{item.product.title}</strong>
                  <small>{item.variant}</small>
                  <div className="quantity-stepper">
                    <button type="button" onClick={() => updateCartQuantity(item.key, item.quantity - 1)} aria-label="Decrease quantity">
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => updateCartQuantity(item.key, item.quantity + 1)} aria-label="Increase quantity">
                      +
                    </button>
                  </div>
                </div>
                <div className="cart-line-side">
                  <span>{formatMoney(item.product.price * item.quantity)}</span>
                  <button type="button" onClick={() => removeFromCart(item.key)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <ShoppingBag size={36} />
            <h3>Your cart is calm and empty.</h3>
            <p>Find something small, useful, and beautiful to add.</p>
            <Link href="/shop" className="primary-button" onClick={onClose}>
              Shop now
            </Link>
          </div>
        )}

        <div className="cart-summary">
          <label className="discount-field">
            <span>Discount code</span>
            <input value={discount} onChange={(event) => setDiscount(event.target.value)} placeholder="Enter on checkout page" />
          </label>
          <div className="shipping-estimator">
            <PackageCheck size={18} />
            <span>{shipping ? `${formatMoney(50 - subtotal)} away from free shipping` : "Free shipping unlocked"}</span>
          </div>
          <dl>
            <div>
              <dt>Subtotal</dt>
              <dd>{formatMoney(subtotal)}</dd>
            </div>
            <div>
              <dt>Discounts</dt>
              <dd>Stripe validated</dd>
            </div>
            <div>
              <dt>Shipping</dt>
              <dd>{shipping ? formatMoney(shipping) : "Free"}</dd>
            </div>
            <div>
              <dt>Tax</dt>
              <dd>Stripe Tax at checkout</dd>
            </div>
            <div className="total-row">
              <dt>Estimated total</dt>
              <dd>{formatMoney(total)}</dd>
            </div>
          </dl>
          <Link className={`primary-button ${!cart.length ? "is-disabled" : ""}`} href="/cart" onClick={onClose}>
            Checkout securely
          </Link>
          <Link className="secondary-link" href="/cart" onClick={onClose}>
            View full cart
          </Link>
          {cart.length ? (
            <button className="text-button" type="button" onClick={clearCart}>
              Clear cart
            </button>
          ) : null}
        </div>
      </motion.aside>
    </motion.div>
  );
}

function QuickView({ product, onClose }) {
  const { addToCart } = useCommerce();

  return (
    <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.aside className="quick-view" initial={{ scale: 0.96, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 24 }}>
        <button className="icon-action quick-close" type="button" onClick={onClose} aria-label="Close quick view">
          <X size={21} />
        </button>
        <img src={product.image} alt="" />
        <div>
          <p className="eyebrow">{product.badge}</p>
          <h2>{product.title}</h2>
          <p>{product.description}</p>
          <div className="price-row">
            <strong>{formatMoney(product.price)}</strong>
            {product.compareAt ? <span>{formatMoney(product.compareAt)}</span> : null}
          </div>
          <button className="primary-button" type="button" onClick={() => addToCart(product)}>
            Add to cart
          </button>
          <Link href={product.url} className="secondary-link" onClick={onClose}>
            View full product
          </Link>
        </div>
      </motion.aside>
    </motion.div>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <Link className="brand-lockup" href="/">
            <span className="brand-mark">B</span>
            <span>BubbleBud</span>
          </Link>
          <p>Premium everyday essentials, giftable finds, and clean shopping experiences for modern customers.</p>
          <div className="social-row">
            <a href="https://www.instagram.com/_bubblebud/" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://www.tiktok.com/@_bubblebud_" target="_blank" rel="noreferrer">TikTok</a>
            <span>Pinterest</span>
          </div>
        </div>
        <FooterColumn title="Shop" links={categories.map((category) => [category.name, `/shop?category=${category.name}`])} />
        <FooterColumn title="Company" links={[["About", "/about"], ["Contact", "/contact"], ["Account", "/account"], ["FAQ", "/faq"]]} />
        <FooterColumn title="Policies" links={[["Shipping", "/shipping-policy"], ["Returns", "/return-refund-policy"], ["Privacy", "/privacy-policy"], ["Terms", "/terms-of-service"]]} />
        <div>
          <h3>Contact</h3>
          <p>sytnix479@gmail.com</p>
          <p>Mon-Fri, 9am-6pm CT</p>
          <div className="payment-row">
            <CreditCard size={18} />
            <span>Visa</span>
            <span>PayPal</span>
            <span>Amex</span>
          </div>
        </div>
      </div>
      <div className="footer-bottom">© 2026 BubbleBud. All rights reserved.</div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h3>{title}</h3>
      {links.map(([label, href]) => (
        <Link href={href} key={label}>
          {label}
        </Link>
      ))}
    </div>
  );
}

function ChatButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="chat-widget">
      <AnimatePresence>
        {open ? (
          <motion.div className="chat-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}>
            <strong>BubbleBud Support</strong>
            <p>Hi. Send your order or product question and we will help fast.</p>
            <input placeholder="Type a message..." />
          </motion.div>
        ) : null}
      </AnimatePresence>
      <button type="button" onClick={() => setOpen((value) => !value)} aria-label="Open chat support">
        <Sparkles size={20} />
      </button>
    </div>
  );
}

function MobileCartButton({ count, onClick }) {
  return (
    <button className="mobile-cart-button" type="button" onClick={onClick} aria-label="Open cart">
      <ShoppingBag size={19} />
      <span>{count}</span>
    </button>
  );
}

function useStateFromScroll() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return [solid, setSolid];
}

export function TrustStrip() {
  return (
    <div className="trust-strip">
      <span>
        <ShieldCheck size={18} /> Secure payments
      </span>
      <span>
        <PackageCheck size={18} /> Fast shipping
      </span>
      <span>
        <BadgeCheck size={18} /> Verified quality
      </span>
    </div>
  );
}
