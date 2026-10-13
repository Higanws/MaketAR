import type { PointerEvent } from "react";
import { RotateCw } from "lucide-react";

import type { ResizeHandle } from "@/features/editor/wireframe/CanvasShape";
import { cn } from "@/lib/utils";

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

export function ShapeSelectionChrome({
  onResizePointerDown,
  onRotatePointerDown,
}: {
  onResizePointerDown: (event: PointerEvent<HTMLButtonElement>, handle: ResizeHandle) => void;
  onRotatePointerDown: (event: PointerEvent<HTMLButtonElement>) => void;
}) {
  return (
    <>
      {resizeHandles.map((handle) => (
        <button
          key={handle}
          className={cn("absolute z-20 size-4 rounded-full border-2 border-white bg-blue-500 shadow-sm", handlePositionClass[handle])}
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
  );
}
