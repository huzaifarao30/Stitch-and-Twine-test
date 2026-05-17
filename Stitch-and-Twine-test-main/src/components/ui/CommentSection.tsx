"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { reviewService } from "@/services/reviewService";
import { useAuth } from "@/context/AuthContext";

/* ── Types ── */
interface Comment {
  id: string;
  name: string;
  message: string;
  rating: number;
  date: string;
  initials: string;
}

/* ── Star picker ── */
function StarPicker({ value, onChange }: { value: number; onChange: (r: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          aria-label={`Rate ${s} stars`}
        >
          <Star
            size={18}
            fill={(hover || value) >= s ? "#F5A623" : "none"}
            className={`transition-colors duration-100 ${(hover || value) >= s ? "text-[#F5A623]" : "text-[#D8CFC5]"}`}
          />
        </button>
      ))}
    </div>
  );
}

/* ── Individual comment card ── */
function CommentCard({ comment }: { comment: Comment }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      layout
      className="flex gap-4 rounded-2xl p-4"
      style={{ background: "var(--soft-beige)" }}
    >
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-semibold text-white"
        style={{ background: "linear-gradient(135deg, #E8A0B0, #C4A484)" }}
      >
        {comment.initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
          <span className="font-medium text-sm text-[var(--text-primary)]">{comment.name}</span>
          <span className="text-[10px] text-[var(--text-secondary)]">{comment.date}</span>
        </div>
        {comment.rating > 0 && (
          <div className="flex gap-0.5 mb-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={11}
                fill={comment.rating >= s ? "#F5A623" : "none"}
                className={comment.rating >= s ? "text-[#F5A623]" : "text-[#D8CFC5]"}
              />
            ))}
          </div>
        )}
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{comment.message}</p>
      </div>
    </motion.div>
  );
}

/* ── Main comment section ── */
export default function CommentSection({ productId }: { productId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const [form, setForm] = useState({ name: "", message: "", rating: 0 });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.name) {
      setForm((prev) => ({ ...prev, name: prev.name || user.name }));
    }
  }, [user?.name]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await reviewService.getProductReviews(productId, user?.id);
      setComments(
        data.map((r) => ({
          id: r.id,
          name: r.customerName,
          message: r.reviewText,
          rating: r.rating,
          date: new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          initials: r.customerName
            .split(" ")
            .map((w) => w[0]?.toUpperCase() ?? "")
            .slice(0, 2)
            .join(""),
        }))
      );
      setLoading(false);
    };

    void load();
  }, [productId, user?.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!user?.id) return;
    if (!form.name.trim() || !form.message.trim()) return;

    const initials = form.name
      .split(" ")
      .map((w) => w[0]?.toUpperCase() ?? "")
      .slice(0, 2)
      .join("");

    void reviewService
      .createReview({
        productId,
        userId: user.id,
        customerName: form.name.trim(),
        rating: form.rating || 5,
        reviewText: form.message.trim(),
      })
      .then((created) => {
        const newComment: Comment = {
          id: created.id,
          name: created.customerName,
          message: created.reviewText,
          rating: created.rating,
          date: new Date(created.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          initials,
        };

        setComments((prev) => [newComment, ...prev]);
        setForm({ name: "", message: "", rating: 0 });
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
      })
      .catch((err: unknown) => {
        const raw = err instanceof Error ? err.message : "Unable to post review.";
        setError(raw || "Unable to post review.");
      });
  };

  return (
    <section className="mt-16">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare size={20} className="text-[var(--accent-gold)]" />
        <h2 className="font-playfair text-2xl text-[var(--text-primary)] font-semibold">
          Customer Love ({comments.length})
        </h2>
      </div>

      {/* Comment form */}
      <form
        onSubmit={handleSubmit}
        className="bg-[var(--surface)] rounded-2xl p-5 mb-6 shadow-boutique space-y-4 border border-[var(--border-color)]"
      >
        <p className="text-sm font-medium text-[var(--text-primary)]">Leave a review</p>

        {!user?.id && (
          <p className="text-xs text-[var(--text-secondary)]">Please log in to post a review.</p>
        )}
        {error && <p className="text-xs text-red-500">{error}</p>}

        <StarPicker value={form.rating} onChange={(r) => setForm((p) => ({ ...p, rating: r }))} />

        <input
          type="text"
          required
          disabled={!user?.id}
          placeholder="Your name"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          className="input-boutique"
        />
        <textarea
          required
          disabled={!user?.id}
          rows={3}
          placeholder="Share your thoughts about this product…"
          value={form.message}
          onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
          className="input-boutique resize-none"
        />

        <div className="flex items-center gap-3">
          <motion.button
            type="submit"
            disabled={!user?.id}
            className="btn-primary py-2.5 px-6 text-xs flex items-center gap-2"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Send size={13} />
            Post Review
          </motion.button>

          <AnimatePresence>
            {submitted && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-[#7BC67E] font-medium"
              >
                ✓ Review posted!
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </form>

      {/* Comments list */}
      <div className="space-y-3">
        {loading && <p className="text-xs text-[var(--text-secondary)]">Loading reviews...</p>}
        <AnimatePresence initial={false}>
          {comments.map((c) => (
            <CommentCard key={c.id} comment={c} />
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
