import type { WireShape } from "@/entities/wireframe/wireframe.types";
import { useEditorStore } from "@/stores/editor";
import { ColorInput, NumberInput, PropertySection, RangeInput } from "@/shared/ui/property-controls";

export function ShapeBorderSection({ selectedShape }: { selectedShape: WireShape }) {
  const updateShapeStyle = useEditorStore((state) => state.updateShapeStyle);

  return (
    <>
      <PropertySection title="Borde">
        <ColorInput label="Color" value={selectedShape.style.stroke} onChange={(stroke) => updateShapeStyle(selectedShape.id, { stroke })} />
        <NumberInput label="Grosor" value={selectedShape.style.strokeWidth} onChange={(strokeWidth) => updateShapeStyle(selectedShape.id, { strokeWidth })} />
        <label className="property-label">
          Estilo
          <select
            className="property-input"
            value={selectedShape.style.strokeStyle}
            onChange={(event) => updateShapeStyle(selectedShape.id, { strokeStyle: event.target.value as WireShape["style"]["strokeStyle"] })}
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
          </select>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <NumberInput label="TL" value={selectedShape.style.borderTopLeftRadius} onChange={(borderTopLeftRadius) => updateShapeStyle(selectedShape.id, { borderTopLeftRadius })} />
          <NumberInput label="TR" value={selectedShape.style.borderTopRightRadius} onChange={(borderTopRightRadius) => updateShapeStyle(selectedShape.id, { borderTopRightRadius })} />
          <NumberInput label="BL" value={selectedShape.style.borderBottomLeftRadius} onChange={(borderBottomLeftRadius) => updateShapeStyle(selectedShape.id, { borderBottomLeftRadius })} />
          <NumberInput label="BR" value={selectedShape.style.borderBottomRightRadius} onChange={(borderBottomRightRadius) => updateShapeStyle(selectedShape.id, { borderBottomRightRadius })} />
        </div>
      </PropertySection>
      <PropertySection title="Transformacion">
        <RangeInput label="Rotacion" value={selectedShape.style.rotation} min={-180} max={180} step={1} onChange={(rotation) => updateShapeStyle(selectedShape.id, { rotation })} />
      </PropertySection>
    </>
  );
}
