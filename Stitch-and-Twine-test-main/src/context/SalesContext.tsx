// --- SALES MODULE ---
"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Sale } from "@/types";
import { salesService } from "@/services/salesService";
import { subscribeContentUpdated } from "@/lib/clientRefreshBus";

interface SalesContextType {
  activeSales: Sale[];
  refreshSales: () => void;
  loading: boolean;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export function SalesProvider({ children }: { children: React.ReactNode }) {
  const [activeSales, setActiveSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  const loadActiveSales = useCallback(async () => {
    try {
      const sales = await salesService.getActiveSales();
      setActiveSales(sales);
    } catch {
      setActiveSales([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadActiveSales();
  }, [loadActiveSales]);

  // Listen for cross-tab sales updates
  useEffect(() => {
    const unsubscribe = subscribeContentUpdated((kind) => {
      if (kind === "all" || kind === "sales" || kind === "categories") {
        void loadActiveSales();
      }
    });
    return unsubscribe;
  }, [loadActiveSales]);

  const refreshSales = useCallback(() => {
    void loadActiveSales();
  }, [loadActiveSales]);

  return (
    <SalesContext.Provider value={{ activeSales, refreshSales, loading }}>
      {children}
    </SalesContext.Provider>
  );
}

export function useSales() {
  const ctx = useContext(SalesContext);
  if (!ctx) throw new Error("useSales must be used within SalesProvider");
  return ctx;
}
