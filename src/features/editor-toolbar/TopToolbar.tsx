"use client";

import { Save } from "lucide-react";
import { useState } from "react";

import type { DiagramMode } from "@/entities/wireframe/wireframe.types";
import { ExportFileNameDialog } from "@/features/editor-toolbar/ExportFileNameDialog";
import { ExportMenu, type ExportFormat } from "@/features/editor-toolbar/ExportMenu";
import { ToolbarHistoryControls } from "@/features/editor-toolbar/ToolbarHistoryControls";
import { ToolbarModeSwitch } from "@/features/editor-toolbar/ToolbarModeSwitch";
import { ToolbarPanelToggles } from "@/features/editor-toolbar/ToolbarPanelToggles";
import { ToolbarProjectTitle } from "@/features/editor-toolbar/ToolbarProjectTitle";
import { ToolbarViewportControls } from "@/features/editor-toolbar/ToolbarViewportControls";
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
      <ToolbarProjectTitle name={project.name} lastSavedAt={lastSavedAt} onBack={onBack} />
      <div className="flex items-center gap-2">
        <ToolbarModeSwitch
          mode={mode}
          onModeChange={(nextMode) => {
            setExportOpen(false);
            onModeChange(nextMode);
          }}
        />
        <ToolbarHistoryControls canUndo={canUndo} canRedo={canRedo} onUndo={onUndo} onRedo={onRedo} />
        <ToolbarViewportControls
          showGrid={showGrid}
          snapToGrid={snapToGrid}
          zoom={zoom}
          onToggleGrid={onToggleGrid}
          onToggleSnap={onToggleSnap}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
          onFitView={onFitView}
        />
        <ToolbarPanelToggles
          showLibraryPanel={showLibraryPanel}
          showPropertiesPanel={showPropertiesPanel}
          onToggleLibraryPanel={onToggleLibraryPanel}
          onTogglePropertiesPanel={onTogglePropertiesPanel}
        />
      </div>
      <div className="flex items-center gap-2">
        <button type="button" className="secondary-button" onClick={onSave}>
          <Save size={15} />
          Guardar
        </button>
        <ExportMenu open={exportOpen} onToggle={() => setExportOpen((current) => !current)} onRequest={requestExport} />
      </div>
      {pendingExport ? (
        <ExportFileNameDialog
          format={pendingExport}
          fileName={exportFileName}
          onFileNameChange={setExportFileName}
          onCancel={() => setPendingExport(null)}
          onConfirm={confirmExport}
        />
      ) : null}
    </header>
  );
}
