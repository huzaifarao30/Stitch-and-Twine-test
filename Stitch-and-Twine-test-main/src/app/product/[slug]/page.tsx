"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, ShoppingBag, ChevronLeft, ChevronRight, Star, Check, Minus, Plus } from "lucide-react";
import { productService } from "@/services/productService";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useSales } from "@/context/SalesContext"; // --- SALES MODULE ---
import { formatPrice, calculateDiscountedPrice } from "@/lib/utils";
import ProductCard from "@/components/ui/ProductCard";
import { ProductDetailSkeleton } from "@/components/ui/Skeletons";
import Breadcrumb from "@/components/ui/Breadcrumb";
import CommentSection from "@/components/ui/CommentSection";
import { getSafeImageSrc } from "@/lib/utils";
import { subscribeContentUpdated } from "@/lib/clientRefreshBus";

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1);
  const [showAllImages, setShowAllImages] = useState(false);
  const [qty, setQty] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [addedSnap, setAddedSnap] = useState(false);
  const { addItem } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();
  const { activeSales } = useSales(); // --- SALES MODULE ---

  const loadProductData = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    const p = await productService.getProductBySlug(slug);
    setProduct(p);
    if (p) {
      const rel = await productService.getRelatedProducts(p);
      setRelated(rel);
    } else {
      setRelated([]);
    }
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    void loadProductData();
    setImgIdx(0);
    setSlideDirection(1);
    setShowAllImages(false);
    setQty(1);
    setSelectedVariants({});
  }, [loadProductData]);

  useEffect(() => {
    const unsubscribe = subscribeContentUpdated((kind) => {
      if (kind === "all" || kind === "products" || kind === "categories") {
        void loadProductData();
      }
    });

    return unsubscribe;
  }, [loadProductData]);

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;
    addItem(product, qty, selectedVariants);
    setAddedSnap(true);
    setTimeout(() => setAddedSnap(false), 2000);
  };

  if (loading) return <ProductDetailSkeleton />;
  if (!product) return (
    <div className="pt-32 text-center py-20">
      <p className="font-playfair text-2xl text-[var(--text-primary)] mb-4">Product not found</p>
      <Link href="/shop" className="btn-primary">Back to Shop</Link>
    </div>
  );

  const images = product.images;
  const wishlisted = isWishlisted(product.id);
  // --- SALES MODULE ---
  const saleInfo = calculateDiscountedPrice(product.price, activeSales, product.categorySlug);
  const comparePriceDiscount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;
  const discount = saleInfo.isOnSale ? Math.max(comparePriceDiscount, saleInfo.discountPercent) : comparePriceDiscount;
  const hasVisibleRating = Number(product.reviewCount || 0) > 0 && Number(product.rating || 0) > 0;

  const showPreviousImage = () => {
    setSlideDirection(-1);
    setImgIdx((i) => (i - 1 + images.length) % images.length);
  };

  const showNextImage = () => {
    setSlideDirection(1);
    setImgIdx((i) => (i + 1) % images.length);
  };

  const showImageByIndex = (index: number) => {
    setSlideDirection(index > imgIdx ? 1 : -1);
    setImgIdx(index);
  };

  return (
    <div className="bg-boutique min-h-screen pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Breadcrumb
          items={[
            { label: "Shop", href: "/shop" },
            { label: product.category, href: `/category/${product.categorySlug}` },
            { label: product.name },
          ]}
        />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-square rounded-3xl overflow-hidden bg-[var(--surface)] shadow-boutique"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`${images[imgIdx]}-${imgIdx}`}
                  initial={{ opacity: 0, x: slideDirection > 0 ? 32 : -32, scale: 0.98 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: slideDirection > 0 ? -32 : 32, scale: 0.98 }}
                  transition={{ duration: 0.32, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  <Image
                    src={getSafeImageSrc(images[imgIdx])}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
              {images.length > 1 && (
                <>
                  <button
                    onClick={showPreviousImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[var(--surface)]/90 flex items-center justify-center shadow hover:scale-110 transition-transform"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={showNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[var(--surface)]/90 flex items-center justify-center shadow hover:scale-110 transition-transform"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
              {discount > 0 && (
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-white text-xs font-semibold"
                  style={{ background: "linear-gradient(135deg, #E8A0B0, #F2C4CE)" }}>
                  -{discount}% OFF
                </div>
              )}
            </motion.div>

            {images.length > 1 && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowAllImages((v) => !v)}
                  className="text-xs text-[#7A6856] hover:text-[#4A3728] font-medium underline underline-offset-2"
                >
                  {showAllImages ? "Hide extra angles" : `Show more pictures (${images.length})`}
                </button>

                <AnimatePresence initial={false}>
                  {showAllImages && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -8, height: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="flex gap-2 mt-3">
                        {images.map((img, i) => (
                          <motion.button
                            key={i}
                            onClick={() => showImageByIndex(i)}
                            whileTap={{ scale: 0.95 }}
                            className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                              i === imgIdx ? "border-[var(--accent-gold)]" : "border-transparent opacity-60"
                            }`}
                          >
                            <Image src={getSafeImageSrc(img)} alt="" fill className="object-cover" />
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div>
              <p className="text-xs uppercase tracking-wider text-[var(--accent-gold)] mb-2">{product.category}</p>
              <h1 className="font-playfair text-3xl md:text-4xl text-[var(--text-primary)] font-medium leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            {hasVisibleRating && (
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={16} fill={s <= Math.round(product.rating!) ? "#F5A623" : "#E8E0D5"} className={s <= Math.round(product.rating!) ? "star-filled" : "star-empty"} />
                  ))}
                </div>
                <span className="text-sm text-[var(--text-secondary)]">{product.rating} ({product.reviewCount} reviews)</span>
              </div>
            )}

            {/* Price --- SALES MODULE updated --- */}
            <div className="flex items-baseline gap-3">
              {saleInfo.isOnSale ? (
                <>
                  <span className="font-playfair text-3xl text-[#ef4444]">{formatPrice(saleInfo.discountedPrice)}</span>
                  <span className="text-lg text-[var(--text-secondary)] line-through">{formatPrice(product.price)}</span>
                  <span className="text-sm font-semibold text-[#ef4444]">-{saleInfo.discountPercent}% OFF</span>
                </>
              ) : (
                <>
                  <span className="font-playfair text-3xl text-[var(--text-primary)]">{formatPrice(product.price)}</span>
                  {product.comparePrice && (
                    <span className="text-lg text-[var(--text-secondary)] line-through">{formatPrice(product.comparePrice)}</span>
                  )}
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-[var(--text-secondary)] leading-relaxed">{product.description}</p>

            {/* Variants */}
            {product.variants?.map((variant) => (
              <div key={variant.id}>
                <p className="text-sm font-medium text-[var(--text-primary)] mb-2">{variant.name}</p>
                <div className="flex flex-wrap gap-2">
                  {variant.options.map((opt) => (
                    <button
                      key={opt.id}
                      disabled={opt.stock === 0}
                      onClick={() => setSelectedVariants((prev) => ({ ...prev, [variant.name]: opt.label }))}
                      className={`px-4 py-2 rounded-xl text-sm border-2 transition-all ${
                        selectedVariants[variant.name] === opt.label
                          ? "border-[var(--accent-gold)] bg-[var(--background)] text-[var(--accent-gold)] font-medium"
                          : "border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-gold)]"
                      } ${opt.stock === 0 ? "opacity-40 cursor-not-allowed line-through" : ""}`}
                    >
                      {opt.label}
                      {opt.stock <= 3 && opt.stock > 0 && (
                        <span className="ml-1 text-xs text-orange-400">({opt.stock} left)</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Quantity */}
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)] mb-2">Quantity</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-0 bg-[var(--surface)] rounded-xl border border-[var(--border-color)] overflow-hidden">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-10 h-10 flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--background)] transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-12 text-center text-sm font-medium text-[var(--text-primary)]">{qty}</span>
                  <button
                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                    className="w-10 h-10 flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--background)] transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <span className="text-xs text-[var(--text-secondary)]">
                  {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-medium text-sm transition-all duration-300 ${
                  product.stock === 0
                    ? "opacity-40 cursor-not-allowed bg-gray-200 text-gray-500"
                    : addedSnap
                    ? "text-white"
                    : "btn-primary"
                }`}
                style={product.stock > 0 && !addedSnap ? {} : addedSnap ? { background: "linear-gradient(135deg, #7BC67E, #5AB860)" } : {}}
              >
                {addedSnap ? (
                  <><Check size={18} /> Added to Cart!</>
                ) : (
                  <><ShoppingBag size={18} /> Add to Cart</>
                )}
              </button>
              <button
                onClick={() => toggleItem(product)}
                className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 ${
                  wishlisted
                    ? "border-[var(--pink-medium)] bg-[var(--pink-light)]"
                    : "border-[var(--border-color)] bg-[var(--surface)] hover:border-[var(--pink-medium)]"
                }`}
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart
                  size={20}
                  fill={wishlisted ? "#E8A0B0" : "none"}
                  className={wishlisted ? "text-[var(--pink-medium)]" : "text-[var(--text-secondary)]"}
                />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {["Handmade", "Premium Yarn", "Gift Ready"].map((feat) => (
                <div key={feat} className="text-center p-3 rounded-xl bg-[var(--surface)] border border-[var(--border-color)]">
                  <p className="text-xs text-[var(--text-secondary)]">{feat}</p>
                </div>
              ))}
            </div>


          </motion.div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="font-playfair text-2xl text-[var(--text-primary)] dark:text-[#F0EBE3] mb-6">You Might Also Love</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {/* Comment Section */}
        <div data-comment-section>
          <CommentSection productId={product.id} />
        </div>
      </div>
    </div>
  );
}
