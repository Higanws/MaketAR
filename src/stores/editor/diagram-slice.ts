import type { Edge } from "@xyflow/react";
import type { SetStateAction } from "react";

import { createFlowNode, getImageNodeSize } from "@/entities/flow/create-flow-node";
import { flowNodeDefaults } from "@/entities/flow/flow-templates";
import type { FlowNodeType, FlowNodeVariant } from "@/entities/flow/flow.types";

export type DiagramSlice = {
  diagramNodes: FlowNodeType[];
  diagramEdges: Edge[];
  diagramFlowReady: boolean;
  selectedDiagramNodeId: string | null;
  selectedDiagramEdgeId: string | null;
  selectedDiagramNodeIds: string[];
  selectedDiagramEdgeIds: string[];
  setDiagramNodes: (update: SetStateAction<FlowNodeType[]>) => void;
  setDiagramEdges: (update: SetStateAction<Edge[]>) => void;
  setDiagramFlowReady: (ready: boolean) => void;
  setSelectedDiagramNodeId: (update: SetStateAction<string | null>) => void;
  setSelectedDiagramEdgeId: (update: SetStateAction<string | null>) => void;
  setSelectedDiagramNodeIds: (update: SetStateAction<string[]>) => void;
  setSelectedDiagramEdgeIds: (update: SetStateAction<string[]>) => void;
  setDiagramSelection: (nodeIds: string[], edgeIds: string[]) => void;
  addDiagramNode: (variant: FlowNodeVariant, label?: string, center?: { x: number; y: number }) => void;
  addDiagramIcon: (iconName: string, iconSet: string, svgSrc?: string, displayLabel?: string, center?: { x: number; y: number }) => void;
  addDiagramImage: (imageSrc: string, name?: string) => void;
  updateDiagramNode: (id: string, patch: Partial<FlowNodeType>) => void;
  updateDiagramEdge: (id: string, patch: Partial<Edge>) => void;
  deleteDiagramSelection: () => void;
  deleteDiagramNode: (id: string) => void;
  deleteDiagramEdge: (id: string) => void;
};

type DiagramSet = (partial: Partial<DiagramSlice> | ((state: DiagramSlice) => Partial<DiagramSlice>)) => void;
type DiagramGet = () => DiagramSlice;

const sameStringList = (left: string[], right: string[]) =>
  left.length === right.length && left.every((item, index) => item === right[index]);

function applyUpdate<T>(current: T, update: SetStateAction<T>) {
  return typeof update === "function" ? (update as (value: T) => T)(current) : update;
}

export const emptyDiagramSlice = {
  diagramNodes: [] as FlowNodeType[],
  diagramEdges: [] as Edge[],
  diagramFlowReady: false,
  selectedDiagramNodeId: null as string | null,
  selectedDiagramEdgeId: null as string | null,
  selectedDiagramNodeIds: [] as string[],
  selectedDiagramEdgeIds: [] as string[],
};

export function createDiagramActions(set: DiagramSet, get: DiagramGet): Pick<
  DiagramSlice,
  | "setDiagramNodes"
  | "setDiagramEdges"
  | "setDiagramFlowReady"
  | "setSelectedDiagramNodeId"
  | "setSelectedDiagramEdgeId"
  | "setSelectedDiagramNodeIds"
  | "setSelectedDiagramEdgeIds"
  | "setDiagramSelection"
  | "addDiagramNode"
  | "addDiagramIcon"
  | "addDiagramImage"
  | "updateDiagramNode"
  | "updateDiagramEdge"
  | "deleteDiagramSelection"
  | "deleteDiagramNode"
  | "deleteDiagramEdge"
> {
  return {
    setDiagramNodes: (update) => set((state) => ({ diagramNodes: applyUpdate(state.diagramNodes, update) })),
    setDiagramEdges: (update) => set((state) => ({ diagramEdges: applyUpdate(state.diagramEdges, update) })),
    setDiagramFlowReady: (ready) => set({ diagramFlowReady: ready }),
    setSelectedDiagramNodeId: (update) => set((state) => ({ selectedDiagramNodeId: applyUpdate(state.selectedDiagramNodeId, update) })),
    setSelectedDiagramEdgeId: (update) => set((state) => ({ selectedDiagramEdgeId: applyUpdate(state.selectedDiagramEdgeId, update) })),
    setSelectedDiagramNodeIds: (update) => set((state) => ({ selectedDiagramNodeIds: applyUpdate(state.selectedDiagramNodeIds, update) })),
    setSelectedDiagramEdgeIds: (update) => set((state) => ({ selectedDiagramEdgeIds: applyUpdate(state.selectedDiagramEdgeIds, update) })),
    setDiagramSelection: (nodeIds, edgeIds) => {
      const state = get();
      if (sameStringList(nodeIds, state.selectedDiagramNodeIds) && sameStringList(edgeIds, state.selectedDiagramEdgeIds)) return;
      set({
        selectedDiagramNodeIds: nodeIds,
        selectedDiagramEdgeIds: edgeIds,
        selectedDiagramNodeId: nodeIds[0] ?? null,
        selectedDiagramEdgeId: edgeIds[0] ?? null,
      });
    },
    addDiagramNode: (variant, label, center) => {
      const nodeCount = get().diagramNodes.length + 1;
      const defaultLabel = label ?? "Nodo";
      const node = createFlowNode(variant, nodeCount, { label: defaultLabel, center });
      set((state) => ({
        diagramNodes: variant === "group"
          ? [node, ...state.diagramNodes.map((item) => ({ ...item, selected: false }))]
          : [...state.diagramNodes, node],
      }));
    },
    addDiagramIcon: (iconName, iconSet, svgSrc, displayLabel, center) => {
      const node = createFlowNode("icon", get().diagramNodes.length + 1, {
        label: displayLabel,
        center,
        iconName,
        iconSet,
        svgSrc,
      });
      set((state) => ({ diagramNodes: [...state.diagramNodes, node] }));
    },
    addDiagramImage: (imageSrc, name = "Imagen") => {
      const nodeCount = get().diagramNodes.length + 1;
      const defaults = flowNodeDefaults.image;
      void getImageNodeSize(imageSrc, { width: defaults.width, height: defaults.height }).then((size) => {
        set((state) => ({
          diagramNodes: [...state.diagramNodes, createFlowNode("image", nodeCount, { label: name, size, imageSrc })],
        }));
      });
    },
    updateDiagramNode: (id, patch) => set((state) => ({
      diagramNodes: state.diagramNodes.map((node) =>
        node.id === id
          ? { ...node, ...patch, data: { ...node.data, ...patch.data }, position: patch.position ?? node.position }
          : node,
      ),
    })),
    updateDiagramEdge: (id, patch) => set((state) => ({
      diagramEdges: state.diagramEdges.map((edge) => edge.id === id ? { ...edge, ...patch } : edge),
    })),
    deleteDiagramSelection: () => {
      const state = get();
      if (!state.selectedDiagramNodeIds.length && !state.selectedDiagramEdgeIds.length) return;
      const nodeIds = new Set(state.selectedDiagramNodeIds);
      const edgeIds = new Set(state.selectedDiagramEdgeIds);
      set({
        diagramNodes: state.diagramNodes.filter((node) => !nodeIds.has(node.id)),
        diagramEdges: state.diagramEdges.filter((edge) => !edgeIds.has(edge.id) && !nodeIds.has(edge.source) && !nodeIds.has(edge.target)),
        selectedDiagramNodeId: null,
        selectedDiagramEdgeId: null,
        selectedDiagramNodeIds: [],
        selectedDiagramEdgeIds: [],
      });
    },
    deleteDiagramNode: (id) => set((state) => ({
      diagramNodes: state.diagramNodes.filter((node) => node.id !== id),
      diagramEdges: state.diagramEdges.filter((edge) => edge.source !== id && edge.target !== id),
      selectedDiagramNodeIds: state.selectedDiagramNodeIds.filter((nodeId) => nodeId !== id),
      selectedDiagramNodeId: state.selectedDiagramNodeId === id ? null : state.selectedDiagramNodeId,
    })),
    deleteDiagramEdge: (id) => set((state) => ({
      diagramEdges: state.diagramEdges.filter((edge) => edge.id !== id),
      selectedDiagramEdgeIds: state.selectedDiagramEdgeIds.filter((edgeId) => edgeId !== id),
      selectedDiagramEdgeId: state.selectedDiagramEdgeId === id ? null : state.selectedDiagramEdgeId,
    })),
  };
}
