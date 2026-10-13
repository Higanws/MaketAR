import { ChevronLeft } from "lucide-react";

export function LibraryPanelHeader({
  subtitle,
  onHide,
}: {
  subtitle: string;
  onHide?: () => void;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-2">
      <div>
        <h2 className="text-sm font-semibold">Insertar</h2>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
      {onHide ? (
        <button
          type="button"
          className="toolbar-button shrink-0"
          title="Ocultar panel insertar"
          aria-label="Ocultar panel insertar"
          onClick={onHide}
        >
          <ChevronLeft size={16} />
        </button>
      ) : null}
    </div>
  );
}
