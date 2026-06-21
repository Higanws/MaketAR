"use client";

import { Moon, Settings2, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type AppTheme = "light" | "dark";

type FloatingSettingsProps = {
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
};

export function FloatingSettings({ theme, onThemeChange }: FloatingSettingsProps) {
  const [open, setOpen] = useState(false);
  const floatingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (event.target instanceof globalThis.Node && floatingRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("touchstart", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={floatingRef} className="fixed bottom-4 left-4 z-[80]">
      <button
        className={cn(
          "grid size-12 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-xl hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700",
          "theme-floating-button",
          open && "is-active border-blue-300 bg-blue-50 text-blue-700",
        )}
        title="Acerca de y configuracion"
        aria-label="Acerca de y configuracion"
        onClick={() => setOpen((current) => !current)}
      >
        <Settings2 size={20} />
      </button>
      {open ? (
        <div className="theme-popover absolute bottom-14 left-0 w-72 rounded-md border border-slate-200 bg-white p-4 text-sm shadow-xl">
          <div className="mb-3 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="MaketAR" className="size-10 rounded-full object-cover" />
            <div>
              <h2 className="font-semibold text-slate-950">MaketAR</h2>
              <p className="text-xs text-slate-500">Wireframes y diagramas</p>
            </div>
          </div>
          <button
            className="secondary-button w-full"
            onClick={() => onThemeChange(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            {theme === "dark" ? "Modo claro" : "Modo oscuro"}
          </button>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            App local autohosteable. Los proyectos se guardan en este navegador y puedes exportarlos como JSON.
          </p>
        </div>
      ) : null}
    </div>
  );
}
