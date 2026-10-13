import { Redo2, Undo2 } from "lucide-react";

export function ToolbarHistoryControls({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-md border border-slate-200 p-1">
      <button type="button" className="toolbar-button" title="Deshacer (Cmd/Ctrl+Z)" onClick={onUndo} disabled={!canUndo}>
        <Undo2 size={15} />
      </button>
      <button
        type="button"
        className="toolbar-button"
        title="Rehacer (Cmd/Ctrl+R, Cmd/Ctrl+Y o Cmd/Ctrl+Shift+Z)"
        onClick={onRedo}
        disabled={!canRedo}
      >
        <Redo2 size={15} />
      </button>
    </div>
  );
}
