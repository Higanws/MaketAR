import { useCallback, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import type { FlowNodeType } from "@/entities/flow/flow.types";

type DiagramSelectionSetters = {
  setSelectedDiagramNodeId: Dispatch<SetStateAction<string | null>>;
  setSelectedDiagramEdgeId: Dispatch<SetStateAction<string | null>>;
  setSelectedDiagramNodeIds: Dispatch<SetStateAction<string[]>>;
  setSelectedDiagramEdgeIds: Dispatch<SetStateAction<string[]>>;
};

export function useDiagramClipboard({
  diagramNodes,
  selectedDiagramNodeIds,
  setDiagramNodes,
  selectionSetters,
}: {
  diagramNodes: FlowNodeType[];
  selectedDiagramNodeIds: string[];
  setDiagramNodes: Dispatch<SetStateAction<FlowNodeType[]>>;
  selectionSetters: DiagramSelectionSetters;
}) {
  const [diagramClipboard, setDiagramClipboard] = useState<FlowNodeType[]>([]);
  const {
    setSelectedDiagramNodeId,
    setSelectedDiagramEdgeId,
    setSelectedDiagramNodeIds,
    setSelectedDiagramEdgeIds,
  } = selectionSetters;

  const selectPastedNodes = useCallback((nodes: FlowNodeType[]) => {
    setDiagramNodes((nodes) => [
      ...nodes.map((node) => ({ ...node, selected: false })),
      ...nodes,
    ]);
    setSelectedDiagramNodeIds(nodes.map((node) => node.id));
    setSelectedDiagramNodeId(nodes[0]?.id ?? null);
    setSelectedDiagramEdgeIds([]);
    setSelectedDiagramEdgeId(null);
  }, [setDiagramNodes, setSelectedDiagramEdgeId, setSelectedDiagramEdgeIds, setSelectedDiagramNodeId, setSelectedDiagramNodeIds]);

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
    selectPastedNodes(pasted);
  }, [diagramClipboard, selectPastedNodes]);

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
    selectPastedNodes(duplicated);
  }, [diagramNodes, selectedDiagramNodeIds, selectPastedNodes]);

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
    selectPastedNodes([duplicated]);
  }, [diagramNodes, selectPastedNodes]);

  return {
    copyDiagramSelection,
    pasteDiagramClipboard,
    duplicateDiagramSelection,
    duplicateDiagramNode,
  };
}
