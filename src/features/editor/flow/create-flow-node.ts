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
  label?: string,
  center?: { x: number; y: number },
  defaultLabel = "Nodo",
): FlowNodeType {
  const defaults = flowNodeDefaults[variant];
  return {
    id: `flow-node-${Date.now()}`,
    type: "maketarFlow",
    position: centeredPosition(center, defaults.width, defaults.height, nodeCount),
    width: defaults.width,
    height: defaults.height,
    style: { width: defaults.width, height: defaults.height },
    zIndex: variant === "group" ? -1 : undefined,
    selected: variant !== "group",
    data: {
      label: label ?? defaultLabel,
      variant,
      fill: defaults.fill,
      stroke: defaults.stroke,
      textColor: defaults.textColor,
    },
  };
}

export function createFlowIconNode(
  iconName: string,
  iconSet: string,
  nodeCount: number,
  svgSrc?: string,
  displayLabel?: string,
  center?: { x: number; y: number },
): FlowNodeType {
  const defaults = flowNodeDefaults.icon;
  return {
    id: `flow-icon-${Date.now()}`,
    type: "maketarFlow",
    position: centeredPosition(center, defaults.width, defaults.height, nodeCount),
    width: defaults.width,
    height: defaults.height,
    style: { width: defaults.width, height: defaults.height },
    data: {
      label: displayLabel ?? iconName.replace(/^Tb/, ""),
      variant: "icon",
      iconName,
      iconSet,
      svgSrc,
      fill: defaults.fill,
      stroke: defaults.stroke,
      textColor: defaults.textColor,
    },
  };
}

export function createFlowImageNode(
  imageSrc: string,
  size: { width: number; height: number },
  nodeCount: number,
  name = "Imagen",
): FlowNodeType {
  const defaults = flowNodeDefaults.image;
  return {
    id: `flow-image-${Date.now()}`,
    type: "maketarFlow",
    position: fallbackPosition(nodeCount),
    style: { width: size.width, height: size.height },
    data: {
      label: name.replace(/\.[^.]+$/i, "") || "Imagen",
      variant: "image",
      imageSrc,
      fill: defaults.fill,
      stroke: defaults.stroke,
      textColor: defaults.textColor,
    },
  };
}
