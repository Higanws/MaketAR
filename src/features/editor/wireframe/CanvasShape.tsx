import { createElement, type MouseEvent as ReactMouseEvent, type PointerEvent } from "react";
import { RotateCw } from "lucide-react";

import { parseTableText } from "@/entities/wireframe/table";
import type { WireShape } from "@/entities/wireframe/wireframe.types";
import { iconLookup } from "@/features/icons/icon-catalog";
import { cn } from "@/lib/utils";

export type ResizeHandle = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

export type ResizeDraft = {
  id: string;
  handle: ResizeHandle;
  startX: number;
  startY: number;
  shape: WireShape;
};

const resizeHandles: ResizeHandle[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];

const handlePositionClass: Record<ResizeHandle, string> = {
  nw: "left-1 top-1",
  n: "left-1/2 top-1 -translate-x-1/2",
  ne: "right-1 top-1",
  e: "right-1 top-1/2 -translate-y-1/2",
  se: "bottom-1 right-1",
  s: "bottom-1 left-1/2 -translate-x-1/2",
  sw: "bottom-1 left-1",
  w: "left-1 top-1/2 -translate-y-1/2",
};

const handleCursor: Record<ResizeHandle, string> = {
  nw: "nwse-resize",
  n: "ns-resize",
  ne: "nesw-resize",
  e: "ew-resize",
  se: "nwse-resize",
  s: "ns-resize",
  sw: "nesw-resize",
  w: "ew-resize",
};

export function ContextMenuButton({
  label,
  danger,
  disabled,
  onClick,
}: {
  label: string;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "block w-full rounded px-3 py-2 text-left hover:bg-slate-50",
        danger && "text-red-600 hover:bg-red-50",
        disabled && "cursor-not-allowed opacity-45 hover:bg-transparent",
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function TableShapeContent({ shape }: { shape: WireShape }) {
  const rows = parseTableText(shape.text);

  return (
    <div className="grid size-full overflow-hidden rounded-[inherit] text-left" style={{ gridTemplateRows: `repeat(${rows.length}, minmax(0, 1fr))` }}>
      {rows.map((row, rowIndex) => (
        <div
          key={`${shape.id}-row-${rowIndex}`}
          className={cn("grid min-h-0", rowIndex === 0 && "bg-slate-100 font-bold")}
          style={{ gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))` }}
        >
          {row.map((cell, cellIndex) => (
            <div
              key={`${shape.id}-cell-${rowIndex}-${cellIndex}`}
              className="flex min-w-0 items-center border-r border-t border-slate-200 px-2 text-xs last:border-r-0"
            >
              <span className="truncate">{cell || " "}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function ButtonShapeContent({ shape }: { shape: WireShape }) {
  return (
    <div className="grid size-full place-items-center rounded-[inherit] bg-current/0 px-4">
      <span className="truncate text-sm font-semibold">{shape.text || "Boton"}</span>
    </div>
  );
}

function InputShapeContent({ shape }: { shape: WireShape }) {
  return (
    <div className="flex size-full items-center rounded-[inherit] bg-white px-3 text-left">
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-500">
        {shape.text || "Placeholder"}
      </span>
      <span className="ml-2 h-5 w-px bg-slate-300" />
    </div>
  );
}

function NavbarShapeContent({ shape }: { shape: WireShape }) {
  const parts = shape.text.split("|").map((part) => part.trim()).filter(Boolean);
  const brand = parts[0] || "MaketAR";
  const navItems = parts.slice(1);

  return (
    <div className="flex size-full items-center gap-3 rounded-[inherit] px-4 text-left">
      <div className="min-w-0 flex-1 truncate text-sm font-bold">{brand}</div>
      <div className="flex shrink-0 items-center gap-2">
        {navItems.map((item) => (
          <span
            key={`${shape.id}-${item}`}
            className="max-w-24 truncate rounded border border-slate-200 bg-white/70 px-2.5 py-1 text-xs font-semibold text-slate-600"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

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
  const Icon = shape.iconName && shape.iconSet ? iconLookup.get(`${shape.iconSet}:${shape.iconName}`) : null;
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
      {shape.type === "table" ? (
        <TableShapeContent shape={shape} />
      ) : shape.type === "input" ? (
        <InputShapeContent shape={shape} />
      ) : shape.type === "button" ? (
        <ButtonShapeContent shape={shape} />
      ) : shape.type === "navbar" ? (
        <NavbarShapeContent shape={shape} />
      ) : shape.type === "icon" && shape.svgSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={shape.svgSrc} alt={shape.name} className="size-full object-contain" />
      ) : shape.type === "image" && shape.imageSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={shape.imageSrc} alt={shape.name} className="size-full object-cover" />
      ) : shape.svgSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={shape.svgSrc} alt={shape.name} className="size-full object-contain p-2" />
      ) : Icon ? (
        createElement(Icon, { size: Math.min(shape.width, shape.height) * 0.78, strokeWidth: 1.45 })
      ) : (
        <span className="w-full">{shape.text}</span>
      )}
      {primarySelected ? (
        <>
          {resizeHandles.map((handle) => (
            <button
              key={handle}
              className={cn(
                "absolute z-20 size-4 rounded-full border-2 border-white bg-blue-500 shadow-sm",
                handlePositionClass[handle],
              )}
              style={{ cursor: handleCursor[handle] }}
              onPointerDown={(event) => {
                event.preventDefault();
                onResizePointerDown(event, handle);
              }}
              aria-label={`Escalar ${handle}`}
            />
          ))}
          <button
            className="absolute -right-5 -top-5 z-20 grid size-5 cursor-grab place-items-center rounded-full border-2 border-white bg-blue-500 text-white shadow-sm"
            onPointerDown={(event) => {
              event.preventDefault();
              onRotatePointerDown(event);
            }}
            title="Rotar"
            aria-label="Rotar objeto"
          >
            <RotateCw size={11} strokeWidth={2.2} />
          </button>
        </>
      ) : null}
    </div>
  );
}
