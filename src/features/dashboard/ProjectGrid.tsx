import type { Project } from "@/entities/project/project.types";
import { ProjectCard } from "@/features/dashboard/ProjectCard";

export function ProjectGrid({
  projects,
  empty,
  onOpenProject,
  onRenameProject,
  onDeleteProject,
}: {
  projects: Project[];
  empty?: boolean;
  onOpenProject: (project: Project) => void;
  onRenameProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
}) {
  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onOpenProject={onOpenProject}
            onRenameProject={onRenameProject}
            onDeleteProject={onDeleteProject}
          />
        ))}
      </div>
      {empty ? (
        <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          Todavia no hay proyectos recientes.
        </div>
      ) : null}
    </>
  );
}
