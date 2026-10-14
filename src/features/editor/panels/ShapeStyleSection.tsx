import { shapeAcceptsFillGradient } from "@/entities/wireframe/fill-gradient";
import type { ShapeFillGradient, WireShape } from "@/entities/wireframe/wireframe.types";
import { useEditorStore } from "@/stores/editor";
import { ColorInput, PropertySection, RangeInput } from "@/shared/ui/property-controls";

const fallbackFrom = "#2563eb";
const fallbackTo = "#93c5fd";

function hexOrFallback(color: string, fallback: string) {
  return color.startsWith("#") ? color : fallback;
}

export function ShapeStyleSection({ selectedShape }: { selectedShape: WireShape }) {
  const updateShapeStyle = useEditorStore((state) => state.updateShapeStyle);
  const acceptsGradient = shapeAcceptsFillGradient(selectedShape.type);
  const gradient = selectedShape.style.fillGradient;
  const gradientOn = acceptsGradient && gradient?.enabled === true;

  const updateGradient = (patch: Partial<ShapeFillGradient>) => {
    const current: ShapeFillGradient = {
      enabled: true,
      from: gradient?.from ?? hexOrFallback(selectedShape.style.fill, fallbackFrom),
      to: gradient?.to ?? fallbackTo,
      angle: gradient?.angle ?? 135,
    };
    updateShapeStyle(selectedShape.id, { fillGradient: { ...current, ...patch, enabled: true } });
  };

  return (
    <PropertySection title="Estilo">
      {acceptsGradient ? (
        <label className="property-label">
          Relleno
          <select
            className="property-input"
            value={gradientOn ? "linear" : "solid"}
            onChange={(event) => {
              if (event.target.value === "solid") {
                updateShapeStyle(selectedShape.id, {
                  fillGradient: gradient ? { ...gradient, enabled: false } : undefined,
                });
                return;
              }
              updateGradient({ enabled: true });
            }}
          >
            <option value="solid">Sólido</option>
            <option value="linear">Degradado</option>
          </select>
        </label>
      ) : null}
      {gradientOn && gradient ? (
        <>
          <ColorInput label="Desde" value={gradient.from} onChange={(from) => updateGradient({ from })} />
          <ColorInput label="Hasta" value={gradient.to} onChange={(to) => updateGradient({ to })} />
          <RangeInput label="Ángulo" value={gradient.angle} min={0} max={360} step={1} onChange={(angle) => updateGradient({ angle })} />
        </>
      ) : (
        <ColorInput label="Fill" value={selectedShape.style.fill} onChange={(fill) => updateShapeStyle(selectedShape.id, { fill })} />
      )}
      <ColorInput label="Texto" value={selectedShape.style.textColor} onChange={(textColor) => updateShapeStyle(selectedShape.id, { textColor })} />
      <RangeInput label="Opacidad" value={selectedShape.style.opacity} min={0.1} max={1} step={0.05} onChange={(opacity) => updateShapeStyle(selectedShape.id, { opacity })} />
    </PropertySection>
  );
}
