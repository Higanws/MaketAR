import type { Edge } from "@xyflow/react";

import { normalizeFlowEdges } from "@/entities/flow/flow-templates";
import type { FlowNodeType } from "@/entities/flow/flow.types";

export function readStoredDiagram(diagramNodes: unknown, diagramEdges: unknown) {
  const nodes = Array.isArray(diagramNodes) ? diagramNodes as FlowNodeType[] : [];
  const edges = Array.isArray(diagramEdges)
    ? normalizeFlowEdges(diagramEdges as Edge[], nodes, { repairHandles: true })
    : [];

  return { nodes, edges };
}
