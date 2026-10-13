import { Trash2, Type } from "lucide-react";

import type { Project } from "@/entities/project/project.types";
import { formatProjectUpdatedAt } from "@/features/dashboard/format-project-date";

export function ProjectCard({
  project,
  onOpenProject,
  onRenameProject,
  onDeleteProject,
}: {
  project: Project;
  onOpenProject: (project: Project) => void;
  onRenameProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
}) {
  return (
    <button
      className="group relative overflow-hidden rounded-md border border-slate-200 bg-white text-left shadow-sm transition hover:border-blue-300 hover:shadow-md"
      onClick={() => onOpenProject(project)}
    >
      <span className="absolute right-3 top-3 z-10 flex gap-1">
        <span
          role="button"
          tabIndex={0}
          className="grid size-8 place-items-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
          title="Renombrar proyecto"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onRenameProject(project);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              event.stopPropagation();
              onRenameProject(project);
            }
          }}
        >
          <Type size={15} />
        </span>
        <span
          role="button"
          tabIndex={0}
          className="grid size-8 place-items-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          title="Eliminar proyecto"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onDeleteProject(project);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              event.stopPropagation();
              onDeleteProject(project);
            }
          }}
        >
          <Trash2 size={15} />
        </span>
      </span>
      <div className="h-36 border-b border-slate-200 bg-[#e8edf5] p-4">
        <div className="h-full rounded-md border border-slate-300 bg-white p-3">
          <div className="mb-3 h-5 w-24 rounded bg-slate-200" />
          <div className="grid grid-cols-3 gap-2">
            <div className="h-16 rounded bg-blue-100" />
            <div className="h-16 rounded bg-emerald-100" />
            <div className="h-16 rounded bg-violet-100" />
          </div>
          <div className="mt-3 h-4 w-full rounded bg-slate-100" />
        </div>
      </div>
      <div className="p-4">
        <h3 className="truncate text-sm font-semibold">{project.name}</h3>
        <p
          className="mt-2 truncate text-xs text-slate-500"
          title={`${project.diagrams} archivo(s) · Actualizado ${formatProjectUpdatedAt(project.updatedAt)}`}
        >
          {project.diagrams} archivo(s) · Actualizado {formatProjectUpdatedAt(project.updatedAt)}
        </p>
      </div>
    </button>
  );
}
