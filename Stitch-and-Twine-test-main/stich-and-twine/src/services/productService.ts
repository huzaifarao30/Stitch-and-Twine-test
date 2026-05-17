import { products } from "@/data/products";
import { Product } from "@/types";

export const productService = {
  async getProducts(filters?: {
    categorySlug?: string;
    isFeatured?: boolean;
    search?: string;
    sortBy?: "newest" | "price-asc" | "price-desc";
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Product[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    let result = [...products].filter((p) => p.isActive);

    if (filters?.categorySlug) {
      result = result.filter((p) => p.categorySlug === filters.categorySlug);
    }

    if (filters?.isFeatured) {
      result = result.filter((p) => p.isFeature);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.includes(q))
      );
    }

    if (filters?.minPrice !== undefined) {
      result = result.filter((p) => p.price >= filters.minPrice!);
    }
    if (filters?.maxPrice !== undefined) {
      result = result.filter((p) => p.price <= filters.maxPrice!);
    }

    if (filters?.sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (filters?.sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return products.find((p) => p.slug === slug) || null;
  },

  async getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return products
      .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id && p.isActive)
      .slice(0, limit);
  },

  async getFeaturedProducts(limit = 8): Promise<Product[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return products.filter((p) => p.isFeature && p.isActive).slice(0, limit);
  },
};
