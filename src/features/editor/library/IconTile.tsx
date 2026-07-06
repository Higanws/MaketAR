import { createElement } from "react";

import { iconTileButtonClass } from "@/features/editor/library/library-constants";
import { libraryDragProps, type LibraryDragPayload } from "@/features/editor/library/drag-drop";
import type { IconComponent } from "@/features/icons/icon-catalog";

export function IconTile({
  label,
  title,
  icon,
  svgSrc,
  dragPayload,
  onClick,
}: {
  label: string;
  title: string;
  icon?: IconComponent;
  svgSrc?: string;
  dragPayload?: LibraryDragPayload;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={dragPayload ? `${title} · Arrastra al lienzo o haz click` : title}
      aria-label={title}
      {...(dragPayload ? libraryDragProps(dragPayload) : {})}
      className={dragPayload ? iconTileButtonClass : "group grid size-10 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"}
      onClick={onClick}
    >
      {svgSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={svgSrc} alt="" className="size-7 object-contain" />
      ) : icon ? (
        createElement(icon, { size: 24, strokeWidth: 1.35 })
      ) : null}
      <span className="sr-only">{label}</span>
    </button>
  );
}
