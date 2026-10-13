import type { WireShape } from "@/entities/wireframe/wireframe.types";
import { PropertiesPanelHeader } from "@/features/editor/panels/PropertiesPanelHeader";
import { ShapeBorderSection } from "@/features/editor/panels/ShapeBorderSection";
import { ShapeGeometrySection } from "@/features/editor/panels/ShapeGeometrySection";
import { ShapeIdentitySection } from "@/features/editor/panels/ShapeIdentitySection";
import { ShapeStyleSection } from "@/features/editor/panels/ShapeStyleSection";
import { ShapeTypographySection } from "@/features/editor/panels/ShapeTypographySection";

export function PropertiesPanel({
  selectedShape,
  onHide,
}: {
  selectedShape: WireShape | null;
  onHide?: () => void;
}) {
  return (
    <aside className="w-[336px] shrink-0 overflow-auto border-l border-slate-200 bg-white">
      <PropertiesPanelHeader badges={selectedShape ? [selectedShape.type] : []} onHide={onHide} />
      <div className="space-y-5 p-4">
        {!selectedShape ? (
          <div className="text-sm text-slate-500">
            Selecciona uno o mas elementos. Usa Shift + click para seleccionar varios.
          </div>
        ) : (
          <>
            <ShapeIdentitySection selectedShape={selectedShape} />
            <ShapeGeometrySection selectedShape={selectedShape} />
            <ShapeStyleSection selectedShape={selectedShape} />
            <ShapeTypographySection selectedShape={selectedShape} />
            <ShapeBorderSection selectedShape={selectedShape} />
          </>
        )}
      </div>
    </aside>
  );
}
