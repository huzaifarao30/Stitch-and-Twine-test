"use client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Banner } from "@/types";

interface HeroSliderProps {
  banners: Banner[];
}

export default function HeroSlider({ banners }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const goNext = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    const interval = setInterval(goNext, 6000);
    return () => clearInterval(interval);
  }, [goNext]);

  if (!banners.length) return null;

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 80 : -80 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -80 : 80 }),
  };

  return (
    <section className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden">
      {/* Images */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={banners[current].image}
            alt={banners[current].title}
            fill
            priority
            className="object-cover scale-105"
            sizes="100vw"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0"
            style={{ background: "linear-gradient(to right, rgba(46,46,46,0.75) 0%, rgba(46,46,46,0.3) 60%, transparent 100%)" }} />
        </motion.div>
      </AnimatePresence>

      {/* Floating paths decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        <svg className="w-full h-full" viewBox="0 0 1440 900" fill="none" preserveAspectRatio="xMidYMid slice">
          {Array.from({ length: 8 }, (_, i) => (
            <motion.path
              key={i}
              d={`M-${200 + i * 30} -${100 + i * 20}C-${200 + i * 30} -${100 + i * 20} ${300 - i * 20} ${400 - i * 15} ${800 - i * 25} ${700 - i * 10}`}
              stroke="rgba(196,164,132,0.4)"
              strokeWidth={0.5 + i * 0.1}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ duration: 3 + i * 0.5, delay: i * 0.2, ease: "easeOut" }}
            />
          ))}
        </svg>
      </div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-xl"
          >
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xs uppercase tracking-[0.3em] text-[#F2C4CE] font-inter mb-4"
            >
              {banners[current].subtitle}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="font-playfair text-4xl sm:text-5xl md:text-6xl text-white font-medium leading-[1.15] mb-6"
            >
              {banners[current].title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-white/75 text-base leading-relaxed mb-8 font-inter"
            >
              {banners[current].description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex gap-4"
            >
              <Link
                href={banners[current].ctaLink}
                className="btn-primary"
              >
                {banners[current].ctaText}
                <ArrowRight size={16} />
              </Link>
              <Link href="/about" className="btn-secondary text-white border-white/40 hover:bg-white/10">
                Our Story
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
        {/* Dots */}
        <div className="flex gap-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => { setDirection(idx > current ? 1 : -1); setCurrent(idx); }}
              className="transition-all duration-300"
              aria-label={`Go to slide ${idx + 1}`}
            >
              <div className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === current ? "w-8 bg-white" : "w-1.5 bg-white/40"
              }`} />
            </button>
          ))}
        </div>
      </div>

      {/* Arrow Buttons */}
      <button
        onClick={goPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all border border-white/20"
        aria-label="Previous slide"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={goNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all border border-white/20"
        aria-label="Next slide"
      >
        <ChevronRight size={20} />
      </button>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 right-8 flex flex-col items-center gap-2 text-white/60">
        <span className="text-xs font-inter uppercase tracking-widest" style={{ writingMode: "vertical-rl" }}>Scroll</span>
        <motion.div
          className="w-px h-8 bg-white/40"
          animate={{ scaleY: [0, 1, 0], originY: 0 }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>
    </section>
  );
}
