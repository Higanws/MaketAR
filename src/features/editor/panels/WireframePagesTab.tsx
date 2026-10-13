import { Plus, Trash2 } from "lucide-react";

import type { WireShape } from "@/entities/wireframe/wireframe.types";
import { cn } from "@/lib/utils";

export function WireframePagesTab({
  pages,
  currentPageId,
  onSwitchPage,
  onCreatePage,
  onDuplicatePage,
  onDeletePage,
}: {
  pages: { id: string; name: string; shapes: WireShape[] }[];
  currentPageId: string;
  onSwitchPage: (id: string) => void;
  onCreatePage: () => void;
  onDuplicatePage: () => void;
  onDeletePage: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button className="secondary-button flex-1" onClick={onCreatePage}><Plus size={14} />Pagina</button>
        <button className="secondary-button flex-1" onClick={onDuplicatePage}>Duplicar</button>
      </div>
      {pages.map((page) => (
        <button
          key={page.id}
          className={cn(
            "flex w-full items-center justify-between rounded-md border p-3 text-left text-sm",
            page.id === currentPageId ? "border-blue-300 bg-blue-50" : "border-slate-200 hover:bg-slate-50",
          )}
          onClick={() => onSwitchPage(page.id)}
        >
          <span className="truncate font-medium">{page.name}</span>
          <span className="text-xs text-slate-500">{page.shapes.length}</span>
        </button>
      ))}
      <button className="secondary-button w-full" onClick={() => onDeletePage(currentPageId)}>
        <Trash2 size={14} />Eliminar pagina
      </button>
    </div>
  );
}
