"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";

type ThemeMode = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

const STORAGE_KEY = "stitch-theme";

const ThemeContext = createContext<ThemeContextValue>({
  mode: "light",
  resolved: "light",
  setMode: () => { },
  toggle: () => { },
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("light");
  const [resolved, setResolved] = useState<ResolvedTheme>("light");
  const [mounted, setMounted] = useState(false);

  /* Resolve current effective theme */
  const resolve = useCallback((m: ThemeMode): ResolvedTheme => {
    if (m === "system") {
      return typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return m;
  }, []);

  /* Apply theme class to <html> */
  const apply = useCallback((r: ResolvedTheme) => {
    const root = document.documentElement;
    root.classList.toggle("dark", r === "dark");
    setResolved(r);
  }, []);

  /* Initialise from localStorage / system preference on mount */
  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as ThemeMode) || "light";
    setModeState(stored);
    apply(resolve(stored));
    setMounted(true);

    /* Listen for system preference changes when mode is "system" */
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const currentMode =
        (localStorage.getItem(STORAGE_KEY) as ThemeMode) || "light";
      if (currentMode === "system") {
        apply(mq.matches ? "dark" : "light");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [apply, resolve]);

  const setMode = useCallback(
    (m: ThemeMode) => {
      setModeState(m);
      localStorage.setItem(STORAGE_KEY, m);
      apply(resolve(m));
    },
    [apply, resolve]
  );

  const toggle = useCallback(() => {
    setMode(resolved === "dark" ? "light" : "dark");
  }, [resolved, setMode]);

  /* Prevent hydration mismatch: render nothing visible until mounted */
  if (!mounted) {
    return (
      <ThemeContext.Provider
        value={{ mode: "light", resolved: "light", setMode, toggle }}
      >
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ mode, resolved, setMode, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
