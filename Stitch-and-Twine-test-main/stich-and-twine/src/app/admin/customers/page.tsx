"use client";
import { useEffect, useState } from "react";
import { orderService } from "@/services/orderService";
import { Order } from "@/types";
import { formatPrice } from "@/lib/utils";

interface Customer {
  name: string;
  phone: string;
  email: string;
  city: string;
  ordersCount: number;
  totalSpent: number;
  lastOrder: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getOrders().then((orders) => {
      const customerMap = new Map<string, Customer>();
      orders.forEach((order) => {
        const key = order.customerPhone;
        if (customerMap.has(key)) {
          const c = customerMap.get(key)!;
          c.ordersCount++;
          c.totalSpent += order.total;
          if (order.createdAt > c.lastOrder) c.lastOrder = order.createdAt;
        } else {
          customerMap.set(key, {
            name: order.customerName,
            phone: order.customerPhone,
            email: order.customerEmail,
            city: order.city,
            ordersCount: 1,
            totalSpent: order.total,
            lastOrder: order.createdAt,
          });
        }
      });
      setCustomers(Array.from(customerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent));
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="font-playfair text-3xl text-[#2E2E2E]">Customers</h1>
        <p className="text-[#6B6B6B] text-sm mt-1">{customers.length} unique customers from orders</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-boutique p-20 text-center text-[#9B8B7A] text-sm">
          No customers yet. Customer data will appear here once orders are placed.
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-boutique overflow-hidden">
          <div className="grid grid-cols-10 gap-4 px-5 py-3 border-b border-[#EDE6DA] text-xs uppercase tracking-widest text-[#9B8B7A] font-medium">
            <div className="col-span-3">Customer</div>
            <div className="col-span-2">City</div>
            <div className="col-span-2">Orders</div>
            <div className="col-span-2">Total Spent</div>
            <div className="col-span-1">Last Order</div>
          </div>
          <div className="divide-y divide-[#F6F2EA]">
            {customers.map((customer, i) => (
              <div key={i} className="grid grid-cols-10 gap-4 px-5 py-3.5 items-center hover:bg-[#F6F2EA] transition-colors">
                <div className="col-span-3">
                  <p className="text-sm font-medium text-[#2E2E2E]">{customer.name}</p>
                  <p className="text-xs text-[#9B8B7A]">{customer.phone}</p>
                </div>
                <div className="col-span-2 text-sm text-[#6B6B6B]">{customer.city}</div>
                <div className="col-span-2">
                  <span className="px-2 py-0.5 rounded-full bg-[#FAE8ED] text-[#E8A0B0] text-xs font-medium">
                    {customer.ordersCount} order{customer.ordersCount !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="col-span-2 text-sm font-semibold text-[#2E2E2E]">{formatPrice(customer.totalSpent)}</div>
                <div className="col-span-1 text-xs text-[#9B8B7A]">{new Date(customer.lastOrder).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
