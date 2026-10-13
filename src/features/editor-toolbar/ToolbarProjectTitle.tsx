import { ArrowLeft } from "lucide-react";

export function ToolbarProjectTitle({
  name,
  lastSavedAt,
  onBack,
}: {
  name: string;
  lastSavedAt: string;
  onBack: () => void;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <button type="button" className="toolbar-button" title="Volver a proyectos" onClick={onBack}>
        <ArrowLeft size={16} />
      </button>
      <div className="min-w-0 px-2">
        <div className="truncate text-sm font-semibold">{name}</div>
        <div className="truncate text-xs text-slate-500">{lastSavedAt}</div>
      </div>
    </div>
  );
}
