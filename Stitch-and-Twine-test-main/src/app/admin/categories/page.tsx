"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, ExternalLink, X, Layers } from "lucide-react";
import { categoryService } from "@/services/categoryService";
import { productService } from "@/services/productService";
import { Category } from "@/types";
import { getSafeImageSrc } from "@/lib/utils";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});

  const loadData = async () => {
    const [cats, prods] = await Promise.all([
      categoryService.getAdminCategories(),
      productService.getAdminProducts(),
    ]);
    const counts: Record<string, number> = {};
    cats.forEach((c) => {
      counts[c.slug] = prods.filter((p) => p.categorySlug === c.slug).length;
    });
    setCategories(cats);
    setProductCounts(counts);
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleDelete = async (id: string) => {
    await categoryService.deleteCategory(id);
    await loadData();
    setConfirmDelete(null);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-playfair text-2xl sm:text-3xl text-[var(--text-primary)]">Categories</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">{categories.length} categories</p>
        </div>
        <Link href="/admin/categories/add" className="btn-primary text-sm py-2.5 px-5">
          <Plus size={15} /> Add Category
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="py-20 text-center">
          <Layers size={48} className="mx-auto text-[#EDE6DA] mb-3" />
          <p className="text-[var(--text-secondary)]">No categories yet. Add one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {categories.map((cat) => (
              <motion.div
                key={cat.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[var(--surface)] rounded-2xl shadow-boutique overflow-hidden group"
              >
                <div className="relative h-40">
                  <Image src={getSafeImageSrc(cat.image)} alt={cat.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-3">
                    <p className="text-white font-playfair text-lg">{cat.name}</p>
                    <p className="text-white/70 text-xs">{productCounts[cat.slug] ?? 0} products</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-3">{cat.description}</p>
                  <div className="flex items-center justify-between">
                    <code className="text-xs text-[var(--text-secondary)] bg-[var(--background)] px-2 py-1 rounded">{cat.slug}</code>
                    <div className="flex gap-2">
                      <Link
                        href={`/category/${cat.slug}`}
                        target="_blank"
                        className="w-7 h-7 rounded-lg bg-[var(--background)] flex items-center justify-center hover:bg-[var(--soft-beige)] transition-colors"
                        title="View on site"
                      >
                        <ExternalLink size={12} className="text-[var(--text-secondary)]" />
                      </Link>
                      <Link
                        href={`/admin/categories/edit/${cat.id}`}
                        className="w-7 h-7 rounded-lg bg-[var(--background)] flex items-center justify-center hover:bg-[var(--soft-beige)] transition-colors"
                        title="Edit"
                      >
                        <Edit size={12} className="text-[var(--text-secondary)]" />
                      </Link>
                      <button
                        onClick={() => setConfirmDelete(cat.id)}
                        className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={12} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Delete confirm modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--surface)] rounded-2xl p-6 max-w-sm w-full shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-playfair text-lg text-[var(--text-primary)]">Delete Category?</h3>
                <button onClick={() => setConfirmDelete(null)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                  <X size={18} />
                </button>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-5">This category will be removed. Products inside it won't be deleted.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] text-sm text-[var(--text-secondary)] hover:bg-[var(--background)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => void handleDelete(confirmDelete)}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
