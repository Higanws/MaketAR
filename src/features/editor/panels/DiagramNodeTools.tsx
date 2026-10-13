import { createElement, type RefObject } from "react";

import type { FlowNodeVariant } from "@/entities/flow/flow.types";
import { libraryDragProps } from "@/features/editor/library/drag-drop";
import { diagramLibraryItemButtonClass, diagramNodeTools } from "@/features/editor/library/library-constants";

export function DiagramNodeTools({
  imageInputRef,
  onLoadImage,
  onAddDiagramNode,
}: {
  imageInputRef: RefObject<HTMLInputElement | null>;
  onLoadImage: (file?: File) => void;
  onAddDiagramNode: (variant: FlowNodeVariant, label?: string) => void;
}) {
  return (
    <section>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*,.svg,image/svg+xml"
        className="hidden"
        onChange={(event) => {
          onLoadImage(event.target.files?.[0]);
          event.currentTarget.value = "";
        }}
      />
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Nodos de flujo</h3>
      <div className="grid grid-cols-2 gap-2">
        {diagramNodeTools.map((tool) => (
          <button
            key={tool.variant}
            type="button"
            title={tool.variant === "image" ? "Haz click para cargar una imagen" : "Arrastra al lienzo o haz click para insertar"}
            {...(tool.variant === "image" ? {} : libraryDragProps({ kind: "flow-node", variant: tool.variant, label: tool.label }))}
            className={diagramLibraryItemButtonClass}
            onClick={() => {
              if (tool.variant === "image") {
                imageInputRef.current?.click();
                return;
              }
              onAddDiagramNode(tool.variant, tool.label);
            }}
          >
            {createElement(tool.icon, {
              size: 18,
              strokeWidth: 1.7,
              className: "text-slate-600 group-hover:text-blue-600",
            })}
            <span className="w-full truncate text-xs font-medium">{tool.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
