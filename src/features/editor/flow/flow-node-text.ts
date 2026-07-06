import { flowNodeDefaults } from "@/entities/flow/flow-templates";
import type { FlowNodeVariant, FlowTextAlign, FlowTextVerticalAlign } from "@/entities/flow/flow.types";

export const flowTextAlignClass: Record<FlowTextAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export const flowTextVerticalAlignStyle: Record<FlowTextVerticalAlign, string> = {
  top: "flex-start",
  middle: "center",
  bottom: "flex-end",
};

export const flowTextHorizontalAlignStyle: Record<FlowTextAlign, string> = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
};

export const flowTextareaBaseClass =
  "nodrag nowheel w-full max-h-full shrink-0 resize-none overflow-hidden bg-transparent outline-none";

export function resolveFlowNodeDimensions(
  width: number | undefined,
  height: number | undefined,
  style: { width?: number | string; height?: number | string } | undefined,
  measured: { width?: number; height?: number } | undefined,
  defaults: { width: number; height: number },
) {
  const styleDimension = (value: number | string | undefined) => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const parsed = Number.parseFloat(value);
      if (Number.isFinite(parsed)) return parsed;
    }
    return undefined;
  };

  return {
    width: width ?? measured?.width ?? styleDimension(style?.width) ?? defaults.width,
    height: height ?? measured?.height ?? styleDimension(style?.height) ?? defaults.height,
  };
}

export function getFlowNodeTextScale(nodeWidth: number, nodeHeight: number, variant: FlowNodeVariant) {
  const defaults = flowNodeDefaults[variant];
  const baseMin = Math.min(defaults.width, defaults.height);
  const currentMin = Math.min(nodeWidth, nodeHeight);
  return currentMin / baseMin;
}

export function getFlowNodeFontSize(variant: FlowNodeVariant, scale: number) {
  const baseByVariant: Partial<Record<FlowNodeVariant, number>> = {
    group: 12,
    icon: 11,
    image: 11,
    text: 14,
  };
  const base = baseByVariant[variant] ?? 14;
  return Math.max(8, Math.round(base * scale));
}

export function getFlowNodePadding(scale: number) {
  return {
    paddingLeft: Math.max(4, Math.round(12 * scale)),
    paddingRight: Math.max(4, Math.round(12 * scale)),
    paddingTop: Math.max(2, Math.round(8 * scale)),
    paddingBottom: Math.max(2, Math.round(8 * scale)),
  };
}
