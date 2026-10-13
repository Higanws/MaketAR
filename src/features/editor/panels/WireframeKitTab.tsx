import { createElement, type RefObject } from "react";
import { Image as ImageIcon } from "lucide-react";

import type { WireShape } from "@/entities/wireframe/wireframe.types";
import { libraryDragProps } from "@/features/editor/library/drag-drop";
import { editorTemplateIcons, editorTemplateOptions, libraryItemButtonClass } from "@/features/editor/library/library-constants";
import { categories } from "@/lib/editor-data";

export function WireframeKitTab({
  imageInputRef,
  onLoadImage,
  onAddTemplate,
  onAddShape,
}: {
  imageInputRef: RefObject<HTMLInputElement | null>;
  onLoadImage: (file?: File) => void;
  onAddTemplate: (template: "dashboard" | "landing" | "mobile" | "form") => void;
  onAddShape: (type: WireShape["type"], name?: string) => void;
}) {
  return (
    <div className="space-y-5">
      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Assets</h3>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*,.svg"
          className="hidden"
          onChange={(event) => {
            onLoadImage(event.target.files?.[0]);
            event.currentTarget.value = "";
          }}
        />
        <button className="secondary-button w-full" onClick={() => imageInputRef.current?.click()}>
          <ImageIcon size={14} />
          Cargar imagen / SVG
        </button>
      </section>
      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Templates</h3>
        <div className="grid grid-cols-2 gap-2">
          {editorTemplateOptions.map((template) => (
            <button
              key={template.type}
              type="button"
              title="Arrastra al lienzo o haz click para insertar"
              {...libraryDragProps({ kind: "wireframe-template", template: template.type })}
              className={libraryItemButtonClass}
              onClick={() => onAddTemplate(template.type)}
            >
              {createElement(editorTemplateIcons[template.type], {
                size: 18,
                strokeWidth: 1.7,
                className: "text-slate-600 group-hover:text-blue-600",
              })}
              <span className="w-full truncate text-xs font-medium">{template.label}</span>
            </button>
          ))}
        </div>
      </section>
      {categories.map((category) => (
        <section key={category.name}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{category.name}</h3>
          <div className="grid grid-cols-2 gap-2">
            {category.items.map((item) => (
              <button
                key={`${category.name}-${item.kind}`}
                type="button"
                title="Arrastra al lienzo o haz click para insertar"
                {...libraryDragProps({ kind: "wireframe-shape", type: item.kind as WireShape["type"], label: item.label })}
                onClick={() => onAddShape(item.kind as WireShape["type"], item.label)}
                className={libraryItemButtonClass}
              >
                <item.icon size={18} className="text-slate-600 group-hover:text-blue-600" />
                <span className="w-full truncate text-xs font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
