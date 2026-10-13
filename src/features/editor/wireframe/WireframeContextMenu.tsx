import { ContextMenuButton } from "@/shared/ui/ContextMenuButton";

export function WireframeContextMenu({
  x,
  y,
  selectedCount,
  onDuplicate,
  onGroup,
  onUngroup,
  onBringForward,
  onSendBackward,
  onToggleLock,
  onDelete,
}: {
  x: number;
  y: number;
  selectedCount: number;
  onDuplicate: () => void;
  onGroup: () => void;
  onUngroup: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onToggleLock: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="fixed z-50 w-44 rounded-md border border-slate-200 bg-white p-1 text-sm shadow-xl"
      style={{ left: x, top: y }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <ContextMenuButton label="Duplicar" onClick={onDuplicate} />
      <ContextMenuButton label="Agrupar seleccion" disabled={selectedCount < 2} onClick={onGroup} />
      <ContextMenuButton label="Desagrupar" onClick={onUngroup} />
      <ContextMenuButton label="Traer al frente" onClick={onBringForward} />
      <ContextMenuButton label="Enviar al fondo" onClick={onSendBackward} />
      <ContextMenuButton label="Bloquear / desbloquear" onClick={onToggleLock} />
      <div className="my-1 h-px bg-slate-200" />
      <ContextMenuButton danger label="Eliminar" onClick={onDelete} />
    </div>
  );
}
