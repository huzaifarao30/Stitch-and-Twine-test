/**
 * Simple localStorage-backed store for admin CRUD.
 * Products and categories added via admin forms are saved here and
 * merged with the static seed data on read.
 */
import { products as seedProducts } from "@/data/products";
import { categories as seedCategories } from "@/data/categories";
import { banners as seedBanners } from "@/data/banners";
import type { Product, Category, Banner } from "@/types";

const PRODUCTS_KEY = "sat_admin_products";
const CATEGORIES_KEY = "sat_admin_categories";
const SLIDERS_KEY = "sat_admin_sliders";
const DELETED_PRODUCTS_KEY = "sat_deleted_products";
const DELETED_CATEGORIES_KEY = "sat_deleted_categories";
const DELETED_SLIDERS_KEY = "sat_deleted_sliders";
const UPDATED_SLIDERS_KEY = "sat_updated_sliders";

function isBrowser() {
  return typeof window !== "undefined";
}

/* ── helpers ── */
function readJSON<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T) {
  if (!isBrowser()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

/* ══════════════════════════════════════════════════
   PRODUCTS
══════════════════════════════════════════════════ */
export function getAllProducts(): Product[] {
  const added = readJSON<Product[]>(PRODUCTS_KEY, []);
  const deleted = readJSON<string[]>(DELETED_PRODUCTS_KEY, []);
  const seed = seedProducts.filter((p) => !deleted.includes(p.id));
  return [...seed, ...added];
}

export function addProduct(product: Omit<Product, "id" | "slug" | "isActive" | "reviewCount" | "rating" | "isFeature"> & { isFeature?: boolean }): Product {
  const newProduct: Product = {
    ...product,
    id: `prod-${Date.now()}`,
    slug: product.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    isActive: true,
    reviewCount: 0,
    rating: 0,
    isFeature: false,
  };
  const existing = readJSON<Product[]>(PRODUCTS_KEY, []);
  writeJSON(PRODUCTS_KEY, [...existing, newProduct]);
  return newProduct;
}

export function deleteProduct(id: string) {
  // If it's a seed product, add to deleted list; if added, remove from added list
  const added = readJSON<Product[]>(PRODUCTS_KEY, []);
  const isAdded = added.some((p) => p.id === id);
  if (isAdded) {
    writeJSON(PRODUCTS_KEY, added.filter((p) => p.id !== id));
  } else {
    const deleted = readJSON<string[]>(DELETED_PRODUCTS_KEY, []);
    writeJSON(DELETED_PRODUCTS_KEY, [...deleted, id]);
  }
}

export function updateProduct(id: string, updates: Partial<Product>) {
  const added = readJSON<Product[]>(PRODUCTS_KEY, []);
  const isAdded = added.some((p) => p.id === id);
  if (isAdded) {
    writeJSON(PRODUCTS_KEY, added.map((p) => p.id === id ? { ...p, ...updates } : p));
  }
  // For seed products, we'd need a separate updated map — keep simple for now
}

/* ══════════════════════════════════════════════════
   CATEGORIES
══════════════════════════════════════════════════ */
export function getAllCategories(): Category[] {
  const added = readJSON<Category[]>(CATEGORIES_KEY, []);
  const deleted = readJSON<string[]>(DELETED_CATEGORIES_KEY, []);
  const seed = seedCategories.filter((c) => !deleted.includes(c.id));
  return [...seed, ...added];
}

export function addCategory(cat: { name: string; slug: string; description: string; image: string }): Category {
  const newCat: Category = {
    id: `cat-${Date.now()}`,
    ...cat,
  };
  const existing = readJSON<Category[]>(CATEGORIES_KEY, []);
  writeJSON(CATEGORIES_KEY, [...existing, newCat]);
  return newCat;
}

export function deleteCategory(id: string) {
  const added = readJSON<Category[]>(CATEGORIES_KEY, []);
  const isAdded = added.some((c) => c.id === id);
  if (isAdded) {
    writeJSON(CATEGORIES_KEY, added.filter((c) => c.id !== id));
  } else {
    const deleted = readJSON<string[]>(DELETED_CATEGORIES_KEY, []);
    writeJSON(DELETED_CATEGORIES_KEY, [...deleted, id]);
  }
}

/* ══════════════════════════════════════════════════
   SLIDERS (BANNERS)
══════════════════════════════════════════════════ */
export function getAllSliders(): Banner[] {
  const added = readJSON<Banner[]>(SLIDERS_KEY, []);
  const deleted = readJSON<string[]>(DELETED_SLIDERS_KEY, []);
  const updates = readJSON<Record<string, Partial<Banner>>>(UPDATED_SLIDERS_KEY, {});
  const seed = seedBanners
    .filter((b) => !deleted.includes(b.id))
    .map((b) => (updates[b.id] ? { ...b, ...updates[b.id] } : b));
  return [...seed, ...added];
}

export function addSlider(
  data: Omit<Banner, "id">
): Banner {
  const newBanner: Banner = {
    ...data,
    id: `slider-${Date.now()}`,
  };
  const existing = readJSON<Banner[]>(SLIDERS_KEY, []);
  writeJSON(SLIDERS_KEY, [...existing, newBanner]);
  return newBanner;
}

export function updateSlider(id: string, updates: Partial<Banner>) {
  // Check if it's a user-added slider
  const added = readJSON<Banner[]>(SLIDERS_KEY, []);
  const isAdded = added.some((b) => b.id === id);
  if (isAdded) {
    writeJSON(SLIDERS_KEY, added.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  } else {
    // It's a seed slider — store patch in updates map
    const existing = readJSON<Record<string, Partial<Banner>>>(UPDATED_SLIDERS_KEY, {});
    writeJSON(UPDATED_SLIDERS_KEY, { ...existing, [id]: { ...(existing[id] ?? {}), ...updates } });
  }
}

export function deleteSlider(id: string) {
  const added = readJSON<Banner[]>(SLIDERS_KEY, []);
  const isAdded = added.some((b) => b.id === id);
  if (isAdded) {
    writeJSON(SLIDERS_KEY, added.filter((b) => b.id !== id));
  } else {
    const deleted = readJSON<string[]>(DELETED_SLIDERS_KEY, []);
    writeJSON(DELETED_SLIDERS_KEY, [...deleted, id]);
  }
}
