"use client";

import { useNodesInitialized, useReactFlow, useUpdateNodeInternals } from "@xyflow/react";
import { useEffect } from "react";

import type { FlowNodeType } from "@/entities/flow/flow.types";

export function FlowDiagramSync({
  nodes,
  onReady,
}: {
  nodes: FlowNodeType[];
  onReady: () => void;
}) {
  const nodesInitialized = useNodesInitialized();
  const updateNodeInternals = useUpdateNodeInternals();
  const { setEdges } = useReactFlow();

  useEffect(() => {
    if (!nodesInitialized) return;

    const connectableNodeIds = nodes
      .filter((node) => node.data.variant !== "group" && node.data.variant !== "image")
      .map((node) => node.id);

    for (const nodeId of connectableNodeIds) {
      updateNodeInternals(nodeId);
    }

    const frame = requestAnimationFrame(() => {
      if (connectableNodeIds.length > 0) {
        setEdges((currentEdges) => currentEdges.map((edge) => ({ ...edge })));
      }
      onReady();
    });

    return () => cancelAnimationFrame(frame);
  }, [nodes, nodesInitialized, onReady, setEdges, updateNodeInternals]);

  return null;
}
