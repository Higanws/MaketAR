import { Trash2 } from "lucide-react";

import type { Project } from "@/entities/project/project.types";

export function DeleteProjectDialog({
  project,
  onClose,
  onDelete,
}: {
  project: Project;
  onClose: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-4">
      <div className="w-full max-w-[420px] rounded-md border border-slate-200 bg-white p-5 shadow-xl">
        <h2 className="text-base font-semibold">Eliminar proyecto</h2>
        <p className="mt-2 text-sm text-slate-500">
          Se borrara <span className="font-semibold text-slate-700">{project.name}</span> y su
          guardado local.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button className="secondary-button" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="primary-button bg-red-600 hover:bg-red-700"
            title="Confirmar eliminar proyecto"
            onClick={onDelete}
          >
            <Trash2 size={15} />
            Eliminar proyecto
          </button>
        </div>
      </div>
    </div>
  );
}
