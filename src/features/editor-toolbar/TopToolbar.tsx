"use client";

import {
  ArrowLeft,
  ChevronDown,
  Download,
  Grid3X3,
  Magnet,
  Maximize2,
  PanelLeft,
  PanelRight,
  Redo2,
  Save,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useState } from "react";
import type { DiagramMode } from "@/entities/wireframe/wireframe.types";
import { cn } from "@/lib/utils";
import { sanitizeFileName } from "@/shared/lib/export-utils";

type ToolbarProject = {
  name: string;
};

export type TopToolbarProps = {
  project: ToolbarProject;
  mode: DiagramMode;
  lastSavedAt: string;
  showGrid: boolean;
  snapToGrid: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onBack: () => void;
  onModeChange: (mode: DiagramMode) => void;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  zoom: number;
  onToggleGrid: () => void;
  onToggleSnap: () => void;
  showLibraryPanel: boolean;
  showPropertiesPanel: boolean;
  onToggleLibraryPanel: () => void;
  onTogglePropertiesPanel: () => void;
  onFitView: () => void;
  onSave: () => void;
  onExportJson: (fileName: string) => void;
  onExportSvg: (fileName: string) => void;
  onExportPng: (fileName: string) => void;
  onExportPdf: (fileName: string) => void;
};

type ExportFormat = "png" | "svg" | "pdf" | "json";

export function TopToolbar({
  project,
  mode,
  lastSavedAt,
  showGrid,
  snapToGrid,
  canUndo,
  canRedo,
  onBack,
  onModeChange,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  zoom,
  onToggleGrid,
  onToggleSnap,
  showLibraryPanel,
  showPropertiesPanel,
  onToggleLibraryPanel,
  onTogglePropertiesPanel,
  onFitView,
  onSave,
  onExportJson,
  onExportSvg,
  onExportPng,
  onExportPdf,
}: TopToolbarProps) {
  const [exportOpen, setExportOpen] = useState(false);
  const [pendingExport, setPendingExport] = useState<ExportFormat | null>(null);
  const [exportFileName, setExportFileName] = useState(sanitizeFileName(project.name));

  const requestExport = (format: ExportFormat) => {
    setExportOpen(false);
    setPendingExport(format);
    setExportFileName(sanitizeFileName(project.name));
  };

  const confirmExport = () => {
    if (!pendingExport) return;
    const fileName = sanitizeFileName(exportFileName || project.name);
    if (pendingExport === "png") onExportPng(fileName);
    if (pendingExport === "svg") onExportSvg(fileName);
    if (pendingExport === "pdf") onExportPdf(fileName);
    if (pendingExport === "json") onExportJson(fileName);
    setPendingExport(null);
  };

  return (
    <header className="relative flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-3">
      <div className="flex min-w-0 items-center gap-2">
        <button type="button" className="toolbar-button" title="Volver a proyectos" onClick={onBack}>
          <ArrowLeft size={16} />
        </button>
        <div className="min-w-0 px-2">
          <div className="truncate text-sm font-semibold">{project.name}</div>
          <div className="truncate text-xs text-slate-500">{lastSavedAt}</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => {
              setExportOpen(false);
              onModeChange("wireframe");
            }}
            className={cn("segmented-button", mode === "wireframe" && "is-active")}
          >
            Wireframe
          </button>
          <button
            type="button"
            onClick={() => {
              setExportOpen(false);
              onModeChange("diagram");
            }}
            className={cn("segmented-button", mode === "diagram" && "is-active")}
          >
            Flujo
          </button>
        </div>
        <div className="flex items-center gap-1 rounded-md border border-slate-200 p-1">
          <button
            type="button"
            className="toolbar-button"
            title="Deshacer (Cmd/Ctrl+Z)"
            onClick={onUndo}
            disabled={!canUndo}
          >
            <Undo2 size={15} />
          </button>
          <button
            type="button"
            className="toolbar-button"
            title="Rehacer (Cmd/Ctrl+R, Cmd/Ctrl+Y o Cmd/Ctrl+Shift+Z)"
            onClick={onRedo}
            disabled={!canRedo}
          >
            <Redo2 size={15} />
          </button>
        </div>
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
        <div className="mx-1 h-6 w-px bg-slate-200" aria-hidden="true" />
        <button
          type="button"
          className={cn("toolbar-button", showLibraryPanel && "is-active")}
          onClick={onToggleLibraryPanel}
          title={showLibraryPanel ? "Ocultar panel insertar" : "Mostrar panel insertar"}
          aria-pressed={showLibraryPanel}
        >
          <PanelLeft size={15} />
        </button>
        <button
          type="button"
          className={cn("toolbar-button", showPropertiesPanel && "is-active")}
          onClick={onTogglePropertiesPanel}
          title={showPropertiesPanel ? "Ocultar propiedades" : "Mostrar propiedades"}
          aria-pressed={showPropertiesPanel}
        >
          <PanelRight size={15} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button type="button" className="secondary-button" onClick={onSave}>
          <Save size={15} />
          Guardar
        </button>
        <div className="relative">
          <button className="primary-button" onClick={() => setExportOpen((current) => !current)}>
            <Download size={15} />
            Exportar
            <ChevronDown size={14} />
          </button>
          {exportOpen ? (
            <div className="absolute right-0 top-10 z-50 w-40 rounded-md border border-slate-200 bg-white p-1 text-sm shadow-xl">
              <ExportMenuButton label="PNG" onClick={() => requestExport("png")} />
              <ExportMenuButton label="SVG" onClick={() => requestExport("svg")} />
              <ExportMenuButton label="PDF" onClick={() => requestExport("pdf")} />
              <ExportMenuButton label="JSON" onClick={() => requestExport("json")} />
            </div>
          ) : null}
        </div>
      </div>
      {pendingExport ? (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/25 p-4">
          <div className="w-full max-w-[380px] rounded-md border border-slate-200 bg-white p-4 text-sm shadow-xl">
            <h2 className="font-semibold text-slate-950">Exportar {pendingExport.toUpperCase()}</h2>
            <p className="mt-1 text-xs text-slate-500">Elige el nombre del fichero antes de descargar.</p>
            <label className="property-label mt-4">
              Nombre del fichero
              <div className="flex items-center gap-2">
                <input
                  className="property-input"
                  autoFocus
                  value={exportFileName}
                  onChange={(event) => setExportFileName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") confirmExport();
                    if (event.key === "Escape") setPendingExport(null);
                  }}
                />
                <span className="rounded-md bg-slate-100 px-2 py-2 text-xs font-semibold text-slate-500">
                  .{pendingExport}
                </span>
              </div>
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button className="secondary-button" onClick={() => setPendingExport(null)}>
                Cancelar
              </button>
              <button className="primary-button" onClick={confirmExport}>
                <Download size={15} />
                Exportar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function ExportMenuButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      className="block w-full rounded px-3 py-2 text-left hover:bg-slate-50"
      onClick={onClick}
    >
      {label}
    </button>
  );
}
