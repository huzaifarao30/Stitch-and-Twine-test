"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { WishlistItem, Product } from "@/types";

interface WishlistContextType {
  items: WishlistItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;
  totalItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("sat_wishlist");
    if (stored) setItems(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("sat_wishlist", JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      if (prev.some((i) => i.productId === product.id)) return prev;
      return [
        ...prev,
        {
          id: `wish-${product.id}`,
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.images[0],
          slug: product.slug,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const toggleItem = useCallback((product: Product) => {
    setItems((prev) => {
      if (prev.some((i) => i.productId === product.id)) {
        return prev.filter((i) => i.productId !== product.id);
      }
      return [
        ...prev,
        {
          id: `wish-${product.id}`,
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.images[0],
          slug: product.slug,
        },
      ];
    });
  }, []);

  const isWishlisted = useCallback(
    (productId: string) => items.some((i) => i.productId === productId),
    [items]
  );

  return (
    <WishlistContext.Provider
      value={{ items, addItem, removeItem, toggleItem, isWishlisted, totalItems: items.length }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
