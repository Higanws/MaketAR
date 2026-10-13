"use client";

import {
  Node,
  NodeProps,
  NodeResizer,
  useInternalNode,
  useUpdateNodeInternals,
} from "@xyflow/react";
import { Image as ImageIcon } from "lucide-react";
import { createElement, useEffect } from "react";

import { flowNodeDefaults } from "@/entities/flow/flow-templates";
import type { FlowNodeData } from "@/entities/flow/flow.types";
import {
  flowTextAlignClass,
  flowTextHorizontalAlignStyle,
  flowTextVerticalAlignStyle,
  flowTextareaBaseClass,
  getFlowNodeFontSize,
  getFlowNodePadding,
  getFlowNodeTextScale,
  resolveFlowNodeDimensions,
} from "@/features/editor/flow/flow-node-text";
import { FlowNodeHandles } from "@/features/editor/flow/FlowNodeHandles";
import { FlowNodeLabel } from "@/features/editor/flow/FlowNodeLabel";
import { iconLookup } from "@/features/icons/icon-catalog";
import { cn } from "@/lib/utils";
import { withAlpha } from "@/shared/lib/export-utils";

const FLOW_NODE_STROKE_WIDTH = 2.5;

export function FlowNode({ id, data, selected, width, height }: NodeProps<Node<FlowNodeData>>) {
  const updateNodeInternals = useUpdateNodeInternals();
  const internalNode = useInternalNode(id);
  const variant = data.variant;
  const isDecision = variant === "decision";
  const isText = variant === "text";
  const isDocument = variant === "document";
  const isImage = variant === "image";
  const isData = variant === "data";
  const isIcon = variant === "icon";
  const isGroup = variant === "group";
  const IconComponent = data.iconName && data.iconSet ? iconLookup.get(`${data.iconSet}:${data.iconName}`) : null;
  const defaults = flowNodeDefaults[variant];
  const { width: nodeWidth, height: nodeHeight } = resolveFlowNodeDimensions(
    width ?? internalNode?.width,
    height ?? internalNode?.height,
    internalNode?.style,
    internalNode?.measured,
    defaults,
  );
  const fill = data.fill ?? defaults.fill;
  const stroke = data.stroke ?? defaults.stroke;
  const textColor = data.textColor ?? defaults.textColor;
  const textAlign = data.textAlign ?? "left";
  const textVerticalAlign = data.textVerticalAlign ?? "middle";
  const iconVisualSize = Math.min(nodeWidth, nodeHeight) * 0.78;
  const showIconLabel = Boolean(data.label.trim());
  const textScale = getFlowNodeTextScale(nodeWidth, nodeHeight, variant);
  const flowFontSize = getFlowNodeFontSize(variant, textScale);
  const flowPadding = getFlowNodePadding(textScale);
  const flowTextStyle = { color: textColor, fontSize: flowFontSize, lineHeight: 1.15 };

  useEffect(() => {
    if (isGroup || isImage) return;
    updateNodeInternals(id);
  }, [id, isGroup, isImage, nodeWidth, nodeHeight, updateNodeInternals]);

  return (
    <div className="relative size-full">
      <NodeResizer
        isVisible={selected}
        minWidth={isIcon ? 40 : 80}
        minHeight={isIcon ? 40 : 48}
        color="#3b82f6"
      />
      {!isGroup && !isImage ? <FlowNodeHandles /> : null}
      {isDecision ? (
        <svg className="pointer-events-none absolute inset-0 size-full overflow-visible drop-shadow-sm" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <polygon
            points="50,0 100,50 50,100 0,50"
            fill={fill}
            stroke={stroke}
            strokeWidth={FLOW_NODE_STROKE_WIDTH}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      ) : null}
      {isIcon ? (
        <div className="relative flex size-full min-h-0 flex-col items-stretch gap-1 px-1 py-1">
          <div className="flex min-h-0 flex-1 items-center justify-center">
            {data.svgSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.svgSrc} alt="" className="size-full object-contain" />
            ) : IconComponent ? (
              createElement(IconComponent, { size: iconVisualSize, strokeWidth: 1.45 })
            ) : (
              <ImageIcon size={iconVisualSize} strokeWidth={1.45} />
            )}
          </div>
          {showIconLabel ? (
            <FlowNodeLabel
              id={id}
              label={data.label}
              className={cn(flowTextareaBaseClass, "shrink-0 text-center font-semibold leading-tight")}
              style={{ ...flowTextStyle, maxHeight: Math.max(18, nodeHeight * 0.28) }}
              onChange={data.onChange}
            />
          ) : null}
        </div>
      ) : null}
      {isImage ? (
        <div className="flex size-full min-h-0 flex-col items-stretch gap-1 rounded-md px-2 py-2" style={{ color: textColor }}>
          <div className="flex min-h-0 flex-1 items-center justify-center">
            {data.imageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.imageSrc} alt="" className="size-full rounded object-contain" />
            ) : (
              <ImageIcon size={iconVisualSize} strokeWidth={1.35} />
            )}
          </div>
          <FlowNodeLabel
            id={id}
            label={data.label}
            className={cn(flowTextareaBaseClass, "shrink-0 text-center font-semibold leading-tight")}
            style={{ ...flowTextStyle, maxHeight: Math.max(18, nodeHeight * 0.28) }}
            onChange={data.onChange}
          />
        </div>
      ) : null}
      {isGroup ? (
        <div
          className="flex size-full min-h-0 items-start justify-start rounded-lg border-2 border-dashed px-3 py-2"
          style={{ backgroundColor: withAlpha(fill, 0.28), borderColor: stroke }}
        >
          <FlowNodeLabel
            id={id}
            label={data.label}
            className={cn(flowTextareaBaseClass, "text-left font-bold uppercase tracking-[0.08em]")}
            style={flowTextStyle}
            onChange={data.onChange}
          />
        </div>
      ) : null}
      <div
        className={cn(
          "relative flex size-full min-h-0 border shadow-sm",
          variant === "start" && "rounded-full",
          variant === "process" && "rounded-md",
          isData && "skew-x-[-10deg] rounded-sm",
          isDocument && "rounded-md after:absolute after:bottom-0 after:left-0 after:h-3 after:w-full after:rounded-b-[50%] after:border-t after:bg-white/60",
          isText && "border-transparent bg-transparent shadow-none",
          isDecision && "absolute inset-0 w-full bg-transparent shadow-none",
          (isIcon || isImage || isGroup) && "hidden",
        )}
        style={{
          backgroundColor: isDecision ? "transparent" : fill,
          borderColor: isDecision ? "transparent" : stroke,
          borderWidth: isDecision ? 0 : FLOW_NODE_STROKE_WIDTH,
          color: textColor,
          ...flowPadding,
          alignItems: isText ? flowTextVerticalAlignStyle[textVerticalAlign] : "center",
          justifyContent: isText ? flowTextHorizontalAlignStyle[textAlign] : "center",
        }}
      >
        <FlowNodeLabel
          id={id}
          label={data.label}
          className={cn(
            flowTextareaBaseClass,
            "font-semibold",
            isData && "skew-x-[10deg]",
            isDecision && "m-auto text-center",
            isText && cn("font-medium", flowTextAlignClass[textAlign]),
            !isText && !isDecision && "text-center",
          )}
          style={{
            ...flowTextStyle,
            ...(isDecision ? { maxWidth: Math.max(40, nodeWidth * 0.58) } : {}),
          }}
          onChange={data.onChange}
        />
      </div>
    </div>
  );
}
