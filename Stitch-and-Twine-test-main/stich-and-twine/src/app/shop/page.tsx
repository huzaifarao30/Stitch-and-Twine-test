"use client";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Skeletons";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import { Product, Category } from "@/types";

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc">("newest");
  const [selectedCat, setSelectedCat] = useState<string>("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [search, setSearch] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const data = await productService.getProducts({
      categorySlug: selectedCat || undefined,
      sortBy,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      search: search || undefined,
    });
    setProducts(data);
    setLoading(false);
  }, [selectedCat, sortBy, priceRange, search]);

  useEffect(() => {
    categoryService.getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const clearFilters = () => {
    setSelectedCat("");
    setSortBy("newest");
    setPriceRange([0, 5000]);
    setSearch("");
  };

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
  ];

  return (
    <div className="bg-boutique min-h-screen pt-20">
      {/* Header */}
      <div className="bg-white border-b border-[#EDE6DA] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb items={[{ label: "Shop" }]} />
          <h1 className="font-playfair text-4xl text-[#2E2E2E] mt-4 mb-2">Shop All</h1>
          <p className="text-[#6B6B6B] text-sm">
            {loading ? "Loading..." : `${products.length} handcrafted items`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search + Sort bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search handmade treasures..."
              className="input-boutique pl-4 pr-10 w-full"
            />
          </div>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="input-boutique pr-8 appearance-none cursor-pointer"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B6B] pointer-events-none" />
          </div>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
              filterOpen ? "bg-[#EDE6DA] border-[#C4A484] text-[#2E2E2E]" : "bg-white border-[#EDE6DA] text-[#6B6B6B]"
            }`}
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>
        </div>

        {/* Filter Panel */}
        {filterOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl shadow-boutique p-6 mb-6 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-[#2E2E2E]">Filters</h3>
              <button onClick={clearFilters} className="text-xs text-[#C4A484] hover:underline">Clear all</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Category */}
              <div>
                <label className="text-xs uppercase tracking-widest text-[#9B8B7A] font-medium mb-3 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCat("")}
                    className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                      !selectedCat ? "bg-[#C4A484] text-white" : "bg-[#F6F2EA] text-[#6B6B6B] hover:bg-[#EDE6DA]"
                    }`}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => setSelectedCat(cat.slug)}
                      className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                        selectedCat === cat.slug
                          ? "bg-[#C4A484] text-white"
                          : "bg-[#F6F2EA] text-[#6B6B6B] hover:bg-[#EDE6DA]"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-xs uppercase tracking-widest text-[#9B8B7A] font-medium mb-3 block">
                  Price: PKR {priceRange[0]} — PKR {priceRange[1]}
                </label>
                <input
                  type="range"
                  min={0}
                  max={5000}
                  step={100}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full accent-[#C4A484]"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Active filters */}
        {(selectedCat || search) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedCat && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAE8ED] text-[#E8A0B0] text-xs">
                {categories.find((c) => c.slug === selectedCat)?.name}
                <button onClick={() => setSelectedCat("")}><X size={10} /></button>
              </span>
            )}
            {search && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAE8ED] text-[#E8A0B0] text-xs">
                "{search}"
                <button onClick={() => setSearch("")}><X size={10} /></button>
              </span>
            )}
          </div>
        )}

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-6">🧶</div>
            <h3 className="font-playfair text-2xl text-[#2E2E2E] mb-3">No products found</h3>
            <p className="text-[#6B6B6B] text-sm mb-6">Try adjusting your filters or search terms</p>
            <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
