"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Trash2, Search } from "lucide-react";
import { reviewService, ProductReview } from "@/services/reviewService";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    setLoading(true);
    const data = await reviewService.getAdminReviews(200);
    setReviews(data);
    setLoading(false);
  };

  useEffect(() => {
    void loadReviews();
  }, []);

  const filtered = reviews.filter((r) => {
    const q = search.toLowerCase();
    return !q ||
      r.customerName.toLowerCase().includes(q) ||
      (r.productName || "").toLowerCase().includes(q) ||
      r.reviewText.toLowerCase().includes(q);
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    await reviewService.deleteReview(id);
    await loadReviews();
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="mb-6">
        <h1 className="font-playfair text-2xl sm:text-3xl text-[var(--text-primary)]">Reviews</h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">{reviews.length} total reviews</p>
      </div>

      <div className="relative mb-5 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search reviews..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--border-color)] text-sm bg-[var(--surface)] focus:outline-none focus:border-[var(--accent-gold)]"
        />
      </div>

      <div className="bg-[var(--surface)] rounded-2xl shadow-boutique overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-16 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-[var(--text-secondary)] text-sm">No reviews found.</div>
        ) : (
          <div className="divide-y divide-[#F6F2EA]">
            <AnimatePresence>
              {filtered.map((review) => (
                <motion.div
                  key={review.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-5 py-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{review.customerName}</p>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star key={idx} size={11} fill={idx < review.rating ? "#F5A623" : "none"} className={idx < review.rating ? "text-[#F5A623]" : "text-[#D8CFC5]"} />
                          ))}
                        </div>
                      </div>
                      {review.productName && (
                        <p className="text-xs text-[var(--text-secondary)] mb-1">Product: {review.productName}</p>
                      )}
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{review.reviewText}</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">{new Date(review.createdAt).toLocaleString()}</p>
                    </div>

                    <button
                      onClick={() => void handleDelete(review.id)}
                      className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors"
                      title="Delete review"
                    >
                      <Trash2 size={13} className="text-red-400" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
