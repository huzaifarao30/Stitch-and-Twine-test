"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CreditCard, CheckCircle, ArrowLeft, MessageCircle, Camera, AlertTriangle } from "lucide-react";
import { settingsService } from "@/services/settingsService";
import { Settings, PaymentMethod } from "@/types";
import { formatPrice } from "@/lib/utils";

function CheckoutTermsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  const orderNumber = searchParams.get("orderNumber") || "";
  const total = Number(searchParams.get("total") || 0);
  const whatsappUrl = decodeURIComponent(searchParams.get("whatsappUrl") || "");
  const advanceAmount = Math.ceil(total / 2);

  useEffect(() => {
    settingsService.getSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const paymentMethods: PaymentMethod[] = settings?.paymentMethods || [];

  if (loading) {
    return (
      <div className="bg-boutique min-h-screen pt-6 pb-16 flex items-center justify-center">
        <div className="crochet-spinner" />
      </div>
    );
  }

  return (
    <div className="bg-boutique min-h-screen pt-6 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent-gold)] transition-colors mb-6"
        >
          <ArrowLeft size={16} /> Back to Cart
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
            style={{ background: "linear-gradient(135deg, #E8A0B0, #C4A484)" }}>
            <CreditCard size={28} className="text-white" />
          </div>
          <h1 className="font-playfair text-3xl text-[var(--text-primary)] mb-2">Payment Terms</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Please review our payment policy before proceeding
          </p>
        </div>

        {/* Order Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--surface)] rounded-2xl shadow-boutique p-6 mb-6"
        >
          <p className="text-xs uppercase tracking-widest text-[var(--accent-gold)] mb-3">Order Summary</p>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-[var(--text-secondary)]">Order</span>
            <span className="font-medium text-[var(--text-primary)]">{orderNumber}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-[var(--text-secondary)]">Total Amount</span>
            <span className="font-semibold text-[var(--text-primary)]">{formatPrice(total)}</span>
          </div>
          <div className="border-t border-[var(--border-color)] pt-3 mt-3">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-primary)] font-medium">50% Advance Payment</span>
              <span className="font-bold text-[var(--accent-gold)] text-lg">{formatPrice(advanceAmount)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-[var(--text-secondary)]">Remaining on Delivery (COD)</span>
              <span className="text-[var(--text-secondary)]">{formatPrice(total - advanceAmount)}</span>
            </div>
          </div>
        </motion.div>

        {/* Payment Policy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[var(--surface)] rounded-2xl shadow-boutique p-6 mb-6"
        >
          <p className="text-xs uppercase tracking-widest text-[var(--accent-gold)] mb-3">Payment Policy</p>
          <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
            <li className="flex gap-3 items-start">
              <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
              <span><strong className="text-[var(--text-primary)]">50% advance payment</strong> is required to confirm your order.</span>
            </li>
            <li className="flex gap-3 items-start">
              <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
              <span>The remaining <strong className="text-[var(--text-primary)]">50% will be paid on delivery</strong> (Cash on Delivery).</span>
            </li>
            <li className="flex gap-3 items-start">
              <Camera size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <span><strong className="text-[var(--text-primary)]">A screenshot of your payment must be shared</strong> along with your WhatsApp message as proof of payment.</span>
            </li>
            <li className="flex gap-3 items-start">
              <AlertTriangle size={16} className="text-yellow-500 mt-0.5 flex-shrink-0" />
              <span>Orders not confirmed within <strong className="text-[var(--text-primary)]">24 hours</strong> will be automatically cancelled.</span>
            </li>
          </ul>
        </motion.div>

        {/* Payment Methods */}
        {paymentMethods.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[var(--surface)] rounded-2xl shadow-boutique p-6 mb-6"
          >
            <p className="text-xs uppercase tracking-widest text-[var(--accent-gold)] mb-3">Payment Methods</p>
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="bg-[var(--background)] rounded-xl p-4">
                  <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">{method.bankName}</p>
                  <p className="text-xs text-[var(--text-secondary)]">Account Title: <span className="text-[var(--text-primary)]">{method.accountTitle}</span></p>
                  <p className="text-xs text-[var(--text-secondary)]">Account Number: <span className="text-[var(--text-primary)] font-mono">{method.accountNumber}</span></p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Agreement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[var(--surface)] rounded-2xl shadow-boutique p-6 mb-6"
        >
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-[var(--accent-gold)] text-[var(--accent-gold)] focus:ring-[var(--accent-gold)]"
            />
            <span className="text-sm text-[var(--text-primary)]">
              I understand and agree to the <strong>50% advance payment policy</strong>. I will share a <strong>screenshot of my payment</strong> along with my WhatsApp message.
            </span>
          </label>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <a
            href={agreed ? whatsappUrl : "#"}
            target={agreed ? "_blank" : undefined}
            rel="noopener noreferrer"
            onClick={(e) => {
              if (!agreed) {
                e.preventDefault();
                return;
              }
            }}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-semibold text-sm transition-all ${
              agreed
                ? "opacity-100 hover:opacity-90 cursor-pointer"
                : "opacity-40 cursor-not-allowed"
            }`}
            style={{ background: agreed ? "linear-gradient(135deg, #25D366, #128C7E)" : "#9CA3AF" }}
          >
            <MessageCircle size={18} />
            Proceed to WhatsApp
          </a>
          {!agreed && (
            <p className="text-center text-xs text-[var(--text-secondary)] mt-2">
              Please agree to the payment terms above to continue
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function CheckoutTermsPage() {
  return (
    <Suspense fallback={<div className="bg-boutique min-h-screen pt-6 pb-16 flex items-center justify-center"><div className="crochet-spinner" /></div>}>
      <CheckoutTermsContent />
    </Suspense>
  );
}
