"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, TrendingUp, Calendar, FileText } from "lucide-react";
import { orderService } from "@/services/orderService";
import { Order } from "@/types";
import { formatPrice } from "@/lib/utils";

export default function AdminReports() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"week" | "month" | "all">("month");

  useEffect(() => {
    orderService.getAdminOrders().then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(startOfToday);
  const day = startOfWeek.getDay();
  const diffToMonday = (day + 6) % 7;
  startOfWeek.setDate(startOfWeek.getDate() - diffToMonday);

  const filteredOrders = orders.filter((o) => {
    if (period === "all") return true;
    const created = new Date(o.createdAt);
    if (Number.isNaN(created.getTime())) return false;
    if (period === "week") return created >= startOfWeek;
    return created >= startOfMonth;
  });

  const periodLabel =
    period === "all"
      ? "All time"
      : period === "month"
      ? "This month"
      : "This week";

  const completed = filteredOrders.filter((o) => o.status === "delivered");
  const completedRevenue = completed.reduce((s, o) => s + o.total, 0);

  const stats = [
    { label: "Revenue (Completed Orders)", value: formatPrice(completedRevenue), icon: TrendingUp, color: "#7BC67E", bg: "#F0FBF0" },
    { label: "Total Orders", value: filteredOrders.length, icon: Calendar, color: "#E8A0B0", bg: "#FAE8ED" },
    { label: "Completed Orders", value: completed.length, icon: FileText, color: "#7AA2E3", bg: "#EFF5FF" },
  ];

  const downloadCSV = () => {
    const rows = [
      ["Order ID", "Date", "Customer", "City", "Items", "Total", "Status"],
      ...filteredOrders.map((o) => [
        o.orderNumber,
        new Date(o.createdAt).toLocaleDateString(),
        o.customerName,
        o.city,
        o.items.map((i) => `${i.name} x${i.quantity}`).join("; "),
        o.total,
        o.status,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stitch-twine-orders-${period}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadTXT = () => {
    const lines = [
      "STITCH & TWINE — EARNINGS REPORT",
      "=".repeat(40),
      `Period: ${periodLabel}`,
      `Generated: ${new Date().toLocaleString()}`,
      `Location: Rawalpindi, Pakistan`,
      "",
      `Revenue (Completed): ${formatPrice(completedRevenue)}`,
      `Total Orders:     ${filteredOrders.length}`,
      `Completed Orders: ${completed.length}`,
      "",
      "ORDER DETAILS:",
      "-".repeat(40),
      ...filteredOrders.map(
        (o) =>
          `${o.orderNumber} | ${new Date(o.createdAt).toLocaleDateString()} | ${o.customerName} | ${formatPrice(o.total)} | ${o.status}`
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `earnings-report-${period}-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="font-playfair text-2xl sm:text-3xl text-[var(--text-primary)]">Reports</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Earnings overview &amp; exports</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={downloadCSV}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #7BC67E, #5AB860)" }}>
            <Download size={15} /> CSV
          </button>
          <button onClick={downloadTXT}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #E8A0B0, #C4A484)" }}>
            <Download size={15} /> Text Report
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-[var(--surface)] rounded-2xl p-5 shadow-boutique">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg }}>
              <s.icon size={17} style={{ color: s.color }} />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">{s.value}</p>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-[var(--surface)] rounded-2xl shadow-boutique overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between">
          <h2 className="font-medium text-[var(--text-primary)]">Orders ({periodLabel})</h2>
          <div className="flex gap-1">
            {(["week", "month", "all"] as const).map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${period === p ? "text-white" : "text-[var(--text-secondary)] hover:bg-[var(--background)]"}`}
                style={period === p ? { background: "linear-gradient(135deg, #E8A0B0, #C4A484)" } : {}}>
                {p === "all" ? "All time" : p === "month" ? "This month" : "This week"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-12 rounded-xl" />)}</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-[var(--text-secondary)] text-sm">No orders yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--background)]">
                  {["Order ID", "Date", "Customer", "City", "Total", "Status"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F6F2EA]">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="px-5 py-3.5 font-medium text-[var(--text-primary)]">{o.orderNumber}</td>
                    <td className="px-5 py-3.5 text-[var(--text-secondary)]">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5 text-[var(--text-primary)]">{o.customerName}</td>
                    <td className="px-5 py-3.5 text-[var(--text-secondary)]">{o.city}</td>
                    <td className="px-5 py-3.5 font-semibold text-[var(--text-primary)]">{formatPrice(o.total)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        o.status === "delivered" ? "bg-green-50 text-green-700" :
                        o.status === "pending" ? "bg-yellow-50 text-yellow-700" :
                        o.status === "cancelled" ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-600"
                      }`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
