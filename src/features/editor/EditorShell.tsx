"use client";

import {
  Edge,
  MarkerType,
  addEdge,
  reconnectEdge,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PanelLeft, PanelRight } from "lucide-react";

import {
  applyFlowEdgeLineStyle,
  defaultFlowSourceHandle,
  defaultFlowTargetHandle,
  flowNodeDefaults,
  normalizeConnection,
  normalizeFlowEdges,
} from "@/entities/flow/flow-templates";
import type { FlowNodeType, FlowNodeVariant } from "@/entities/flow/flow.types";
import type { Project } from "@/entities/project/project.types";
import type { DiagramMode } from "@/entities/wireframe/wireframe.types";
import { exportJson, exportSvg } from "@/features/export/export-actions";
import { exportPdfFromElement } from "@/features/export/export-pdf";
import { exportPngFromElement } from "@/features/export/export-png";
import { TopToolbar } from "@/features/editor-toolbar/TopToolbar";
import { DiagramCanvas } from "@/features/editor/flow/DiagramCanvas";
import { useDiagramClipboard } from "@/features/editor/hooks/useDiagramClipboard";
import { diagramNodeTools } from "@/features/editor/library/library-constants";
import { DiagramPropertiesPanel } from "@/features/editor/panels/DiagramPropertiesPanel";
import { LibraryPanel } from "@/features/editor/panels/LibraryPanel";
import { PropertiesPanel } from "@/features/editor/panels/PropertiesPanel";
import { WireframeCanvas } from "@/features/editor/wireframe/WireframeCanvas";
import { loadProjectDocument, saveProjectDocument } from "@/features/projects/project-client";
import { useEditorStore } from "@/stores/editor";
import { editorStorageVersion } from "@/shared/config/editor";
import { cn } from "@/lib/utils";
import type { EditorDocument } from "@/types/project";

const EDITOR_PANELS_STORAGE_KEY = "maketar-editor-panels";

type EditorPanelVisibility = {
  library: boolean;
  properties: boolean;
};

function readEditorPanelVisibility(): EditorPanelVisibility {
  if (typeof window === "undefined") {
    return { library: true, properties: true };
  }

  try {
    const raw = window.localStorage.getItem(EDITOR_PANELS_STORAGE_KEY);
    if (!raw) return { library: true, properties: true };
    const parsed = JSON.parse(raw) as Partial<EditorPanelVisibility>;
    return {
      library: parsed.library ?? true,
      properties: parsed.properties ?? true,
    };
  } catch {
    return { library: true, properties: true };
  }
}

const sameStringList = (left: string[], right: string[]) =>
  left.length === right.length && left.every((item, index) => item === right[index]);

function getImageNodeSize(imageSrc: string, fallback: { width: number; height: number }) {
  return new Promise<{ width: number; height: number }>((resolve) => {
    if (typeof window === "undefined") {
      resolve(fallback);
      return;
    }

    const image = new window.Image();
    image.onload = () => {
      const naturalWidth = image.naturalWidth || fallback.width;
      const naturalHeight = image.naturalHeight || fallback.height;
      const maxWidth = 260;
      const maxHeight = 220;
      const minWidth = 96;
      const minHeight = 72;
      const scale = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight, 1);
      resolve({
        width: Math.max(minWidth, Math.round(naturalWidth * scale)),
        height: Math.max(minHeight, Math.round(naturalHeight * scale)),
      });
    };
    image.onerror = () => resolve(fallback);
    image.src = imageSrc;
  });
}

function getInitialDiagramState(document: EditorDocument | null) {
  if (!document) {
    return { nodes: [] as FlowNodeType[], edges: [] as Edge[], ready: false };
  }

  const nodes = Array.isArray(document.diagramNodes) ? document.diagramNodes as FlowNodeType[] : [];
  const edges = Array.isArray(document.diagramEdges)
    ? normalizeFlowEdges(document.diagramEdges as Edge[], nodes, { repairHandles: true })
    : [];

  return { nodes, edges, ready: true };
}

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
  const [showLibraryPanel, setShowLibraryPanel] = useState(() => readEditorPanelVisibility().library);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(() => readEditorPanelVisibility().properties);
  const initialDiagramState = getInitialDiagramState(initialDocument);
  const [diagramReady, setDiagramReady] = useState(initialDiagramState.ready);
  const [diagramFlowReady, setDiagramFlowReady] = useState(false);
  const [diagramNodes, setDiagramNodes, onDiagramNodesChange] = useNodesState<FlowNodeType>(initialDiagramState.nodes);
  const [diagramEdges, setDiagramEdges, onDiagramEdgesChange] = useEdgesState(initialDiagramState.edges);
  const [selectedDiagramNodeId, setSelectedDiagramNodeId] = useState<string | null>(null);
  const [selectedDiagramEdgeId, setSelectedDiagramEdgeId] = useState<string | null>(null);
  const [selectedDiagramNodeIds, setSelectedDiagramNodeIds] = useState<string[]>([]);
  const [selectedDiagramEdgeIds, setSelectedDiagramEdgeIds] = useState<string[]>([]);
  const shapes = useMemo(
    () => pages.find((page) => page.id === currentPageId)?.shapes ?? [],
    [pages, currentPageId],
  );
  const selectedShape = shapes.find((shape) => shape.id === selectedId) ?? null;
  const selectedDiagramNode = diagramNodes.find((node) => node.id === selectedDiagramNodeId) ?? null;
  const selectedDiagramEdge = diagramEdges.find((edge) => edge.id === selectedDiagramEdgeId) ?? null;

  const {
    copyDiagramSelection,
    pasteDiagramClipboard,
    duplicateDiagramSelection,
    duplicateDiagramNode,
  } = useDiagramClipboard({
    diagramNodes,
    selectedDiagramNodeIds,
    setDiagramNodes,
    selectionSetters: {
      setSelectedDiagramNodeId,
      setSelectedDiagramEdgeId,
      setSelectedDiagramNodeIds,
      setSelectedDiagramEdgeIds,
    },
  });

  const updateDiagramNodeLabel = useCallback((id: string, label: string) => {
    setDiagramNodes((nodes) =>
      nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, label } } : node,
      ),
    );
  }, [setDiagramNodes]);

  const addDiagramNode = useCallback((variant: FlowNodeVariant, label?: string, center?: { x: number; y: number }) => {
    const nodeCount = diagramNodes.length + 1;
    const defaultLabel = label ?? diagramNodeTools.find((tool) => tool.variant === variant)?.label ?? "Nodo";
    const defaults = flowNodeDefaults[variant];
    const position = center
      ? { x: Math.round(center.x - defaults.width / 2), y: Math.round(center.y - defaults.height / 2) }
      : { x: 180 + (nodeCount % 3) * 210, y: 160 + Math.floor(nodeCount / 3) * 130 };
    const node: FlowNodeType = {
      id: `flow-node-${Date.now()}`,
      type: "maketarFlow",
      position,
      width: defaults.width,
      height: defaults.height,
      style: { width: defaults.width, height: defaults.height },
      zIndex: variant === "group" ? -1 : undefined,
      selected: variant !== "group",
      data: {
        label: defaultLabel,
        variant,
        fill: defaults.fill,
        stroke: defaults.stroke,
        textColor: defaults.textColor,
      },
    };
    setDiagramNodes((nodes) =>
      variant === "group"
        ? [node, ...nodes.map((item) => ({ ...item, selected: false }))]
        : [...nodes, node],
    );
  }, [diagramNodes.length, setDiagramNodes]);

  const addDiagramIcon = useCallback((iconName: string, iconSet: string, svgSrc?: string, displayLabel?: string, center?: { x: number; y: number }) => {
    const nodeCount = diagramNodes.length + 1;
    const defaults = flowNodeDefaults.icon;
    const position = center
      ? { x: Math.round(center.x - defaults.width / 2), y: Math.round(center.y - defaults.height / 2) }
      : { x: 180 + (nodeCount % 3) * 210, y: 160 + Math.floor(nodeCount / 3) * 130 };
    setDiagramNodes((nodes) => [
      ...nodes,
      {
        id: `flow-icon-${Date.now()}`,
        type: "maketarFlow",
        position,
        width: defaults.width,
        height: defaults.height,
        style: { width: defaults.width, height: defaults.height },
        data: {
          label: displayLabel ?? iconName.replace(/^Tb/, ""),
          variant: "icon",
          iconName,
          iconSet,
          svgSrc,
          fill: defaults.fill,
          stroke: defaults.stroke,
          textColor: defaults.textColor,
        },
      },
    ]);
  }, [diagramNodes.length, setDiagramNodes]);

  const addDiagramImage = useCallback((imageSrc: string, name = "Imagen") => {
    const nodeCount = diagramNodes.length + 1;
    const defaults = flowNodeDefaults.image;
    void getImageNodeSize(imageSrc, { width: defaults.width, height: defaults.height }).then((size) => {
      setDiagramNodes((nodes) => [
        ...nodes,
        {
          id: `flow-image-${Date.now()}`,
          type: "maketarFlow",
          position: { x: 180 + (nodeCount % 3) * 210, y: 160 + Math.floor(nodeCount / 3) * 130 },
          style: { width: size.width, height: size.height },
          data: {
            label: name.replace(/\.[^.]+$/i, "") || "Imagen",
            variant: "image",
            imageSrc,
            fill: defaults.fill,
            stroke: defaults.stroke,
            textColor: defaults.textColor,
          },
        },
      ]);
    });
  }, [diagramNodes.length, setDiagramNodes]);

  const updateDiagramNode = useCallback((id: string, patch: Partial<FlowNodeType>) => {
    setDiagramNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              ...patch,
              data: { ...node.data, ...patch.data },
              position: patch.position ?? node.position,
            }
          : node,
      ),
    );
  }, [setDiagramNodes]);

  const updateDiagramEdge = useCallback((id: string, patch: Partial<Edge>) => {
    setDiagramEdges((edges) => edges.map((edge) => edge.id === id ? { ...edge, ...patch } : edge));
  }, [setDiagramEdges]);

  const deleteDiagramSelection = useCallback(() => {
    if (!selectedDiagramNodeIds.length && !selectedDiagramEdgeIds.length) return;
    const nodeIds = new Set(selectedDiagramNodeIds);
    const edgeIds = new Set(selectedDiagramEdgeIds);
    setDiagramNodes((nodes) => nodes.filter((node) => !nodeIds.has(node.id)));
    setDiagramEdges((edges) =>
      edges.filter(
        (edge) =>
          !edgeIds.has(edge.id) &&
          !nodeIds.has(edge.source) &&
          !nodeIds.has(edge.target),
      ),
    );
    setSelectedDiagramNodeId(null);
    setSelectedDiagramEdgeId(null);
    setSelectedDiagramNodeIds([]);
    setSelectedDiagramEdgeIds([]);
  }, [selectedDiagramEdgeIds, selectedDiagramNodeIds, setDiagramEdges, setDiagramNodes]);

  const deleteDiagramNode = useCallback((id: string) => {
    setDiagramNodes((nodes) => nodes.filter((node) => node.id !== id));
    setDiagramEdges((edges) => edges.filter((edge) => edge.source !== id && edge.target !== id));
    setSelectedDiagramNodeIds((ids) => ids.filter((nodeId) => nodeId !== id));
    setSelectedDiagramNodeId((current) => current === id ? null : current);
  }, [setDiagramEdges, setDiagramNodes]);

  const deleteDiagramEdge = useCallback((id: string) => {
    setDiagramEdges((edges) => edges.filter((edge) => edge.id !== id));
    setSelectedDiagramEdgeIds((ids) => ids.filter((edgeId) => edgeId !== id));
    setSelectedDiagramEdgeId((current) => current === id ? null : current);
  }, [setDiagramEdges]);

  const diagramNodesWithHandlers = useMemo(
    () =>
      diagramNodes.map((node) => {
        const defaults = flowNodeDefaults[node.data.variant];
        const styleWidth = node.style?.width;
        const styleHeight = node.style?.height;
        const resolvedWidth = node.width ?? (typeof styleWidth === "number" ? styleWidth : defaults.width);
        const resolvedHeight = node.height ?? (typeof styleHeight === "number" ? styleHeight : defaults.height);

        return {
          ...node,
          width: resolvedWidth,
          height: resolvedHeight,
          data: { ...node.data, onChange: updateDiagramNodeLabel },
        };
      }),
    [diagramNodes, updateDiagramNodeLabel],
  );

  const handleDiagramFlowReady = useCallback(() => {
    setDiagramFlowReady(true);
  }, []);

  const handleModeChange = useCallback((nextMode: DiagramMode) => {
    if (nextMode === "diagram") {
      setDiagramFlowReady(false);
    }
    setMode(nextMode);
  }, [setMode]);

  const handleDiagramSelectionChange = useCallback((nodeIds: string[], edgeIds: string[]) => {
    if (sameStringList(nodeIds, selectedDiagramNodeIds) && sameStringList(edgeIds, selectedDiagramEdgeIds)) {
      return;
    }

    setSelectedDiagramNodeIds(nodeIds);
    setSelectedDiagramEdgeIds(edgeIds);
    setSelectedDiagramNodeId(nodeIds[0] ?? null);
    setSelectedDiagramEdgeId(edgeIds[0] ?? null);
  }, [selectedDiagramEdgeIds, selectedDiagramNodeIds]);

  useEffect(() => {
    let alive = true;
    const applyDocument = (document: EditorDocument) => {
      const nextDiagramNodes = Array.isArray(document.diagramNodes) ? document.diagramNodes as FlowNodeType[] : [];
      useEditorStore.getState().hydrate(document);
      setDiagramNodes(nextDiagramNodes);
      setDiagramEdges(Array.isArray(document.diagramEdges) ? normalizeFlowEdges(document.diagramEdges as Edge[], nextDiagramNodes, { repairHandles: true }) : []);
      setDiagramFlowReady(false);
      setDiagramReady(true);
    };

    if (initialDocument) {
      applyDocument(initialDocument);
      return () => {
        alive = false;
      };
    }

    loadProjectDocument(project.id).then(({ document }) => {
      if (!alive) return;
      if (document) {
        applyDocument(document);
      } else {
        setDiagramReady(true);
      }
    });

    return () => {
      alive = false;
    };
  }, [initialDocument, project.id, setDiagramEdges, setDiagramNodes]);

  useEffect(() => {
    window.localStorage.setItem(
      EDITOR_PANELS_STORAGE_KEY,
      JSON.stringify({ library: showLibraryPanel, properties: showPropertiesPanel }),
    );
  }, [showLibraryPanel, showPropertiesPanel]);

  const saveProject = useCallback(() => {
    void saveProjectDocument(
      project.id,
      {
        version: editorStorageVersion,
        pages,
        currentPageId,
        mode,
        zoom,
        showGrid,
        snapToGrid,
        gridSize,
        diagramNodes,
        diagramEdges,
      },
    );
    markSaved();
  }, [currentPageId, diagramEdges, diagramNodes, gridSize, markSaved, mode, pages, project.id, showGrid, snapToGrid, zoom]);

  useEffect(() => {
    if (!diagramReady) return;
    if (mode === "diagram" && !diagramFlowReady) return;
    const timeout = window.setTimeout(saveProject, 650);
    return () => window.clearTimeout(timeout);
  }, [diagramFlowReady, diagramReady, mode, saveProject]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const key = event.key.toLowerCase();
      const isTextEditing = target?.matches("input, textarea, select, [contenteditable='true']");
      if (isTextEditing && !((event.metaKey || event.ctrlKey) && key === "r")) return;
      if ((event.metaKey || event.ctrlKey) && key === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }
      if ((event.metaKey || event.ctrlKey) && key === "y") {
        event.preventDefault();
        redo();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && key === "r") {
        event.preventDefault();
        redo();
        return;
      }
      if (mode === "diagram") {
        if ((event.metaKey || event.ctrlKey) && key === "c") {
          event.preventDefault();
          copyDiagramSelection();
          return;
        }
        if ((event.metaKey || event.ctrlKey) && key === "v") {
          event.preventDefault();
          pasteDiagramClipboard();
          return;
        }
        if ((event.metaKey || event.ctrlKey) && key === "d") {
          event.preventDefault();
          duplicateDiagramSelection();
          return;
        }
        if (event.key === "Delete" || event.key === "Backspace") {
          event.preventDefault();
          deleteDiagramSelection();
        }
        return;
      }
      if ((event.metaKey || event.ctrlKey) && key === "v") {
        event.preventDefault();
        pasteClipboard();
        return;
      }
      if (selectedIds.length === 0) return;
      if ((event.metaKey || event.ctrlKey) && key === "c") {
        event.preventDefault();
        copySelected();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && key === "d") {
        event.preventDefault();
        duplicateShape();
        return;
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        deleteSelected();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    copyDiagramSelection,
    copySelected,
    deleteDiagramSelection,
    deleteSelected,
    duplicateDiagramSelection,
    duplicateShape,
    mode,
    pasteClipboard,
    pasteDiagramClipboard,
    redo,
    selectedIds.length,
    undo,
  ]);

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
          showLibraryPanel={showLibraryPanel}
          showPropertiesPanel={showPropertiesPanel}
          onToggleLibraryPanel={() => setShowLibraryPanel((current) => !current)}
          onTogglePropertiesPanel={() => setShowPropertiesPanel((current) => !current)}
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
            diagramNodes,
            diagramEdges,
          }, fileName)}
          onExportSvg={(fileName) => exportSvg(shapes, fileName)}
          onExportPng={exportPng}
          onExportPdf={exportPdf}
        />
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {showLibraryPanel ? (
            <LibraryPanel
              mode={mode}
              pages={pages}
              currentPageId={currentPageId}
              onSwitchPage={switchPage}
              onCreatePage={createPage}
              onDuplicatePage={duplicatePage}
              onDeletePage={deletePage}
              onAddShape={addShape}
              onAddDiagramNode={addDiagramNode}
              onAddImage={addImageShape}
              onAddTemplate={addTemplate}
              onAddIcon={addIconShape}
              onAddCustomIcon={addCustomIconShape}
              onAddDiagramIcon={addDiagramIcon}
              onAddDiagramImage={addDiagramImage}
              onHide={() => setShowLibraryPanel(false)}
            />
          ) : null}
          <div ref={canvasRef} className="relative min-h-0 min-w-0 flex-1 bg-[#e8edf5]">
            {!showLibraryPanel ? (
              <button
                type="button"
                className={cn("absolute left-3 top-3 z-20 toolbar-button bg-white shadow-sm")}
                title="Mostrar panel insertar"
                aria-label="Mostrar panel insertar"
                onClick={() => setShowLibraryPanel(true)}
              >
                <PanelLeft size={16} />
              </button>
            ) : null}
            {!showPropertiesPanel ? (
              <button
                type="button"
                className={cn("absolute right-3 top-3 z-20 toolbar-button bg-white shadow-sm")}
                title="Mostrar propiedades"
                aria-label="Mostrar propiedades"
                onClick={() => setShowPropertiesPanel(true)}
              >
                <PanelRight size={16} />
              </button>
            ) : null}
            {mode === "wireframe" ? (
              <WireframeCanvas />
            ) : (
              <DiagramCanvas
                nodes={diagramNodesWithHandlers}
                edges={diagramEdges}
                onDiagramFlowReady={handleDiagramFlowReady}
                onDropFlowNode={addDiagramNode}
                onDropFlowIcon={addDiagramIcon}
                onNodesChange={onDiagramNodesChange}
                onEdgesChange={onDiagramEdgesChange}
                onConnect={(connection) =>
                  setDiagramEdges((edges) => {
                    const normalizedConnection = normalizeConnection(connection, diagramNodes);
                    return addEdge(
                      {
                        ...normalizedConnection,
                        sourceHandle: normalizedConnection.sourceHandle ?? defaultFlowSourceHandle,
                        targetHandle: normalizedConnection.targetHandle ?? defaultFlowTargetHandle,
                        type: "smoothstep",
                        reconnectable: true,
                        interactionWidth: 32,
                        markerEnd: { type: MarkerType.ArrowClosed },
                        label: "",
                        data: { lineStyle: "solid" },
                        style: { strokeWidth: 2.5 },
                      },
                      edges,
                    ).map((edge) => applyFlowEdgeLineStyle(edge));
                  })
                }
                onReconnect={(oldEdge, connection) =>
                  setDiagramEdges((edges) => {
                    const normalizedConnection = normalizeConnection(connection, diagramNodes);
                    return reconnectEdge(
                      oldEdge,
                      {
                        ...normalizedConnection,
                        sourceHandle: normalizedConnection.sourceHandle ?? defaultFlowSourceHandle,
                        targetHandle: normalizedConnection.targetHandle ?? defaultFlowTargetHandle,
                      },
                      edges,
                    ).map((edge) => applyFlowEdgeLineStyle({ ...edge, type: "smoothstep", reconnectable: true, interactionWidth: edge.interactionWidth ?? 32 }));
                  })
                }
                onEdgeLabelChange={(id, label) =>
                  setDiagramEdges((edges) =>
                    edges.map((edge) => edge.id === id ? { ...edge, label } : edge),
                  )
                }
                onSelectionChange={handleDiagramSelectionChange}
                onDeleteSelection={deleteDiagramSelection}
                onDeleteNode={deleteDiagramNode}
                onDeleteEdge={deleteDiagramEdge}
                onDuplicateNode={duplicateDiagramNode}
                onDuplicateSelection={duplicateDiagramSelection}
                onCopySelection={copyDiagramSelection}
                onPaste={pasteDiagramClipboard}
              />
            )}
          </div>
          {showPropertiesPanel ? (
            mode === "wireframe" ? (
              <PropertiesPanel selectedShape={selectedShape} onHide={() => setShowPropertiesPanel(false)} />
            ) : (
              <DiagramPropertiesPanel
                selectedNode={selectedDiagramNode}
                selectedEdge={selectedDiagramEdge}
                onUpdateNode={updateDiagramNode}
                onUpdateEdge={updateDiagramEdge}
                onDeleteEdge={deleteDiagramEdge}
                onHide={() => setShowPropertiesPanel(false)}
              />
            )
          ) : null}
        </div>
      </section>
    </div>
  );
}
