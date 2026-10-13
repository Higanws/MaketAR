import { ChevronRight, PanelRight } from "lucide-react";

export function PropertiesPanelHeader({
  badges,
  onHide,
}: {
  badges: string[];
  onHide?: () => void;
}) {
  return (
    <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4">
      <div className="flex items-center gap-2">
        <PanelRight size={16} />
        <h2 className="text-sm font-semibold">Propiedades</h2>
      </div>
      <div className="flex items-center gap-2">
        {badges.map((badge) => (
          <span key={badge} className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-500">{badge}</span>
        ))}
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
  );
}
