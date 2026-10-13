import { Plus } from "lucide-react";
import type { RefObject } from "react";

import type { FlowNodeVariant } from "@/entities/flow/flow.types";
import { DiagramConnectorHelp } from "@/features/editor/panels/DiagramConnectorHelp";
import { DiagramNodeTools } from "@/features/editor/panels/DiagramNodeTools";
import { IconBrowser } from "@/features/editor/panels/IconBrowser";
import type { CustomIcon, IconCatalogItem } from "@/features/icons/icon-catalog";

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
  return (
    <div className="space-y-5">
      <DiagramNodeTools imageInputRef={imageInputRef} onLoadImage={onLoadImage} onAddDiagramNode={onAddDiagramNode} />
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
            onChange={(event) => {
              onLoadSvgIcon(event.target.files?.[0]);
              event.currentTarget.value = "";
            }}
          />
          <button className="secondary-button w-full" onClick={() => svgInputRef.current?.click()}>
            <Plus size={14} />
            Cargar SVG
          </button>
        </div>
        <div className="mt-3">
          <IconBrowser
            iconSet={iconSet}
            activeBuiltInIcons={activeBuiltInIcons}
            visibleBuiltInIcons={visibleBuiltInIcons}
            activeCustomIcons={activeCustomIcons}
            customDragPayload={(item) => ({
              kind: "flow-icon",
              iconName: item.name,
              iconSet: `Mis iconos / ${item.packageName}`,
              svgSrc: item.svgSrc,
              label: item.name,
            })}
            builtInDragPayload={(item) => ({
              kind: "flow-icon",
              iconName: item.name,
              iconSet: item.set,
              svgSrc: item.svgSrc,
              label: item.label,
            })}
            onCustomIcon={(item) => onAddIcon(item.name, `Mis iconos / ${item.packageName}`, item.svgSrc)}
            onBuiltInIcon={(item) => onAddIcon(item.name, item.set, item.svgSrc, item.label)}
          />
        </div>
      </section>
      <DiagramConnectorHelp />
    </div>
  );
}
