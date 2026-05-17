"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Upload, X, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { addCategory } from "@/lib/adminStore";

interface CatForm {
  name: string;
  slug: string;
  description: string;
  image: File | null;
}

export default function AddCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [cat, setCat] = useState<CatForm>({
    name: "",
    slug: "",
    description: "",
    image: null,
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
    setCat((p) => ({ ...p, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setCat((p) => ({ ...p, image: null }));
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    addCategory({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      image: "/products/bouquets/bouquet1.jpeg", // placeholder; can be improved with real upload
    });
    await new Promise((r) => setTimeout(r, 400));
    setSaved(true);
    setLoading(false);
    setTimeout(() => router.push("/admin/categories"), 800);
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-[#EDE6DA] bg-white text-[#2E2E2E] text-sm focus:outline-none focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/20 transition-all placeholder:text-[#C4A484]/60";
  const labelClass = "block text-xs font-semibold uppercase tracking-widest text-[#4A3728] mb-1.5";

  return (
    <div className="p-6 md:p-8 max-w-xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <Link href="/admin/categories"
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[#EDE6DA] transition-colors">
          <ArrowLeft size={18} className="text-[#6B6B6B]" />
        </Link>
        <div>
          <h1 className="font-playfair text-2xl text-[#2E2E2E]">Add Category</h1>
          <p className="text-xs text-[#9B8B7A] mt-0.5">Create a new product category</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Image Upload */}
        <div className="bg-white rounded-2xl p-5 shadow-boutique">
          <label className={labelClass}>Category Image *</label>
          <div className="border-2 border-dashed border-[#EDE6DA] rounded-xl p-6 text-center hover:border-[#C4A484] transition-colors">
            {imagePreview ? (
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Preview" className="h-32 rounded-xl object-cover" />
                <button type="button" onClick={clearImage}
                  className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow hover:bg-red-600 transition-colors">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <Upload size={28} className="mx-auto text-[#C4A484] mb-2" />
                <p className="text-sm text-[#6B6B6B] font-medium">Upload category image</p>
                <p className="text-xs text-[#9B8B7A] mt-1">JPG, JPEG, PNG</p>
                <input id="cat-img" type="file" accept="image/*" onChange={handleImage} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* Name & Slug */}
        <div className="bg-white rounded-2xl p-5 shadow-boutique space-y-4">
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
              Slug <span className="text-[#9B8B7A] font-normal normal-case tracking-normal">(auto-generated)</span>
            </label>
            <input
              id="cat-slug"
              type="text"
              readOnly
              value={cat.slug}
              className={`${inputClass} bg-[#F6F2EA] text-[#9B8B7A] cursor-not-allowed`}
            />
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl p-5 shadow-boutique">
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
