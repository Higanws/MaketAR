export type DiagramMode = "wireframe" | "diagram";
export type StrokeStyle = "solid" | "dashed" | "dotted";
export type TextAlign = "left" | "center" | "right";
export type TemplateType = "dashboard" | "landing" | "mobile" | "form" | "architecture";

export type ShapeStyle = {
  fill: string;
  opacity: number;
  stroke: string;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  strokeOpacity: number;
  borderRadius: number;
  borderTopLeftRadius: number;
  borderTopRightRadius: number;
  borderBottomLeftRadius: number;
  borderBottomRightRadius: number;
  shadow: {
    x: number;
    y: number;
    blur: number;
    spread: number;
    color: string;
  };
  rotation: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  textColor: string;
  textAlign: TextAlign;
};

export type WireShape = {
  id: string;
  type:
    | "icon"
    | "rect"
    | "circle"
    | "text"
    | "button"
    | "input"
    | "card"
    | "table"
    | "navbar"
    | "modal"
    | "mobile"
    | "desktop"
    | "image"
    | "aws"
    | "azure"
    | "gcp"
    | "kubernetes"
    | "database"
    | "network"
    | "process"
    | "decision"
    | "uml"
    | "devops"
    | "mindmap"
    | "server"
    | "storage"
    | "api"
    | "org";
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  imageSrc?: string;
  iconName?: string;
  iconSet?: string;
  svgSrc?: string;
  locked: boolean;
  visible: boolean;
  layer: number;
  groupId?: string;
  style: ShapeStyle;
};

export type WirePage = {
  id: string;
  name: string;
  shapes: WireShape[];
};
