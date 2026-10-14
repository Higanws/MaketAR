import type { CSSProperties, PointerEvent } from "react";
import { RotateCw } from "lucide-react";

import type { ResizeHandle } from "@/features/editor/wireframe/CanvasShape";
import { cn } from "@/lib/utils";

const edgeHandles = ["n", "e", "s", "w"] as const;
const cornerHandles = ["nw", "ne", "se", "sw"] as const;

type CornerHandle = (typeof cornerHandles)[number];

export type CornerRadii = Record<CornerHandle, number>;

/** Same outer thickness as the corner arc (white stroke). Length stays a short capsule. */
const EDGE_LENGTH = 32;

type EdgeHandle = (typeof edgeHandles)[number];

function edgeButtonSize(handle: EdgeHandle): CSSProperties {
  const alongY = handle === "e" || handle === "w";
  return alongY
    ? { width: CORNER_WHITE_STROKE, height: EDGE_LENGTH }
    : { width: EDGE_LENGTH, height: CORNER_WHITE_STROKE };
}

/**
 * Center the capsule on the selection stroke (`outline-2 outline-offset-2`).
 * Absolute offsets are from the padding edge, so the shape border is included.
 */
const SELECTION_OUTLINE_CENTER = 3;

const edgeAnchorClass: Record<(typeof edgeHandles)[number], string> = {
  n: "left-1/2 -translate-x-1/2 -translate-y-1/2",
  e: "top-1/2 translate-x-1/2 -translate-y-1/2",
  s: "left-1/2 -translate-x-1/2 translate-y-1/2",
  w: "top-1/2 -translate-x-1/2 -translate-y-1/2",
};

function edgeAnchorStyle(handle: (typeof edgeHandles)[number], strokeWidth: number): CSSProperties {
  const outside = -(strokeWidth + SELECTION_OUTLINE_CENTER);
  if (handle === "n") return { top: outside };
  if (handle === "e") return { right: outside };
  if (handle === "s") return { bottom: outside };
  return { left: outside };
}

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

const cornerRotation: Record<CornerHandle, number> = {
  nw: 0,
  ne: 90,
  se: 180,
  sw: 270,
};

/** Hit target. The visible arc is smaller and centered on this box. */
const CORNER_HIT = 22;
const CORNER_CENTER = CORNER_HIT / 2;
/** Arc length along the corner, close to the previous 16px handle. */
const CORNER_ARC_LENGTH = 16;
/** Outer width of the corner curve. Edge pills use the same thickness. */
const CORNER_WHITE_STROKE = 8;
const CORNER_BLUE_STROKE = 3.5;

function cornerInset(radius: number) {
  if (radius <= 4) return 0;
  return radius * (1 - Math.SQRT1_2);
}

function cornerButtonStyle(handle: CornerHandle, radius: number): CSSProperties {
  const offset = cornerInset(radius) - CORNER_CENTER;
  if (handle === "nw") return { left: offset, top: offset };
  if (handle === "ne") return { right: offset, top: offset };
  if (handle === "se") return { right: offset, bottom: offset };
  return { left: offset, bottom: offset };
}

function cornerArcPath(radius: number) {
  const curveRadius = radius > 4 ? radius : 11;
  const halfAngle = Math.min(0.6, CORNER_ARC_LENGTH / 2 / curveRadius);
  const mid = (225 * Math.PI) / 180;
  const point = (angle: number) => {
    const x = CORNER_CENTER + curveRadius * (Math.cos(angle) - Math.cos(mid));
    const y = CORNER_CENTER + curveRadius * (Math.sin(angle) - Math.sin(mid));
    return `${x.toFixed(2)} ${y.toFixed(2)}`;
  };
  return `M ${point(mid - halfAngle)} A ${curveRadius} ${curveRadius} 0 0 1 ${point(mid + halfAngle)}`;
}

function EdgePill({ vertical }: { vertical: boolean }) {
  const thickness = CORNER_WHITE_STROKE;
  const cap = thickness / 2;
  const width = vertical ? thickness : EDGE_LENGTH;
  const height = vertical ? EDGE_LENGTH : thickness;
  const x1 = cap;
  const y1 = cap;
  const x2 = vertical ? cap : EDGE_LENGTH - cap;
  const y2 = vertical ? EDGE_LENGTH - cap : cap;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="pointer-events-none block size-full overflow-visible text-blue-500"
      aria-hidden
    >
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="white"
        strokeWidth={CORNER_WHITE_STROKE}
        strokeLinecap="round"
      />
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="currentColor"
        strokeWidth={CORNER_BLUE_STROKE}
        strokeLinecap="round"
      />
    </svg>
  );
}

function CornerArc({ radius, rotation }: { radius: number; rotation: number }) {
  const d = cornerArcPath(radius);
  return (
    <svg
      viewBox={`0 0 ${CORNER_HIT} ${CORNER_HIT}`}
      className="pointer-events-none block size-full overflow-visible text-blue-500"
      style={{ transform: `rotate(${rotation}deg)` }}
      aria-hidden
    >
      <path d={d} fill="none" stroke="white" strokeWidth={CORNER_WHITE_STROKE} strokeLinecap="round" />
      <path d={d} fill="none" stroke="currentColor" strokeWidth={CORNER_BLUE_STROKE} strokeLinecap="round" />
    </svg>
  );
}

export function ShapeSelectionChrome({
  cornerRadii,
  strokeWidth,
  onResizePointerDown,
  onRotatePointerDown,
}: {
  cornerRadii: CornerRadii;
  strokeWidth: number;
  onResizePointerDown: (event: PointerEvent<HTMLButtonElement>, handle: ResizeHandle) => void;
  onRotatePointerDown: (event: PointerEvent<HTMLButtonElement>) => void;
}) {
  return (
    <>
      {edgeHandles.map((handle) => (
        <button
          key={handle}
          type="button"
          className={cn("absolute z-20 overflow-visible bg-transparent p-0", edgeAnchorClass[handle])}
          style={{
            cursor: handleCursor[handle],
            ...edgeButtonSize(handle),
            ...edgeAnchorStyle(handle, strokeWidth),
          }}
          onPointerDown={(event) => {
            event.preventDefault();
            onResizePointerDown(event, handle);
          }}
          aria-label={`Escalar ${handle}`}
        >
          <EdgePill vertical={handle === "e" || handle === "w"} />
        </button>
      ))}
      {cornerHandles.map((handle) => (
        <button
          key={handle}
          type="button"
          className="absolute z-20 bg-transparent p-0"
          style={{
            width: CORNER_HIT,
            height: CORNER_HIT,
            cursor: handleCursor[handle],
            ...cornerButtonStyle(handle, cornerRadii[handle]),
          }}
          onPointerDown={(event) => {
            event.preventDefault();
            onResizePointerDown(event, handle);
          }}
          aria-label={`Escalar ${handle}`}
        >
          <CornerArc radius={cornerRadii[handle]} rotation={cornerRotation[handle]} />
        </button>
      ))}
      <button
        type="button"
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
  );
}
