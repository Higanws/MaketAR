import type { DragEvent } from "react";

import type { FlowNodeVariant } from "@/entities/flow/flow.types";
import type { TemplateType, WireShape } from "@/entities/wireframe/wireframe.types";

export const LIBRARY_DRAG_MIME = "application/maketar-library-item";

export type LibraryDragPayload =
  | { kind: "wireframe-shape"; type: WireShape["type"]; label?: string }
  | { kind: "wireframe-template"; template: Exclude<TemplateType, "architecture"> }
  | { kind: "wireframe-icon"; iconName: string; iconSet: string; svgSrc?: string; label?: string }
  | { kind: "wireframe-custom-icon"; name: string; svgSrc: string; iconSet?: string }
  | { kind: "flow-node"; variant: FlowNodeVariant; label?: string }
  | { kind: "flow-icon"; iconName: string; iconSet: string; svgSrc?: string; label?: string };

export function parseLibraryDragPayload(raw: string): LibraryDragPayload | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as LibraryDragPayload;
    if (parsed.kind === "wireframe-shape" && typeof parsed.type === "string") return parsed;
    if (parsed.kind === "wireframe-template" && typeof parsed.template === "string") return parsed;
    if (parsed.kind === "wireframe-icon" && typeof parsed.iconName === "string" && typeof parsed.iconSet === "string") return parsed;
    if (parsed.kind === "wireframe-custom-icon" && typeof parsed.name === "string" && typeof parsed.svgSrc === "string") return parsed;
    if (parsed.kind === "flow-node" && typeof parsed.variant === "string") return parsed;
    if (parsed.kind === "flow-icon" && typeof parsed.iconName === "string" && typeof parsed.iconSet === "string") return parsed;
    return null;
  } catch {
    return null;
  }
}

export function libraryDragProps(payload: LibraryDragPayload) {
  return {
    draggable: true,
    onDragStart: (event: DragEvent) => {
      event.dataTransfer.setData(LIBRARY_DRAG_MIME, JSON.stringify(payload));
      event.dataTransfer.effectAllowed = "copy";
    },
  };
}

export function handleLibraryDragOver(event: DragEvent) {
  if (!event.dataTransfer.types.includes(LIBRARY_DRAG_MIME)) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = "copy";
}
