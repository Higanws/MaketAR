import { Grid3X3, Magnet, Maximize2, ZoomIn, ZoomOut } from "lucide-react";

import { cn } from "@/lib/utils";

export function ToolbarViewportControls({
  showGrid,
  snapToGrid,
  zoom,
  onToggleGrid,
  onToggleSnap,
  onZoomIn,
  onZoomOut,
  onFitView,
}: {
  showGrid: boolean;
  snapToGrid: boolean;
  zoom: number;
  onToggleGrid: () => void;
  onToggleSnap: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
}) {
  return (
    <>
      <button type="button" className={cn("toolbar-button", showGrid && "is-active")} onClick={onToggleGrid} title="Grid" aria-pressed={showGrid}>
        <Grid3X3 size={15} />
      </button>
      <button
        type="button"
        className={cn("toolbar-toggle", snapToGrid && "is-active")}
        onClick={onToggleSnap}
        title="Snap: grilla y autoalineado"
        aria-pressed={snapToGrid}
      >
        <Magnet size={14} />
        Snap
      </button>
      <button type="button" className="toolbar-button" onClick={onZoomOut} title="Zoom out"><ZoomOut size={15} /></button>
      <span className="min-w-12 rounded-md bg-slate-100 px-2 py-1 text-center text-xs font-semibold text-slate-600">
        {Math.round(zoom * 100)}%
      </span>
      <button type="button" className="toolbar-button" onClick={onZoomIn} title="Zoom in"><ZoomIn size={15} /></button>
      <button type="button" className="toolbar-button" onClick={onFitView} title="Centrar canvas"><Maximize2 size={15} /></button>
    </>
  );
}
