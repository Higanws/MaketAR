"use client";

import {
  Handle,
  Node,
  NodeProps,
  NodeResizer,
  Position,
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
import { iconLookup } from "@/features/icons/icon-catalog";
import { cn } from "@/lib/utils";
import { withAlpha } from "@/shared/lib/export-utils";

const FLOW_NODE_STROKE_WIDTH = 2.5;
const FLOW_HANDLE_SIZE = 14;
const flowHandleClass = "!z-20 !rounded-full !border-2 !border-white !bg-blue-500 !shadow-md";
const flowHandlePositions = [
  { id: "top", position: Position.Top, style: { top: 0, left: "50%", transform: "translate(-50%, -50%)" } },
  { id: "right", position: Position.Right, style: { top: "50%", left: "100%", transform: "translate(-50%, -50%)" } },
  { id: "bottom", position: Position.Bottom, style: { top: "100%", left: "50%", transform: "translate(-50%, -50%)" } },
  { id: "left", position: Position.Left, style: { top: "50%", left: 0, transform: "translate(-50%, -50%)" } },
] as const;

const flowHandleStyle = {
  width: FLOW_HANDLE_SIZE,
  height: FLOW_HANDLE_SIZE,
  minWidth: FLOW_HANDLE_SIZE,
  minHeight: FLOW_HANDLE_SIZE,
};

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
      {!isGroup && !isImage ? (
        <>
          {flowHandlePositions.map((handle) => (
            <Handle
              key={`${handle.id}-source`}
              id={`${handle.id}-source`}
              type="source"
              position={handle.position}
              className={flowHandleClass}
              style={{ ...flowHandleStyle, ...handle.style }}
            />
          ))}
        </>
      ) : null}
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
            <textarea
              className={cn(flowTextareaBaseClass, "shrink-0 text-center font-semibold leading-tight")}
              style={{ ...flowTextStyle, maxHeight: Math.max(18, nodeHeight * 0.28) }}
              rows={1}
              value={data.label}
              onChange={(event) => data.onChange?.(id, event.target.value)}
              onPointerDown={(event) => event.stopPropagation()}
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
          <textarea
            className={cn(flowTextareaBaseClass, "shrink-0 text-center font-semibold leading-tight")}
            style={{ ...flowTextStyle, maxHeight: Math.max(18, nodeHeight * 0.28) }}
            rows={1}
            value={data.label}
            onChange={(event) => data.onChange?.(id, event.target.value)}
            onPointerDown={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
      {isGroup ? (
        <div
          className="flex size-full min-h-0 items-center justify-center rounded-lg border-2 border-dashed"
          style={{ backgroundColor: withAlpha(fill, 0.28), borderColor: stroke, ...flowPadding }}
        >
          <textarea
            className={cn(flowTextareaBaseClass, "font-bold uppercase tracking-[0.08em]")}
            style={flowTextStyle}
            rows={1}
            value={data.label}
            onChange={(event) => data.onChange?.(id, event.target.value)}
            onPointerDown={(event) => event.stopPropagation()}
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
        <textarea
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
          rows={1}
          value={data.label}
          onChange={(event) => data.onChange?.(id, event.target.value)}
          onPointerDown={(event) => event.stopPropagation()}
        />
      </div>
    </div>
  );
}
