"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Save, ArrowLeft, Trash2, Upload, X } from "lucide-react";
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
  isActive: boolean;
  isFeature: boolean;
}

const STORAGE_PUBLIC_PREFIX = "/storage/v1/object/public/product-images/";

function getStoragePathFromPublicUrl(url: string): string | null {
  if (!url) return null;
  const markerIdx = url.indexOf(STORAGE_PUBLIC_PREFIX);
  if (markerIdx === -1) return null;
  return url.slice(markerIdx + STORAGE_PUBLIC_PREFIX.length);
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [initialExistingImages, setInitialExistingImages] = useState<string[]>([]);
  const [categories, setCategories] = useState<Array<{ label: string; value: string }>>([]);
  const [product, setProduct] = useState<ProductForm>({
    name: "",
    slug: "",
    description: "",
    price: "",
    comparePrice: "",
    category: "",
    stock: "",
    isActive: true,
    isFeature: false,
  });

  useEffect(() => {
    void categoryService.getAdminCategories().then((cats) => {
      setCategories(cats.map((c) => ({ label: c.name, value: c.slug })));
    });

    void productService.getAdminProductById(id).then((existing) => {
      if (!existing) return;
      setProduct({
        name: existing.name,
        slug: existing.slug,
        description: existing.description || "",
        price: existing.price.toString(),
        comparePrice: existing.comparePrice ? existing.comparePrice.toString() : "",
        category: existing.categorySlug,
        stock: existing.stock.toString(),
        isActive: existing.isActive,
        isFeature: existing.isFeature,
      });
      const currentImages = Array.isArray(existing.images) ? existing.images : [];
      setExistingImages(currentImages);
      setInitialExistingImages(currentImages);
    });
  }, [id]);

  const handleChange = (key: keyof ProductForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setProduct((p) => ({ ...p, [key]: e.target.value }));

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setProduct((p) => ({ ...p, name, slug: slugify(name) }));
  };

  const handleToggle = (key: "isActive" | "isFeature") => {
    setProduct((p) => ({ ...p, [key]: !p[key] }));
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    setNewImageFiles((prev) => [...prev, ...files]);
    setNewImagePreviews((prev) => [...prev, ...files.map((file) => URL.createObjectURL(file))]);
    e.target.value = "";
  };

  const clearImage = (index: number, source: "existing" | "new") => {
    if (source === "existing") {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
      return;
    }

    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }
    
    setLoading(true);
    await productService.deleteProduct(id);
    router.push("/admin/products");
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

    const uploadedPaths: string[] = [];
    const uploadedUrls: string[] = [];

    for (const imageFile of newImageFiles) {
      const compressedFile = await compressProductImage(imageFile);
      const safeName = compressedFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const uploadedFilePath = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(uploadedFilePath, compressedFile, { upsert: false });

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
        .getPublicUrl(uploadedFilePath);

      uploadedPaths.push(uploadedFilePath);
      uploadedUrls.push(publicData.publicUrl);
    }

    const finalImages = [...existingImages, ...uploadedUrls];
    if (!finalImages.length) {
      if (uploadedPaths.length) {
        await supabase.storage.from("product-images").remove(uploadedPaths);
      }
      setError("Please keep at least one product image.");
      setLoading(false);
      return;
    }

    const selectedCategory = categories.find((c) => c.value === product.category);
    const updated = await productService.updateProduct(id, {
      name: product.name,
      slug: product.slug || slugify(product.name),
      description: product.description,
      price: Number(product.price),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : undefined,
      category: selectedCategory?.label ?? product.category,
      categorySlug: product.category,
      stock: Number(product.stock),
      images: finalImages,
      isActive: product.isActive,
      isFeature: product.isFeature,
    });

    if (!updated) {
      if (uploadedPaths.length) {
        await supabase.storage.from("product-images").remove(uploadedPaths);
      }
      setError("Failed to update product. Please try again.");
      setLoading(false);
      return;
    }

    const removedExistingImages = initialExistingImages.filter((img) => !existingImages.includes(img));
    const removedPaths = removedExistingImages
      .map((img) => getStoragePathFromPublicUrl(img))
      .filter((path): path is string => Boolean(path));

    if (removedPaths.length) {
      await supabase.storage.from("product-images").remove(removedPaths);
    }

    setExistingImages(finalImages);
    setInitialExistingImages(finalImages);
    setNewImageFiles([]);
    setNewImagePreviews([]);

    setSaved(true);
    setLoading(false);
    setTimeout(() => router.push("/admin/products"), 800);
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-gold)] focus:ring-2 focus:ring-[#C4A484]/20 transition-all placeholder:text-[var(--accent-gold)]/60";
  const labelClass = "block text-xs font-semibold uppercase tracking-widest text-[#4A3728] mb-1.5";

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-7">
        <Link href="/admin/products"
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[var(--soft-beige)] transition-colors">
          <ArrowLeft size={18} className="text-[var(--text-secondary)]" />
        </Link>
        <div>
          <h1 className="font-playfair text-2xl text-[var(--text-primary)]">Edit Product</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Update product details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="bg-[var(--surface)] rounded-2xl p-5 shadow-boutique">
          <label className={labelClass}>Product Images *</label>
          <div className="border-2 border-dashed border-[var(--border-color)] rounded-xl p-6 text-center hover:border-[var(--accent-gold)] transition-colors">
            {existingImages.length + newImagePreviews.length > 0 ? (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  {existingImages.map((preview, index) => (
                    <div key={`existing-${preview}-${index}`} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={preview} alt={`Existing image ${index + 1}`} className="h-28 w-full rounded-xl object-cover" />
                      <button
                        type="button"
                        onClick={() => clearImage(index, "existing")}
                        className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow hover:bg-red-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {newImagePreviews.map((preview, index) => (
                    <div key={`new-${preview}-${index}`} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={preview} alt={`New image ${index + 1}`} className="h-28 w-full rounded-xl object-cover" />
                      <button
                        type="button"
                        onClick={() => clearImage(index, "new")}
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
              <p className="text-xs text-[var(--text-secondary)] mt-1">The original price — shown crossed out.</p>
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

        {/* Active/Featured Toggles */}
        <div className="bg-[var(--surface)] rounded-2xl p-5 shadow-boutique">
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Product Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-[var(--text-primary)]">Active</label>
                <p className="text-sm text-[var(--text-secondary)]">Product will be visible in the shop</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('isActive')}
                className={`relative inline-block w-12 h-6 rounded-full transition-colors duration-200 ${
                  product.isActive ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 bg-[var(--surface)] rounded-full shadow transition-transform duration-200 ${
                    product.isActive ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-[var(--text-primary)]">Featured</label>
                <p className="text-sm text-[var(--text-secondary)]">Show in featured products section</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('isFeature')}
                className={`relative inline-block w-12 h-6 rounded-full transition-colors duration-200 ${
                  product.isFeature ? 'bg-pink-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 bg-[var(--surface)] rounded-full shadow transition-transform duration-200 ${
                    product.isFeature ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
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
            {loading ? "Saving…" : saved ? "Saved! Redirecting…" : "Update Product"}
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
