"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import { Category, Product } from "@/types";
import ProductCard from "@/components/ui/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Skeletons";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { getSafeImageSrc } from "@/lib/utils";
import { subscribeContentUpdated } from "@/lib/clientRefreshBus";
import Link from "next/link";

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategoryData = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    const [categoryData, productData] = await Promise.all([
      categoryService.getCategoryBySlug(slug),
      productService.getProducts({ categorySlug: slug }),
    ]);
    setCategory(categoryData);
    setProducts(productData);
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    void loadCategoryData();
  }, [loadCategoryData]);

  useEffect(() => {
    const unsubscribe = subscribeContentUpdated((kind) => {
      if (kind === "all" || kind === "products" || kind === "categories") {
        void loadCategoryData();
      }
    });

    return unsubscribe;
  }, [loadCategoryData]);

  return (
    <div className="bg-boutique min-h-screen pt-6">
      {/* Category Banner */}
      {category && (
        <div className="relative h-56 sm:h-72 overflow-hidden">
          <Image
            src={getSafeImageSrc(category.image)}
            alt={category.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60 flex flex-col items-center justify-center text-center px-4">
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs uppercase tracking-[0.3em] text-[#F2C4CE] mb-2"
            >
              Browse Collection
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-playfair text-4xl md:text-5xl text-white font-medium"
            >
              {category.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-white/70 text-sm mt-3 max-w-md"
            >
              {category.description}
            </motion.p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Breadcrumb
          items={[
            { label: "Shop", href: "/shop" },
            { label: category?.name ?? slug },
          ]}
        />

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.length === 0
            ? (
              <div className="col-span-4 text-center py-20">
                <div className="w-20 h-20 rounded-full bg-[var(--pink-light)] mx-auto flex items-center justify-center text-3xl mb-4">🧶</div>
                <h3 className="font-playfair text-2xl text-[var(--text-primary)] mb-2">Coming Soon</h3>
                <p className="text-[var(--text-secondary)] text-sm">New items are being crafted with love. Check back soon!</p>
                <p className="text-[var(--text-secondary)] text-xs mt-1 mb-5">You can still explore all available categories right now.</p>
                <Link href="/shop" className="btn-primary inline-flex">Browse All Products</Link>
              </div>
            )
            : products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
}
