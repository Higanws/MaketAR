import { Grid3X3, Plus } from "lucide-react";

import { addTableColumn, addTableRow, parseTableText, updateTableCell } from "@/entities/wireframe/table";
import type { WireShape } from "@/entities/wireframe/wireframe.types";
import { cn } from "@/lib/utils";

export function TableConfigEditor({ shape, onChange }: { shape: WireShape; onChange: (text: string) => void }) {
  const rows = parseTableText(shape.text);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-600">Celdas</span>
        <div className="flex gap-1">
          <button className="toolbar-button border border-slate-200" title="Agregar fila" onClick={() => onChange(addTableRow(shape.text))}>
            <Plus size={14} />
            <span className="sr-only">Fila</span>
          </button>
          <button className="toolbar-button border border-slate-200" title="Agregar columna" onClick={() => onChange(addTableColumn(shape.text))}>
            <Grid3X3 size={14} />
            <span className="sr-only">Columna</span>
          </button>
        </div>
      </div>
      <div className="max-h-64 overflow-auto rounded-md border border-slate-200 bg-slate-50 p-2">
        <div className="grid min-w-max gap-1" style={{ gridTemplateColumns: `repeat(${rows[0]?.length ?? 1}, minmax(92px, 1fr))` }}>
          {rows.flatMap((row, rowIndex) =>
            row.map((cell, cellIndex) => (
              <input
                key={`${shape.id}-config-cell-${rowIndex}-${cellIndex}`}
                className={cn(
                  "h-8 rounded border border-slate-200 bg-white px-2 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100",
                  rowIndex === 0 && "font-bold text-slate-700",
                )}
                value={cell}
                onChange={(event) => onChange(updateTableCell(shape.text, rowIndex, cellIndex, event.target.value))}
                aria-label={`Fila ${rowIndex + 1}, columna ${cellIndex + 1}`}
              />
            )),
          )}
        </div>
      </div>
    </div>
  );
}
