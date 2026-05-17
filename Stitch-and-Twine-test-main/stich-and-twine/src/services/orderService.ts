import { Order, CheckoutFormData, CartItem } from "@/types";

const ORDERS_KEY = "sat_orders";

function loadOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(ORDERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveOrders(orders: Order[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export const orderService = {
  async createOrder(data: {
    customerData: CheckoutFormData;
    items: CartItem[];
    subtotal: number;
    deliveryFee: number;
    discount: number;
    couponCode?: string;
  }): Promise<Order> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const orders = loadOrders();
    const orderNum = `ST-${(orders.length + 1).toString().padStart(4, "0")}`;
    const now = new Date().toISOString();

    const order: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      customerName: data.customerData.fullName,
      customerPhone: data.customerData.phone,
      customerEmail: data.customerData.email,
      shippingAddress: data.customerData.address,
      city: data.customerData.city,
      items: data.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        selectedVariants: item.selectedVariants,
      })),
      subtotal: data.subtotal,
      deliveryFee: data.deliveryFee,
      discount: data.discount,
      total: data.subtotal + data.deliveryFee - data.discount,
      couponCode: data.couponCode,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };

    orders.push(order);
    saveOrders(orders);
    return order;
  },

  async getOrders(): Promise<Order[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return loadOrders().reverse();
  },

  async getOrderById(id: string): Promise<Order | null> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return loadOrders().find((o) => o.id === id) || null;
  },

  async updateOrderStatus(id: string, status: Order["status"]): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const orders = loadOrders();
    const idx = orders.findIndex((o) => o.id === id);
    if (idx !== -1) {
      orders[idx].status = status;
      orders[idx].updatedAt = new Date().toISOString();
      saveOrders(orders);
    }
  },

  async deleteOrder(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const orders = loadOrders().filter((o) => o.id !== id);
    saveOrders(orders);
  },

  generateWhatsAppMessage(order: Order, whatsappNumber: string): string {
    const itemsText = order.items
      .map((item) => `• ${item.name} x${item.quantity} — PKR ${(item.price * item.quantity).toLocaleString()}`)
      .join("\n");

    const message = `🌸 *NEW ORDER — ${order.orderNumber}*\n\n` +
      `👤 *Customer Details:*\n` +
      `Name: ${order.customerName}\n` +
      `Phone: ${order.customerPhone}\n` +
      `Email: ${order.customerEmail}\n` +
      `City: ${order.city}\n` +
      `Address: ${order.shippingAddress}\n\n` +
      `🛍️ *Order Items:*\n${itemsText}\n\n` +
      `💰 *Order Summary:*\n` +
      `Subtotal: PKR ${order.subtotal.toLocaleString()}\n` +
      (order.discount > 0 ? `Discount: -PKR ${order.discount.toLocaleString()}\n` : "") +
      `Delivery: PKR ${order.deliveryFee.toLocaleString()}\n` +
      `*Total: PKR ${order.total.toLocaleString()}*\n\n` +
      `Please confirm my order. Thank you! 🎀`;

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
  },
};
