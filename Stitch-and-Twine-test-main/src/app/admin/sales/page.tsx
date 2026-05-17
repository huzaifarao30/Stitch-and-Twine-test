// --- SALES MODULE ---
"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, X, Percent, Calendar, Edit3,
  ToggleLeft, ToggleRight, Tag, AlertTriangle,
} from "lucide-react";
import { Sale, Category } from "@/types";
import { salesService } from "@/services/salesService";
import { categoryService } from "@/services/categoryService";
import { showToast } from "@/lib/toastBus";

interface SaleForm {
  categoryId: string;
  discountPercent: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

const emptyForm: SaleForm = {
  categoryId: "",
  discountPercent: 10,
  isActive: false,
  startDate: "",
  endDate: "",
};

function sliderColor(val: number) {
  if (val <= 25) return "#22c55e";
  if (val <= 50) return "#eab308";
  return "#ef4444";
}

export default function AdminSalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<SaleForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmActivate, setConfirmActivate] = useState(false);
  const [productCount, setProductCount] = useState<number | null>(null);
  const [error, setError] = useState("");

  const loadData = async () => {
    const [s, c] = await Promise.all([
      salesService.getAdminSales(),
      categoryService.getAdminCategories(),
    ]);
    setSales(s);
    setCategories(c);
  };

  useEffect(() => { void loadData(); }, []);

  useEffect(() => {
    if (!form.categoryId) { setProductCount(null); return; }
    void salesService.getProductCountForCategory(form.categoryId).then(setProductCount);
  }, [form.categoryId]);

  const activeSales = sales.filter((s) => {
    if (!s.isActive) return false;
    const now = new Date();
    if (s.startDate && new Date(s.startDate) > now) return false;
    if (s.endDate && new Date(s.endDate) < now) return false;
    return true;
  });

  const marqueeText = activeSales.length > 0
    ? activeSales.map((s) => `🔥 ${s.categoryName || "Category"} — ${s.discountPercent}% OFF! 🔥`).join("  |  ")
    : "No active sales right now. Use the panel below to create one!";

  const startEdit = (sale: Sale) => {
    setEditingId(sale.id);
    setForm({
      categoryId: sale.categoryId,
      discountPercent: sale.discountPercent,
      isActive: sale.isActive,
      startDate: sale.startDate ? sale.startDate.split("T")[0] : "",
      endDate: sale.endDate ? sale.endDate.split("T")[0] : "",
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.categoryId) { setError("Please select a category."); return; }

    try {
      if (editingId) {
        const updated = await salesService.updateSale(editingId, {
          categoryId: form.categoryId,
          discountPercent: form.discountPercent,
          isActive: form.isActive,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
        });
        if (!updated) { setError("Failed to update sale."); return; }
        showToast("Sale updated successfully!", "success");
      } else {
        const created = await salesService.createSale({
          categoryId: form.categoryId,
          discountPercent: form.discountPercent,
          isActive: form.isActive,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
        });
        if (!created) { setError("Failed to create sale."); return; }
        const catName = categories.find((c) => c.id === form.categoryId)?.name || "Category";
        showToast(`Sale applied! ${form.discountPercent}% off on all ${catName} products.`, "success");
      }
      await loadData();
      setForm(emptyForm);
      setShowForm(false);
      setEditingId(null);
    } catch (err: any) {
      setError(err?.message || "Failed to save sale.");
    }
  };

  const toggleActive = async (sale: Sale) => {
    const updated = await salesService.updateSale(sale.id, { isActive: !sale.isActive });
    if (!updated) { showToast("Failed to toggle sale.", "error"); return; }
    showToast(sale.isActive ? "Sale paused." : "Sale activated!", "success");
    await loadData();
  };

  const handleDelete = async (id: string) => {
    const ok = await salesService.deleteSale(id);
    if (!ok) { showToast("Failed to delete sale.", "error"); return; }
    showToast("Sale deleted. Products reverted to original pricing.", "success");
    await loadData();
    setConfirmDelete(null);
  };

  const handleActivateToggle = () => {
    if (!form.isActive) {
      setConfirmActivate(true);
    } else {
      setForm({ ...form, isActive: false });
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-gold)] focus:ring-2 focus:ring-[#C4A484]/20 transition-all placeholder:text-[var(--accent-gold)]/60";
  const labelClass = "block text-xs font-semibold uppercase tracking-widest text-[#4A3728] mb-1.5";

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* ── Marquee Bar ── */}
      <div className="mb-6 rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #E8A0B0, #C4A484)" }}>
        <div className="sales-marquee-wrapper py-3 px-4" title="Active sales">
          <div className={`sales-marquee-track text-white font-semibold text-sm whitespace-nowrap ${activeSales.length > 0 ? "animate-marquee" : "text-center"}`}>
            {activeSales.length > 0 ? (
              <><span>{marqueeText}</span><span className="ml-16">{marqueeText}</span></>
            ) : (
              <span>{marqueeText}</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Header ── */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-playfair text-2xl sm:text-3xl text-[var(--text-primary)]">Sales</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            {sales.length} sale{sales.length !== 1 ? "s" : ""} · {activeSales.length} active
          </p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm); }} className="btn-primary text-sm py-2.5 px-5">
          <Plus size={15} /> {showForm ? "Cancel" : "Create Sale"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-4 text-center">{error}</div>
      )}

      {/* ── Create / Edit Form ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
            <form onSubmit={handleSave} className="bg-[var(--surface)] rounded-2xl p-4 sm:p-6 shadow-boutique space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-playfair text-lg text-[var(--text-primary)]">{editingId ? "Edit Sale" : "Create / Manage Sale"}</h3>
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><X size={18} /></button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Selector */}
                <div>
                  <label className={labelClass}>Select Category *</label>
                  <div className="relative">
                    <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent-gold)]" />
                    <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className={`${inputClass} pl-9`}>
                      <option value="">-- Choose a Category --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  {form.categoryId && productCount !== null && (
                    <p className="text-xs text-[var(--text-secondary)] mt-1.5">This will apply the sale to <span className="font-semibold text-[var(--accent-gold)]">{productCount}</span> product{productCount !== 1 ? "s" : ""} in this category</p>
                  )}
                </div>

                {/* Discount Slider */}
                <div>
                  <label className={labelClass}>Discount Percentage</label>
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-3xl font-bold" style={{ color: sliderColor(form.discountPercent) }}>{form.discountPercent}%</span>
                  </div>
                  <input
                    type="range" min={10} max={70} step={1}
                    value={form.discountPercent}
                    onChange={(e) => setForm({ ...form, discountPercent: Number(e.target.value) })}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer sale-discount-slider"
                    style={{ background: `linear-gradient(90deg, #22c55e 0%, #eab308 50%, #ef4444 100%)` }}
                  />
                  <div className="flex justify-between text-[10px] text-[var(--text-secondary)] mt-1"><span>10%</span><span>70%</span></div>
                </div>

                {/* Start Date */}
                <div>
                  <label className={labelClass}>Sale Start Date <span className="normal-case font-normal text-[var(--text-secondary)] tracking-normal">(optional)</span></label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent-gold)]" />
                    <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={`${inputClass} pl-9`} />
                  </div>
                </div>

                {/* End Date */}
                <div>
                  <label className={labelClass}>Sale End Date <span className="normal-case font-normal text-[var(--text-secondary)] tracking-normal">(optional)</span></label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent-gold)]" />
                    <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={`${inputClass} pl-9`} />
                  </div>
                  {!form.endDate && <p className="text-[10px] text-[var(--text-secondary)] mt-1">No end date = runs indefinitely</p>}
                </div>

                {/* Active Toggle */}
                <div className="sm:col-span-2">
                  <label className={labelClass}>Activate Sale</label>
                  <button type="button" onClick={handleActivateToggle} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all w-full sm:w-auto ${form.isActive ? "border-green-300 bg-green-50" : "border-[var(--border-color)] bg-[var(--surface)]"}`}>
                    {form.isActive ? <ToggleRight size={22} className="text-green-500" /> : <ToggleLeft size={22} className="text-gray-400" />}
                    <span className={`text-sm font-medium ${form.isActive ? "text-green-700" : "text-[var(--text-secondary)]"}`}>{form.isActive ? "Sale is LIVE" : "Sale is OFF (saved but not applied)"}</span>
                  </button>
                </div>
              </div>

              <motion.button type="submit" className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-medium text-sm transition-all" style={{ background: "linear-gradient(135deg, #E8A0B0, #C4A484)" }} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                {editingId ? <Edit3 size={16} /> : <Percent size={16} />} {editingId ? "Update Sale" : "Apply Sale"}
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Active Sales Table ── */}
      <div className="mb-4">
        <h2 className="font-playfair text-lg text-[var(--text-primary)] mb-3">Active Sales</h2>
      </div>

      {sales.length === 0 ? (
        <div className="py-20 text-center">
          <Percent size={48} className="mx-auto text-[#EDE6DA] mb-3" />
          <p className="text-[var(--text-secondary)]">No sales created yet. Use the form above to create your first sale!</p>
        </div>
      ) : (
        <div className="bg-[var(--surface)] rounded-2xl shadow-boutique overflow-hidden">
          {/* Desktop header */}
          <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 border-b border-[var(--border-color)] text-xs uppercase tracking-widest text-[var(--text-secondary)] font-medium">
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Discount</div>
            <div className="col-span-2">Start Date</div>
            <div className="col-span-2">End Date</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Actions</div>
          </div>

          <div className="divide-y divide-[#F6F2EA]">
            <AnimatePresence>
              {sales.map((sale) => {
                const now = new Date();
                const isExpired = sale.endDate && new Date(sale.endDate) < now;
                const notStarted = sale.startDate && new Date(sale.startDate) > now;
                const isLive = sale.isActive && !isExpired && !notStarted;

                return (
                  <motion.div key={sale.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}>
                    {/* Desktop row */}
                    <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3.5 items-center hover:bg-[var(--background)] transition-colors">
                      <div className="col-span-2 text-sm font-medium text-[var(--text-primary)]">{sale.categoryName || "—"}</div>
                      <div className="col-span-2">
                        <span className="text-sm font-semibold text-[var(--text-primary)]">{sale.discountPercent}%</span>
                      </div>
                      <div className="col-span-2 text-sm text-[var(--text-secondary)]">{sale.startDate ? new Date(sale.startDate).toLocaleDateString() : "—"}</div>
                      <div className="col-span-2 text-sm text-[var(--text-secondary)]">{sale.endDate ? new Date(sale.endDate).toLocaleDateString() : "No end"}</div>
                      <div className="col-span-2">
                        {isExpired ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-400">Expired</span>
                        ) : isLive ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-600">🟢 Live</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-400">⏸ Paused</span>
                        )}
                      </div>
                      <div className="col-span-2 flex gap-2">
                        <button onClick={() => startEdit(sale)} className="w-8 h-8 rounded-lg bg-[var(--background)] flex items-center justify-center hover:bg-[var(--soft-beige)] transition-colors" title="Edit"><Edit3 size={14} className="text-[var(--text-secondary)]" /></button>
                        <button onClick={() => toggleActive(sale)} className="w-8 h-8 rounded-lg bg-[var(--background)] flex items-center justify-center hover:bg-[var(--soft-beige)] transition-colors" title={sale.isActive ? "Pause" : "Activate"}>
                          {sale.isActive ? <ToggleRight size={16} className="text-green-500" /> : <ToggleLeft size={16} className="text-gray-400" />}
                        </button>
                        <button onClick={() => setConfirmDelete(sale.id)} className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors"><Trash2 size={13} className="text-red-400" /></button>
                      </div>
                    </div>

                    {/* Mobile card */}
                    <div className="sm:hidden p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-[var(--text-primary)]">{sale.categoryName || "—"}</span>
                        {isExpired ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-400">Expired</span>
                        ) : isLive ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-600">🟢 Live</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-400">⏸ Paused</span>
                        )}
                      </div>
                      <div className="text-sm text-[var(--text-secondary)]">{sale.discountPercent}% off</div>
                      <div className="flex gap-2 pt-1">
                        <button onClick={() => startEdit(sale)} className="py-2 px-4 rounded-xl text-xs font-medium bg-[var(--background)] text-[var(--text-secondary)] hover:bg-[var(--soft-beige)] transition-colors flex items-center gap-1.5"><Edit3 size={13} /> Edit</button>
                        <button onClick={() => toggleActive(sale)} className="flex-1 py-2 rounded-xl text-xs font-medium bg-[var(--background)] text-[var(--text-secondary)] hover:bg-[var(--soft-beige)] transition-colors flex items-center justify-center gap-1.5">
                          {sale.isActive ? (<><ToggleRight size={14} className="text-green-500" />Pause</>) : (<><ToggleLeft size={14} className="text-gray-400" />Activate</>)}
                        </button>
                        <button onClick={() => setConfirmDelete(sale.id)} className="py-2 px-4 rounded-xl text-xs font-medium bg-red-50 text-red-400 hover:bg-red-100 transition-colors flex items-center gap-1.5"><Trash2 size={13} /> Delete</button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-[var(--surface)] rounded-2xl p-6 max-w-sm w-full shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-playfair text-lg text-[var(--text-primary)]">Delete Sale?</h3>
                <button onClick={() => setConfirmDelete(null)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><X size={18} /></button>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-5">This will remove the sale and revert all products in this category to their original pricing.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] text-sm text-[var(--text-secondary)] hover:bg-[var(--background)] transition-colors">Cancel</button>
                <button onClick={() => void handleDelete(confirmDelete)} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Activate Confirm Modal ── */}
      <AnimatePresence>
        {confirmActivate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setConfirmActivate(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-[var(--surface)] rounded-2xl p-6 max-w-sm w-full shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center"><AlertTriangle size={20} className="text-orange-500" /></div>
                <h3 className="font-playfair text-lg text-[var(--text-primary)]">Activate Sale?</h3>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-5">
                This will apply <span className="font-semibold">{form.discountPercent}%</span> discount to all{" "}
                {productCount !== null && <span className="font-semibold">{productCount}</span>} products in{" "}
                <span className="font-semibold">{categories.find((c) => c.id === form.categoryId)?.name || "this category"}</span>. Proceed?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmActivate(false)} className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] text-sm text-[var(--text-secondary)] hover:bg-[var(--background)] transition-colors">Cancel</button>
                <button onClick={() => { setForm({ ...form, isActive: true }); setConfirmActivate(false); }} className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium transition-colors" style={{ background: "linear-gradient(135deg, #E8A0B0, #C4A484)" }}>Yes, Activate</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
