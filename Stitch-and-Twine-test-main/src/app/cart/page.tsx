"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag, MessageCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useOrder } from "@/context/OrderContext";
import { useSales } from "@/context/SalesContext"; // --- SALES MODULE ---
import { formatPrice, getSafeImageSrc } from "@/lib/utils";
import { couponService } from "@/services/couponService";
import { orderService } from "@/services/orderService";
import { settingsService } from "@/services/settingsService";
import { Coupon, CheckoutFormData, Settings } from "@/types";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { showToast } from "@/lib/toastBus";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCart();
  const { setLastOrder } = useOrder();
  const router = useRouter();
  const { adminUser } = useAuth();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [error, setError] = useState("");
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
  const [form, setForm] = useState<CheckoutFormData>({
    fullName: "", phone: "", email: "", city: "", address: "",
  });

  useEffect(() => {
    void settingsService.getSettings().then(setSettings);
  }, []);

  useEffect(() => {
    const revalidateCoupon = async () => {
      if (!appliedCoupon?.code) return;
      const result = await couponService.applyCoupon(appliedCoupon.code, subtotal);
      if (result.valid && result.coupon && result.discount !== undefined) {
        setDiscount(result.discount);
        setCouponMsg(result.message || "");
      } else {
        setAppliedCoupon(null);
        setDiscount(0);
        setCouponMsg("");
      }
    };

    void revalidateCoupon();
  }, [subtotal, appliedCoupon?.code]);

  const deliveryFee = settings.deliveryFee;
  const total = subtotal + deliveryFee - discount;

  const checkoutSteps = ["Cart", "Details", "WhatsApp order"];
  const currentStep = checkoutMode ? 2 : 1;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    const result = await couponService.applyCoupon(couponCode, subtotal);
    if (result.valid && result.coupon && result.discount !== undefined) {
      setAppliedCoupon(result.coupon);
      setDiscount(result.discount);
      showToast("Coupon applied", "success");
    } else {
      setAppliedCoupon(null);
      setDiscount(0);
      showToast("Coupon is invalid", "error");
    }
    setCouponMsg(result.message || "");
    setCouponLoading(false);
  };

  const handleOrder = async () => {
    if (adminUser) {
      setError("Admin accounts cannot place customer orders.");
      return;
    }

    if (!form.fullName || !form.phone || !form.city || !form.address) return;
    setOrderLoading(true);
    setError("");

    try {
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
      showToast("Order placed successfully", "success");

      // Redirect to checkout terms page instead of directly to WhatsApp
      const termsUrl = `/cart/checkout-terms?orderNumber=${encodeURIComponent(order.orderNumber)}&total=${order.total}&whatsappUrl=${encodeURIComponent(waLink)}`;
      router.push(termsUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to place order.");
    } finally {
      setOrderLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-boutique min-h-screen pt-6 flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-24 h-24 rounded-full bg-[var(--surface)] shadow-boutique flex items-center justify-center">
          <ShoppingBag size={36} className="text-[var(--accent-gold)] opacity-50" />
        </div>
        <div className="text-center">
          <h2 className="font-playfair text-2xl text-[var(--text-primary)] mb-2">Your cart is empty</h2>
          <p className="text-[var(--text-secondary)] text-sm">Discover our handcrafted crochet creations</p>
        </div>
        <Link href="/shop" className="btn-primary">
          Start Shopping <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-boutique min-h-screen pt-6 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-playfair text-3xl text-[var(--text-primary)] mb-8">
          {checkoutMode ? "Checkout" : "Shopping Cart"}
        </h1>

        <div className="mb-6 rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] px-4 py-3 shadow-boutique">
          <div className="flex items-center justify-between gap-2">
            {checkoutSteps.map((step, idx) => {
              const stepNo = idx + 1;
              const active = stepNo <= currentStep;
              return (
                <div key={step} className="flex items-center gap-2 min-w-0">
                  <div className={`w-6 h-6 rounded-full text-[11px] font-semibold flex items-center justify-center ${active ? "bg-[#C4A484] text-white" : "bg-[#F1ECE3] text-[var(--text-secondary)]"}`}>
                    {stepNo}
                  </div>
                  <span className={`text-xs sm:text-sm ${active ? "text-[var(--text-primary)] font-medium" : "text-[var(--text-secondary)]"}`}>{step}</span>
                  {idx < checkoutSteps.length - 1 && <span className="text-[#CFC3B3] mx-1">→</span>}
                </div>
              );
            })}
          </div>
        </div>

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
                    className="bg-[var(--surface)] rounded-2xl p-4 shadow-boutique flex gap-4"
                  >
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      <Image src={getSafeImageSrc(item.image)} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <Link href={`/product/${item.slug}`} className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-gold)] transition-colors">
                        {item.name}
                      </Link>
                      {item.selectedVariants && Object.entries(item.selectedVariants).map(([k, v]) => (
                        <p key={k} className="text-xs text-[var(--text-secondary)]">{k}: {v}</p>
                      ))}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-0 bg-[var(--background)] rounded-lg overflow-hidden">
                          <button
                            onClick={() => {
                              updateQuantity(item.id, item.quantity - 1);
                              if (item.quantity <= 1) showToast("Item removed from cart", "info");
                            }}
                            className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-[var(--soft-beige)] transition-colors"
                          >
                            <Minus size={12} className="text-[var(--text-secondary)]" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => {
                              updateQuantity(item.id, item.quantity + 1);
                              showToast("Quantity updated", "info");
                            }}
                            className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-[var(--soft-beige)] transition-colors"
                          >
                            <Plus size={12} className="text-[var(--text-secondary)]" />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-[var(--text-primary)]">{formatPrice(item.price * item.quantity)}</span>
                          <button
                            onClick={() => {
                              removeItem(item.id);
                              showToast("Item removed from cart", "info");
                            }}
                            className="w-10 h-10 sm:w-auto sm:h-auto flex items-center justify-center text-[var(--pink-medium)] hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </>
            ) : (
              <div className="bg-[var(--surface)] rounded-2xl p-6 shadow-boutique">
                <h3 className="font-playfair text-xl text-[var(--text-primary)] mb-5">Your Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: "fullName", label: "Full Name", placeholder: "Enter your full name" },
                    { key: "phone", label: "Phone Number", placeholder: "+92 300 1234567" },
                    { key: "email", label: "Email", placeholder: "you@example.com" },
                    { key: "city", label: "City", placeholder: "Karachi" },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="text-xs font-medium text-[var(--text-primary)] mb-1 block">{field.label} <span className="text-[var(--pink-medium)]">*</span></label>
                      <input
                        value={form[field.key as keyof CheckoutFormData]}
                        onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        className="input-boutique text-sm"
                      />
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-[var(--text-primary)] mb-1 block">Delivery Address <span className="text-[var(--pink-medium)]">*</span></label>
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
                <div className="mt-6 space-y-2 text-sm border-t border-[var(--border-color)] pt-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-[var(--text-secondary)]">
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
            {adminUser && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-600">
                Admin account cannot place customer orders. Please use a customer account for checkout.
              </div>
            )}

            {/* Coupon */}
            <div className="bg-[var(--surface)] rounded-2xl p-5 shadow-boutique">
              <h3 className="font-medium text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <Tag size={15} className="text-[var(--accent-gold)]" /> Coupon Code
              </h3>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <span className="text-sm text-green-600 font-medium">{appliedCoupon.code}</span>
                  <button onClick={() => { setAppliedCoupon(null); setDiscount(0); setCouponMsg(""); setCouponCode(""); }}
                    className="text-xs text-red-400">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter code" className="input-boutique flex-1 text-sm py-2" />
                  <button onClick={handleApplyCoupon} disabled={couponLoading}
                    className="px-4 py-3 sm:px-3 sm:py-2 bg-[var(--soft-beige)] text-[var(--text-primary)] rounded-xl text-sm hover:bg-[#E5DCD0] transition-colors disabled:opacity-50">
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </div>
              )}
              {couponMsg && <p className={`text-xs mt-1.5 ${appliedCoupon ? "text-green-600" : "text-red-400"}`}>{couponMsg}</p>}
            </div>

            {/* Totals */}
            <div className="bg-[var(--surface)] rounded-2xl p-5 shadow-boutique">
              <h3 className="font-medium text-[var(--text-primary)] mb-4">Order Summary</h3>
              {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Subtotal ({items.length} items)</span><span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span><span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Delivery</span>
                  <span>{formatPrice(deliveryFee)}</span>
                </div>
                <div className="flex justify-between font-semibold text-[var(--text-primary)] text-base pt-2 border-t border-[var(--border-color)]">
                  <span>Total</span><span>{formatPrice(total)}</span>
                </div>
              </div>

              {!checkoutMode ? (
                <button
                  onClick={() => setCheckoutMode(true)}
                  disabled={Boolean(adminUser)}
                  className="btn-pink w-full mt-4 justify-center min-h-[48px]">
                  Proceed to Checkout <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleOrder}
                  disabled={Boolean(adminUser) || orderLoading || !form.fullName || !form.phone || !form.city || !form.address}
                  className="w-full mt-4 min-h-[52px] flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-medium text-sm transition-all disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #25D366, #1ebe5d)" }}
                >
                  <MessageCircle size={18} />
                  {orderLoading ? "Placing Order..." : "Order via WhatsApp"}
                </button>
              )}

              {checkoutMode && (
                <button onClick={() => setCheckoutMode(false)} className="w-full mt-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] py-2">
                  ← Back to Cart
                </button>
              )}
            </div>

            {/* Trust signals */}
            <div className="bg-[var(--pink-light)] rounded-2xl p-4">
              <p className="text-xs text-[var(--text-primary)] font-medium">Why customers trust ordering here</p>
              <div className="mt-2 space-y-1.5">
                <p className="text-xs text-[var(--text-secondary)]">• Handmade quality checked before dispatch</p>
                <p className="text-xs text-[var(--text-secondary)]">• Fast response on WhatsApp, usually within minutes</p>
                <p className="text-xs text-[var(--text-secondary)]">• Clear total shown before you confirm payment</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
