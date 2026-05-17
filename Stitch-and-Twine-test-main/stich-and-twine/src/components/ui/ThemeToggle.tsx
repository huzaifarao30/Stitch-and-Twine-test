"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeToggle() {
  const { resolved, toggle } = useTheme();
  const isDark = resolved === "dark";

  return (
    <motion.button
      onClick={toggle}
      className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200
        text-[#2E2E2E] hover:text-[#C4A484] hover:bg-[#F6F2EA]
        dark:text-[#E8E0D5] dark:hover:text-[#C4A484] dark:hover:bg-[#3E3E3E]"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      whileTap={{ scale: 0.85 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
          >
            <Moon size={17} />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
          >
            <Sun size={17} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
