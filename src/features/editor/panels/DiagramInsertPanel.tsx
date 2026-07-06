import { createElement, type RefObject } from "react";
import { Plus } from "lucide-react";

import type { FlowNodeVariant } from "@/entities/flow/flow.types";
import { IconTile } from "@/features/editor/library/IconTile";
import { libraryDragProps } from "@/features/editor/library/drag-drop";
import {
  diagramConnectorTools,
  diagramLibraryItemButtonClass,
  diagramNodeTools,
} from "@/features/editor/library/library-constants";
import type { CustomIcon, IconCatalogItem } from "@/features/icons/icon-catalog";
import { iconResultLimit } from "@/features/icons/icon-catalog";

export function DiagramInsertPanel({
  iconSet,
  iconSearch,
  iconPackageOptions,
  activeBuiltInIcons,
  visibleBuiltInIcons,
  activeCustomIcons,
  customPackageName,
  svgInputRef,
  imageInputRef,
  onAddDiagramNode,
  onSetIconSet,
  onSetIconSearch,
  onSetCustomPackageName,
  onCreateCustomPackage,
  onLoadSvgIcon,
  onLoadImage,
  onAddIcon,
}: {
  iconSet: string;
  iconSearch: string;
  iconPackageOptions: string[];
  activeBuiltInIcons: IconCatalogItem[];
  visibleBuiltInIcons: IconCatalogItem[];
  activeCustomIcons: CustomIcon[];
  customPackageName: string;
  svgInputRef: RefObject<HTMLInputElement | null>;
  imageInputRef: RefObject<HTMLInputElement | null>;
  onAddDiagramNode: (variant: FlowNodeVariant, label?: string, center?: { x: number; y: number }) => void;
  onSetIconSet: (value: string) => void;
  onSetIconSearch: (value: string) => void;
  onSetCustomPackageName: (value: string) => void;
  onCreateCustomPackage: () => void;
  onLoadSvgIcon: (file?: File) => void;
  onLoadImage: (file?: File) => void;
  onAddIcon: (iconName: string, iconSet: string, svgSrc?: string, displayLabel?: string) => void;
}) {
  const addNodeTool = (tool: (typeof diagramNodeTools)[number]) => {
    if (tool.variant === "image") {
      imageInputRef.current?.click();
      return;
    }
    onAddDiagramNode(tool.variant, tool.label);
  };

  return (
    <div className="space-y-5">
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
      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Nodos de flujo</h3>
        <div className="grid grid-cols-2 gap-2">
          {diagramNodeTools.map((tool) => (
            <button
              key={tool.variant}
              type="button"
              title={tool.variant === "image" ? "Haz click para cargar una imagen" : "Arrastra al lienzo o haz click para insertar"}
              {...(tool.variant === "image"
                ? {}
                : libraryDragProps({ kind: "flow-node", variant: tool.variant, label: tool.label }))}
              className={diagramLibraryItemButtonClass}
              onClick={() => addNodeTool(tool)}
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

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Iconos</h3>
        <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-3">
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <input
              className="property-input"
              value={customPackageName}
              onChange={(event) => onSetCustomPackageName(event.target.value)}
              placeholder="Nuevo paquete"
            />
            <button className="toolbar-button border border-slate-200" title="Crear paquete" onClick={onCreateCustomPackage}>
              <Plus size={15} />
            </button>
          </div>
          <label className="property-label">
            Paquete
            <select className="property-input" value={iconSet} onChange={(event) => onSetIconSet(event.target.value)}>
              {iconPackageOptions.map((packageName) => (
                <option key={packageName} value={packageName}>{packageName}</option>
              ))}
            </select>
          </label>
          <label className="property-label">
            Buscar icono
            <input
              className="property-input"
              value={iconSearch}
              onChange={(event) => onSetIconSearch(event.target.value)}
              placeholder="Ej: AWS, Docker, database"
            />
          </label>
          <input
            ref={svgInputRef}
            type="file"
            accept=".svg,image/svg+xml"
            className="hidden"
            onChange={(event) => onLoadSvgIcon(event.target.files?.[0])}
          />
          <button className="secondary-button w-full" onClick={() => svgInputRef.current?.click()}>
            <Plus size={14} />
            Cargar SVG
          </button>
        </div>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {iconSet.startsWith("Mis iconos / ")
            ? activeCustomIcons.map((item) => (
                <IconTile
                  key={item.id}
                  label={item.name}
                  title={`${item.name} · ${item.packageName}`}
                  svgSrc={item.svgSrc}
                  dragPayload={{ kind: "flow-icon", iconName: item.name, iconSet: `Mis iconos / ${item.packageName}`, svgSrc: item.svgSrc, label: item.name }}
                  onClick={() => onAddIcon(item.name, `Mis iconos / ${item.packageName}`, item.svgSrc)}
                />
              ))
            : visibleBuiltInIcons.map((item) => (
                <IconTile
                  key={`${item.set}-${item.name}`}
                  label={item.label}
                  title={`${item.label} · ${item.set}`}
                  svgSrc={item.svgSrc}
                  icon={item.icon}
                  dragPayload={{ kind: "flow-icon", iconName: item.name, iconSet: item.set, svgSrc: item.svgSrc, label: item.label }}
                  onClick={() => onAddIcon(item.name, item.set, item.svgSrc, item.label)}
                />
              ))}
        </div>
        {!iconSet.startsWith("Mis iconos / ") && activeBuiltInIcons.length > iconResultLimit ? (
          <p className="mt-3 text-xs text-slate-500">
            Mostrando {iconResultLimit} de {activeBuiltInIcons.length}. Usa la busqueda para iconos especificos.
          </p>
        ) : null}
        {!activeBuiltInIcons.length && !activeCustomIcons.length ? (
          <div className="mt-3 rounded-md border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500">
            No hay iconos para ese filtro.
          </div>
        ) : null}
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Conectores</h3>
        <div className="space-y-2">
          {diagramConnectorTools.map((tool) => (
            <div key={tool.label} className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <tool.icon size={16} strokeWidth={1.7} />
                {tool.label}
              </div>
              <p className="mt-1 text-xs text-slate-500">{tool.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
