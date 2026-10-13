import type { WireShape } from "@/entities/wireframe/wireframe.types";
import { useEditorStore } from "@/stores/editor";
import { ColorInput, PropertySection, RangeInput } from "@/shared/ui/property-controls";

export function ShapeStyleSection({ selectedShape }: { selectedShape: WireShape }) {
  const updateShapeStyle = useEditorStore((state) => state.updateShapeStyle);

  return (
    <PropertySection title="Estilo">
      <ColorInput label="Fill" value={selectedShape.style.fill} onChange={(fill) => updateShapeStyle(selectedShape.id, { fill })} />
      <ColorInput label="Texto" value={selectedShape.style.textColor} onChange={(textColor) => updateShapeStyle(selectedShape.id, { textColor })} />
      <RangeInput label="Opacidad" value={selectedShape.style.opacity} min={0.1} max={1} step={0.05} onChange={(opacity) => updateShapeStyle(selectedShape.id, { opacity })} />
    </PropertySection>
  );
}
