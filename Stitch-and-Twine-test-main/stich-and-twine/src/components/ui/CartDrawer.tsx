"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { couponService } from "@/services/couponService";
import { formatPrice } from "@/lib/utils";
import { Coupon } from "@/types";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, subtotal } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const deliveryFee = subtotal >= 2000 ? 0 : 200;
  const total = subtotal + deliveryFee - discount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    const result = await couponService.applyCoupon(couponCode, subtotal);
    if (result.valid && result.coupon && result.discount !== undefined) {
      setAppliedCoupon(result.coupon);
      setDiscount(result.discount);
    } else {
      setAppliedCoupon(null);
      setDiscount(0);
    }
    setCouponMsg(result.message || "");
    setCouponLoading(false);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponCode("");
    setCouponMsg("");
  };

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
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#EDE6DA]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #F2C4CE, #E8A0B0)" }}>
                  <ShoppingBag size={14} className="text-white" />
                </div>
                <h2 className="font-playfair text-xl font-medium text-[#2E2E2E]">Your Cart</h2>
                <span className="text-xs text-[#6B6B6B] bg-[#F6F2EA] px-2 py-0.5 rounded-full">
                  {items.length} items
                </span>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F6F2EA] flex items-center justify-center hover:bg-[#EDE6DA] transition-colors">
                <X size={16} className="text-[#6B6B6B]" />
              </button>
            </div>

            {/* Free delivery bar */}
            {subtotal < 2000 && items.length > 0 && (
              <div className="px-6 py-3 bg-[#FAE8ED] border-b border-[#F2C4CE]">
                <p className="text-xs text-[#E8A0B0] font-medium">
                  Add {formatPrice(2000 - subtotal)} more for free delivery 🎀
                </p>
                <div className="mt-1.5 h-1 rounded-full bg-white overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((subtotal / 2000) * 100, 100)}%`,
                      background: "linear-gradient(90deg, #F2C4CE, #E8A0B0)",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-5 py-16">
                  <div className="w-20 h-20 rounded-full bg-[#F6F2EA] flex items-center justify-center">
                    <ShoppingBag size={32} className="text-[#C4A484] opacity-50" />
                  </div>
                  <div className="text-center">
                    <p className="font-playfair text-lg text-[#2E2E2E] mb-2">Your cart is empty</p>
                    <p className="text-sm text-[#6B6B6B]">Add some handmade treasures to get started</p>
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
                    className="flex gap-4 p-3 rounded-xl bg-[#F6F2EA]"
                  >
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#2E2E2E] truncate">{item.name}</p>
                      {item.selectedVariants && Object.entries(item.selectedVariants).map(([k, v]) => (
                        <p key={k} className="text-xs text-[#6B6B6B]">{k}: {v}</p>
                      ))}
                      <p className="text-sm font-semibold text-[#C4A484] mt-1">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1 bg-white rounded-lg border border-[#EDE6DA]">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-[#6B6B6B] hover:text-[#2E2E2E] transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm w-6 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-[#6B6B6B] hover:text-[#2E2E2E] transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-7 h-7 flex items-center justify-center text-[#E8A0B0] hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-[#EDE6DA] px-6 py-5 space-y-4">
                {/* Coupon */}
                <div>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between px-3 py-2 bg-green-50 rounded-lg border border-green-100">
                      <div className="flex items-center gap-2">
                        <Tag size={14} className="text-green-500" />
                        <span className="text-sm text-green-600 font-medium">{appliedCoupon.code}</span>
                        <span className="text-xs text-green-500">applied!</span>
                      </div>
                      <button onClick={handleRemoveCoupon} className="text-xs text-red-400 hover:text-red-500">Remove</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                        placeholder="Coupon code"
                        className="input-boutique flex-1 text-xs py-2.5"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading}
                        className="px-4 py-2.5 rounded-xl text-xs font-medium bg-[#EDE6DA] text-[#2E2E2E] hover:bg-[#E5DCD0] transition-colors disabled:opacity-50"
                      >
                        {couponLoading ? "..." : "Apply"}
                      </button>
                    </div>
                  )}
                  {couponMsg && (
                    <p className={`text-xs mt-1.5 ${appliedCoupon ? "text-green-600" : "text-red-400"}`}>
                      {couponMsg}
                    </p>
                  )}
                </div>

                {/* Summary */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-[#6B6B6B]">
                    <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span><span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#6B6B6B]">
                    <span>Delivery</span>
                    <span>{deliveryFee === 0 ? "Free 🎉" : formatPrice(deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-[#2E2E2E] text-base pt-2 border-t border-[#EDE6DA]">
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
