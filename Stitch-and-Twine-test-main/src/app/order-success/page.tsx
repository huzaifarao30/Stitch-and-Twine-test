"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight, Home } from "lucide-react";
import { useOrder } from "@/context/OrderContext";
import { formatPrice } from "@/lib/utils";

export default function OrderSuccessPage() {
  const { lastOrder } = useOrder();

  return (
    <div className="bg-boutique min-h-screen pt-6 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 10, stiffness: 200 }}
          className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #F2C4CE, #E8A0B0)" }}
        >
          <CheckCircle size={44} className="text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="font-playfair text-4xl text-[var(--text-primary)] mb-3">
            Order Placed! 🎀
          </h1>
          <p className="text-[var(--text-secondary)] text-base leading-relaxed mb-6">
            Thank you for your order! Your WhatsApp chat with us has been opened. Please send the message to confirm your order.
          </p>

          {lastOrder && (
            <div className="bg-[var(--surface)] rounded-2xl shadow-boutique p-6 mb-6 text-left">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Package size={16} className="text-[var(--accent-gold)]" />
                  <span className="text-sm font-medium text-[var(--text-primary)]">Order #{lastOrder.orderNumber}</span>
                </div>
                <span className="px-2 py-1 rounded-full text-xs bg-[var(--pink-light)] text-[var(--pink-medium)]">Pending</span>
              </div>
              <div className="space-y-2 border-t border-[var(--border-color)] pt-4">
                {lastOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">{item.name} × {item.quantity}</span>
                    <span className="text-[var(--text-primary)]">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-semibold text-[var(--text-primary)] pt-2 border-t border-[var(--border-color)]">
                  <span>Total</span>
                  <span>{formatPrice(lastOrder.total)}</span>
                </div>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-4">
                Delivery to: {lastOrder.city}, {lastOrder.shippingAddress}
              </p>
            </div>
          )}

          <div className="bg-[var(--background)] rounded-2xl p-5 mb-8 text-left">
            <h3 className="font-medium text-[var(--text-primary)] mb-3">What happens next?</h3>
            <ol className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li className="flex gap-3"><span className="w-5 h-5 rounded-full bg-[var(--pink-soft)] text-[var(--pink-medium)] text-xs flex items-center justify-center flex-shrink-0 font-semibold">1</span> Send the WhatsApp message to confirm your order</li>
              <li className="flex gap-3"><span className="w-5 h-5 rounded-full bg-[var(--pink-soft)] text-[var(--pink-medium)] text-xs flex items-center justify-center flex-shrink-0 font-semibold">2</span> We'll confirm availability and delivery timeline</li>
              <li className="flex gap-3"><span className="w-5 h-5 rounded-full bg-[var(--pink-soft)] text-[var(--pink-medium)] text-xs flex items-center justify-center flex-shrink-0 font-semibold">3</span> Your order will be packed with love and shipped</li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="btn-secondary flex items-center justify-center gap-2">
              <Home size={16} /> Back to Home
            </Link>
            <Link href="/shop" className="btn-primary">
              Continue Shopping <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
