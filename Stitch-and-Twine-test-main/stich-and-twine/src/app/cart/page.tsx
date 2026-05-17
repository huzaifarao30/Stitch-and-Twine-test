"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag, MessageCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useOrder } from "@/context/OrderContext";
import { formatPrice } from "@/lib/utils";
import { couponService } from "@/services/couponService";
import { orderService } from "@/services/orderService";
import { settingsService } from "@/services/settingsService";
import { Coupon, CheckoutFormData } from "@/types";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCart();
  const { setLastOrder } = useOrder();
  const router = useRouter();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [form, setForm] = useState<CheckoutFormData>({
    fullName: "", phone: "", email: "", city: "", address: "",
  });

  const settings = settingsService.getSettings();
  const deliveryFee = subtotal >= settings.freeDeliveryThreshold ? 0 : settings.deliveryFee;
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

  const handleOrder = async () => {
    if (!form.fullName || !form.phone || !form.city || !form.address) return;
    setOrderLoading(true);
    const order = await orderService.createOrder({
      customerData: form,
      items,
      subtotal,
      deliveryFee,
      discount,
      couponCode: appliedCoupon?.code,
    });
    setLastOrder(order);
    const waLink = orderService.generateWhatsAppMessage(order, settings.whatsappNumber.replace(/[^0-9]/g, ""));
    clearCart();
    window.open(waLink, "_blank");
    router.push("/order-success");
    setOrderLoading(false);
  };

  if (items.length === 0) {
    return (
      <div className="bg-boutique min-h-screen pt-20 flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-24 h-24 rounded-full bg-white shadow-boutique flex items-center justify-center">
          <ShoppingBag size={36} className="text-[#C4A484] opacity-50" />
        </div>
        <div className="text-center">
          <h2 className="font-playfair text-2xl text-[#2E2E2E] mb-2">Your cart is empty</h2>
          <p className="text-[#6B6B6B] text-sm">Discover our handcrafted crochet creations</p>
        </div>
        <Link href="/shop" className="btn-primary">
          Start Shopping <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-boutique min-h-screen pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-playfair text-3xl text-[#2E2E2E] mb-8">
          {checkoutMode ? "Checkout" : "Shopping Cart"}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items / Checkout Form */}
          <div className="lg:col-span-2 space-y-4">
            {!checkoutMode ? (
              <>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-white rounded-2xl p-4 shadow-boutique flex gap-4"
                  >
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <Link href={`/product/${item.slug}`} className="text-sm font-medium text-[#2E2E2E] hover:text-[#C4A484] transition-colors">
                        {item.name}
                      </Link>
                      {item.selectedVariants && Object.entries(item.selectedVariants).map(([k, v]) => (
                        <p key={k} className="text-xs text-[#9B8B7A]">{k}: {v}</p>
                      ))}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-0 bg-[#F6F2EA] rounded-lg overflow-hidden">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-[#EDE6DA] transition-colors">
                            <Minus size={12} className="text-[#6B6B6B]" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-[#EDE6DA] transition-colors">
                            <Plus size={12} className="text-[#6B6B6B]" />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-[#2E2E2E]">{formatPrice(item.price * item.quantity)}</span>
                          <button onClick={() => removeItem(item.id)}
                            className="text-[#E8A0B0] hover:text-red-400 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </>
            ) : (
              <div className="bg-white rounded-2xl p-6 shadow-boutique">
                <h3 className="font-playfair text-xl text-[#2E2E2E] mb-5">Your Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: "fullName", label: "Full Name", placeholder: "Enter your full name" },
                    { key: "phone", label: "Phone Number", placeholder: "+92 300 1234567" },
                    { key: "email", label: "Email", placeholder: "you@example.com" },
                    { key: "city", label: "City", placeholder: "Karachi" },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="text-xs font-medium text-[#2E2E2E] mb-1 block">{field.label} <span className="text-[#E8A0B0]">*</span></label>
                      <input
                        value={form[field.key as keyof CheckoutFormData]}
                        onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        className="input-boutique text-sm"
                      />
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-[#2E2E2E] mb-1 block">Delivery Address <span className="text-[#E8A0B0]">*</span></label>
                    <textarea
                      value={form.address}
                      onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                      placeholder="House/Flat No., Street, Area"
                      rows={3}
                      className="input-boutique text-sm resize-none"
                    />
                  </div>
                </div>

                {/* Order Summary in Checkout */}
                <div className="mt-6 space-y-2 text-sm border-t border-[#EDE6DA] pt-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-[#6B6B6B]">
                      <span>{item.name} × {item.quantity}</span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-4">
            {/* Coupon */}
            <div className="bg-white rounded-2xl p-5 shadow-boutique">
              <h3 className="font-medium text-[#2E2E2E] mb-3 flex items-center gap-2">
                <Tag size={15} className="text-[#C4A484]" /> Coupon Code
              </h3>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <span className="text-sm text-green-600 font-medium">{appliedCoupon.code}</span>
                  <button onClick={() => { setAppliedCoupon(null); setDiscount(0); setCouponMsg(""); }}
                    className="text-xs text-red-400">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter code" className="input-boutique flex-1 text-sm py-2" />
                  <button onClick={handleApplyCoupon} disabled={couponLoading}
                    className="px-3 py-2 bg-[#EDE6DA] text-[#2E2E2E] rounded-xl text-sm hover:bg-[#E5DCD0] transition-colors disabled:opacity-50">
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </div>
              )}
              {couponMsg && <p className={`text-xs mt-1.5 ${appliedCoupon ? "text-green-600" : "text-red-400"}`}>{couponMsg}</p>}
            </div>

            {/* Totals */}
            <div className="bg-white rounded-2xl p-5 shadow-boutique">
              <h3 className="font-medium text-[#2E2E2E] mb-4">Order Summary</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-[#6B6B6B]">
                  <span>Subtotal ({items.length} items)</span><span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span><span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#6B6B6B]">
                  <span>Delivery</span>
                  <span>{deliveryFee === 0 ? "🎉 Free" : formatPrice(deliveryFee)}</span>
                </div>
                <div className="flex justify-between font-semibold text-[#2E2E2E] text-base pt-2 border-t border-[#EDE6DA]">
                  <span>Total</span><span>{formatPrice(total)}</span>
                </div>
              </div>

              {!checkoutMode ? (
                <button onClick={() => setCheckoutMode(true)}
                  className="btn-pink w-full mt-4 justify-center">
                  Proceed to Checkout <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleOrder}
                  disabled={orderLoading || !form.fullName || !form.phone || !form.city || !form.address}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-medium text-sm transition-all disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #25D366, #1ebe5d)" }}
                >
                  <MessageCircle size={18} />
                  {orderLoading ? "Placing Order..." : "Order via WhatsApp"}
                </button>
              )}

              {checkoutMode && (
                <button onClick={() => setCheckoutMode(false)} className="w-full mt-2 text-sm text-[#6B6B6B] hover:text-[#2E2E2E] py-2">
                  ← Back to Cart
                </button>
              )}
            </div>

            {/* Trust signals */}
            <div className="bg-[#FAE8ED] rounded-2xl p-4 text-center">
              <p className="text-xs text-[#E8A0B0] font-medium">🧶 All items are handmade with love</p>
              <p className="text-xs text-[#E8A0B0] mt-1">100% satisfaction guaranteed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
