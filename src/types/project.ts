import type { DiagramMode, TemplateType, WirePage } from "@/stores/editor/editor-store";

export type ProjectKind = "mixed";
export type FlowTemplateType = "purchase-flow" | "approval-flow" | "support-flow";

export type MaketarProject = {
  id: string;
  name: string;
  kind: ProjectKind;
  template?: TemplateType;
  flowTemplate?: FlowTemplateType;
  updatedAt: string;
  diagrams: number;
};

export type EditorDocument = {
  version: number;
  pages: WirePage[];
  currentPageId: string;
  mode: DiagramMode;
  zoom: number;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  diagramNodes: unknown[];
  diagramEdges: unknown[];
  updatedAt?: string;
};

export type StoredProjectBundle = {
  project: MaketarProject;
  document?: EditorDocument;
  pendingSync?: boolean;
};
