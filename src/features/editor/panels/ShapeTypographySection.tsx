import type { WireShape } from "@/entities/wireframe/wireframe.types";
import { useEditorStore } from "@/stores/editor";
import { fontFamilies } from "@/shared/lib/typography";
import { NumberInput, PropertySection } from "@/shared/ui/property-controls";

export function ShapeTypographySection({ selectedShape }: { selectedShape: WireShape }) {
  const updateShapeStyle = useEditorStore((state) => state.updateShapeStyle);

  return (
    <PropertySection title="Tipografia">
      <label className="property-label">
        Fuente
        <select
          className="property-input"
          value={selectedShape.style.fontFamily}
          onChange={(event) => updateShapeStyle(selectedShape.id, { fontFamily: event.target.value })}
        >
          {fontFamilies.map((font) => (
            <option key={font.value} value={font.value}>{font.label}</option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-2">
        <NumberInput label="Size" value={selectedShape.style.fontSize} onChange={(fontSize) => updateShapeStyle(selectedShape.id, { fontSize })} />
        <NumberInput label="Weight" value={selectedShape.style.fontWeight} onChange={(fontWeight) => updateShapeStyle(selectedShape.id, { fontWeight })} />
      </div>
      <label className="property-label">
        Alineacion
        <select
          className="property-input"
          value={selectedShape.style.textAlign}
          onChange={(event) => updateShapeStyle(selectedShape.id, { textAlign: event.target.value as WireShape["style"]["textAlign"] })}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </label>
    </PropertySection>
  );
}
