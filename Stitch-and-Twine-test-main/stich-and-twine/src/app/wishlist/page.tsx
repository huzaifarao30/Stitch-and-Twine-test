"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();

  const handleMoveToCart = (item: typeof items[0]) => {
    addItem({
      id: item.productId,
      name: item.name,
      price: item.price,
      images: [item.image],
      slug: item.slug,
      stock: 99,
    } as any);
    removeItem(item.productId);
  };

  return (
    <div className="bg-boutique min-h-screen pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-10">
          <p className="section-eyebrow mb-2">Saved for Later</p>
          <h1 className="font-playfair text-4xl text-[#2E2E2E]">My Wishlist</h1>
          <p className="text-[#6B6B6B] text-sm mt-2">{items.length} item{items.length !== 1 ? "s" : ""} saved</p>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <div className="w-24 h-24 rounded-full bg-[#FAE8ED] flex items-center justify-center">
              <Heart size={36} className="text-[#E8A0B0] opacity-60" />
            </div>
            <div className="text-center">
              <h2 className="font-playfair text-2xl text-[#2E2E2E] mb-2">No saved items yet</h2>
              <p className="text-[#6B6B6B] text-sm">Heart the items you love to save them here</p>
            </div>
            <Link href="/shop" className="btn-pink">
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-2xl overflow-hidden shadow-boutique group"
              >
                <div className="relative aspect-square">
                  <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={13} className="text-red-400" />
                  </button>
                </div>
                <div className="p-4">
                  <Link href={`/product/${item.slug}`} className="block text-sm font-medium text-[#2E2E2E] hover:text-[#C4A484] transition-colors mb-1">
                    {item.name}
                  </Link>
                  <p className="font-semibold text-[#2E2E2E] mb-3">{formatPrice(item.price)}</p>
                  <button
                    onClick={() => handleMoveToCart(item)}
                    className="btn-primary w-full justify-center text-xs py-2.5"
                  >
                    <ShoppingBag size={14} /> Add to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
