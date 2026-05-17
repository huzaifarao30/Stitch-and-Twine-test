"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Upload, X, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { addProduct } from "@/lib/adminStore";

const CATEGORIES = [
  { label: "Bouquets", value: "bouquets" },
  { label: "Bags", value: "bags" },
  { label: "Gajry", value: "gajry" },
  { label: "Keycharms", value: "keycharms" },
  { label: "Flowers", value: "flowers" },
  { label: "Accessories", value: "accessories" },
];

interface ProductForm {
  name: string;
  description: string;
  price: string;
  comparePrice: string;
  category: string;
  stock: string;
  image: File | null;
}

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [product, setProduct] = useState<ProductForm>({
    name: "",
    description: "",
    price: "",
    comparePrice: "",
    category: "",
    stock: "",
    image: null,
  });

  const handleChange = (key: keyof ProductForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setProduct((p) => ({ ...p, [key]: e.target.value }));

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProduct((p) => ({ ...p, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setProduct((p) => ({ ...p, image: null }));
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Save to localStorage store
    addProduct({
      name: product.name,
      description: product.description,
      price: Number(product.price),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : undefined,
      category: CATEGORIES.find((c) => c.value === product.category)?.label ?? product.category,
      categorySlug: product.category,
      stock: Number(product.stock),
      images: ["/products/bouquets/bouquet1.jpeg"], // placeholder; admin can update via file
      tags: [],
    });
    await new Promise((r) => setTimeout(r, 400));
    setSaved(true);
    setLoading(false);
    setTimeout(() => router.push("/admin/products"), 800);
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-[#EDE6DA] bg-white text-[#2E2E2E] text-sm focus:outline-none focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/20 transition-all placeholder:text-[#C4A484]/60";
  const labelClass = "block text-xs font-semibold uppercase tracking-widest text-[#4A3728] mb-1.5";

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <Link href="/admin/products"
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[#EDE6DA] transition-colors">
          <ArrowLeft size={18} className="text-[#6B6B6B]" />
        </Link>
        <div>
          <h1 className="font-playfair text-2xl text-[#2E2E2E]">Add New Product</h1>
          <p className="text-xs text-[#9B8B7A] mt-0.5">Fill in all details then save</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Image Upload */}
        <div className="bg-white rounded-2xl p-5 shadow-boutique">
          <label className={labelClass}>Product Image *</label>
          <div className="border-2 border-dashed border-[#EDE6DA] rounded-xl p-6 text-center hover:border-[#C4A484] transition-colors">
            {imagePreview ? (
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Preview" className="h-40 rounded-xl object-cover" />
                <button type="button" onClick={clearImage}
                  className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow hover:bg-red-600 transition-colors">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <Upload size={32} className="mx-auto text-[#C4A484] mb-2" />
                <p className="text-sm text-[#6B6B6B] font-medium">Click to upload product photo</p>
                <p className="text-xs text-[#9B8B7A] mt-1">JPG, JPEG, PNG · Max 5MB</p>
                <input id="product-img" type="file" accept="image/*" onChange={handleImage} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* Name & Category */}
        <div className="bg-white rounded-2xl p-5 shadow-boutique space-y-4">
          <div>
            <label htmlFor="prod-name" className={labelClass}>Product Name *</label>
            <input
              id="prod-name"
              type="text"
              required
              value={product.name}
              onChange={handleChange("name")}
              placeholder="e.g., Rose Crochet Bouquet"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="prod-cat" className={labelClass}>Category *</label>
            <select
              id="prod-cat"
              required
              value={product.category}
              onChange={handleChange("category")}
              className={inputClass}
            >
              <option value="" disabled>Select a category…</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Price, Compare Price, Stock */}
        <div className="bg-white rounded-2xl p-5 shadow-boutique">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="prod-price" className={labelClass}>Price (Rs) *</label>
              <input
                id="prod-price"
                type="number"
                required
                min="0"
                value={product.price}
                onChange={handleChange("price")}
                placeholder="1500"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="prod-compare" className={labelClass}>Compare Price <span className="normal-case font-normal text-[#9B8B7A] tracking-normal">(optional)</span></label>
              <input
                id="prod-compare"
                type="number"
                min="0"
                value={product.comparePrice}
                onChange={handleChange("comparePrice")}
                placeholder="2000"
                className={inputClass}
              />
              <p className="text-xs text-[#9B8B7A] mt-1">The original price — shown crossed out to display a discount. Leave blank if no discount.</p>
            </div>
            <div>
              <label htmlFor="prod-stock" className={labelClass}>Stock *</label>
              <input
                id="prod-stock"
                type="number"
                required
                min="0"
                value={product.stock}
                onChange={handleChange("stock")}
                placeholder="10"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl p-5 shadow-boutique">
          <label htmlFor="prod-desc" className={labelClass}>Description *</label>
          <textarea
            id="prod-desc"
            required
            rows={4}
            value={product.description}
            onChange={handleChange("description")}
            placeholder="Describe the product — materials, size, how it's made…"
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
          {loading ? "Saving…" : saved ? "Saved! Redirecting…" : "Save Product"}
        </motion.button>
      </form>
    </div>
  );
}
