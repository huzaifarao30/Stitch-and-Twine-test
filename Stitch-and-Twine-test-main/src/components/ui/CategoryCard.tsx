"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Category } from "@/types";
import { getSafeImageSrc } from "@/lib/utils";

interface CategoryCardProps {
  category: Category;
  index?: number;
}

export default function CategoryCard({ category, index = 0 }: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <Link href={`/category/${category.slug}`}>
        <div className="category-card group aspect-[3/4] rounded-2xl overflow-hidden">
          {/* Image */}
          <div className="absolute inset-0">
            <Image
              src={getSafeImageSrc(category.image)}
              alt={category.name}
              fill
              className="category-image object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
            />
          </div>

          {/* Static gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Hover overlay */}
          <div className="category-overlay">
            <div className="text-center px-4">
              <p className="text-white font-playfair text-xl font-medium mb-2">{category.name}</p>
              <div className="w-8 h-px bg-[#C4A484] mx-auto mb-3" />
              <p className="text-white/80 text-xs line-clamp-2">{category.description}</p>
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/50 text-white text-xs hover:bg-[var(--surface)]/20 transition-colors">
                Explore <ArrowRight size={12} />
              </div>
            </div>
          </div>

          {/* Default name at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4 group-hover:opacity-0 transition-opacity duration-300">
            <p className="text-white font-playfair text-lg font-medium">{category.name}</p>
            {category.productCount !== undefined && (
              <p className="text-white/70 text-xs mt-0.5">{category.productCount} products</p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
