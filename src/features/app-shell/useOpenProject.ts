"use client";

import { useState } from "react";

import { makeFlowTemplateState } from "@/entities/flow/flow-templates";
import type { Project } from "@/entities/project/project.types";
import { loadProjectDocument } from "@/features/projects/project-client";
import { useEditorStore } from "@/stores/editor";
import { editorStorageVersion } from "@/shared/config/editor";
import type { EditorDocument } from "@/types/project";

export function useOpenProject() {
  const [view, setView] = useState<"dashboard" | "editor">("dashboard");
  const [initialEditorDocument, setInitialEditorDocument] = useState<EditorDocument | null>(null);
  const resetWorkspace = useEditorStore((state) => state.resetWorkspace);

  const openProject = async (project: Project, setActive: (project: Project) => void) => {
    setActive(project);
    const { document } = await loadProjectDocument(project.id);
    const initialState = document ?? (project.flowTemplate ? makeFlowTemplateState(project, editorStorageVersion) : null);
    setInitialEditorDocument(initialState);
    if (initialState) useEditorStore.getState().hydrate(initialState);
    else resetWorkspace(project.template ?? project.kind, project.name);
    setView("editor");
  };

  return { view, setView, initialEditorDocument, openProject };
}
