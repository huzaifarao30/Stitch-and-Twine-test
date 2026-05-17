"use client";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { Heart, ShoppingBag, Eye, Star, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  showQuickAdd?: boolean;
}

/* ── tiny floating particle for the cart pop ── */
function Particle({ angle, color }: { angle: number; color: string }) {
  const rad = (angle * Math.PI) / 180;
  return (
    <motion.span
      className="absolute inset-0 m-auto rounded-full pointer-events-none"
      style={{ width: 5, height: 5, background: color, top: 0, left: 0 }}
      initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      animate={{
        opacity: 0,
        x: Math.cos(rad) * 22,
        y: Math.sin(rad) * 22,
        scale: 0,
      }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    />
  );
}

const PARTICLE_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];
const PARTICLE_COLORS = ["#E8A0B0", "#F2C4CE", "#C4A484", "#FADADD", "#F9C784", "#E8C99E", "#B07D9E", "#FFB5C8"];

export default function ProductCard({ product, showQuickAdd = true }: ProductCardProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();
  const cardRef = useRef<HTMLDivElement>(null);

  const [heartPop, setHeartPop] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [cartParticles, setCartParticles] = useState(false);
  const wishlisted = isWishlisted(product.id);

  /* ── 3-D tilt via spring motion values ── */
  const rotateX = useSpring(useMotionValue(0), { stiffness: 260, damping: 24 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 260, damping: 24 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    rotateY.set(dx * 7);
    rotateX.set(-dy * 7);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
    setHeartPop(true);
    setTimeout(() => setHeartPop(false), 500);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setAddedToCart(true);
    setCartParticles(true);
    setTimeout(() => setCartParticles(false), 600);
    setTimeout(() => setAddedToCart(false), 1600);
  };

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <Link href={`/product/${product.slug}`}>
      <motion.div
        ref={cardRef}
        className="product-card group cursor-pointer"
        style={{ rotateX, rotateY }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
      >
        {/* ── Image Container ── */}
        <div className="relative aspect-square overflow-hidden rounded-t-2xl">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />

          {/* Subtle dark-to-transparent gradient at bottom for badge readability */}
          <div className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.18) 0%, transparent 100%)" }}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {discount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="px-2 py-1 text-xs font-semibold text-white rounded-full"
                style={{ background: "linear-gradient(135deg, #E8A0B0, #F2C4CE)" }}
              >
                -{discount}%
              </motion.span>
            )}
            {product.stock <= 5 && product.stock > 0 && (
              <span className="px-2 py-1 text-xs font-semibold text-white rounded-full bg-orange-400">
                Only {product.stock} left
              </span>
            )}
            {product.stock === 0 && (
              <span className="px-2 py-1 text-xs font-semibold text-white rounded-full bg-gray-400">
                Sold Out
              </span>
            )}
          </div>

          {/* Wishlist button — spring pop */}
          <motion.button
            onClick={handleWishlist}
            className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md"
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            whileTap={{ scale: 0.85 }}
            animate={heartPop ? { scale: [1, 1.45, 0.9, 1.15, 1] } : { scale: 1 }}
            transition={heartPop ? { duration: 0.45, ease: "easeInOut" } : { type: "spring", stiffness: 400, damping: 18 }}
          >
            <motion.div
              animate={heartPop ? { rotate: [-8, 8, -5, 5, 0] } : { rotate: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Heart
                size={15}
                fill={wishlisted ? "#E8A0B0" : "none"}
                className={`transition-colors duration-200 ${wishlisted ? "text-[#E8A0B0]" : "text-[#6B6B6B]"}`}
              />
            </motion.div>
          </motion.button>

          {/* Quick View pill — slides up on group hover */}
          <div className="absolute inset-0 z-10 flex items-end justify-center pb-5 pointer-events-none group-hover:pointer-events-auto">
            <motion.button
              type="button"
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/90 backdrop-blur-md text-xs font-semibold text-[#2E2E2E] shadow-lg border border-white/60
                opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0
                transition-all duration-300 ease-out"
              style={{ boxShadow: "0 4px 24px 0 rgba(232,160,176,0.3)" }}
              whileHover={{ scale: 1.07, boxShadow: "0 6px 30px 0 rgba(232,160,176,0.5)" }}
              whileTap={{ scale: 0.94 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push(`/product/${product.slug}`);
              }}
            >
              <Eye size={13} className="text-[#E8A0B0]" />
              Quick View
            </motion.button>
          </div>
        </div>

        {/* ── Info ── */}
        <div className="p-4">
          <p className="text-xs text-[#C4A484] uppercase tracking-wider mb-1">{product.category}</p>
          <h3 className="text-sm font-medium text-[#2E2E2E] line-clamp-2 mb-2 leading-snug">
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1 mb-3">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={10}
                    fill={star <= Math.round(product.rating!) ? "#F5A623" : "#E8E0D5"}
                    className={star <= Math.round(product.rating!) ? "star-filled" : "star-empty"}
                  />
                ))}
              </div>
              <span className="text-[10px] text-[#9B8B7A]">({product.reviewCount})</span>
            </div>
          )}

          {/* Price + Add to cart */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-base font-semibold text-[#2E2E2E]">{formatPrice(product.price)}</span>
              {product.comparePrice && (
                <span className="text-xs text-[#9B8B7A] line-through ml-2">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
            </div>

            {showQuickAdd && product.stock > 0 && (
              <div className="relative">
                {/* particle burst */}
                <AnimatePresence>
                  {cartParticles &&
                    PARTICLE_ANGLES.map((angle, i) => (
                      <Particle key={angle} angle={angle} color={PARTICLE_COLORS[i % PARTICLE_COLORS.length]} />
                    ))}
                </AnimatePresence>

                <motion.button
                  onClick={handleAddToCart}
                  className="relative w-9 h-9 rounded-full flex items-center justify-center overflow-hidden shadow-md"
                  style={{
                    background: addedToCart
                      ? "linear-gradient(135deg, #7BC67E, #5AB860)"
                      : "linear-gradient(135deg, #E8A0B0, #C4A484)",
                  }}
                  aria-label="Add to cart"
                  whileTap={{ scale: 0.8 }}
                  animate={
                    addedToCart
                      ? { scale: [1, 1.35, 0.9, 1.1, 1] }
                      : { scale: 1 }
                  }
                  transition={
                    addedToCart
                      ? { duration: 0.5, ease: "easeInOut" }
                      : { type: "spring", stiffness: 400, damping: 18 }
                  }
                >
                  <AnimatePresence mode="wait">
                    {addedToCart ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 20 }}
                      >
                        <Check size={14} className="text-white" strokeWidth={3} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="bag"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 20 }}
                      >
                        <ShoppingBag size={14} className="text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
