"use client";

import { useCallback, useMemo, useRef } from "react";
import { PanelLeft, PanelRight } from "lucide-react";

import type { Project } from "@/entities/project/project.types";
import type { DiagramMode } from "@/entities/wireframe/wireframe.types";
import { TopToolbar } from "@/features/editor-toolbar/TopToolbar";
import { connectFlowEdge, reconnectFlowEdge } from "@/features/editor/flow/connect-flow-edge";
import { DiagramCanvas } from "@/features/editor/flow/DiagramCanvas";
import { useDiagramClipboard } from "@/features/editor/hooks/useDiagramClipboard";
import { useDiagramGraph } from "@/features/editor/hooks/useDiagramGraph";
import { useEditorAutosave } from "@/features/editor/hooks/useEditorAutosave";
import { useEditorHotkeys } from "@/features/editor/hooks/useEditorHotkeys";
import { useEditorPanelVisibility } from "@/features/editor/hooks/useEditorPanelVisibility";
import { DiagramPropertiesPanel } from "@/features/editor/panels/DiagramPropertiesPanel";
import { LibraryPanel } from "@/features/editor/panels/LibraryPanel";
import { PropertiesPanel } from "@/features/editor/panels/PropertiesPanel";
import { WireframeCanvas } from "@/features/editor/wireframe/WireframeCanvas";
import { exportJson, exportSvg } from "@/features/export/export-actions";
import { exportPdfFromElement } from "@/features/export/export-pdf";
import { exportPngFromElement } from "@/features/export/export-png";
import { useEditorStore } from "@/stores/editor";
import { editorStorageVersion } from "@/shared/config/editor";
import { cn } from "@/lib/utils";
import type { EditorDocument } from "@/types/project";

export function EditorShell({
  project,
  onBack,
  initialDocument,
}: {
  project: Project;
  onBack: () => void;
  initialDocument: EditorDocument | null;
}) {
  const pages = useEditorStore((state) => state.pages);
  const currentPageId = useEditorStore((state) => state.currentPageId);
  const mode = useEditorStore((state) => state.mode);
  const selectedId = useEditorStore((state) => state.selectedId);
  const selectedIds = useEditorStore((state) => state.selectedIds);
  const zoom = useEditorStore((state) => state.zoom);
  const showGrid = useEditorStore((state) => state.showGrid);
  const snapToGrid = useEditorStore((state) => state.snapToGrid);
  const gridSize = useEditorStore((state) => state.gridSize);
  const lastSavedAt = useEditorStore((state) => state.lastSavedAt);
  const canUndo = useEditorStore((state) => state.past.length > 0);
  const canRedo = useEditorStore((state) => state.future.length > 0);
  const setMode = useEditorStore((state) => state.setMode);
  const addShape = useEditorStore((state) => state.addShape);
  const addImageShape = useEditorStore((state) => state.addImageShape);
  const addIconShape = useEditorStore((state) => state.addIconShape);
  const addCustomIconShape = useEditorStore((state) => state.addCustomIconShape);
  const addTemplate = useEditorStore((state) => state.addTemplate);
  const setZoom = useEditorStore((state) => state.setZoom);
  const setPan = useEditorStore((state) => state.setPan);
  const toggleGrid = useEditorStore((state) => state.toggleGrid);
  const toggleSnap = useEditorStore((state) => state.toggleSnap);
  const deleteSelected = useEditorStore((state) => state.deleteSelected);
  const copySelected = useEditorStore((state) => state.copySelected);
  const pasteClipboard = useEditorStore((state) => state.pasteClipboard);
  const duplicateShape = useEditorStore((state) => state.duplicateShape);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const createPage = useEditorStore((state) => state.createPage);
  const duplicatePage = useEditorStore((state) => state.duplicatePage);
  const switchPage = useEditorStore((state) => state.switchPage);
  const deletePage = useEditorStore((state) => state.deletePage);
  const markSaved = useEditorStore((state) => state.markSaved);
  const canvasRef = useRef<HTMLDivElement>(null);
  const panels = useEditorPanelVisibility();
  const graph = useDiagramGraph(initialDocument);
  const shapes = useMemo(
    () => pages.find((page) => page.id === currentPageId)?.shapes ?? [],
    [pages, currentPageId],
  );
  const selectedShape = shapes.find((shape) => shape.id === selectedId) ?? null;
  const selectedDiagramNode = graph.diagramNodes.find((node) => node.id === graph.selectedDiagramNodeId) ?? null;
  const selectedDiagramEdge = graph.diagramEdges.find((edge) => edge.id === graph.selectedDiagramEdgeId) ?? null;
  const clipboard = useDiagramClipboard({
    diagramNodes: graph.diagramNodes,
    selectedDiagramNodeIds: graph.selectedDiagramNodeIds,
    setDiagramNodes: graph.setDiagramNodes,
    selectionSetters: {
      setSelectedDiagramNodeId: graph.setSelectedDiagramNodeId,
      setSelectedDiagramEdgeId: graph.setSelectedDiagramEdgeId,
      setSelectedDiagramNodeIds: graph.setSelectedDiagramNodeIds,
      setSelectedDiagramEdgeIds: graph.setSelectedDiagramEdgeIds,
    },
  });

  const saveProject = useEditorAutosave({
    projectId: project.id,
    diagramFlowReady: graph.diagramFlowReady,
    mode,
    pages,
    currentPageId,
    zoom,
    showGrid,
    snapToGrid,
    gridSize,
    diagramNodes: graph.diagramNodes,
    diagramEdges: graph.diagramEdges,
    markSaved,
  });

  useEditorHotkeys({
    mode,
    selectedCount: selectedIds.length,
    undo,
    redo,
    copyDiagramSelection: clipboard.copyDiagramSelection,
    pasteDiagramClipboard: clipboard.pasteDiagramClipboard,
    duplicateDiagramSelection: clipboard.duplicateDiagramSelection,
    deleteDiagramSelection: graph.deleteDiagramSelection,
    copySelected,
    pasteClipboard,
    duplicateShape,
    deleteSelected,
  });

  const setDiagramFlowReady = graph.setDiagramFlowReady;
  const handleModeChange = useCallback((nextMode: DiagramMode) => {
    if (nextMode === "diagram") setDiagramFlowReady(false);
    setMode(nextMode);
  }, [setDiagramFlowReady, setMode]);

  const exportPng = async (fileName: string) => {
    if (!canvasRef.current) return;
    await exportPngFromElement(canvasRef.current, fileName);
  };

  const exportPdf = async (fileName: string) => {
    if (!canvasRef.current) return;
    await exportPdfFromElement(canvasRef.current, fileName);
  };

  return (
    <div className="flex h-full min-h-0">
      <section className="flex min-h-0 min-w-0 flex-1 flex-col">
        <TopToolbar
          project={project}
          mode={mode}
          lastSavedAt={lastSavedAt}
          showGrid={showGrid}
          snapToGrid={snapToGrid}
          canUndo={canUndo}
          canRedo={canRedo}
          onBack={onBack}
          onModeChange={handleModeChange}
          onUndo={undo}
          onRedo={redo}
          onZoomIn={() => setZoom(zoom + 0.1)}
          onZoomOut={() => setZoom(zoom - 0.1)}
          zoom={zoom}
          onToggleGrid={toggleGrid}
          onToggleSnap={toggleSnap}
          showLibraryPanel={panels.showLibraryPanel}
          showPropertiesPanel={panels.showPropertiesPanel}
          onToggleLibraryPanel={() => panels.setShowLibraryPanel((current) => !current)}
          onTogglePropertiesPanel={() => panels.setShowPropertiesPanel((current) => !current)}
          onFitView={() => {
            setPan({ x: 0, y: 0 });
            setZoom(1);
          }}
          onSave={saveProject}
          onExportJson={(fileName) => exportJson({
            version: editorStorageVersion,
            project,
            pages,
            currentPageId,
            mode,
            zoom,
            showGrid,
            snapToGrid,
            gridSize,
            diagramNodes: graph.diagramNodes,
            diagramEdges: graph.diagramEdges,
          }, fileName)}
          onExportSvg={(fileName) => exportSvg(shapes, fileName)}
          onExportPng={exportPng}
          onExportPdf={exportPdf}
        />
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {panels.showLibraryPanel ? (
            <LibraryPanel
              mode={mode}
              pages={pages}
              currentPageId={currentPageId}
              onSwitchPage={switchPage}
              onCreatePage={createPage}
              onDuplicatePage={duplicatePage}
              onDeletePage={deletePage}
              onAddShape={addShape}
              onAddDiagramNode={graph.addDiagramNode}
              onAddImage={addImageShape}
              onAddTemplate={addTemplate}
              onAddIcon={addIconShape}
              onAddCustomIcon={addCustomIconShape}
              onAddDiagramIcon={graph.addDiagramIcon}
              onAddDiagramImage={graph.addDiagramImage}
              onHide={() => panels.setShowLibraryPanel(false)}
            />
          ) : null}
          <div ref={canvasRef} className="relative min-h-0 min-w-0 flex-1 bg-[#e8edf5]">
            {!panels.showLibraryPanel ? (
              <button type="button" className={cn("absolute left-3 top-3 z-20 toolbar-button bg-white shadow-sm")} title="Mostrar panel insertar" aria-label="Mostrar panel insertar" onClick={() => panels.setShowLibraryPanel(true)}>
                <PanelLeft size={16} />
              </button>
            ) : null}
            {!panels.showPropertiesPanel ? (
              <button type="button" className={cn("absolute right-3 top-3 z-20 toolbar-button bg-white shadow-sm")} title="Mostrar propiedades" aria-label="Mostrar propiedades" onClick={() => panels.setShowPropertiesPanel(true)}>
                <PanelRight size={16} />
              </button>
            ) : null}
            {mode === "wireframe" ? (
              <WireframeCanvas />
            ) : (
              <DiagramCanvas
                nodes={graph.diagramNodesWithHandlers}
                edges={graph.diagramEdges}
                onDiagramFlowReady={() => graph.setDiagramFlowReady(true)}
                onDropFlowNode={graph.addDiagramNode}
                onDropFlowIcon={graph.addDiagramIcon}
                onNodesChange={graph.onDiagramNodesChange}
                onEdgesChange={graph.onDiagramEdgesChange}
                onConnect={(connection) => graph.setDiagramEdges((edges) => connectFlowEdge(edges, connection, graph.diagramNodes))}
                onReconnect={(oldEdge, connection) => graph.setDiagramEdges((edges) => reconnectFlowEdge(edges, oldEdge, connection, graph.diagramNodes))}
                onEdgeLabelChange={(id, label) => graph.setDiagramEdges((edges) => edges.map((edge) => edge.id === id ? { ...edge, label } : edge))}
                onSelectionChange={graph.handleDiagramSelectionChange}
                onDeleteSelection={graph.deleteDiagramSelection}
                onDeleteNode={graph.deleteDiagramNode}
                onDeleteEdge={graph.deleteDiagramEdge}
                onDuplicateNode={clipboard.duplicateDiagramNode}
                onDuplicateSelection={clipboard.duplicateDiagramSelection}
                onCopySelection={clipboard.copyDiagramSelection}
                onPaste={clipboard.pasteDiagramClipboard}
              />
            )}
          </div>
          {panels.showPropertiesPanel ? (
            mode === "wireframe" ? (
              <PropertiesPanel selectedShape={selectedShape} onHide={() => panels.setShowPropertiesPanel(false)} />
            ) : (
              <DiagramPropertiesPanel
                selectedNode={selectedDiagramNode}
                selectedEdge={selectedDiagramEdge}
                onUpdateNode={graph.updateDiagramNode}
                onUpdateEdge={graph.updateDiagramEdge}
                onDeleteEdge={graph.deleteDiagramEdge}
                onHide={() => panels.setShowPropertiesPanel(false)}
              />
            )
          ) : null}
        </div>
      </section>
    </div>
  );
}
