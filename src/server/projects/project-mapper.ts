import type { Prisma } from "@prisma/client";

import type { EditorDocument, MaketarProject } from "@/types/project";
import { editorStorageVersion } from "@/shared/config/editor";

type ProjectWithDiagrams = Prisma.ProjectGetPayload<{ include: { diagrams: true } }>;
type DiagramRecord = Prisma.DiagramGetPayload<Record<string, never>>;

export function toClientProject(project: ProjectWithDiagrams): MaketarProject {
  return {
    id: project.id,
    name: project.name,
    kind: "mixed",
    template: project.template as MaketarProject["template"],
    flowTemplate: project.flowTemplate as MaketarProject["flowTemplate"],
    updatedAt: project.updatedAt.toISOString(),
    diagrams: Math.max(project.diagrams.length, 1),
  };
}

export function diagramToDocument(diagram: DiagramRecord): EditorDocument {
  const canvas = (diagram.canvasJson ?? {}) as Record<string, unknown>;
  const viewport = (diagram.viewportJson ?? {}) as Record<string, unknown>;

  return {
    version: editorStorageVersion,
    pages: Array.isArray(canvas.pages) ? canvas.pages as EditorDocument["pages"] : [],
    currentPageId: typeof viewport.currentPageId === "string" ? viewport.currentPageId : "",
    mode: viewport.mode === "diagram" ? "diagram" : "wireframe",
    zoom: typeof viewport.zoom === "number" ? viewport.zoom : 1,
    showGrid: typeof viewport.showGrid === "boolean" ? viewport.showGrid : true,
    snapToGrid: typeof viewport.snapToGrid === "boolean" ? viewport.snapToGrid : true,
    gridSize: typeof viewport.gridSize === "number" ? viewport.gridSize : 24,
    diagramNodes: Array.isArray(canvas.diagramNodes) ? canvas.diagramNodes : [],
    diagramEdges: Array.isArray(canvas.diagramEdges) ? canvas.diagramEdges : [],
    updatedAt: typeof canvas.updatedAt === "string" ? canvas.updatedAt : diagram.updatedAt.toISOString(),
  };
}
