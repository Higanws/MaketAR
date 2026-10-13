"use client";

import { useEffect, useState } from "react";

import type { AppTheme } from "@/features/app-shell/FloatingSettings";

export function useAppTheme() {
  const [theme, setTheme] = useState<AppTheme>(() => {
    if (typeof window === "undefined") return "light";
    const savedTheme = window.localStorage.getItem("maketar-theme");
    return savedTheme === "dark" || savedTheme === "light" ? savedTheme : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("theme-transitioning");
    root.dataset.theme = theme;
    window.localStorage.setItem("maketar-theme", theme);
    const timeout = window.setTimeout(() => root.classList.remove("theme-transitioning"), 260);
    return () => window.clearTimeout(timeout);
  }, [theme]);

  return { theme, setTheme };
}
