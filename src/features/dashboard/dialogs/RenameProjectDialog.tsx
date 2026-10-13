"use client";

import { useState } from "react";

import type { Project } from "@/entities/project/project.types";

export function RenameProjectDialog({
  project,
  onClose,
  onRename,
}: {
  project: Project;
  onClose: () => void;
  onRename: (name: string) => void;
}) {
  const [name, setName] = useState(project.name);
  const cleanName = name.trim();

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-4">
      <div className="w-full max-w-[420px] rounded-md border border-slate-200 bg-white p-5 shadow-xl">
        <h2 className="text-base font-semibold">Renombrar proyecto</h2>
        <p className="mt-2 text-sm text-slate-500">
          Cambia el nombre visible del proyecto. El contenido no se modifica.
        </p>
        <label className="property-label mt-4">
          Nombre
          <input
            className="property-input"
            value={name}
            autoFocus
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && cleanName) onRename(cleanName);
              if (event.key === "Escape") onClose();
            }}
          />
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <button className="secondary-button" onClick={onClose}>
            Cancelar
          </button>
          <button className="primary-button" disabled={!cleanName} onClick={() => onRename(cleanName)}>
            Guardar nombre
          </button>
        </div>
      </div>
    </div>
  );
}
