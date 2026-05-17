// lib/whatsapp.ts — WhatsApp order message utilities
import { CONFIG } from "./config";

export interface WhatsAppCartItem {
  name: string;
  price: number;
  quantity: number;
}

export interface WhatsAppCustomer {
  name: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
}

export function generateOrderMessage(
  items: WhatsAppCartItem[],
  customer: WhatsAppCustomer,
  orderId: string
): string {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const delivery = 200;
  const total = subtotal + delivery;

  const lines = [
    `🧶 *NEW ORDER — STITCH & TWINE*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📋 *Order ID:* ${orderId}`,
    ``,
    `🛍️ *ITEMS:*`,
    ...items.map(
      (item, i) =>
        `${i + 1}. ${item.name}\n   ${item.quantity} × Rs.${item.price.toLocaleString()} = Rs.${(item.quantity * item.price).toLocaleString()}`
    ),
    ``,
    `💰 *SUMMARY:*`,
    `Subtotal: Rs.${subtotal.toLocaleString()}`,
    `Delivery: Rs.${delivery}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `*TOTAL: Rs.${total.toLocaleString()}*`,
    ``,
    `👤 *CUSTOMER:*`,
    `Name: ${customer.name}`,
    `Phone: ${customer.phone}`,
    `Address: ${customer.address}, ${customer.city}`,
    customer.notes ? `Notes: ${customer.notes}` : null,
    ``,
    `📍 Rawalpindi, Pakistan | Open 24/7`,
    `🕐 Placed: ${new Date().toLocaleString("en-PK")}`,
  ]
    .filter((l) => l !== null)
    .join("\n");

  return lines;
}

export function buildWhatsAppOrderUrl(
  items: WhatsAppCartItem[],
  customer: WhatsAppCustomer,
  orderId: string
): string {
  const msg = generateOrderMessage(items, customer, orderId);
  return CONFIG.social.whatsapp.orderLink(msg);
}

export function buildQuickWhatsAppUrl(message: string): string {
  return `${CONFIG.social.whatsapp.link}?text=${encodeURIComponent(message)}`;
}
