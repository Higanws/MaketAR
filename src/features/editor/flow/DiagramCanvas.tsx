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
  useReactFlow,
} from "@xyflow/react";
import { type DragEvent, useCallback, useMemo, useState } from "react";

import type { FlowNodeType, FlowNodeVariant } from "@/entities/flow/flow.types";
import { FlowDiagramSync } from "@/features/editor/flow/FlowDiagramSync";
import { flowNodeTypes } from "@/features/editor/flow/node-types";
import {
  LIBRARY_DRAG_MIME,
  handleLibraryDragOver,
  parseLibraryDragPayload,
} from "@/features/editor/library/drag-drop";
import { cn } from "@/lib/utils";

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
