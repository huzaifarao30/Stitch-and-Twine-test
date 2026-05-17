"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Scissors, Sparkles, Heart, Award, ArrowRight, Star } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import CategoryCard from "@/components/ui/CategoryCard";
import { ProductCardSkeleton } from "@/components/ui/Skeletons";
import { Product, Category, Banner, Review } from "@/types";
import HeroSlider from "./HeroSlider";

// ==================== Featured Products ====================
export function FeaturedProductsSection({ products }: { products: Product[] }) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <p className="section-eyebrow mb-3">Handpicked for You</p>
        <h2 className="section-title mb-4">Featured Creations</h2>
        <p className="text-[#6B6B6B] max-w-md mx-auto text-sm leading-relaxed">
          Each piece is thoughtfully crafted by hand, using premium yarn and endless love. No two are exactly alike.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.length === 0
          ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center mt-12"
      >
        <Link href="/shop" className="btn-secondary inline-flex">
          View All Products <ArrowRight size={16} />
        </Link>
      </motion.div>
    </section>
  );
}

// ==================== Categories Section ====================
export function CategoriesSection({ categories }: { categories: Category[] }) {
  return (
    <section className="py-20" style={{ background: "#EDE6DA" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <p className="section-eyebrow mb-3">Browse By</p>
          <div className="flex items-end justify-between">
            <h2 className="section-title">Shop by Category</h2>
            <Link href="/shop" className="hidden sm:flex items-center gap-2 text-sm text-[#C4A484] hover:gap-3 transition-all">
              View all <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <CategoryCard key={cat.id} category={cat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== Editorial / About Section ====================
export function EditorialSection() {
  return (
    <section className="py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-3xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1481833761820-0509d3217039?w=800&q=80"
                alt="Handmade crochet crafting"
                fill
                className="object-cover"
              />
            </div>
            {/* Floating accent card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="absolute -bottom-8 -right-8 bg-white rounded-2xl shadow-boutique-lg p-5 max-w-[180px]"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {[1,2,3,4,5].map(s => <Star key={s} size={10} fill="#F5A623" className="star-filled" />)}
                </div>
              </div>
              <p className="font-playfair text-sm italic text-[#2E2E2E] leading-snug">
                "Every stitch is made with love"
              </p>
              <p className="text-xs text-[#C4A484] mt-2">— Our Promise</p>
            </motion.div>
            {/* Background blob */}
            <div className="absolute -top-8 -left-8 w-48 h-48 rounded-full opacity-30 blur-2xl -z-10"
              style={{ background: "radial-gradient(circle, #F2C4CE, #EDE6DA)" }} />
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            <p className="section-eyebrow">Our Story</p>
            <h2 className="section-title leading-tight">
              Crafted By Hand,<br />
              <span className="text-gradient-gold">Made With Heart</span>
            </h2>
            <div className="w-16 h-1 rounded-full" style={{ background: "linear-gradient(90deg, #F2C4CE, #C4A484)" }} />
            <p className="text-[#6B6B6B] leading-relaxed text-base">
              Stitch and Twine was born from a simple love of crochet. Every piece we create is a labor of love — each stitch placed carefully by hand using only the finest yarn.
            </p>
            <p className="text-[#6B6B6B] leading-relaxed text-base">
              We believe in the beauty of slow fashion and the magic of handmade things. When you hold one of our pieces, you're holding hours of care, creativity, and craftsmanship.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              {[
                { num: "500+", label: "Happy Customers" },
                { num: "50+", label: "Unique Designs" },
                { num: "100%", label: "Handmade" },
                { num: "5★", label: "Average Rating" },
              ].map((stat) => (
                <div key={stat.label} className="p-4 rounded-2xl bg-[#F6F2EA] border border-[#EDE6DA]">
                  <p className="font-playfair text-2xl text-[#C4A484]">{stat.num}</p>
                  <p className="text-xs text-[#6B6B6B] mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
            <Link href="/about" className="btn-primary inline-flex">
              Our Story <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ==================== Why Choose Us ====================
export function WhyChooseUsSection() {
  const points = [
    {
      icon: Scissors,
      title: "Handmade Craftsmanship",
      desc: "Each item is individually crafted by hand. No machines, no shortcuts — just pure artisanal skill and time.",
      color: "#F2C4CE",
    },
    {
      icon: Sparkles,
      title: "Premium Materials",
      desc: "We use only the finest, softest yarn — carefully selected for color vibrancy, texture, and durability.",
      color: "#C4A484",
    },
    {
      icon: Heart,
      title: "Made With Love",
      desc: "Every piece carries the warmth of the hands that made it. When you gift it, you gift something irreplaceable.",
      color: "#E8A0B0",
    },
    {
      icon: Award,
      title: "Unique Designs",
      desc: "From timeless classics to custom commissions — our designs are unlike anything you'll find in a store.",
      color: "#D4B896",
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: "linear-gradient(135deg, #F6F2EA, #FAE8ED)" }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="section-eyebrow mb-3">Why Choose Us</p>
          <h2 className="section-title">The Stitch & Twine Difference</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {points.map((point, i) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl p-6 shadow-boutique cursor-default"
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: `${point.color}30` }}>
                <point.icon size={22} style={{ color: point.color }} />
              </div>
              <h3 className="font-playfair text-lg font-medium text-[#2E2E2E] mb-2">{point.title}</h3>
              <p className="text-sm text-[#6B6B6B] leading-relaxed">{point.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== Reviews Section ====================
export function ReviewsSection({ reviews }: { reviews: Review[] }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const featured = reviews.filter((r) => r.isFeatured);

  useEffect(() => {
    if (featured.length <= 3) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % Math.ceil(featured.length / 3));
    }, 5000);
    return () => clearInterval(timer);
  }, [featured.length]);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: "#F6F2EA" }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="section-eyebrow mb-3">Customer Love</p>
          <h2 className="section-title">What Our Customers Say</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.slice(0, 6).map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -3 }}
              className="bg-white rounded-2xl p-6 shadow-boutique relative overflow-hidden"
            >
              {/* Decorative quote */}
              <div className="absolute -top-2 -right-2 text-7xl font-playfair text-[#F2C4CE] opacity-30 select-none">"</div>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={14}
                    fill={s <= review.rating ? "#F5A623" : "#E8E0D5"}
                    className={s <= review.rating ? "star-filled" : "star-empty"}
                  />
                ))}
              </div>

              {/* Review text */}
              <p className="text-sm text-[#6B6B6B] leading-relaxed mb-4 italic line-clamp-4">
                "{review.reviewText}"
              </p>

              {/* Product reference */}
              {review.productReference && (
                <p className="text-xs text-[#C4A484] mb-4">
                  — re: {review.productReference}
                </p>
              )}

              {/* Customer */}
              <div className="flex items-center gap-3">
                {review.customerAvatar && (
                  <div className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#F2C4CE]">
                    <Image src={review.customerAvatar} alt={review.customerName} fill className="object-cover" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-[#2E2E2E]">{review.customerName}</p>
                  <p className="text-xs text-[#9B8B7A]">Verified Customer</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {[
            { label: "Handmade Quality", emoji: "🧶" },
            { label: "Premium Yarn Materials", emoji: "✨" },
            { label: "Fast Delivery", emoji: "📦" },
            { label: "100% Satisfaction", emoji: "💖" },
          ].map((badge) => (
            <div key={badge.label} className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-boutique">
              <span className="text-xl">{badge.emoji}</span>
              <span className="text-xs font-medium text-[#2E2E2E]">{badge.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ==================== Instagram Section ====================
export function InstagramSection() {
  const images = [
    "https://images.unsplash.com/photo-1490750967868-88df5691cc3a?w=400&q=80",
    "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=400&q=80",
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80",
    "https://images.unsplash.com/photo-1596522354195-e84ae3496c8d?w=400&q=80",
    "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=400&q=80",
    "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80",
  ];

  return (
    <section className="py-20" style={{ background: "#EDE6DA" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="section-eyebrow mb-3">Follow Along</p>
          <h2 className="section-title mb-2">As Seen on Instagram</h2>
          <p className="text-[#6B6B6B] text-sm">@stichandtwine</p>
        </motion.div>

        <div className="instagram-strip">
          {images.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="relative w-48 h-48 flex-shrink-0 rounded-2xl overflow-hidden group cursor-pointer"
            >
              <Image src={img} alt={`Instagram ${i + 1}`} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium">View</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
