"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Eye, Trash2, Search, CheckCircle, Clock, TrendingUp, XCircle } from "lucide-react";
import { orderService } from "@/services/orderService";
import { Order } from "@/types";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const loadOrders = async () => {
    const data = await orderService.getOrders();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => { loadOrders(); }, []);

  const handleStatusChange = async (id: string, status: Order["status"]) => {
    await orderService.updateOrderStatus(id, status);
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
    processing: <TrendingUp size={13} className="text-blue-500" />,
    completed: <CheckCircle size={13} className="text-green-500" />,
    cancelled: <XCircle size={13} className="text-red-400" />,
  };

  const statusStyle: Record<string, string> = {
    pending: "bg-yellow-50 text-yellow-600",
    processing: "bg-blue-50 text-blue-600",
    completed: "bg-green-50 text-green-600",
    cancelled: "bg-red-50 text-red-400",
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-playfair text-3xl text-[#2E2E2E]">Orders</h1>
          <p className="text-[#6B6B6B] text-sm mt-1">{orders.length} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B8B7A]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#EDE6DA] text-sm bg-white focus:outline-none focus:border-[#C4A484]" />
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-3 pr-8 py-2.5 rounded-xl border border-[#EDE6DA] text-sm bg-white focus:outline-none appearance-none cursor-pointer">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9B8B7A] pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Orders List */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-boutique overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-[#9B8B7A] text-sm">No orders found</div>
          ) : (
            <div className="divide-y divide-[#F6F2EA]">
              {filtered.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-colors hover:bg-[#F6F2EA] ${selectedOrder?.id === order.id ? "bg-[#F6F2EA]" : ""}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[#2E2E2E]">{order.orderNumber}</p>
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusStyle[order.status]}`}>
                        {statusIcon[order.status]} {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#9B8B7A]">{order.customerName} · {order.city}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#2E2E2E]">{formatPrice(order.total)}</p>
                    <p className="text-xs text-[#9B8B7A]">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Detail */}
        <div className="lg:col-span-2">
          {selectedOrder ? (
            <div className="bg-white rounded-2xl shadow-boutique overflow-hidden">
              <div className="px-5 py-4 border-b border-[#EDE6DA] flex items-center justify-between">
                <h3 className="font-medium text-[#2E2E2E]">{selectedOrder.orderNumber}</h3>
                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusStyle[selectedOrder.status]}`}>
                  {statusIcon[selectedOrder.status]} {selectedOrder.status}
                </span>
              </div>
              <div className="p-5 space-y-4">
                {/* Customer */}
                <div>
                  <p className="text-xs uppercase tracking-widest text-[#9B8B7A] mb-2">Customer</p>
                  <p className="font-medium text-[#2E2E2E] text-sm">{selectedOrder.customerName}</p>
                  <p className="text-xs text-[#6B6B6B]">{selectedOrder.customerPhone}</p>
                  <p className="text-xs text-[#6B6B6B]">{selectedOrder.customerEmail}</p>
                  <p className="text-xs text-[#6B6B6B]">{selectedOrder.city}, {selectedOrder.shippingAddress}</p>
                </div>

                {/* Items */}
                <div>
                  <p className="text-xs uppercase tracking-widest text-[#9B8B7A] mb-2">Items</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-[#2E2E2E] truncate">{item.name}</p>
                          <p className="text-xs text-[#9B8B7A]">× {item.quantity}</p>
                        </div>
                        <p className="text-xs font-medium text-[#2E2E2E]">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="space-y-1.5 text-xs border-t border-[#EDE6DA] pt-3">
                  <div className="flex justify-between text-[#6B6B6B]"><span>Subtotal</span><span>{formatPrice(selectedOrder.subtotal)}</span></div>
                  {selectedOrder.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(selectedOrder.discount)}</span></div>}
                  <div className="flex justify-between text-[#6B6B6B]"><span>Delivery</span><span>{formatPrice(selectedOrder.deliveryFee)}</span></div>
                  <div className="flex justify-between font-semibold text-[#2E2E2E] text-sm pt-1 border-t border-[#EDE6DA]"><span>Total</span><span>{formatPrice(selectedOrder.total)}</span></div>
                </div>

                {/* Status Changer */}
                <div>
                  <p className="text-xs uppercase tracking-widest text-[#9B8B7A] mb-2">Update Status</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(["pending","processing","completed","cancelled"] as Order["status"][]).map((s) => (
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
            <div className="bg-white rounded-2xl shadow-boutique p-10 text-center text-[#9B8B7A] text-sm">
              <Eye size={32} className="mx-auto mb-3 opacity-30" />
              Select an order to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
