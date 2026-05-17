"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, X, SlidersHorizontal, Eye, EyeOff } from "lucide-react";
import { getAllSliders, deleteSlider } from "@/lib/adminStore";
import { Banner } from "@/types";

export default function AdminSlidersPage() {
  const [sliders, setSliders] = useState<Banner[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    setSliders(getAllSliders());
  }, []);

  const handleDelete = (id: string) => {
    deleteSlider(id);
    setSliders(getAllSliders());
    setConfirmDelete(null);
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-3xl text-[#2E2E2E]">Hero Sliders</h1>
          <p className="text-[#6B6B6B] text-sm mt-1">{sliders.length} slides in the hero section</p>
        </div>
        <Link href="/admin/sliders/add" className="btn-primary text-sm py-2.5 px-5">
          <Plus size={15} /> Add Slide
        </Link>
      </div>

      {sliders.length === 0 ? (
        <div className="py-20 text-center">
          <SlidersHorizontal size={48} className="mx-auto text-[#EDE6DA] mb-3" />
          <p className="text-[#9B8B7A]">No sliders yet. Add your first hero slide!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence>
            {sliders.map((slide, idx) => (
              <motion.div
                key={slide.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl shadow-boutique overflow-hidden group"
              >
                {/* Image preview */}
                <div className="relative h-48">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                  {/* Slide number */}
                  <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-white text-xs font-medium">{idx + 1}</span>
                  </div>

                  {/* Active badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${slide.isActive ? "bg-green-500/90 text-white" : "bg-gray-500/80 text-white"}`}>
                      {slide.isActive ? <Eye size={11} /> : <EyeOff size={11} />}
                      {slide.isActive ? "Active" : "Hidden"}
                    </span>
                  </div>

                  {/* Title overlay */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white font-playfair text-lg leading-tight line-clamp-1">{slide.title}</p>
                    <p className="text-white/70 text-xs mt-0.5 line-clamp-1">{slide.subtitle}</p>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-4">
                  <p className="text-xs text-[#6B6B6B] line-clamp-2 mb-3 leading-relaxed">{slide.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-[#9B8B7A] bg-[#F6F2EA] px-2 py-1 rounded-lg truncate max-w-[140px]">
                        {slide.ctaText} → {slide.ctaLink}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/sliders/edit/${slide.id}`}
                        className="w-7 h-7 rounded-lg bg-[#F6F2EA] flex items-center justify-center hover:bg-[#EDE6DA] transition-colors"
                        title="Edit"
                      >
                        <Edit size={12} className="text-[#6B6B6B]" />
                      </Link>
                      <button
                        onClick={() => setConfirmDelete(slide.id)}
                        className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={12} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Delete confirm modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-playfair text-lg text-[#2E2E2E]">Delete Slide?</h3>
                <button onClick={() => setConfirmDelete(null)} className="text-[#9B8B7A] hover:text-[#2E2E2E]">
                  <X size={18} />
                </button>
              </div>
              <p className="text-sm text-[#6B6B6B] mb-5">This slide will be removed from the hero section. This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#EDE6DA] text-sm text-[#6B6B6B] hover:bg-[#F6F2EA] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
