import type { ShapeFillGradient, WireShape } from "@/entities/wireframe/wireframe.types";

const defaultFrom = "#2563eb";
const defaultTo = "#93c5fd";
const defaultAngle = 135;

export function shapeAcceptsFillGradient(type: WireShape["type"]): boolean {
  return type !== "text";
}

export function normalizeFillGradient(gradient?: Partial<ShapeFillGradient> | null): ShapeFillGradient | undefined {
  if (!gradient) return undefined;
  const angle = Number(gradient.angle);
  return {
    enabled: gradient.enabled === true,
    from: typeof gradient.from === "string" && gradient.from.trim() ? gradient.from : defaultFrom,
    to: typeof gradient.to === "string" && gradient.to.trim() ? gradient.to : defaultTo,
    angle: Number.isFinite(angle) ? angle : defaultAngle,
  };
}

export function shapeUsesFillGradient(shape: Pick<WireShape, "type" | "style">): boolean {
  return shapeAcceptsFillGradient(shape.type) && shape.style.fillGradient?.enabled === true;
}

export function linearGradientCss(gradient: ShapeFillGradient): string {
  return `linear-gradient(${gradient.angle}deg, ${gradient.from}, ${gradient.to})`;
}

/** Fondo CSS del relleno. La tipografía y los iconos sin degradado no reciben un fondo nuevo. */
export function shapeFillBackground(shape: Pick<WireShape, "type" | "style">): string {
  if (shape.type === "icon") {
    return shapeUsesFillGradient(shape) ? linearGradientCss(shape.style.fillGradient!) : "transparent";
  }
  if (!shapeUsesFillGradient(shape)) return shape.style.fill;
  return linearGradientCss(shape.style.fillGradient!);
}

export function svgGradientId(shapeId: string): string {
  const safe = shapeId.replace(/[^A-Za-z0-9_-]/g, "-");
  return `maketar-fill-${safe || "shape"}`;
}

/** Extremos en objectBoundingBox que coinciden con el ángulo visual de CSS linear-gradient. */
export function linearGradientSvgEndpoints(angle: number, width: number, height: number) {
  const safeWidth = width > 0 ? width : 1;
  const safeHeight = height > 0 ? height : 1;
  const rad = (angle * Math.PI) / 180;
  const dx = Math.sin(rad);
  const dy = -Math.cos(rad);
  const length = Math.abs(safeWidth * dx) + Math.abs(safeHeight * dy);
  const half = length / 2;
  const cx = safeWidth / 2;
  const cy = safeHeight / 2;
  const round = (value: number) => Math.round(value * 1e6) / 1e6;
  return {
    x1: round((cx - dx * half) / safeWidth),
    y1: round((cy - dy * half) / safeHeight),
    x2: round((cx + dx * half) / safeWidth),
    y2: round((cy + dy * half) / safeHeight),
  };
}
