"use client";

import { Trash2, Workflow } from "lucide-react";
import { useState } from "react";

import type { ProjectKind } from "@/entities/project/project.types";

export function CreateProjectDialog({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (name: string, kind: ProjectKind) => void;
}) {
  const [name, setName] = useState("Nuevo proyecto");

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-4">
      <div className="w-full max-w-[440px] rounded-md border border-slate-200 bg-white p-5 shadow-xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Crear proyecto</h2>
            <p className="text-sm text-slate-500">Crea un espacio visual para wireframes, flujos, iconos y documentacion.</p>
          </div>
          <button className="toolbar-button" onClick={onClose}>
            <Trash2 size={15} />
          </button>
        </div>
        <label className="property-label">
          Nombre
          <input className="property-input" value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm">
          <div className="flex items-center gap-2 font-semibold text-blue-900">
            <Workflow size={16} />
            Proyecto visual
          </div>
          <p className="mt-1 text-xs text-blue-700">
            Incluye canvas, flujo, iconos, capas y propiedades en un solo proyecto.
          </p>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button className="secondary-button" onClick={onClose}>Cancelar</button>
          <button className="primary-button" onClick={() => onCreate(name.trim() || "Sin titulo", "mixed")}>
            Crear
          </button>
        </div>
      </div>
    </div>
  );
}
