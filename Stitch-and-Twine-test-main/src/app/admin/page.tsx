"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Package, Tag, Users, TrendingUp, Clock, CheckCircle, XCircle, Trash2, Star, PlusCircle, SlidersHorizontal } from "lucide-react";
import { orderService } from "@/services/orderService";
import { Order } from "@/types";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { couponService } from "@/services/couponService";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import { reviewService, ProductReview } from "@/services/reviewService";

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [productCount, setProductCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, adminUser } = useAuth();
  const activeUser = adminUser ?? user;

  useEffect(() => {
    Promise.all([
      orderService.getAdminOrders(),
      couponService.getAdminCoupons(),
      productService.getAdminProducts(),
      categoryService.getAdminCategories(),
      reviewService.getAdminReviews(5),
    ]).then(([ordersData, couponData, productsData, categoriesData, reviewsData]) => {
      setOrders(ordersData);
      setCoupons(couponData);
      setProductCount(productsData.length);
      setCategoryCount(categoriesData.length);
      setReviews(reviewsData);
      setLoading(false);
    });
  }, []);

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    await reviewService.deleteReview(id);
    const latest = await reviewService.getAdminReviews(5);
    setReviews(latest);
  };

  const totalRevenue = orders.filter(o => o.status === "delivered").reduce((s, o) => s + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;

  const stats = [
    { label: "Revenue (Delivered)", value: formatPrice(totalRevenue), icon: TrendingUp, color: "#C4A484", bg: "#F6F2EA" },
    { label: "Total Orders", value: orders.length, icon: ShoppingBag, color: "#E8A0B0", bg: "#FAE8ED" },
    { label: "Products", value: productCount, icon: Package, color: "#7BC67E", bg: "#F0FBF0" },
    { label: "Categories", value: categoryCount, icon: Users, color: "#7AA2E3", bg: "#EFF5FF" },
    { label: "Coupons", value: coupons.length, icon: Tag, color: "#7AA2E3", bg: "#EFF5FF" },
  ];

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
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="font-playfair text-2xl sm:text-3xl text-[var(--text-primary)]">Dashboard</h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">
          Welcome back{activeUser?.name ? `, ${activeUser.name}` : ""}! Here&apos;s your store overview.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          href="/admin/products/add"
          className="flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold text-white shadow-boutique-lg transition-transform duration-200 hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg, #E8A0B0, #C4A484)" }}
        >
          <PlusCircle size={16} /> Add Product
        </Link>
        <Link
          href="/admin/categories/add"
          className="flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold border border-[#E8D8C8] bg-[var(--surface)] text-[var(--text-primary)] shadow-boutique transition-colors hover:bg-[#FAF6F1]"
        >
          <Tag size={16} className="text-[var(--accent-gold)]" /> Add Category
        </Link>
        <Link
          href="/admin/sliders"
          className="flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold border border-[#F2C4CE] bg-[var(--pink-light)] text-[var(--text-primary)] shadow-boutique transition-colors hover:bg-[#F6DDE5]"
        >
          <SlidersHorizontal size={16} className="text-[var(--pink-medium)]" /> Update Slider
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-[var(--surface)] rounded-2xl p-5 shadow-boutique"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: stat.bg }}>
                <stat.icon size={17} style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-[var(--surface)] rounded-2xl shadow-boutique overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
            <h2 className="font-medium text-[var(--text-primary)]">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-[var(--accent-gold)] hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="p-6 space-y-3">
              {[1,2,3].map(i => <div key={i} className="skeleton h-12 rounded-xl" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="p-10 text-center text-[var(--text-secondary)] text-sm">
              No orders yet. Share your shop link to start receiving orders!
            </div>
          ) : (
            <div className="divide-y divide-[#F6F2EA]">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{order.orderNumber} — {order.customerName}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{order.city} · {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="font-semibold text-sm text-[var(--text-primary)]">{formatPrice(order.total)}</span>
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
          <div className="bg-[var(--surface)] rounded-2xl shadow-boutique p-5">
            <h3 className="font-medium text-[var(--text-primary)] mb-4">Order Status</h3>
            <div className="space-y-3">
              {[
                { label: "Pending", count: pendingOrders, color: "#F5A623" },
                { label: "Delivered", count: deliveredOrders, color: "#7BC67E" },
                { label: "Cancelled", count: orders.filter(o => o.status === "cancelled").length, color: "#E8A0B0" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                    <span className="text-sm text-[var(--text-secondary)]">{s.label}</span>
                  </div>
                  <span className="font-semibold text-sm text-[var(--text-primary)]">{s.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#F2C4CE] to-[#C4A484] rounded-2xl p-5 text-white">
            <h3 className="font-medium mb-2">Quick Links</h3>
            <div className="space-y-2 text-sm">
              <Link href="/admin/products" className="block py-1.5 rounded-lg hover:bg-[var(--surface)]/10 transition-colors pl-2">→ Add New Product</Link>
              <Link href="/admin/orders" className="block py-1.5 rounded-lg hover:bg-[var(--surface)]/10 transition-colors pl-2">→ View All Orders</Link>
              <Link href="/admin/reviews" className="block py-1.5 rounded-lg hover:bg-[var(--surface)]/10 transition-colors pl-2">→ Manage Reviews</Link>
              <Link href="/admin/settings" className="block py-1.5 rounded-lg hover:bg-[var(--surface)]/10 transition-colors pl-2">→ Store Settings</Link>
            </div>
          </div>

          <div className="bg-[var(--surface)] rounded-2xl shadow-boutique p-5">
            <h3 className="font-medium text-[var(--text-primary)] mb-4">Recent Reviews</h3>
            {reviews.length === 0 ? (
              <p className="text-xs text-[var(--text-secondary)]">No reviews yet.</p>
            ) : (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <div key={review.id} className="border border-[var(--border-color)] rounded-xl p-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-xs font-medium text-[var(--text-primary)] truncate">{review.customerName}</p>
                      <button
                        onClick={() => void handleDeleteReview(review.id)}
                        className="text-red-400 hover:text-red-500"
                        title="Delete review"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="flex items-center gap-1 mb-1">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star key={idx} size={11} fill={idx < review.rating ? "#F5A623" : "none"} className={idx < review.rating ? "text-[#F5A623]" : "text-[#D8CFC5]"} />
                      ))}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{review.reviewText}</p>
                    {review.productName && <p className="text-[10px] text-[var(--text-secondary)] mt-1">Product: {review.productName}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
