import { flowNodeDefaults } from "@/entities/flow/flow-templates";
import type { FlowNodeType, FlowNodeVariant } from "@/entities/flow/flow.types";

export function getImageNodeSize(imageSrc: string, fallback: { width: number; height: number }) {
  return new Promise<{ width: number; height: number }>((resolve) => {
    if (typeof window === "undefined") {
      resolve(fallback);
      return;
    }

    const image = new window.Image();
    image.onload = () => {
      const naturalWidth = image.naturalWidth || fallback.width;
      const naturalHeight = image.naturalHeight || fallback.height;
      const maxWidth = 260;
      const maxHeight = 220;
      const minWidth = 96;
      const minHeight = 72;
      const scale = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight, 1);
      resolve({
        width: Math.max(minWidth, Math.round(naturalWidth * scale)),
        height: Math.max(minHeight, Math.round(naturalHeight * scale)),
      });
    };
    image.onerror = () => resolve(fallback);
    image.src = imageSrc;
  });
}

function fallbackPosition(nodeCount: number) {
  return { x: 180 + (nodeCount % 3) * 210, y: 160 + Math.floor(nodeCount / 3) * 130 };
}

function centeredPosition(center: { x: number; y: number } | undefined, width: number, height: number, nodeCount: number) {
  return center
    ? { x: Math.round(center.x - width / 2), y: Math.round(center.y - height / 2) }
    : fallbackPosition(nodeCount);
}

export function createFlowNode(
  variant: FlowNodeVariant,
  nodeCount: number,
  options: {
    label?: string;
    center?: { x: number; y: number };
    size?: { width: number; height: number };
    iconName?: string;
    iconSet?: string;
    svgSrc?: string;
    imageSrc?: string;
  } = {},
): FlowNodeType {
  const defaults = flowNodeDefaults[variant];
  const width = options.size?.width ?? defaults.width;
  const height = options.size?.height ?? defaults.height;
  const idPrefix = variant === "icon" ? "flow-icon" : variant === "image" ? "flow-image" : "flow-node";
  const label = variant === "image"
    ? (options.label?.replace(/\.[^.]+$/i, "") || "Imagen")
    : (options.label ?? (variant === "icon" ? options.iconName?.replace(/^Tb/, "") : undefined) ?? "Nodo");

  return {
    id: `${idPrefix}-${Date.now()}`,
    type: "maketarFlow",
    position: variant === "image" ? fallbackPosition(nodeCount) : centeredPosition(options.center, width, height, nodeCount),
    ...(variant === "image" ? {} : { width, height }),
    style: { width, height },
    ...(variant === "group" ? { zIndex: -1, selected: false } : {}),
    ...(variant !== "group" && variant !== "icon" && variant !== "image" ? { selected: true } : {}),
    data: {
      label,
      variant,
      ...(options.iconName ? { iconName: options.iconName, iconSet: options.iconSet } : {}),
      ...(options.svgSrc ? { svgSrc: options.svgSrc } : {}),
      ...(options.imageSrc ? { imageSrc: options.imageSrc } : {}),
      fill: defaults.fill,
      stroke: defaults.stroke,
      textColor: defaults.textColor,
    },
  };
}
