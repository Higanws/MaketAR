import type { Edge } from "@xyflow/react";
import { PanelRight } from "lucide-react";

import {
  applyFlowEdgeLineStyle,
  flowEdgeLineStyleOptions,
  flowNodeDefaults,
  getFlowEdgeLineStyle,
} from "@/entities/flow/flow-templates";
import type { FlowEdgeLineStyle, FlowNodeType } from "@/entities/flow/flow.types";
import { FlowTextAlignmentControls } from "@/features/editor/panels/FlowTextAlignmentControls";
import { ColorInput, NumberInput, PropertySection } from "@/shared/ui/property-controls";

export function DiagramPropertiesPanel({
  selectedNode,
  selectedEdge,
  onUpdateNode,
  onUpdateEdge,
  onDeleteEdge,
}: {
  selectedNode: FlowNodeType | null;
  selectedEdge: Edge | null;
  onUpdateNode: (id: string, patch: Partial<FlowNodeType>) => void;
  onUpdateEdge: (id: string, patch: Partial<Edge>) => void;
  onDeleteEdge: (id: string) => void;
}) {
  return (
    <aside className="w-[336px] shrink-0 overflow-auto border-l border-slate-200 bg-white">
      <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4">
        <div className="flex items-center gap-2">
          <PanelRight size={16} />
          <h2 className="text-sm font-semibold">Propiedades</h2>
        </div>
        {selectedNode ? <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-500">nodo</span> : null}
        {selectedEdge ? <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-500">flecha</span> : null}
      </div>

      <div className="space-y-5 p-4">
        {!selectedNode && !selectedEdge ? (
          <div className="text-sm text-slate-500">
            Selecciona un nodo o una flecha del flujo.
          </div>
        ) : null}

        {selectedNode ? (
          <>
            <PropertySection title="Nodo">
              <label className="property-label">
                Texto
                <textarea
                  className="property-input min-h-20 resize-none"
                  value={selectedNode.data.label}
                  onChange={(event) =>
                    onUpdateNode(selectedNode.id, {
                      data: { ...selectedNode.data, label: event.target.value },
                    })
                  }
                />
              </label>
            </PropertySection>
            <PropertySection title="Posicion y tamano">
              <div className="grid grid-cols-2 gap-2">
                <NumberInput
                  label="X"
                  value={selectedNode.position.x}
                  onChange={(x) => onUpdateNode(selectedNode.id, { position: { ...selectedNode.position, x } })}
                />
                <NumberInput
                  label="Y"
                  value={selectedNode.position.y}
                  onChange={(y) => onUpdateNode(selectedNode.id, { position: { ...selectedNode.position, y } })}
                />
                <NumberInput
                  label="W"
                  value={Number(selectedNode.width ?? selectedNode.style?.width ?? flowNodeDefaults[selectedNode.data.variant].width)}
                  onChange={(width) => onUpdateNode(selectedNode.id, { style: { ...selectedNode.style, width } })}
                />
                <NumberInput
                  label="H"
                  value={Number(selectedNode.height ?? selectedNode.style?.height ?? flowNodeDefaults[selectedNode.data.variant].height)}
                  onChange={(height) => onUpdateNode(selectedNode.id, { style: { ...selectedNode.style, height } })}
                />
              </div>
            </PropertySection>
            {selectedNode.data.variant === "text" ? (
              <PropertySection title="Texto">
                <FlowTextAlignmentControls
                  textAlign={selectedNode.data.textAlign ?? "left"}
                  textVerticalAlign={selectedNode.data.textVerticalAlign ?? "middle"}
                  onTextAlignChange={(textAlign) =>
                    onUpdateNode(selectedNode.id, {
                      data: { ...selectedNode.data, textAlign },
                    })
                  }
                  onTextVerticalAlignChange={(textVerticalAlign) =>
                    onUpdateNode(selectedNode.id, {
                      data: { ...selectedNode.data, textVerticalAlign },
                    })
                  }
                />
              </PropertySection>
            ) : null}
            <PropertySection title="Color">
              <ColorInput
                label="Relleno"
                value={selectedNode.data.fill ?? flowNodeDefaults[selectedNode.data.variant].fill}
                onChange={(fill) => onUpdateNode(selectedNode.id, { data: { ...selectedNode.data, fill } })}
              />
              <ColorInput
                label="Borde"
                value={selectedNode.data.stroke ?? flowNodeDefaults[selectedNode.data.variant].stroke}
                onChange={(stroke) => onUpdateNode(selectedNode.id, { data: { ...selectedNode.data, stroke } })}
              />
              <ColorInput
                label="Texto"
                value={selectedNode.data.textColor ?? flowNodeDefaults[selectedNode.data.variant].textColor}
                onChange={(textColor) => onUpdateNode(selectedNode.id, { data: { ...selectedNode.data, textColor } })}
              />
            </PropertySection>
          </>
        ) : null}

        {selectedEdge ? (
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
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
              {selectedEdge.source} → {selectedEdge.target}
            </div>
            <button
              className="secondary-button w-full text-red-600"
              onClick={() => onDeleteEdge(selectedEdge.id)}
            >
              Eliminar flecha
            </button>
          </PropertySection>
        ) : null}
      </div>
    </aside>
  );
}
