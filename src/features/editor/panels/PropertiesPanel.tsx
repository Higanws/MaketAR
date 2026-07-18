import {
  AlignHorizontalDistributeCenter,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignHorizontalJustifyStart,
  AlignVerticalDistributeCenter,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
  ChevronRight,
  PanelRight,
} from "lucide-react";

import type { WireShape } from "@/entities/wireframe/wireframe.types";
import { TableConfigEditor } from "@/features/editor/panels/TableConfigEditor";
import type { IconComponent } from "@/features/icons/icon-catalog";
import { useEditorStore } from "@/stores/editor";
import { fontFamilies } from "@/shared/lib/typography";
import { ColorInput, NumberInput, PropertySection, RangeInput } from "@/shared/ui/property-controls";

export function PropertiesPanel({
  selectedShape,
  onHide,
}: {
  selectedShape: WireShape | null;
  onHide?: () => void;
}) {
  const updateShape = useEditorStore((state) => state.updateShape);
  const updateShapeStyle = useEditorStore((state) => state.updateShapeStyle);
  const alignSelected = useEditorStore((state) => state.alignSelected);
  const selectedIds = useEditorStore((state) => state.selectedIds);
  const alignmentActions: Array<{
    direction: Parameters<typeof alignSelected>[0];
    label: string;
    icon: IconComponent;
    disabled?: boolean;
  }> = [
    { direction: "left", label: "Alinear a la izquierda", icon: AlignHorizontalJustifyStart },
    { direction: "center", label: "Alinear al centro horizontal", icon: AlignHorizontalJustifyCenter },
    { direction: "right", label: "Alinear a la derecha", icon: AlignHorizontalJustifyEnd },
    { direction: "top", label: "Alinear arriba", icon: AlignVerticalJustifyStart },
    { direction: "middle", label: "Alinear al centro vertical", icon: AlignVerticalJustifyCenter },
    { direction: "bottom", label: "Alinear abajo", icon: AlignVerticalJustifyEnd },
    {
      direction: "distribute-horizontal",
      label: "Distribuir horizontalmente",
      icon: AlignHorizontalDistributeCenter,
      disabled: selectedIds.length < 3,
    },
    {
      direction: "distribute-vertical",
      label: "Distribuir verticalmente",
      icon: AlignVerticalDistributeCenter,
      disabled: selectedIds.length < 3,
    },
  ];

  return (
    <aside className="w-[336px] shrink-0 overflow-auto border-l border-slate-200 bg-white">
      <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4">
        <div className="flex items-center gap-2">
          <PanelRight size={16} />
          <h2 className="text-sm font-semibold">Propiedades</h2>
        </div>
        <div className="flex items-center gap-2">
          {selectedShape ? <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-500">{selectedShape.type}</span> : null}
          {onHide ? (
            <button
              type="button"
              className="toolbar-button shrink-0"
              title="Ocultar propiedades"
              aria-label="Ocultar propiedades"
              onClick={onHide}
            >
              <ChevronRight size={16} />
            </button>
          ) : null}
        </div>
      </div>

      <div className="space-y-5 p-4">
        {!selectedShape ? (
          <div className="text-sm text-slate-500">
            Selecciona uno o mas elementos. Usa Shift + click para seleccionar varios.
          </div>
        ) : (
          <>
            <PropertySection title="Elemento">
              {selectedIds.length > 1 ? (
                <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
                  {selectedIds.length} objetos seleccionados
                </div>
              ) : null}
              {selectedShape.groupId ? (
                <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  Grupo: {selectedShape.groupId.replace("group-", "#")}
                </div>
              ) : null}
              <label className="property-label">
                Nombre
                <input value={selectedShape.name} onChange={(event) => updateShape(selectedShape.id, { name: event.target.value })} className="property-input" />
              </label>
              {selectedShape.type === "table" ? (
                <TableConfigEditor
                  shape={selectedShape}
                  onChange={(text) => updateShape(selectedShape.id, { text })}
                />
              ) : (
                <label className="property-label">
                  Texto
                  <textarea
                    value={selectedShape.text}
                    onChange={(event) => updateShape(selectedShape.id, { text: event.target.value })}
                    className="property-input min-h-20 resize-none"
                  />
                </label>
              )}
            </PropertySection>

            <PropertySection title="Posicion y tamano">
              <div className="grid grid-cols-2 gap-2">
                <NumberInput label="X" value={selectedShape.x} onChange={(x) => updateShape(selectedShape.id, { x })} />
                <NumberInput label="Y" value={selectedShape.y} onChange={(y) => updateShape(selectedShape.id, { y })} />
                <NumberInput label="W" value={selectedShape.width} onChange={(width) => updateShape(selectedShape.id, { width })} />
                <NumberInput label="H" value={selectedShape.height} onChange={(height) => updateShape(selectedShape.id, { height })} />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {alignmentActions.map(({ direction, label, icon: Icon, disabled }) => (
                  <button
                    key={direction}
                    className="toolbar-button border border-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                    title={label}
                    aria-label={label}
                    disabled={disabled}
                    onClick={() => alignSelected(direction)}
                  >
                    <Icon size={15} />
                  </button>
                ))}
              </div>
            </PropertySection>

            <PropertySection title="Estilo">
              <ColorInput label="Fill" value={selectedShape.style.fill} onChange={(fill) => updateShapeStyle(selectedShape.id, { fill })} />
              <ColorInput label="Texto" value={selectedShape.style.textColor} onChange={(textColor) => updateShapeStyle(selectedShape.id, { textColor })} />
              <RangeInput label="Opacidad" value={selectedShape.style.opacity} min={0.1} max={1} step={0.05} onChange={(opacity) => updateShapeStyle(selectedShape.id, { opacity })} />
            </PropertySection>

            <PropertySection title="Tipografia">
              <label className="property-label">
                Fuente
                <select
                  className="property-input"
                  value={selectedShape.style.fontFamily}
                  onChange={(event) => updateShapeStyle(selectedShape.id, { fontFamily: event.target.value })}
                >
                  {fontFamilies.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <NumberInput label="Size" value={selectedShape.style.fontSize} onChange={(fontSize) => updateShapeStyle(selectedShape.id, { fontSize })} />
                <NumberInput label="Weight" value={selectedShape.style.fontWeight} onChange={(fontWeight) => updateShapeStyle(selectedShape.id, { fontWeight })} />
              </div>
              <label className="property-label">
                Alineacion
                <select className="property-input" value={selectedShape.style.textAlign} onChange={(event) => updateShapeStyle(selectedShape.id, { textAlign: event.target.value as WireShape["style"]["textAlign"] })}>
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </label>
            </PropertySection>

            <PropertySection title="Borde">
              <ColorInput label="Color" value={selectedShape.style.stroke} onChange={(stroke) => updateShapeStyle(selectedShape.id, { stroke })} />
              <NumberInput label="Grosor" value={selectedShape.style.strokeWidth} onChange={(strokeWidth) => updateShapeStyle(selectedShape.id, { strokeWidth })} />
              <label className="property-label">
                Estilo
                <select className="property-input" value={selectedShape.style.strokeStyle} onChange={(event) => updateShapeStyle(selectedShape.id, { strokeStyle: event.target.value as WireShape["style"]["strokeStyle"] })}>
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
        )}
      </div>
    </aside>
  );
}
