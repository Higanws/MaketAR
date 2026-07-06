import type { ShapeStyle, WireShape } from "@/stores/editor/editor-store";

export const defaultStyle: ShapeStyle = {
  fill: "#ffffff",
  opacity: 1,
  stroke: "#1f2937",
  strokeWidth: 1,
  strokeStyle: "solid",
  strokeOpacity: 1,
  borderRadius: 10,
  borderTopLeftRadius: 10,
  borderTopRightRadius: 10,
  borderBottomLeftRadius: 10,
  borderBottomRightRadius: 10,
  shadow: {
    x: 0,
    y: 10,
    blur: 22,
    spread: -12,
    color: "rgba(15, 23, 42, 0.35)",
  },
  rotation: 0,
  fontSize: 14,
  fontFamily: "Inter, Arial, sans-serif",
  fontWeight: 600,
  textColor: "#0f172a",
  textAlign: "center",
};

export const normalizeStyle = (style?: Partial<ShapeStyle>): ShapeStyle => ({
  ...defaultStyle,
  ...style,
  shadow: { ...defaultStyle.shadow, ...style?.shadow },
});

export const normalizeShape = (shape: WireShape): WireShape => ({
  ...shape,
  visible: shape.visible ?? true,
  style: normalizeStyle(shape.style),
});

export const makeShape = (type: WireShape["type"], name?: string): WireShape => {
  const id = `shape-${Date.now()}-${Math.round(Math.random() * 9999)}`;
  const baseByType: Record<string, Partial<WireShape>> = {
    rect: { width: 172, height: 108, text: "Rectangle" },
    icon: { width: 72, height: 72, text: "" },
    circle: { width: 120, height: 120, text: "Circle" },
    text: { width: 210, height: 52, text: "Editable text" },
    button: { width: 142, height: 44, text: "Continuar" },
    input: { width: 240, height: 48, text: "Email address" },
    card: { width: 220, height: 144, text: "Card title\nSupporting content" },
    table: { width: 340, height: 210, text: "Campo | Tipo | Estado\nUsuario | String | Activo\nEmail | String | Requerido\nRol | Enum | Opcional" },
    navbar: { width: 520, height: 64, text: "MaketAR | Inicio | Templates | Docs | Entrar" },
    modal: { width: 320, height: 210, text: "Modal title" },
    mobile: { width: 220, height: 430, text: "Mobile screen" },
    desktop: { width: 520, height: 330, text: "Desktop screen" },
    decision: { width: 150, height: 110, text: "Decision?" },
  };

  return {
    id,
    type,
    name: name ?? type,
    x: 84 + Math.round(Math.random() * 120),
    y: 96 + Math.round(Math.random() * 120),
    width: baseByType[type]?.width ?? 170,
    height: baseByType[type]?.height ?? 96,
    text: baseByType[type]?.text ?? name ?? type,
    iconName: type === "icon" ? name : undefined,
    iconSet: type === "icon" ? "Lucide" : undefined,
    locked: false,
    visible: true,
    layer: Date.now(),
    style: normalizeStyle({
      fill: type === "text" ? "transparent" : "#ffffff",
      stroke: type === "text" ? "transparent" : "#334155",
      textColor: type === "button" ? "#ffffff" : "#0f172a",
      borderRadius: type === "circle" ? 999 : defaultStyle.borderRadius,
    }),
  };
};
