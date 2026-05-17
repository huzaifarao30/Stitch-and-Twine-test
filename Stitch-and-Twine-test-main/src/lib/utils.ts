import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Sale, SalePriceInfo } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
  }).format(price);
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 90 + 10);
  return `ST-${timestamp}${random}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getSafeImageSrc(src?: string | null): string {
  if (!src || !src.trim()) {
    return "/products/bouquets/bouquet1.jpeg";
  }
  return src;
}

export function normalizeCategorySlug(slug?: string | null): string {
  const value = (slug || "").trim().toLowerCase();
  if (value === "folowers") return "flowers";
  return value;
}

export function normalizeCategoryName(name?: string | null, slug?: string | null): string {
  const cleanName = (name || "").trim();
  const normalizedSlug = normalizeCategorySlug(slug);
  if (normalizedSlug === "flowers") return "Flowers";
  return cleanName;
}

// --- SALES MODULE ---
/**
 * Calculate the discounted price for a product based on active sales.
 * Finds the highest applicable discount for the product's category.
 * Does NOT overwrite original price — returns computed info for display.
 */
export function calculateDiscountedPrice(
  originalPrice: number,
  activeSales: Sale[],
  categorySlug: string
): SalePriceInfo {
  const normalizedSlug = normalizeCategorySlug(categorySlug);

  // Find all active sales matching this category slug
  const applicableSales = activeSales.filter(
    (sale) =>
      sale.isActive &&
      sale.categorySlug &&
      normalizeCategorySlug(sale.categorySlug) === normalizedSlug
  );

  if (applicableSales.length === 0) {
    return {
      originalPrice,
      discountedPrice: originalPrice,
      discountPercent: 0,
      isOnSale: false,
    };
  }

  // Apply the HIGHEST discount if multiple sales exist
  const highestDiscount = Math.max(...applicableSales.map((s) => s.discountPercent));
  const discountedPrice = Math.round((originalPrice - (originalPrice * highestDiscount) / 100) * 100) / 100;

  return {
    originalPrice,
    discountedPrice: Math.max(0, discountedPrice),
    discountPercent: highestDiscount,
    isOnSale: true,
  };
}

