"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Edit, Trash2, Star, ChevronDown, X, Package } from "lucide-react";
import { getAllProducts, deleteProduct } from "@/lib/adminStore";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    setProducts(getAllProducts());
  }, []);

  const uniqueCategories = Array.from(new Set(products.map((p) => p.category)));

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !catFilter || p.category === catFilter;
    return matchSearch && matchCat;
  });

  const handleDelete = (id: string) => {
    deleteProduct(id);
    setProducts(getAllProducts());
    setConfirmDelete(null);
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-3xl text-[#2E2E2E]">Products</h1>
          <p className="text-[#6B6B6B] text-sm mt-1">{products.length} total products</p>
        </div>
        <Link href="/admin/products/add" className="btn-primary text-sm py-2.5 px-5">
          <Plus size={15} /> Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B8B7A]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#EDE6DA] text-sm bg-white focus:outline-none focus:border-[#C4A484]"
          />
        </div>
        <div className="relative">
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="pl-3 pr-8 py-2.5 rounded-xl border border-[#EDE6DA] text-sm bg-white focus:outline-none appearance-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {uniqueCategories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9B8B7A] pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-boutique overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-[#EDE6DA] text-xs uppercase tracking-widest text-[#9B8B7A] font-medium">
          <div className="col-span-5">Product</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2">Price</div>
          <div className="col-span-1">Stock</div>
          <div className="col-span-1">Rating</div>
          <div className="col-span-1">Actions</div>
        </div>

        <div className="divide-y divide-[#F6F2EA]">
          <AnimatePresence>
            {filtered.length === 0 ? (
              <div className="py-16 text-center">
                <Package size={40} className="mx-auto text-[#EDE6DA] mb-3" />
                <p className="text-[#9B8B7A] text-sm">No products found</p>
              </div>
            ) : (
              filtered.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-12 gap-4 px-5 py-3.5 items-center hover:bg-[#F6F2EA] transition-colors"
                >
                  <div className="col-span-5 flex gap-3 items-center">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#F6F2EA]">
                      <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#2E2E2E] truncate">{product.name}</p>
                      <p className="text-xs text-[#9B8B7A] truncate">{product.slug}</p>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-[#F6F2EA] text-[#6B6B6B]">{product.category}</span>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-[#2E2E2E]">{formatPrice(product.price)}</p>
                    {product.comparePrice && <p className="text-xs text-[#9B8B7A] line-through">{formatPrice(product.comparePrice)}</p>}
                  </div>
                  <div className="col-span-1">
                    <span className={`text-xs font-medium ${product.stock === 0 ? "text-red-400" : product.stock <= 5 ? "text-orange-400" : "text-green-500"}`}>
                      {product.stock}
                    </span>
                  </div>
                  <div className="col-span-1">
                    {product.rating ? (
                      <div className="flex items-center gap-1 text-xs text-[#6B6B6B]">
                        <Star size={11} fill="#F5A623" className="text-[#F5A623]" />
                        {product.rating}
                      </div>
                    ) : <span className="text-xs text-[#D8CFC5]">–</span>}
                  </div>
                  <div className="col-span-1 flex gap-1">
                    <Link
                      href={`/admin/products/edit/${product.id}`}
                      className="w-7 h-7 rounded-lg bg-[#F6F2EA] flex items-center justify-center hover:bg-[#EDE6DA] transition-colors"
                    >
                      <Edit size={12} className="text-[#6B6B6B]" />
                    </Link>
                    <button
                      onClick={() => setConfirmDelete(product.id)}
                      className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={12} className="text-red-400" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

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
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-playfair text-lg text-[#2E2E2E]">Delete Product?</h3>
                <button onClick={() => setConfirmDelete(null)} className="text-[#9B8B7A] hover:text-[#2E2E2E]">
                  <X size={18} />
                </button>
              </div>
              <p className="text-sm text-[#6B6B6B] mb-5">This product will be removed from the store. This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#EDE6DA] text-sm text-[#6B6B6B] hover:bg-[#F6F2EA] transition-colors">
                  Cancel
                </button>
                <button onClick={() => handleDelete(confirmDelete)}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">
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
