import type { MouseEvent as ReactMouseEvent, PointerEvent } from "react";

import type { WireShape } from "@/entities/wireframe/wireframe.types";
import {
  ButtonShapeContent,
  InputShapeContent,
  MediaShapeContent,
  NavbarShapeContent,
  TableShapeContent,
} from "@/features/editor/wireframe/shapes/ShapeContents";
import { ShapeSelectionChrome } from "@/features/editor/wireframe/shapes/ShapeSelectionChrome";
import { cn } from "@/lib/utils";

export { ContextMenuButton } from "@/shared/ui/ContextMenuButton";

export type ResizeHandle = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

export type ResizeDraft = {
  id: string;
  handle: ResizeHandle;
  startX: number;
  startY: number;
  shape: WireShape;
};

export function CanvasShape({
  shape,
  selected,
  primarySelected,
  isDragging,
  onPointerDown,
  onResizePointerDown,
  onRotatePointerDown,
  onContextMenu,
}: {
  shape: WireShape;
  selected: boolean;
  primarySelected: boolean;
  isDragging: boolean;
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  onResizePointerDown: (event: PointerEvent<HTMLButtonElement>, handle: ResizeHandle) => void;
  onRotatePointerDown: (event: PointerEvent<HTMLButtonElement>) => void;
  onContextMenu: (event: ReactMouseEvent<HTMLDivElement>) => void;
}) {
  const radius =
    shape.type === "circle"
      ? "999px"
      : `${shape.style.borderTopLeftRadius}px ${shape.style.borderTopRightRadius}px ${shape.style.borderBottomRightRadius}px ${shape.style.borderBottomLeftRadius}px`;
  const borderStyle = shape.style.strokeStyle === "dotted" ? "dotted" : shape.style.strokeStyle === "dashed" ? "dashed" : "solid";
  const isIconShape = shape.type === "icon";

  return (
    <div
      data-shape-id={shape.id}
      onPointerDown={onPointerDown}
      onContextMenu={onContextMenu}
      className={cn(
        "absolute flex select-none items-center justify-center whitespace-pre-line p-3 text-center touch-none",
        shape.type === "table" && "p-0",
        shape.type === "input" && "items-stretch justify-stretch p-0",
        shape.type === "button" && "p-0",
        shape.type === "navbar" && "items-stretch justify-stretch p-0",
        isDragging ? "cursor-grabbing" : "cursor-grab",
        selected ? "overflow-visible" : "overflow-hidden",
        selected && "outline outline-2 outline-offset-2 outline-blue-500",
        isDragging && "outline-blue-600 ring-4 ring-blue-500/15",
        shape.locked && "cursor-not-allowed opacity-70",
      )}
      style={{
        left: shape.x,
        top: shape.y,
        width: shape.width,
        height: shape.height,
        transform: `rotate(${shape.style.rotation}deg)`,
        borderRadius: radius,
        background: isIconShape ? "transparent" : shape.style.fill,
        opacity: isDragging ? Math.min(shape.style.opacity, 0.45) : shape.style.opacity,
        border: isIconShape ? "0 solid transparent" : `${shape.style.strokeWidth}px ${borderStyle} color-mix(in srgb, ${shape.style.stroke} ${shape.style.strokeOpacity * 100}%, transparent)`,
        boxShadow: isIconShape ? "none" : `${shape.style.shadow.x}px ${shape.style.shadow.y}px ${shape.style.shadow.blur}px ${shape.style.shadow.spread}px ${shape.style.shadow.color}`,
        color: shape.style.textColor,
        fontSize: shape.style.fontSize,
        fontFamily: shape.style.fontFamily,
        fontWeight: shape.style.fontWeight,
        textAlign: shape.style.textAlign,
      }}
    >
      {shape.type === "table" ? <TableShapeContent shape={shape} /> : null}
      {shape.type === "input" ? <InputShapeContent shape={shape} /> : null}
      {shape.type === "button" ? <ButtonShapeContent shape={shape} /> : null}
      {shape.type === "navbar" ? <NavbarShapeContent shape={shape} /> : null}
      {shape.type !== "table" && shape.type !== "input" && shape.type !== "button" && shape.type !== "navbar" ? (
        <MediaShapeContent shape={shape} />
      ) : null}
      {primarySelected ? (
        <ShapeSelectionChrome onResizePointerDown={onResizePointerDown} onRotatePointerDown={onRotatePointerDown} />
      ) : null}
    </div>
  );
}
