import { addEdge, reconnectEdge, type Connection, type Edge } from "@xyflow/react";
import { MarkerType } from "@xyflow/react";

import {
  applyFlowEdgeLineStyle,
  defaultFlowSourceHandle,
  defaultFlowTargetHandle,
  normalizeConnection,
} from "@/entities/flow/flow-templates";
import type { FlowNodeType } from "@/entities/flow/flow.types";

export function connectFlowEdge(edges: Edge[], connection: Connection, nodes: FlowNodeType[]) {
  const normalizedConnection = normalizeConnection(connection, nodes);
  return addEdge(
    {
      ...normalizedConnection,
      sourceHandle: normalizedConnection.sourceHandle ?? defaultFlowSourceHandle,
      targetHandle: normalizedConnection.targetHandle ?? defaultFlowTargetHandle,
      type: "smoothstep",
      reconnectable: true,
      interactionWidth: 32,
      markerEnd: { type: MarkerType.ArrowClosed },
      label: "",
      data: { lineStyle: "solid" },
      style: { strokeWidth: 2.5 },
    },
    edges,
  ).map((edge) => applyFlowEdgeLineStyle(edge));
}

export function reconnectFlowEdge(edges: Edge[], oldEdge: Edge, connection: Connection, nodes: FlowNodeType[]) {
  const normalizedConnection = normalizeConnection(connection, nodes);
  return reconnectEdge(
    oldEdge,
    {
      ...normalizedConnection,
      sourceHandle: normalizedConnection.sourceHandle ?? defaultFlowSourceHandle,
      targetHandle: normalizedConnection.targetHandle ?? defaultFlowTargetHandle,
    },
    edges,
  ).map((edge) => applyFlowEdgeLineStyle({
    ...edge,
    type: "smoothstep",
    reconnectable: true,
    interactionWidth: edge.interactionWidth ?? 32,
  }));
}
