"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Package, Clock, TrendingUp, CheckCircle, Truck, XCircle } from "lucide-react";
import { formatPrice, getSafeImageSrc } from "@/lib/utils";
import Image from "next/image";

interface TrackedOrder {
  orderNumber: string;
  items: { name: string; price: number; quantity: number; image: string }[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: string;
  createdAt: string;
  confirmedAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  isCustom: boolean;
}

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || "";
  const [orderId, setOrderId] = useState(initialId);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleTrack = async () => {
    if (!orderId.trim()) return;
    setLoading(true);
    setError("");
    setOrder(null);
    setSearched(true);

    try {
      const res = await fetch(`/api/orders/track?id=${encodeURIComponent(orderId.trim())}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Order not found");
        return;
      }
      const data = await res.json();
      setOrder(data);
    } catch {
      setError("Failed to fetch order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      handleTrack();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const steps = [
    { key: "pending", label: "Pending", icon: Clock, color: "text-yellow-500", bg: "bg-yellow-50" },
    { key: "confirmed", label: "Confirmed", icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-50" },
    { key: "shipped", label: "Shipped", icon: Truck, color: "text-purple-500", bg: "bg-purple-50" },
    { key: "delivered", label: "Delivered", icon: CheckCircle, color: "text-green-500", bg: "bg-green-50" },
  ];

  const getStepIndex = (status: string) => {
    if (status === "cancelled") return -1;
    return steps.findIndex((s) => s.key === status);
  };

  return (
    <div className="bg-boutique min-h-screen pt-6 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
            style={{ background: "linear-gradient(135deg, #E8A0B0, #C4A484)" }}>
            <Package size={28} className="text-white" />
          </div>
          <h1 className="font-playfair text-3xl text-[var(--text-primary)] mb-2">Track Your Order</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Enter your order number to see the latest status
          </p>
        </div>

        {/* Search */}
        <div className="flex gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTrack()}
              placeholder="Enter order number (e.g. ST-123456)"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-color)] text-sm bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)]"
            />
          </div>
          <button
            onClick={handleTrack}
            disabled={loading || !orderId.trim()}
            className="btn-primary px-6 disabled:opacity-50"
          >
            {loading ? "..." : "Track"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-center"
          >
            <XCircle size={20} className="mx-auto mb-2 text-red-400" />
            <p className="text-sm text-red-600">{error}</p>
          </motion.div>
        )}

        {/* Order Result */}
        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Status Card */}
            <div className="bg-[var(--surface)] rounded-2xl shadow-boutique p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-[var(--accent-gold)] mb-1">Order</p>
                  <p className="font-semibold text-[var(--text-primary)] text-lg">{order.orderNumber}</p>
                </div>
                {order.status === "cancelled" ? (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-red-200 bg-red-50 text-red-600 text-xs font-medium">
                    <XCircle size={13} /> Cancelled
                  </span>
                ) : (
                  <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${
                    steps[getStepIndex(order.status)]?.bg || "bg-gray-50"
                  } ${steps[getStepIndex(order.status)]?.color || "text-gray-500"}`}>
                    {(() => {
                      const StepIcon = steps[getStepIndex(order.status)]?.icon || Clock;
                      return <StepIcon size={13} />;
                    })()}
                    {steps[getStepIndex(order.status)]?.label || order.status}
                  </span>
                )}
              </div>

              {/* Timeline Stepper */}
              {order.status !== "cancelled" && (
                <div>
                  <div className="flex items-center justify-between">
                    {steps.map((step, idx) => {
                      const currentIdx = getStepIndex(order.status);
                      const isActive = idx <= currentIdx;
                      return (
                        <div key={step.key} className="flex items-center" style={{ flex: idx < steps.length - 1 ? 1 : "none" }}>
                          <div className={`w-4 h-4 rounded-full flex-shrink-0 transition-all ${isActive ? "bg-pink-500" : "bg-gray-200"}`} />
                          {idx < steps.length - 1 && (
                            <div className={`h-0.5 flex-1 mx-1 transition-all ${idx < currentIdx ? "bg-pink-500" : "bg-gray-200"}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-2">
                    {steps.map((step) => (
                      <span key={step.key} className="text-[10px] text-[var(--text-secondary)]">{step.label}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="mt-4 pt-4 border-t border-[var(--border-color)] grid grid-cols-2 gap-3 text-xs text-[var(--text-secondary)]">
                <div>
                  <span className="block text-[var(--text-primary)] font-medium">Placed</span>
                  {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </div>
                {order.confirmedAt && (
                  <div>
                    <span className="block text-[var(--text-primary)] font-medium">Confirmed</span>
                    {new Date(order.confirmedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </div>
                )}
                {order.shippedAt && (
                  <div>
                    <span className="block text-[var(--text-primary)] font-medium">Shipped</span>
                    {new Date(order.shippedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </div>
                )}
                {order.deliveredAt && (
                  <div>
                    <span className="block text-[var(--text-primary)] font-medium">Delivered</span>
                    {new Date(order.deliveredAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </div>
                )}
              </div>
            </div>

            {/* Items */}
            {order.items.length > 0 && (
              <div className="bg-[var(--surface)] rounded-2xl shadow-boutique p-6">
                <p className="text-xs uppercase tracking-widest text-[var(--accent-gold)] mb-3">Order Items</p>
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-[var(--background)] flex-shrink-0">
                        <Image
                          src={getSafeImageSrc(item.image)}
                          alt={item.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{item.name}</p>
                        <p className="text-xs text-[var(--text-secondary)]">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="space-y-1.5 text-xs border-t border-[var(--border-color)] pt-3 mt-4">
                  <div className="flex justify-between text-[var(--text-secondary)]"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
                  {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(order.discount)}</span></div>}
                  <div className="flex justify-between text-[var(--text-secondary)]"><span>Delivery</span><span>{formatPrice(order.deliveryFee)}</span></div>
                  <div className="flex justify-between font-semibold text-[var(--text-primary)] text-sm pt-1 border-t border-[var(--border-color)]">
                    <span>Total</span><span>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            )}

            {order.isCustom && order.items.length === 0 && (
              <div className="bg-[var(--surface)] rounded-2xl shadow-boutique p-6 text-center">
                <p className="text-sm text-[var(--text-secondary)]">This is a custom order. Details are being processed.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Empty State */}
        {searched && !order && !error && !loading && (
          <div className="text-center py-16">
            <Package size={48} className="mx-auto mb-4 text-[var(--accent-gold)] opacity-30" />
            <p className="text-[var(--text-secondary)] text-sm">No order found with that number</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="bg-boutique min-h-screen pt-6 pb-16 flex items-center justify-center"><div className="crochet-spinner" /></div>}>
      <OrderTrackingContent />
    </Suspense>
  );
}
