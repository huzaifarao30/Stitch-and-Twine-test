"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, TrendingUp, Calendar, FileText, ShoppingBag } from "lucide-react";
import { orderService } from "@/services/orderService";
import { Order } from "@/types";
import { formatPrice } from "@/lib/utils";

export default function AdminReports() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"week" | "month" | "all">("month");

  useEffect(() => {
    orderService.getOrders().then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const completed = orders.filter((o) => o.status === "completed");
  const completedRevenue = completed.reduce((s, o) => s + o.total, 0);

  const stats = [
    { label: "Total Revenue", value: formatPrice(totalRevenue), icon: TrendingUp, color: "#7BC67E", bg: "#F0FBF0" },
    { label: "Completed Revenue", value: formatPrice(completedRevenue), icon: ShoppingBag, color: "#C4A484", bg: "#F6F2EA" },
    { label: "Total Orders", value: orders.length, icon: Calendar, color: "#E8A0B0", bg: "#FAE8ED" },
    { label: "Completed Orders", value: completed.length, icon: FileText, color: "#7AA2E3", bg: "#EFF5FF" },
  ];

  const downloadCSV = () => {
    const rows = [
      ["Order ID", "Date", "Customer", "City", "Items", "Total", "Status"],
      ...orders.map((o) => [
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
    a.download = `stitch-twine-orders-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadTXT = () => {
    const lines = [
      "STITCH & TWINE — EARNINGS REPORT",
      "=".repeat(40),
      `Period: ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
      `Generated: ${new Date().toLocaleString()}`,
      `Location: Rawalpindi, Pakistan`,
      "",
      `Total Revenue:    ${formatPrice(totalRevenue)}`,
      `Completed Revenue: ${formatPrice(completedRevenue)}`,
      `Total Orders:     ${orders.length}`,
      `Completed Orders: ${completed.length}`,
      "",
      "ORDER DETAILS:",
      "-".repeat(40),
      ...orders.map(
        (o) =>
          `${o.orderNumber} | ${new Date(o.createdAt).toLocaleDateString()} | ${o.customerName} | ${formatPrice(o.total)} | ${o.status}`
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `earnings-report-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-playfair text-3xl text-[#2E2E2E]">Reports</h1>
          <p className="text-[#6B6B6B] text-sm mt-1">Earnings overview &amp; exports</p>
        </div>
        <div className="flex gap-2">
          <button onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #7BC67E, #5AB860)" }}>
            <Download size={15} /> Excel / CSV
          </button>
          <button onClick={downloadTXT}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #E8A0B0, #C4A484)" }}>
            <Download size={15} /> Text Report
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-white rounded-2xl p-5 shadow-boutique">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg }}>
              <s.icon size={17} style={{ color: s.color }} />
            </div>
            <p className="text-2xl font-bold text-[#2E2E2E]">{s.value}</p>
            <p className="text-xs text-[#6B6B6B] mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-boutique overflow-hidden">
        <div className="px-6 py-4 border-b border-[#EDE6DA] flex items-center justify-between">
          <h2 className="font-medium text-[#2E2E2E]">All Orders</h2>
          <div className="flex gap-1">
            {(["week", "month", "all"] as const).map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${period === p ? "text-white" : "text-[#6B6B6B] hover:bg-[#F6F2EA]"}`}
                style={period === p ? { background: "linear-gradient(135deg, #E8A0B0, #C4A484)" } : {}}>
                {p === "all" ? "All time" : p === "month" ? "This month" : "This week"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-12 rounded-xl" />)}</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-[#9B8B7A] text-sm">No orders yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F6F2EA]">
                  {["Order ID", "Date", "Customer", "City", "Total", "Status"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#9B8B7A]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F6F2EA]">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="px-5 py-3.5 font-medium text-[#2E2E2E]">{o.orderNumber}</td>
                    <td className="px-5 py-3.5 text-[#6B6B6B]">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5 text-[#2E2E2E]">{o.customerName}</td>
                    <td className="px-5 py-3.5 text-[#6B6B6B]">{o.city}</td>
                    <td className="px-5 py-3.5 font-semibold text-[#2E2E2E]">{formatPrice(o.total)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        o.status === "completed" ? "bg-green-50 text-green-700" :
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
