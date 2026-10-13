import type { Edge } from "@xyflow/react";

import type { FlowNodeType } from "@/entities/flow/flow.types";
import { FlowEdgeProperties } from "@/features/editor/panels/FlowEdgeProperties";
import { FlowNodeProperties } from "@/features/editor/panels/FlowNodeProperties";
import { PropertiesPanelHeader } from "@/features/editor/panels/PropertiesPanelHeader";

export function DiagramPropertiesPanel({
  selectedNode,
  selectedEdge,
  onUpdateNode,
  onUpdateEdge,
  onDeleteEdge,
  onHide,
}: {
  selectedNode: FlowNodeType | null;
  selectedEdge: Edge | null;
  onUpdateNode: (id: string, patch: Partial<FlowNodeType>) => void;
  onUpdateEdge: (id: string, patch: Partial<Edge>) => void;
  onDeleteEdge: (id: string) => void;
  onHide?: () => void;
}) {
  const badges = [selectedNode ? "nodo" : null, selectedEdge ? "flecha" : null].filter((badge): badge is string => Boolean(badge));

  return (
    <aside className="w-[336px] shrink-0 overflow-auto border-l border-slate-200 bg-white">
      <PropertiesPanelHeader badges={badges} onHide={onHide} />
      <div className="space-y-5 p-4">
        {!selectedNode && !selectedEdge ? (
          <div className="text-sm text-slate-500">Selecciona un nodo o una flecha del flujo.</div>
        ) : null}
        {selectedNode ? <FlowNodeProperties selectedNode={selectedNode} onUpdateNode={onUpdateNode} /> : null}
        {selectedEdge ? (
          <FlowEdgeProperties selectedEdge={selectedEdge} onUpdateEdge={onUpdateEdge} onDeleteEdge={onDeleteEdge} />
        ) : null}
      </div>
    </aside>
  );
}
