"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Save, ArrowLeft, Trash2, Upload, X } from "lucide-react";
import Link from "next/link";
import { categoryService } from "@/services/categoryService";
import { createClient } from "@/utils/supabase/client";

interface CatForm {
  name: string;
  slug: string;
  description: string;
}

const STORAGE_PUBLIC_PREFIX = "/storage/v1/object/public/product-images/";

function getStoragePathFromPublicUrl(url: string): string | null {
  if (!url) return null;
  const markerIdx = url.indexOf(STORAGE_PUBLIC_PREFIX);
  if (markerIdx === -1) return null;
  return url.slice(markerIdx + STORAGE_PUBLIC_PREFIX.length);
}

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageInputKey, setImageInputKey] = useState(0);
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [cat, setCat] = useState<CatForm>({
    name: "",
    slug: "",
    description: "",
  });

  useEffect(() => {
    void categoryService.getAdminCategoryById(id).then((existing) => {
      if (!existing) return;
      setCat({
        name: existing.name,
        slug: existing.slug,
        description: existing.description || "",
      });
      setExistingImageUrl(existing.image || "");
      setImagePreview(existing.image || null);
    });
  }, [id]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setCat((p) => ({
      ...p,
      name,
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
    setImageInputKey((k) => k + 1);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      return;
    }
    
    setLoading(true);
    await categoryService.deleteCategory(id);
    router.push("/admin/categories");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    if (!supabase) {
      setError("Supabase is not configured.");
      setLoading(false);
      return;
    }

    let finalImageUrl = existingImageUrl;
    let uploadedFilePath: string | null = null;

    if (imageFile) {
      const safeName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      uploadedFilePath = `categories/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(uploadedFilePath, imageFile, { upsert: false });

      if (uploadError) {
        setError(`Image upload failed: ${uploadError.message}`);
        setLoading(false);
        return;
      }

      const { data: publicData } = supabase.storage
        .from("product-images")
        .getPublicUrl(uploadedFilePath);

      finalImageUrl = publicData.publicUrl;
    }

    const updated = await categoryService.updateCategory(id, {
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      image: finalImageUrl,
    });

    if (!updated) {
      if (uploadedFilePath) {
        await supabase.storage.from("product-images").remove([uploadedFilePath]);
      }
      setError("Failed to update category. Please try again.");
      setLoading(false);
      return;
    }

    if (uploadedFilePath && existingImageUrl) {
      const oldPath = getStoragePathFromPublicUrl(existingImageUrl);
      if (oldPath && oldPath !== uploadedFilePath) {
        await supabase.storage.from("product-images").remove([oldPath]);
      }
    }

    setSaved(true);
    setLoading(false);
    setTimeout(() => router.push("/admin/categories"), 800);
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-gold)] focus:ring-2 focus:ring-[#C4A484]/20 transition-all placeholder:text-[var(--accent-gold)]/60";
  const labelClass = "block text-xs font-semibold uppercase tracking-widest text-[#4A3728] mb-1.5";

  return (
    <div className="p-6 md:p-8 max-w-xl">
      <div className="flex items-center gap-3 mb-7">
        <Link href="/admin/categories"
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[var(--soft-beige)] transition-colors">
          <ArrowLeft size={18} className="text-[var(--text-secondary)]" />
        </Link>
        <div>
          <h1 className="font-playfair text-2xl text-[var(--text-primary)]">Edit Category</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Update category details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm">
            {error}
          </div>
        )}

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
                <input key={imageInputKey} id="cat-img" type="file" accept="image/*" onChange={handleImage} className="hidden" />
              </label>
            )}
          </div>
        </div>

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
              Slug <span className="text-[var(--text-secondary)] font-normal normal-case tracking-normal">(cannot be changed)</span>
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

        <div className="flex gap-3">
          <motion.button
            type="submit"
            disabled={loading || saved}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-medium text-sm transition-all disabled:opacity-70"
            style={{ background: saved ? "#5AB860" : "linear-gradient(135deg, #E8A0B0, #C4A484)" }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <Save size={16} />
            {loading ? "Saving…" : saved ? "Saved! Redirecting…" : "Update Category"}
          </motion.button>
          
          <motion.button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-6 py-4 rounded-2xl bg-red-500 text-white font-medium text-sm transition-all hover:bg-red-600 disabled:opacity-70 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <Trash2 size={16} />
            Delete
          </motion.button>
        </div>
      </form>
    </div>
  );
}
