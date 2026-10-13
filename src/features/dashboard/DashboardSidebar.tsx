"use client";

import { FilePlus2, Upload } from "lucide-react";
import { useRef } from "react";

import { cn } from "@/lib/utils";

export type DashboardSection = "projects" | "templates" | "recent";

export function DashboardSidebar({
  section,
  onSectionChange,
  onCreateProject,
  onImportProject,
}: {
  section: DashboardSection;
  onSectionChange: (section: DashboardSection) => void;
  onCreateProject: () => void;
  onImportProject: (file: File) => void;
}) {
  const importInputRef = useRef<HTMLInputElement>(null);

  return (
    <aside className="flex w-[260px] shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="MaketAR" className="size-9 rounded-full object-cover shadow-sm" />
        <div>
          <h1 className="text-sm font-semibold">MaketAR</h1>
          <p className="text-xs text-slate-500">Wireframes y diagramas</p>
        </div>
      </div>
      <div className="p-4">
        <button className="primary-button w-full" onClick={onCreateProject}>
          <FilePlus2 size={15} />
          Nuevo proyecto
        </button>
        <button className="secondary-button mt-2 w-full" onClick={() => importInputRef.current?.click()}>
          <Upload size={15} />
          Importar JSON
        </button>
        <input
          ref={importInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onImportProject(file);
            event.currentTarget.value = "";
          }}
        />
      </div>
      <nav className="space-y-1 px-3 text-sm">
        {([
          ["projects", "Proyectos"],
          ["templates", "Templates"],
          ["recent", "Recientes"],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            className={cn(
              "w-full rounded-md px-3 py-2 text-left font-semibold",
              section === id ? "bg-slate-100 text-slate-950" : "text-slate-500 hover:bg-slate-50",
            )}
            onClick={() => onSectionChange(id)}
          >
            {label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
