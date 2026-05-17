"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, ChevronLeft, ChevronRight, Star, Check, Minus, Plus } from "lucide-react";
import { productService } from "@/services/productService";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatPrice } from "@/lib/utils";
import ProductCard from "@/components/ui/ProductCard";
import { ProductDetailSkeleton } from "@/components/ui/Skeletons";
import Breadcrumb from "@/components/ui/Breadcrumb";
import CommentSection from "@/components/ui/CommentSection";
import { reviews as allReviews } from "@/data/reviews";

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [addedSnap, setAddedSnap] = useState(false);
  const { addItem } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    productService.getProductBySlug(slug).then(async (p) => {
      setProduct(p);
      if (p) {
        const rel = await productService.getRelatedProducts(p);
        setRelated(rel);
      }
      setLoading(false);
    });
    setImgIdx(0);
    setQty(1);
    setSelectedVariants({});
  }, [slug]);

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;
    addItem(product, qty, selectedVariants);
    setAddedSnap(true);
    setTimeout(() => setAddedSnap(false), 2000);
  };

  const productReviews = allReviews.filter((r) =>
    product ? r.productReference === product.name : false
  );

  if (loading) return <ProductDetailSkeleton />;
  if (!product) return (
    <div className="pt-32 text-center py-20">
      <p className="font-playfair text-2xl text-[#2E2E2E] mb-4">Product not found</p>
      <Link href="/shop" className="btn-primary">Back to Shop</Link>
    </div>
  );

  const images = product.images;
  const wishlisted = isWishlisted(product.id);
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <div className="bg-boutique min-h-screen pt-20">
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
              className="relative aspect-square rounded-3xl overflow-hidden bg-white shadow-boutique"
            >
              <Image
                src={images[imgIdx]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow hover:scale-110 transition-transform"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setImgIdx((i) => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow hover:scale-110 transition-transform"
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
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      i === imgIdx ? "border-[#C4A484]" : "border-transparent opacity-60"
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
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
              <p className="text-xs uppercase tracking-wider text-[#C4A484] mb-2">{product.category}</p>
              <h1 className="font-playfair text-3xl md:text-4xl text-[#2E2E2E] font-medium leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={16} fill={s <= Math.round(product.rating!) ? "#F5A623" : "#E8E0D5"} className={s <= Math.round(product.rating!) ? "star-filled" : "star-empty"} />
                  ))}
                </div>
                <span className="text-sm text-[#6B6B6B]">{product.rating} ({product.reviewCount} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-playfair text-3xl text-[#2E2E2E]">{formatPrice(product.price)}</span>
              {product.comparePrice && (
                <span className="text-lg text-[#9B8B7A] line-through">{formatPrice(product.comparePrice)}</span>
              )}
            </div>

            {/* Description */}
            <p className="text-[#6B6B6B] leading-relaxed">{product.description}</p>

            {/* Variants */}
            {product.variants?.map((variant) => (
              <div key={variant.id}>
                <p className="text-sm font-medium text-[#2E2E2E] mb-2">{variant.name}</p>
                <div className="flex flex-wrap gap-2">
                  {variant.options.map((opt) => (
                    <button
                      key={opt.id}
                      disabled={opt.stock === 0}
                      onClick={() => setSelectedVariants((prev) => ({ ...prev, [variant.name]: opt.label }))}
                      className={`px-4 py-2 rounded-xl text-sm border-2 transition-all ${
                        selectedVariants[variant.name] === opt.label
                          ? "border-[#C4A484] bg-[#F6F2EA] text-[#C4A484] font-medium"
                          : "border-[#EDE6DA] text-[#6B6B6B] hover:border-[#C4A484]"
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
              <p className="text-sm font-medium text-[#2E2E2E] mb-2">Quantity</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-0 bg-white rounded-xl border border-[#EDE6DA] overflow-hidden">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-10 h-10 flex items-center justify-center text-[#6B6B6B] hover:bg-[#F6F2EA] transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-12 text-center text-sm font-medium text-[#2E2E2E]">{qty}</span>
                  <button
                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                    className="w-10 h-10 flex items-center justify-center text-[#6B6B6B] hover:bg-[#F6F2EA] transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <span className="text-xs text-[#9B8B7A]">
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
                    ? "border-[#E8A0B0] bg-[#FAE8ED]"
                    : "border-[#EDE6DA] bg-white hover:border-[#E8A0B0]"
                }`}
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart
                  size={20}
                  fill={wishlisted ? "#E8A0B0" : "none"}
                  className={wishlisted ? "text-[#E8A0B0]" : "text-[#6B6B6B]"}
                />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {["Handmade", "Premium Yarn", "Gift Ready"].map((feat) => (
                <div key={feat} className="text-center p-3 rounded-xl bg-white border border-[#EDE6DA]">
                  <p className="text-xs text-[#6B6B6B]">{feat}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Product Reviews */}
        <section className="mt-20">
          <h2 className="font-playfair text-2xl text-[#2E2E2E] mb-6">Customer Reviews</h2>
          {productReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {productReviews.map((review) => (
                <div key={review.id} className="bg-white rounded-2xl p-5 shadow-boutique">
                  <div className="flex gap-1 mb-3">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} size={13} fill={s <= review.rating ? "#F5A623" : "#E8E0D5"} className={s <= review.rating ? "star-filled" : "star-empty"} />
                    ))}
                  </div>
                  <p className="text-sm text-[#6B6B6B] italic mb-3">"{review.reviewText}"</p>
                  <p className="text-xs font-semibold text-[#2E2E2E]">{review.customerName}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center shadow-boutique">
              <p className="text-[#6B6B6B] text-sm mb-2">No reviews yet for this product.</p>
              <p className="text-xs text-[#9B8B7A]">Be the first to review after purchasing!</p>
            </div>
          )}
        </section>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="font-playfair text-2xl text-[#2E2E2E] dark:text-[#F0EBE3] mb-6">You Might Also Love</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {/* Comment Section */}
        <CommentSection productId={product.id} />
      </div>
    </div>
  );
}
