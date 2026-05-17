import { categories } from "@/data/categories";
import { Category } from "@/types";

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return categories;
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return categories.find((c) => c.slug === slug) || null;
  },
};
