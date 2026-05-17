"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import { Order } from "@/types";

interface OrderContextType {
  lastOrder: Order | null;
  setLastOrder: (order: Order) => void;
  clearLastOrder: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [lastOrder, setLastOrderState] = useState<Order | null>(null);

  const setLastOrder = useCallback((order: Order) => {
    setLastOrderState(order);
  }, []);

  const clearLastOrder = useCallback(() => {
    setLastOrderState(null);
  }, []);

  return (
    <OrderContext.Provider value={{ lastOrder, setLastOrder, clearLastOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder must be used within OrderProvider");
  return ctx;
}
