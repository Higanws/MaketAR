import {
  AlignHorizontalDistributeCenter,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignHorizontalJustifyStart,
  AlignVerticalDistributeCenter,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
} from "lucide-react";

import type { IconComponent } from "@/features/icons/icon-catalog";
import { useEditorStore } from "@/stores/editor";

export function ShapeAlignmentToolbar() {
  const alignSelected = useEditorStore((state) => state.alignSelected);
  const selectedIds = useEditorStore((state) => state.selectedIds);
  const alignmentActions: Array<{
    direction: Parameters<typeof alignSelected>[0];
    label: string;
    icon: IconComponent;
    disabled?: boolean;
  }> = [
    { direction: "left", label: "Alinear a la izquierda", icon: AlignHorizontalJustifyStart },
    { direction: "center", label: "Alinear al centro horizontal", icon: AlignHorizontalJustifyCenter },
    { direction: "right", label: "Alinear a la derecha", icon: AlignHorizontalJustifyEnd },
    { direction: "top", label: "Alinear arriba", icon: AlignVerticalJustifyStart },
    { direction: "middle", label: "Alinear al centro vertical", icon: AlignVerticalJustifyCenter },
    { direction: "bottom", label: "Alinear abajo", icon: AlignVerticalJustifyEnd },
    { direction: "distribute-horizontal", label: "Distribuir horizontalmente", icon: AlignHorizontalDistributeCenter, disabled: selectedIds.length < 3 },
    { direction: "distribute-vertical", label: "Distribuir verticalmente", icon: AlignVerticalDistributeCenter, disabled: selectedIds.length < 3 },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {alignmentActions.map(({ direction, label, icon: Icon, disabled }) => (
        <button
          key={direction}
          className="toolbar-button border border-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
          title={label}
          aria-label={label}
          disabled={disabled}
          onClick={() => alignSelected(direction)}
        >
          <Icon size={15} />
        </button>
      ))}
    </div>
  );
}
