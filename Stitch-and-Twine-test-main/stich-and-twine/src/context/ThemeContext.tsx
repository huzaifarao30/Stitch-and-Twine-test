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

const ThemeContext = createContext<ThemeContextValue>({
  mode: "system",
  resolved: "light",
  setMode: () => {},
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [resolved, setResolved] = useState<ResolvedTheme>("light");

  /* Resolve current effective theme */
  const resolve = useCallback((m: ThemeMode): ResolvedTheme => {
    if (m === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return m;
  }, []);

  /* Apply theme class to <html> */
  const apply = useCallback((r: ResolvedTheme) => {
    const root = document.documentElement;
    if (r === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    setResolved(r);
  }, []);

  /* Initialise from localStorage on mount */
  useEffect(() => {
    const stored = (localStorage.getItem("st-theme") as ThemeMode) || "system";
    setModeState(stored);
    const r = resolve(stored);
    apply(r);

    /* Listen for system preference changes */
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (stored === "system") apply(mq.matches ? "dark" : "light");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    localStorage.setItem("st-theme", m);
    apply(resolve(m));
  }, [apply, resolve]);

  const toggle = useCallback(() => {
    setMode(resolved === "dark" ? "light" : "dark");
  }, [resolved, setMode]);

  return (
    <ThemeContext.Provider value={{ mode, resolved, setMode, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
