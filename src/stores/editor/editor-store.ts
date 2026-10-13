"use client";

import { create, type StateCreator } from "zustand";

import { readStoredDiagram } from "@/entities/flow/diagram-document";
import { getShapeBounds, matchAlignment } from "@/entities/wireframe/alignment";
import { createDiagramActions, emptyDiagramSlice, type DiagramSlice } from "@/stores/editor/diagram-slice";
import {
  clonePages,
  getCurrentShapes,
  isTemplateType,
  updateCurrentPage,
} from "@/entities/wireframe/page-ops";
import { makeShape, normalizeShape, normalizeStyle } from "@/entities/wireframe/shape-factory";
import { createInitialWireframePage, makeTemplateShapes } from "@/entities/wireframe/wireframe-templates";
import type { DiagramMode, ShapeStyle, TemplateType, WirePage, WireShape } from "@/entities/wireframe/wireframe.types";

export type {
  DiagramMode,
  ShapeStyle,
  StrokeStyle,
  TemplateType,
  TextAlign,
  WirePage,
  WireShape,
} from "@/entities/wireframe/wireframe.types";

type HistorySnapshot = {
  pages: WirePage[];
  currentPageId: string;
  selectedId: string | null;
  selectedIds: string[];
};

type HydrateInput = {
  mode?: DiagramMode;
  selectedId?: string | null;
  selectedIds?: string[];
  zoom?: number;
  pan?: { x: number; y: number };
  gridSize?: number;
  showGrid?: boolean;
  snapToGrid?: boolean;
  pages?: WirePage[];
  shapes?: WireShape[];
  currentPageId?: string;
  lastSavedAt?: string;
  diagramNodes?: unknown;
  diagramEdges?: unknown;
};

type EditorState = DiagramSlice & {
  mode: DiagramMode;
  selectedId: string | null;
  selectedIds: string[];
  zoom: number;
  pan: { x: number; y: number };
  gridSize: number;
  showGrid: boolean;
  snapToGrid: boolean;
  pages: WirePage[];
  currentPageId: string;
  lastSavedAt: string;
  past: HistorySnapshot[];
  future: HistorySnapshot[];
  clipboard: WireShape[];
  shapes: WireShape[];
  setMode: (mode: DiagramMode) => void;
  selectShape: (id: string | null, additive?: boolean) => void;
  selectShapes: (ids: string[], additive?: boolean) => void;
  addShape: (type: WireShape["type"], name?: string, center?: { x: number; y: number }) => void;
  addIconShape: (iconName: string, iconSet: string, svgSrc?: string, center?: { x: number; y: number }) => void;
  addCustomIconShape: (name: string, svgSrc: string, iconSet?: string, center?: { x: number; y: number }) => void;
  addImageShape: (imageSrc: string, name?: string) => void;
  addTemplate: (template: TemplateType, center?: { x: number; y: number }) => void;
  updateShape: (id: string, patch: Partial<WireShape>) => void;
  updateShapeStyle: (id: string, patch: Partial<ShapeStyle>) => void;
  moveShape: (id: string, x: number, y: number) => void;
  resizeShape: (id: string, width: number, height: number, x?: number, y?: number) => void;
  rotateShape: (id: string, rotation: number) => void;
  copySelected: () => void;
  pasteClipboard: () => void;
  duplicateShape: () => void;
  deleteSelected: () => void;
  groupSelected: () => void;
  ungroupSelected: () => void;
  bringForward: () => void;
  sendBackward: () => void;
  alignSelected: (direction: "left" | "center" | "right" | "top" | "middle" | "bottom" | "distribute-horizontal" | "distribute-vertical") => void;
  toggleShapeVisibility: (id: string) => void;
  toggleShapeLock: (id: string) => void;
  createPage: () => void;
  duplicatePage: () => void;
  switchPage: (id: string) => void;
  renamePage: (id: string, name: string) => void;
  deletePage: (id: string) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  toggleGrid: () => void;
  toggleSnap: () => void;
  setGridSize: (gridSize: number) => void;
  checkpoint: () => void;
  undo: () => void;
  redo: () => void;
  markSaved: () => void;
  hydrate: (state: HydrateInput) => void;
  resetWorkspace: (kind: DiagramMode | "mixed" | TemplateType, projectName: string) => void;
};

const createPage = (name: string, shapes: WireShape[] = []) => ({
  id: `page-${Date.now()}-${Math.round(Math.random() * 9999)}`,
  name,
  shapes,
});

const makeSnapshot = (state: EditorState): HistorySnapshot => ({
  pages: clonePages(state.pages),
  currentPageId: state.currentPageId,
  selectedId: state.selectedId,
  selectedIds: state.selectedIds,
});

type StoreSet = Parameters<StateCreator<EditorState>>[0];

const withHistory = (set: StoreSet) =>
  (recipe: (state: EditorState) => Partial<EditorState>) =>
    set((state: EditorState) => ({
      ...recipe(state),
      past: [...state.past.slice(-39), makeSnapshot(state)],
      future: [],
    }));

const cloneShapesForInsert = (shapes: WireShape[], offset = 32, nameSuffix = "") => {
  const now = Date.now();
  const groupIdMap = new Map<string, string>();

  return shapes.map((shape, index) => {
    const groupId = shape.groupId
      ? groupIdMap.get(shape.groupId) ?? `group-${now}-${groupIdMap.size}`
      : undefined;

    if (shape.groupId && groupId) {
      groupIdMap.set(shape.groupId, groupId);
    }

    return normalizeShape({
      ...shape,
      id: `shape-${now}-${index}-${Math.round(Math.random() * 9999)}`,
      name: nameSuffix ? `${shape.name}${nameSuffix}` : shape.name,
      x: shape.x + offset,
      y: shape.y + offset,
      layer: now + index,
      groupId,
      style: { ...shape.style, shadow: { ...shape.style.shadow } },
    });
  });
};

export const useEditorStore = create<EditorState>((set, get) => {
  const commit = withHistory(set);

  return {
    ...emptyDiagramSlice,
    ...createDiagramActions(set, get),
    mode: "wireframe",
    selectedId: "shape-card",
    selectedIds: ["shape-card"],
    zoom: 1,
    pan: { x: 0, y: 0 },
    gridSize: 24,
    showGrid: true,
    snapToGrid: true,
    pages: [createInitialWireframePage],
    currentPageId: createInitialWireframePage.id,
    lastSavedAt: "Sin guardar",
    past: [],
    future: [],
    clipboard: [],
    get shapes() {
      return getCurrentShapes(get());
    },
    setMode: (mode) => set({ mode, selectedId: null, selectedIds: [] }),
    selectShape: (id, additive = false) =>
      set((state) => {
        if (!id) return { selectedId: null, selectedIds: [] };
        if (!additive) return { selectedId: id, selectedIds: [id] };
        const selectedIds = state.selectedIds.includes(id)
          ? state.selectedIds.filter((selected) => selected !== id)
          : [...state.selectedIds, id];
        return {
          selectedId: selectedIds.at(-1) ?? null,
          selectedIds,
        };
      }),
    selectShapes: (ids, additive = false) =>
      set((state) => {
        const selectedIds = additive ? Array.from(new Set([...state.selectedIds, ...ids])) : ids;
        return {
          selectedId: selectedIds.at(-1) ?? null,
          selectedIds,
        };
      }),
    addShape: (type, name, center) =>
      commit((state) => {
        const shape = makeShape(type, name);
        if (center) {
          shape.x = Math.round(center.x - shape.width / 2);
          shape.y = Math.round(center.y - shape.height / 2);
        }
        return {
          ...updateCurrentPage(state, (shapes) => [...shapes, shape]),
          selectedId: shape.id,
          selectedIds: [shape.id],
        };
      }),
    addIconShape: (iconName, iconSet, svgSrc, center) =>
      commit((state) => {
        const shape = {
          ...makeShape("icon", iconName),
          name: iconName,
          iconName,
          iconSet,
          svgSrc,
          width: 72,
          height: 72,
          style: normalizeStyle({
            fill: "transparent",
            stroke: "transparent",
            strokeWidth: 0,
            strokeOpacity: 0,
            textColor: "#0f172a",
            borderRadius: 0,
            fontSize: 28,
            shadow: { x: 0, y: 0, blur: 0, spread: 0, color: "transparent" },
          }),
        };
        if (center) {
          shape.x = Math.round(center.x - shape.width / 2);
          shape.y = Math.round(center.y - shape.height / 2);
        }
        return {
          ...updateCurrentPage(state, (shapes) => [...shapes, shape]),
          selectedId: shape.id,
          selectedIds: [shape.id],
        };
      }),
    addCustomIconShape: (name, svgSrc, iconSet = "Mis iconos", center) =>
      commit((state) => {
        const shape = {
          ...makeShape("icon", name),
          name,
          iconName: name,
          iconSet,
          svgSrc,
          width: 72,
          height: 72,
          style: normalizeStyle({
            fill: "transparent",
            stroke: "transparent",
            strokeWidth: 0,
            strokeOpacity: 0,
            textColor: "#0f172a",
            borderRadius: 0,
            shadow: { x: 0, y: 0, blur: 0, spread: 0, color: "transparent" },
          }),
        };
        if (center) {
          shape.x = Math.round(center.x - shape.width / 2);
          shape.y = Math.round(center.y - shape.height / 2);
        }
        return {
          ...updateCurrentPage(state, (shapes) => [...shapes, shape]),
          selectedId: shape.id,
          selectedIds: [shape.id],
        };
      }),
    addImageShape: (imageSrc, name = "Image") =>
      commit((state) => {
        const shape: WireShape = {
          ...makeShape("image", name),
          width: 280,
          height: 180,
          text: "",
          imageSrc,
          style: normalizeStyle({ fill: "#ffffff", stroke: "#cbd5e1", borderRadius: 12 }),
        };
        return {
          ...updateCurrentPage(state, (shapes) => [...shapes, shape]),
          selectedId: shape.id,
          selectedIds: [shape.id],
        };
      }),
    addTemplate: (template, center) =>
      commit((state) => {
        const shapesToAdd = makeTemplateShapes(template);
        const positionedShapes = center
          ? (() => {
              const bounds = getShapeBounds(shapesToAdd);
              const dx = Math.round(center.x - (bounds.x + bounds.width / 2));
              const dy = Math.round(center.y - (bounds.y + bounds.height / 2));
              return shapesToAdd.map((shape) => ({ ...shape, x: shape.x + dx, y: shape.y + dy }));
            })()
          : shapesToAdd;
        return {
          ...updateCurrentPage(state, (shapes) => [...shapes, ...positionedShapes]),
          selectedId: positionedShapes[positionedShapes.length - 1]?.id ?? null,
          selectedIds: positionedShapes.map((shape) => shape.id),
        };
      }),
    updateShape: (id, patch) =>
      commit((state) => ({
        ...updateCurrentPage(state, (shapes) =>
          shapes.map((shape) => (shape.id === id ? normalizeShape({ ...shape, ...patch }) : shape)),
        ),
      })),
    updateShapeStyle: (id, patch) =>
      commit((state) => ({
        ...updateCurrentPage(state, (shapes) =>
          shapes.map((shape) =>
            shape.id === id
              ? { ...shape, style: normalizeStyle({ ...shape.style, ...patch }) }
              : shape,
          ),
        ),
      })),
    moveShape: (id, x, y) => {
      const state = get();
      const snap = state.snapToGrid ? state.gridSize : 1;
      const currentShapes = getCurrentShapes(state);
      const shapeToMove = currentShapes.find((shape) => shape.id === id);
      if (!shapeToMove || shapeToMove.locked) return;
      const nx = Math.round(x / snap) * snap;
      const ny = Math.round(y / snap) * snap;
      const groupId = shapeToMove.groupId;
      const movingShapes = currentShapes.filter((shape) =>
        groupId ? shape.groupId === groupId && !shape.locked : shape.id === id && !shape.locked,
      );
      const movingIds = new Set(movingShapes.map((shape) => shape.id));
      const currentBounds = getShapeBounds(movingShapes);
      let dx = nx - shapeToMove.x;
      let dy = ny - shapeToMove.y;
      if (state.snapToGrid) {
        const rawDx = x - shapeToMove.x;
        const rawDy = y - shapeToMove.y;
        const objectSnap = matchAlignment(currentShapes, movingIds, {
          ...currentBounds,
          x: currentBounds.x + rawDx,
          y: currentBounds.y + rawDy,
        });
        dx = objectSnap.snappedX ? rawDx + objectSnap.dx : dx;
        dy = objectSnap.snappedY ? rawDy + objectSnap.dy : dy;
      }
      set({
        ...updateCurrentPage(state, (shapes) =>
          shapes.map((shape) => {
            if (groupId && shape.groupId === groupId && !shape.locked) {
              return { ...shape, x: shape.x + dx, y: shape.y + dy };
            }
            return shape.id === id && !shape.locked ? { ...shape, x: shape.x + dx, y: shape.y + dy } : shape;
          }),
        ),
      });
    },
    resizeShape: (id, width, height, x, y) => {
      const state = get();
      const snap = state.snapToGrid ? state.gridSize : 1;
      const nextWidth = Math.max(24, Math.round(width / snap) * snap);
      const nextHeight = Math.max(24, Math.round(height / snap) * snap);
      const nextX = typeof x === "number" ? Math.round(x / snap) * snap : undefined;
      const nextY = typeof y === "number" ? Math.round(y / snap) * snap : undefined;
      set({
        ...updateCurrentPage(state, (shapes) =>
          shapes.map((shape) =>
            shape.id === id && !shape.locked
              ? {
                  ...shape,
                  width: nextWidth,
                  height: nextHeight,
                  x: nextX ?? shape.x,
                  y: nextY ?? shape.y,
                }
              : shape,
          ),
        ),
      });
    },
    rotateShape: (id, rotation) => {
      const state = get();
      set({
        ...updateCurrentPage(state, (shapes) =>
          shapes.map((shape) =>
            shape.id === id && !shape.locked
              ? { ...shape, style: normalizeStyle({ ...shape.style, rotation }) }
              : shape,
          ),
        ),
      });
    },
    copySelected: () =>
      set((state) => {
        const selected = getCurrentShapes(state)
          .filter((shape) => state.selectedIds.includes(shape.id))
          .sort((a, b) => a.layer - b.layer);
        return { clipboard: clonePages([{ id: "clipboard", name: "Clipboard", shapes: selected }])[0].shapes };
      }),
    pasteClipboard: () => {
      const clipboard = get().clipboard;
      if (!clipboard.length) return;
      commit((state) => {
        const copies = cloneShapesForInsert(state.clipboard, 32);
        return {
          ...updateCurrentPage(state, (shapes) => [...shapes, ...copies]),
          clipboard: clonePages([{ id: "clipboard", name: "Clipboard", shapes: copies }])[0].shapes,
          selectedId: copies.at(-1)?.id ?? null,
          selectedIds: copies.map((shape) => shape.id),
        };
      });
    },
    duplicateShape: () => {
      const state = get();
      const selected = getCurrentShapes(state)
        .filter((shape) => state.selectedIds.includes(shape.id))
        .sort((a, b) => a.layer - b.layer);
      if (!selected.length) return;
      commit((state) => {
        const copies = cloneShapesForInsert(selected, 32, " copy");
        return {
          ...updateCurrentPage(state, (shapes) => [...shapes, ...copies]),
          selectedId: copies.at(-1)?.id ?? null,
          selectedIds: copies.map((shape) => shape.id),
        };
      });
    },
    deleteSelected: () =>
      commit((state) => ({
        ...updateCurrentPage(state, (shapes) =>
          shapes.filter((shape) => !state.selectedIds.includes(shape.id)),
        ),
        selectedId: null,
        selectedIds: [],
      })),
    groupSelected: () =>
      commit((state) => {
        const ids = state.selectedIds.length > 1 ? state.selectedIds : [];
        if (ids.length < 2) return {};
        const groupId = `group-${Date.now()}`;
        return {
          ...updateCurrentPage(state, (shapes) =>
            shapes.map((shape) => (ids.includes(shape.id) ? { ...shape, groupId } : shape)),
          ),
        };
      }),
    ungroupSelected: () =>
      commit((state) => {
        const selectedGroups = new Set(
          getCurrentShapes(state)
            .filter((shape) => state.selectedIds.includes(shape.id) && shape.groupId)
            .map((shape) => shape.groupId),
        );
        if (!selectedGroups.size) return {};
        return {
          ...updateCurrentPage(state, (shapes) =>
            shapes.map((shape) =>
              shape.groupId && selectedGroups.has(shape.groupId)
                ? { ...shape, groupId: undefined }
                : shape,
            ),
          ),
        };
      }),
    bringForward: () =>
      commit((state) => ({
        ...updateCurrentPage(state, (shapes) =>
          shapes.map((shape) => (shape.id === state.selectedId ? { ...shape, layer: Date.now() } : shape)),
        ),
      })),
    sendBackward: () =>
      commit((state) => ({
        ...updateCurrentPage(state, (shapes) =>
          shapes.map((shape) => (shape.id === state.selectedId ? { ...shape, layer: 0 } : shape)),
        ),
      })),
    alignSelected: (direction) =>
      commit((state) => {
        const selectedShapes = getCurrentShapes(state)
          .filter((shape) => state.selectedIds.includes(shape.id) && !shape.locked);
        if (!selectedShapes.length) return {};

        const selectedBounds = getShapeBounds(selectedShapes);
        const primary = selectedShapes.find((shape) => shape.id === state.selectedId) ?? selectedShapes[0];
        const frames = getCurrentShapes(state).filter((shape) =>
          ["desktop", "mobile", "modal"].includes(shape.type) && !state.selectedIds.includes(shape.id),
        );
        const containingFrame =
          frames.find(
            (shape) =>
              primary.x >= shape.x &&
              primary.y >= shape.y &&
              primary.x + primary.width <= shape.x + shape.width &&
              primary.y + primary.height <= shape.y + shape.height,
          ) ?? frames[0];
        const reference = selectedShapes.length > 1 ? selectedBounds : containingFrame ?? selectedBounds;

        if (direction === "distribute-horizontal" && selectedShapes.length > 2) {
          const ordered = [...selectedShapes].sort((a, b) => a.x - b.x);
          const left = ordered[0].x;
          const right = ordered.at(-1)!.x + ordered.at(-1)!.width;
          const totalWidth = ordered.reduce((sum, shape) => sum + shape.width, 0);
          const gap = (right - left - totalWidth) / (ordered.length - 1);
          let nextX = left;
          const positions = new Map<string, number>();
          for (const shape of ordered) {
            positions.set(shape.id, nextX);
            nextX += shape.width + gap;
          }
          return {
            ...updateCurrentPage(state, (shapes) =>
              shapes.map((shape) => positions.has(shape.id) ? { ...shape, x: positions.get(shape.id)! } : shape),
            ),
          };
        }

        if (direction === "distribute-vertical" && selectedShapes.length > 2) {
          const ordered = [...selectedShapes].sort((a, b) => a.y - b.y);
          const top = ordered[0].y;
          const bottom = ordered.at(-1)!.y + ordered.at(-1)!.height;
          const totalHeight = ordered.reduce((sum, shape) => sum + shape.height, 0);
          const gap = (bottom - top - totalHeight) / (ordered.length - 1);
          let nextY = top;
          const positions = new Map<string, number>();
          for (const shape of ordered) {
            positions.set(shape.id, nextY);
            nextY += shape.height + gap;
          }
          return {
            ...updateCurrentPage(state, (shapes) =>
              shapes.map((shape) => positions.has(shape.id) ? { ...shape, y: positions.get(shape.id)! } : shape),
            ),
          };
        }

        return {
          ...updateCurrentPage(state, (shapes) =>
            shapes.map((shape) => {
              if (!selectedShapes.some((selected) => selected.id === shape.id)) return shape;
              if (direction === "left") return { ...shape, x: reference.x };
              if (direction === "right") return { ...shape, x: reference.x + reference.width - shape.width };
              if (direction === "center") return { ...shape, x: reference.x + reference.width / 2 - shape.width / 2 };
              if (direction === "top") return { ...shape, y: reference.y };
              if (direction === "bottom") return { ...shape, y: reference.y + reference.height - shape.height };
              if (direction === "middle") return { ...shape, y: reference.y + reference.height / 2 - shape.height / 2 };
              return shape;
            }),
          ),
        };
      }),
    toggleShapeVisibility: (id) =>
      commit((state) => ({
        ...updateCurrentPage(state, (shapes) =>
          shapes.map((shape) => (shape.id === id ? { ...shape, visible: !shape.visible } : shape)),
        ),
      })),
    toggleShapeLock: (id) =>
      commit((state) => ({
        ...updateCurrentPage(state, (shapes) =>
          shapes.map((shape) => (shape.id === id ? { ...shape, locked: !shape.locked } : shape)),
        ),
      })),
    createPage: () =>
      commit((state) => {
        const page = createPage(`Page ${state.pages.length + 1}`);
        return { pages: [...state.pages, page], currentPageId: page.id, selectedId: null, selectedIds: [] };
      }),
    duplicatePage: () =>
      commit((state) => {
        const current = state.pages.find((page) => page.id === state.currentPageId);
        if (!current) return {};
        const page = createPage(`${current.name} copy`, clonePages([current])[0].shapes);
        page.shapes = page.shapes.map((shape) => ({ ...shape, id: `${shape.id}-copy-${Date.now()}` }));
        return { pages: [...state.pages, page], currentPageId: page.id, selectedId: null, selectedIds: [] };
      }),
    switchPage: (id) => set({ currentPageId: id, selectedId: null, selectedIds: [] }),
    renamePage: (id, name) =>
      set((state) => ({
        pages: state.pages.map((page) => (page.id === id ? { ...page, name } : page)),
      })),
    deletePage: (id) =>
      commit((state) => {
        if (state.pages.length === 1) return {};
        const pages = state.pages.filter((page) => page.id !== id);
        return {
          pages,
          currentPageId: state.currentPageId === id ? pages[0].id : state.currentPageId,
          selectedId: null,
          selectedIds: [],
        };
      }),
    setZoom: (zoom) => set({ zoom: Math.min(2.2, Math.max(0.35, zoom)) }),
    setPan: (pan) => set({ pan }),
    toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
    toggleSnap: () => set((state) => ({ snapToGrid: !state.snapToGrid })),
    setGridSize: (gridSize) => set({ gridSize: Math.min(80, Math.max(8, gridSize)) }),
    checkpoint: () =>
      set((state) => ({
        past: [...state.past.slice(-39), makeSnapshot(state)],
        future: [],
      })),
    undo: () =>
      set((state) => {
        const previous = state.past.at(-1);
        if (!previous) return {};
        return {
          pages: clonePages(previous.pages),
          currentPageId: previous.currentPageId,
          selectedId: previous.selectedId,
          selectedIds: previous.selectedIds,
          past: state.past.slice(0, -1),
          future: [makeSnapshot(state), ...state.future],
        };
      }),
    redo: () =>
      set((state) => {
        const next = state.future[0];
        if (!next) return {};
        return {
          pages: clonePages(next.pages),
          currentPageId: next.currentPageId,
          selectedId: next.selectedId,
          selectedIds: next.selectedIds,
          past: [...state.past, makeSnapshot(state)],
          future: state.future.slice(1),
        };
      }),
    markSaved: () => set({ lastSavedAt: new Date().toLocaleTimeString() }),
    hydrate: (state) => {
      const diagram = readStoredDiagram(state.diagramNodes, state.diagramEdges);
      const pages =
        state.pages?.length
          ? state.pages.map((page) => ({
              ...page,
              shapes: page.shapes.map(normalizeShape),
            }))
          : [
              {
                ...createInitialWireframePage,
                shapes: state.shapes?.length ? state.shapes.map(normalizeShape) : createInitialWireframePage.shapes,
              },
            ];
      set({
        mode: state.mode ?? "wireframe",
        selectedId: state.selectedId ?? null,
        selectedIds: state.selectedIds ?? (state.selectedId ? [state.selectedId] : []),
        zoom: state.zoom ?? 1,
        pan: state.pan ?? { x: 0, y: 0 },
        gridSize: state.gridSize ?? 24,
        showGrid: state.showGrid ?? true,
        snapToGrid: state.snapToGrid ?? true,
        pages,
        currentPageId: state.currentPageId ?? pages[0].id,
        lastSavedAt: state.lastSavedAt ?? "Restaurado",
        past: [],
        future: [],
        clipboard: [],
        diagramNodes: diagram.nodes,
        diagramEdges: diagram.edges,
        diagramFlowReady: false,
        selectedDiagramNodeId: null,
        selectedDiagramEdgeId: null,
        selectedDiagramNodeIds: [],
        selectedDiagramEdgeIds: [],
      });
    },
    resetWorkspace: (kind, projectName) =>
      set(() => {
        const template = isTemplateType(kind)
          ? kind
          : kind === "diagram"
              ? "form"
              : "dashboard";
        const isBlankProject = kind === "mixed";
        const page: WirePage = {
          id: `page-${Date.now()}`,
          name:
            kind === "diagram"
              ? "Diagrama de flujo"
              : kind === "mixed"
                ? "Lienzo en blanco"
                : isTemplateType(kind)
                  ? `${kind} template`
                  : "Wireframe",
          shapes: isBlankProject ? [] : makeTemplateShapes(template),
        };
        const initialZoom = isBlankProject ? 1 : template === "mobile" ? 0.78 : 0.43;
        const initialPan = isBlankProject ? { x: 0, y: 0 } : template === "mobile" ? { x: -150, y: 18 } : { x: -34, y: 18 };
        return {
          ...emptyDiagramSlice,
          mode: kind === "diagram" ? "diagram" : "wireframe",
          selectedId: null,
          selectedIds: [],
          zoom: initialZoom,
          pan: initialPan,
          gridSize: 24,
          showGrid: true,
          snapToGrid: true,
          pages: [{ ...page, name: `${projectName} - ${page.name}` }],
          currentPageId: page.id,
          lastSavedAt: "Sin guardar",
          past: [],
          future: [],
          clipboard: [],
        };
      }),
  };
});
