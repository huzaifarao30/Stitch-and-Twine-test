"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Save, ArrowLeft, Upload, X } from "lucide-react";
import Link from "next/link";
import { bannerService } from "@/services/bannerService";
import { createClient } from "@/utils/supabase/client";

interface SliderForm {
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
}

const STORAGE_PUBLIC_PREFIX = "/storage/v1/object/public/product-images/";

function getStoragePathFromPublicUrl(url: string): string | null {
  if (!url) return null;
  const markerIdx = url.indexOf(STORAGE_PUBLIC_PREFIX);
  if (markerIdx === -1) return null;
  return url.slice(markerIdx + STORAGE_PUBLIC_PREFIX.length);
}

export default function EditSliderPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageInputKey, setImageInputKey] = useState(0);
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [form, setForm] = useState<SliderForm>({
    title: "",
    subtitle: "",
    description: "",
    ctaText: "",
    ctaLink: "",
    isActive: true,
  });

  useEffect(() => {
    void bannerService.getAdminBannerById(id).then((slide) => {
      if (!slide) {
        setNotFound(true);
        return;
      }

      setForm({
        title: slide.title,
        subtitle: slide.subtitle,
        description: slide.description,
        ctaText: slide.ctaText,
        ctaLink: slide.ctaLink,
        isActive: slide.isActive,
      });
      setExistingImageUrl(slide.image);
      setImagePreview(slide.image || null);
    });
  }, [id]);

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
      uploadedFilePath = `sliders/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(uploadedFilePath, imageFile, { upsert: false });

      if (uploadError) {
        setError(`Image upload failed: ${uploadError.message}`);
        setLoading(false);
        return;
      }

      const { data: publicData } = supabase.storage.from("product-images").getPublicUrl(uploadedFilePath);
      finalImageUrl = publicData.publicUrl;
    }

    const updated = await bannerService.updateBanner(id, {
      title: form.title,
      subtitle: form.subtitle,
      description: form.description,
      ctaText: form.ctaText,
      ctaLink: form.ctaLink,
      isActive: form.isActive,
      image: finalImageUrl,
    });

    if (!updated) {
      if (uploadedFilePath) {
        await supabase.storage.from("product-images").remove([uploadedFilePath]);
      }
      setError("Failed to update slide. Please try again.");
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
    setTimeout(() => router.push("/admin/sliders"), 800);
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-gold)] focus:ring-2 focus:ring-[#C4A484]/20 transition-all placeholder:text-[var(--accent-gold)]/60";
  const labelClass =
    "block text-xs font-semibold uppercase tracking-widest text-[#4A3728] mb-1.5";

  if (notFound) {
    return (
      <div className="p-8 text-center">
        <p className="text-[var(--text-secondary)] mb-4">Slide not found.</p>
        <Link href="/admin/sliders" className="btn-primary text-sm py-2.5 px-5">
          Back to Sliders
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <Link
          href="/admin/sliders"
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[var(--soft-beige)] transition-colors"
        >
          <ArrowLeft size={18} className="text-[var(--text-secondary)]" />
        </Link>
        <div>
          <h1 className="font-playfair text-2xl text-[var(--text-primary)]">Edit Slide</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Update this hero section slide</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Image */}
        <div className="bg-[var(--surface)] rounded-2xl p-5 shadow-boutique">
          <label className={labelClass}>Slide Image *</label>
          <div className="border-2 border-dashed border-[var(--border-color)] rounded-xl p-6 text-center hover:border-[var(--accent-gold)] transition-colors">
            {imagePreview ? (
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Preview" className="h-40 rounded-xl object-cover" />
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
                <p className="text-sm text-[var(--text-secondary)] font-medium">Upload slide image</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">JPG, JPEG, PNG</p>
                <input key={imageInputKey} id="slide-img" type="file" accept="image/*" onChange={handleImage} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="bg-[var(--surface)] rounded-2xl p-5 shadow-boutique space-y-4">
          <div>
            <label htmlFor="slide-title" className={labelClass}>Title *</label>
            <input
              id="slide-title"
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g., Handcrafted With Love"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="slide-subtitle" className={labelClass}>Subtitle</label>
            <input
              id="slide-subtitle"
              type="text"
              value={form.subtitle}
              onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
              placeholder="e.g., Every stitch tells a story"
              className={inputClass}
            />
          </div>
        </div>

        {/* Description */}
        <div className="bg-[var(--surface)] rounded-2xl p-5 shadow-boutique">
          <label htmlFor="slide-desc" className={labelClass}>Description</label>
          <textarea
            id="slide-desc"
            rows={3}
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="A brief description shown on the hero section…"
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* CTA */}
        <div className="bg-[var(--surface)] rounded-2xl p-5 shadow-boutique space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#4A3728]">Call to Action Button</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="slide-cta-text" className={labelClass}>Button Text *</label>
              <input
                id="slide-cta-text"
                type="text"
                required
                value={form.ctaText}
                onChange={(e) => setForm((p) => ({ ...p, ctaText: e.target.value }))}
                placeholder="Shop Now"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="slide-cta-link" className={labelClass}>Button Link *</label>
              <input
                id="slide-cta-link"
                type="text"
                required
                value={form.ctaLink}
                onChange={(e) => setForm((p) => ({ ...p, ctaLink: e.target.value }))}
                placeholder="/shop"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Active toggle */}
        <div className="bg-[var(--surface)] rounded-2xl p-5 shadow-boutique flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">Visible on site</p>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Toggle to show or hide this slide in the hero section</p>
          </div>
          <button
            type="button"
            onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
            className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${form.isActive ? "bg-[#C4A484]" : "bg-[var(--soft-beige)]"}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-[var(--surface)] rounded-full shadow transition-all duration-300 ${form.isActive ? "left-6" : "left-1"}`} />
          </button>
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
          {loading ? "Saving…" : saved ? "Saved! Redirecting…" : "Update Slide"}
        </motion.button>
      </form>
    </div>
  );
}
