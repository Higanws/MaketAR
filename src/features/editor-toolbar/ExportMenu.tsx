import { ChevronDown, Download } from "lucide-react";

export type ExportFormat = "png" | "svg" | "pdf" | "json";

function ExportMenuButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button className="block w-full rounded px-3 py-2 text-left hover:bg-slate-50" onClick={onClick}>
      {label}
    </button>
  );
}

export function ExportMenu({
  open,
  onToggle,
  onRequest,
}: {
  open: boolean;
  onToggle: () => void;
  onRequest: (format: ExportFormat) => void;
}) {
  return (
    <div className="relative">
      <button className="primary-button" onClick={onToggle}>
        <Download size={15} />
        Exportar
        <ChevronDown size={14} />
      </button>
      {open ? (
        <div className="absolute right-0 top-10 z-50 w-40 rounded-md border border-slate-200 bg-white p-1 text-sm shadow-xl">
          <ExportMenuButton label="PNG" onClick={() => onRequest("png")} />
          <ExportMenuButton label="SVG" onClick={() => onRequest("svg")} />
          <ExportMenuButton label="PDF" onClick={() => onRequest("pdf")} />
          <ExportMenuButton label="JSON" onClick={() => onRequest("json")} />
        </div>
      ) : null}
    </div>
  );
}
