"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Upload, X, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getAllSliders, updateSlider } from "@/lib/adminStore";

interface SliderForm {
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
  image: File | null;
  existingImage: string;
}

export default function EditSliderPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [form, setForm] = useState<SliderForm>({
    title: "",
    subtitle: "",
    description: "",
    ctaText: "",
    ctaLink: "",
    isActive: true,
    image: null,
    existingImage: "",
  });

  useEffect(() => {
    const sliders = getAllSliders();
    const slide = sliders.find((s) => s.id === id);
    if (!slide) { setNotFound(true); return; }
    setForm({
      title: slide.title,
      subtitle: slide.subtitle,
      description: slide.description,
      ctaText: slide.ctaText,
      ctaLink: slide.ctaLink,
      isActive: slide.isActive,
      image: null,
      existingImage: slide.image,
    });
    setImagePreview(slide.image);
  }, [id]);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((p) => ({ ...p, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setForm((p) => ({ ...p, image: null }));
    setImagePreview(form.existingImage || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let imageUrl = form.existingImage;
    if (form.image) {
      imageUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(form.image!);
      });
    }

    updateSlider(id, {
      title: form.title,
      subtitle: form.subtitle,
      description: form.description,
      ctaText: form.ctaText,
      ctaLink: form.ctaLink,
      isActive: form.isActive,
      image: imageUrl,
    });

    await new Promise((r) => setTimeout(r, 400));
    setSaved(true);
    setLoading(false);
    setTimeout(() => router.push("/admin/sliders"), 800);
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-[#EDE6DA] bg-white text-[#2E2E2E] text-sm focus:outline-none focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/20 transition-all placeholder:text-[#C4A484]/60";
  const labelClass =
    "block text-xs font-semibold uppercase tracking-widest text-[#4A3728] mb-1.5";

  if (notFound) {
    return (
      <div className="p-8 text-center">
        <p className="text-[#9B8B7A] mb-4">Slide not found.</p>
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
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[#EDE6DA] transition-colors"
        >
          <ArrowLeft size={18} className="text-[#6B6B6B]" />
        </Link>
        <div>
          <h1 className="font-playfair text-2xl text-[#2E2E2E]">Edit Slide</h1>
          <p className="text-xs text-[#9B8B7A] mt-0.5">Update this hero section slide</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Image */}
        <div className="bg-white rounded-2xl p-5 shadow-boutique">
          <label className={labelClass}>Slide Image</label>
          <div className="border-2 border-dashed border-[#EDE6DA] rounded-xl p-4 text-center hover:border-[#C4A484] transition-colors">
            {imagePreview ? (
              <div className="relative inline-block w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-40 w-full rounded-xl object-cover"
                />
                <label className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity rounded-xl cursor-pointer">
                  <span className="text-white text-xs font-medium flex items-center gap-1.5">
                    <Upload size={14} /> Change Image
                  </span>
                  <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                </label>
                {form.image && (
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow hover:bg-red-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ) : (
              <label className="cursor-pointer block">
                <Upload size={28} className="mx-auto text-[#C4A484] mb-2" />
                <p className="text-sm text-[#6B6B6B] font-medium">Upload slide image</p>
                <p className="text-xs text-[#9B8B7A] mt-1">Recommended: 1920×1080 JPG or PNG</p>
                <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
              </label>
            )}
          </div>
          <p className="text-xs text-[#9B8B7A] mt-2">Hover over the image and click to replace it.</p>
        </div>

        {/* Title & Subtitle */}
        <div className="bg-white rounded-2xl p-5 shadow-boutique space-y-4">
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
        <div className="bg-white rounded-2xl p-5 shadow-boutique">
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
        <div className="bg-white rounded-2xl p-5 shadow-boutique space-y-4">
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
        <div className="bg-white rounded-2xl p-5 shadow-boutique flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#2E2E2E]">Visible on site</p>
            <p className="text-xs text-[#9B8B7A] mt-0.5">Toggle to show or hide this slide in the hero section</p>
          </div>
          <button
            type="button"
            onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
            className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${form.isActive ? "bg-[#C4A484]" : "bg-[#EDE6DA]"}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${form.isActive ? "left-6" : "left-1"}`} />
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
