"use client";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeToggle() {
  const { resolved, toggle } = useTheme();
  const isDark = resolved === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="theme-toggle-btn"
      title={isDark ? "Light mode" : "Dark mode"}
    >
      <div className="theme-toggle-track">
        {/* Sun icon */}
        <motion.svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="theme-toggle-icon theme-toggle-sun"
          animate={{
            scale: isDark ? 0.6 : 1,
            opacity: isDark ? 0.3 : 1,
            rotate: isDark ? -90 : 0,
          }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </motion.svg>

        {/* Thumb / slider knob */}
        <motion.div
          className="theme-toggle-thumb"
          animate={{ x: isDark ? 22 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />

        {/* Moon icon */}
        <motion.svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="theme-toggle-icon theme-toggle-moon"
          animate={{
            scale: isDark ? 1 : 0.6,
            opacity: isDark ? 1 : 0.3,
            rotate: isDark ? 0 : 90,
          }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </motion.svg>
      </div>
    </button>
  );
}
