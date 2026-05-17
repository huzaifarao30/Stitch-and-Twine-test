import { Order, CheckoutFormData, CartItem } from "@/types";
import { createClient } from "@/utils/supabase/client";

type OrderRow = Record<string, any>;

function mapOrder(row: OrderRow): Order {
  const rowItems = Array.isArray(row.items) ? row.items : [];
  const notesText = typeof row.notes === "string" ? row.notes : "";
  const isCustom = notesText.includes("\"custom_order\"") || notesText.includes("CUSTOM_ORDER");

  return {
    id: String(row.id),
    orderNumber: row.order_number || "",
    customerName: row.customer_name || "",
    customerPhone: row.customer_phone || "",
    customerEmail: row.customer_email || "",
    shippingAddress: row.shipping_address || "",
    city: row.city || "",
    items: rowItems.map((item: any) => ({
      productId: String(item.productId || item.product_id || ""),
      name: item.name || item.product_name || "",
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 0),
      image: item.image || item.product_image || "",
      selectedVariants: item.selectedVariants || item.selected_variants || {},
    })),
    subtotal: Number(row.subtotal || 0),
    deliveryFee: Number(row.delivery_fee || 0),
    discount: Number(row.discount || 0),
    total: Number(row.total || 0),
    couponCode: row.coupon_code || undefined,
    status: row.status || "pending",
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
    shippedAt: row.shipped_at || undefined,
    deliveredAt: row.delivered_at || undefined,
    notes: notesText || undefined,
    isCustom,
  };
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 90 + 10);
  return `ST-${timestamp}${random}`;
}

async function assertAdmin(supabase: NonNullable<ReturnType<typeof createClient>>): Promise<void> {
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user?.id) {
    throw new Error("Unauthorized");
  }

  const { data: profile, error: roleErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (roleErr || profile?.role !== "admin") {
    throw new Error("Only admin can perform this action.");
  }
}

export const orderService = {
  async getPublicUniqueCustomerCount(): Promise<number> {
    const supabase = createClient();
    if (!supabase) return 0;

    const { data, error } = await supabase
      .from("orders")
      .select("user_id, customer_phone, customer_email");

    if (error || !data) return 0;

    const uniqueCustomers = new Set<string>();
    for (const row of data as Array<{ user_id?: string | null; customer_phone?: string | null; customer_email?: string | null }>) {
      const userId = String(row.user_id || "").trim();
      const email = String(row.customer_email || "").trim().toLowerCase();
      const phone = String(row.customer_phone || "").replace(/\D/g, "");

      if (userId) {
        uniqueCustomers.add(`user:${userId}`);
        continue;
      }
      if (email) {
        uniqueCustomers.add(`email:${email}`);
        continue;
      }
      if (phone) {
        uniqueCustomers.add(`phone:${phone}`);
      }
    }

    return uniqueCustomers.size;
  },

  async createCustomOrder(data: {
    name: string;
    phone: string;
    email?: string;
    city: string;
    address: string;
    productType: string;
    colors?: string;
    size?: string;
    description: string;
    budget?: string;
    deadline?: string;
  }): Promise<Order> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const orderNum = `CU-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;
    const now = new Date().toISOString();

    const customPayload = {
      type: "custom_order",
      productType: data.productType,
      colors: data.colors || "",
      size: data.size || "",
      description: data.description,
      budget: data.budget || "",
      deadline: data.deadline || "",
    };

    const { data: insertedOrder, error } = await supabase
      .from("orders")
      .insert({
        order_number: orderNum,
        user_id: user?.id ?? null,
        customer_name: data.name,
        customer_phone: data.phone,
        customer_email: data.email || user?.email || "custom@order.local",
        shipping_address: data.address,
        city: data.city,
        items: [],
        subtotal: 0,
        delivery_fee: 0,
        discount: 0,
        total: 0,
        payment_method: "cod",
        status: "pending",
        notes: JSON.stringify(customPayload),
        created_at: now,
        updated_at: now,
      })
      .select("*")
      .single();

    if (error || !insertedOrder) {
      throw new Error(error?.message || "Unable to create custom order.");
    }

    return mapOrder(insertedOrder);
  },

  async createOrder(data: {
    customerData: CheckoutFormData;
    items: CartItem[];
    subtotal: number;
    deliveryFee: number;
    discount: number;
    couponCode?: string;
  }): Promise<Order> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const orderNum = generateOrderNumber();
    const now = new Date().toISOString();
    const itemsJson = data.items.map((item) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      selectedVariants: item.selectedVariants || {},
    }));

    const { data: insertedOrder, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNum,
        user_id: user?.id ?? null,
        customer_name: data.customerData.fullName,
        customer_phone: data.customerData.phone,
        customer_email: data.customerData.email,
        shipping_address: data.customerData.address,
        city: data.customerData.city,
        items: itemsJson,
        subtotal: data.subtotal,
        delivery_fee: data.deliveryFee,
        discount: data.discount,
        total: data.subtotal + data.deliveryFee - data.discount,
        coupon_code: data.couponCode || null,
        status: "pending",
        created_at: now,
        updated_at: now,
      })
      .select("*")
      .single();

    if (orderError || !insertedOrder) {
      throw new Error(orderError?.message || "Unable to create order.");
    }

    const orderItemsRows = data.items.map((item) => ({
      order_id: insertedOrder.id,
      product_id: item.productId,
      product_name: item.name,
      product_image: item.image,
      price: item.price,
      quantity: item.quantity,
      selected_variants: item.selectedVariants || {},
      total: item.price * item.quantity,
      created_at: now,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItemsRows);
    if (itemsError) {
      throw new Error(itemsError.message);
    }

    return mapOrder(insertedOrder);
  },

  async getOrders(): Promise<Order[]> {
    const supabase = createClient();
    if (!supabase) return [];

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) return [];

    const query = supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const { data, error } = await query;
    if (error || !data) return [];
    return data.map(mapOrder);
  },

  async getAdminOrders(): Promise<Order[]> {
    const supabase = createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map(mapOrder);
  },

  async getOrderById(id: string): Promise<Order | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;
    return mapOrder(data);
  },

  async updateOrderStatus(id: string, status: Order["status"]): Promise<void> {
    const supabase = createClient();
    if (!supabase) return;

    await assertAdmin(supabase);

    const { data: existingOrder } = await supabase
      .from("orders")
      .select("status, items")
      .eq("id", id)
      .maybeSingle();

    const prevStatus = existingOrder?.status as string | undefined;
    if (prevStatus === "delivered" && status !== "delivered") {
      throw new Error("Delivered orders are locked and cannot be changed.");
    }
    const shouldDeductStock =
      prevStatus === "pending" &&
      (status === "confirmed" || status === "shipped" || status === "delivered");

    if (shouldDeductStock) {
      const items = Array.isArray(existingOrder?.items) ? existingOrder.items : [];

      for (const item of items) {
        const productId = String(item.productId || item.product_id || "");
        const qty = Number(item.quantity || 0);
        if (!productId || qty <= 0) continue;

        const { data: productRow } = await supabase
          .from("products")
          .select("stock")
          .eq("id", productId)
          .maybeSingle();

        if (!productRow) continue;
        const currentStock = Number(productRow.stock || 0);
        const nextStock = Math.max(0, currentStock - qty);

        await supabase
          .from("products")
          .update({ stock: nextStock, updated_at: new Date().toISOString() })
          .eq("id", productId);
      }
    }

    const now = new Date().toISOString();
    const updateData: Record<string, any> = {
      status,
      updated_at: now,
    };

    if (status === "confirmed") {
      updateData.confirmed_at = now;
    }

    if (status === "shipped") {
      updateData.shipped_at = now;
    }

    if (status === "delivered") {
      updateData.delivered_at = now;
    }

    await supabase.from("orders").update(updateData).eq("id", id);
  },

  async updateOrderPricing(id: string, values: { subtotal: number; deliveryFee: number; discount: number }): Promise<void> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    await assertAdmin(supabase);

    const subtotal = Math.max(0, Number(values.subtotal || 0));
    const deliveryFee = Math.max(0, Number(values.deliveryFee || 0));
    const discount = Math.max(0, Number(values.discount || 0));
    const total = Math.max(0, subtotal + deliveryFee - discount);

    const { error } = await supabase
      .from("orders")
      .update({
        subtotal,
        delivery_fee: deliveryFee,
        discount,
        total,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  },

  async updateCustomOrderDetails(id: string, payload: {
    budget?: string;
    description?: string;
    colors?: string;
    size?: string;
    deadline?: string;
  }): Promise<void> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    await assertAdmin(supabase);

    const { data: existing, error: fetchErr } = await supabase
      .from("orders")
      .select("notes")
      .eq("id", id)
      .maybeSingle();

    if (fetchErr) {
      throw new Error(fetchErr.message);
    }

    let current: Record<string, string> = { type: "custom_order" };
    if (typeof existing?.notes === "string" && existing.notes.trim()) {
      try {
        const parsed = JSON.parse(existing.notes) as Record<string, string>;
        if (parsed.type === "custom_order") {
          current = parsed;
        }
      } catch {
        current = { type: "custom_order" };
      }
    }

    const merged = {
      ...current,
      ...(payload.budget !== undefined ? { budget: payload.budget } : {}),
      ...(payload.description !== undefined ? { description: payload.description } : {}),
      ...(payload.colors !== undefined ? { colors: payload.colors } : {}),
      ...(payload.size !== undefined ? { size: payload.size } : {}),
      ...(payload.deadline !== undefined ? { deadline: payload.deadline } : {}),
    };

    const { error } = await supabase
      .from("orders")
      .update({ notes: JSON.stringify(merged), updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  },

  async deleteOrder(id: string): Promise<void> {
    const supabase = createClient();
    if (!supabase) return;

    await assertAdmin(supabase);

    await supabase.from("order_items").delete().eq("order_id", id);
    await supabase.from("orders").delete().eq("id", id);
  },

  generateWhatsAppMessage(order: Order, whatsappNumber: string): string {
    const itemsText = order.items
      .map((item) => `• ${item.name} x${item.quantity} — PKR ${(item.price * item.quantity).toLocaleString()}`)
      .join("\n");

    const advanceAmount = Math.ceil(order.total / 2);

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
      `💳 *50% Advance Payment: PKR ${advanceAmount.toLocaleString()}*\n` +
      `(Remaining PKR ${(order.total - advanceAmount).toLocaleString()} on delivery)\n\n` +
      `📸 *Payment screenshot attached below.*\n\n` +
      `Please confirm my order. Thank you! 🎀`;

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
  },
};
