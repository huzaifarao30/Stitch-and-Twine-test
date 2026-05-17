"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Package, Tag, Users, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";
import { orderService } from "@/services/orderService";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import { Order } from "@/types";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getOrders().then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const completedOrders = orders.filter((o) => o.status === "completed").length;

  const stats = [
    { label: "Total Revenue", value: formatPrice(totalRevenue), icon: TrendingUp, color: "#C4A484", bg: "#F6F2EA" },
    { label: "Total Orders", value: orders.length, icon: ShoppingBag, color: "#E8A0B0", bg: "#FAE8ED" },
    { label: "Products", value: products.length, icon: Package, color: "#7BC67E", bg: "#F0FBF0" },
    { label: "Categories", value: categories.length, icon: Tag, color: "#7AA2E3", bg: "#EFF5FF" },
  ];

  const statusIcon = {
    pending: <Clock size={13} className="text-yellow-500" />,
    processing: <TrendingUp size={13} className="text-blue-500" />,
    completed: <CheckCircle size={13} className="text-green-500" />,
    cancelled: <XCircle size={13} className="text-red-400" />,
  };

  const statusStyle = {
    pending: "bg-yellow-50 text-yellow-600",
    processing: "bg-blue-50 text-blue-600",
    completed: "bg-green-50 text-green-600",
    cancelled: "bg-red-50 text-red-400",
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-playfair text-3xl text-[#2E2E2E]">Dashboard</h1>
        <p className="text-[#6B6B6B] text-sm mt-1">Welcome back! Here's your store overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl p-5 shadow-boutique"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: stat.bg }}>
                <stat.icon size={17} style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#2E2E2E]">{stat.value}</p>
            <p className="text-xs text-[#6B6B6B] mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-boutique overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE6DA]">
            <h2 className="font-medium text-[#2E2E2E]">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-[#C4A484] hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="p-6 space-y-3">
              {[1,2,3].map(i => <div key={i} className="skeleton h-12 rounded-xl" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="p-10 text-center text-[#9B8B7A] text-sm">
              No orders yet. Share your shop link to start receiving orders!
            </div>
          ) : (
            <div className="divide-y divide-[#F6F2EA]">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center gap-4 px-6 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#2E2E2E] truncate">{order.orderNumber} — {order.customerName}</p>
                    <p className="text-xs text-[#9B8B7A]">{order.city} · {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="font-semibold text-sm text-[#2E2E2E]">{formatPrice(order.total)}</span>
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusStyle[order.status]}`}>
                    {statusIcon[order.status]} {order.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-boutique p-5">
            <h3 className="font-medium text-[#2E2E2E] mb-4">Order Status</h3>
            <div className="space-y-3">
              {[
                { label: "Pending", count: pendingOrders, color: "#F5A623" },
                { label: "Completed", count: completedOrders, color: "#7BC67E" },
                { label: "Cancelled", count: orders.filter(o => o.status === "cancelled").length, color: "#E8A0B0" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                    <span className="text-sm text-[#6B6B6B]">{s.label}</span>
                  </div>
                  <span className="font-semibold text-sm text-[#2E2E2E]">{s.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#F2C4CE] to-[#C4A484] rounded-2xl p-5 text-white">
            <h3 className="font-medium mb-2">Quick Links</h3>
            <div className="space-y-2 text-sm">
              <Link href="/admin/products" className="block py-1.5 rounded-lg hover:bg-white/10 transition-colors pl-2">→ Add New Product</Link>
              <Link href="/admin/orders" className="block py-1.5 rounded-lg hover:bg-white/10 transition-colors pl-2">→ View All Orders</Link>
              <Link href="/admin/settings" className="block py-1.5 rounded-lg hover:bg-white/10 transition-colors pl-2">→ Store Settings</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
