"use client";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  ordersCount: number;
  totalSpent: number;
  lastOrder?: string;
  joinedAt?: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCustomers = async () => {
      const res = await fetch("/api/admin/customers", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) {
        setCustomers([]);
        setLoading(false);
        return;
      }

      const json = (await res.json()) as { customers?: Customer[] };
      setCustomers(json.customers || []);
      setLoading(false);
    };

    void loadCustomers();
  }, []);

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="mb-6">
        <h1 className="font-playfair text-3xl text-[var(--text-primary)]">Customers</h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">{customers.length} signed-up customers</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-[var(--surface)] rounded-2xl shadow-boutique p-20 text-center text-[var(--text-secondary)] text-sm">
          No customers found yet.
        </div>
      ) : (
        <div className="bg-[var(--surface)] rounded-2xl shadow-boutique overflow-hidden">
          {/* Desktop header */}
          <div className="hidden lg:grid grid-cols-10 gap-4 px-5 py-3 border-b border-[var(--border-color)] text-xs uppercase tracking-widest text-[var(--text-secondary)] font-medium">
            <div className="col-span-3">Customer</div>
            <div className="col-span-2">City</div>
            <div className="col-span-2">Orders</div>
            <div className="col-span-2">Total Spent</div>
            <div className="col-span-1">Last Order</div>
          </div>
          <div className="divide-y divide-[#F6F2EA]">
            {customers.map((customer) => (
              <div key={customer.id}>
                {/* Desktop row */}
                <div className="hidden lg:grid grid-cols-10 gap-4 px-5 py-3.5 items-center hover:bg-[var(--background)] transition-colors">
                  <div className="col-span-3">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{customer.name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{customer.phone}</p>
                  </div>
                  <div className="col-span-2 text-sm text-[var(--text-secondary)]">{customer.city}</div>
                  <div className="col-span-2">
                    <span className="px-2 py-0.5 rounded-full bg-[var(--pink-light)] text-[var(--pink-medium)] text-xs font-medium">
                      {customer.ordersCount} order{customer.ordersCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="col-span-2 text-sm font-semibold text-[var(--text-primary)]">{formatPrice(customer.totalSpent)}</div>
                  <div className="col-span-1 text-xs text-[var(--text-secondary)]">
                    {customer.lastOrder ? new Date(customer.lastOrder).toLocaleDateString() : "No orders"}
                  </div>
                </div>
                {/* Mobile card */}
                <div className="lg:hidden p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{customer.name}</p>
                    <span className="px-2 py-0.5 rounded-full bg-[var(--pink-light)] text-[var(--pink-medium)] text-xs font-medium">
                      {customer.ordersCount} order{customer.ordersCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                    <span>{customer.phone} · {customer.city}</span>
                    <span className="font-semibold text-sm text-[var(--text-primary)]">{formatPrice(customer.totalSpent)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
