"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { getDefaultVariant } from "@/lib/products";

const CART_KEY = "bubblebud-next-cart";
const WISHLIST_KEY = "bubblebud-next-wishlist";
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
  const [supabase] = useState(() => createBrowserSupabase());
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [recent, setRecent] = useState([]);
  const [theme, setTheme] = useState("light");
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    setCart(readStorage(CART_KEY, []));
    setWishlist(readStorage(WISHLIST_KEY, []));
    setRecent(readStorage(RECENT_KEY, []));
    setTheme(readStorage(THEME_KEY, "light"));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      return undefined;
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user || null);
      setAuthReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

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
    writeStorage(RECENT_KEY, recent);
  }, [recent, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    writeStorage(THEME_KEY, theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme, hydrated]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/wishlist")
      .then((response) => (response.ok ? response.json() : { productIds: [] }))
      .then((data) => setWishlist(data.productIds || []))
      .catch(() => {});
  }, [user]);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0), [cart]);

  const addToCart = (product, quantity = 1, variant = getDefaultVariant(product)) => {
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

  const toggleWishlist = async (productId) => {
    const isActive = wishlist.includes(productId);
    setWishlist((items) => (isActive ? items.filter((id) => id !== productId) : [productId, ...items]));

    if (!user) return;

    await fetch("/api/wishlist", {
      method: isActive ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
  };

  const isWishlisted = (productId) => wishlist.includes(productId);

  const addRecentlyViewed = (productId) => {
    setRecent((items) => [productId, ...items.filter((id) => id !== productId)].slice(0, 8));
  };

  const signIn = async ({ email, password }) => {
    if (!supabase) throw new Error("Supabase is not configured.");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async ({ email, password, name }) => {
    if (!supabase) throw new Error("Supabase is not configured.");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  };

  const signInWithProvider = async (provider) => {
    if (!supabase) throw new Error("Supabase is not configured.");
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  };

  const resetPassword = async (email) => {
    if (!supabase) throw new Error("Supabase is not configured.");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/account`,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  };

  const startCheckout = async ({ provider = "stripe", checkoutMode = "guest", customer, shippingAddress, billingAddress, discountCode, saveAddress = false } = {}) => {
    setCheckoutError("");
    setCheckoutLoading(true);
    try {
      const checkoutCustomer = customer
        ? {
            ...customer,
            email: checkoutMode === "account" ? user?.email || customer.email : customer.email,
          }
        : undefined;

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          checkoutMode,
          ...(checkoutCustomer ? { customer: checkoutCustomer } : {}),
          shippingAddress,
          billingAddress,
          discountCode,
          saveAddress,
          items: cart.map((item) => ({
            productId: item.product.id,
            variant: item.variant,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Checkout could not start.");
      window.location.href = data.url;
    } catch (error) {
      setCheckoutError(error.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const value = {
    account: user
      ? {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0],
        }
      : null,
    addRecentlyViewed,
    addToCart,
    authEnabled: Boolean(supabase),
    authReady,
    cart,
    cartCount,
    cartOpen,
    checkoutError,
    checkoutLoading,
    clearCart,
    hydrated,
    isWishlisted,
    quickViewProduct,
    recent,
    removeFromCart,
    resetPassword,
    searchOpen,
    setCartOpen,
    setQuickViewProduct,
    setSearchOpen,
    setTheme,
    signIn,
    signInWithProvider,
    signOut,
    signUp,
    startCheckout,
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
