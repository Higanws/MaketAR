"use client";

import type { Edge } from "@xyflow/react";
import { useCallback, useEffect } from "react";

import type { FlowNodeType } from "@/entities/flow/flow.types";
import type { DiagramMode, WirePage } from "@/entities/wireframe/wireframe.types";
import { saveProjectDocument } from "@/features/projects/project-client";
import { editorStorageVersion } from "@/shared/config/editor";

export function useEditorAutosave({
  projectId,
  diagramReady,
  diagramFlowReady,
  mode,
  pages,
  currentPageId,
  zoom,
  showGrid,
  snapToGrid,
  gridSize,
  diagramNodes,
  diagramEdges,
  markSaved,
}: {
  projectId: string;
  diagramReady: boolean;
  diagramFlowReady: boolean;
  mode: DiagramMode;
  pages: WirePage[];
  currentPageId: string;
  zoom: number;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  diagramNodes: FlowNodeType[];
  diagramEdges: Edge[];
  markSaved: () => void;
}) {
  const saveProject = useCallback(() => {
    void saveProjectDocument(projectId, {
      version: editorStorageVersion,
      pages,
      currentPageId,
      mode,
      zoom,
      showGrid,
      snapToGrid,
      gridSize,
      diagramNodes,
      diagramEdges,
    });
    markSaved();
  }, [currentPageId, diagramEdges, diagramNodes, gridSize, markSaved, mode, pages, projectId, showGrid, snapToGrid, zoom]);

  useEffect(() => {
    if (!diagramReady) return;
    if (mode === "diagram" && !diagramFlowReady) return;
    const timeout = window.setTimeout(saveProject, 650);
    return () => window.clearTimeout(timeout);
  }, [diagramFlowReady, diagramReady, mode, saveProject]);

  return saveProject;
}
