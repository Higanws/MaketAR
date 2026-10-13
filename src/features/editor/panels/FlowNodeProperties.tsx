import type { FlowNodeType } from "@/entities/flow/flow.types";
import { flowNodeDefaults } from "@/entities/flow/flow-templates";
import { FlowTextAlignmentControls } from "@/features/editor/panels/FlowTextAlignmentControls";
import { ColorInput, NumberInput, PropertySection } from "@/shared/ui/property-controls";

export function FlowNodeProperties({
  selectedNode,
  onUpdateNode,
}: {
  selectedNode: FlowNodeType;
  onUpdateNode: (id: string, patch: Partial<FlowNodeType>) => void;
}) {
  const defaults = flowNodeDefaults[selectedNode.data.variant];

  return (
    <>
      <PropertySection title="Nodo">
        <label className="property-label">
          Texto
          <textarea
            className="property-input min-h-20 resize-none"
            value={selectedNode.data.label}
            onChange={(event) =>
              onUpdateNode(selectedNode.id, { data: { ...selectedNode.data, label: event.target.value } })
            }
          />
        </label>
      </PropertySection>
      <PropertySection title="Posicion y tamano">
        <div className="grid grid-cols-2 gap-2">
          <NumberInput label="X" value={selectedNode.position.x} onChange={(x) => onUpdateNode(selectedNode.id, { position: { ...selectedNode.position, x } })} />
          <NumberInput label="Y" value={selectedNode.position.y} onChange={(y) => onUpdateNode(selectedNode.id, { position: { ...selectedNode.position, y } })} />
          <NumberInput
            label="W"
            value={Number(selectedNode.width ?? selectedNode.style?.width ?? defaults.width)}
            onChange={(width) => onUpdateNode(selectedNode.id, { style: { ...selectedNode.style, width } })}
          />
          <NumberInput
            label="H"
            value={Number(selectedNode.height ?? selectedNode.style?.height ?? defaults.height)}
            onChange={(height) => onUpdateNode(selectedNode.id, { style: { ...selectedNode.style, height } })}
          />
        </div>
      </PropertySection>
      {selectedNode.data.variant === "text" ? (
        <PropertySection title="Texto">
          <FlowTextAlignmentControls
            textAlign={selectedNode.data.textAlign ?? "left"}
            textVerticalAlign={selectedNode.data.textVerticalAlign ?? "middle"}
            onTextAlignChange={(textAlign) => onUpdateNode(selectedNode.id, { data: { ...selectedNode.data, textAlign } })}
            onTextVerticalAlignChange={(textVerticalAlign) => onUpdateNode(selectedNode.id, { data: { ...selectedNode.data, textVerticalAlign } })}
          />
        </PropertySection>
      ) : null}
      <PropertySection title="Color">
        <ColorInput label="Relleno" value={selectedNode.data.fill ?? defaults.fill} onChange={(fill) => onUpdateNode(selectedNode.id, { data: { ...selectedNode.data, fill } })} />
        <ColorInput label="Borde" value={selectedNode.data.stroke ?? defaults.stroke} onChange={(stroke) => onUpdateNode(selectedNode.id, { data: { ...selectedNode.data, stroke } })} />
        <ColorInput label="Texto" value={selectedNode.data.textColor ?? defaults.textColor} onChange={(textColor) => onUpdateNode(selectedNode.id, { data: { ...selectedNode.data, textColor } })} />
      </PropertySection>
    </>
  );
}
