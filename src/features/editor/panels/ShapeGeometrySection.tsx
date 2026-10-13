import type { WireShape } from "@/entities/wireframe/wireframe.types";
import { ShapeAlignmentToolbar } from "@/features/editor/panels/ShapeAlignmentToolbar";
import { useEditorStore } from "@/stores/editor";
import { NumberInput, PropertySection } from "@/shared/ui/property-controls";

export function ShapeGeometrySection({ selectedShape }: { selectedShape: WireShape }) {
  const updateShape = useEditorStore((state) => state.updateShape);

  return (
    <PropertySection title="Posicion y tamano">
      <div className="grid grid-cols-2 gap-2">
        <NumberInput label="X" value={selectedShape.x} onChange={(x) => updateShape(selectedShape.id, { x })} />
        <NumberInput label="Y" value={selectedShape.y} onChange={(y) => updateShape(selectedShape.id, { y })} />
        <NumberInput label="W" value={selectedShape.width} onChange={(width) => updateShape(selectedShape.id, { width })} />
        <NumberInput label="H" value={selectedShape.height} onChange={(height) => updateShape(selectedShape.id, { height })} />
      </div>
      <ShapeAlignmentToolbar />
    </PropertySection>
  );
}
