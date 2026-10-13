"use client";

import {
  Background,
  BackgroundVariant,
  Connection,
  ConnectionMode,
  Controls,
  Edge,
  MarkerType,
  MiniMap,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import { useMemo, useState } from "react";

import type { FlowNodeType, FlowNodeVariant } from "@/entities/flow/flow.types";
import { FlowContextMenu, type FlowContextMenuState } from "@/features/editor/flow/FlowContextMenu";
import { FlowDiagramSync } from "@/features/editor/flow/FlowDiagramSync";
import { promptEdgeLabel } from "@/features/editor/flow/edit-edge-label";
import { flowNodeTypes } from "@/features/editor/flow/node-types";
import { useFlowLibraryDrop } from "@/features/editor/flow/useFlowLibraryDrop";
import { handleLibraryDragOver } from "@/features/editor/library/drag-drop";

export function DiagramCanvas({
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

export function DiagramCanvasInner({
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
  const [contextMenu, setContextMenu] = useState<FlowContextMenuState | null>(null);
  const selectedNodeIds = useMemo(() => nodes.filter((node) => node.selected).map((node) => node.id), [nodes]);
  const selectedEdgeIds = useMemo(() => edges.filter((edge) => edge.selected).map((edge) => edge.id), [edges]);
  const hasSelection = selectedNodeIds.length > 0 || selectedEdgeIds.length > 0;
  const handleLibraryDrop = useFlowLibraryDrop(onDropFlowNode, onDropFlowIcon);

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
          const nextLabel = promptEdgeLabel(String(edge.label ?? ""));
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
        <FlowContextMenu
          menu={contextMenu}
          edges={edges}
          onClose={() => setContextMenu(null)}
          onDuplicateNode={onDuplicateNode}
          onCopySelection={onCopySelection}
          onDeleteNode={onDeleteNode}
          onEdgeLabelChange={onEdgeLabelChange}
          onDeleteEdge={onDeleteEdge}
          onDuplicateSelection={onDuplicateSelection}
          onPaste={onPaste}
          onDeleteSelection={onDeleteSelection}
        />
      ) : null}
    </div>
  );
}
