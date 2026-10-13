import type { WirePage } from "@/entities/wireframe/wireframe.types";
import { editorStorageVersion } from "@/shared/config/editor";
import type { EditorDocument } from "@/types/project";

export function makeBlankProjectState(projectName: string): EditorDocument {
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
