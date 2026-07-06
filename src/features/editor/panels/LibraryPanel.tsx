import { createElement, useEffect, useMemo, useRef, useState } from "react";
import { Image as ImageIcon, Plus, Trash2 } from "lucide-react";

import type { FlowNodeVariant } from "@/entities/flow/flow.types";
import type { DiagramMode, WireShape } from "@/entities/wireframe/wireframe.types";
import { IconTile } from "@/features/editor/library/IconTile";
import { libraryDragProps } from "@/features/editor/library/drag-drop";
import {
  editorTemplateIcons,
  editorTemplateOptions,
  libraryItemButtonClass,
} from "@/features/editor/library/library-constants";
import { DiagramInsertPanel } from "@/features/editor/panels/DiagramInsertPanel";
import {
  builtInIconSets,
  customIconPackagesStorageKey,
  customIconsStorageKey,
  iconCatalog,
  iconResultLimit,
  type CustomIcon,
} from "@/features/icons/icon-catalog";
import { categories } from "@/lib/editor-data";
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
}) {
  const [tab, setTab] = useState<"library" | "icons" | "pages">("library");
  const [iconSet, setIconSet] = useState("AWS");
  const [iconSearch, setIconSearch] = useState("");
  const [customPackageName, setCustomPackageName] = useState("");
  const [customPackages, setCustomPackages] = useState<string[]>(["Mis iconos"]);
  const [customIcons, setCustomIcons] = useState<CustomIcon[]>([]);
  const [customIconsHydrated, setCustomIconsHydrated] = useState(false);
  const svgInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const customPackageOptions = useMemo(
    () => customPackages.map((packageName) => `Mis iconos / ${packageName}`),
    [customPackages],
  );
  const iconPackageOptions = useMemo(
    () => [...builtInIconSets, ...customPackageOptions],
    [customPackageOptions],
  );
  const customPackageFromOption = iconSet.startsWith("Mis iconos / ")
    ? iconSet.replace("Mis iconos / ", "")
    : customPackages[0];
  const activeBuiltInIcons = useMemo(() => {
    const normalizedSearch = iconSearch.trim().toLowerCase();
    if (iconSet.startsWith("Mis iconos / ")) return [];
    return iconCatalog.filter(
      (icon) =>
        icon.set === iconSet &&
        (!normalizedSearch ||
          icon.name.toLowerCase().includes(normalizedSearch) ||
          icon.label.toLowerCase().includes(normalizedSearch)),
    );
  }, [iconSearch, iconSet]);
  const visibleBuiltInIcons = useMemo(() => activeBuiltInIcons.slice(0, iconResultLimit), [activeBuiltInIcons]);
  const activeCustomIcons = useMemo(() => {
    const normalizedSearch = iconSearch.trim().toLowerCase();
    return customIcons.filter(
      (icon) =>
        icon.packageName === customPackageFromOption &&
        (!normalizedSearch || icon.name.toLowerCase().includes(normalizedSearch)),
    );
  }, [customIcons, customPackageFromOption, iconSearch]);

  useEffect(() => {
    const loadSavedIcons = window.setTimeout(() => {
      const saved = window.localStorage.getItem(customIconsStorageKey);
      const savedPackages = window.localStorage.getItem(customIconPackagesStorageKey);
      try {
        const parsedIcons = (saved ? JSON.parse(saved) : []) as Array<Partial<CustomIcon>>;
        const normalizedIcons = parsedIcons.map((icon) => ({
          id: icon.id ?? `custom-icon-${Date.now()}`,
          name: icon.name ?? "Icono",
          packageName: icon.packageName ?? "Mis iconos",
          svgSrc: icon.svgSrc ?? "",
        }));
        setCustomIcons(normalizedIcons.filter((icon) => icon.svgSrc));
        const parsedPackages = (savedPackages ? JSON.parse(savedPackages) : []) as string[];
        const packagesFromIcons = normalizedIcons.map((icon) => icon.packageName);
        setCustomPackages(Array.from(new Set(["Mis iconos", ...parsedPackages, ...packagesFromIcons])));
      } catch {
        setCustomIcons([]);
        setCustomPackages(["Mis iconos"]);
      }
      setCustomIconsHydrated(true);
    }, 0);

    return () => window.clearTimeout(loadSavedIcons);
  }, []);

  useEffect(() => {
    if (!customIconsHydrated) return;
    window.localStorage.setItem(customIconsStorageKey, JSON.stringify(customIcons));
    window.localStorage.setItem(customIconPackagesStorageKey, JSON.stringify(customPackages));
  }, [customIcons, customIconsHydrated, customPackages]);

  const createCustomPackage = () => {
    const packageName = customPackageName.trim();
    if (!packageName) return;
    setCustomPackages((current) => Array.from(new Set([...current, packageName])));
    setIconSet(`Mis iconos / ${packageName}`);
    setCustomPackageName("");
  };

  const loadSvgIcon = (file?: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".svg") && file.type !== "image/svg+xml") return;
    const reader = new FileReader();
    reader.onload = () => {
      const icon = {
        id: `custom-icon-${Date.now()}`,
        name: file.name.replace(/\.svg$/i, ""),
        packageName: customPackageFromOption,
        svgSrc: String(reader.result),
      };
      setCustomIcons((current) => [icon, ...current]);
      if (mode === "diagram") {
        onAddDiagramIcon(icon.name, `Mis iconos / ${icon.packageName}`, icon.svgSrc);
      } else {
        onAddCustomIcon(icon.name, icon.svgSrc, icon.packageName);
      }
      setIconSet(`Mis iconos / ${icon.packageName}`);
    };
    reader.readAsDataURL(file);
  };

  const loadImageAsset = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (mode === "diagram") {
        onAddDiagramImage(String(reader.result), file.name);
      } else {
        onAddImage(String(reader.result), file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <aside className="relative w-[286px] shrink-0 overflow-auto border-r border-slate-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Insertar</h2>
          <p className="text-xs text-slate-500">
            {mode === "diagram" ? "Nodos, conectores y flechas" : "Componentes, paginas e iconos"}
          </p>
        </div>
      </div>

      {mode === "diagram" ? (
        <DiagramInsertPanel
          iconSet={iconSet}
          iconSearch={iconSearch}
          iconPackageOptions={iconPackageOptions}
          activeBuiltInIcons={activeBuiltInIcons}
          visibleBuiltInIcons={visibleBuiltInIcons}
          activeCustomIcons={activeCustomIcons}
          customPackageName={customPackageName}
          svgInputRef={svgInputRef}
          imageInputRef={imageInputRef}
          onAddDiagramNode={onAddDiagramNode}
          onSetIconSet={setIconSet}
          onSetIconSearch={setIconSearch}
          onSetCustomPackageName={setCustomPackageName}
          onCreateCustomPackage={createCustomPackage}
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
      ) : null}

      {tab === "icons" ? (
        <div className="space-y-4">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
              Paquetes propios
            </h3>
            <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
              <input
                className="property-input"
                value={customPackageName}
                onChange={(event) => setCustomPackageName(event.target.value)}
                placeholder="Nuevo paquete"
              />
              <button className="toolbar-button border border-slate-200" title="Crear paquete" onClick={createCustomPackage}>
                <Plus size={15} />
              </button>
            </div>
            {customIcons.length ? (
              <button
                className="secondary-button mt-3 w-full"
                onClick={() => {
                  setCustomIcons([]);
                  setCustomPackages(["Mis iconos"]);
                  window.localStorage.removeItem(customIconsStorageKey);
                  window.localStorage.removeItem(customIconPackagesStorageKey);
                  setIconSet("AWS");
                }}
              >
                Vaciar paquetes propios
              </button>
            ) : null}
          </div>
          <label className="property-label">
            Paquete
            <select className="property-input" value={iconSet} onChange={(event) => setIconSet(event.target.value)}>
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
              onChange={(event) => setIconSearch(event.target.value)}
              placeholder="Ej: Kubernetes"
            />
          </label>
          <input
            ref={svgInputRef}
            type="file"
            accept=".svg,image/svg+xml"
            className="hidden"
            onChange={(event) => loadSvgIcon(event.target.files?.[0])}
          />
          <button className="secondary-button w-full" onClick={() => svgInputRef.current?.click()}>
            <Plus size={14} />
            Cargar SVG
          </button>
          <div className="space-y-5">
            <section>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    {iconSet}
                  </h3>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                    {iconSet.startsWith("Mis iconos / ") ? activeCustomIcons.length : activeBuiltInIcons.length}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {iconSet.startsWith("Mis iconos / ")
                    ? activeCustomIcons.map((item) => (
                        <IconTile
                          key={item.id}
                          label={item.name}
                          title={`${item.name} · ${item.packageName}`}
                          svgSrc={item.svgSrc}
                          dragPayload={{ kind: "wireframe-custom-icon", name: item.name, svgSrc: item.svgSrc, iconSet: item.packageName }}
                          onClick={() => onAddCustomIcon(item.name, item.svgSrc, item.packageName)}
                        />
                      ))
                    : visibleBuiltInIcons.map((item) => (
                        <IconTile
                          key={`${item.set}-${item.name}`}
                          label={item.label}
                          title={`${item.label} · ${item.set}`}
                          svgSrc={item.svgSrc}
                          icon={item.icon}
                          dragPayload={{ kind: "wireframe-icon", iconName: item.name, iconSet: item.set, svgSrc: item.svgSrc, label: item.label }}
                          onClick={() => onAddIcon(item.name, item.set, item.svgSrc)}
                        />
                      ))}
                </div>
                {!iconSet.startsWith("Mis iconos / ") && activeBuiltInIcons.length > iconResultLimit ? (
                  <p className="mt-3 text-xs text-slate-500">
                    Mostrando {iconResultLimit} de {activeBuiltInIcons.length}. Usa la busqueda para encontrar iconos especificos.
                  </p>
                ) : null}
              </section>
            {iconSet.startsWith("Mis iconos / ") && !activeCustomIcons.length ? (
              <div className="rounded-md border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500">
                Carga archivos SVG para llenar este paquete.
              </div>
            ) : null}
            {!activeBuiltInIcons.length && !activeCustomIcons.length ? (
              <div className="rounded-md border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500">
                No hay iconos para ese filtro.
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {tab === "library" ? (
        <div className="space-y-5">
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Assets</h3>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*,.svg"
              className="hidden"
              onChange={(event) => loadImageAsset(event.target.files?.[0])}
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
      ) : null}
        </>
      )}
    </aside>
  );
}
