import { createElement } from "react";
import {
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignHorizontalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
} from "lucide-react";

import type { FlowTextAlign, FlowTextVerticalAlign } from "@/entities/flow/flow.types";
import type { IconComponent } from "@/features/icons/icon-catalog";
import { cn } from "@/lib/utils";

export function FlowTextAlignmentControls({
  textAlign,
  textVerticalAlign,
  onTextAlignChange,
  onTextVerticalAlignChange,
}: {
  textAlign: FlowTextAlign;
  textVerticalAlign: FlowTextVerticalAlign;
  onTextAlignChange: (value: FlowTextAlign) => void;
  onTextVerticalAlignChange: (value: FlowTextVerticalAlign) => void;
}) {
  const horizontalOptions: Array<{ value: FlowTextAlign; label: string; icon: IconComponent }> = [
    { value: "left", label: "Alinear a la izquierda", icon: AlignHorizontalJustifyStart },
    { value: "center", label: "Centrar horizontalmente", icon: AlignHorizontalJustifyCenter },
    { value: "right", label: "Alinear a la derecha", icon: AlignHorizontalJustifyEnd },
  ];
  const verticalOptions: Array<{ value: FlowTextVerticalAlign; label: string; icon: IconComponent }> = [
    { value: "top", label: "Alinear arriba", icon: AlignVerticalJustifyStart },
    { value: "middle", label: "Centrar verticalmente", icon: AlignVerticalJustifyCenter },
    { value: "bottom", label: "Alinear abajo", icon: AlignVerticalJustifyEnd },
  ];

  return (
    <div className="space-y-3">
      <div>
        <p className="property-label mb-2">Alineacion horizontal</p>
        <div className="grid grid-cols-3 gap-1 rounded-md border border-slate-200 bg-slate-50 p-1">
          {horizontalOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              title={option.label}
              aria-label={option.label}
              aria-pressed={textAlign === option.value}
              className={cn("toolbar-button justify-center", textAlign === option.value && "is-active")}
              onClick={() => onTextAlignChange(option.value)}
            >
              {createElement(option.icon, { size: 16, strokeWidth: 1.8 })}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="property-label mb-2">Alineacion vertical</p>
        <div className="grid grid-cols-3 gap-1 rounded-md border border-slate-200 bg-slate-50 p-1">
          {verticalOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              title={option.label}
              aria-label={option.label}
              aria-pressed={textVerticalAlign === option.value}
              className={cn("toolbar-button justify-center", textVerticalAlign === option.value && "is-active")}
              onClick={() => onTextVerticalAlignChange(option.value)}
            >
              {createElement(option.icon, { size: 16, strokeWidth: 1.8 })}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
