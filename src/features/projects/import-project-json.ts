import type { Edge } from "@xyflow/react";

import type { FlowNodeType } from "@/entities/flow/flow.types";
import { initialFlowEdges, initialFlowNodes, normalizeFlowEdges } from "@/entities/flow/flow-templates";
import type { Project } from "@/entities/project/project.types";
import type { DiagramMode, WirePage } from "@/entities/wireframe/wireframe.types";
import { editorStorageVersion } from "@/shared/config/editor";
import type { EditorDocument } from "@/types/project";

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
  project?: Partial<Project>;
};

export function parseImportedProject(raw: string, fileName: string) {
  const parsed = JSON.parse(raw) as ImportedProjectJson;
  const pages = Array.isArray(parsed.pages) ? parsed.pages : [];
  if (!pages.length || !pages.every((page) => Array.isArray(page.shapes))) {
    throw new Error("El JSON no contiene paginas validas de MaketAR.");
  }

  const importedProject: Project = {
    id: `project-${Date.now()}`,
    name: parsed.project?.name ? `${parsed.project.name} importado` : fileName.replace(/\.json$/i, "") || "Proyecto importado",
    kind: "mixed",
    template: parsed.project?.template,
    updatedAt: new Date().toISOString(),
    diagrams: pages.length,
  };
  const nodes = Array.isArray(parsed.diagramNodes) ? parsed.diagramNodes : initialFlowNodes;
  const document: EditorDocument = {
    version: editorStorageVersion,
    pages,
    currentPageId: parsed.currentPageId && pages.some((page) => page.id === parsed.currentPageId) ? parsed.currentPageId : pages[0].id,
    mode: parsed.mode === "diagram" ? "diagram" : "wireframe",
    zoom: typeof parsed.zoom === "number" ? parsed.zoom : 1,
    showGrid: parsed.showGrid ?? true,
    snapToGrid: parsed.snapToGrid ?? true,
    gridSize: typeof parsed.gridSize === "number" ? parsed.gridSize : 24,
    diagramNodes: nodes,
    diagramEdges: Array.isArray(parsed.diagramEdges)
      ? normalizeFlowEdges(parsed.diagramEdges, nodes, { repairHandles: true })
      : initialFlowEdges,
  };

  return { importedProject, document };
}
