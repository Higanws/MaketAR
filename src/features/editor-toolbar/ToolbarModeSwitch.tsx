import type { DiagramMode } from "@/entities/wireframe/wireframe.types";
import { cn } from "@/lib/utils";

export function ToolbarModeSwitch({
  mode,
  onModeChange,
}: {
  mode: DiagramMode;
  onModeChange: (mode: DiagramMode) => void;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-1">
      <button
        type="button"
        onClick={() => onModeChange("wireframe")}
        className={cn("segmented-button", mode === "wireframe" && "is-active")}
      >
        Wireframe
      </button>
      <button
        type="button"
        onClick={() => onModeChange("diagram")}
        className={cn("segmented-button", mode === "diagram" && "is-active")}
      >
        Flujo
      </button>
    </div>
  );
}
