import { type Edge, MarkerType } from "@xyflow/react";

import type { FlowEdgeLineStyle, FlowEdgeType, FlowNodeType, FlowNodeVariant, FlowTemplateType } from "@/entities/flow/flow.types";
import type { Project } from "@/entities/project/project.types";
import type { DiagramMode, WirePage } from "@/entities/wireframe/wireframe.types";

export const defaultFlowSourceHandle = "right-source";
export const defaultFlowTargetHandle = "left-target";
type FlowHandleSide = "top" | "right" | "bottom" | "left";

export const flowEdgeLineStyleOptions: Array<{ label: string; value: FlowEdgeLineStyle }> = [
  { label: "Solida", value: "solid" },
  { label: "Rayas", value: "dashed" },
  { label: "Punteada", value: "dotted" },
];

const flowEdgeDashByStyle: Record<FlowEdgeLineStyle, string | undefined> = {
  solid: undefined,
  dashed: "9 7",
  dotted: "2 7",
};

export const initialFlowNodes: FlowNodeType[] = [
  { id: "start", type: "maketarFlow", position: { x: 80, y: 140 }, data: { label: "Inicio", variant: "start" } },
  { id: "process", type: "maketarFlow", position: { x: 330, y: 130 }, data: { label: "Escribir paso", variant: "process" } },
  { id: "decision", type: "maketarFlow", position: { x: 610, y: 120 }, data: { label: "Decision", variant: "decision" } },
  { id: "end", type: "maketarFlow", position: { x: 900, y: 140 }, data: { label: "Fin", variant: "start" } },
];

export const initialFlowEdges: FlowEdgeType[] = [
  {
    id: "start-process",
    source: "start",
    target: "process",
    sourceHandle: defaultFlowSourceHandle,
    targetHandle: defaultFlowTargetHandle,
    type: "smoothstep",
    label: "siguiente",
    markerEnd: { type: MarkerType.ArrowClosed },
    data: { lineStyle: "solid" },
  },
  {
    id: "process-decision",
    source: "process",
    target: "decision",
    sourceHandle: defaultFlowSourceHandle,
    targetHandle: defaultFlowTargetHandle,
    type: "smoothstep",
    label: "validar",
    markerEnd: { type: MarkerType.ArrowClosed },
    data: { lineStyle: "solid" },
  },
  {
    id: "decision-end",
    source: "decision",
    target: "end",
    sourceHandle: defaultFlowSourceHandle,
    targetHandle: defaultFlowTargetHandle,
    type: "smoothstep",
    label: "si",
    markerEnd: { type: MarkerType.ArrowClosed },
    data: { lineStyle: "solid" },
  },
];

const flowNode = (
  id: string,
  label: string,
  variant: FlowNodeVariant,
  x: number,
  y: number,
): FlowNodeType => ({
  id,
  type: "maketarFlow",
  position: { x, y },
  style: {
    width: flowNodeDefaults[variant].width,
    height: flowNodeDefaults[variant].height,
  },
  data: {
    label,
    variant,
    fill: flowNodeDefaults[variant].fill,
    stroke: flowNodeDefaults[variant].stroke,
    textColor: flowNodeDefaults[variant].textColor,
  },
});

const flowGroup = (
  id: string,
  label: string,
  x: number,
  y: number,
  width: number,
  height: number,
): FlowNodeType => ({
  id,
  type: "maketarFlow",
  position: { x, y },
  zIndex: -1,
  style: { width, height },
  data: {
    label,
    variant: "group",
    fill: flowNodeDefaults.group.fill,
    stroke: flowNodeDefaults.group.stroke,
    textColor: flowNodeDefaults.group.textColor,
  },
});

export const flowNodeDefaults: Record<FlowNodeVariant, { width: number; height: number; fill: string; stroke: string; textColor: string }> = {
  start: { width: 176, height: 80, fill: "#ecfdf5", stroke: "#10b981", textColor: "#0f172a" },
  process: { width: 176, height: 80, fill: "#ffffff", stroke: "#94a3b8", textColor: "#0f172a" },
  decision: { width: 150, height: 150, fill: "#ffffff", stroke: "#94a3b8", textColor: "#0f172a" },
  data: { width: 176, height: 80, fill: "#f0f9ff", stroke: "#38bdf8", textColor: "#0f172a" },
  document: { width: 176, height: 80, fill: "#fffbeb", stroke: "#f59e0b", textColor: "#0f172a" },
  image: { width: 176, height: 112, fill: "#ffffff", stroke: "#94a3b8", textColor: "#334155" },
  text: { width: 176, height: 80, fill: "transparent", stroke: "transparent", textColor: "#0f172a" },
  icon: { width: 96, height: 88, fill: "transparent", stroke: "transparent", textColor: "#334155" },
  group: { width: 288, height: 176, fill: "#dbeafe", stroke: "#60a5fa", textColor: "#2563eb" },
};

const sourceHandle = (side: FlowHandleSide) => `${side}-source`;
const targetHandle = (side: FlowHandleSide) => `${side}-target`;

const flowEdge = (
  id: string,
  source: string,
  target: string,
  label = "",
  handles: { source?: FlowHandleSide; target?: FlowHandleSide } = {},
): FlowEdgeType =>
  applyFlowEdgeLineStyle({
    id,
    source,
    target,
    sourceHandle: sourceHandle(handles.source ?? "right"),
    targetHandle: targetHandle(handles.target ?? "left"),
    type: "smoothstep",
    label,
    markerEnd: { type: MarkerType.ArrowClosed },
    data: { lineStyle: "solid" },
  });

export function getFlowEdgeLineStyle(edge: Edge): FlowEdgeLineStyle {
  const lineStyle = (edge as FlowEdgeType).data?.lineStyle;
  return lineStyle === "dashed" || lineStyle === "dotted" ? lineStyle : "solid";
}

export function applyFlowEdgeLineStyle<T extends Edge>(edge: T, lineStyle: FlowEdgeLineStyle = getFlowEdgeLineStyle(edge)) {
  const nextStyle = { ...edge.style };
  const strokeDasharray = flowEdgeDashByStyle[lineStyle];

  if (strokeDasharray) {
    nextStyle.strokeDasharray = strokeDasharray;
    nextStyle.strokeLinecap = "round";
  } else {
    delete nextStyle.strokeDasharray;
    delete nextStyle.strokeLinecap;
  }

  return {
    ...edge,
    data: { ...(edge as FlowEdgeType).data, lineStyle },
    style: nextStyle,
  } as T & FlowEdgeType;
}

type NormalizeFlowEdgesOptions = {
  repairHandles?: boolean;
};

export function normalizeFlowEdges(edges: Edge[], nodes: FlowNodeType[] = [], options: NormalizeFlowEdgesOptions = {}) {
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  const usedAnchors = new Set<string>();
  return edges.map((edge) =>
    applyFlowEdgeLineStyle(normalizeFlowEdge(edge, nodesById, usedAnchors, options)),
  );
}

function normalizeFlowEdge(
  edge: Edge,
  nodesById: Map<string, FlowNodeType>,
  usedAnchors: Set<string>,
  options: NormalizeFlowEdgesOptions,
) {
  return {
    ...edge,
    sourceHandle: normalizeHandle(edge.sourceHandle, "source", edge, nodesById, usedAnchors, options),
    targetHandle: normalizeHandle(edge.targetHandle, "target", edge, nodesById, usedAnchors, options),
    type: "smoothstep",
    reconnectable: true,
    interactionWidth: edge.interactionWidth ?? 32,
    markerEnd: edge.markerEnd ?? { type: MarkerType.ArrowClosed },
  };
}

function normalizeHandle(
  currentHandle: string | null | undefined,
  type: "source" | "target",
  edge: Edge,
  nodesById: Map<string, FlowNodeType>,
  usedAnchors: Set<string>,
  options: NormalizeFlowEdgesOptions,
) {
  const sourceNode = nodesById.get(edge.source);
  const targetNode = nodesById.get(edge.target);
  if (!sourceNode || !targetNode) {
    return currentHandle ?? (type === "source" ? defaultFlowSourceHandle : defaultFlowTargetHandle);
  }

  const node = type === "source" ? sourceNode : targetNode;
  if (currentHandle && !options.repairHandles) {
    usedAnchors.add(anchorKey(node.id, handleSideFromId(currentHandle) ?? "right"));
    return currentHandle;
  }

  const inferredSide = type === "source"
    ? chooseHandleSide(sourceNode, targetNode)
    : chooseHandleSide(targetNode, sourceNode);
  const side = chooseFreeHandleSide(node.id, inferredSide, usedAnchors);
  const inferredHandle = type === "source" ? sourceHandle(side) : targetHandle(side);

  return inferredHandle;
}

function handleSideFromId(handleId: string): FlowHandleSide | null {
  if (handleId.startsWith("top-")) return "top";
  if (handleId.startsWith("right-")) return "right";
  if (handleId.startsWith("bottom-")) return "bottom";
  if (handleId.startsWith("left-")) return "left";
  return null;
}

function chooseFreeHandleSide(nodeId: string, preferredSide: FlowHandleSide, usedAnchors: Set<string>) {
  const options = preferredSides(preferredSide);
  const freeSide = options.find((side) => !usedAnchors.has(anchorKey(nodeId, side))) ?? preferredSide;
  usedAnchors.add(anchorKey(nodeId, freeSide));
  return freeSide;
}

function anchorKey(nodeId: string, side: FlowHandleSide) {
  return `${nodeId}:${side}`;
}

function preferredSides(side: FlowHandleSide): FlowHandleSide[] {
  if (side === "right") return ["right", "top", "bottom", "left"];
  if (side === "left") return ["left", "top", "bottom", "right"];
  if (side === "top") return ["top", "left", "right", "bottom"];
  return ["bottom", "left", "right", "top"];
}

function chooseHandleSide(fromNode: FlowNodeType, toNode: FlowNodeType): FlowHandleSide {
  const fromCenter = getNodeCenter(fromNode);
  const toCenter = getNodeCenter(toNode);
  const dx = toCenter.x - fromCenter.x;
  const dy = toCenter.y - fromCenter.y;

  if (fromNode.data.variant === "decision" && Math.abs(dy) > 35) {
    return dy >= 0 ? "bottom" : "top";
  }

  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? "right" : "left";
  }

  return dy >= 0 ? "bottom" : "top";
}

function getNodeCenter(node: FlowNodeType) {
  const variant = node.data.variant;
  const defaults = flowNodeDefaults[variant];
  const width = Number(node.style?.width ?? node.width ?? defaults.width);
  const height = Number(node.style?.height ?? node.height ?? defaults.height);
  return {
    x: node.position.x + width / 2,
    y: node.position.y + height / 2,
  };
}

export function makeFlowTemplate(template: FlowTemplateType) {
  if (template === "approval-flow") {
    return {
      nodes: [
        flowGroup("approval-group-review", "Revision", 54, 62, 720, 338),
        flowGroup("approval-group-result", "Resultado", 802, 62, 494, 338),
        flowNode("approval-start", "Solicitud recibida", "start", 80, 170),
        flowNode("approval-review", "Revisar datos", "process", 310, 160),
        flowNode("approval-decision", "Cumple criterios?", "decision", 560, 145),
        flowNode("approval-approved", "Aprobar solicitud", "process", 830, 90),
        flowNode("approval-rejected", "Solicitar ajustes", "process", 830, 250),
        flowNode("approval-notify", "Notificar resultado", "process", 1080, 160),
      ],
      edges: [
        flowEdge("approval-e1", "approval-start", "approval-review", "entrada"),
        flowEdge("approval-e2", "approval-review", "approval-decision", "validar"),
        flowEdge("approval-e3", "approval-decision", "approval-approved", "si", { source: "top", target: "left" }),
        flowEdge("approval-e4", "approval-decision", "approval-rejected", "no", { source: "bottom", target: "left" }),
        flowEdge("approval-e5", "approval-approved", "approval-notify", "", { source: "right", target: "left" }),
        flowEdge("approval-e6", "approval-rejected", "approval-notify", "", { source: "right", target: "left" }),
      ],
    };
  }

  if (template === "support-flow") {
    return {
      nodes: [
        flowGroup("support-group-intake", "Entrada y clasificacion", 54, 62, 720, 338),
        flowGroup("support-group-resolution", "Resolucion", 802, 62, 494, 338),
        flowNode("support-start", "Ticket creado", "start", 80, 170),
        flowNode("support-triage", "Clasificar prioridad", "process", 310, 160),
        flowNode("support-decision", "Requiere escalamiento?", "decision", 560, 145),
        flowNode("support-resolve", "Resolver en soporte", "process", 830, 90),
        flowNode("support-escalate", "Escalar a equipo tecnico", "process", 830, 250),
        flowNode("support-close", "Confirmar y cerrar", "process", 1080, 160),
      ],
      edges: [
        flowEdge("support-e1", "support-start", "support-triage"),
        flowEdge("support-e2", "support-triage", "support-decision"),
        flowEdge("support-e3", "support-decision", "support-resolve", "no", { source: "top", target: "left" }),
        flowEdge("support-e4", "support-decision", "support-escalate", "si", { source: "bottom", target: "left" }),
        flowEdge("support-e5", "support-resolve", "support-close", "", { source: "right", target: "left" }),
        flowEdge("support-e6", "support-escalate", "support-close", "", { source: "right", target: "left" }),
      ],
    };
  }

  return {
    nodes: [
      flowGroup("purchase-group-checkout", "Checkout", 54, 62, 998, 338),
      flowGroup("purchase-group-result", "Confirmacion", 1064, 62, 484, 338),
      flowNode("purchase-start", "Usuario inicia checkout", "start", 80, 170),
      flowNode("purchase-cart", "Validar carrito", "process", 320, 160),
      flowNode("purchase-data", "Capturar datos de envio", "data", 570, 160),
      flowNode("purchase-payment", "Pago aprobado?", "decision", 830, 145),
      flowNode("purchase-confirm", "Confirmar orden", "process", 1090, 90),
      flowNode("purchase-retry", "Mostrar reintento de pago", "process", 1090, 250),
      flowNode("purchase-end", "Compra finalizada", "start", 1330, 90),
    ],
    edges: [
      flowEdge("purchase-e1", "purchase-start", "purchase-cart"),
      flowEdge("purchase-e2", "purchase-cart", "purchase-data"),
      flowEdge("purchase-e3", "purchase-data", "purchase-payment"),
      flowEdge("purchase-e4", "purchase-payment", "purchase-confirm", "si", { source: "top", target: "left" }),
      flowEdge("purchase-e5", "purchase-payment", "purchase-retry", "no", { source: "bottom", target: "left" }),
      flowEdge("purchase-e6", "purchase-confirm", "purchase-end", "", { source: "right", target: "left" }),
      flowEdge("purchase-e7", "purchase-retry", "purchase-payment", "reintentar", { source: "top", target: "bottom" }),
    ],
  };
}

function makeBlankWireframePage(projectName: string): WirePage {
  return {
    id: `page-${Date.now()}`,
    name: `${projectName} - Wireframe en blanco`,
    shapes: [],
  };
}

export function makeFlowTemplateState(project: Project, version: number) {
  const flow = makeFlowTemplate(project.flowTemplate ?? "purchase-flow");
  const page = makeBlankWireframePage(project.name);

  return {
    version,
    pages: [page],
    currentPageId: page.id,
    mode: "diagram" as DiagramMode,
    zoom: 1,
    showGrid: true,
    snapToGrid: true,
    gridSize: 24,
    diagramNodes: flow.nodes,
    diagramEdges: normalizeFlowEdges(flow.edges, flow.nodes, { repairHandles: true }),
  };
}
