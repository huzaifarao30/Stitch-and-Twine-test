"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Save, ArrowLeft, Upload, X } from "lucide-react";
import Link from "next/link";
import { categoryService } from "@/services/categoryService";
import { createClient } from "@/utils/supabase/client";

interface CatForm {
  name: string;
  slug: string;
  description: string;
}

export default function AddCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [cat, setCat] = useState<CatForm>({
    name: "",
    slug: "",
    description: "",
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setCat((p) => ({
      ...p,
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    }));
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const existingCategories = await categoryService.getAdminCategories();
    const slugTaken = existingCategories.some((c) => c.slug === cat.slug.trim().toLowerCase());
    if (slugTaken) {
      setError("This category slug already exists. Please choose a different category name.");
      setLoading(false);
      return;
    }

    if (!imageFile) {
      setError("Please select a category image.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setError("Supabase is not configured.");
      setLoading(false);
      return;
    }

    const safeName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const filePath = `categories/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, imageFile, { upsert: false });

    if (uploadError) {
      setError(`Image upload failed: ${uploadError.message}`);
      setLoading(false);
      return;
    }

    const { data: publicData } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    let created = null;
    try {
      created = await categoryService.createCategory({
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: publicData.publicUrl,
      });
    } catch (err) {
      await supabase.storage.from("product-images").remove([filePath]);
      setError(err instanceof Error ? `Failed to save category: ${err.message}` : "Failed to save category.");
      setLoading(false);
      return;
    }

    if (!created) {
      await supabase.storage.from("product-images").remove([filePath]);
      setError("Failed to save category. Check RLS policy for categories or try a different slug.");
      setLoading(false);
      return;
    }

    setSaved(true);
    setLoading(false);
    setTimeout(() => router.push("/admin/categories"), 800);
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-gold)] focus:ring-2 focus:ring-[#C4A484]/20 transition-all placeholder:text-[var(--accent-gold)]/60";
  const labelClass = "block text-xs font-semibold uppercase tracking-widest text-[#4A3728] mb-1.5";

  return (
    <div className="p-6 md:p-8 max-w-xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <Link href="/admin/categories"
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[var(--soft-beige)] transition-colors">
          <ArrowLeft size={18} className="text-[var(--text-secondary)]" />
        </Link>
        <div>
          <h1 className="font-playfair text-2xl text-[var(--text-primary)]">Add Category</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Create a new product category</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Image Upload */}
        <div className="bg-[var(--surface)] rounded-2xl p-5 shadow-boutique">
          <label className={labelClass}>Category Image *</label>
          <div className="border-2 border-dashed border-[var(--border-color)] rounded-xl p-6 text-center hover:border-[var(--accent-gold)] transition-colors">
            {imagePreview ? (
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Preview" className="h-32 rounded-xl object-cover" />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow hover:bg-red-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <Upload size={28} className="mx-auto text-[var(--accent-gold)] mb-2" />
                <p className="text-sm text-[var(--text-secondary)] font-medium">Upload category image</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">JPG, JPEG, PNG</p>
                <input id="cat-img" type="file" accept="image/*" onChange={handleImage} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* Name & Slug */}
        <div className="bg-[var(--surface)] rounded-2xl p-5 shadow-boutique space-y-4">
          <div>
            <label htmlFor="cat-name" className={labelClass}>Category Name *</label>
            <input
              id="cat-name"
              type="text"
              required
              value={cat.name}
              onChange={handleNameChange}
              placeholder="e.g., Flowers"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="cat-slug" className={labelClass}>
              Slug <span className="text-[var(--text-secondary)] font-normal normal-case tracking-normal">(auto-generated)</span>
            </label>
            <input
              id="cat-slug"
              type="text"
              readOnly
              value={cat.slug}
              className={`${inputClass} bg-[var(--background)] text-[var(--text-secondary)] cursor-not-allowed`}
            />
          </div>
        </div>

        {/* Description */}
        <div className="bg-[var(--surface)] rounded-2xl p-5 shadow-boutique">
          <label htmlFor="cat-desc" className={labelClass}>Description</label>
          <textarea
            id="cat-desc"
            rows={3}
            value={cat.description}
            onChange={(e) => setCat((p) => ({ ...p, description: e.target.value }))}
            placeholder="Short description of this category…"
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={loading || saved}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-medium text-sm transition-all disabled:opacity-70"
          style={{ background: saved ? "#5AB860" : "linear-gradient(135deg, #E8A0B0, #C4A484)" }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          <Save size={16} />
          {loading ? "Saving…" : saved ? "Saved! Redirecting…" : "Save Category"}
        </motion.button>
      </form>
    </div>
  );
}
