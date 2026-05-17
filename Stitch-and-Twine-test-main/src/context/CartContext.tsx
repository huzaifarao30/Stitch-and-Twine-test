"use client";
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { CartItem, Product } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/utils/supabase/client";

const GUEST_CART_KEY = "st_guest_cart";

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, selectedVariants?: Record<string, string>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function loadGuestCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

function saveGuestCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch {
    // localStorage full or unavailable
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { user } = useAuth();
  const prevUserId = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (user?.id) {
      // User logged in — load from Supabase
      const supabase = createClient();
      if (!supabase) {
        setItems([]);
        return;
      }

      const loadCart = async () => {
        // If just logged in (was guest), merge guest cart
        const guestItems = loadGuestCart();

        const { data, error } = await supabase
          .from("cart_items")
          .select("id, product_id, quantity, selected_variants, products(name,price,images,slug,stock)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error || !data) {
          setItems(guestItems);
          return;
        }

        const mapped = data
          .map((row: any): CartItem | null => {
            const product = Array.isArray(row.products) ? row.products[0] : row.products;
            if (!product) return null;

            return {
              id: String(row.id),
              productId: String(row.product_id),
              name: product.name,
              price: Number(product.price || 0),
              image: Array.isArray(product.images) ? (product.images[0] || "") : "",
              quantity: Number(row.quantity || 1),
              selectedVariants: row.selected_variants || {},
              slug: product.slug || "",
              stock: Number(product.stock || 0),
            };
          })
          .filter((i): i is CartItem => i !== null);

        // Merge guest items into supabase cart (if transitioning from guest to logged in)
        if (guestItems.length > 0 && prevUserId.current === undefined) {
          for (const guestItem of guestItems) {
            const existsInDb = mapped.find((m) => m.productId === guestItem.productId);
            if (!existsInDb) {
              // Add guest item to supabase
              await supabase.from("cart_items").upsert(
                {
                  user_id: user.id,
                  product_id: guestItem.productId,
                  quantity: guestItem.quantity,
                  selected_variants: guestItem.selectedVariants || {},
                },
                { onConflict: "user_id,product_id" }
              );
              mapped.push(guestItem);
            }
          }
          // Clear guest cart after merge
          localStorage.removeItem(GUEST_CART_KEY);
        }

        setItems(mapped);
      };

      void loadCart();
      prevUserId.current = user.id;
    } else {
      // Guest — load from localStorage
      const guestItems = loadGuestCart();
      setItems(guestItems);
      prevUserId.current = undefined;
    }
  }, [user?.id]);

  // Save guest cart to localStorage whenever items change (only for guests)
  useEffect(() => {
    if (!user?.id && items.length >= 0) {
      saveGuestCart(items);
    }
  }, [items, user?.id]);

  const addItem = useCallback((
    product: Product,
    quantity = 1,
    selectedVariants: Record<string, string> = {}
  ) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);

      // REQ-9: Stock limit check
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (product.stock > 0 && newQty > product.stock) {
          return prev; // Silently reject
        }
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: newQty } : i
        );
      }

      if (product.stock > 0 && quantity > product.stock) {
        return prev;
      }

      return [
        ...prev,
        {
          id: `${product.id}`,
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.images[0],
          quantity,
          selectedVariants,
          slug: product.slug,
          stock: product.stock,
        },
      ];
    });

    if (!user?.id) return;

    const supabase = createClient();
    if (!supabase) return;

    void (async () => {
      const { data: existing } = await supabase
        .from("cart_items")
        .select("quantity")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .maybeSingle();

      const nextQty = Number(existing?.quantity || 0) + quantity;

      await supabase
        .from("cart_items")
        .upsert(
          {
            user_id: user.id,
            product_id: product.id,
            quantity: nextQty,
            selected_variants: selectedVariants,
          },
          { onConflict: "user_id,product_id" }
        );
    })();
  }, [user?.id]);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));

    if (!user?.id) return;

    const supabase = createClient();
    if (!supabase) return;

    const target = items.find((i) => i.id === id);
    if (!target) return;
    void supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", target.productId);
  }, [items, user?.id]);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      if (!user?.id) return;

      const supabase = createClient();
      const target = items.find((i) => i.id === id);
      if (supabase && target) {
        void supabase
          .from("cart_items")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", target.productId);
      }
    } else {
      // REQ-9: Stock limit check
      setItems((prev) =>
        prev.map((i) => {
          if (i.id !== id) return i;
          const maxQty = i.stock && i.stock > 0 ? Math.min(quantity, i.stock) : quantity;
          return { ...i, quantity: maxQty };
        })
      );

      if (!user?.id) return;

      const supabase = createClient();
      const target = items.find((i) => i.id === id);
      if (supabase && target) {
        const maxQty = target.stock && target.stock > 0 ? Math.min(quantity, target.stock) : quantity;
        void supabase
          .from("cart_items")
          .update({ quantity: maxQty })
          .eq("user_id", user.id)
          .eq("product_id", target.productId);
      }
    }
  }, [items, user?.id]);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(GUEST_CART_KEY);

    if (!user?.id) return;

    const supabase = createClient();
    if (!supabase) return;
    void supabase.from("cart_items").delete().eq("user_id", user.id);
  }, [user?.id]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
