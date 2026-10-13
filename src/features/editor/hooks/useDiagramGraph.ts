"use client";

import { useEdgesState, useNodesState, type Edge } from "@xyflow/react";
import { useCallback, useMemo, useState } from "react";

import { flowNodeDefaults, normalizeFlowEdges } from "@/entities/flow/flow-templates";
import type { FlowNodeType, FlowNodeVariant } from "@/entities/flow/flow.types";
import {
  createFlowIconNode,
  createFlowImageNode,
  createFlowNode,
  getImageNodeSize,
} from "@/features/editor/flow/create-flow-node";
import { diagramNodeTools } from "@/features/editor/library/library-constants";
import type { EditorDocument } from "@/types/project";

const sameStringList = (left: string[], right: string[]) =>
  left.length === right.length && left.every((item, index) => item === right[index]);

export function getInitialDiagramState(document: EditorDocument | null) {
  if (!document) return { nodes: [] as FlowNodeType[], edges: [] as Edge[], ready: false };

  const nodes = Array.isArray(document.diagramNodes) ? document.diagramNodes as FlowNodeType[] : [];
  const edges = Array.isArray(document.diagramEdges)
    ? normalizeFlowEdges(document.diagramEdges as Edge[], nodes, { repairHandles: true })
    : [];

  return { nodes, edges, ready: true };
}

export function useDiagramGraph(initialDocument: EditorDocument | null) {
  const initialDiagramState = getInitialDiagramState(initialDocument);
  const [diagramReady, setDiagramReady] = useState(initialDiagramState.ready);
  const [diagramFlowReady, setDiagramFlowReady] = useState(false);
  const [diagramNodes, setDiagramNodes, onDiagramNodesChange] = useNodesState<FlowNodeType>(initialDiagramState.nodes);
  const [diagramEdges, setDiagramEdges, onDiagramEdgesChange] = useEdgesState(initialDiagramState.edges);
  const [selectedDiagramNodeId, setSelectedDiagramNodeId] = useState<string | null>(null);
  const [selectedDiagramEdgeId, setSelectedDiagramEdgeId] = useState<string | null>(null);
  const [selectedDiagramNodeIds, setSelectedDiagramNodeIds] = useState<string[]>([]);
  const [selectedDiagramEdgeIds, setSelectedDiagramEdgeIds] = useState<string[]>([]);

  const updateDiagramNodeLabel = useCallback((id: string, label: string) => {
    setDiagramNodes((nodes) => nodes.map((node) => node.id === id ? { ...node, data: { ...node.data, label } } : node));
  }, [setDiagramNodes]);

  const addDiagramNode = useCallback((variant: FlowNodeVariant, label?: string, center?: { x: number; y: number }) => {
    const nodeCount = diagramNodes.length + 1;
    const defaultLabel = label ?? diagramNodeTools.find((tool) => tool.variant === variant)?.label ?? "Nodo";
    const node = createFlowNode(variant, nodeCount, defaultLabel, center);
    setDiagramNodes((nodes) =>
      variant === "group"
        ? [node, ...nodes.map((item) => ({ ...item, selected: false }))]
        : [...nodes, node],
    );
  }, [diagramNodes.length, setDiagramNodes]);

  const addDiagramIcon = useCallback((iconName: string, iconSet: string, svgSrc?: string, displayLabel?: string, center?: { x: number; y: number }) => {
    const node = createFlowIconNode(iconName, iconSet, diagramNodes.length + 1, svgSrc, displayLabel, center);
    setDiagramNodes((nodes) => [...nodes, node]);
  }, [diagramNodes.length, setDiagramNodes]);

  const addDiagramImage = useCallback((imageSrc: string, name = "Imagen") => {
    const nodeCount = diagramNodes.length + 1;
    const defaults = flowNodeDefaults.image;
    void getImageNodeSize(imageSrc, { width: defaults.width, height: defaults.height }).then((size) => {
      setDiagramNodes((nodes) => [...nodes, createFlowImageNode(imageSrc, size, nodeCount, name)]);
    });
  }, [diagramNodes.length, setDiagramNodes]);

  const updateDiagramNode = useCallback((id: string, patch: Partial<FlowNodeType>) => {
    setDiagramNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, ...patch, data: { ...node.data, ...patch.data }, position: patch.position ?? node.position }
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
    setDiagramEdges((edges) => edges.filter((edge) => !edgeIds.has(edge.id) && !nodeIds.has(edge.source) && !nodeIds.has(edge.target)));
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

  const handleDiagramSelectionChange = useCallback((nodeIds: string[], edgeIds: string[]) => {
    if (sameStringList(nodeIds, selectedDiagramNodeIds) && sameStringList(edgeIds, selectedDiagramEdgeIds)) return;
    setSelectedDiagramNodeIds(nodeIds);
    setSelectedDiagramEdgeIds(edgeIds);
    setSelectedDiagramNodeId(nodeIds[0] ?? null);
    setSelectedDiagramEdgeId(edgeIds[0] ?? null);
  }, [selectedDiagramEdgeIds, selectedDiagramNodeIds]);

  return {
    diagramReady,
    setDiagramReady,
    diagramFlowReady,
    setDiagramFlowReady,
    diagramNodes,
    setDiagramNodes,
    diagramEdges,
    setDiagramEdges,
    onDiagramNodesChange,
    onDiagramEdgesChange,
    selectedDiagramNodeId,
    selectedDiagramEdgeId,
    selectedDiagramNodeIds,
    selectedDiagramEdgeIds,
    setSelectedDiagramNodeId,
    setSelectedDiagramEdgeId,
    setSelectedDiagramNodeIds,
    setSelectedDiagramEdgeIds,
    addDiagramNode,
    addDiagramIcon,
    addDiagramImage,
    updateDiagramNode,
    updateDiagramEdge,
    deleteDiagramSelection,
    deleteDiagramNode,
    deleteDiagramEdge,
    diagramNodesWithHandlers,
    handleDiagramSelectionChange,
  };
}
