import { PanelLeft, PanelRight } from "lucide-react";

import { cn } from "@/lib/utils";

export function ToolbarPanelToggles({
  showLibraryPanel,
  showPropertiesPanel,
  onToggleLibraryPanel,
  onTogglePropertiesPanel,
}: {
  showLibraryPanel: boolean;
  showPropertiesPanel: boolean;
  onToggleLibraryPanel: () => void;
  onTogglePropertiesPanel: () => void;
}) {
  return (
    <>
      <div className="mx-1 h-6 w-px bg-slate-200" aria-hidden="true" />
      <button
        type="button"
        className={cn("toolbar-button", showLibraryPanel && "is-active")}
        onClick={onToggleLibraryPanel}
        title={showLibraryPanel ? "Ocultar panel insertar" : "Mostrar panel insertar"}
        aria-pressed={showLibraryPanel}
      >
        <PanelLeft size={15} />
      </button>
      <button
        type="button"
        className={cn("toolbar-button", showPropertiesPanel && "is-active")}
        onClick={onTogglePropertiesPanel}
        title={showPropertiesPanel ? "Ocultar propiedades" : "Mostrar propiedades"}
        aria-pressed={showPropertiesPanel}
      >
        <PanelRight size={15} />
      </button>
    </>
  );
}
