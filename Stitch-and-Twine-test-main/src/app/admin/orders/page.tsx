"use client";
import { useEffect, useState } from "react";
import { ChevronDown, Eye, Trash2, Search, CheckCircle, Clock, TrendingUp, XCircle, Package } from "lucide-react";
import { orderService } from "@/services/orderService";
import { Order } from "@/types";
import { formatPrice, getSafeImageSrc } from "@/lib/utils";
import Image from "next/image";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [pricing, setPricing] = useState({ subtotal: "0", deliveryFee: "0", discount: "0" });
  const [pricingError, setPricingError] = useState("");
  const [pricingSaved, setPricingSaved] = useState(false);
  const [customBudget, setCustomBudget] = useState("");
  const [customDetailsSaved, setCustomDetailsSaved] = useState(false);

  const parseCustomNotes = (notes?: string) => {
    if (!notes) return null;
    try {
      const parsed = JSON.parse(notes) as Record<string, string>;
      if (parsed.type === "custom_order") return parsed;
      return null;
    } catch {
      return null;
    }
  };

  const parseBudgetRange = (budget?: string): { min?: number; max?: number } | null => {
    if (!budget) return null;
    const clean = budget.replace(/,/g, "").replace(/₨/g, "").trim();

    if (/let'?s discuss/i.test(clean)) return null;

    const under = clean.match(/^Under\s*(\d+)$/i);
    if (under) return { min: 0, max: Number(under[1]) };

    const range = clean.match(/^(\d+)\s*[–-]\s*(\d+)$/);
    if (range) return { min: Number(range[1]), max: Number(range[2]) };

    const plus = clean.match(/^(\d+)\+$/);
    if (plus) return { min: Number(plus[1]) };

    return null;
  };

  const loadOrders = async () => {
    const data = await orderService.getAdminOrders();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => { loadOrders(); }, []);

  const handleStatusChange = async (id: string, status: Order["status"]) => {
    const active = selectedOrder?.id === id ? selectedOrder : orders.find((o) => o.id === id) || null;
    if (active?.status === "delivered" && status !== "delivered") {
      return;
    }

    await orderService.updateOrderStatus(id, status);

    // REQ-6: Send confirmation email when marking as confirmed
    if (status === "confirmed" && active) {
      try {
        await fetch("/api/admin/orders/confirm-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: id,
            customerEmail: active.customerEmail,
            orderNumber: active.orderNumber,
          }),
        });
      } catch (emailErr) {
        console.error("Failed to send confirmation email:", emailErr);
      }
    }

    loadOrders();
    if (selectedOrder?.id === id) {
      setSelectedOrder((prev) => prev ? { ...prev, status } : null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this order?")) return;
    await orderService.deleteOrder(id);
    loadOrders();
    if (selectedOrder?.id === id) setSelectedOrder(null);
  };

  const filtered = orders.filter((o) => {
    const matchesSearch = !search || o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search);
    const matchesStatus = !statusFilter || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusIcon: Record<string, React.ReactNode> = {
    pending: <Clock size={13} className="text-yellow-500" />,
    confirmed: <TrendingUp size={13} className="text-blue-500" />,
    shipped: <Package size={13} className="text-purple-500" />,
    delivered: <CheckCircle size={13} className="text-green-500" />,
    cancelled: <XCircle size={13} className="text-red-400" />,
  };

  const statusStyle: Record<string, string> = {
    pending: "bg-yellow-50 text-yellow-600",
    confirmed: "bg-blue-50 text-blue-600",
    shipped: "bg-purple-50 text-purple-600",
    delivered: "bg-green-50 text-green-600",
    cancelled: "bg-red-50 text-red-400",
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="mb-6">
        <h1 className="font-playfair text-2xl sm:text-3xl text-[var(--text-primary)]">Orders</h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">{orders.length} total orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--border-color)] text-sm bg-[var(--surface)] focus:outline-none focus:border-[var(--accent-gold)]" />
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-3 pr-8 py-2.5 rounded-xl border border-[var(--border-color)] text-sm bg-[var(--surface)] focus:outline-none appearance-none cursor-pointer">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        {/* Orders List */}
        <div className="lg:col-span-3 bg-[var(--surface)] rounded-2xl shadow-boutique overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-[var(--text-secondary)] text-sm">No orders found</div>
          ) : (
            <div className="divide-y divide-[#F6F2EA]">
              {filtered.map((order) => (
                <div
                  key={order.id}
                  onClick={() => {
                    setSelectedOrder(order);
                    setPricingError("");
                    setPricingSaved(false);
                    setCustomDetailsSaved(false);
                    setPricing({
                      subtotal: String(order.subtotal || 0),
                      deliveryFee: String(order.deliveryFee || 0),
                      discount: String(order.discount || 0),
                    });
                    const details = parseCustomNotes(order.notes);
                    setCustomBudget(details?.budget || "");
                  }}
                  className={`flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-colors hover:bg-[var(--background)] ${selectedOrder?.id === order.id ? "bg-[var(--background)]" : ""}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{order.orderNumber}</p>
                      {order.isCustom && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--background)] text-[var(--accent-gold)]">Custom</span>
                      )}
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusStyle[order.status]}`}>
                        {statusIcon[order.status]} {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">{order.customerName} · {order.city}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{formatPrice(order.total)}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Detail */}
        <div className="lg:col-span-2">
          {selectedOrder ? (
            <div className="bg-[var(--surface)] rounded-2xl shadow-boutique overflow-hidden">
              <div className="px-5 py-4 border-b border-[var(--border-color)] flex items-center justify-between">
                <h3 className="font-medium text-[var(--text-primary)]">{selectedOrder.orderNumber}</h3>
                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusStyle[selectedOrder.status]}`}>
                  {statusIcon[selectedOrder.status]} {selectedOrder.status}
                </span>
              </div>
              <div className="p-5 space-y-4">
                {selectedOrder.isCustom && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Custom Order Details</p>
                    {(() => {
                      const details = parseCustomNotes(selectedOrder.notes);
                      if (!details) return <p className="text-xs text-[var(--text-secondary)]">No custom details available.</p>;
                      return (
                        <div className="text-xs text-[var(--text-secondary)] space-y-1">
                          <p><span className="text-[var(--text-primary)] font-medium">Type:</span> {details.productType || "-"}</p>
                          <p><span className="text-[var(--text-primary)] font-medium">Colors:</span> {details.colors || "-"}</p>
                          <p><span className="text-[var(--text-primary)] font-medium">Size:</span> {details.size || "-"}</p>
                          <p><span className="text-[var(--text-primary)] font-medium">Budget:</span> {details.budget || "-"}</p>
                          <p><span className="text-[var(--text-primary)] font-medium">Deadline:</span> {details.deadline || "-"}</p>
                          <p><span className="text-[var(--text-primary)] font-medium">Description:</span> {details.description || "-"}</p>
                        </div>
                      );
                    })()}

                    <div className="mt-3">
                      <p className="text-[11px] text-[var(--text-secondary)] mb-1">Override Budget Range</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customBudget}
                          onChange={(e) => setCustomBudget(e.target.value)}
                          placeholder="e.g. 1000-2500 or Under 500"
                          className="flex-1 px-2 py-2 rounded-xl border border-[var(--border-color)] text-xs"
                        />
                        <button
                          onClick={async () => {
                            setPricingError("");
                            setCustomDetailsSaved(false);
                            try {
                              await orderService.updateCustomOrderDetails(selectedOrder.id, { budget: customBudget });
                              await loadOrders();
                              setCustomDetailsSaved(true);
                            } catch (err) {
                              setPricingError(err instanceof Error ? err.message : "Unable to save custom details.");
                            }
                          }}
                          className="px-3 py-2 rounded-xl text-xs font-medium bg-[var(--background)] text-[var(--text-primary)] hover:bg-[var(--soft-beige)]"
                        >
                          Save
                        </button>
                      </div>
                      {customDetailsSaved && <p className="text-xs text-green-600 mt-1">Custom details saved.</p>}
                    </div>
                  </div>
                )}

                {/* Customer */}
                <div>
                  <p className="text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Customer</p>
                  <p className="font-medium text-[var(--text-primary)] text-sm">{selectedOrder.customerName}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{selectedOrder.customerPhone}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{selectedOrder.customerEmail}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{selectedOrder.city}, {selectedOrder.shippingAddress}</p>
                </div>

                {/* Items */}
                <div>
                  <p className="text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Items</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden">
                          <Image src={getSafeImageSrc(item.image)} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-[var(--text-primary)] truncate">{item.name}</p>
                          <p className="text-xs text-[var(--text-secondary)]">× {item.quantity}</p>
                        </div>
                        <p className="text-xs font-medium text-[var(--text-primary)]">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="space-y-1.5 text-xs border-t border-[var(--border-color)] pt-3">
                  <div className="flex justify-between text-[var(--text-secondary)]"><span>Subtotal</span><span>{formatPrice(selectedOrder.subtotal)}</span></div>
                  {selectedOrder.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(selectedOrder.discount)}</span></div>}
                  <div className="flex justify-between text-[var(--text-secondary)]"><span>Delivery</span><span>{formatPrice(selectedOrder.deliveryFee)}</span></div>
                  <div className="flex justify-between font-semibold text-[var(--text-primary)] text-sm pt-1 border-t border-[var(--border-color)]"><span>Total</span><span>{formatPrice(selectedOrder.total)}</span></div>
                </div>

                {/* Pricing Controls (custom orders only) */}
                {selectedOrder.isCustom && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Set Price (Custom Order)</p>
                    {(() => {
                      const details = parseCustomNotes(selectedOrder.notes);
                      const budgetText = customBudget || details?.budget || "";
                      const budgetRange = parseBudgetRange(budgetText);
                      return (
                        <>
                          {budgetText && (
                            <p className="text-[11px] text-[var(--text-secondary)] mb-2">
                              Customer budget: <span className="text-[var(--text-primary)] font-medium">{budgetText}</span>
                            </p>
                          )}
                          <div className="grid grid-cols-3 gap-2 mb-2">
                            <input
                              type="number"
                              min="0"
                              value={pricing.subtotal}
                              onChange={(e) => setPricing((p) => ({ ...p, subtotal: e.target.value }))}
                              className="px-2 py-2 rounded-xl border border-[var(--border-color)] text-xs"
                              placeholder="Subtotal"
                            />
                            <input
                              type="number"
                              min="0"
                              value={pricing.deliveryFee}
                              onChange={(e) => setPricing((p) => ({ ...p, deliveryFee: e.target.value }))}
                              className="px-2 py-2 rounded-xl border border-[var(--border-color)] text-xs"
                              placeholder="Delivery"
                            />
                            <input
                              type="number"
                              min="0"
                              value={pricing.discount}
                              onChange={(e) => setPricing((p) => ({ ...p, discount: e.target.value }))}
                              className="px-2 py-2 rounded-xl border border-[var(--border-color)] text-xs"
                              placeholder="Discount"
                            />
                          </div>

                          {pricingError && <p className="text-xs text-red-500 mb-2">{pricingError}</p>}
                          {pricingSaved && <p className="text-xs text-green-600 mb-2">Pricing saved.</p>}

                          <button
                            onClick={async () => {
                              setPricingError("");
                              setPricingSaved(false);

                              const subtotal = Number(pricing.subtotal || 0);
                              const deliveryFee = Number(pricing.deliveryFee || 0);
                              const discount = Number(pricing.discount || 0);

                              if (budgetRange) {
                                if (budgetRange.min !== undefined && subtotal < budgetRange.min) {
                                  setPricingError(`Subtotal is below customer budget minimum (PKR ${budgetRange.min}).`);
                                  return;
                                }
                                if (budgetRange.max !== undefined && subtotal > budgetRange.max) {
                                  setPricingError(`Subtotal exceeds customer budget maximum (PKR ${budgetRange.max}).`);
                                  return;
                                }
                              }

                              try {
                                await orderService.updateOrderPricing(selectedOrder.id, {
                                  subtotal,
                                  deliveryFee,
                                  discount,
                                });
                                await loadOrders();
                                setPricingSaved(true);
                              } catch (err) {
                                setPricingError(err instanceof Error ? err.message : "Unable to save pricing.");
                              }
                            }}
                            className="w-full py-2 rounded-xl text-xs font-medium bg-[var(--background)] text-[var(--text-primary)] hover:bg-[var(--soft-beige)] transition-colors"
                          >
                            Save Pricing
                          </button>
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* Status Changer */}
                <div>
                  <p className="text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Update Status</p>
                  {selectedOrder.status === "delivered" ? (
                    <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
                      This order is delivered and locked. Status can no longer be changed.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {(["pending", "confirmed", "shipped", "delivered", "cancelled"] as Order["status"][]).map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(selectedOrder.id, s)}
                          className={`py-2 rounded-xl text-xs font-medium transition-all ${
                            selectedOrder.status === s ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"
                          } ${statusStyle[s]}`}
                          disabled={selectedOrder.status === s}
                        >
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(selectedOrder.id)}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs text-red-400 hover:text-red-500 border border-red-100 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={13} /> Delete Order
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[var(--surface)] rounded-2xl shadow-boutique p-10 text-center text-[var(--text-secondary)] text-sm">
              <Eye size={32} className="mx-auto mb-3 opacity-30" />
              Select an order to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
