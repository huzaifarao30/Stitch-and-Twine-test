"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2, Lock } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatPrice, getSafeImageSrc } from "@/lib/utils";
import AuthModal from "@/components/AuthModal";
import { showToast } from "@/lib/toastBus";

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, adminUser, loading: authLoading } = useAuth();

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
    showToast("Moved to cart", "success");
  };

  const openAuthModal = () => {
    setAuthModalOpen(true);
  };

  if (authLoading) {
    return (
      <div className="bg-boutique min-h-screen pt-6 pb-16">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-pulse text-[var(--text-secondary)] text-sm">Checking your session...</div>
        </div>
      </div>
    );
  }

  if (adminUser) {
    return (
      <div className="bg-boutique min-h-screen pt-6 pb-16">
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <Lock className="mx-auto mb-4 text-pink-500" size={48} />
            <h1 className="text-2xl font-semibold mb-2">Admin account cannot use wishlist</h1>
            <p className="text-[var(--text-secondary)] text-sm mb-5">
              For customer actions like wishlist and orders, please sign in with a customer account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show auth gate if not logged in
  if (!user) {
    return (
      <div className="bg-boutique min-h-screen pt-6 pb-16">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <Lock className="mx-auto mb-4 text-pink-500" size={48} />
            <h1 className="text-2xl font-semibold mb-2">Sign in to view your Wishlist</h1>
            <button 
              onClick={openAuthModal}
              className="px-8 py-3.5 rounded-full text-white font-semibold text-sm transition-all duration-200 hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #E8A0B0, #C4A484)" }}
            >
              Sign In
            </button>
          </div>
        </div>
        <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      </div>
    );
  }

  return (
    <div className="bg-boutique min-h-screen pt-6 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-10">
          <p className="section-eyebrow mb-2">Saved for Later</p>
          <h1 className="font-playfair text-4xl text-[var(--text-primary)]">My Wishlist</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-2">{items.length} item{items.length !== 1 ? "s" : ""} saved</p>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <div className="w-24 h-24 rounded-full bg-[var(--pink-light)] flex items-center justify-center">
              <Heart size={36} className="text-[var(--pink-medium)] opacity-60" />
            </div>
            <div className="text-center">
              <h2 className="font-playfair text-2xl text-[var(--text-primary)] mb-2">No saved items yet</h2>
              <p className="text-[var(--text-secondary)] text-sm mb-1">Heart the items you love to save them here</p>
              <p className="text-[var(--text-secondary)] text-xs">Your favourites stay handy so checkout is faster later.</p>
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
                className="bg-[var(--surface)] rounded-2xl overflow-hidden shadow-boutique group"
              >
                <div className="relative aspect-square">
                  <Image src={getSafeImageSrc(item.image)} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <button
                    onClick={() => {
                      removeItem(item.productId);
                      showToast("Removed from wishlist", "info");
                    }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[var(--surface)]/90 flex items-center justify-center shadow hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={13} className="text-red-400" />
                  </button>
                </div>
                <div className="p-4">
                  <Link href={`/product/${item.slug}`} className="block text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-gold)] transition-colors mb-1">
                    {item.name}
                  </Link>
                  <p className="font-semibold text-[var(--text-primary)] mb-3">{formatPrice(item.price)}</p>
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
