"use client";

import { create, type StateCreator } from "zustand";

export type DiagramMode = "wireframe" | "diagram";
export type StrokeStyle = "solid" | "dashed" | "dotted";
export type TextAlign = "left" | "center" | "right";
export type TemplateType = "dashboard" | "landing" | "mobile" | "form" | "architecture";

export type ShapeStyle = {
  fill: string;
  opacity: number;
  stroke: string;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  strokeOpacity: number;
  borderRadius: number;
  borderTopLeftRadius: number;
  borderTopRightRadius: number;
  borderBottomLeftRadius: number;
  borderBottomRightRadius: number;
  shadow: {
    x: number;
    y: number;
    blur: number;
    spread: number;
    color: string;
  };
  rotation: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  textColor: string;
  textAlign: TextAlign;
};

export type WireShape = {
  id: string;
  type:
    | "icon"
    | "rect"
    | "circle"
    | "text"
    | "button"
    | "input"
    | "card"
    | "table"
    | "navbar"
    | "modal"
    | "mobile"
    | "desktop"
    | "image"
    | "aws"
    | "azure"
    | "gcp"
    | "kubernetes"
    | "database"
    | "network"
    | "process"
    | "decision"
    | "uml"
    | "devops"
    | "mindmap"
    | "server"
    | "storage"
    | "api"
    | "org";
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  imageSrc?: string;
  iconName?: string;
  iconSet?: string;
  svgSrc?: string;
  locked: boolean;
  visible: boolean;
  layer: number;
  groupId?: string;
  style: ShapeStyle;
};

export type WirePage = {
  id: string;
  name: string;
  shapes: WireShape[];
};

type HistorySnapshot = {
  pages: WirePage[];
  currentPageId: string;
  selectedId: string | null;
  selectedIds: string[];
};

type EditorState = {
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
  hydrate: (state: Partial<EditorState>) => void;
  resetWorkspace: (kind: DiagramMode | "mixed" | TemplateType, projectName: string) => void;
};

const defaultStyle: ShapeStyle = {
  fill: "#ffffff",
  opacity: 1,
  stroke: "#1f2937",
  strokeWidth: 1,
  strokeStyle: "solid",
  strokeOpacity: 1,
  borderRadius: 10,
  borderTopLeftRadius: 10,
  borderTopRightRadius: 10,
  borderBottomLeftRadius: 10,
  borderBottomRightRadius: 10,
  shadow: {
    x: 0,
    y: 10,
    blur: 22,
    spread: -12,
    color: "rgba(15, 23, 42, 0.35)",
  },
  rotation: 0,
  fontSize: 14,
  fontFamily: "Inter, Arial, sans-serif",
  fontWeight: 600,
  textColor: "#0f172a",
  textAlign: "center",
};

const normalizeStyle = (style?: Partial<ShapeStyle>): ShapeStyle => ({
  ...defaultStyle,
  ...style,
  shadow: { ...defaultStyle.shadow, ...style?.shadow },
});

const normalizeShape = (shape: WireShape): WireShape => ({
  ...shape,
  visible: shape.visible ?? true,
  style: normalizeStyle(shape.style),
});

const initialShapes: WireShape[] = [
  {
    id: "shape-desktop",
    type: "desktop",
    name: "Desktop frame",
    x: 160,
    y: 110,
    width: 620,
    height: 390,
    text: "Product Dashboard",
    locked: false,
    visible: true,
    layer: 1,
    style: normalizeStyle({
      fill: "#f8fafc",
      stroke: "#94a3b8",
      borderRadius: 18,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      borderBottomLeftRadius: 18,
      borderBottomRightRadius: 18,
      fontSize: 18,
    }),
  },
  {
    id: "shape-sidebar",
    type: "navbar",
    name: "Sidebar",
    x: 188,
    y: 164,
    width: 142,
    height: 292,
    text: "Navigation",
    locked: false,
    visible: true,
    layer: 2,
    style: normalizeStyle({
      fill: "#111827",
      stroke: "#111827",
      textColor: "#ffffff",
      borderRadius: 14,
    }),
  },
  {
    id: "shape-card",
    type: "card",
    name: "Metrics card",
    x: 360,
    y: 180,
    width: 180,
    height: 108,
    text: "Revenue\n$42.8k",
    locked: false,
    visible: true,
    layer: 3,
    style: normalizeStyle({ fill: "#ffffff", stroke: "#cbd5e1", borderRadius: 16 }),
  },
  {
    id: "shape-button",
    type: "button",
    name: "Primary button",
    x: 576,
    y: 386,
    width: 148,
    height: 42,
    text: "Export",
    locked: false,
    visible: true,
    layer: 4,
    style: normalizeStyle({
      fill: "#2563eb",
      stroke: "#1d4ed8",
      textColor: "#ffffff",
      borderRadius: 12,
    }),
  },
];

const createPage = (name: string, shapes: WireShape[] = []) => ({
  id: `page-${Date.now()}-${Math.round(Math.random() * 9999)}`,
  name,
  shapes,
});

const initialPage: WirePage = {
  id: "page-home",
  name: "Dashboard wireframe",
  shapes: initialShapes,
};

const clonePages = (pages: WirePage[]) =>
  pages.map((page) => ({
    ...page,
    shapes: page.shapes.map((shape) => ({
      ...shape,
      style: { ...shape.style, shadow: { ...shape.style.shadow } },
    })),
  }));

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

const getCurrentShapes = (state: Pick<EditorState, "pages" | "currentPageId">) =>
  state.pages.find((page) => page.id === state.currentPageId)?.shapes ?? [];

const updateCurrentPage = (
  state: EditorState,
  updater: (shapes: WireShape[]) => WireShape[],
) => ({
  pages: state.pages.map((page) =>
    page.id === state.currentPageId ? { ...page, shapes: updater(page.shapes) } : page,
  ),
});

const frameShapeTypes = new Set<WireShape["type"]>(["desktop", "mobile", "modal"]);

const containsBounds = (
  frame: WireShape,
  bounds: { x: number; y: number; width: number; height: number },
) =>
  bounds.x >= frame.x &&
  bounds.y >= frame.y &&
  bounds.x + bounds.width <= frame.x + frame.width &&
  bounds.y + bounds.height <= frame.y + frame.height;

const getSameVisualLayerCandidates = (
  shapes: WireShape[],
  movingIds: Set<string>,
  bounds: { x: number; y: number; width: number; height: number },
) => {
  const frames = shapes
    .filter((shape) => shape.visible && frameShapeTypes.has(shape.type) && !movingIds.has(shape.id))
    .sort((a, b) => a.width * a.height - b.width * b.height);
  const containingFrame = frames.find((frame) => containsBounds(frame, bounds));
  const baseCandidates = shapes.filter((shape) => {
    if (!shape.visible || movingIds.has(shape.id) || frameShapeTypes.has(shape.type)) return false;
    if (!containingFrame) return true;
    return containsBounds(containingFrame, shape);
  });

  return baseCandidates.length
    ? baseCandidates
    : shapes.filter((shape) => shape.visible && !movingIds.has(shape.id) && !frameShapeTypes.has(shape.type));
};

const snapToObjects = (
  shapes: WireShape[],
  movingIds: Set<string>,
  bounds: { x: number; y: number; width: number; height: number },
) => {
  const threshold = 10;
  const candidates = getSameVisualLayerCandidates(shapes, movingIds, bounds);
  let snapDx = 0;
  let snapDy = 0;
  let snappedX = false;
  let snappedY = false;
  let bestX = threshold + 1;
  let bestY = threshold + 1;
  const movingX = [
    bounds.x,
    bounds.x + bounds.width / 2,
    bounds.x + bounds.width,
  ];
  const movingY = [
    bounds.y,
    bounds.y + bounds.height / 2,
    bounds.y + bounds.height,
  ];

  for (const shape of candidates) {
    const targetX = [shape.x, shape.x + shape.width / 2, shape.x + shape.width];
    const targetY = [shape.y, shape.y + shape.height / 2, shape.y + shape.height];

    for (let index = 0; index < movingX.length; index += 1) {
      const diff = targetX[index] - movingX[index];
      if (Math.abs(diff) < Math.abs(bestX)) {
        bestX = diff;
        snappedX = Math.abs(diff) <= threshold;
        snapDx = snappedX ? diff : 0;
      }
    }

    for (let index = 0; index < movingY.length; index += 1) {
      const diff = targetY[index] - movingY[index];
      if (Math.abs(diff) < Math.abs(bestY)) {
        bestY = diff;
        snappedY = Math.abs(diff) <= threshold;
        snapDy = snappedY ? diff : 0;
      }
    }
  }

  return { dx: snapDx, dy: snapDy, snappedX, snappedY };
};

const getBounds = (shapes: WireShape[]) => {
  const minX = Math.min(...shapes.map((shape) => shape.x));
  const minY = Math.min(...shapes.map((shape) => shape.y));
  const maxX = Math.max(...shapes.map((shape) => shape.x + shape.width));
  const maxY = Math.max(...shapes.map((shape) => shape.y + shape.height));
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
};

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

const makeShape = (type: WireShape["type"], name?: string): WireShape => {
  const id = `shape-${Date.now()}-${Math.round(Math.random() * 9999)}`;
  const baseByType: Record<string, Partial<WireShape>> = {
    rect: { width: 172, height: 108, text: "Rectangle" },
    icon: { width: 72, height: 72, text: "" },
    circle: { width: 120, height: 120, text: "Circle" },
    text: { width: 210, height: 52, text: "Editable text" },
    button: { width: 142, height: 44, text: "Continuar" },
    input: { width: 240, height: 48, text: "Email address" },
    card: { width: 220, height: 144, text: "Card title\nSupporting content" },
    table: { width: 340, height: 210, text: "Campo | Tipo | Estado\nUsuario | String | Activo\nEmail | String | Requerido\nRol | Enum | Opcional" },
    navbar: { width: 520, height: 64, text: "MaketAR | Inicio | Templates | Docs | Entrar" },
    modal: { width: 320, height: 210, text: "Modal title" },
    mobile: { width: 220, height: 430, text: "Mobile screen" },
    desktop: { width: 520, height: 330, text: "Desktop screen" },
    decision: { width: 150, height: 110, text: "Decision?" },
  };

  return {
    id,
    type,
    name: name ?? type,
    x: 84 + Math.round(Math.random() * 120),
    y: 96 + Math.round(Math.random() * 120),
    width: baseByType[type]?.width ?? 170,
    height: baseByType[type]?.height ?? 96,
    text: baseByType[type]?.text ?? name ?? type,
    iconName: type === "icon" ? name : undefined,
    iconSet: type === "icon" ? "Lucide" : undefined,
    locked: false,
    visible: true,
    layer: Date.now(),
    style: normalizeStyle({
      fill: type === "text" ? "transparent" : "#ffffff",
      stroke: type === "text" ? "transparent" : "#334155",
      textColor: type === "button" ? "#ffffff" : "#0f172a",
      borderRadius: type === "circle" ? 999 : defaultStyle.borderRadius,
    }),
  };
};

const makeTemplateShapes = (template: TemplateType) => {
  const now = Date.now();
  let layerIndex = 0;
  const mk = (
    type: WireShape["type"],
    patch: Partial<WireShape>,
    style?: Partial<ShapeStyle>,
  ): WireShape => ({
    ...makeShape(type, patch.name),
    id: `shape-${now}-${layerIndex}`,
    layer: layerIndex++,
    ...patch,
    style: normalizeStyle({ ...makeShape(type).style, shadow: { x: 0, y: 12, blur: 28, spread: -18, color: "rgba(15, 23, 42, 0.22)" }, ...style }),
  });

  if (template === "mobile") {
    return [
      mk("mobile", { name: "Mobile frame", x: 320, y: 64, width: 282, height: 584, text: "" }, { fill: "#f8fafc", stroke: "#334155", borderRadius: 34 }),
      mk("rect", { name: "Status bar", x: 348, y: 88, width: 226, height: 22, text: "9:41                                      5G" }, { fill: "transparent", stroke: "transparent", fontSize: 10, fontWeight: 700, textAlign: "left" }),
      mk("navbar", { name: "Mobile top bar", x: 348, y: 126, width: 226, height: 52, text: "Good morning\nAna" }, { fill: "#ffffff", stroke: "#e2e8f0", borderRadius: 16, fontSize: 13, textAlign: "left" }),
      mk("circle", { name: "Avatar", x: 528, y: 137, width: 30, height: 30, text: "" }, { fill: "#2563eb", stroke: "#1d4ed8" }),
      mk("card", { name: "Balance card", x: 348, y: 198, width: 226, height: 132, text: "Balance\n$12,430\n+8.2% this month" }, { fill: "#111827", stroke: "#111827", textColor: "#ffffff", borderRadius: 22, fontSize: 16, textAlign: "left" }),
      mk("button", { name: "Send action", x: 362, y: 348, width: 92, height: 42, text: "Send" }, { fill: "#2563eb", stroke: "#1d4ed8", textColor: "#ffffff", borderRadius: 14 }),
      mk("button", { name: "Request action", x: 468, y: 348, width: 92, height: 42, text: "Request" }, { fill: "#ecfeff", stroke: "#67e8f9", textColor: "#155e75", borderRadius: 14 }),
      mk("text", { name: "Section title", x: 348, y: 414, width: 160, height: 28, text: "Recent activity" }, { fontSize: 16, fontWeight: 800, textAlign: "left" }),
      mk("card", { name: "Activity row 1", x: 348, y: 454, width: 226, height: 54, text: "Figma subscription       -$15" }, { fill: "#ffffff", stroke: "#e2e8f0", borderRadius: 14, fontSize: 12, textAlign: "left" }),
      mk("card", { name: "Activity row 2", x: 348, y: 520, width: 226, height: 54, text: "Client payment        +$1,250" }, { fill: "#ffffff", stroke: "#e2e8f0", borderRadius: 14, fontSize: 12, textAlign: "left" }),
      mk("navbar", { name: "Bottom nav", x: 362, y: 598, width: 198, height: 34, text: "Home     Cards     Profile" }, { fill: "#ffffff", stroke: "#e2e8f0", borderRadius: 18, fontSize: 10 }),
    ];
  }

  if (template === "landing") {
    return [
      mk("desktop", { name: "Landing frame", x: 96, y: 72, width: 920, height: 600, text: "" }, { fill: "#f8fafc", stroke: "#94a3b8", borderRadius: 20 }),
      mk("navbar", { name: "Top nav", x: 132, y: 108, width: 848, height: 60, text: "MaketAR          Product    Templates    Pricing              Sign in" }, { fill: "#ffffff", stroke: "#e2e8f0", borderRadius: 14, fontSize: 13 }),
      mk("text", { name: "Hero eyebrow", x: 156, y: 214, width: 250, height: 24, text: "VISUAL WORKSPACE" }, { fill: "transparent", stroke: "transparent", textColor: "#2563eb", fontSize: 12, fontWeight: 800, textAlign: "left" }),
      mk("text", { name: "Hero headline", x: 156, y: 248, width: 420, height: 116, text: "Diagram your product before you build it" }, { fill: "transparent", stroke: "transparent", fontSize: 34, fontWeight: 900, textAlign: "left" }),
      mk("text", { name: "Hero body", x: 158, y: 376, width: 382, height: 64, text: "Create wireframes, product flows and technical architecture in one focused canvas." }, { fill: "transparent", stroke: "transparent", textColor: "#475569", fontSize: 15, fontWeight: 500, textAlign: "left" }),
      mk("button", { name: "Primary CTA", x: 158, y: 466, width: 146, height: 46, text: "Start mapping" }, { fill: "#2563eb", stroke: "#1d4ed8", textColor: "#ffffff", borderRadius: 12 }),
      mk("button", { name: "Secondary CTA", x: 318, y: 466, width: 130, height: 46, text: "View demos" }, { fill: "#ffffff", stroke: "#cbd5e1", textColor: "#0f172a", borderRadius: 12 }),
      mk("card", { name: "Hero canvas preview", x: 620, y: 216, width: 304, height: 286, text: "" }, { fill: "#ffffff", stroke: "#cbd5e1", borderRadius: 22 }),
      mk("card", { name: "Preview mini screen", x: 648, y: 248, width: 248, height: 94, text: "Wireframe screen" }, { fill: "#eef2ff", stroke: "#c7d2fe", borderRadius: 16 }),
      mk("card", { name: "Preview flow node A", x: 652, y: 378, width: 96, height: 52, text: "Idea" }, { fill: "#ecfeff", stroke: "#67e8f9", borderRadius: 14 }),
      mk("card", { name: "Preview flow node B", x: 786, y: 378, width: 96, height: 52, text: "Build" }, { fill: "#dcfce7", stroke: "#86efac", borderRadius: 14 }),
      mk("card", { name: "Social proof", x: 156, y: 560, width: 768, height: 54, text: "Trusted for product specs, service maps and technical documentation" }, { fill: "#ffffff", stroke: "#e2e8f0", textColor: "#475569", borderRadius: 14, fontSize: 13 }),
    ];
  }

  if (template === "form") {
    return [
      mk("desktop", { name: "Auth page frame", x: 140, y: 72, width: 760, height: 560, text: "" }, { fill: "#eef2ff", stroke: "#c7d2fe", borderRadius: 20 }),
      mk("card", { name: "Brand panel", x: 176, y: 108, width: 310, height: 488, text: "Design faster\nwith reusable blocks" }, { fill: "#111827", stroke: "#111827", textColor: "#ffffff", borderRadius: 22, fontSize: 24, fontWeight: 900, textAlign: "left" }),
      mk("card", { name: "Form panel", x: 522, y: 108, width: 342, height: 488, text: "" }, { fill: "#ffffff", stroke: "#cbd5e1", borderRadius: 22 }),
      mk("text", { name: "Form title", x: 558, y: 150, width: 240, height: 34, text: "Create account" }, { fill: "transparent", stroke: "transparent", fontSize: 24, fontWeight: 900, textAlign: "left" }),
      mk("text", { name: "Form subtitle", x: 560, y: 190, width: 242, height: 42, text: "Start with a clean visual workspace." }, { fill: "transparent", stroke: "transparent", textColor: "#64748b", fontSize: 13, fontWeight: 500, textAlign: "left" }),
      mk("input", { name: "Name input", x: 560, y: 260, width: 266, height: 46, text: "Full name" }, { borderRadius: 10, textAlign: "left", stroke: "#cbd5e1" }),
      mk("input", { name: "Email input", x: 560, y: 324, width: 266, height: 46, text: "Email address" }, { borderRadius: 10, textAlign: "left", stroke: "#cbd5e1" }),
      mk("input", { name: "Password input", x: 560, y: 388, width: 266, height: 46, text: "Password" }, { borderRadius: 10, textAlign: "left", stroke: "#cbd5e1" }),
      mk("button", { name: "Submit", x: 560, y: 466, width: 266, height: 48, text: "Create workspace" }, { fill: "#2563eb", stroke: "#1d4ed8", textColor: "#ffffff", borderRadius: 12 }),
      mk("text", { name: "Terms", x: 588, y: 536, width: 210, height: 28, text: "Already have an account? Sign in" }, { fill: "transparent", stroke: "transparent", textColor: "#64748b", fontSize: 12, fontWeight: 600 }),
    ];
  }

  if (template === "architecture") {
    return [
      mk("desktop", { name: "Architecture frame", x: 98, y: 72, width: 900, height: 584, text: "" }, { fill: "#f8fafc", stroke: "#94a3b8", borderRadius: 20 }),
      mk("text", { name: "Architecture title", x: 132, y: 116, width: 420, height: 42, text: "Cloud architecture map" }, { fill: "transparent", stroke: "transparent", fontSize: 26, fontWeight: 900, textAlign: "left" }),
      mk("card", { name: "Client layer", x: 148, y: 210, width: 150, height: 82, text: "Client apps\nWeb + Mobile" }, { fill: "#eef2ff", stroke: "#c7d2fe", borderRadius: 16 }),
      mk("card", { name: "Edge layer", x: 384, y: 210, width: 150, height: 82, text: "Edge\nCDN / WAF" }, { fill: "#ecfeff", stroke: "#67e8f9", borderRadius: 16 }),
      mk("card", { name: "API layer", x: 620, y: 210, width: 150, height: 82, text: "API Gateway\nNext.js" }, { fill: "#dcfce7", stroke: "#86efac", borderRadius: 16 }),
      mk("card", { name: "Service layer", x: 384, y: 370, width: 150, height: 82, text: "Workers\nQueues" }, { fill: "#fef3c7", stroke: "#fcd34d", borderRadius: 16 }),
      mk("database", { name: "Database", x: 620, y: 370, width: 150, height: 82, text: "PostgreSQL\nPrisma" }, { fill: "#ffffff", stroke: "#94a3b8", borderRadius: 16 }),
      mk("storage", { name: "Object storage", x: 784, y: 370, width: 150, height: 82, text: "Storage\nAssets" }, { fill: "#ffffff", stroke: "#94a3b8", borderRadius: 16 }),
      mk("text", { name: "Arrow 1", x: 314, y: 236, width: 54, height: 28, text: "->" }, { fill: "transparent", stroke: "transparent", fontSize: 24, fontWeight: 900 }),
      mk("text", { name: "Arrow 2", x: 550, y: 236, width: 54, height: 28, text: "->" }, { fill: "transparent", stroke: "transparent", fontSize: 24, fontWeight: 900 }),
      mk("text", { name: "Arrow 3", x: 650, y: 314, width: 54, height: 28, text: "|" }, { fill: "transparent", stroke: "transparent", fontSize: 24, fontWeight: 900 }),
      mk("card", { name: "Legend", x: 148, y: 522, width: 786, height: 70, text: "Legend: user traffic -> edge protection -> API -> async jobs -> data and assets" }, { fill: "#ffffff", stroke: "#e2e8f0", textColor: "#475569", borderRadius: 16, fontSize: 13 }),
    ];
  }

  return [
    mk("desktop", { name: "Dashboard frame", x: 92, y: 72, width: 930, height: 606, text: "" }, { fill: "#f8fafc", stroke: "#94a3b8", borderRadius: 20 }),
    mk("navbar", { name: "Sidebar", x: 124, y: 108, width: 190, height: 536, text: "MaketAR\n\nOverview\nAnalytics\nCustomers\nReports\nSettings" }, { fill: "#111827", stroke: "#111827", textColor: "#ffffff", borderRadius: 18, fontSize: 13, textAlign: "left" }),
    mk("text", { name: "Dashboard title", x: 350, y: 112, width: 310, height: 38, text: "Revenue overview" }, { fill: "transparent", stroke: "transparent", fontSize: 26, fontWeight: 900, textAlign: "left" }),
    mk("input", { name: "Search", x: 748, y: 112, width: 220, height: 40, text: "Search reports" }, { fill: "#ffffff", stroke: "#cbd5e1", borderRadius: 12, fontSize: 12, textAlign: "left" }),
    mk("card", { name: "Metric Revenue", x: 350, y: 184, width: 178, height: 112, text: "Revenue\n$84.2k\n+12.8%" }, { fill: "#ffffff", stroke: "#cbd5e1", borderRadius: 16, textAlign: "left" }),
    mk("card", { name: "Metric Customers", x: 552, y: 184, width: 178, height: 112, text: "Customers\n18,204\n+6.1%" }, { fill: "#ffffff", stroke: "#cbd5e1", borderRadius: 16, textAlign: "left" }),
    mk("card", { name: "Metric Conversion", x: 754, y: 184, width: 178, height: 112, text: "Conversion\n9.4%\n-1.2%" }, { fill: "#ffffff", stroke: "#cbd5e1", borderRadius: 16, textAlign: "left" }),
    mk("card", { name: "Chart panel", x: 350, y: 328, width: 380, height: 220, text: "Revenue trend\n\n▁▃▄▆▇▅▇▆" }, { fill: "#ffffff", stroke: "#cbd5e1", borderRadius: 18, fontSize: 20 }),
    mk("table", { name: "Activity table", x: 754, y: 328, width: 214, height: 220, text: "Top channels\n\nOrganic     42%\nReferral    28%\nPaid        19%\nDirect      11%" }, { fill: "#ffffff", stroke: "#cbd5e1", borderRadius: 18, fontSize: 13, textAlign: "left" }),
    mk("card", { name: "Footer insight", x: 350, y: 580, width: 618, height: 54, text: "Insight: Paid acquisition is down, but organic traffic is compounding week over week." }, { fill: "#ecfeff", stroke: "#67e8f9", textColor: "#155e75", borderRadius: 16, fontSize: 13 }),
  ];
};

const isTemplateType = (kind: DiagramMode | "mixed" | TemplateType): kind is TemplateType =>
  ["dashboard", "landing", "mobile", "form", "architecture"].includes(kind);

export const useEditorStore = create<EditorState>((set, get) => {
  const commit = withHistory(set);

  return {
    mode: "wireframe",
    selectedId: "shape-card",
    selectedIds: ["shape-card"],
    zoom: 1,
    pan: { x: 0, y: 0 },
    gridSize: 24,
    showGrid: true,
    snapToGrid: true,
    pages: [initialPage],
    currentPageId: initialPage.id,
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
              const bounds = getBounds(shapesToAdd);
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
      const currentBounds = getBounds(movingShapes);
      let dx = nx - shapeToMove.x;
      let dy = ny - shapeToMove.y;
      if (state.snapToGrid) {
        const rawDx = x - shapeToMove.x;
        const rawDy = y - shapeToMove.y;
        const objectSnap = snapToObjects(currentShapes, movingIds, {
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

        const selectedBounds = getBounds(selectedShapes);
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
      const pages =
        state.pages?.length
          ? state.pages.map((page) => ({
              ...page,
              shapes: page.shapes.map(normalizeShape),
            }))
          : [
              {
                ...initialPage,
                shapes: state.shapes?.length ? state.shapes.map(normalizeShape) : initialPage.shapes,
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
