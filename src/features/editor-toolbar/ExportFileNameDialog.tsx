import { Download } from "lucide-react";

import type { ExportFormat } from "@/features/editor-toolbar/ExportMenu";

export function ExportFileNameDialog({
  format,
  fileName,
  onFileNameChange,
  onCancel,
  onConfirm,
}: {
  format: ExportFormat;
  fileName: string;
  onFileNameChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/25 p-4">
      <div className="w-full max-w-[380px] rounded-md border border-slate-200 bg-white p-4 text-sm shadow-xl">
        <h2 className="font-semibold text-slate-950">Exportar {format.toUpperCase()}</h2>
        <p className="mt-1 text-xs text-slate-500">Elige el nombre del fichero antes de descargar.</p>
        <label className="property-label mt-4">
          Nombre del fichero
          <div className="flex items-center gap-2">
            <input
              className="property-input"
              autoFocus
              value={fileName}
              onChange={(event) => onFileNameChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") onConfirm();
                if (event.key === "Escape") onCancel();
              }}
            />
            <span className="rounded-md bg-slate-100 px-2 py-2 text-xs font-semibold text-slate-500">.{format}</span>
          </div>
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <button className="secondary-button" onClick={onCancel}>Cancelar</button>
          <button className="primary-button" onClick={onConfirm}>
            <Download size={15} />
            Exportar
          </button>
        </div>
      </div>
    </div>
  );
}
