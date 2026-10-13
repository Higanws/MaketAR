import type { Edge } from "@xyflow/react";

import { promptEdgeLabel } from "@/features/editor/flow/edit-edge-label";
import { ContextMenuButton } from "@/shared/ui/ContextMenuButton";

export type FlowContextMenuState = {
  type: "node" | "edge" | "pane";
  id?: string;
  x: number;
  y: number;
};

export function FlowContextMenu({
  menu,
  edges,
  onClose,
  onDuplicateNode,
  onCopySelection,
  onDeleteNode,
  onEdgeLabelChange,
  onDeleteEdge,
  onDuplicateSelection,
  onPaste,
  onDeleteSelection,
}: {
  menu: FlowContextMenuState;
  edges: Edge[];
  onClose: () => void;
  onDuplicateNode: (id: string) => void;
  onCopySelection: () => void;
  onDeleteNode: (id: string) => void;
  onEdgeLabelChange: (id: string, label: string) => void;
  onDeleteEdge: (id: string) => void;
  onDuplicateSelection: () => void;
  onPaste: () => void;
  onDeleteSelection: () => void;
}) {
  return (
    <div
      className="fixed z-50 w-48 rounded-md border border-slate-200 bg-white p-1 text-sm shadow-xl"
      style={{ left: menu.x, top: menu.y }}
    >
      {menu.type === "node" && menu.id ? (
        <>
          <ContextMenuButton label="Duplicar" onClick={() => { onDuplicateNode(menu.id!); onClose(); }} />
          <ContextMenuButton label="Copiar seleccion" onClick={() => { onCopySelection(); onClose(); }} />
          <ContextMenuButton danger label="Eliminar nodo" onClick={() => { onDeleteNode(menu.id!); onClose(); }} />
        </>
      ) : null}
      {menu.type === "edge" && menu.id ? (
        <>
          <ContextMenuButton
            label="Editar etiqueta"
            onClick={() => {
              const edge = edges.find((item) => item.id === menu.id);
              const nextLabel = promptEdgeLabel(String(edge?.label ?? ""));
              if (nextLabel !== null) onEdgeLabelChange(menu.id!, nextLabel);
              onClose();
            }}
          />
          <ContextMenuButton danger label="Eliminar flecha" onClick={() => { onDeleteEdge(menu.id!); onClose(); }} />
        </>
      ) : null}
      {menu.type === "pane" ? (
        <>
          <ContextMenuButton label="Duplicar seleccion" onClick={() => { onDuplicateSelection(); onClose(); }} />
          <ContextMenuButton label="Copiar seleccion" onClick={() => { onCopySelection(); onClose(); }} />
          <ContextMenuButton label="Pegar" onClick={() => { onPaste(); onClose(); }} />
          <ContextMenuButton danger label="Eliminar seleccion" onClick={() => { onDeleteSelection(); onClose(); }} />
        </>
      ) : null}
    </div>
  );
}
