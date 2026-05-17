"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [show, setShow] = useState(true);
  const brand = "STITCH & TWINE";

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="loading-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
        >
          {/* Ambient background blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
              style={{ background: "radial-gradient(circle, #F2C4CE, transparent)" }} />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl"
              style={{ background: "radial-gradient(circle, #C4A484, transparent)" }} />
          </div>

          <div className="relative flex flex-col items-center gap-8 px-4 w-full text-center">
            {/* Brand name */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="overflow-hidden w-full"
            >
              <h1 className="font-playfair italic text-2xl sm:text-3xl md:text-5xl tracking-[0.15em] sm:tracking-[0.25em] text-[var(--text-primary)] flex gap-0 justify-center flex-wrap">
                {brand.split("").map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ y: 60, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      delay: i * 0.04,
                      duration: 0.5,
                      ease: [0.33, 1, 0.68, 1],
                    }}
                    className={char === " " ? "w-4" : ""}
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                ))}
              </h1>
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.5 }}
              className="font-inter text-xs tracking-[0.3em] uppercase text-[var(--accent-gold)]"
            >
              Handmade with love
            </motion.p>

            {/* Crochet thread spinner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, duration: 0.4 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="relative w-12 h-12">
                {/* Outer ring */}
                <div
                  className="absolute inset-0 rounded-full border-2"
                  style={{ borderColor: "rgba(196,164,132,0.15)" }}
                />
                {/* Spinning segment */}
                <div
                  className="absolute inset-0 rounded-full border-2 border-transparent"
                  style={{
                    borderTopColor: "#C4A484",
                    borderRightColor: "#F2C4CE",
                    animation: "spin 1s linear infinite",
                  }}
                />
                {/* Center dot */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#C4A484] opacity-60" />
                </div>
              </div>
              {/* Thread dots */}
              <div className="flex gap-1.5">
                {[0, 100, 200].map((delay, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "#C4A484" }}
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: delay / 1000,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
