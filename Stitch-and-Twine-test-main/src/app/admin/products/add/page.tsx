"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Save, ArrowLeft, Upload, X } from "lucide-react";
import Link from "next/link";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import { slugify } from "@/lib/utils";
import { compressProductImage } from "@/lib/imageCompression";
import { createClient } from "@/utils/supabase/client";

interface ProductForm {
  name: string;
  slug: string;
  description: string;
  price: string;
  comparePrice: string;
  category: string;
  stock: string;
}

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [categories, setCategories] = useState<Array<{ label: string; value: string }>>([]);
  const [product, setProduct] = useState<ProductForm>({
    name: "",
    slug: "",
    description: "",
    price: "",
    comparePrice: "",
    category: "",
    stock: "",
  });

  useEffect(() => {
    void categoryService.getAdminCategories().then((cats) => {
      setCategories(cats.map((c) => ({ label: c.name, value: c.slug })));
    });
  }, []);

  const handleChange = (key: keyof ProductForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setProduct((p) => ({ ...p, [key]: e.target.value }));

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setProduct((p) => ({ ...p, name, slug: slugify(name) }));
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    setImageFiles((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...files.map((file) => URL.createObjectURL(file))]);
    e.target.value = "";
  };

  const clearImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!imageFiles.length) {
      setError("Please select at least one product image.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setError("Supabase is not configured.");
      setLoading(false);
      return;
    }

    const uploadedPaths: string[] = [];
    const imageUrls: string[] = [];

    for (const imageFile of imageFiles) {
      const compressedFile = await compressProductImage(imageFile);
      const safeName = compressedFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const filePath = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, compressedFile, { upsert: false });

      if (uploadError) {
        if (uploadedPaths.length) {
          await supabase.storage.from("product-images").remove(uploadedPaths);
        }
        setError(`Image upload failed: ${uploadError.message}`);
        setLoading(false);
        return;
      }

      const { data: publicData } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      uploadedPaths.push(filePath);
      imageUrls.push(publicData.publicUrl);
    }

    const selectedCategory = categories.find((c) => c.value === product.category);
    const created = await productService.createProduct({
      name: product.name,
      slug: product.slug || slugify(product.name),
      description: product.description,
      price: Number(product.price),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : undefined,
      category: selectedCategory?.label ?? product.category,
      categorySlug: product.category,
      stock: Number(product.stock),
      images: imageUrls,
      isActive: true,
      isFeature: false,
      tags: [],
    });

    if (!created) {
      if (uploadedPaths.length) {
        await supabase.storage.from("product-images").remove(uploadedPaths);
      }
      setError("Failed to save product. Please check your permissions and data.");
      setLoading(false);
      return;
    }

    setSaved(true);
    setLoading(false);
    setTimeout(() => router.push("/admin/products"), 800);
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-gold)] focus:ring-2 focus:ring-[#C4A484]/20 transition-all placeholder:text-[var(--accent-gold)]/60";
  const labelClass = "block text-xs font-semibold uppercase tracking-widest text-[#4A3728] mb-1.5";

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <Link href="/admin/products"
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[var(--soft-beige)] transition-colors">
          <ArrowLeft size={18} className="text-[var(--text-secondary)]" />
        </Link>
        <div>
          <h1 className="font-playfair text-2xl text-[var(--text-primary)]">Add New Product</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Fill in all details then save</p>
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
          <label className={labelClass}>Product Images *</label>
          <div className="border-2 border-dashed border-[var(--border-color)] rounded-xl p-6 text-center hover:border-[var(--accent-gold)] transition-colors">
            {imagePreviews.length > 0 ? (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={`${preview}-${index}`} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={preview} alt={`Preview ${index + 1}`} className="h-28 w-full rounded-xl object-cover" />
                      <button
                        type="button"
                        onClick={() => clearImage(index)}
                        className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow hover:bg-red-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <label className="cursor-pointer block">
                  <Upload size={24} className="mx-auto text-[var(--accent-gold)] mb-2" />
                  <p className="text-sm text-[var(--text-secondary)] font-medium">Add more product photos</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">You can upload multiple images for different angles</p>
                  <input id="product-img" type="file" accept="image/*" multiple onChange={handleImage} className="hidden" />
                </label>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <Upload size={32} className="mx-auto text-[var(--accent-gold)] mb-2" />
                <p className="text-sm text-[var(--text-secondary)] font-medium">Click to upload product photos</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">JPG, JPEG, PNG (multiple allowed)</p>
                <input id="product-img" type="file" accept="image/*" multiple onChange={handleImage} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* Name & Category */}
        <div className="bg-[var(--surface)] rounded-2xl p-5 shadow-boutique space-y-4">
          <div>
            <label htmlFor="prod-name" className={labelClass}>Product Name *</label>
            <input
              id="prod-name"
              type="text"
              required
              value={product.name}
              onChange={handleNameChange}
              placeholder="e.g., Rose Crochet Bouquet"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="prod-slug" className={labelClass}>Slug *</label>
            <input
              id="prod-slug"
              type="text"
              required
              value={product.slug}
              onChange={handleChange("slug")}
              placeholder="rose-crochet-bouquet"
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
              {categories.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Price, Compare Price, Stock */}
        <div className="bg-[var(--surface)] rounded-2xl p-5 shadow-boutique">
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
              <label htmlFor="prod-compare" className={labelClass}>Compare Price <span className="normal-case font-normal text-[var(--text-secondary)] tracking-normal">(optional)</span></label>
              <input
                id="prod-compare"
                type="number"
                min="0"
                value={product.comparePrice}
                onChange={handleChange("comparePrice")}
                placeholder="2000"
                className={inputClass}
              />
              <p className="text-xs text-[var(--text-secondary)] mt-1">The original price — shown crossed out to display a discount. Leave blank if no discount.</p>
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
        <div className="bg-[var(--surface)] rounded-2xl p-5 shadow-boutique">
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
