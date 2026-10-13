"use client";

import { useState } from "react";

import type { FlowTemplateType } from "@/entities/flow/flow.types";
import type { Project, ProjectKind } from "@/entities/project/project.types";
import type { TemplateType } from "@/entities/wireframe/wireframe.types";
import { useAppTheme } from "@/features/app-shell/useAppTheme";
import { useProjectList } from "@/features/app-shell/useProjectList";
import { CreateProjectDialog, Dashboard, DeleteProjectDialog, RenameProjectDialog } from "@/features/dashboard/Dashboard";
import { EditorShell } from "@/features/editor/EditorShell";
import { FloatingSettings } from "./FloatingSettings";

export function AppShell() {
  const { theme, setTheme } = useAppTheme();
  const workspace = useProjectList();
  const [createOpen, setCreateOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [projectToRename, setProjectToRename] = useState<Project | null>(null);

  const dashboard = (
    <Dashboard
      projects={workspace.projects}
      onOpenProject={workspace.openProject}
      onCreateProject={() => setCreateOpen(true)}
      onCreateTemplate={(name: string, kind: ProjectKind, template?: TemplateType, flowTemplate?: FlowTemplateType) => {
        void workspace.createProject(name, kind, template, flowTemplate);
      }}
      onImportProject={workspace.importProject}
      onDeleteProject={setProjectToDelete}
      onRenameProject={setProjectToRename}
    />
  );

  return (
    <main className="fixed inset-0 overflow-hidden bg-[#f4f7fb] text-slate-950">
      {workspace.view === "editor" && workspace.activeProject ? (
        <EditorShell
          key={workspace.activeProject.id}
          project={workspace.activeProject}
          onBack={() => workspace.setView("dashboard")}
        />
      ) : dashboard}
      {createOpen ? (
        <CreateProjectDialog
          onClose={() => setCreateOpen(false)}
          onCreate={(name, kind) => {
            setCreateOpen(false);
            void workspace.createProject(name, kind);
          }}
        />
      ) : null}
      {projectToDelete ? (
        <DeleteProjectDialog
          project={projectToDelete}
          onClose={() => setProjectToDelete(null)}
          onDelete={() => {
            workspace.deleteProject(projectToDelete, () => workspace.setView("dashboard"));
            setProjectToDelete(null);
          }}
        />
      ) : null}
      {projectToRename ? (
        <RenameProjectDialog
          project={projectToRename}
          onClose={() => setProjectToRename(null)}
          onRename={(name) => {
            workspace.renameProject(projectToRename, name);
            setProjectToRename(null);
          }}
        />
      ) : null}
      <FloatingSettings theme={theme} onThemeChange={setTheme} />
    </main>
  );
}
