"use client";

import type { Edge } from "@xyflow/react";
import { useEffect } from "react";

import { normalizeFlowEdges } from "@/entities/flow/flow-templates";
import type { FlowNodeType } from "@/entities/flow/flow.types";
import { loadProjectDocument } from "@/features/projects/project-client";
import { useEditorStore } from "@/stores/editor";
import type { EditorDocument } from "@/types/project";

export function useDiagramDocument({
  projectId,
  initialDocument,
  setDiagramNodes,
  setDiagramEdges,
  setDiagramReady,
  setDiagramFlowReady,
}: {
  projectId: string;
  initialDocument: EditorDocument | null;
  setDiagramNodes: (nodes: FlowNodeType[]) => void;
  setDiagramEdges: (edges: Edge[]) => void;
  setDiagramReady: (ready: boolean) => void;
  setDiagramFlowReady: (ready: boolean) => void;
}) {
  useEffect(() => {
    let alive = true;
    const applyDocument = (document: EditorDocument) => {
      const nextDiagramNodes = Array.isArray(document.diagramNodes) ? document.diagramNodes as FlowNodeType[] : [];
      useEditorStore.getState().hydrate(document);
      setDiagramNodes(nextDiagramNodes);
      setDiagramEdges(Array.isArray(document.diagramEdges) ? normalizeFlowEdges(document.diagramEdges as Edge[], nextDiagramNodes, { repairHandles: true }) : []);
      setDiagramFlowReady(false);
      setDiagramReady(true);
    };

    if (initialDocument) {
      applyDocument(initialDocument);
      return () => {
        alive = false;
      };
    }

    loadProjectDocument(projectId).then(({ document }) => {
      if (!alive) return;
      if (document) applyDocument(document);
      else setDiagramReady(true);
    });

    return () => {
      alive = false;
    };
  }, [initialDocument, projectId, setDiagramEdges, setDiagramFlowReady, setDiagramNodes, setDiagramReady]);
}
