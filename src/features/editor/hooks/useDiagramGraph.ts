"use client";

import { applyEdgeChanges, applyNodeChanges, type Edge, type OnEdgesChange, type OnNodesChange } from "@xyflow/react";
import { useCallback, useMemo } from "react";

import { flowNodeDefaults } from "@/entities/flow/flow-templates";
import type { FlowNodeType } from "@/entities/flow/flow.types";
import { useEditorStore } from "@/stores/editor";

export function useDiagramGraph() {
  const diagramNodes = useEditorStore((state) => state.diagramNodes);
  const diagramEdges = useEditorStore((state) => state.diagramEdges);
  const diagramFlowReady = useEditorStore((state) => state.diagramFlowReady);
  const selectedDiagramNodeId = useEditorStore((state) => state.selectedDiagramNodeId);
  const selectedDiagramEdgeId = useEditorStore((state) => state.selectedDiagramEdgeId);
  const selectedDiagramNodeIds = useEditorStore((state) => state.selectedDiagramNodeIds);
  const selectedDiagramEdgeIds = useEditorStore((state) => state.selectedDiagramEdgeIds);
  const setDiagramNodes = useEditorStore((state) => state.setDiagramNodes);
  const setDiagramEdges = useEditorStore((state) => state.setDiagramEdges);
  const setDiagramFlowReady = useEditorStore((state) => state.setDiagramFlowReady);
  const setSelectedDiagramNodeId = useEditorStore((state) => state.setSelectedDiagramNodeId);
  const setSelectedDiagramEdgeId = useEditorStore((state) => state.setSelectedDiagramEdgeId);
  const setSelectedDiagramNodeIds = useEditorStore((state) => state.setSelectedDiagramNodeIds);
  const setSelectedDiagramEdgeIds = useEditorStore((state) => state.setSelectedDiagramEdgeIds);
  const setDiagramSelection = useEditorStore((state) => state.setDiagramSelection);
  const addDiagramNode = useEditorStore((state) => state.addDiagramNode);
  const addDiagramIcon = useEditorStore((state) => state.addDiagramIcon);
  const addDiagramImage = useEditorStore((state) => state.addDiagramImage);
  const updateDiagramNode = useEditorStore((state) => state.updateDiagramNode);
  const updateDiagramEdge = useEditorStore((state) => state.updateDiagramEdge);
  const deleteDiagramSelection = useEditorStore((state) => state.deleteDiagramSelection);
  const deleteDiagramNode = useEditorStore((state) => state.deleteDiagramNode);
  const deleteDiagramEdge = useEditorStore((state) => state.deleteDiagramEdge);

  const onDiagramNodesChange = useCallback<OnNodesChange<FlowNodeType>>((changes) => {
    setDiagramNodes((nodes) => applyNodeChanges(changes, nodes));
  }, [setDiagramNodes]);

  const onDiagramEdgesChange = useCallback<OnEdgesChange<Edge>>((changes) => {
    setDiagramEdges((edges) => applyEdgeChanges(changes, edges));
  }, [setDiagramEdges]);

  const updateDiagramNodeLabel = useCallback((id: string, label: string) => {
    setDiagramNodes((nodes) => nodes.map((node) => node.id === id ? { ...node, data: { ...node.data, label } } : node));
  }, [setDiagramNodes]);

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

  return {
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
    setDiagramSelection,
    addDiagramNode,
    addDiagramIcon,
    addDiagramImage,
    updateDiagramNode,
    updateDiagramEdge,
    deleteDiagramSelection,
    deleteDiagramNode,
    deleteDiagramEdge,
    diagramNodesWithHandlers,
  };
}
