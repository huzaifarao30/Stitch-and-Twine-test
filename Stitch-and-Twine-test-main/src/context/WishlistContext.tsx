"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { WishlistItem, Product } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { wishlistService } from "@/services/wishlistService";

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
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) {
      setItems([]);
      return;
    }

    void wishlistService.getWishlistItems(user.id).then(setItems);
  }, [user?.id]);

  const addItem = useCallback((product: Product) => {
    if (!user?.id) return;

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

    void wishlistService.addWishlistItem(user.id, product.id).then((ok) => {
      if (!ok) {
        void wishlistService.getWishlistItems(user.id).then(setItems);
      }
    });
  }, [user?.id]);

  const removeItem = useCallback((productId: string) => {
    if (!user?.id) return;

    setItems((prev) => prev.filter((i) => i.productId !== productId));

    void wishlistService.removeWishlistItem(user.id, productId).then((ok) => {
      if (!ok) {
        void wishlistService.getWishlistItems(user.id).then(setItems);
      }
    });
  }, [user?.id]);

  const toggleItem = useCallback((product: Product) => {
    if (!user?.id) return;

    setItems((prev) => {
      if (prev.some((i) => i.productId === product.id)) {
        void wishlistService.removeWishlistItem(user.id, product.id);
        return prev.filter((i) => i.productId !== product.id);
      }
      void wishlistService.addWishlistItem(user.id, product.id);
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
  }, [user?.id]);

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
