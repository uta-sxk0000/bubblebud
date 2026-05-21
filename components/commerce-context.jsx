"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CART_KEY = "bubblebud-next-cart";
const WISHLIST_KEY = "bubblebud-next-wishlist";
const REVIEWS_KEY = "bubblebud-next-reviews";
const RECENT_KEY = "bubblebud-next-recent";
const THEME_KEY = "bubblebud-next-theme";

const CommerceContext = createContext(null);

const readStorage = (key, fallback) => {
  if (typeof window === "undefined") return fallback;
  try {
    return JSON.parse(window.localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    window.localStorage.removeItem(key);
    return fallback;
  }
};

const writeStorage = (key, value) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
};

export function CommerceProvider({ children }) {
  const [hydrated, setHydrated] = useState(false);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [reviews, setReviews] = useState({});
  const [recent, setRecent] = useState([]);
  const [theme, setTheme] = useState("light");
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    setCart(readStorage(CART_KEY, []));
    setWishlist(readStorage(WISHLIST_KEY, []));
    setReviews(readStorage(REVIEWS_KEY, {}));
    setRecent(readStorage(RECENT_KEY, []));
    setTheme(readStorage(THEME_KEY, "light"));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeStorage(CART_KEY, cart);
  }, [cart, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    writeStorage(WISHLIST_KEY, wishlist);
  }, [wishlist, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    writeStorage(REVIEWS_KEY, reviews);
  }, [reviews, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    writeStorage(RECENT_KEY, recent);
  }, [recent, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    writeStorage(THEME_KEY, theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme, hydrated]);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0), [cart]);

  const addToCart = (product, quantity = 1, variant = product.variants?.[0] || "Default") => {
    setCart((items) => {
      const key = `${product.id}:${variant}`;
      const current = items.find((item) => item.key === key);
      if (current) {
        return items.map((item) => (item.key === key ? { ...item, quantity: item.quantity + quantity } : item));
      }
      return [{ key, product, quantity, variant }, ...items];
    });
    setCartOpen(true);
  };

  const updateCartQuantity = (key, quantity) => {
    setCart((items) =>
      items
        .map((item) => (item.key === key ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (key) => {
    setCart((items) => items.filter((item) => item.key !== key));
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (productId) => {
    setWishlist((items) => (items.includes(productId) ? items.filter((id) => id !== productId) : [productId, ...items]));
  };

  const isWishlisted = (productId) => wishlist.includes(productId);

  const addRecentlyViewed = (productId) => {
    setRecent((items) => [productId, ...items.filter((id) => id !== productId)].slice(0, 8));
  };

  const getReviews = (product) => [
    ...(reviews[product.id] || []).map((review) => ({ ...review, canEdit: true, verified: true })),
    ...(product.reviews || []).map((review) => ({ ...review, canEdit: false })),
  ];

  const saveReview = (productId, review) => {
    const payload = {
      id: review.id || `review-${Date.now()}`,
      name: review.name?.trim() || "BubbleBud customer",
      title: review.title?.trim() || "",
      body: review.body?.trim() || "",
      rating: Math.max(1, Math.min(5, Number(review.rating || 5))),
      date: new Date().toISOString().slice(0, 10),
      verified: true,
    };

    setReviews((allReviews) => {
      const list = allReviews[productId] || [];
      const exists = list.some((item) => item.id === payload.id);
      return {
        ...allReviews,
        [productId]: exists ? list.map((item) => (item.id === payload.id ? payload : item)) : [payload, ...list],
      };
    });
  };

  const deleteReview = (productId, reviewId) => {
    setReviews((allReviews) => ({
      ...allReviews,
      [productId]: (allReviews[productId] || []).filter((review) => review.id !== reviewId),
    }));
  };

  const value = {
    account,
    addRecentlyViewed,
    addToCart,
    cart,
    cartCount,
    cartOpen,
    clearCart,
    deleteReview,
    getReviews,
    hydrated,
    isWishlisted,
    quickViewProduct,
    recent,
    removeFromCart,
    saveReview,
    searchOpen,
    setAccount,
    setCartOpen,
    setQuickViewProduct,
    setSearchOpen,
    setTheme,
    subtotal,
    theme,
    toggleWishlist,
    updateCartQuantity,
    wishlist,
  };

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
}

export function useCommerce() {
  const context = useContext(CommerceContext);
  if (!context) {
    throw new Error("useCommerce must be used inside CommerceProvider");
  }
  return context;
}
