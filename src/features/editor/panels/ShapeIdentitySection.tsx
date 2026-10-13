import type { WireShape } from "@/entities/wireframe/wireframe.types";
import { TableConfigEditor } from "@/features/editor/panels/TableConfigEditor";
import { useEditorStore } from "@/stores/editor";
import { PropertySection } from "@/shared/ui/property-controls";

export function ShapeIdentitySection({ selectedShape }: { selectedShape: WireShape }) {
  const updateShape = useEditorStore((state) => state.updateShape);
  const selectedIds = useEditorStore((state) => state.selectedIds);

  return (
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
        <TableConfigEditor shape={selectedShape} onChange={(text) => updateShape(selectedShape.id, { text })} />
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
  );
}
