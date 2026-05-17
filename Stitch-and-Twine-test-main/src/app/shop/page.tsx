"use client";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Skeletons";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import { subscribeContentUpdated } from "@/lib/clientRefreshBus";
import { Product, Category } from "@/types";

const DEFAULT_MIN_PRICE = 0;
const FALLBACK_MAX_PRICE = 5000;

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc">("newest");
  const [selectedCat, setSelectedCat] = useState<string>("");
  const [priceBounds, setPriceBounds] = useState<[number, number]>([DEFAULT_MIN_PRICE, FALLBACK_MAX_PRICE]);
  const [priceRange, setPriceRange] = useState<[number, number]>([DEFAULT_MIN_PRICE, FALLBACK_MAX_PRICE]);
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
    let isMounted = true;

    const loadPriceBounds = async () => {
      const allProducts = await productService.getProducts();
      const highestPrice = allProducts.reduce((max, product) => Math.max(max, product.price), FALLBACK_MAX_PRICE);
      const roundedMax = Math.max(FALLBACK_MAX_PRICE, Math.ceil(highestPrice / 100) * 100);

      if (!isMounted) return;

      setPriceBounds([DEFAULT_MIN_PRICE, roundedMax]);
      setPriceRange((prev) => {
        const nextMin = Math.max(DEFAULT_MIN_PRICE, Math.min(prev[0], roundedMax));
        const nextMax = Math.max(nextMin, Math.min(prev[1], roundedMax));
        return [nextMin, nextMax];
      });
    };

    loadPriceBounds();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    const unsubscribe = subscribeContentUpdated((kind) => {
      if (kind === "all" || kind === "products") {
        void loadProducts();
      }
      if (kind === "all" || kind === "categories") {
        void categoryService.getCategories().then(setCategories);
      }
    });

    return unsubscribe;
  }, [loadProducts]);

  const clearFilters = () => {
    setSelectedCat("");
    setSortBy("newest");
    setPriceRange([priceBounds[0], priceBounds[1]]);
    setSearch("");
  };

  const handleMinPriceChange = (value: number) => {
    const safeMin = Math.max(priceBounds[0], Math.min(value, priceRange[1]));
    setPriceRange([safeMin, priceRange[1]]);
  };

  const handleMaxPriceChange = (value: number) => {
    const safeMax = Math.min(priceBounds[1], Math.max(value, priceRange[0]));
    setPriceRange([priceRange[0], safeMax]);
  };

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
  ];

  const hasPriceFilter = priceRange[0] > priceBounds[0] || priceRange[1] < priceBounds[1];
  const hasActiveFilters = Boolean(selectedCat || search || hasPriceFilter || sortBy !== "newest");

  return (
    <div className="bg-boutique min-h-screen pt-6">
      {/* Header */}
      <div className="bg-[var(--surface)] border-b border-[var(--border-color)] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb items={[{ label: "Shop" }]} />
          <h1 className="font-playfair text-4xl text-[var(--text-primary)] mt-4 mb-2">Shop All</h1>
          <p className="text-[var(--text-secondary)] text-sm">
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
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
          </div>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`flex items-center gap-2 px-4 py-3.5 sm:py-3 rounded-xl border text-sm font-medium transition-all min-h-[48px] ${
              filterOpen ? "bg-[var(--soft-beige)] border-[var(--accent-gold)] text-[var(--text-primary)]" : "bg-[var(--surface)] border-[var(--border-color)] text-[var(--text-secondary)]"
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
            className="bg-[var(--surface)] rounded-2xl shadow-boutique p-6 mb-6 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-[var(--text-primary)]">Filters</h3>
              <button onClick={clearFilters} className="text-xs text-[var(--accent-gold)] hover:underline">Clear all</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Category */}
              <div>
                <label className="text-xs uppercase tracking-widest text-[var(--text-secondary)] font-medium mb-3 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCat("")}
                    className={`px-3.5 py-2 sm:px-3 sm:py-1.5 rounded-full text-xs transition-all ${
                      !selectedCat ? "bg-[#C4A484] text-white" : "bg-[var(--background)] text-[var(--text-secondary)] hover:bg-[var(--soft-beige)]"
                    }`}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => setSelectedCat(cat.slug)}
                      className={`px-3.5 py-2 sm:px-3 sm:py-1.5 rounded-full text-xs transition-all ${
                        selectedCat === cat.slug
                          ? "bg-[#C4A484] text-white"
                          : "bg-[var(--background)] text-[var(--text-secondary)] hover:bg-[var(--soft-beige)]"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-xs uppercase tracking-widest text-[var(--text-secondary)] font-medium mb-3 block">
                  Price: PKR {priceRange[0]} — PKR {priceRange[1]}
                </label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <input
                    type="number"
                    min={priceBounds[0]}
                    max={priceRange[1]}
                    step={100}
                    value={priceRange[0]}
                    onChange={(e) => handleMinPriceChange(Number(e.target.value))}
                    className="input-boutique text-sm"
                    aria-label="Minimum price"
                  />
                  <input
                    type="number"
                    min={priceRange[0]}
                    max={priceBounds[1]}
                    step={100}
                    value={priceRange[1]}
                    onChange={(e) => handleMaxPriceChange(Number(e.target.value))}
                    className="input-boutique text-sm"
                    aria-label="Maximum price"
                  />
                </div>
                <div className="space-y-2">
                  <input
                    type="range"
                    min={priceBounds[0]}
                    max={priceBounds[1]}
                    step={100}
                    value={priceRange[0]}
                    onChange={(e) => handleMinPriceChange(Number(e.target.value))}
                    className="w-full accent-[#C4A484]"
                    aria-label="Minimum price slider"
                  />
                  <input
                    type="range"
                    min={priceBounds[0]}
                    max={priceBounds[1]}
                    step={100}
                    value={priceRange[1]}
                    onChange={(e) => handleMaxPriceChange(Number(e.target.value))}
                    className="w-full accent-[#C4A484]"
                    aria-label="Maximum price slider"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Active filters */}
        {hasActiveFilters && (
          <div className="sticky top-[88px] z-20 mb-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface)]/95 backdrop-blur-sm p-2.5 shadow-boutique">
            <div className="flex flex-wrap gap-2">
            {selectedCat && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--pink-light)] text-[var(--pink-medium)] text-xs">
                {categories.find((c) => c.slug === selectedCat)?.name}
                <button onClick={() => setSelectedCat("")}><X size={10} /></button>
              </span>
            )}
            {search && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--pink-light)] text-[var(--pink-medium)] text-xs">
                "{search}"
                <button onClick={() => setSearch("")}><X size={10} /></button>
              </span>
            )}
            {hasPriceFilter && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--background)] text-[var(--text-secondary)] text-xs">
                PKR {priceRange[0]} - PKR {priceRange[1]}
                <button onClick={() => setPriceRange([priceBounds[0], priceBounds[1]])}><X size={10} /></button>
              </span>
            )}
            {sortBy !== "newest" && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--background)] text-[var(--text-secondary)] text-xs">
                {sortOptions.find((s) => s.value === sortBy)?.label}
                <button onClick={() => setSortBy("newest")}><X size={10} /></button>
              </span>
            )}
            <button onClick={clearFilters} className="px-3 py-1 text-xs rounded-full border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--background)]">
              Clear all
            </button>
            </div>
          </div>
        )}

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 rounded-full bg-[var(--pink-light)] flex items-center justify-center mb-6 text-4xl">🧶</div>
            <h3 className="font-playfair text-2xl text-[var(--text-primary)] mb-3">No products found</h3>
            <p className="text-[var(--text-secondary)] text-sm mb-2">Try adjusting your filters or search terms</p>
            <p className="text-[var(--text-secondary)] text-xs mb-6">Tip: remove one filter at a time to discover more products.</p>
            <button onClick={clearFilters} className="btn-primary min-h-[46px]">Clear Filters</button>
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
