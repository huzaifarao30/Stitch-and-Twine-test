"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useCart } from "@/context/CartContext";
import { useSales } from "@/context/SalesContext"; // --- SALES MODULE ---
import { formatPrice, getSafeImageSrc, calculateDiscountedPrice } from "@/lib/utils";
import { Settings } from "@/types";
import { settingsService } from "@/services/settingsService";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, subtotal } = useCart();
  const { activeSales } = useSales(); // --- SALES MODULE ---
  const [settings, setSettings] = useState<Settings>({
    siteName: "Stitch and Twine",
    whatsappNumber: "923190691621",
    deliveryFee: 250,
    freeDeliveryThreshold: 0,
    email: "hello@stitchandtwine.com",
    address: "Rawalpindi, Pakistan",
    instagram: "",
    facebook: "",
  });

  useEffect(() => {
    void settingsService.getSettings().then(setSettings);
  }, []);

  // --- SALES MODULE --- recalculate subtotal with sale prices
  const saleSubtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      // We don't have categorySlug on CartItem, so we use the base price
      // Sale pricing for cart is handled at the cart page level with full product data
      return sum + item.price * item.quantity;
    }, 0);
  }, [items]);

  const deliveryFee = settings.deliveryFee;
  const total = subtotal + deliveryFee;

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="cart-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #F2C4CE, #E8A0B0)" }}>
                  <ShoppingBag size={14} className="text-white" />
                </div>
                <h2 className="font-playfair text-xl font-medium text-[var(--text-primary)]">Your Cart</h2>
                <span className="text-xs text-[var(--text-secondary)] bg-[var(--background)] px-2 py-0.5 rounded-full">
                  {items.length} items
                </span>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-[var(--background)] flex items-center justify-center hover:bg-[var(--soft-beige)] transition-colors">
                <X size={16} className="text-[var(--text-secondary)]" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-5 py-16">
                  <div className="w-20 h-20 rounded-full bg-[var(--background)] flex items-center justify-center">
                    <ShoppingBag size={32} className="text-[var(--accent-gold)] opacity-50" />
                  </div>
                  <div className="text-center">
                    <p className="font-playfair text-lg text-[var(--text-primary)] mb-2">Your cart is empty</p>
                    <p className="text-sm text-[var(--text-secondary)]">Add some handmade treasures to get started</p>
                  </div>
                  <Link href="/shop" onClick={onClose} className="btn-primary text-sm">
                    Explore Shop
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-4 p-3 rounded-xl bg-[var(--background)]"
                  >
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={getSafeImageSrc(item.image)} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">{item.name}</p>
                      {item.selectedVariants && Object.entries(item.selectedVariants).map(([k, v]) => (
                        <p key={k} className="text-xs text-[var(--text-secondary)]">{k}: {v}</p>
                      ))}
                      <p className="text-sm font-semibold text-[var(--accent-gold)] mt-1">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1 bg-[var(--surface)] rounded-lg border border-[var(--border-color)]">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm w-6 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={!!item.stock && item.stock > 0 && item.quantity >= item.stock}
                            className={`w-7 h-7 flex items-center justify-center transition-colors ${!!item.stock && item.stock > 0 && item.quantity >= item.stock ? 'text-gray-300 cursor-not-allowed' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-7 h-7 flex items-center justify-center text-[var(--pink-medium)] hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      {!!item.stock && item.stock > 0 && item.quantity >= item.stock && (
                        <p className="text-[10px] text-yellow-600 mt-1">⚠️ Max stock reached</p>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-[var(--border-color)] px-6 py-5 space-y-4">
                {/* Summary */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>Delivery</span>
                    <span>{formatPrice(deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-[var(--text-primary)] text-base pt-2 border-t border-[var(--border-color)]">
                    <span>Total</span><span>{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Link
                    href="/cart"
                    onClick={onClose}
                    className="btn-secondary text-sm text-center"
                  >
                    View Cart
                  </Link>
                  <Link
                    href="/cart"
                    onClick={onClose}
                    className="btn-pink text-sm text-center"
                  >
                    Checkout
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
