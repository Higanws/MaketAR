import type { LibraryDragPayload } from "@/features/editor/library/drag-drop";
import { IconTile } from "@/features/editor/library/IconTile";
import { iconResultLimit, type CustomIcon, type IconCatalogItem } from "@/features/icons/icon-catalog";

export function IconBrowser({
  iconSet,
  activeBuiltInIcons,
  visibleBuiltInIcons,
  activeCustomIcons,
  onCustomIcon,
  onBuiltInIcon,
  customDragPayload,
  builtInDragPayload,
}: {
  iconSet: string;
  activeBuiltInIcons: IconCatalogItem[];
  visibleBuiltInIcons: IconCatalogItem[];
  activeCustomIcons: CustomIcon[];
  onCustomIcon: (icon: CustomIcon) => void;
  onBuiltInIcon: (icon: IconCatalogItem) => void;
  customDragPayload: (icon: CustomIcon) => LibraryDragPayload;
  builtInDragPayload: (icon: IconCatalogItem) => LibraryDragPayload;
}) {
  const isCustom = iconSet.startsWith("Mis iconos / ");

  return (
    <div className="space-y-5">
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{iconSet}</h3>
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
            {isCustom ? activeCustomIcons.length : activeBuiltInIcons.length}
          </span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {isCustom
            ? activeCustomIcons.map((item) => (
                <IconTile
                  key={item.id}
                  label={item.name}
                  title={`${item.name} · ${item.packageName}`}
                  svgSrc={item.svgSrc}
                  dragPayload={customDragPayload(item)}
                  onClick={() => onCustomIcon(item)}
                />
              ))
            : visibleBuiltInIcons.map((item) => (
                <IconTile
                  key={`${item.set}-${item.name}`}
                  label={item.label}
                  title={`${item.label} · ${item.set}`}
                  svgSrc={item.svgSrc}
                  icon={item.icon}
                  dragPayload={builtInDragPayload(item)}
                  onClick={() => onBuiltInIcon(item)}
                />
              ))}
        </div>
        {!isCustom && activeBuiltInIcons.length > iconResultLimit ? (
          <p className="mt-3 text-xs text-slate-500">
            Mostrando {iconResultLimit} de {activeBuiltInIcons.length}. Usa la busqueda para encontrar iconos especificos.
          </p>
        ) : null}
      </section>
      {isCustom && !activeCustomIcons.length ? (
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
  );
}
