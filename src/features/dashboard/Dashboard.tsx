"use client";

import { Search } from "lucide-react";
import { useState } from "react";

import type { FlowTemplateType } from "@/entities/flow/flow.types";
import type { Project, ProjectKind } from "@/entities/project/project.types";
import type { TemplateType } from "@/entities/wireframe/wireframe.types";
import { DashboardSidebar, type DashboardSection } from "@/features/dashboard/DashboardSidebar";
import { flowDashboardTemplates, wireframeDashboardTemplates } from "@/features/dashboard/dashboard-templates";
import { ProjectGrid } from "@/features/dashboard/ProjectGrid";
import { TemplateSection } from "@/features/dashboard/TemplateSection";

export { CreateProjectDialog } from "@/features/dashboard/dialogs/CreateProjectDialog";
export { DeleteProjectDialog } from "@/features/dashboard/dialogs/DeleteProjectDialog";
export { RenameProjectDialog } from "@/features/dashboard/dialogs/RenameProjectDialog";

const headerCopy: Record<DashboardSection, { title: string; body: string }> = {
  projects: {
    title: "Mis proyectos",
    body: "Crea maquetas en alta, wireframes simples y flujos.",
  },
  templates: {
    title: "Templates",
    body: "Arranca desde una base lista para editar.",
  },
  recent: {
    title: "Recientes",
    body: "Continua con los ultimos proyectos abiertos o creados.",
  },
};

export function Dashboard({
  projects,
  onOpenProject,
  onCreateProject,
  onCreateTemplate,
  onImportProject,
  onDeleteProject,
  onRenameProject,
}: {
  projects: Project[];
  onOpenProject: (project: Project) => void;
  onCreateProject: () => void;
  onCreateTemplate: (name: string, kind: ProjectKind, template?: TemplateType, flowTemplate?: FlowTemplateType) => void;
  onImportProject: (file: File) => void;
  onDeleteProject: (project: Project) => void;
  onRenameProject: (project: Project) => void;
}) {
  const [section, setSection] = useState<DashboardSection>("projects");
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const matchesQuery = (value: string) => !normalizedQuery || value.toLocaleLowerCase().includes(normalizedQuery);
  const filteredProjects = projects.filter((project) => matchesQuery(project.name));
  const visibleProjects = section === "recent" ? filteredProjects.slice(0, 6) : filteredProjects;
  const wireframeTemplates = wireframeDashboardTemplates.filter((template) => matchesQuery(template.name) || matchesQuery(template.description));
  const flowTemplates = flowDashboardTemplates.filter((template) => matchesQuery(template.name) || matchesQuery(template.description));
  const copy = headerCopy[section];

  return (
    <div className="flex h-full min-h-0">
      <DashboardSidebar
        section={section}
        onSectionChange={setSection}
        onCreateProject={onCreateProject}
        onImportProject={onImportProject}
      />
      <section className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex min-h-20 items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div>
            <h2 className="text-lg font-semibold">{copy.title}</h2>
            <p className="text-sm text-slate-500">{copy.body}</p>
          </div>
          <label className="flex h-9 w-[280px] items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
            <Search size={15} />
            <input
              className="min-w-0 flex-1 bg-transparent outline-none"
              placeholder="Buscar proyecto"
              aria-label="Buscar proyecto"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </header>
        <div className="min-h-0 flex-1 overflow-auto p-6">
          {section === "templates" ? (
            <div className="space-y-8">
              <TemplateSection
                title="Wireframes"
                description="Layouts base para pantallas, productos y documentacion visual."
                templates={wireframeTemplates}
                onCreateTemplate={onCreateTemplate}
              />
              <TemplateSection
                title="Diagramas de flujo"
                description="Mapas de proceso que abren directamente en modo Flujo."
                templates={flowTemplates}
                onCreateTemplate={onCreateTemplate}
              />
            </div>
          ) : (
            <ProjectGrid
              projects={visibleProjects}
              empty={(section === "recent" && !visibleProjects.length) || (normalizedQuery.length > 0 && !visibleProjects.length)}
              emptyMessage={normalizedQuery ? "Ningun proyecto coincide con la busqueda." : undefined}
              onOpenProject={onOpenProject}
              onRenameProject={onRenameProject}
              onDeleteProject={onDeleteProject}
            />
          )}
        </div>
      </section>
    </div>
  );
}
