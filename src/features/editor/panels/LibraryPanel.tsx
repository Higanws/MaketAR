"use client";

import { Plus } from "lucide-react";
import { useRef, useState } from "react";

import type { FlowNodeVariant } from "@/entities/flow/flow.types";
import type { DiagramMode, WireShape } from "@/entities/wireframe/wireframe.types";
import { readFileAsDataUrl } from "@/features/editor/library/read-image-file";
import { useCustomIconLibrary } from "@/features/editor/library/useCustomIconLibrary";
import { useIconCatalogFilter } from "@/features/editor/library/useIconCatalogFilter";
import { DiagramInsertPanel } from "@/features/editor/panels/DiagramInsertPanel";
import { IconBrowser } from "@/features/editor/panels/IconBrowser";
import { LibraryPanelHeader } from "@/features/editor/panels/LibraryPanelHeader";
import { WireframeKitTab } from "@/features/editor/panels/WireframeKitTab";
import { WireframePagesTab } from "@/features/editor/panels/WireframePagesTab";
import { cn } from "@/lib/utils";

export function LibraryPanel({
  mode,
  pages,
  currentPageId,
  onSwitchPage,
  onCreatePage,
  onDuplicatePage,
  onDeletePage,
  onAddShape,
  onAddDiagramNode,
  onAddImage,
  onAddTemplate,
  onAddIcon,
  onAddCustomIcon,
  onAddDiagramIcon,
  onAddDiagramImage,
  onHide,
}: {
  mode: DiagramMode;
  pages: { id: string; name: string; shapes: WireShape[] }[];
  currentPageId: string;
  onSwitchPage: (id: string) => void;
  onCreatePage: () => void;
  onDuplicatePage: () => void;
  onDeletePage: (id: string) => void;
  onAddShape: (type: WireShape["type"], name?: string) => void;
  onAddDiagramNode: (variant: FlowNodeVariant, label?: string, center?: { x: number; y: number }) => void;
  onAddImage: (imageSrc: string, name?: string) => void;
  onAddTemplate: (template: "dashboard" | "landing" | "mobile" | "form") => void;
  onAddIcon: (iconName: string, iconSet: string, svgSrc?: string) => void;
  onAddCustomIcon: (name: string, svgSrc: string, iconSet?: string) => void;
  onAddDiagramIcon: (iconName: string, iconSet: string, svgSrc?: string, displayLabel?: string) => void;
  onAddDiagramImage: (imageSrc: string, name?: string) => void;
  onHide?: () => void;
}) {
  const [tab, setTab] = useState<"library" | "icons" | "pages">("library");
  const library = useCustomIconLibrary();
  const icons = useIconCatalogFilter(
    library.iconSet,
    library.iconSearch,
    library.customIcons,
    library.customPackageFromOption,
  );
  const svgInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const loadSvgIcon = (file?: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".svg") && file.type !== "image/svg+xml") return;
    void readFileAsDataUrl(file).then((svgSrc) => {
      const icon = {
        id: `custom-icon-${Date.now()}`,
        name: file.name.replace(/\.svg$/i, ""),
        packageName: library.customPackageFromOption,
        svgSrc,
      };
      library.addCustomIcon(icon);
      if (mode === "diagram") {
        onAddDiagramIcon(icon.name, `Mis iconos / ${icon.packageName}`, icon.svgSrc);
      } else {
        onAddCustomIcon(icon.name, icon.svgSrc, icon.packageName);
      }
    });
  };

  const loadImageAsset = (file?: File) => {
    if (!file) return;
    void readFileAsDataUrl(file).then((imageSrc) => {
      if (mode === "diagram") onAddDiagramImage(imageSrc, file.name);
      else onAddImage(imageSrc, file.name);
    });
  };

  return (
    <aside className="relative w-[286px] shrink-0 overflow-auto border-r border-slate-200 bg-white p-4">
      <LibraryPanelHeader
        subtitle={mode === "diagram" ? "Nodos, conectores y flechas" : "Componentes, paginas e iconos"}
        onHide={onHide}
      />
      {mode === "diagram" ? (
        <DiagramInsertPanel
          iconSet={library.iconSet}
          iconSearch={library.iconSearch}
          iconPackageOptions={library.iconPackageOptions}
          activeBuiltInIcons={icons.activeBuiltInIcons}
          visibleBuiltInIcons={icons.visibleBuiltInIcons}
          activeCustomIcons={icons.activeCustomIcons}
          customPackageName={library.customPackageName}
          svgInputRef={svgInputRef}
          imageInputRef={imageInputRef}
          onAddDiagramNode={onAddDiagramNode}
          onSetIconSet={library.setIconSet}
          onSetIconSearch={library.setIconSearch}
          onSetCustomPackageName={library.setCustomPackageName}
          onCreateCustomPackage={library.createCustomPackage}
          onLoadSvgIcon={loadSvgIcon}
          onLoadImage={loadImageAsset}
          onAddIcon={onAddDiagramIcon}
        />
      ) : (
        <>
          <div className="mb-4 grid grid-cols-3 rounded-md border border-slate-200 bg-slate-50 p-1">
            {(["library", "icons", "pages"] as const).map((item) => (
              <button key={item} className={cn("segmented-button", tab === item && "is-active")} onClick={() => setTab(item)}>
                {item === "library" ? "Kit" : item === "icons" ? "Iconos" : "Paginas"}
              </button>
            ))}
          </div>
          {tab === "pages" ? (
            <WireframePagesTab
              pages={pages}
              currentPageId={currentPageId}
              onSwitchPage={onSwitchPage}
              onCreatePage={onCreatePage}
              onDuplicatePage={onDuplicatePage}
              onDeletePage={onDeletePage}
            />
          ) : null}
          {tab === "icons" ? (
            <div className="space-y-4">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Paquetes propios</h3>
                <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
                  <input
                    className="property-input"
                    value={library.customPackageName}
                    onChange={(event) => library.setCustomPackageName(event.target.value)}
                    placeholder="Nuevo paquete"
                  />
                  <button className="toolbar-button border border-slate-200" title="Crear paquete" onClick={library.createCustomPackage}>
                    <Plus size={15} />
                  </button>
                </div>
                {library.customIcons.length ? (
                  <button className="secondary-button mt-3 w-full" onClick={library.clearCustomPackages}>
                    Vaciar paquetes propios
                  </button>
                ) : null}
              </div>
              <label className="property-label">
                Paquete
                <select className="property-input" value={library.iconSet} onChange={(event) => library.setIconSet(event.target.value)}>
                  {library.iconPackageOptions.map((packageName) => (
                    <option key={packageName} value={packageName}>{packageName}</option>
                  ))}
                </select>
              </label>
              <label className="property-label">
                Buscar icono
                <input
                  className="property-input"
                  value={library.iconSearch}
                  onChange={(event) => library.setIconSearch(event.target.value)}
                  placeholder="Ej: Kubernetes"
                />
              </label>
              <input
                ref={svgInputRef}
                type="file"
                accept=".svg,image/svg+xml"
                className="hidden"
                onChange={(event) => {
                  loadSvgIcon(event.target.files?.[0]);
                  event.currentTarget.value = "";
                }}
              />
              <button className="secondary-button w-full" onClick={() => svgInputRef.current?.click()}>
                <Plus size={14} />
                Cargar SVG
              </button>
              <IconBrowser
                iconSet={library.iconSet}
                activeBuiltInIcons={icons.activeBuiltInIcons}
                visibleBuiltInIcons={icons.visibleBuiltInIcons}
                activeCustomIcons={icons.activeCustomIcons}
                customDragPayload={(item) => ({ kind: "wireframe-custom-icon", name: item.name, svgSrc: item.svgSrc, iconSet: item.packageName })}
                builtInDragPayload={(item) => ({ kind: "wireframe-icon", iconName: item.name, iconSet: item.set, svgSrc: item.svgSrc, label: item.label })}
                onCustomIcon={(item) => onAddCustomIcon(item.name, item.svgSrc, item.packageName)}
                onBuiltInIcon={(item) => onAddIcon(item.name, item.set, item.svgSrc)}
              />
            </div>
          ) : null}
          {tab === "library" ? (
            <WireframeKitTab
              imageInputRef={imageInputRef}
              onLoadImage={loadImageAsset}
              onAddTemplate={onAddTemplate}
              onAddShape={onAddShape}
            />
          ) : null}
        </>
      )}
    </aside>
  );
}
