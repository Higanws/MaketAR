"use client";

import type { Edge } from "@xyflow/react";
import { useEffect, useState } from "react";

import type { FlowNodeType, FlowTemplateType } from "@/entities/flow/flow.types";
import { initialFlowEdges, initialFlowNodes, makeFlowTemplateState, normalizeFlowEdges } from "@/entities/flow/flow-templates";
import type { Project, ProjectKind } from "@/entities/project/project.types";
import type { DiagramMode, TemplateType, WirePage } from "@/entities/wireframe/wireframe.types";
import { Dashboard, CreateProjectDialog, DeleteProjectDialog, RenameProjectDialog } from "@/features/dashboard/Dashboard";
import { EditorShell } from "@/features/editor/EditorShell";
import { createProject as persistProject, loadProjectDocument, loadProjects, removeProject, updateProject as persistProjectUpdate } from "@/features/projects/project-client";
import { useEditorStore } from "@/stores/editor";
import { editorStorageVersion } from "@/shared/config/editor";
import type { EditorDocument } from "@/types/project";
import { FloatingSettings, type AppTheme } from "./FloatingSettings";


type ImportedProjectJson = {
  pages?: WirePage[];
  currentPageId?: string;
  mode?: DiagramMode;
  zoom?: number;
  showGrid?: boolean;
  snapToGrid?: boolean;
  gridSize?: number;
  diagramNodes?: FlowNodeType[];
  diagramEdges?: Edge[];
};

function makeBlankProjectState(projectName: string): EditorDocument {
  const page: WirePage = {
    id: `page-${Date.now()}`,
    name: `${projectName} - Lienzo en blanco`,
    shapes: [],
  };

  return {
    version: editorStorageVersion,
    pages: [page],
    currentPageId: page.id,
    mode: "wireframe",
    zoom: 1,
    showGrid: true,
    snapToGrid: true,
    gridSize: 24,
    diagramNodes: [],
    diagramEdges: [],
    updatedAt: new Date().toISOString(),
  };
}

export function AppShell() {
  const [view, setView] = useState<"dashboard" | "editor">("dashboard");
  const [theme, setTheme] = useState<AppTheme>(() => {
    if (typeof window === "undefined") return "light";
    const savedTheme = window.localStorage.getItem("maketar-theme");
    return savedTheme === "dark" || savedTheme === "light" ? savedTheme : "light";
  });
  const [createOpen, setCreateOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [projectToRename, setProjectToRename] = useState<Project | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [, setProjectsHydrated] = useState(false);
  const [initialEditorDocument, setInitialEditorDocument] = useState<EditorDocument | null>(null);
  const resetWorkspace = useEditorStore((state) => state.resetWorkspace);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("theme-transitioning");
    root.dataset.theme = theme;
    window.localStorage.setItem("maketar-theme", theme);
    const timeout = window.setTimeout(() => root.classList.remove("theme-transitioning"), 260);
    return () => window.clearTimeout(timeout);
  }, [theme]);

  useEffect(() => {
    let alive = true;
    loadProjects()
      .then(({ projects: loadedProjects }) => {
        if (!alive) return;
        const normalized = loadedProjects.map((project) => ({ ...project, kind: "mixed" as ProjectKind }));
        setProjects(normalized);
        setActiveProjectId((currentId) =>
          currentId && normalized.some((project) => project.id === currentId) ? currentId : normalized[0]?.id ?? null,
        );
        setActiveProject((currentProject) =>
          (currentProject ? normalized.find((project) => project.id === currentProject.id) : null) ?? normalized[0] ?? null,
        );
      })
      .catch(() => setProjects([]))
      .finally(() => {
        if (alive) setProjectsHydrated(true);
      });

    return () => {
      alive = false;
    };
  }, []);

  const openProject = async (project: Project) => {
    setActiveProjectId(project.id);
    setActiveProject(project);
    const { document } = await loadProjectDocument(project.id);
    const initialState = document ?? (project.flowTemplate ? makeFlowTemplateState(project, editorStorageVersion) : null);
    setInitialEditorDocument(initialState);
    if (initialState) {
      useEditorStore.getState().hydrate(initialState);
    } else {
      resetWorkspace(project.template ?? project.kind, project.name);
    }
    setView("editor");
  };

  const createProject = async (name: string, kind: ProjectKind = "mixed", template?: TemplateType, flowTemplate?: FlowTemplateType) => {
    const project = {
      id: `project-${Date.now()}`,
      name,
      kind,
      template,
      flowTemplate,
      updatedAt: new Date().toISOString(),
      diagrams: 1,
    };
    const initialState = flowTemplate
      ? makeFlowTemplateState(project, editorStorageVersion)
      : template
        ? undefined
        : makeBlankProjectState(name);
    const { project: savedProject } = await persistProject(project, initialState);
    setProjects((current) => [savedProject, ...current.filter((item) => item.id !== savedProject.id)]);
    setCreateOpen(false);
    await openProject(savedProject);
  };

  const createTemplateProject = (name: string, kind: ProjectKind, template?: TemplateType, flowTemplate?: FlowTemplateType) => {
    createProject(name, kind, template, flowTemplate);
  };

  const importProject = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as ImportedProjectJson & { project?: Partial<Project> };
      const pages = Array.isArray(parsed.pages) ? parsed.pages : [];
      if (!pages.length || !pages.every((page) => Array.isArray(page.shapes))) {
        throw new Error("El JSON no contiene paginas validas de MaketAR.");
      }

      const importedProject: Project = {
        id: `project-${Date.now()}`,
        name: parsed.project?.name ? `${parsed.project.name} importado` : file.name.replace(/\.json$/i, "") || "Proyecto importado",
        kind: "mixed",
        template: parsed.project?.template,
        updatedAt: new Date().toISOString(),
        diagrams: pages.length,
      };
      const document: EditorDocument = {
          version: editorStorageVersion,
          pages,
          currentPageId: parsed.currentPageId && pages.some((page) => page.id === parsed.currentPageId)
            ? parsed.currentPageId
            : pages[0].id,
          mode: parsed.mode === "diagram" ? "diagram" : "wireframe",
          zoom: typeof parsed.zoom === "number" ? parsed.zoom : 1,
          showGrid: parsed.showGrid ?? true,
          snapToGrid: parsed.snapToGrid ?? true,
          gridSize: typeof parsed.gridSize === "number" ? parsed.gridSize : 24,
          diagramNodes: Array.isArray(parsed.diagramNodes) ? parsed.diagramNodes : initialFlowNodes,
          diagramEdges: Array.isArray(parsed.diagramEdges)
            ? normalizeFlowEdges(parsed.diagramEdges, Array.isArray(parsed.diagramNodes) ? parsed.diagramNodes : initialFlowNodes, { repairHandles: true })
            : initialFlowEdges,
      };
      const { project: savedProject } = await persistProject(importedProject, document);
      setProjects((current) => [savedProject, ...current.filter((item) => item.id !== savedProject.id)]);
      await openProject(savedProject);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "No se pudo importar el JSON.");
    }
  };

  const deleteProject = (project: Project) => {
    setProjects((current) => current.filter((item) => item.id !== project.id));
    void removeProject(project.id);
    if (activeProjectId === project.id) {
      setActiveProjectId(null);
      setActiveProject(null);
      setView("dashboard");
    }
    setProjectToDelete(null);
  };

  const renameProject = (project: Project, name: string) => {
    const nextName = name.trim();
    if (!nextName) return;
    const renamedProject = { ...project, name: nextName, updatedAt: new Date().toISOString() };
    setProjects((current) =>
      current.map((item) => (item.id === project.id ? renamedProject : item)),
    );
    void persistProjectUpdate(renamedProject);
    if (activeProjectId === project.id) {
      setActiveProject(renamedProject);
    }
    setProjectToRename(null);
  };

  return (
    <main className="fixed inset-0 overflow-hidden bg-[#f4f7fb] text-slate-950">
      {view === "dashboard" ? (
        <Dashboard
          projects={projects}
          onOpenProject={openProject}
          onCreateProject={() => setCreateOpen(true)}
          onCreateTemplate={createTemplateProject}
          onImportProject={importProject}
          onDeleteProject={setProjectToDelete}
          onRenameProject={setProjectToRename}
        />
      ) : activeProject ? (
        <EditorShell
          project={activeProject}
          onBack={() => setView("dashboard")}
          initialDocument={initialEditorDocument}
        />
      ) : (
        <Dashboard
          projects={projects}
          onOpenProject={openProject}
          onCreateProject={() => setCreateOpen(true)}
          onCreateTemplate={createTemplateProject}
          onImportProject={importProject}
          onDeleteProject={setProjectToDelete}
          onRenameProject={setProjectToRename}
        />
      )}
      {createOpen ? (
        <CreateProjectDialog
          onClose={() => setCreateOpen(false)}
          onCreate={createProject}
        />
      ) : null}
      {projectToDelete ? (
        <DeleteProjectDialog
          project={projectToDelete}
          onClose={() => setProjectToDelete(null)}
          onDelete={() => deleteProject(projectToDelete)}
        />
      ) : null}
      {projectToRename ? (
        <RenameProjectDialog
          project={projectToRename}
          onClose={() => setProjectToRename(null)}
          onRename={(name) => renameProject(projectToRename, name)}
        />
      ) : null}
      <FloatingSettings theme={theme} onThemeChange={setTheme} />
    </main>
  );
}
