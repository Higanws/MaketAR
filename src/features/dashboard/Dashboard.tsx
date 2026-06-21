"use client";

import {
  AppWindow,
  CloudCog,
  FilePlus2,
  LayoutDashboard,
  PanelTop,
  Search,
  Smartphone,
  Trash2,
  Type,
  Upload,
  Workflow,
} from "lucide-react";
import { createElement, type ElementType, useRef, useState } from "react";

import type { FlowTemplateType } from "@/entities/flow/flow.types";
import type { Project, ProjectKind } from "@/entities/project/project.types";
import type { TemplateType } from "@/entities/wireframe/wireframe.types";
import { cn } from "@/lib/utils";

type IconComponent = ElementType<{ size?: number; strokeWidth?: number; className?: string }>;

export const defaultProjects: Project[] = [
  { id: "project-1", name: "Dashboard SaaS", kind: "mixed", updatedAt: "Hoy", diagrams: 2 },
  { id: "project-2", name: "Checkout Flow", kind: "mixed", updatedAt: "Ayer", diagrams: 1 },
  { id: "project-3", name: "Arquitectura App", kind: "mixed", updatedAt: "Jun 18", diagrams: 3 },
];

const dashboardTemplates: Array<{
  name: string;
  kind: ProjectKind;
  template?: TemplateType;
  flowTemplate?: FlowTemplateType;
  description: string;
}> = [
  { name: "Dashboard SaaS", kind: "mixed", template: "dashboard", description: "Panel web con sidebar, metricas y tabla." },
  { name: "Landing Page", kind: "mixed", template: "landing", description: "Hero, navegacion, CTA y preview visual." },
  { name: "Mobile App", kind: "mixed", template: "mobile", description: "Pantalla mobile lista para maquetar." },
  { name: "Formulario", kind: "mixed", template: "form", description: "Pantalla de registro con panel de marca." },
  { name: "Arquitectura tecnica", kind: "mixed", template: "architecture", description: "Mapa cloud con capas, datos y storage." },
  { name: "Flujo de compra", kind: "mixed", flowTemplate: "purchase-flow", description: "Checkout con pago aprobado, reintento y confirmacion." },
  { name: "Flujo de aprobacion", kind: "mixed", flowTemplate: "approval-flow", description: "Solicitud, revision, decision y notificacion." },
  { name: "Flujo de soporte", kind: "mixed", flowTemplate: "support-flow", description: "Ticket, clasificacion, escalamiento y cierre." },
];

const templateIcons: Record<TemplateType, IconComponent> = {
  dashboard: LayoutDashboard,
  landing: PanelTop,
  mobile: Smartphone,
  form: AppWindow,
  architecture: CloudCog,
};
const wireframeDashboardTemplates = dashboardTemplates.filter((template) => template.template);
const flowDashboardTemplates = dashboardTemplates.filter((template) => template.flowTemplate);

const shortMonths = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function formatProjectUpdatedAt(value: string) {
  const normalizedValue = value.trim();
  if (!normalizedValue || ["hoy", "ayer"].includes(normalizedValue.toLowerCase())) {
    return normalizedValue || "Sin fecha";
  }

  if (!/^\d{4}-\d{2}-\d{2}T/.test(normalizedValue)) {
    return value || "Sin fecha";
  }

  const date = new Date(normalizedValue);
  if (Number.isNaN(date.getTime())) return value;

  const day = String(date.getDate()).padStart(2, "0");
  const month = shortMonths[date.getMonth()];
  const year = date.getFullYear();
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${day} ${month} ${year}, ${hour}:${minute}`;
}

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
  const [section, setSection] = useState<"projects" | "templates" | "recent">("projects");
  const importInputRef = useRef<HTMLInputElement>(null);
  const visibleProjects = section === "recent" ? projects.slice(0, 6) : projects;
  const headerCopy = {
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
  }[section];

  return (
    <div className="flex h-full min-h-0">
      <aside className="flex w-[260px] shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="MaketAR"
            className="size-9 rounded-full object-cover shadow-sm"
          />
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
          <button
            className={cn(
              "w-full rounded-md px-3 py-2 text-left font-semibold",
              section === "projects" ? "bg-slate-100 text-slate-950" : "text-slate-500 hover:bg-slate-50",
            )}
            onClick={() => setSection("projects")}
          >
            Proyectos
          </button>
          <button
            className={cn(
              "w-full rounded-md px-3 py-2 text-left font-semibold",
              section === "templates" ? "bg-slate-100 text-slate-950" : "text-slate-500 hover:bg-slate-50",
            )}
            onClick={() => setSection("templates")}
          >
            Templates
          </button>
          <button
            className={cn(
              "w-full rounded-md px-3 py-2 text-left font-semibold",
              section === "recent" ? "bg-slate-100 text-slate-950" : "text-slate-500 hover:bg-slate-50",
            )}
            onClick={() => setSection("recent")}
          >
            Recientes
          </button>
        </nav>
      </aside>

      <section className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex min-h-20 items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div>
            <h2 className="text-lg font-semibold">{headerCopy.title}</h2>
            <p className="text-sm text-slate-500">{headerCopy.body}</p>
          </div>
          <label className="flex h-9 w-[280px] items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
            <Search size={15} />
            <input className="min-w-0 flex-1 bg-transparent outline-none" placeholder="Buscar proyecto" />
          </label>
        </header>

        <div className="min-h-0 flex-1 overflow-auto p-6">
          {section === "templates" ? (
            <div className="space-y-8">
              <TemplateSection
                title="Wireframes"
                description="Layouts base para pantallas, productos y documentacion visual."
                templates={wireframeDashboardTemplates}
                onCreateTemplate={onCreateTemplate}
              />
              <TemplateSection
                title="Diagramas de flujo"
                description="Mapas de proceso que abren directamente en modo Flujo."
                templates={flowDashboardTemplates}
                onCreateTemplate={onCreateTemplate}
              />
            </div>
          ) : null}

          {section !== "templates" ? (
            <div className="grid grid-cols-3 gap-4">
              {visibleProjects.map((project) => (
              <button
                key={project.id}
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
              ))}
            </div>
          ) : null}

          {section === "recent" && !visibleProjects.length ? (
            <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              Todavia no hay proyectos recientes.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function TemplateSection({
  title,
  description,
  templates,
  onCreateTemplate,
}: {
  title: string;
  description: string;
  templates: typeof dashboardTemplates;
  onCreateTemplate: (name: string, kind: ProjectKind, template?: TemplateType, flowTemplate?: FlowTemplateType) => void;
}) {
  return (
    <section>
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-slate-600">{title}</h3>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
        <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">{templates.length}</span>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {templates.map((template) => (
          <button
            key={template.name}
            className="rounded-md border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:shadow-md"
            onClick={() => onCreateTemplate(template.name, template.kind, template.template, template.flowTemplate)}
          >
            <div className="mb-4 h-32 rounded-md border border-slate-200 bg-[#e8edf5] p-3">
              <div className="h-full rounded border border-slate-300 bg-white p-3">
                <div className="mb-3 flex items-center gap-2">
                  <div className="grid size-7 place-items-center rounded-md bg-slate-950 text-white">
                    {template.template
                      ? createElement(templateIcons[template.template], { size: 16, strokeWidth: 1.8 })
                      : <Workflow size={16} strokeWidth={1.8} />}
                  </div>
                  <div className="h-3 w-20 rounded bg-slate-200" />
                </div>
                {template.flowTemplate ? (
                  <div className="flex items-center gap-1 pt-2">
                    <div className="h-8 w-12 rounded-full border border-blue-200 bg-blue-50" />
                    <div className="h-px w-5 bg-slate-300" />
                    <div className="h-8 w-12 rounded border border-emerald-200 bg-emerald-50" />
                    <div className="h-px w-5 bg-slate-300" />
                    <div className="size-8 rotate-45 rounded border border-amber-200 bg-amber-50" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-12 rounded bg-blue-100" />
                    <div className="h-12 rounded bg-emerald-100" />
                  </div>
                )}
              </div>
            </div>
            <h4 className="truncate text-sm font-semibold">{template.name}</h4>
            <p className="mt-2 text-xs text-slate-500">{template.description}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

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
          <button
            className="primary-button"
            disabled={!cleanName}
            onClick={() => onRename(cleanName)}
          >
            Guardar nombre
          </button>
        </div>
      </div>
    </div>
  );
}

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
