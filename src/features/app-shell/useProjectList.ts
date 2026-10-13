"use client";

import { useEffect, useState } from "react";

import type { FlowTemplateType } from "@/entities/flow/flow.types";
import { makeFlowTemplateState } from "@/entities/flow/flow-templates";
import type { Project, ProjectKind } from "@/entities/project/project.types";
import type { TemplateType } from "@/entities/wireframe/wireframe.types";
import { useOpenProject } from "@/features/app-shell/useOpenProject";
import { makeBlankProjectState } from "@/features/projects/blank-document";
import { parseImportedProject } from "@/features/projects/import-project-json";
import { createProject as persistProject, loadProjects, removeProject, updateProject as persistProjectUpdate } from "@/features/projects/project-client";
import { editorStorageVersion } from "@/shared/config/editor";

export function useProjectList() {
  const navigation = useOpenProject();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [, setProjectsHydrated] = useState(false);

  useEffect(() => {
    let alive = true;
    loadProjects()
      .then(({ projects: loadedProjects }) => {
        if (!alive) return;
        const normalized = loadedProjects.map((project) => ({ ...project, kind: "mixed" as ProjectKind }));
        setProjects(normalized);
        setActiveProjectId((currentId) => currentId && normalized.some((project) => project.id === currentId) ? currentId : normalized[0]?.id ?? null);
        setActiveProject((currentProject) => (currentProject ? normalized.find((project) => project.id === currentProject.id) : null) ?? normalized[0] ?? null);
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
    await navigation.openProject(project, (next) => {
      setActiveProjectId(next.id);
      setActiveProject(next);
    });
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
    await openProject(savedProject);
  };

  const importProject = async (file: File) => {
    try {
      const { importedProject, document } = parseImportedProject(await file.text(), file.name);
      const { project: savedProject } = await persistProject(importedProject, document);
      setProjects((current) => [savedProject, ...current.filter((item) => item.id !== savedProject.id)]);
      await openProject(savedProject);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "No se pudo importar el JSON.");
    }
  };

  const deleteProject = (project: Project, onLeaveEditor: () => void) => {
    setProjects((current) => current.filter((item) => item.id !== project.id));
    void removeProject(project.id);
    if (activeProjectId === project.id) {
      setActiveProjectId(null);
      setActiveProject(null);
      onLeaveEditor();
    }
  };

  const renameProject = (project: Project, name: string) => {
    const nextName = name.trim();
    if (!nextName) return null;
    const renamedProject = { ...project, name: nextName, updatedAt: new Date().toISOString() };
    setProjects((current) => current.map((item) => (item.id === project.id ? renamedProject : item)));
    void persistProjectUpdate(renamedProject);
    if (activeProjectId === project.id) setActiveProject(renamedProject);
    return renamedProject;
  };

  return {
    ...navigation,
    projects,
    activeProject,
    openProject,
    createProject,
    importProject,
    deleteProject,
    renameProject,
  };
}
