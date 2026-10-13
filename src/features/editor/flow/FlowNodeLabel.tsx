import type { CSSProperties } from "react";

export function FlowNodeLabel({
  id,
  label,
  className,
  style,
  onChange,
}: {
  id: string;
  label: string;
  className?: string;
  style?: CSSProperties;
  onChange?: (id: string, label: string) => void;
}) {
  return (
    <textarea
      className={className}
      style={style}
      rows={1}
      value={label}
      onChange={(event) => onChange?.(id, event.target.value)}
      onPointerDown={(event) => event.stopPropagation()}
    />
  );
}
