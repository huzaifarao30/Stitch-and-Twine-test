"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, X, Tag, ToggleLeft, ToggleRight, Percent, DollarSign, Calendar, Hash, Edit3 } from "lucide-react";
import { Coupon } from "@/types";
import { formatPrice } from "@/lib/utils";
import { couponService } from "@/services/couponService";

interface CouponForm {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: string;
  minOrderAmount: string;
  expiresAt: string;
}

const emptyForm: CouponForm = {
  code: "",
  discountType: "percentage",
  discountValue: "",
  minOrderAmount: "",
  expiresAt: "",
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CouponForm>(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadCoupons = async () => {
    const data = await couponService.getAdminCoupons();
    setCoupons(data);
  };

  useEffect(() => {
    void loadCoupons();
  }, []);

  const startEdit = (coupon: Coupon) => {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      minOrderAmount: coupon.minOrderAmount ? String(coupon.minOrderAmount) : "",
      expiresAt: coupon.expiresAt ? coupon.expiresAt.split("T")[0] : "",
    });
    setShowForm(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (editingId) {
      const updated = await couponService.updateCoupon(editingId, {
        code: form.code.toUpperCase().trim(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : undefined,
        expiresAt: form.expiresAt || undefined,
      });

      if (!updated) {
        setError("Failed to update coupon. Check permissions or duplicate code.");
        return;
      }
    } else {
      const created = await couponService.createCoupon({
        code: form.code,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : undefined,
        expiresAt: form.expiresAt || undefined,
      });

      if (!created) {
        setError("Failed to save coupon. Check permissions or duplicate code.");
        return;
      }
    }

    await loadCoupons();
    setForm(emptyForm);
    setShowForm(false);
    setEditingId(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleActive = async (id: string) => {
    setError("");
    const target = coupons.find((c) => c.id === id);
    if (!target) return;

    const updated = await couponService.updateCoupon(id, { isActive: !target.isActive });
    if (!updated) {
      setError("Failed to update coupon status.");
      return;
    }
    await loadCoupons();
  };

  const handleDelete = async (id: string) => {
    setError("");
    const ok = await couponService.deleteCoupon(id);
    if (!ok) {
      setError("Failed to delete coupon.");
      return;
    }
    await loadCoupons();
    setConfirmDelete(null);
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-gold)] focus:ring-2 focus:ring-[#C4A484]/20 transition-all placeholder:text-[var(--accent-gold)]/60";
  const labelClass =
    "block text-xs font-semibold uppercase tracking-widest text-[#4A3728] mb-1.5";

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-playfair text-2xl sm:text-3xl text-[var(--text-primary)]">Coupons</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            {coupons.length} coupon{coupons.length !== 1 ? "s" : ""} ·{" "}
            {coupons.filter((c) => c.isActive).length} active
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary text-sm py-2.5 px-5"
        >
          <Plus size={15} /> Add Coupon
        </button>
      </div>

      {/* Success toast */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm mb-4 text-center"
          >
            ✓ Coupon added successfully!
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-4 text-center">
          {error}
        </div>
      )}

      {/* Add Coupon Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <form
              onSubmit={handleAdd}
              className="bg-[var(--surface)] rounded-2xl p-4 sm:p-6 shadow-boutique space-y-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-playfair text-lg text-[var(--text-primary)]">
                  {editingId ? "Edit Coupon" : "New Coupon"}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Code */}
                <div>
                  <label className={labelClass}>Coupon Code *</label>
                  <div className="relative">
                    <Hash
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent-gold)]"
                    />
                    <input
                      type="text"
                      required
                      value={form.code}
                      onChange={(e) =>
                        setForm({ ...form, code: e.target.value })
                      }
                      placeholder="e.g. SUMMER25"
                      className={`${inputClass} pl-9 uppercase`}
                    />
                  </div>
                </div>

                {/* Discount Type */}
                <div>
                  <label className={labelClass}>Discount Type *</label>
                  <select
                    value={form.discountType}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        discountType: e.target.value as "percentage" | "fixed",
                      })
                    }
                    className={inputClass}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (PKR)</option>
                  </select>
                </div>

                {/* Discount Value */}
                <div>
                  <label className={labelClass}>
                    Discount Value *
                  </label>
                  <div className="relative">
                    {form.discountType === "percentage" ? (
                      <Percent
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent-gold)]"
                      />
                    ) : (
                      <DollarSign
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent-gold)]"
                      />
                    )}
                    <input
                      type="number"
                      required
                      min="1"
                      max={form.discountType === "percentage" ? "100" : undefined}
                      value={form.discountValue}
                      onChange={(e) =>
                        setForm({ ...form, discountValue: e.target.value })
                      }
                      placeholder={
                        form.discountType === "percentage" ? "e.g. 15" : "e.g. 200"
                      }
                      className={`${inputClass} pl-9`}
                    />
                  </div>
                </div>

                {/* Min Order */}
                <div>
                  <label className={labelClass}>
                    Min Order Amount{" "}
                    <span className="normal-case font-normal text-[var(--text-secondary)] tracking-normal">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.minOrderAmount}
                    onChange={(e) =>
                      setForm({ ...form, minOrderAmount: e.target.value })
                    }
                    placeholder="e.g. 500"
                    className={inputClass}
                  />
                </div>

                {/* Expiration */}
                <div className="sm:col-span-2">
                  <label className={labelClass}>
                    Expiration Date{" "}
                    <span className="normal-case font-normal text-[var(--text-secondary)] tracking-normal">
                      (optional)
                    </span>
                  </label>
                  <div className="relative">
                    <Calendar
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent-gold)]"
                    />
                    <input
                      type="date"
                      value={form.expiresAt}
                      onChange={(e) =>
                        setForm({ ...form, expiresAt: e.target.value })
                      }
                      className={`${inputClass} pl-9`}
                    />
                  </div>
                </div>
              </div>

              <motion.button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-medium text-sm transition-all"
                style={{
                  background: "linear-gradient(135deg, #E8A0B0, #C4A484)",
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                {editingId ? <Edit3 size={16} /> : <Tag size={16} />} {editingId ? "Update Coupon" : "Save Coupon"}
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coupons Table */}
      {coupons.length === 0 ? (
        <div className="py-20 text-center">
          <Tag size={48} className="mx-auto text-[#EDE6DA] mb-3" />
          <p className="text-[var(--text-secondary)]">No coupons yet. Create one!</p>
        </div>
      ) : (
        <div className="bg-[var(--surface)] rounded-2xl shadow-boutique overflow-hidden">
          {/* Desktop header */}
          <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 border-b border-[var(--border-color)] text-xs uppercase tracking-widest text-[var(--text-secondary)] font-medium">
            <div className="col-span-2">Code</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Discount</div>
            <div className="col-span-1">Min Order</div>
            <div className="col-span-2">Expires</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2">Actions</div>
          </div>

          <div className="divide-y divide-[#F6F2EA]">
            <AnimatePresence>
              {coupons.map((coupon) => {
                const isExpired =
                  coupon.expiresAt && new Date(coupon.expiresAt) < new Date();

                return (
                  <motion.div
                    key={coupon.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {/* Desktop row */}
                    <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3.5 items-center hover:bg-[var(--background)] transition-colors">
                      <div className="col-span-2">
                        <span className="font-mono text-sm font-semibold text-[var(--text-primary)] bg-[var(--background)] px-2.5 py-1 rounded-lg">
                          {coupon.code}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-xs text-[var(--text-secondary)] capitalize flex items-center gap-1.5">
                          {coupon.discountType === "percentage" ? (
                            <Percent size={12} className="text-[var(--accent-gold)]" />
                          ) : (
                            <DollarSign size={12} className="text-[var(--accent-gold)]" />
                          )}
                          {coupon.discountType}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-sm font-semibold text-[var(--text-primary)]">
                          {coupon.discountType === "percentage"
                            ? `${coupon.discountValue}%`
                            : formatPrice(coupon.discountValue)}
                        </span>
                      </div>
                      <div className="col-span-1 text-sm text-[var(--text-secondary)]">
                        {coupon.minOrderAmount
                          ? formatPrice(coupon.minOrderAmount)
                          : "—"}
                      </div>
                      <div className="col-span-2 text-sm text-[var(--text-secondary)]">
                        {coupon.expiresAt 
                          ? new Date(coupon.expiresAt).toLocaleDateString() 
                          : "Never"}
                      </div>
                      <div className="col-span-1">
                        {isExpired ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-400">
                            Expired
                          </span>
                        ) : coupon.isActive ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-600">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-400">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="col-span-2 flex gap-2">
                        <button
                          onClick={() => startEdit(coupon)}
                          className="w-8 h-8 rounded-lg bg-[var(--background)] flex items-center justify-center hover:bg-[var(--soft-beige)] transition-colors"
                          title="Edit"
                        >
                          <Edit3 size={14} className="text-[var(--text-secondary)]" />
                        </button>
                        <button
                          onClick={() => toggleActive(coupon.id)}
                          className="w-8 h-8 rounded-lg bg-[var(--background)] flex items-center justify-center hover:bg-[var(--soft-beige)] transition-colors"
                          title={
                            coupon.isActive ? "Deactivate" : "Activate"
                          }
                        >
                          {coupon.isActive ? (
                            <ToggleRight
                              size={16}
                              className="text-green-500"
                            />
                          ) : (
                            <ToggleLeft
                              size={16}
                              className="text-gray-400"
                            />
                          )}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(coupon.id)}
                          className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={13} className="text-red-400" />
                        </button>
                      </div>
                    </div>

                    {/* Mobile card */}
                    <div className="sm:hidden p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-semibold text-[var(--text-primary)] bg-[var(--background)] px-2.5 py-1 rounded-lg">
                          {coupon.code}
                        </span>
                        {isExpired ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-400">
                            Expired
                          </span>
                        ) : coupon.isActive ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-600">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-400">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--text-secondary)]">
                          {coupon.discountType === "percentage"
                            ? `${coupon.discountValue}% off`
                            : `${formatPrice(coupon.discountValue)} off`}
                        </span>
                        {coupon.minOrderAmount && (
                          <span className="text-xs text-[var(--text-secondary)]">
                            Min: {formatPrice(coupon.minOrderAmount)}
                          </span>
                        )}
                      </div>
                      {coupon.expiresAt && (
                        <p className="text-xs text-[var(--text-secondary)]">
                          Expires: {new Date(coupon.expiresAt).toLocaleDateString()}
                        </p>
                      )}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => startEdit(coupon)}
                          className="py-2 px-4 rounded-xl text-xs font-medium bg-[var(--background)] text-[var(--text-secondary)] hover:bg-[var(--soft-beige)] transition-colors flex items-center gap-1.5"
                        >
                          <Edit3 size={13} /> Edit
                        </button>
                        <button
                          onClick={() => toggleActive(coupon.id)}
                          className="flex-1 py-2 rounded-xl text-xs font-medium bg-[var(--background)] text-[var(--text-secondary)] hover:bg-[var(--soft-beige)] transition-colors flex items-center justify-center gap-1.5"
                        >
                          {coupon.isActive ? (
                            <>
                              <ToggleRight size={14} className="text-green-500" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <ToggleLeft size={14} className="text-gray-400" />
                              Activate
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(coupon.id)}
                          className="py-2 px-4 rounded-xl text-xs font-medium bg-red-50 text-red-400 hover:bg-red-100 transition-colors flex items-center gap-1.5"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--surface)] rounded-2xl p-6 max-w-sm w-full shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-playfair text-lg text-[var(--text-primary)]">
                  Delete Coupon?
                </h3>
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-5">
                This coupon will be permanently removed. This action cannot be
                undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] text-sm text-[var(--text-secondary)] hover:bg-[var(--background)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => void handleDelete(confirmDelete)}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
