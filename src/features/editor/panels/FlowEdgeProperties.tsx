import type { Edge } from "@xyflow/react";

import { applyFlowEdgeLineStyle, flowEdgeLineStyleOptions, getFlowEdgeLineStyle } from "@/entities/flow/flow-templates";
import type { FlowEdgeLineStyle } from "@/entities/flow/flow.types";
import { PropertySection } from "@/shared/ui/property-controls";

export function FlowEdgeProperties({
  selectedEdge,
  onUpdateEdge,
  onDeleteEdge,
}: {
  selectedEdge: Edge;
  onUpdateEdge: (id: string, patch: Partial<Edge>) => void;
  onDeleteEdge: (id: string) => void;
}) {
  return (
    <PropertySection title="Conexion">
      <label className="property-label">
        Etiqueta
        <input
          className="property-input"
          value={String(selectedEdge.label ?? "")}
          onChange={(event) => onUpdateEdge(selectedEdge.id, { label: event.target.value })}
        />
      </label>
      <label className="property-label">
        Tipo de linea
        <select
          className="property-input"
          value={getFlowEdgeLineStyle(selectedEdge)}
          onChange={(event) => {
            const lineStyle = event.target.value as FlowEdgeLineStyle;
            onUpdateEdge(selectedEdge.id, applyFlowEdgeLineStyle(selectedEdge, lineStyle));
          }}
        >
          {flowEdgeLineStyleOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
      <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
        {selectedEdge.source} → {selectedEdge.target}
      </div>
      <button className="secondary-button w-full text-red-600" onClick={() => onDeleteEdge(selectedEdge.id)}>
        Eliminar flecha
      </button>
    </PropertySection>
  );
}
