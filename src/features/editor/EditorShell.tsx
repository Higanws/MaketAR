"use client";

import {
  Background,
  BackgroundVariant,
  Connection,
  ConnectionMode,
  Controls,
  Edge,
  Handle,
  MarkerType,
  MiniMap,
  Node,
  NodeResizer,
  NodeProps,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  Position,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  reconnectEdge,
  useEdgesState,
  useNodesInitialized,
  useNodesState,
  useReactFlow,
  useUpdateNodeInternals,
} from "@xyflow/react";
import { toPng } from "html-to-image";
import {
  AlignHorizontalDistributeCenter,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignHorizontalJustifyStart,
  AlignVerticalDistributeCenter,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
  AppWindow,
  BoxSelect,
  Diamond,
  Grid3X3,
  Image as ImageIcon,
  LayoutDashboard,
  Milestone,
  MoveRight,
  PanelRight,
  PanelTop,
  Plus,
  RotateCw,
  Smartphone,
  Square,
  Trash2,
  Type,
} from "lucide-react";
import {
  createElement,
  type DragEvent,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  PointerEvent,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { applyFlowEdgeLineStyle, defaultFlowSourceHandle, defaultFlowTargetHandle, flowEdgeLineStyleOptions, flowNodeDefaults, getFlowEdgeLineStyle, normalizeConnection, normalizeFlowEdges } from "@/entities/flow/flow-templates";
import type { FlowEdgeLineStyle, FlowNodeData, FlowNodeType, FlowNodeVariant, FlowTextAlign, FlowTextVerticalAlign } from "@/entities/flow/flow.types";
import type { Project } from "@/entities/project/project.types";
import { addTableColumn, addTableRow, parseTableText, updateTableCell } from "@/entities/wireframe/table";
import type { DiagramMode, TemplateType, WireShape } from "@/entities/wireframe/wireframe.types";
import { downloadUrl, exportJson, exportSvg } from "@/features/export/export-actions";
import { builtInIconSets, customIconPackagesStorageKey, customIconsStorageKey, iconCatalog, iconLookup, iconResultLimit, type CustomIcon, type IconCatalogItem, type IconComponent } from "@/features/icons/icon-catalog";
import { TopToolbar } from "@/features/editor-toolbar/TopToolbar";
import { categories } from "@/lib/editor-data";
import { useEditorStore } from "@/lib/editor-store";
import { cn } from "@/lib/utils";
import { editorStorageVersion } from "@/shared/config/editor";
import { escapeXml, withAlpha } from "@/shared/lib/export-utils";
import { fontFamilies } from "@/shared/lib/typography";
import { ColorInput, NumberInput, PropertySection, RangeInput } from "@/shared/ui/property-controls";
import type { EditorDocument } from "@/types/project";
import { loadProjectDocument, saveProjectDocument } from "@/features/projects/project-client";

const LIBRARY_DRAG_MIME = "application/maketar-library-item";

type LibraryDragPayload =
  | { kind: "wireframe-shape"; type: WireShape["type"]; label?: string }
  | { kind: "wireframe-template"; template: Exclude<TemplateType, "architecture"> }
  | { kind: "wireframe-icon"; iconName: string; iconSet: string; svgSrc?: string; label?: string }
  | { kind: "wireframe-custom-icon"; name: string; svgSrc: string; iconSet?: string }
  | { kind: "flow-node"; variant: FlowNodeVariant; label?: string }
  | { kind: "flow-icon"; iconName: string; iconSet: string; svgSrc?: string; label?: string };

function parseLibraryDragPayload(raw: string): LibraryDragPayload | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as LibraryDragPayload;
    if (parsed.kind === "wireframe-shape" && typeof parsed.type === "string") return parsed;
    if (parsed.kind === "wireframe-template" && typeof parsed.template === "string") return parsed;
    if (parsed.kind === "wireframe-icon" && typeof parsed.iconName === "string" && typeof parsed.iconSet === "string") return parsed;
    if (parsed.kind === "wireframe-custom-icon" && typeof parsed.name === "string" && typeof parsed.svgSrc === "string") return parsed;
    if (parsed.kind === "flow-node" && typeof parsed.variant === "string") return parsed;
    if (parsed.kind === "flow-icon" && typeof parsed.iconName === "string" && typeof parsed.iconSet === "string") return parsed;
    return null;
  } catch {
    return null;
  }
}

function libraryDragProps(payload: LibraryDragPayload) {
  return {
    draggable: true,
    onDragStart: (event: DragEvent) => {
      event.dataTransfer.setData(LIBRARY_DRAG_MIME, JSON.stringify(payload));
      event.dataTransfer.effectAllowed = "copy";
    },
  };
}

function handleLibraryDragOver(event: DragEvent) {
  if (!event.dataTransfer.types.includes(LIBRARY_DRAG_MIME)) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = "copy";
}

const libraryItemButtonClass =
  "group flex h-[72px] cursor-grab flex-col items-start justify-between rounded-md border border-slate-200 bg-slate-50 p-2 text-left transition hover:border-blue-300 hover:bg-blue-50 active:cursor-grabbing";

const diagramLibraryItemButtonClass =
  "group flex h-[74px] cursor-grab flex-col items-start justify-between rounded-md border border-slate-200 bg-slate-50 p-2 text-left transition hover:border-blue-300 hover:bg-blue-50 active:cursor-grabbing";

const iconTileButtonClass =
  "group grid size-10 cursor-grab place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 active:cursor-grabbing";

function DataFlowNodeIcon({
  size = 18,
  strokeWidth = 1.7,
  className,
}: {
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M8 5h14l-2 14H6L8 5Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </svg>
  );
}

const diagramNodeTools: Array<{ variant: FlowNodeVariant; label: string; icon: IconComponent }> = [
  { variant: "start", label: "Inicio / Fin", icon: Milestone },
  { variant: "process", label: "Proceso", icon: Square },
  { variant: "decision", label: "Decision", icon: Diamond },
  { variant: "data", label: "Entrada / Salida", icon: DataFlowNodeIcon },
  { variant: "image", label: "Imagen", icon: ImageIcon },
  { variant: "text", label: "Texto", icon: Type },
  { variant: "group", label: "Grupo visual", icon: BoxSelect },
];

const diagramConnectorTools = [
  { label: "Flecha", description: "Arrastra desde un punto del nodo hacia otro nodo.", icon: MoveRight },
  { label: "Etiqueta", description: "Haz doble click sobre una flecha para editar su texto.", icon: Type },
];

const editorTemplateOptions: Array<{ type: Exclude<TemplateType, "architecture">; label: string }> = [
  { type: "dashboard", label: "Dashboard" },
  { type: "landing", label: "Landing" },
  { type: "mobile", label: "Mobile" },
  { type: "form", label: "Formulario" },
];

const editorTemplateIcons: Record<Exclude<TemplateType, "architecture">, IconComponent> = {
  dashboard: LayoutDashboard,
  landing: PanelTop,
  mobile: Smartphone,
  form: AppWindow,
};

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
  const initialDiagramState = getInitialDiagramState(initialDocument);
  const [diagramReady, setDiagramReady] = useState(initialDiagramState.ready);
  const [diagramFlowReady, setDiagramFlowReady] = useState(false);
  const [diagramNodes, setDiagramNodes, onDiagramNodesChange] = useNodesState<FlowNodeType>(initialDiagramState.nodes);
  const [diagramEdges, setDiagramEdges, onDiagramEdgesChange] = useEdgesState(initialDiagramState.edges);
  const [selectedDiagramNodeId, setSelectedDiagramNodeId] = useState<string | null>(null);
  const [selectedDiagramEdgeId, setSelectedDiagramEdgeId] = useState<string | null>(null);
  const [selectedDiagramNodeIds, setSelectedDiagramNodeIds] = useState<string[]>([]);
  const [selectedDiagramEdgeIds, setSelectedDiagramEdgeIds] = useState<string[]>([]);
  const [diagramClipboard, setDiagramClipboard] = useState<FlowNodeType[]>([]);
  const shapes = useMemo(
    () => pages.find((page) => page.id === currentPageId)?.shapes ?? [],
    [pages, currentPageId],
  );
  const selectedShape = shapes.find((shape) => shape.id === selectedId) ?? null;
  const selectedDiagramNode = diagramNodes.find((node) => node.id === selectedDiagramNodeId) ?? null;
  const selectedDiagramEdge = diagramEdges.find((edge) => edge.id === selectedDiagramEdgeId) ?? null;
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
  const copyDiagramSelection = useCallback(() => {
    if (!selectedDiagramNodeIds.length) return;
    const ids = new Set(selectedDiagramNodeIds);
    setDiagramClipboard(diagramNodes.filter((node) => ids.has(node.id)));
  }, [diagramNodes, selectedDiagramNodeIds]);
  const pasteDiagramClipboard = useCallback(() => {
    if (!diagramClipboard.length) return;
    const stamp = Date.now();
    const pasted = diagramClipboard.map((node, index) => ({
      ...node,
      id: `flow-node-${stamp}-${index}`,
      selected: true,
      position: { x: node.position.x + 28, y: node.position.y + 28 },
      data: { ...node.data },
    }));
    setDiagramNodes((nodes) => [
      ...nodes.map((node) => ({ ...node, selected: false })),
      ...pasted,
    ]);
    setSelectedDiagramNodeIds(pasted.map((node) => node.id));
    setSelectedDiagramNodeId(pasted[0]?.id ?? null);
    setSelectedDiagramEdgeIds([]);
    setSelectedDiagramEdgeId(null);
  }, [diagramClipboard, setDiagramNodes]);
  const duplicateDiagramSelection = useCallback(() => {
    if (!selectedDiagramNodeIds.length) return;
    const ids = new Set(selectedDiagramNodeIds);
    const stamp = Date.now();
    const duplicated = diagramNodes
      .filter((node) => ids.has(node.id))
      .map((node, index) => ({
        ...node,
        id: `flow-node-${stamp}-${index}`,
        selected: true,
        position: { x: node.position.x + 28, y: node.position.y + 28 },
        data: { ...node.data },
      }));
    setDiagramNodes((nodes) => [
      ...nodes.map((node) => ({ ...node, selected: false })),
      ...duplicated,
    ]);
    setSelectedDiagramNodeIds(duplicated.map((node) => node.id));
    setSelectedDiagramNodeId(duplicated[0]?.id ?? null);
    setSelectedDiagramEdgeIds([]);
    setSelectedDiagramEdgeId(null);
  }, [diagramNodes, selectedDiagramNodeIds, setDiagramNodes]);
  const duplicateDiagramNode = useCallback((id: string) => {
    const source = diagramNodes.find((node) => node.id === id);
    if (!source) return;
    const duplicated = {
      ...source,
      id: `flow-node-${Date.now()}`,
      selected: true,
      position: { x: source.position.x + 28, y: source.position.y + 28 },
      data: { ...source.data },
    };
    setDiagramNodes((nodes) => [
      ...nodes.map((node) => ({ ...node, selected: false })),
      duplicated,
    ]);
    setSelectedDiagramNodeIds([duplicated.id]);
    setSelectedDiagramNodeId(duplicated.id);
    setSelectedDiagramEdgeIds([]);
    setSelectedDiagramEdgeId(null);
  }, [diagramNodes, setDiagramNodes]);
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
    const dataUrl = await toPng(canvasRef.current, { backgroundColor: "#e8edf5", pixelRatio: 2 });
    downloadUrl(dataUrl, `${fileName}.png`);
  };

  const exportPdf = async (fileName: string) => {
    if (!canvasRef.current) return;
    const dataUrl = await toPng(canvasRef.current, { backgroundColor: "#ffffff", pixelRatio: 2 });
    const printWindow = window.open("", "_blank", "width=1200,height=800");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head><title>${escapeXml(fileName)}</title></head>
        <body style="margin:0;display:grid;place-items:center;background:white;">
          <img src="${dataUrl}" style="max-width:100%;height:auto;" />
          <script>window.onload = () => { window.print(); window.close(); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
          />
          <div ref={canvasRef} className="relative min-h-0 min-w-0 flex-1 bg-[#e8edf5]">
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
          {mode === "wireframe" ? (
            <PropertiesPanel selectedShape={selectedShape} />
          ) : (
            <DiagramPropertiesPanel
              selectedNode={selectedDiagramNode}
              selectedEdge={selectedDiagramEdge}
              onUpdateNode={updateDiagramNode}
              onUpdateEdge={updateDiagramEdge}
              onDeleteEdge={deleteDiagramEdge}
            />
          )}
        </div>
      </section>
    </div>
  );
}

function LibraryPanel({
  mode,
  pages,
  currentPageId,
  onSwitchPage,
  onCreatePage,
  onDuplicatePage,
  onDeletePage,
  onAddShape,
  onAddDiagramNode,
  onAddImage,
  onAddTemplate,
  onAddIcon,
  onAddCustomIcon,
  onAddDiagramIcon,
  onAddDiagramImage,
}: {
  mode: DiagramMode;
  pages: { id: string; name: string; shapes: WireShape[] }[];
  currentPageId: string;
  onSwitchPage: (id: string) => void;
  onCreatePage: () => void;
  onDuplicatePage: () => void;
  onDeletePage: (id: string) => void;
  onAddShape: (type: WireShape["type"], name?: string) => void;
  onAddDiagramNode: (variant: FlowNodeVariant, label?: string, center?: { x: number; y: number }) => void;
  onAddImage: (imageSrc: string, name?: string) => void;
  onAddTemplate: (template: "dashboard" | "landing" | "mobile" | "form") => void;
  onAddIcon: (iconName: string, iconSet: string, svgSrc?: string) => void;
  onAddCustomIcon: (name: string, svgSrc: string, iconSet?: string) => void;
  onAddDiagramIcon: (iconName: string, iconSet: string, svgSrc?: string, displayLabel?: string) => void;
  onAddDiagramImage: (imageSrc: string, name?: string) => void;
}) {
  const [tab, setTab] = useState<"library" | "icons" | "pages">("library");
  const [iconSet, setIconSet] = useState("AWS");
  const [iconSearch, setIconSearch] = useState("");
  const [customPackageName, setCustomPackageName] = useState("");
  const [customPackages, setCustomPackages] = useState<string[]>(["Mis iconos"]);
  const [customIcons, setCustomIcons] = useState<CustomIcon[]>([]);
  const [customIconsHydrated, setCustomIconsHydrated] = useState(false);
  const svgInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const customPackageOptions = useMemo(
    () => customPackages.map((packageName) => `Mis iconos / ${packageName}`),
    [customPackages],
  );
  const iconPackageOptions = useMemo(
    () => [...builtInIconSets, ...customPackageOptions],
    [customPackageOptions],
  );
  const customPackageFromOption = iconSet.startsWith("Mis iconos / ")
    ? iconSet.replace("Mis iconos / ", "")
    : customPackages[0];
  const activeBuiltInIcons = useMemo(() => {
    const normalizedSearch = iconSearch.trim().toLowerCase();
    if (iconSet.startsWith("Mis iconos / ")) return [];
    return iconCatalog.filter(
      (icon) =>
        icon.set === iconSet &&
        (!normalizedSearch ||
          icon.name.toLowerCase().includes(normalizedSearch) ||
          icon.label.toLowerCase().includes(normalizedSearch)),
    );
  }, [iconSearch, iconSet]);
  const visibleBuiltInIcons = useMemo(() => activeBuiltInIcons.slice(0, iconResultLimit), [activeBuiltInIcons]);
  const activeCustomIcons = useMemo(() => {
    const normalizedSearch = iconSearch.trim().toLowerCase();
    return customIcons.filter(
      (icon) =>
        icon.packageName === customPackageFromOption &&
        (!normalizedSearch || icon.name.toLowerCase().includes(normalizedSearch)),
    );
  }, [customIcons, customPackageFromOption, iconSearch]);

  useEffect(() => {
    const loadSavedIcons = window.setTimeout(() => {
      const saved = window.localStorage.getItem(customIconsStorageKey);
      const savedPackages = window.localStorage.getItem(customIconPackagesStorageKey);
      try {
        const parsedIcons = (saved ? JSON.parse(saved) : []) as Array<Partial<CustomIcon>>;
        const normalizedIcons = parsedIcons.map((icon) => ({
          id: icon.id ?? `custom-icon-${Date.now()}`,
          name: icon.name ?? "Icono",
          packageName: icon.packageName ?? "Mis iconos",
          svgSrc: icon.svgSrc ?? "",
        }));
        setCustomIcons(normalizedIcons.filter((icon) => icon.svgSrc));
        const parsedPackages = (savedPackages ? JSON.parse(savedPackages) : []) as string[];
        const packagesFromIcons = normalizedIcons.map((icon) => icon.packageName);
        setCustomPackages(Array.from(new Set(["Mis iconos", ...parsedPackages, ...packagesFromIcons])));
      } catch {
        setCustomIcons([]);
        setCustomPackages(["Mis iconos"]);
      }
      setCustomIconsHydrated(true);
    }, 0);

    return () => window.clearTimeout(loadSavedIcons);
  }, []);

  useEffect(() => {
    if (!customIconsHydrated) return;
    window.localStorage.setItem(customIconsStorageKey, JSON.stringify(customIcons));
    window.localStorage.setItem(customIconPackagesStorageKey, JSON.stringify(customPackages));
  }, [customIcons, customIconsHydrated, customPackages]);

  const createCustomPackage = () => {
    const packageName = customPackageName.trim();
    if (!packageName) return;
    setCustomPackages((current) => Array.from(new Set([...current, packageName])));
    setIconSet(`Mis iconos / ${packageName}`);
    setCustomPackageName("");
  };

  const loadSvgIcon = (file?: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".svg") && file.type !== "image/svg+xml") return;
    const reader = new FileReader();
    reader.onload = () => {
      const icon = {
        id: `custom-icon-${Date.now()}`,
        name: file.name.replace(/\.svg$/i, ""),
        packageName: customPackageFromOption,
        svgSrc: String(reader.result),
      };
      setCustomIcons((current) => [icon, ...current]);
      if (mode === "diagram") {
        onAddDiagramIcon(icon.name, `Mis iconos / ${icon.packageName}`, icon.svgSrc);
      } else {
        onAddCustomIcon(icon.name, icon.svgSrc, icon.packageName);
      }
      setIconSet(`Mis iconos / ${icon.packageName}`);
    };
    reader.readAsDataURL(file);
  };

  const loadImageAsset = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (mode === "diagram") {
        onAddDiagramImage(String(reader.result), file.name);
      } else {
        onAddImage(String(reader.result), file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <aside className="relative w-[286px] shrink-0 overflow-auto border-r border-slate-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Insertar</h2>
          <p className="text-xs text-slate-500">
            {mode === "diagram" ? "Nodos, conectores y flechas" : "Componentes, paginas e iconos"}
          </p>
        </div>
      </div>

      {mode === "diagram" ? (
        <DiagramInsertPanel
          iconSet={iconSet}
          iconSearch={iconSearch}
          iconPackageOptions={iconPackageOptions}
          activeBuiltInIcons={activeBuiltInIcons}
          visibleBuiltInIcons={visibleBuiltInIcons}
          activeCustomIcons={activeCustomIcons}
          customPackageName={customPackageName}
          svgInputRef={svgInputRef}
          imageInputRef={imageInputRef}
          onAddDiagramNode={onAddDiagramNode}
          onSetIconSet={setIconSet}
          onSetIconSearch={setIconSearch}
          onSetCustomPackageName={setCustomPackageName}
          onCreateCustomPackage={createCustomPackage}
          onLoadSvgIcon={loadSvgIcon}
          onLoadImage={loadImageAsset}
          onAddIcon={onAddDiagramIcon}
        />
      ) : (
        <>
      <div className="mb-4 grid grid-cols-3 rounded-md border border-slate-200 bg-slate-50 p-1">
        {(["library", "icons", "pages"] as const).map((item) => (
          <button key={item} className={cn("segmented-button", tab === item && "is-active")} onClick={() => setTab(item)}>
            {item === "library" ? "Kit" : item === "icons" ? "Iconos" : "Paginas"}
          </button>
        ))}
      </div>

      {tab === "pages" ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <button className="secondary-button flex-1" onClick={onCreatePage}><Plus size={14} />Pagina</button>
            <button className="secondary-button flex-1" onClick={onDuplicatePage}>Duplicar</button>
          </div>
          {pages.map((page) => (
            <button
              key={page.id}
              className={cn(
                "flex w-full items-center justify-between rounded-md border p-3 text-left text-sm",
                page.id === currentPageId ? "border-blue-300 bg-blue-50" : "border-slate-200 hover:bg-slate-50",
              )}
              onClick={() => onSwitchPage(page.id)}
            >
              <span className="truncate font-medium">{page.name}</span>
              <span className="text-xs text-slate-500">{page.shapes.length}</span>
            </button>
          ))}
          <button className="secondary-button w-full" onClick={() => onDeletePage(currentPageId)}>
            <Trash2 size={14} />Eliminar pagina
          </button>
        </div>
      ) : null}

      {tab === "icons" ? (
        <div className="space-y-4">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
              Paquetes propios
            </h3>
            <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
              <input
                className="property-input"
                value={customPackageName}
                onChange={(event) => setCustomPackageName(event.target.value)}
                placeholder="Nuevo paquete"
              />
              <button className="toolbar-button border border-slate-200" title="Crear paquete" onClick={createCustomPackage}>
                <Plus size={15} />
              </button>
            </div>
            {customIcons.length ? (
              <button
                className="secondary-button mt-3 w-full"
                onClick={() => {
                  setCustomIcons([]);
                  setCustomPackages(["Mis iconos"]);
                  window.localStorage.removeItem(customIconsStorageKey);
                  window.localStorage.removeItem(customIconPackagesStorageKey);
                  setIconSet("AWS");
                }}
              >
                Vaciar paquetes propios
              </button>
            ) : null}
          </div>
          <label className="property-label">
            Paquete
            <select className="property-input" value={iconSet} onChange={(event) => setIconSet(event.target.value)}>
              {iconPackageOptions.map((packageName) => (
                <option key={packageName} value={packageName}>{packageName}</option>
              ))}
            </select>
          </label>
          <label className="property-label">
            Buscar icono
            <input
              className="property-input"
              value={iconSearch}
              onChange={(event) => setIconSearch(event.target.value)}
              placeholder="Ej: Kubernetes"
            />
          </label>
          <input
            ref={svgInputRef}
            type="file"
            accept=".svg,image/svg+xml"
            className="hidden"
            onChange={(event) => loadSvgIcon(event.target.files?.[0])}
          />
          <button className="secondary-button w-full" onClick={() => svgInputRef.current?.click()}>
            <Plus size={14} />
            Cargar SVG
          </button>
          <div className="space-y-5">
            <section>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    {iconSet}
                  </h3>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                    {iconSet.startsWith("Mis iconos / ") ? activeCustomIcons.length : activeBuiltInIcons.length}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {iconSet.startsWith("Mis iconos / ")
                    ? activeCustomIcons.map((item) => (
                        <IconTile
                          key={item.id}
                          label={item.name}
                          title={`${item.name} · ${item.packageName}`}
                          svgSrc={item.svgSrc}
                          dragPayload={{ kind: "wireframe-custom-icon", name: item.name, svgSrc: item.svgSrc, iconSet: item.packageName }}
                          onClick={() => onAddCustomIcon(item.name, item.svgSrc, item.packageName)}
                        />
                      ))
                    : visibleBuiltInIcons.map((item) => (
                        <IconTile
                          key={`${item.set}-${item.name}`}
                          label={item.label}
                          title={`${item.label} · ${item.set}`}
                          svgSrc={item.svgSrc}
                          icon={item.icon}
                          dragPayload={{ kind: "wireframe-icon", iconName: item.name, iconSet: item.set, svgSrc: item.svgSrc, label: item.label }}
                          onClick={() => onAddIcon(item.name, item.set, item.svgSrc)}
                        />
                      ))}
                </div>
                {!iconSet.startsWith("Mis iconos / ") && activeBuiltInIcons.length > iconResultLimit ? (
                  <p className="mt-3 text-xs text-slate-500">
                    Mostrando {iconResultLimit} de {activeBuiltInIcons.length}. Usa la busqueda para encontrar iconos especificos.
                  </p>
                ) : null}
              </section>
            {iconSet.startsWith("Mis iconos / ") && !activeCustomIcons.length ? (
              <div className="rounded-md border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500">
                Carga archivos SVG para llenar este paquete.
              </div>
            ) : null}
            {!activeBuiltInIcons.length && !activeCustomIcons.length ? (
              <div className="rounded-md border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500">
                No hay iconos para ese filtro.
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {tab === "library" ? (
        <div className="space-y-5">
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Assets</h3>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*,.svg"
              className="hidden"
              onChange={(event) => loadImageAsset(event.target.files?.[0])}
            />
            <button className="secondary-button w-full" onClick={() => imageInputRef.current?.click()}>
              <ImageIcon size={14} />
              Cargar imagen / SVG
            </button>
          </section>
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Templates</h3>
            <div className="grid grid-cols-2 gap-2">
              {editorTemplateOptions.map((template) => (
                <button
                  key={template.type}
                  type="button"
                  title="Arrastra al lienzo o haz click para insertar"
                  {...libraryDragProps({ kind: "wireframe-template", template: template.type })}
                  className={libraryItemButtonClass}
                  onClick={() => onAddTemplate(template.type)}
                >
                  {createElement(editorTemplateIcons[template.type], {
                    size: 18,
                    strokeWidth: 1.7,
                    className: "text-slate-600 group-hover:text-blue-600",
                  })}
                  <span className="w-full truncate text-xs font-medium">{template.label}</span>
                </button>
              ))}
            </div>
          </section>
          {categories.map((category) => (
            <section key={category.name}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{category.name}</h3>
              <div className="grid grid-cols-2 gap-2">
                {category.items.map((item) => (
                  <button
                    key={`${category.name}-${item.kind}`}
                    type="button"
                    title="Arrastra al lienzo o haz click para insertar"
                    {...libraryDragProps({ kind: "wireframe-shape", type: item.kind as WireShape["type"], label: item.label })}
                    onClick={() => onAddShape(item.kind as WireShape["type"], item.label)}
                    className={libraryItemButtonClass}
                  >
                    <item.icon size={18} className="text-slate-600 group-hover:text-blue-600" />
                    <span className="w-full truncate text-xs font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : null}
        </>
      )}
    </aside>
  );
}

function DiagramInsertPanel({
  iconSet,
  iconSearch,
  iconPackageOptions,
  activeBuiltInIcons,
  visibleBuiltInIcons,
  activeCustomIcons,
  customPackageName,
  svgInputRef,
  imageInputRef,
  onAddDiagramNode,
  onSetIconSet,
  onSetIconSearch,
  onSetCustomPackageName,
  onCreateCustomPackage,
  onLoadSvgIcon,
  onLoadImage,
  onAddIcon,
}: {
  iconSet: string;
  iconSearch: string;
  iconPackageOptions: string[];
  activeBuiltInIcons: IconCatalogItem[];
  visibleBuiltInIcons: IconCatalogItem[];
  activeCustomIcons: CustomIcon[];
  customPackageName: string;
  svgInputRef: RefObject<HTMLInputElement | null>;
  imageInputRef: RefObject<HTMLInputElement | null>;
  onAddDiagramNode: (variant: FlowNodeVariant, label?: string, center?: { x: number; y: number }) => void;
  onSetIconSet: (value: string) => void;
  onSetIconSearch: (value: string) => void;
  onSetCustomPackageName: (value: string) => void;
  onCreateCustomPackage: () => void;
  onLoadSvgIcon: (file?: File) => void;
  onLoadImage: (file?: File) => void;
  onAddIcon: (iconName: string, iconSet: string, svgSrc?: string, displayLabel?: string) => void;
}) {
  const addNodeTool = (tool: (typeof diagramNodeTools)[number]) => {
    if (tool.variant === "image") {
      imageInputRef.current?.click();
      return;
    }
    onAddDiagramNode(tool.variant, tool.label);
  };

  return (
    <div className="space-y-5">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*,.svg,image/svg+xml"
        className="hidden"
        onChange={(event) => {
          onLoadImage(event.target.files?.[0]);
          event.currentTarget.value = "";
        }}
      />
      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Nodos de flujo</h3>
        <div className="grid grid-cols-2 gap-2">
          {diagramNodeTools.map((tool) => (
            <button
              key={tool.variant}
              type="button"
              title={tool.variant === "image" ? "Haz click para cargar una imagen" : "Arrastra al lienzo o haz click para insertar"}
              {...(tool.variant === "image"
                ? {}
                : libraryDragProps({ kind: "flow-node", variant: tool.variant, label: tool.label }))}
              className={diagramLibraryItemButtonClass}
              onClick={() => addNodeTool(tool)}
            >
              {createElement(tool.icon, {
                size: 18,
                strokeWidth: 1.7,
                className: "text-slate-600 group-hover:text-blue-600",
              })}
              <span className="w-full truncate text-xs font-medium">{tool.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Iconos</h3>
        <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-3">
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <input
              className="property-input"
              value={customPackageName}
              onChange={(event) => onSetCustomPackageName(event.target.value)}
              placeholder="Nuevo paquete"
            />
            <button className="toolbar-button border border-slate-200" title="Crear paquete" onClick={onCreateCustomPackage}>
              <Plus size={15} />
            </button>
          </div>
          <label className="property-label">
            Paquete
            <select className="property-input" value={iconSet} onChange={(event) => onSetIconSet(event.target.value)}>
              {iconPackageOptions.map((packageName) => (
                <option key={packageName} value={packageName}>{packageName}</option>
              ))}
            </select>
          </label>
          <label className="property-label">
            Buscar icono
            <input
              className="property-input"
              value={iconSearch}
              onChange={(event) => onSetIconSearch(event.target.value)}
              placeholder="Ej: AWS, Docker, database"
            />
          </label>
          <input
            ref={svgInputRef}
            type="file"
            accept=".svg,image/svg+xml"
            className="hidden"
            onChange={(event) => onLoadSvgIcon(event.target.files?.[0])}
          />
          <button className="secondary-button w-full" onClick={() => svgInputRef.current?.click()}>
            <Plus size={14} />
            Cargar SVG
          </button>
        </div>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {iconSet.startsWith("Mis iconos / ")
            ? activeCustomIcons.map((item) => (
                <IconTile
                  key={item.id}
                  label={item.name}
                  title={`${item.name} · ${item.packageName}`}
                  svgSrc={item.svgSrc}
                  dragPayload={{ kind: "flow-icon", iconName: item.name, iconSet: `Mis iconos / ${item.packageName}`, svgSrc: item.svgSrc, label: item.name }}
                  onClick={() => onAddIcon(item.name, `Mis iconos / ${item.packageName}`, item.svgSrc)}
                />
              ))
            : visibleBuiltInIcons.map((item) => (
                <IconTile
                  key={`${item.set}-${item.name}`}
                  label={item.label}
                  title={`${item.label} · ${item.set}`}
                  svgSrc={item.svgSrc}
                  icon={item.icon}
                  dragPayload={{ kind: "flow-icon", iconName: item.name, iconSet: item.set, svgSrc: item.svgSrc, label: item.label }}
                  onClick={() => onAddIcon(item.name, item.set, item.svgSrc, item.label)}
                />
              ))}
        </div>
        {!iconSet.startsWith("Mis iconos / ") && activeBuiltInIcons.length > iconResultLimit ? (
          <p className="mt-3 text-xs text-slate-500">
            Mostrando {iconResultLimit} de {activeBuiltInIcons.length}. Usa la busqueda para iconos especificos.
          </p>
        ) : null}
        {!activeBuiltInIcons.length && !activeCustomIcons.length ? (
          <div className="mt-3 rounded-md border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500">
            No hay iconos para ese filtro.
          </div>
        ) : null}
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Conectores</h3>
        <div className="space-y-2">
          {diagramConnectorTools.map((tool) => (
            <div key={tool.label} className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <tool.icon size={16} strokeWidth={1.7} />
                {tool.label}
              </div>
              <p className="mt-1 text-xs text-slate-500">{tool.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function IconTile({
  label,
  title,
  icon,
  svgSrc,
  dragPayload,
  onClick,
}: {
  label: string;
  title: string;
  icon?: IconComponent;
  svgSrc?: string;
  dragPayload?: LibraryDragPayload;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={dragPayload ? `${title} · Arrastra al lienzo o haz click` : title}
      aria-label={title}
      {...(dragPayload ? libraryDragProps(dragPayload) : {})}
      className={dragPayload ? iconTileButtonClass : "group grid size-10 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"}
      onClick={onClick}
    >
      {svgSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={svgSrc} alt="" className="size-7 object-contain" />
      ) : icon ? (
        createElement(icon, { size: 24, strokeWidth: 1.35 })
      ) : null}
      <span className="sr-only">{label}</span>
    </button>
  );
}

function WireframeCanvas() {
  const pages = useEditorStore((state) => state.pages);
  const currentPageId = useEditorStore((state) => state.currentPageId);
  const selectedId = useEditorStore((state) => state.selectedId);
  const selectedIds = useEditorStore((state) => state.selectedIds);
  const zoom = useEditorStore((state) => state.zoom);
  const pan = useEditorStore((state) => state.pan);
  const gridSize = useEditorStore((state) => state.gridSize);
  const showGrid = useEditorStore((state) => state.showGrid);
  const snapToGrid = useEditorStore((state) => state.snapToGrid);
  const selectShape = useEditorStore((state) => state.selectShape);
  const selectShapes = useEditorStore((state) => state.selectShapes);
  const addShape = useEditorStore((state) => state.addShape);
  const addIconShape = useEditorStore((state) => state.addIconShape);
  const addCustomIconShape = useEditorStore((state) => state.addCustomIconShape);
  const addTemplate = useEditorStore((state) => state.addTemplate);
  const moveShape = useEditorStore((state) => state.moveShape);
  const resizeShape = useEditorStore((state) => state.resizeShape);
  const rotateShape = useEditorStore((state) => state.rotateShape);
  const setPan = useEditorStore((state) => state.setPan);
  const setZoom = useEditorStore((state) => state.setZoom);
  const duplicateShape = useEditorStore((state) => state.duplicateShape);
  const deleteSelected = useEditorStore((state) => state.deleteSelected);
  const bringForward = useEditorStore((state) => state.bringForward);
  const sendBackward = useEditorStore((state) => state.sendBackward);
  const toggleShapeLock = useEditorStore((state) => state.toggleShapeLock);
  const groupSelected = useEditorStore((state) => state.groupSelected);
  const ungroupSelected = useEditorStore((state) => state.ungroupSelected);
  const checkpoint = useEditorStore((state) => state.checkpoint);
  const [drag, setDrag] = useState<null | { id: string; dx: number; dy: number }>(null);
  const [resize, setResize] = useState<null | ResizeDraft>(null);
  const [rotate, setRotate] = useState<null | {
    id: string;
    centerX: number;
    centerY: number;
    startAngle: number;
    startRotation: number;
  }>(null);
  const [canvasDrag, setCanvasDrag] = useState<null | { x: number; y: number; px: number; py: number }>(null);
  const [marquee, setMarquee] = useState<null | {
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    additive: boolean;
  }>(null);
  const [contextMenu, setContextMenu] = useState<null | { id: string; x: number; y: number }>(null);
  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);
  const interactionCheckpointRef = useRef(false);
  const shapes = useMemo(
    () => pages.find((page) => page.id === currentPageId)?.shapes ?? [],
    [pages, currentPageId],
  );
  const orderedShapes = useMemo(
    () => [...shapes].filter((shape) => shape.visible).sort((a, b) => a.layer - b.layer),
    [shapes],
  );

  const pointerToCanvasFromClient = useCallback((clientX: number, clientY: number) => {
    const bounds = canvasRef.current?.getBoundingClientRect();
    return {
      x: (clientX - (bounds?.left ?? 0) - pan.x) / zoom,
      y: (clientY - (bounds?.top ?? 0) - pan.y) / zoom,
    };
  }, [pan.x, pan.y, zoom]);

  const pointerToCanvas = (event: PointerEvent) => {
    return pointerToCanvasFromClient(event.clientX, event.clientY);
  };

  const getMarqueeRect = useCallback((selection: NonNullable<typeof marquee>) => {
    const x = Math.min(selection.startX, selection.currentX);
    const y = Math.min(selection.startY, selection.currentY);
    const width = Math.abs(selection.currentX - selection.startX);
    const height = Math.abs(selection.currentY - selection.startY);
    return { x, y, width, height };
  }, []);

  const findShapesInRect = useCallback(
    (rect: { x: number; y: number; width: number; height: number }) =>
      shapes
        .filter((shape) => {
          if (!shape.visible || shape.locked) return false;
          const shapeRight = shape.x + shape.width;
          const shapeBottom = shape.y + shape.height;
          const rectRight = rect.x + rect.width;
          const rectBottom = rect.y + rect.height;
          return shape.x < rectRight && shapeRight > rect.x && shape.y < rectBottom && shapeBottom > rect.y;
        })
        .map((shape) => shape.id),
    [shapes],
  );

  const ensureInteractionCheckpoint = useCallback(() => {
    if (interactionCheckpointRef.current) return;
    checkpoint();
    interactionCheckpointRef.current = true;
  }, [checkpoint]);

  const updateDragGuides = useCallback(
    (id: string, x: number, y: number) => {
      if (!snapToGrid) {
        setAlignmentGuides([]);
        return;
      }
      const shapeToMove = shapes.find((shape) => shape.id === id);
      if (!shapeToMove) return;
      const groupShapes = shapeToMove.groupId
        ? shapes.filter((shape) => shape.groupId === shapeToMove.groupId && !shape.locked)
        : [shapeToMove];
      const movingIds = new Set(groupShapes.map((shape) => shape.id));
      const currentBounds = getShapeBounds(groupShapes);
      setAlignmentGuides(
        getAlignmentGuides(shapes, movingIds, {
          ...currentBounds,
          x: currentBounds.x + x - shapeToMove.x,
          y: currentBounds.y + y - shapeToMove.y,
        }),
      );
    },
    [shapes, snapToGrid],
  );

  const updateResizeGuides = useCallback(
    (id: string, x: number, y: number, width: number, height: number) => {
      if (!snapToGrid) {
        setAlignmentGuides([]);
        return;
      }
      const movingIds = new Set([id]);
      setAlignmentGuides(getAlignmentGuides(shapes, movingIds, { x, y, width, height }));
    },
    [shapes, snapToGrid],
  );

  const zoomAtPoint = useCallback(
    (clientX: number, clientY: number, nextZoom: number) => {
      const bounds = canvasRef.current?.getBoundingClientRect();
      if (!bounds) {
        setZoom(nextZoom);
        return;
      }
      const clampedZoom = Math.min(2.2, Math.max(0.35, nextZoom));
      const worldX = (clientX - bounds.left - pan.x) / zoom;
      const worldY = (clientY - bounds.top - pan.y) / zoom;
      setZoom(clampedZoom);
      setPan({
        x: clientX - bounds.left - worldX * clampedZoom,
        y: clientY - bounds.top - worldY * clampedZoom,
      });
    },
    [pan.x, pan.y, setPan, setZoom, zoom],
  );

  const getResizeGeometry = useCallback((draft: ResizeDraft, point: { x: number; y: number }, keepRatio: boolean) => {
    const dx = point.x - draft.startX;
    const dy = point.y - draft.startY;
    const left = draft.handle.includes("w");
    const right = draft.handle.includes("e");
    const top = draft.handle.includes("n");
    const bottom = draft.handle.includes("s");
    const aspect = draft.shape.width / Math.max(1, draft.shape.height);
    let nextWidth = left ? draft.shape.width - dx : right ? draft.shape.width + dx : draft.shape.width;
    let nextHeight = top ? draft.shape.height - dy : bottom ? draft.shape.height + dy : draft.shape.height;

    if (keepRatio) {
      const widthChanged = left || right;
      const heightChanged = top || bottom;
      if (widthChanged && heightChanged) {
        if (Math.abs(nextWidth - draft.shape.width) >= Math.abs(nextHeight - draft.shape.height)) {
          nextHeight = nextWidth / aspect;
        } else {
          nextWidth = nextHeight * aspect;
        }
      } else if (widthChanged) {
        nextHeight = nextWidth / aspect;
      } else if (heightChanged) {
        nextWidth = nextHeight * aspect;
      }
    }

    nextWidth = Math.max(24, nextWidth);
    nextHeight = Math.max(24, nextHeight);

    const nextX = left
      ? draft.shape.x + draft.shape.width - nextWidth
      : keepRatio && (top || bottom)
        ? draft.shape.x + (draft.shape.width - nextWidth) / 2
        : draft.shape.x;
    const nextY = top
      ? draft.shape.y + draft.shape.height - nextHeight
      : keepRatio && (left || right)
        ? draft.shape.y + (draft.shape.height - nextHeight) / 2
        : draft.shape.y;

    return { x: nextX, y: nextY, width: nextWidth, height: nextHeight };
  }, []);

  useEffect(() => {
    if (!drag && !resize && !rotate && !canvasDrag && !marquee) return;

    const handlePointerMove = (event: globalThis.PointerEvent) => {
      if (drag) {
        ensureInteractionCheckpoint();
        const point = pointerToCanvasFromClient(event.clientX, event.clientY);
        updateDragGuides(drag.id, Math.round(point.x - drag.dx), Math.round(point.y - drag.dy));
        moveShape(drag.id, Math.round(point.x - drag.dx), Math.round(point.y - drag.dy));
      }
      if (resize) {
        ensureInteractionCheckpoint();
        const point = pointerToCanvasFromClient(event.clientX, event.clientY);
        const next = getResizeGeometry(resize, point, event.ctrlKey);
        updateResizeGuides(resize.id, next.x, next.y, next.width, next.height);
        resizeShape(resize.id, next.width, next.height, next.x, next.y);
      }
      if (rotate) {
        ensureInteractionCheckpoint();
        const point = pointerToCanvasFromClient(event.clientX, event.clientY);
        const angle = Math.atan2(point.y - rotate.centerY, point.x - rotate.centerX) * 180 / Math.PI;
        rotateShape(rotate.id, Math.round(rotate.startRotation + angle - rotate.startAngle));
      }
      if (canvasDrag) {
        setPan({
          x: canvasDrag.px + event.clientX - canvasDrag.x,
          y: canvasDrag.py + event.clientY - canvasDrag.y,
        });
      }
      if (marquee) {
        const point = pointerToCanvasFromClient(event.clientX, event.clientY);
        setMarquee((current) => current ? { ...current, currentX: point.x, currentY: point.y } : current);
      }
    };

    const handlePointerUp = () => {
      if (marquee) {
        const rect = getMarqueeRect(marquee);
        if (rect.width > 4 || rect.height > 4) {
          selectShapes(findShapesInRect(rect), marquee.additive);
        }
      }
      setDrag(null);
      setResize(null);
      setRotate(null);
      setCanvasDrag(null);
      setMarquee(null);
      setAlignmentGuides([]);
      interactionCheckpointRef.current = false;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [
    canvasDrag,
    drag,
    ensureInteractionCheckpoint,
    moveShape,
    marquee,
    pointerToCanvasFromClient,
    resize,
    resizeShape,
    findShapesInRect,
    getMarqueeRect,
    getResizeGeometry,
    selectShapes,
    setPan,
    rotate,
    rotateShape,
    updateDragGuides,
    updateResizeGuides,
  ]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, [contenteditable='true']")) return;
      if (!event.ctrlKey && !event.metaKey) return;
      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        zoomAtPoint(window.innerWidth / 2, window.innerHeight / 2, zoom + 0.12);
      }
      if (event.key === "-" || event.key === "_") {
        event.preventDefault();
        zoomAtPoint(window.innerWidth / 2, window.innerHeight / 2, zoom - 0.12);
      }
      if (event.key === "0") {
        event.preventDefault();
        zoomAtPoint(window.innerWidth / 2, window.innerHeight / 2, 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zoom, zoomAtPoint]);

  return (
    <div
      ref={canvasRef}
      className="relative size-full cursor-grab overflow-hidden"
      onDragOver={handleLibraryDragOver}
      onDrop={(event) => {
        event.preventDefault();
        const payload = parseLibraryDragPayload(event.dataTransfer.getData(LIBRARY_DRAG_MIME));
        if (!payload) return;
        const point = pointerToCanvasFromClient(event.clientX, event.clientY);
        if (payload.kind === "wireframe-shape") {
          addShape(payload.type, payload.label, point);
          return;
        }
        if (payload.kind === "wireframe-icon") {
          addIconShape(payload.iconName, payload.iconSet, payload.svgSrc, point);
          return;
        }
        if (payload.kind === "wireframe-custom-icon") {
          addCustomIconShape(payload.name, payload.svgSrc, payload.iconSet, point);
          return;
        }
        if (payload.kind === "wireframe-template") {
          addTemplate(payload.template, point);
        }
      }}
      onContextMenu={(event) => {
        event.preventDefault();
        setContextMenu(
          selectedIds.length
            ? { id: selectedId ?? selectedIds[0], x: event.clientX, y: event.clientY }
            : null,
        );
      }}
      onPointerDown={(event) => {
        if ((event.target as HTMLElement).closest("[data-shape-id]")) return;
        if (event.button !== 0 && event.button !== 1) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        setContextMenu(null);
        if (event.button === 0 && event.shiftKey) {
          const point = pointerToCanvas(event);
          setMarquee({
            startX: point.x,
            startY: point.y,
            currentX: point.x,
            currentY: point.y,
            additive: true,
          });
          return;
        }
        if (event.button === 0 || event.button === 1) {
          selectShape(null);
          setCanvasDrag({ x: event.clientX, y: event.clientY, px: pan.x, py: pan.y });
        }
      }}
      onWheel={(event) => {
        event.preventDefault();
        setContextMenu(null);
        if (event.shiftKey) {
          setPan({
            x: pan.x - event.deltaX,
            y: pan.y - event.deltaY,
          });
          return;
        }
        const direction = event.deltaY > 0 ? -1 : 1;
        zoomAtPoint(event.clientX, event.clientY, zoom + direction * 0.12);
      }}
      onPointerMove={(event) => {
        if (drag) {
          ensureInteractionCheckpoint();
          const point = pointerToCanvas(event);
          updateDragGuides(drag.id, Math.round(point.x - drag.dx), Math.round(point.y - drag.dy));
          moveShape(drag.id, Math.round(point.x - drag.dx), Math.round(point.y - drag.dy));
        }
        if (resize) {
          ensureInteractionCheckpoint();
          const point = pointerToCanvas(event);
          const next = getResizeGeometry(resize, point, event.ctrlKey);
          updateResizeGuides(resize.id, next.x, next.y, next.width, next.height);
          resizeShape(resize.id, next.width, next.height, next.x, next.y);
        }
        if (rotate) {
          ensureInteractionCheckpoint();
          const point = pointerToCanvas(event);
          const angle = Math.atan2(point.y - rotate.centerY, point.x - rotate.centerX) * 180 / Math.PI;
          rotateShape(rotate.id, Math.round(rotate.startRotation + angle - rotate.startAngle));
        }
        if (canvasDrag) {
          setPan({ x: canvasDrag.px + event.clientX - canvasDrag.x, y: canvasDrag.py + event.clientY - canvasDrag.y });
        }
        if (marquee) {
          const point = pointerToCanvas(event);
          setMarquee((current) => current ? { ...current, currentX: point.x, currentY: point.y } : current);
        }
      }}
      onPointerUp={() => {
        if (marquee) {
          const rect = getMarqueeRect(marquee);
          if (rect.width > 4 || rect.height > 4) {
            selectShapes(findShapesInRect(rect), marquee.additive);
          }
        }
        setDrag(null);
        setResize(null);
        setRotate(null);
        setCanvasDrag(null);
        setMarquee(null);
        setAlignmentGuides([]);
        interactionCheckpointRef.current = false;
      }}
      onPointerLeave={() => {
        if (!drag && !resize && !rotate && !canvasDrag && !marquee) {
          setDrag(null);
          setResize(null);
          setRotate(null);
          setCanvasDrag(null);
          setMarquee(null);
          setAlignmentGuides([]);
          interactionCheckpointRef.current = false;
        }
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={
          showGrid
            ? {
                backgroundImage:
                  "linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)",
                backgroundSize: `${gridSize * zoom}px ${gridSize * zoom}px`,
                backgroundPosition: `${pan.x}px ${pan.y}px`,
              }
            : undefined
        }
      />
      <div className="absolute left-0 top-0 origin-top-left" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
        <div className="relative h-[1600px] w-[2200px]">
          {orderedShapes.map((shape) => (
            <CanvasShape
              key={shape.id}
              shape={shape}
              selected={selectedIds.includes(shape.id)}
              primarySelected={shape.id === selectedId}
              isDragging={drag?.id === shape.id}
              onPointerDown={(event) => {
                event.stopPropagation();
                if (event.button !== 0) return;
                event.currentTarget.setPointerCapture(event.pointerId);
                if (shape.locked) return;
                interactionCheckpointRef.current = false;
                const point = pointerToCanvas(event);
                selectShape(shape.id, event.shiftKey || event.metaKey || event.ctrlKey);
                setDrag({ id: shape.id, dx: point.x - shape.x, dy: point.y - shape.y });
              }}
              onResizePointerDown={(event, handle) => {
                event.stopPropagation();
                event.currentTarget.setPointerCapture(event.pointerId);
                if (shape.locked) return;
                interactionCheckpointRef.current = false;
                const point = pointerToCanvas(event);
                selectShape(shape.id);
                setResize({ id: shape.id, handle, startX: point.x, startY: point.y, shape });
              }}
              onRotatePointerDown={(event) => {
                event.stopPropagation();
                event.currentTarget.setPointerCapture(event.pointerId);
                if (shape.locked) return;
                interactionCheckpointRef.current = false;
                const point = pointerToCanvas(event);
                const centerX = shape.x + shape.width / 2;
                const centerY = shape.y + shape.height / 2;
                const startAngle = Math.atan2(point.y - centerY, point.x - centerX) * 180 / Math.PI;
                selectShape(shape.id);
                setRotate({
                  id: shape.id,
                  centerX,
                  centerY,
                  startAngle,
                  startRotation: shape.style.rotation,
                });
              }}
              onContextMenu={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setContextMenu(
                  selectedIds.length
                    ? { id: selectedId ?? selectedIds[0], x: event.clientX, y: event.clientY }
                    : null,
                );
              }}
            />
          ))}
        </div>
      </div>
      <div className="absolute bottom-4 left-4 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 shadow-sm">
        Zoom {Math.round(zoom * 100)}%
      </div>
      {marquee ? (
        <div
          className="pointer-events-none absolute z-40 border border-blue-500 bg-blue-500/10"
          style={{
            left: pan.x + getMarqueeRect(marquee).x * zoom,
            top: pan.y + getMarqueeRect(marquee).y * zoom,
            width: getMarqueeRect(marquee).width * zoom,
            height: getMarqueeRect(marquee).height * zoom,
          }}
        />
      ) : null}
      {alignmentGuides.map((guide) => (
        <div
          key={`${guide.orientation}-${guide.position}`}
          className="pointer-events-none absolute z-30 bg-blue-500/70"
          style={
            guide.orientation === "vertical"
              ? {
                  left: pan.x + guide.position * zoom,
                  top: 0,
                  width: 1,
                  height: "100%",
                }
              : {
                  left: 0,
                  top: pan.y + guide.position * zoom,
                  width: "100%",
                  height: 1,
                }
          }
        />
      ))}
      {contextMenu ? (
        <div
          className="fixed z-50 w-44 rounded-md border border-slate-200 bg-white p-1 text-sm shadow-xl"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <ContextMenuButton label="Duplicar" onClick={() => { duplicateShape(); setContextMenu(null); }} />
          <ContextMenuButton label="Agrupar seleccion" disabled={selectedIds.length < 2} onClick={() => { groupSelected(); setContextMenu(null); }} />
          <ContextMenuButton label="Desagrupar" onClick={() => { ungroupSelected(); setContextMenu(null); }} />
          <ContextMenuButton label="Traer al frente" onClick={() => { bringForward(); setContextMenu(null); }} />
          <ContextMenuButton label="Enviar al fondo" onClick={() => { sendBackward(); setContextMenu(null); }} />
          <ContextMenuButton label="Bloquear / desbloquear" onClick={() => { toggleShapeLock(contextMenu.id); setContextMenu(null); }} />
          <div className="my-1 h-px bg-slate-200" />
          <ContextMenuButton danger label="Eliminar" onClick={() => { deleteSelected(); setContextMenu(null); }} />
        </div>
      ) : null}
    </div>
  );
}

type ResizeHandle = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";
type ResizeDraft = {
  id: string;
  handle: ResizeHandle;
  startX: number;
  startY: number;
  shape: WireShape;
};
type AlignmentGuide = { orientation: "vertical" | "horizontal"; position: number };

const canvasFrameShapeTypes = new Set<WireShape["type"]>(["desktop", "mobile", "modal"]);

function boundsContain(
  frame: WireShape,
  bounds: { x: number; y: number; width: number; height: number },
) {
  return (
    bounds.x >= frame.x &&
    bounds.y >= frame.y &&
    bounds.x + bounds.width <= frame.x + frame.width &&
    bounds.y + bounds.height <= frame.y + frame.height
  );
}

function getGuideCandidates(
  shapes: WireShape[],
  movingIds: Set<string>,
  bounds: { x: number; y: number; width: number; height: number },
) {
  const frames = shapes
    .filter((shape) => shape.visible && canvasFrameShapeTypes.has(shape.type) && !movingIds.has(shape.id))
    .sort((a, b) => a.width * a.height - b.width * b.height);
  const containingFrame = frames.find((shape) => boundsContain(shape, bounds));
  const candidates = shapes.filter((shape) => {
    if (!shape.visible || movingIds.has(shape.id) || canvasFrameShapeTypes.has(shape.type)) return false;
    if (!containingFrame) return true;
    return boundsContain(containingFrame, shape);
  });

  return candidates.length
    ? candidates
    : shapes.filter((shape) => shape.visible && !movingIds.has(shape.id) && !canvasFrameShapeTypes.has(shape.type));
}

function getShapeBounds(shapes: WireShape[]) {
  const minX = Math.min(...shapes.map((shape) => shape.x));
  const minY = Math.min(...shapes.map((shape) => shape.y));
  const maxX = Math.max(...shapes.map((shape) => shape.x + shape.width));
  const maxY = Math.max(...shapes.map((shape) => shape.y + shape.height));

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function getAlignmentGuides(
  shapes: WireShape[],
  movingIds: Set<string>,
  bounds: { x: number; y: number; width: number; height: number },
) {
  const threshold = 10;
  const guides: AlignmentGuide[] = [];
  let bestVertical: { diff: number; position: number } | null = null;
  let bestHorizontal: { diff: number; position: number } | null = null;
  const movingX = [bounds.x, bounds.x + bounds.width / 2, bounds.x + bounds.width];
  const movingY = [bounds.y, bounds.y + bounds.height / 2, bounds.y + bounds.height];

  for (const shape of getGuideCandidates(shapes, movingIds, bounds)) {
    const targetX = [shape.x, shape.x + shape.width / 2, shape.x + shape.width];
    const targetY = [shape.y, shape.y + shape.height / 2, shape.y + shape.height];

    for (let index = 0; index < movingX.length; index += 1) {
      const diff = targetX[index] - movingX[index];
      if (Math.abs(diff) <= threshold && (!bestVertical || Math.abs(diff) < Math.abs(bestVertical.diff))) {
        bestVertical = { diff, position: targetX[index] };
      }
    }

    for (let index = 0; index < movingY.length; index += 1) {
      const diff = targetY[index] - movingY[index];
      if (Math.abs(diff) <= threshold && (!bestHorizontal || Math.abs(diff) < Math.abs(bestHorizontal.diff))) {
        bestHorizontal = { diff, position: targetY[index] };
      }
    }
  }

  if (bestVertical) guides.push({ orientation: "vertical", position: bestVertical.position });
  if (bestHorizontal) guides.push({ orientation: "horizontal", position: bestHorizontal.position });

  return guides;
}

function CanvasShape({
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

function ContextMenuButton({
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

const flowNodeTypes = { maketarFlow: FlowNode };

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

const flowTextAlignClass: Record<FlowTextAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const flowTextVerticalAlignStyle: Record<FlowTextVerticalAlign, string> = {
  top: "flex-start",
  middle: "center",
  bottom: "flex-end",
};

const flowTextHorizontalAlignStyle: Record<FlowTextAlign, string> = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
};

function FlowTextAlignmentControls({
  textAlign,
  textVerticalAlign,
  onTextAlignChange,
  onTextVerticalAlignChange,
}: {
  textAlign: FlowTextAlign;
  textVerticalAlign: FlowTextVerticalAlign;
  onTextAlignChange: (value: FlowTextAlign) => void;
  onTextVerticalAlignChange: (value: FlowTextVerticalAlign) => void;
}) {
  const horizontalOptions: Array<{ value: FlowTextAlign; label: string; icon: IconComponent }> = [
    { value: "left", label: "Alinear a la izquierda", icon: AlignHorizontalJustifyStart },
    { value: "center", label: "Centrar horizontalmente", icon: AlignHorizontalJustifyCenter },
    { value: "right", label: "Alinear a la derecha", icon: AlignHorizontalJustifyEnd },
  ];
  const verticalOptions: Array<{ value: FlowTextVerticalAlign; label: string; icon: IconComponent }> = [
    { value: "top", label: "Alinear arriba", icon: AlignVerticalJustifyStart },
    { value: "middle", label: "Centrar verticalmente", icon: AlignVerticalJustifyCenter },
    { value: "bottom", label: "Alinear abajo", icon: AlignVerticalJustifyEnd },
  ];

  return (
    <div className="space-y-3">
      <div>
        <p className="property-label mb-2">Alineacion horizontal</p>
        <div className="grid grid-cols-3 gap-1 rounded-md border border-slate-200 bg-slate-50 p-1">
          {horizontalOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              title={option.label}
              aria-label={option.label}
              aria-pressed={textAlign === option.value}
              className={cn("toolbar-button justify-center", textAlign === option.value && "is-active")}
              onClick={() => onTextAlignChange(option.value)}
            >
              {createElement(option.icon, { size: 16, strokeWidth: 1.8 })}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="property-label mb-2">Alineacion vertical</p>
        <div className="grid grid-cols-3 gap-1 rounded-md border border-slate-200 bg-slate-50 p-1">
          {verticalOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              title={option.label}
              aria-label={option.label}
              aria-pressed={textVerticalAlign === option.value}
              className={cn("toolbar-button justify-center", textVerticalAlign === option.value && "is-active")}
              onClick={() => onTextVerticalAlignChange(option.value)}
            >
              {createElement(option.icon, { size: 16, strokeWidth: 1.8 })}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function FlowNode({ id, data, selected, width, height }: NodeProps<Node<FlowNodeData>>) {
  const updateNodeInternals = useUpdateNodeInternals();
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
  const nodeWidth = width ?? defaults.width;
  const nodeHeight = height ?? defaults.height;
  const fill = data.fill ?? defaults.fill;
  const stroke = data.stroke ?? defaults.stroke;
  const textColor = data.textColor ?? defaults.textColor;
  const textAlign = data.textAlign ?? "left";
  const textVerticalAlign = data.textVerticalAlign ?? "middle";
  const iconVisualSize = Math.min(nodeWidth, nodeHeight) * 0.78;
  const showIconLabel = Boolean(data.label.trim());

  useEffect(() => {
    if (isGroup || isImage) return;
    updateNodeInternals(id);
  }, [id, isGroup, isImage, nodeWidth, nodeHeight, updateNodeInternals]);

  return (
    <div className="relative" style={{ width: nodeWidth, height: nodeHeight }}>
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
              className="nodrag nowheel min-h-5 w-full shrink-0 resize-none bg-transparent text-center text-[11px] font-semibold leading-tight outline-none"
              style={{ color: textColor }}
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
            className="nodrag nowheel min-h-6 w-full shrink-0 resize-none bg-transparent text-center text-[11px] font-semibold leading-tight text-slate-700 outline-none"
            style={{ color: textColor }}
            value={data.label}
            onChange={(event) => data.onChange?.(id, event.target.value)}
            onPointerDown={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
      {isGroup ? (
        <div
          className="flex size-full items-start rounded-lg border-2 border-dashed px-3 py-2"
          style={{ backgroundColor: withAlpha(fill, 0.28), borderColor: stroke }}
        >
          <textarea
            className="nodrag nowheel min-h-8 w-full resize-none bg-transparent text-left text-xs font-bold uppercase tracking-[0.08em] outline-none"
            style={{ color: textColor }}
            value={data.label}
            onChange={(event) => data.onChange?.(id, event.target.value)}
            onPointerDown={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
      <div
        className={cn(
          "relative flex size-full border px-3 py-2 shadow-sm",
          !isText && "items-center justify-center",
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
          ...(isText
            ? {
                alignItems: flowTextVerticalAlignStyle[textVerticalAlign],
                justifyContent: flowTextHorizontalAlignStyle[textAlign],
              }
            : {}),
        }}
      >
        <textarea
          className={cn(
            "nodrag nowheel min-h-10 w-full resize-none bg-transparent text-sm font-semibold outline-none",
            isData && "skew-x-[10deg]",
            isDecision && "m-auto max-w-24 text-center",
            isText && cn("font-medium", flowTextAlignClass[textAlign]),
            !isText && !isDecision && "text-center",
          )}
          style={{ color: textColor }}
          value={data.label}
          onChange={(event) => data.onChange?.(id, event.target.value)}
          onPointerDown={(event) => event.stopPropagation()}
        />
      </div>
    </div>
  );
}

function FlowDiagramSync({
  nodes,
  onReady,
}: {
  nodes: FlowNodeType[];
  onReady: () => void;
}) {
  const nodesInitialized = useNodesInitialized();
  const updateNodeInternals = useUpdateNodeInternals();
  const { setEdges } = useReactFlow();

  useEffect(() => {
    if (!nodesInitialized) return;

    const connectableNodeIds = nodes
      .filter((node) => node.data.variant !== "group" && node.data.variant !== "image")
      .map((node) => node.id);

    for (const nodeId of connectableNodeIds) {
      updateNodeInternals(nodeId);
    }

    const frame = requestAnimationFrame(() => {
      if (connectableNodeIds.length > 0) {
        setEdges((currentEdges) => currentEdges.map((edge) => ({ ...edge })));
      }
      onReady();
    });

    return () => cancelAnimationFrame(frame);
  }, [nodes, nodesInitialized, onReady, setEdges, updateNodeInternals]);

  return null;
}

function DiagramCanvas({
  nodes,
  edges,
  onDiagramFlowReady,
  onDropFlowNode,
  onDropFlowIcon,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onReconnect,
  onEdgeLabelChange,
  onSelectionChange,
  onDeleteSelection,
  onDeleteNode,
  onDeleteEdge,
  onDuplicateNode,
  onDuplicateSelection,
  onCopySelection,
  onPaste,
}: {
  nodes: FlowNodeType[];
  edges: Edge[];
  onDiagramFlowReady: () => void;
  onDropFlowNode: (variant: FlowNodeVariant, label?: string, center?: { x: number; y: number }) => void;
  onDropFlowIcon: (iconName: string, iconSet: string, svgSrc?: string, label?: string, center?: { x: number; y: number }) => void;
  onNodesChange: OnNodesChange<FlowNodeType>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onReconnect: (oldEdge: Edge, connection: Connection) => void;
  onEdgeLabelChange: (id: string, label: string) => void;
  onSelectionChange: (nodeIds: string[], edgeIds: string[]) => void;
  onDeleteSelection: () => void;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (id: string) => void;
  onDuplicateNode: (id: string) => void;
  onDuplicateSelection: () => void;
  onCopySelection: () => void;
  onPaste: () => void;
}) {
  return (
    <ReactFlowProvider>
      <DiagramCanvasInner
        nodes={nodes}
        edges={edges}
        onDiagramFlowReady={onDiagramFlowReady}
        onDropFlowNode={onDropFlowNode}
        onDropFlowIcon={onDropFlowIcon}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onReconnect={onReconnect}
        onEdgeLabelChange={onEdgeLabelChange}
        onSelectionChange={onSelectionChange}
        onDeleteSelection={onDeleteSelection}
        onDeleteNode={onDeleteNode}
        onDeleteEdge={onDeleteEdge}
        onDuplicateNode={onDuplicateNode}
        onDuplicateSelection={onDuplicateSelection}
        onCopySelection={onCopySelection}
        onPaste={onPaste}
      />
    </ReactFlowProvider>
  );
}

function DiagramCanvasInner({
  nodes,
  edges,
  onDiagramFlowReady,
  onDropFlowNode,
  onDropFlowIcon,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onReconnect,
  onEdgeLabelChange,
  onSelectionChange,
  onDeleteSelection,
  onDeleteNode,
  onDeleteEdge,
  onDuplicateNode,
  onDuplicateSelection,
  onCopySelection,
  onPaste,
}: {
  nodes: FlowNodeType[];
  edges: Edge[];
  onDiagramFlowReady: () => void;
  onDropFlowNode: (variant: FlowNodeVariant, label?: string, center?: { x: number; y: number }) => void;
  onDropFlowIcon: (iconName: string, iconSet: string, svgSrc?: string, label?: string, center?: { x: number; y: number }) => void;
  onNodesChange: OnNodesChange<FlowNodeType>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onReconnect: (oldEdge: Edge, connection: Connection) => void;
  onEdgeLabelChange: (id: string, label: string) => void;
  onSelectionChange: (nodeIds: string[], edgeIds: string[]) => void;
  onDeleteSelection: () => void;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (id: string) => void;
  onDuplicateNode: (id: string) => void;
  onDuplicateSelection: () => void;
  onCopySelection: () => void;
  onPaste: () => void;
}) {
  const { screenToFlowPosition } = useReactFlow();
  const [contextMenu, setContextMenu] = useState<null | {
    type: "node" | "edge" | "pane";
    id?: string;
    x: number;
    y: number;
  }>(null);
  const selectedNodeIds = useMemo(() => nodes.filter((node) => node.selected).map((node) => node.id), [nodes]);
  const selectedEdgeIds = useMemo(() => edges.filter((edge) => edge.selected).map((edge) => edge.id), [edges]);
  const hasSelection = selectedNodeIds.length > 0 || selectedEdgeIds.length > 0;
  const handleLibraryDrop = useCallback((event: DragEvent) => {
    event.preventDefault();
    const payload = parseLibraryDragPayload(event.dataTransfer.getData(LIBRARY_DRAG_MIME));
    if (!payload) return;
    const center = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    if (payload.kind === "flow-node") {
      onDropFlowNode(payload.variant, payload.label, center);
      return;
    }
    if (payload.kind === "flow-icon") {
      onDropFlowIcon(payload.iconName, payload.iconSet, payload.svgSrc, payload.label, center);
    }
  }, [onDropFlowIcon, onDropFlowNode, screenToFlowPosition]);

  return (
    <div className="size-full bg-white">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={flowNodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onReconnect={onReconnect}
        onDragOver={handleLibraryDragOver}
        onDrop={handleLibraryDrop}
        edgesReconnectable
        deleteKeyCode={null}
        multiSelectionKeyCode={["Meta", "Control", "Shift"]}
        onEdgeDoubleClick={(_, edge) => {
          const nextLabel = window.prompt("Etiqueta de la flecha", String(edge.label ?? ""));
          if (nextLabel !== null) onEdgeLabelChange(edge.id, nextLabel);
        }}
        onNodeContextMenu={(event, node) => {
          event.preventDefault();
          setContextMenu({ type: "node", id: node.id, x: event.clientX, y: event.clientY });
        }}
        onEdgeContextMenu={(event, edge) => {
          event.preventDefault();
          setContextMenu({ type: "edge", id: edge.id, x: event.clientX, y: event.clientY });
        }}
        onPaneContextMenu={(event) => {
          event.preventDefault();
          if (!hasSelection) return;
          setContextMenu({ type: "pane", x: event.clientX, y: event.clientY });
        }}
        onPaneClick={() => setContextMenu(null)}
        onNodeClick={() => setContextMenu(null)}
        onEdgeClick={() => setContextMenu(null)}
        onSelectionChange={({ nodes: selectedNodes, edges: selectedEdges }) => {
          onSelectionChange(
            selectedNodes.map((node) => node.id),
            selectedEdges.map((edge) => edge.id),
          );
        }}
        defaultEdgeOptions={{
          type: "smoothstep",
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { strokeWidth: 2.5 },
        }}
        connectionLineStyle={{ strokeWidth: 2.5 }}
        connectionMode={ConnectionMode.Loose}
        connectionRadius={44}
        reconnectRadius={32}
        fitView
      >
        <FlowDiagramSync nodes={nodes} onReady={onDiagramFlowReady} />
        <Background variant={BackgroundVariant.Dots} gap={18} size={1} color="#94a3b8" />
        <Controls />
        <MiniMap pannable zoomable />
      </ReactFlow>
      {contextMenu ? (
        <div
          className="fixed z-50 w-48 rounded-md border border-slate-200 bg-white p-1 text-sm shadow-xl"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {contextMenu.type === "node" && contextMenu.id ? (
            <>
              <ContextMenuButton label="Duplicar" onClick={() => { onDuplicateNode(contextMenu.id!); setContextMenu(null); }} />
              <ContextMenuButton label="Copiar seleccion" onClick={() => { onCopySelection(); setContextMenu(null); }} />
              <ContextMenuButton danger label="Eliminar nodo" onClick={() => { onDeleteNode(contextMenu.id!); setContextMenu(null); }} />
            </>
          ) : null}
          {contextMenu.type === "edge" && contextMenu.id ? (
            <>
              <ContextMenuButton label="Editar etiqueta" onClick={() => {
                const edge = edges.find((item) => item.id === contextMenu.id);
                const nextLabel = window.prompt("Etiqueta de la flecha", String(edge?.label ?? ""));
                if (nextLabel !== null) onEdgeLabelChange(contextMenu.id!, nextLabel);
                setContextMenu(null);
              }} />
              <ContextMenuButton danger label="Eliminar flecha" onClick={() => { onDeleteEdge(contextMenu.id!); setContextMenu(null); }} />
            </>
          ) : null}
          {contextMenu.type === "pane" ? (
            <>
              <ContextMenuButton label="Duplicar seleccion" onClick={() => { onDuplicateSelection(); setContextMenu(null); }} />
              <ContextMenuButton label="Copiar seleccion" onClick={() => { onCopySelection(); setContextMenu(null); }} />
              <ContextMenuButton label="Pegar" onClick={() => { onPaste(); setContextMenu(null); }} />
              <ContextMenuButton danger label="Eliminar seleccion" onClick={() => { onDeleteSelection(); setContextMenu(null); }} />
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function DiagramPropertiesPanel({
  selectedNode,
  selectedEdge,
  onUpdateNode,
  onUpdateEdge,
  onDeleteEdge,
}: {
  selectedNode: FlowNodeType | null;
  selectedEdge: Edge | null;
  onUpdateNode: (id: string, patch: Partial<FlowNodeType>) => void;
  onUpdateEdge: (id: string, patch: Partial<Edge>) => void;
  onDeleteEdge: (id: string) => void;
}) {
  return (
    <aside className="w-[336px] shrink-0 overflow-auto border-l border-slate-200 bg-white">
      <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4">
        <div className="flex items-center gap-2">
          <PanelRight size={16} />
          <h2 className="text-sm font-semibold">Propiedades</h2>
        </div>
        {selectedNode ? <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-500">nodo</span> : null}
        {selectedEdge ? <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-500">flecha</span> : null}
      </div>

      <div className="space-y-5 p-4">
        {!selectedNode && !selectedEdge ? (
          <div className="text-sm text-slate-500">
            Selecciona un nodo o una flecha del flujo.
          </div>
        ) : null}

        {selectedNode ? (
          <>
            <PropertySection title="Nodo">
              <label className="property-label">
                Texto
                <textarea
                  className="property-input min-h-20 resize-none"
                  value={selectedNode.data.label}
                  onChange={(event) =>
                    onUpdateNode(selectedNode.id, {
                      data: { ...selectedNode.data, label: event.target.value },
                    })
                  }
                />
              </label>
            </PropertySection>
            <PropertySection title="Posicion y tamano">
              <div className="grid grid-cols-2 gap-2">
                <NumberInput
                  label="X"
                  value={selectedNode.position.x}
                  onChange={(x) => onUpdateNode(selectedNode.id, { position: { ...selectedNode.position, x } })}
                />
                <NumberInput
                  label="Y"
                  value={selectedNode.position.y}
                  onChange={(y) => onUpdateNode(selectedNode.id, { position: { ...selectedNode.position, y } })}
                />
                <NumberInput
                  label="W"
                  value={Number(selectedNode.width ?? selectedNode.style?.width ?? flowNodeDefaults[selectedNode.data.variant].width)}
                  onChange={(width) => onUpdateNode(selectedNode.id, { style: { ...selectedNode.style, width } })}
                />
                <NumberInput
                  label="H"
                  value={Number(selectedNode.height ?? selectedNode.style?.height ?? flowNodeDefaults[selectedNode.data.variant].height)}
                  onChange={(height) => onUpdateNode(selectedNode.id, { style: { ...selectedNode.style, height } })}
                />
              </div>
            </PropertySection>
            {selectedNode.data.variant === "text" ? (
              <PropertySection title="Texto">
                <FlowTextAlignmentControls
                  textAlign={selectedNode.data.textAlign ?? "left"}
                  textVerticalAlign={selectedNode.data.textVerticalAlign ?? "middle"}
                  onTextAlignChange={(textAlign) =>
                    onUpdateNode(selectedNode.id, {
                      data: { ...selectedNode.data, textAlign },
                    })
                  }
                  onTextVerticalAlignChange={(textVerticalAlign) =>
                    onUpdateNode(selectedNode.id, {
                      data: { ...selectedNode.data, textVerticalAlign },
                    })
                  }
                />
              </PropertySection>
            ) : null}
            <PropertySection title="Color">
              <ColorInput
                label="Relleno"
                value={selectedNode.data.fill ?? flowNodeDefaults[selectedNode.data.variant].fill}
                onChange={(fill) => onUpdateNode(selectedNode.id, { data: { ...selectedNode.data, fill } })}
              />
              <ColorInput
                label="Borde"
                value={selectedNode.data.stroke ?? flowNodeDefaults[selectedNode.data.variant].stroke}
                onChange={(stroke) => onUpdateNode(selectedNode.id, { data: { ...selectedNode.data, stroke } })}
              />
              <ColorInput
                label="Texto"
                value={selectedNode.data.textColor ?? flowNodeDefaults[selectedNode.data.variant].textColor}
                onChange={(textColor) => onUpdateNode(selectedNode.id, { data: { ...selectedNode.data, textColor } })}
              />
            </PropertySection>
          </>
        ) : null}

        {selectedEdge ? (
          <PropertySection title="Conexion">
            <label className="property-label">
              Etiqueta
              <input
                className="property-input"
                value={String(selectedEdge.label ?? "")}
                onChange={(event) => onUpdateEdge(selectedEdge.id, { label: event.target.value })}
              />
            </label>
            <label className="property-label">
              Tipo de linea
              <select
                className="property-input"
                value={getFlowEdgeLineStyle(selectedEdge)}
                onChange={(event) => {
                  const lineStyle = event.target.value as FlowEdgeLineStyle;
                  onUpdateEdge(selectedEdge.id, applyFlowEdgeLineStyle(selectedEdge, lineStyle));
                }}
              >
                {flowEdgeLineStyleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
              {selectedEdge.source} → {selectedEdge.target}
            </div>
            <button
              className="secondary-button w-full text-red-600"
              onClick={() => onDeleteEdge(selectedEdge.id)}
            >
              Eliminar flecha
            </button>
          </PropertySection>
        ) : null}
      </div>
    </aside>
  );
}

function PropertiesPanel({
  selectedShape,
}: {
  selectedShape: WireShape | null;
}) {
  const updateShape = useEditorStore((state) => state.updateShape);
  const updateShapeStyle = useEditorStore((state) => state.updateShapeStyle);
  const alignSelected = useEditorStore((state) => state.alignSelected);
  const selectedIds = useEditorStore((state) => state.selectedIds);
  const alignmentActions: Array<{
    direction: Parameters<typeof alignSelected>[0];
    label: string;
    icon: IconComponent;
    disabled?: boolean;
  }> = [
    { direction: "left", label: "Alinear a la izquierda", icon: AlignHorizontalJustifyStart },
    { direction: "center", label: "Alinear al centro horizontal", icon: AlignHorizontalJustifyCenter },
    { direction: "right", label: "Alinear a la derecha", icon: AlignHorizontalJustifyEnd },
    { direction: "top", label: "Alinear arriba", icon: AlignVerticalJustifyStart },
    { direction: "middle", label: "Alinear al centro vertical", icon: AlignVerticalJustifyCenter },
    { direction: "bottom", label: "Alinear abajo", icon: AlignVerticalJustifyEnd },
    {
      direction: "distribute-horizontal",
      label: "Distribuir horizontalmente",
      icon: AlignHorizontalDistributeCenter,
      disabled: selectedIds.length < 3,
    },
    {
      direction: "distribute-vertical",
      label: "Distribuir verticalmente",
      icon: AlignVerticalDistributeCenter,
      disabled: selectedIds.length < 3,
    },
  ];

  return (
    <aside className="w-[336px] shrink-0 overflow-auto border-l border-slate-200 bg-white">
      <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4">
        <div className="flex items-center gap-2">
          <PanelRight size={16} />
          <h2 className="text-sm font-semibold">Propiedades</h2>
        </div>
        {selectedShape ? <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-500">{selectedShape.type}</span> : null}
      </div>

      <div className="space-y-5 p-4">
        {!selectedShape ? (
          <div className="text-sm text-slate-500">
            Selecciona uno o mas elementos. Usa Shift + click para seleccionar varios.
          </div>
        ) : (
          <>
            <PropertySection title="Elemento">
              {selectedIds.length > 1 ? (
                <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
                  {selectedIds.length} objetos seleccionados
                </div>
              ) : null}
              {selectedShape.groupId ? (
                <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  Grupo: {selectedShape.groupId.replace("group-", "#")}
                </div>
              ) : null}
              <label className="property-label">
                Nombre
                <input value={selectedShape.name} onChange={(event) => updateShape(selectedShape.id, { name: event.target.value })} className="property-input" />
              </label>
              {selectedShape.type === "table" ? (
                <TableConfigEditor
                  shape={selectedShape}
                  onChange={(text) => updateShape(selectedShape.id, { text })}
                />
              ) : (
                <label className="property-label">
                  Texto
                  <textarea
                    value={selectedShape.text}
                    onChange={(event) => updateShape(selectedShape.id, { text: event.target.value })}
                    className="property-input min-h-20 resize-none"
                  />
                </label>
              )}
            </PropertySection>

            <PropertySection title="Posicion y tamano">
              <div className="grid grid-cols-2 gap-2">
                <NumberInput label="X" value={selectedShape.x} onChange={(x) => updateShape(selectedShape.id, { x })} />
                <NumberInput label="Y" value={selectedShape.y} onChange={(y) => updateShape(selectedShape.id, { y })} />
                <NumberInput label="W" value={selectedShape.width} onChange={(width) => updateShape(selectedShape.id, { width })} />
                <NumberInput label="H" value={selectedShape.height} onChange={(height) => updateShape(selectedShape.id, { height })} />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {alignmentActions.map(({ direction, label, icon: Icon, disabled }) => (
                  <button
                    key={direction}
                    className="toolbar-button border border-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                    title={label}
                    aria-label={label}
                    disabled={disabled}
                    onClick={() => alignSelected(direction)}
                  >
                    <Icon size={15} />
                  </button>
                ))}
              </div>
            </PropertySection>

            <PropertySection title="Estilo">
              <ColorInput label="Fill" value={selectedShape.style.fill} onChange={(fill) => updateShapeStyle(selectedShape.id, { fill })} />
              <ColorInput label="Texto" value={selectedShape.style.textColor} onChange={(textColor) => updateShapeStyle(selectedShape.id, { textColor })} />
              <RangeInput label="Opacidad" value={selectedShape.style.opacity} min={0.1} max={1} step={0.05} onChange={(opacity) => updateShapeStyle(selectedShape.id, { opacity })} />
            </PropertySection>

            <PropertySection title="Tipografia">
              <label className="property-label">
                Fuente
                <select
                  className="property-input"
                  value={selectedShape.style.fontFamily}
                  onChange={(event) => updateShapeStyle(selectedShape.id, { fontFamily: event.target.value })}
                >
                  {fontFamilies.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <NumberInput label="Size" value={selectedShape.style.fontSize} onChange={(fontSize) => updateShapeStyle(selectedShape.id, { fontSize })} />
                <NumberInput label="Weight" value={selectedShape.style.fontWeight} onChange={(fontWeight) => updateShapeStyle(selectedShape.id, { fontWeight })} />
              </div>
              <label className="property-label">
                Alineacion
                <select className="property-input" value={selectedShape.style.textAlign} onChange={(event) => updateShapeStyle(selectedShape.id, { textAlign: event.target.value as WireShape["style"]["textAlign"] })}>
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </label>
            </PropertySection>

            <PropertySection title="Borde">
              <ColorInput label="Color" value={selectedShape.style.stroke} onChange={(stroke) => updateShapeStyle(selectedShape.id, { stroke })} />
              <NumberInput label="Grosor" value={selectedShape.style.strokeWidth} onChange={(strokeWidth) => updateShapeStyle(selectedShape.id, { strokeWidth })} />
              <label className="property-label">
                Estilo
                <select className="property-input" value={selectedShape.style.strokeStyle} onChange={(event) => updateShapeStyle(selectedShape.id, { strokeStyle: event.target.value as WireShape["style"]["strokeStyle"] })}>
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                </select>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <NumberInput label="TL" value={selectedShape.style.borderTopLeftRadius} onChange={(borderTopLeftRadius) => updateShapeStyle(selectedShape.id, { borderTopLeftRadius })} />
                <NumberInput label="TR" value={selectedShape.style.borderTopRightRadius} onChange={(borderTopRightRadius) => updateShapeStyle(selectedShape.id, { borderTopRightRadius })} />
                <NumberInput label="BL" value={selectedShape.style.borderBottomLeftRadius} onChange={(borderBottomLeftRadius) => updateShapeStyle(selectedShape.id, { borderBottomLeftRadius })} />
                <NumberInput label="BR" value={selectedShape.style.borderBottomRightRadius} onChange={(borderBottomRightRadius) => updateShapeStyle(selectedShape.id, { borderBottomRightRadius })} />
              </div>
            </PropertySection>

            <PropertySection title="Transformacion">
              <RangeInput label="Rotacion" value={selectedShape.style.rotation} min={-180} max={180} step={1} onChange={(rotation) => updateShapeStyle(selectedShape.id, { rotation })} />
            </PropertySection>
          </>
        )}
      </div>
    </aside>
  );
}

function TableConfigEditor({ shape, onChange }: { shape: WireShape; onChange: (text: string) => void }) {
  const rows = parseTableText(shape.text);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-600">Celdas</span>
        <div className="flex gap-1">
          <button className="toolbar-button border border-slate-200" title="Agregar fila" onClick={() => onChange(addTableRow(shape.text))}>
            <Plus size={14} />
            <span className="sr-only">Fila</span>
          </button>
          <button className="toolbar-button border border-slate-200" title="Agregar columna" onClick={() => onChange(addTableColumn(shape.text))}>
            <Grid3X3 size={14} />
            <span className="sr-only">Columna</span>
          </button>
        </div>
      </div>
      <div className="max-h-64 overflow-auto rounded-md border border-slate-200 bg-slate-50 p-2">
        <div className="grid min-w-max gap-1" style={{ gridTemplateColumns: `repeat(${rows[0]?.length ?? 1}, minmax(92px, 1fr))` }}>
          {rows.flatMap((row, rowIndex) =>
            row.map((cell, cellIndex) => (
              <input
                key={`${shape.id}-config-cell-${rowIndex}-${cellIndex}`}
                className={cn(
                  "h-8 rounded border border-slate-200 bg-white px-2 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100",
                  rowIndex === 0 && "font-bold text-slate-700",
                )}
                value={cell}
                onChange={(event) => onChange(updateTableCell(shape.text, rowIndex, cellIndex, event.target.value))}
                aria-label={`Fila ${rowIndex + 1}, columna ${cellIndex + 1}`}
              />
            )),
          )}
        </div>
      </div>
    </div>
  );
}
