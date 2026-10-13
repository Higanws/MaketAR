import { createElement } from "react";

import { parseTableText } from "@/entities/wireframe/table";
import type { WireShape } from "@/entities/wireframe/wireframe.types";
import { iconLookup } from "@/features/icons/icon-catalog";
import { cn } from "@/lib/utils";

export function TableShapeContent({ shape }: { shape: WireShape }) {
  const rows = parseTableText(shape.text);

  return (
    <div className="grid size-full overflow-hidden rounded-[inherit] text-left" style={{ gridTemplateRows: `repeat(${rows.length}, minmax(0, 1fr))` }}>
      {rows.map((row, rowIndex) => (
        <div
          key={`${shape.id}-row-${rowIndex}`}
          className={cn("grid min-h-0", rowIndex === 0 && "bg-slate-100 font-bold")}
          style={{ gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))` }}
        >
          {row.map((cell, cellIndex) => (
            <div
              key={`${shape.id}-cell-${rowIndex}-${cellIndex}`}
              className="flex min-w-0 items-center border-r border-t border-slate-200 px-2 text-xs last:border-r-0"
            >
              <span className="truncate">{cell || " "}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function ButtonShapeContent({ shape }: { shape: WireShape }) {
  return (
    <div className="grid size-full place-items-center rounded-[inherit] bg-current/0 px-4">
      <span className="truncate text-sm font-semibold">{shape.text || "Boton"}</span>
    </div>
  );
}

export function InputShapeContent({ shape }: { shape: WireShape }) {
  return (
    <div className="flex size-full items-center rounded-[inherit] bg-white px-3 text-left">
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-500">{shape.text || "Placeholder"}</span>
      <span className="ml-2 h-5 w-px bg-slate-300" />
    </div>
  );
}

export function NavbarShapeContent({ shape }: { shape: WireShape }) {
  const parts = shape.text.split("|").map((part) => part.trim()).filter(Boolean);
  const brand = parts[0] || "MaketAR";
  const navItems = parts.slice(1);

  return (
    <div className="flex size-full items-center gap-3 rounded-[inherit] px-4 text-left">
      <div className="min-w-0 flex-1 truncate text-sm font-bold">{brand}</div>
      <div className="flex shrink-0 items-center gap-2">
        {navItems.map((item) => (
          <span
            key={`${shape.id}-${item}`}
            className="max-w-24 truncate rounded border border-slate-200 bg-white/70 px-2.5 py-1 text-xs font-semibold text-slate-600"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function MediaShapeContent({ shape }: { shape: WireShape }) {
  const Icon = shape.iconName && shape.iconSet ? iconLookup.get(`${shape.iconSet}:${shape.iconName}`) : null;

  if (shape.type === "icon" && shape.svgSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={shape.svgSrc} alt={shape.name} className="size-full object-contain" />
    );
  }
  if (shape.type === "image" && shape.imageSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={shape.imageSrc} alt={shape.name} className="size-full object-cover" />
    );
  }
  if (shape.svgSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={shape.svgSrc} alt={shape.name} className="size-full object-contain p-2" />
    );
  }
  if (Icon) {
    return createElement(Icon, { size: Math.min(shape.width, shape.height) * 0.78, strokeWidth: 1.45 });
  }
  return <span className="w-full">{shape.text}</span>;
}
