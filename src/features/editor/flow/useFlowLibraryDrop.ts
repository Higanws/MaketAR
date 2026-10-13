"use client";

import { useReactFlow } from "@xyflow/react";
import { useCallback, type DragEvent } from "react";

import type { FlowNodeVariant } from "@/entities/flow/flow.types";
import { LIBRARY_DRAG_MIME, parseLibraryDragPayload } from "@/features/editor/library/drag-drop";

export function useFlowLibraryDrop(
  onDropFlowNode: (variant: FlowNodeVariant, label?: string, center?: { x: number; y: number }) => void,
  onDropFlowIcon: (iconName: string, iconSet: string, svgSrc?: string, label?: string, center?: { x: number; y: number }) => void,
) {
  const { screenToFlowPosition } = useReactFlow();

  return useCallback((event: DragEvent) => {
    event.preventDefault();
    const payload = parseLibraryDragPayload(event.dataTransfer.getData(LIBRARY_DRAG_MIME));
    if (!payload) return;
    const center = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    if (payload.kind === "flow-node") {
      onDropFlowNode(payload.variant, payload.label, center);
      return;
    }
    if (payload.kind === "flow-icon") {
      onDropFlowIcon(payload.iconName, payload.iconSet, payload.svgSrc, payload.label, center);
    }
  }, [onDropFlowIcon, onDropFlowNode, screenToFlowPosition]);
}
