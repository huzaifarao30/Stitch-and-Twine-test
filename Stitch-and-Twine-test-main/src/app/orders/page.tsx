"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Package, Clock, CheckCircle, TrendingUp, XCircle, ChevronDown } from "lucide-react";
import { orderService } from "@/services/orderService";
import { Order } from "@/types";
import { formatPrice, getSafeImageSrc } from "@/lib/utils";
import Image from "next/image";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/context/AuthContext";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, adminUser, loading: authLoading } = useAuth();

  useEffect(() => {
    if (adminUser) {
      setOrders([]);
      setLoadingOrders(false);
      return;
    }

    if (!user?.id) {
      setOrders([]);
      setLoadingOrders(false);
      return;
    }

    void loadOrders();

    const timer = window.setInterval(() => {
      void loadOrders();
    }, 20000);

    return () => window.clearInterval(timer);
  }, [adminUser, user?.id]);

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await orderService.getOrders();
      setOrders(data);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const statusStyle: Record<string, string> = {
    pending: "bg-yellow-50 text-yellow-600 border-yellow-200",
    confirmed: "bg-blue-50 text-blue-600 border-blue-200",
    shipped: "bg-purple-50 text-purple-600 border-purple-200",
    delivered: "bg-green-50 text-green-600 border-green-200",
    cancelled: "bg-red-50 text-red-400 border-red-200",
  };

  const statusIcon: Record<string, React.ReactNode> = {
    pending: <Clock size={13} className="text-yellow-500" />,
    confirmed: <TrendingUp size={13} className="text-blue-500" />,
    shipped: <Package size={13} className="text-purple-500" />,
    delivered: <CheckCircle size={13} className="text-green-500" />,
    cancelled: <XCircle size={13} className="text-red-400" />,
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      pending: "Pending",
      confirmed: "Confirmed", 
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const parseCustomNotes = (notes?: string) => {
    if (!notes) return null;
    try {
      const parsed = JSON.parse(notes) as Record<string, string>;
      return parsed.type === "custom_order" ? parsed : null;
    } catch {
      return null;
    }
  };

  const filteredOrders = orders
    .filter((order) => statusFilter === "all" || order.status === statusFilter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const openAuthModal = () => {
    setAuthModalOpen(true);
  };

  if (adminUser) {
    return (
      <div className="bg-boutique min-h-screen pt-6 pb-16">
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <Lock className="mx-auto mb-4 text-pink-500" size={48} />
            <h1 className="text-2xl font-semibold mb-2">Admin account cannot place or track customer orders</h1>
            <p className="text-[var(--text-secondary)] text-sm">
              Please use a customer account to access order history.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show auth gate if not logged in
  if (!user) {
    return (
      <div className="bg-boutique min-h-screen pt-6 pb-16">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <Lock className="mx-auto mb-4 text-pink-500" size={48} />
            <h1 className="text-2xl font-semibold mb-2">Sign in to view your Orders</h1>
            <button 
              onClick={openAuthModal}
              className="px-8 py-3.5 rounded-full text-white font-semibold text-sm transition-all duration-200 hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #E8A0B0, #C4A484)" }}
            >
              Sign In
            </button>
          </div>
        </div>
        <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      </div>
    );
  }

  if (authLoading || loadingOrders) {
    return (
      <div className="bg-boutique min-h-screen pt-6 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-[var(--surface)] p-6 rounded-2xl">
                  <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-boutique min-h-screen pt-6 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-10">
          <p className="section-eyebrow mb-2">Order History</p>
          <h1 className="font-playfair text-4xl text-[var(--text-primary)]">My Orders</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-2">{orders.length} order{orders.length !== 1 ? "s" : ""} placed</p>
        </div>

        <div className="mb-6 flex items-center gap-3">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-3 pr-9 py-2.5 rounded-xl border border-[var(--border-color)] text-sm bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
          </div>
          <p className="text-xs text-[var(--text-secondary)]">Latest orders first</p>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <div className="w-24 h-24 rounded-full bg-[var(--pink-light)] flex items-center justify-center">
              <Package size={36} className="text-[var(--pink-medium)] opacity-60" />
            </div>
            <div className="text-center">
              <h2 className="font-playfair text-2xl text-[var(--text-primary)] mb-2">
                {orders.length === 0 ? "No orders yet" : "No orders for this filter"}
              </h2>
              <p className="text-[var(--text-secondary)] text-sm">
                {orders.length === 0 ? "When you place an order, it will appear here" : "Try selecting another status"}
              </p>
              <p className="text-[var(--text-secondary)] text-xs mt-1">
                {orders.length === 0 ? "Start with any product and checkout in under a minute." : "Remove filters to see your full order history."}
              </p>
            </div>
            <a href="/shop" className="btn-pink">
              Start Shopping
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-[var(--surface)] rounded-2xl p-6 shadow-boutique"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)] mb-1">Order {order.orderNumber}</h3>
                    {order.isCustom && <p className="text-xs text-[var(--accent-gold)]">Custom Order</p>}
                    <p className="text-sm text-[var(--text-secondary)]">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-3 sm:mt-0">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${statusStyle[order.status] || statusStyle.pending}`}>
                      {statusIcon[order.status] || statusIcon.pending}
                      {getStatusText(order.status)}
                    </div>
                    <div className="text-lg font-semibold text-[var(--text-primary)]">
                      {formatPrice(order.total)}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t border-[var(--border-color)] pt-4">
                  {order.items.length > 0 ? (
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
                          <div className="text-sm font-medium text-[var(--text-primary)]">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-[var(--text-secondary)]">
                      {(() => {
                        const details = parseCustomNotes(order.notes);
                        if (!details) return "Custom order details submitted.";
                        return `Custom request: ${details.productType || "-"} | Budget: ${details.budget || "-"}`;
                      })()}
                    </div>
                  )}
                </div>

                {/* Order Tracking Timeline */}
                <div className="border-t border-[var(--border-color)] pt-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${order.status === 'pending' || order.status === 'confirmed' || order.status === 'shipped' || order.status === 'delivered' ? 'bg-pink-500' : 'bg-gray-300'}`}></div>
                      <div className={`h-0.5 w-8 ${order.status === 'confirmed' || order.status === 'shipped' || order.status === 'delivered' ? 'bg-pink-500' : 'bg-gray-300'}`}></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${order.status === 'confirmed' || order.status === 'shipped' || order.status === 'delivered' ? 'bg-pink-500' : 'bg-gray-300'}`}></div>
                      <div className={`h-0.5 w-8 ${order.status === 'shipped' || order.status === 'delivered' ? 'bg-pink-500' : 'bg-gray-300'}`}></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${order.status === 'shipped' || order.status === 'delivered' ? 'bg-pink-500' : 'bg-gray-300'}`}></div>
                      <div className={`h-0.5 w-8 ${order.status === 'delivered' ? 'bg-pink-500' : 'bg-gray-300'}`}></div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${order.status === 'delivered' ? 'bg-pink-500' : 'bg-gray-300'}`}></div>
                  </div>
                  <div className="flex justify-between text-xs text-[var(--text-secondary)] mt-2">
                    <span>Pending</span>
                    <span>Confirmed</span>
                    <span>Shipped</span>
                    <span>Delivered</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}